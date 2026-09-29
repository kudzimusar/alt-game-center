import { db } from "./db";
import { users, newsletterCampaigns, newsletterSubscribers, analyticsEvents, gameSessions } from "@shared/schema";
import { and, count, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import { sendEmail, buildNewsletterEmail } from "./emailService";
import crypto from "crypto";

const APP_URL = process.env.APP_URL || "https://alt-game-center.online";

function genUnsubToken() {
  return crypto.randomBytes(24).toString("hex");
}

function getTopGameName(gameType: string) {
  const map: Record<string, string> = {
    "flash-card-race": "Flash Card Race",
    "flash-cards": "Flash Card Race",
    "picture-karuta": "Picture Karuta",
    karuta: "Picture Karuta",
    "class-battle": "Class Battle",
    "interview-bingo": "Interview Bingo",
    "listening-bingo": "Listening Bingo",
    "spelling-bee": "Spelling Bee",
    "sentence-builder": "Sentence Builder",
    "grammar-golf": "Grammar Golf",
    "role-play": "Role Play",
    "translation-dash": "Translation Dash",
    "mystery-box": "Mystery Box",
    shiritori: "Shiritori",
    "word-hunt": "Word Hunt",
    jeopardy: "Jeopardy",
    "3-hint": "3-Hint Quiz",
    "quiz-show": "Quiz Show",
    "class-quiz": "Class Quiz",
    "small-talk": "Small Talk",
    "bongo-bingo": "Bongo Bingo",
  };
  return map[gameType] || gameType;
}

async function generateWeeklyContent(): Promise<{ subject: string; previewText: string; htmlContent: string }> {
  const kimiKey = process.env.KIMI_API_KEY;
  const now = new Date();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [totalUsersRow] = await db.select({ count: count() }).from(users);
  const [activeSubsRow] = await db.select({ count: count() }).from(newsletterSubscribers).where(eq(newsletterSubscribers.status, "active"));
  const [gamesWeekRow] = await db.select({ count: count() }).from(analyticsEvents).where(and(eq(analyticsEvents.eventType, "game_start"), gte(analyticsEvents.createdAt, weekStart)));
  const [pageViewsRow] = await db.select({ count: count() }).from(analyticsEvents).where(and(eq(analyticsEvents.eventType, "page_view"), gte(analyticsEvents.createdAt, weekStart)));
  const [avgTimeRow] = await db.select({ avg: sql<number>`ROUND(AVG(duration_seconds))` }).from(analyticsEvents).where(and(eq(analyticsEvents.eventType, "page_exit"), isNotNull(analyticsEvents.durationSeconds), gte(analyticsEvents.createdAt, weekStart)));

  const topGames = await db.select({ gameType: analyticsEvents.gameType, plays: count() })
    .from(analyticsEvents)
    .where(and(eq(analyticsEvents.eventType, "game_start"), isNotNull(analyticsEvents.gameType), gte(analyticsEvents.createdAt, weekStart)))
    .groupBy(analyticsEvents.gameType)
    .orderBy(desc(count()))
    .limit(5);

  const topGameSessions = await db.select({ gameType: gameSessions.gameType, plays: count() })
    .from(gameSessions)
    .where(gte(gameSessions.startedAt, weekStart))
    .groupBy(gameSessions.gameType)
    .orderBy(desc(count()))
    .limit(5);

  const gameMap: Record<string, number> = {};
  for (const g of topGameSessions) gameMap[g.gameType] = (gameMap[g.gameType] || 0) + Number(g.plays);
  for (const g of topGames) if (g.gameType) gameMap[g.gameType] = (gameMap[g.gameType] || 0) + Number(g.plays);
  const topList = Object.entries(gameMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topGame = topList[0]?.[0] || "flash-card-race";

  const prompt = `Write a weekly newsletter for ALT Game Center, a classroom English teaching platform for Japanese junior high school teachers.
Use a friendly, professional tone.

Stats:
- Total users: ${Number(totalUsersRow.count)}
- Active subscribers: ${Number(activeSubsRow.count)}
- Games played this week: ${Number(gamesWeekRow.count)}
- Page views this week: ${Number(pageViewsRow.count)}
- Avg time on page: ${Number(avgTimeRow?.avg || 0)} seconds
- Top game: ${getTopGameName(topGame)}

Return plain text in this format:
Subject: ...
Preview: ...
HTML: ...

The HTML should be simple, mobile-friendly, and include:
1. Why to visit this week
2. A teaching tip
3. A button link to ${APP_URL}/games`;

  let aiText = "";
  if (kimiKey) {
    try {
      const response = await fetch("https://api.moonshot.cn/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${kimiKey}`,
        },
        body: JSON.stringify({
          model: "moonshot-v1-8k",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 1200,
        }),
        signal: AbortSignal.timeout(30_000),
      });
      if (response.ok) {
        const data = (await response.json()) as any;
        aiText = data.choices?.[0]?.message?.content || "";
      }
    } catch {
      aiText = "";
    }
  }

  const subject = aiText.match(/Subject:\s*(.+)/i)?.[1]?.trim() || `ALT Game Center Weekly: ${getTopGameName(topGame)}`;
  const previewText = aiText.match(/Preview:\s*(.+)/i)?.[1]?.trim() || "Fresh ideas, top games, and a quick classroom tip.";
  const htmlMatch = aiText.match(/HTML:\s*([\s\S]+)/i);
  const htmlContent = htmlMatch?.[1]?.trim() || `
    <h2 style="margin:0 0 12px;color:#f8fafc;">This Week at ALT Game Center</h2>
    <p style="margin:0 0 16px;color:#cbd5e1;line-height:1.7;">${getTopGameName(topGame)} is getting attention this week. It is a simple way to boost student engagement and English output.</p>
    <h3 style="margin:0 0 10px;color:#f8fafc;">Teaching Tip</h3>
    <p style="margin:0 0 18px;color:#cbd5e1;line-height:1.7;">Try using one game as a warm-up before your main lesson to get faster participation.</p>
    <p style="margin:24px 0 0; text-align:center;"><a href="${APP_URL}/games" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:700;">Open Games</a></p>
  `;

  return { subject, previewText, htmlContent };
}

