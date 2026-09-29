import { Router } from "express";
import { db } from "./db";
import { newsletterSubscribers, newsletterCampaigns, users } from "@shared/schema";
import { eq, desc, count, ilike, or, and } from "drizzle-orm";
import { requireAuth, requireAdmin } from "./auth";
import { sendEmail, buildNewsletterEmail } from "./emailService";
import crypto from "crypto";
import { sendWeeklyNewsletter } from "./weeklyNewsletterService";

const router = Router();
const APP_URL = process.env.APP_URL || "https://altgamecenter.com";

function genUnsubToken(): string {
  return crypto.randomBytes(24).toString("hex");
}

router.post("/subscribe", async (req, res) => {
  try {
    const { email, name, source = "website" } = req.body;
    if (!email || !email.includes("@")) return res.status(400).json({ error: "Valid email required" });
    const normalized = email.toLowerCase().trim();
    const existing = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, normalized));
    if (existing.length > 0) {
      if (existing[0].status === "unsubscribed") {
        await db.update(newsletterSubscribers).set({ status: "active", unsubscribedAt: null }).where(eq(newsletterSubscribers.id, existing[0].id));
        return res.json({ ok: true, message: "You've been re-subscribed!" });
      }
      return res.json({ ok: true, message: "Already subscribed" });
    }
    await db.insert(newsletterSubscribers).values({ email: normalized, name: name || null, status: "active", source, unsubToken: genUnsubToken() });
    res.json({ ok: true, message: "Subscribed successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/unsubscribe", async (req, res) => {
  try {
    const { token, email } = req.body;
    if (!token && !email) return res.status(400).json({ error: "Token or email required" });
    const normalized = email ? email.toLowerCase().trim() : null;
    const query = token
      ? db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.unsubToken, token))
      : db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, normalized!));
    const [sub] = await query;
    if (!sub) return res.status(404).json({ error: "Subscriber not found" });
    await db.update(newsletterSubscribers).set({ status: "unsubscribed", unsubscribedAt: new Date() }).where(eq(newsletterSubscribers.id, sub.id));
    res.json({ ok: true, message: "Unsubscribed successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/subscribers", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, search, page = "1", limit = "50" } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;
    const conditions: any[] = [];
    if (status && status !== "all") conditions.push(eq(newsletterSubscribers.status, status));
    if (search) conditions.push(or(ilike(newsletterSubscribers.email, `%${search}%`), ilike(newsletterSubscribers.name, `%${search}%`)));
    const where = conditions.length ? and(...conditions) : undefined;
    const subs = await db.select().from(newsletterSubscribers).where(where).orderBy(desc(newsletterSubscribers.subscribedAt)).limit(limitNum).offset(offset);
    const [totalRow] = await db.select({ count: count() }).from(newsletterSubscribers).where(where);
    const [activeRow] = await db.select({ count: count() }).from(newsletterSubscribers).where(eq(newsletterSubscribers.status, "active"));
    const [unsubRow] = await db.select({ count: count() }).from(newsletterSubscribers).where(eq(newsletterSubscribers.status, "unsubscribed"));
    res.json({ subscribers: subs, total: Number(totalRow.count), activeCount: Number(activeRow.count), unsubscribedCount: Number(unsubRow.count), page: pageNum, pages: Math.ceil(Number(totalRow.count) / limitNum) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/subscribers", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { email, name, tags } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });
    const normalized = email.toLowerCase().trim();
    const existing = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, normalized));
    if (existing.length > 0) return res.status(409).json({ error: "Already subscribed" });
    const [sub] = await db.insert(newsletterSubscribers).values({ email: normalized, name: name || null, status: "active", source: "manual", tags: tags || null, unsubToken: genUnsubToken() }).returning();
    res.json({ ok: true, subscriber: sub });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/subscribers/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, name, tags } = req.body;
    const updates: Record<string, any> = {};
    if (status) updates.status = status;
    if (name !== undefined) updates.name = name;
    if (tags !== undefined) updates.tags = tags;
    if (status === "unsubscribed") updates.unsubscribedAt = new Date();
    if (status === "active") updates.unsubscribedAt = null;
    const [updated] = await db.update(newsletterSubscribers).set(updates).where(eq(newsletterSubscribers.id, req.params.id)).returning();
    res.json({ ok: true, subscriber: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/subscribers/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, req.params.id));
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/subscribers/import-users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const allUsers = await db.select({ id: users.id, email: users.email, name: users.name }).from(users);
    let added = 0;
    let skipped = 0;
    for (const u of allUsers) {
      const existing = await db.select({ id: newsletterSubscribers.id }).from(newsletterSubscribers).where(eq(newsletterSubscribers.email, u.email));
      if (existing.length > 0) {
        skipped++;
        continue;
      }
      await db.insert(newsletterSubscribers).values({ email: u.email, name: u.name, status: "active", source: "import", userId: u.id, unsubToken: genUnsubToken() });
      added++;
    }
    res.json({ ok: true, added, skipped, total: allUsers.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/campaigns", requireAuth, requireAdmin, async (req, res) => {
  try {
    const campaigns = await db.select().from(newsletterCampaigns).orderBy(desc(newsletterCampaigns.createdAt));
    res.json({ campaigns });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/campaigns", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { subject, previewText, htmlContent } = req.body;
    if (!subject || !htmlContent) return res.status(400).json({ error: "subject and htmlContent required" });
    const sender = (req as any).user;
    const [campaign] = await db.insert(newsletterCampaigns).values({ subject, previewText: previewText || null, htmlContent, status: "draft", sentBy: sender.id }).returning();
    res.json({ ok: true, campaign });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/campaigns/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { subject, previewText, htmlContent } = req.body;
    const [existing] = await db.select().from(newsletterCampaigns).where(eq(newsletterCampaigns.id, req.params.id));
    if (!existing) return res.status(404).json({ error: "Campaign not found" });
    if (existing.status === "sent") return res.status(400).json({ error: "Cannot edit a sent campaign" });
    const [updated] = await db.update(newsletterCampaigns).set({ subject: subject || existing.subject, previewText: previewText ?? existing.previewText, htmlContent: htmlContent || existing.htmlContent }).where(eq(newsletterCampaigns.id, req.params.id)).returning();
    res.json({ ok: true, campaign: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/campaigns/:id/send", requireAuth, requireAdmin, async (req, res) => {
  try {
    const [campaign] = await db.select().from(newsletterCampaigns).where(eq(newsletterCampaigns.id, req.params.id));
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    if (campaign.status === "sent") return res.status(400).json({ error: "Already sent" });
    const activeSubs = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.status, "active"));
    if (activeSubs.length === 0) return res.status(400).json({ error: "No active subscribers" });
    const BATCH_SIZE = 50;
    let sent = 0;
    let failed = 0;
    for (let i = 0; i < activeSubs.length; i += BATCH_SIZE) {
      const batch = activeSubs.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(sub => sendEmail({ to: sub.email, subject: campaign.subject, html: buildNewsletterEmail(campaign.subject, campaign.htmlContent, APP_URL, sub.unsubToken) }).then(r => { if (r.ok) sent++; else failed++; })));
      if (i + BATCH_SIZE < activeSubs.length) await new Promise(r => setTimeout(r, 500));
    }
    const [updated] = await db.update(newsletterCampaigns).set({ status: "sent", sentAt: new Date(), recipientCount: sent }).where(eq(newsletterCampaigns.id, campaign.id)).returning();
    res.json({ ok: true, campaign: updated, sent, failed, total: activeSubs.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/campaigns/:id/test", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { testEmail } = req.body;
    if (!testEmail) return res.status(400).json({ error: "testEmail required" });
    const [campaign] = await db.select().from(newsletterCampaigns).where(eq(newsletterCampaigns.id, req.params.id));
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    const result = await sendEmail({ to: testEmail, subject: `[TEST] ${campaign.subject}`, html: buildNewsletterEmail(campaign.subject, campaign.htmlContent, APP_URL, "test-token") });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/send-system", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { to, subject, html } = req.body;
    if (!to || !subject || !html) return res.status(400).json({ error: "to, subject, html required" });
    const result = await sendEmail({ to, subject, html });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/weekly/run", requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await sendWeeklyNewsletter();
    res.json({ ok: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
