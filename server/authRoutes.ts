import { Router } from "express";
import { db } from "./db";
import { users, newsletterSubscribers, registerSchema, loginSchema } from "@shared/schema";
import { eq, count } from "drizzle-orm";
import { hashPassword, verifyPassword, signToken, requireAuth } from "./auth";
import { sendEmail, buildWelcomeEmail } from "./emailService";
import crypto from "crypto";

const APP_URL = process.env.APP_URL || "https://altgamecenter.com";

function genUnsubToken() { return crypto.randomBytes(24).toString("hex"); }

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input", details: parsed.error.errors });
    }
    const { email, username, password, name, role, school } = parsed.data;

    const [existing] = await db.select().from(users).where(eq(users.email, email));
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const [existingUsername] = await db.select().from(users).where(eq(users.username, username));
    if (existingUsername) {
      return res.status(409).json({ error: "Username already taken" });
    }

    const hashed = await hashPassword(password);
    const [user] = await db.insert(users).values({
      email,
      username,
      password: hashed,
      name,
      role,
      school: school || null,
      subscriptionStatus: "inactive",
    }).returning();

    const token = signToken(user.id);
    const { password: _, ...safeUser } = user;

    // Fire-and-forget: welcome email + newsletter subscriber
    (async () => {
      try {
        await sendEmail({
          to: email,
          subject: "Welcome to ALT Game Center! 🎮",
          html: buildWelcomeEmail(name, email, APP_URL),
        });
      } catch (e) { console.warn("[Email] Welcome email failed:", e); }

      try {
        const existing = await db.select({ id: newsletterSubscribers.id })
          .from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email));
        if (existing.length === 0) {
          await db.insert(newsletterSubscribers).values({
            email,
            name,
            status: "active",
            source: "signup",
            userId: user.id,
            unsubToken: genUnsubToken(),
          });
        }
      } catch (e) { console.warn("[Newsletter] Auto-subscribe failed:", e); }
    })();

    res.json({ token, user: safeUser });
  } catch (err: any) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }
    const { email, password } = parsed.data;

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken(user.id);
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

router.post("/promote-admin", async (req, res) => {
  try {
    const { email, token } = req.body;
    const setupToken = process.env.ADMIN_SETUP_TOKEN;

    if (!setupToken) {
      return res.status(403).json({ error: "Admin setup token not configured. Set ADMIN_SETUP_TOKEN environment variable." });
    }
    if (token !== setupToken) {
      return res.status(403).json({ error: "Invalid setup token" });
    }

    const [existingAdmins] = await db.select({ count: count() }).from(users).where(eq(users.role, "admin"));
    const hasAdmins = Number(existingAdmins.count) > 0;

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return res.status(404).json({ error: "User not found. Register first, then promote." });
    }

    const [updated] = await db.update(users).set({
      role: "admin",
      subscriptionStatus: "active",
      subscriptionPlan: "district",
      updatedAt: new Date(),
    }).where(eq(users.id, user.id)).returning();

    const { password: _, ...safeUser } = updated;
    res.json({ success: true, user: safeUser, message: `${user.name} is now an admin with full access.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