export async function sendWeeklyNewsletter() {
  const activeSubs = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.status, "active"));
  if (activeSubs.length === 0) return { sent: 0, failed: 0, reason: "no_subscribers" };

  const generated = await generateWeeklyContent();
  const [campaign] = await db.insert(newsletterCampaigns).values({
    subject: generated.subject,
    previewText: generated.previewText,
    htmlContent: generated.htmlContent,
    status: "sent",
    recipientCount: activeSubs.length,
    sentAt: new Date(),
  }).returning();

  let sent = 0;
  let failed = 0;

  for (const sub of activeSubs) {
    const result = await sendEmail({
      to: sub.email,
      subject: generated.subject,
      html: buildNewsletterEmail(generated.subject, generated.htmlContent, APP_URL, sub.unsubToken),
    });
    if (result.ok) sent++;
    else failed++;
  }

  await db.update(newsletterCampaigns).set({ recipientCount: sent }).where(eq(newsletterCampaigns.id, campaign.id));
  return { sent, failed, campaignId: campaign.id, subject: generated.subject };
}

export async function ensureSubscriberForEmail(email: string, name?: string, userId?: string | null) {
  const existing = await db.select({ id: newsletterSubscribers.id }).from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email));
  if (existing.length > 0) return existing[0].id;
  const [sub] = await db.insert(newsletterSubscribers).values({
    email,
    name: name || null,
    status: "active",
    source: "signup",
    userId: userId || null,
    unsubToken: genUnsubToken(),
  }).returning();
  return sub.id;
}
