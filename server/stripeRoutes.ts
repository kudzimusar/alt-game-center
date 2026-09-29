import { Router } from "express";
import { getStripeClient } from "./stripeClient";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "./auth";
import QRCode from "qrcode";

const router = Router();

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    nameJa: "スターター",
    description: "Perfect for individual ALTs trying it out",
    price: 9,
    priceYearly: 89,
    currency: "usd",
    interval: "month",
    features: [
      "Access to 10 core games",
      "Up to 2 classes",
      "Basic classroom tools",
      "Email support",
    ],
    highlight: false,
    icon: "🌱",
  },
  {
    id: "pro",
    name: "Pro Teacher",
    nameJa: "プロ教師",
    description: "For ALTs and JTEs who want the full experience",
    price: 19,
    priceYearly: 179,
    currency: "usd",
    interval: "month",
    features: [
      "All 50+ games unlocked",
      "Unlimited classes",
      "AI-generated content",
      "Interview Bingo multiplayer",
      "Priority email support",
    ],
    highlight: true,
    icon: "⭐",
  },
  {
    id: "school",
    name: "School",
    nameJa: "学校プラン",
    description: "For schools with multiple teachers",
    price: 49,
    priceYearly: 469,
    currency: "usd",
    interval: "month",
    features: [
      "Everything in Pro",
      "Up to 10 teacher accounts",
      "Admin dashboard",
      "Custom branding",
      "Dedicated support",
    ],
    highlight: false,
    icon: "🏫",
  },
  {
    id: "district",
    name: "District",
    nameJa: "教育委員会",
    description: "For boards of education & large institutions",
    price: 149,
    priceYearly: 1399,
    currency: "usd",
    interval: "month",
    features: [
      "Everything in School",
      "Unlimited teacher accounts",
      "SSO / LMS integration",
      "Usage analytics",
      "SLA & phone support",
    ],
    highlight: false,
    icon: "🏛️",
  },
];

router.get("/plans", (_req, res) => {
  res.json({ plans: PLANS });
});

router.post("/create-checkout", requireAuth, async (req, res) => {
  try {
    const stripe = getStripeClient();
    const user = (req as any).user;
    const { planId, billing } = req.body;

    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id, role: user.role, school: user.school || "" },
      });
      await db.update(users).set({ stripeCustomerId: customer.id }).where(eq(users.id, user.id));
      customerId = customer.id;
    }

    const unitAmount = billing === "yearly"
      ? plan.priceYearly * 100
      : plan.price * 100;

    const host = req.headers.host;
    const protocol = process.env.NODE_ENV === "production" ? "https" : "https";
    const baseUrl = `${protocol}://${host}`;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: plan.currency,
            product_data: {
              name: `ALT Game Center — ${plan.name}`,
              description: plan.description,
              metadata: { planId: plan.id },
            },
            unit_amount: unitAmount,
            recurring: { interval: billing === "yearly" ? "year" : "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${baseUrl}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      metadata: { userId: user.id, planId: plan.id, billing: billing || "monthly" },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error("Checkout error:", err);
    res.status(500).json({ error: err.message || "Failed to create checkout session" });
  }
});

router.get("/checkout-qr", requireAuth, async (req, res) => {
  try {
    const { sessionUrl } = req.query;
    if (!sessionUrl || typeof sessionUrl !== "string") {
      return res.status(400).json({ error: "sessionUrl required" });
    }
    const qrDataUrl = await QRCode.toDataURL(sessionUrl, {
      width: 300,
      margin: 2,
      color: { dark: "#1e293b", light: "#ffffff" },
    });
    res.json({ qr: qrDataUrl });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

router.post("/webhook", async (req, res) => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return res.status(200).json({ received: true });

  const stripe = getStripeClient();
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: any;
  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
    } else {
      event = req.body;
    }
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;
      if (userId) {
        await db.update(users).set({
          subscriptionStatus: "active",
          subscriptionPlan: planId,
          stripeSubscriptionId: session.subscription,
        }).where(eq(users.id, userId));
      }
    }
    if (event.type === "customer.subscription.deleted" || event.type === "customer.subscription.paused") {
      const sub = event.data.object as any;
      const [found] = await db.select().from(users).where(eq(users.stripeSubscriptionId, sub.id));
      if (found) {
        await db.update(users).set({ subscriptionStatus: "inactive" }).where(eq(users.id, found.id));
      }
    }
    if (event.type === "customer.subscription.updated") {
      const sub = event.data.object as any;
      const [found] = await db.select().from(users).where(eq(users.stripeSubscriptionId, sub.id));
      if (found) {
        await db.update(users).set({
          subscriptionStatus: sub.status === "active" ? "active" : "inactive",
        }).where(eq(users.id, found.id));
      }
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
  }

  res.json({ received: true });
});

router.post("/verify-session", requireAuth, async (req, res) => {
  try {
    const stripe = getStripeClient();
    const { sessionId } = req.body;
    const user = (req as any).user;

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid" || session.status === "complete") {
      const planId = session.metadata?.planId;
      await db.update(users).set({
        subscriptionStatus: "active",
        subscriptionPlan: planId,
        stripeSubscriptionId: session.subscription as string,
      }).where(eq(users.id, user.id));

      const [updatedUser] = await db.select().from(users).where(eq(users.id, user.id));
      const { password: _, ...safeUser } = updatedUser;
      return res.json({ success: true, user: safeUser });
    }
    res.json({ success: false });
  } catch (err: any) {
    console.error("Verify session error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/portal", requireAuth, async (req, res) => {
  try {
    const stripe = getStripeClient();
    const user = (req as any).user;
    if (!user.stripeCustomerId) {
      return res.status(400).json({ error: "No billing account found" });
    }
    const host = req.headers.host;
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `https://${host}/dashboard`,
    });
    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export { PLANS };
export default router;
