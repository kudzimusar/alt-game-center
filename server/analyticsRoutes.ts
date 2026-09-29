import { Router } from "express";
import { db } from "./db";
import { analyticsEvents, users, gameSessions } from "@shared/schema";
import { eq, desc, count, sql, and, gte, lte, isNotNull, ne } from "drizzle-orm";
import { optionalAuth, requireAuth, requireAdmin } from "./auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();
const googleAiKey = process.env.GOOGLE_AI_API_KEY;
const genAI = googleAiKey ? new GoogleGenerativeAI(googleAiKey) : null;

async function callAI(prompt: string): Promise<string> {
  const kimiKey = process.env.KIMI_API_KEY;
  if (kimiKey) {
    try {
      const res = await fetch("https://api.moonshot.cn/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${kimiKey}` },
        body: JSON.stringify({
          model: "moonshot-v1-8k",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 1500,
        }),
        signal: AbortSignal.timeout(30_000),
      });
      if (res.ok) {
        const data = (await res.json()) as any;
        const text = data.choices?.[0]?.message?.content || "";
        if (text) return text;
      }
    } catch {}
  }
  try {
    if (!genAI) throw new Error("GOOGLE_AI_API_KEY is not configured");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch {
    return "AI insights unavailable. Please configure KIMI_API_KEY or ensure Google AI is accessible.";
  }
}

// ── Record an event (public endpoint with optional auth) ──────────────────────
router.post("/event", optionalAuth, async (req, res) => {
  try {
    const { eventType, sessionId, pagePath, gameType, durationSeconds, metadata } = req.body;
    if (!eventType) return res.status(400).json({ error: "eventType required" });

    const user = (req as any).user;
    await db.insert(analyticsEvents).values({
      userId: user?.id || null,
      sessionId: sessionId || null,
      eventType,
      pagePath: pagePath || null,
      gameType: gameType || null,
      durationSeconds: durationSeconds || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });

    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin-only analytics summary ──────────────────────────────────────────────
router.get("/summary", requireAuth, requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // ── Core user counts ──────────────────────────────────────────────────────
    const [totalUsersRow] = await db.select({ count: count() }).from(users);
    const [activeSubsRow] = await db.select({ count: count() }).from(users)
      .where(eq(users.subscriptionStatus, "active"));

    // Daily Active Users (unique sessions today)
    const dauRows = await db.selectDistinct({ sessionId: analyticsEvents.sessionId })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, todayStart));
    const dau = dauRows.length;

    // Weekly Active Users
    const wauRows = await db.selectDistinct({ sessionId: analyticsEvents.sessionId })
      .from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, weekStart));
    const wau = wauRows.length;

    // ── Page views ────────────────────────────────────────────────────────────
    const [pageViewsTodayRow] = await db.select({ count: count() }).from(analyticsEvents)
      .where(and(eq(analyticsEvents.eventType, "page_view"), gte(analyticsEvents.createdAt, todayStart)));
    const [pageViewsWeekRow] = await db.select({ count: count() }).from(analyticsEvents)
      .where(and(eq(analyticsEvents.eventType, "page_view"), gte(analyticsEvents.createdAt, weekStart)));
    const [pageViewsTotalRow] = await db.select({ count: count() }).from(analyticsEvents)
      .where(eq(analyticsEvents.eventType, "page_view"));

    // ── Avg time on page ─────────────────────────────────────────────────────
    const [avgTimeRow] = await db.select({
      avg: sql<number>`ROUND(AVG(duration_seconds))`,
    }).from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.eventType, "page_exit"),
        isNotNull(analyticsEvents.durationSeconds),
        gte(analyticsEvents.durationSeconds, 1),
      ));

    // ── Games popularity ──────────────────────────────────────────────────────
    const gameStartRows = await db.select({
      gameType: analyticsEvents.gameType,
      count: count(),
    }).from(analyticsEvents)
      .where(and(eq(analyticsEvents.eventType, "game_start"), isNotNull(analyticsEvents.gameType)))
      .groupBy(analyticsEvents.gameType)
      .orderBy(desc(count()));

    // Games from session table as supplement
    const sessionGameRows = await db.select({
      gameType: gameSessions.gameType,
      count: count(),
    }).from(gameSessions)
      .groupBy(gameSessions.gameType)
      .orderBy(desc(count()));

    // Merge both sources
    const gameMap: Record<string, number> = {};
    for (const r of sessionGameRows) gameMap[r.gameType] = (gameMap[r.gameType] || 0) + Number(r.count);
    for (const r of gameStartRows) if (r.gameType) gameMap[r.gameType] = (gameMap[r.gameType] || 0) + Number(r.count);
    const gamePopularity = Object.entries(gameMap)
      .map(([gameType, plays]) => ({ gameType, plays }))
      .sort((a, b) => b.plays - a.plays);

    // ── Page popularity ───────────────────────────────────────────────────────
    const pageRows = await db.select({
      pagePath: analyticsEvents.pagePath,
      views: count(),
    }).from(analyticsEvents)
      .where(and(eq(analyticsEvents.eventType, "page_view"), isNotNull(analyticsEvents.pagePath)))
      .groupBy(analyticsEvents.pagePath)
      .orderBy(desc(count()))
      .limit(20);

    // ── Avg time per page ─────────────────────────────────────────────────────
    const timePerPageRows = await db.select({
      pagePath: analyticsEvents.pagePath,
      avgSeconds: sql<number>`ROUND(AVG(duration_seconds))`,
      count: count(),
    }).from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.eventType, "page_exit"),
        isNotNull(analyticsEvents.pagePath),
        isNotNull(analyticsEvents.durationSeconds),
        gte(analyticsEvents.durationSeconds, 1),
      ))
      .groupBy(analyticsEvents.pagePath)
      .orderBy(desc(sql`AVG(duration_seconds)`))
      .limit(15);

    // ── Games played today ────────────────────────────────────────────────────
    const [gamesTodayRow] = await db.select({ count: count() }).from(analyticsEvents)
      .where(and(eq(analyticsEvents.eventType, "game_start"), gte(analyticsEvents.createdAt, todayStart)));
    const [gamesWeekRow] = await db.select({ count: count() }).from(analyticsEvents)
      .where(and(eq(analyticsEvents.eventType, "game_start"), gte(analyticsEvents.createdAt, weekStart)));

    // ── New users this week ───────────────────────────────────────────────────
    const [newUsersWeekRow] = await db.select({ count: count() }).from(users)
      .where(gte(users.createdAt, weekStart));
    const [newUsersMonthRow] = await db.select({ count: count() }).from(users)
      .where(gte(users.createdAt, monthStart));

    // ── Recent events feed ────────────────────────────────────────────────────
    const recentEvents = await db.select({
      id: analyticsEvents.id,
      eventType: analyticsEvents.eventType,
      pagePath: analyticsEvents.pagePath,
      gameType: analyticsEvents.gameType,
      durationSeconds: analyticsEvents.durationSeconds,
      createdAt: analyticsEvents.createdAt,
      userId: analyticsEvents.userId,
    }).from(analyticsEvents)
      .orderBy(desc(analyticsEvents.createdAt))
      .limit(50);

    // ── Event type breakdown ──────────────────────────────────────────────────
    const eventTypeRows = await db.select({
      eventType: analyticsEvents.eventType,
      count: count(),
    }).from(analyticsEvents)
      .groupBy(analyticsEvents.eventType)
      .orderBy(desc(count()));

    // ── Daily event trend (last 14 days) ─────────────────────────────────────
    const trendRows = await db.select({
      day: sql<string>`DATE(created_at)`,
      count: count(),
    }).from(analyticsEvents)
      .where(gte(analyticsEvents.createdAt, new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)))
      .groupBy(sql`DATE(created_at)`)
      .orderBy(sql`DATE(created_at)`);

    res.json({
      overview: {
        totalUsers: Number(totalUsersRow.count),
        activeSubscriptions: Number(activeSubsRow.count),
        dau,
        wau,
        pageViewsToday: Number(pageViewsTodayRow.count),
        pageViewsWeek: Number(pageViewsWeekRow.count),
        pageViewsTotal: Number(pageViewsTotalRow.count),
        avgTimeOnPageSeconds: Number(avgTimeRow?.avg || 0),
        gamesToday: Number(gamesTodayRow.count),
        gamesThisWeek: Number(gamesWeekRow.count),
        newUsersThisWeek: Number(newUsersWeekRow.count),
        newUsersThisMonth: Number(newUsersMonthRow.count),
      },
      gamePopularity,
      pagePopularity: pageRows,
      timePerPage: timePerPageRows,
      recentEvents,
      eventTypeBreakdown: eventTypeRows,
      trend: trendRows,
    });
  } catch (err: any) {
    console.error("Analytics summary error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── AI Insights endpoint ──────────────────────────────────────────────────────
router.post("/insights", requireAuth, requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalUsersRow] = await db.select({ count: count() }).from(users);
    const [activeSubsRow] = await db.select({ count: count() }).from(users)
      .where(eq(users.subscriptionStatus, "active"));
    const [gamesTodayRow] = await db.select({ count: count() }).from(analyticsEvents)
      .where(and(eq(analyticsEvents.eventType, "game_start"), gte(analyticsEvents.createdAt, todayStart)));
    const [gamesWeekRow] = await db.select({ count: count() }).from(analyticsEvents)
      .where(and(eq(analyticsEvents.eventType, "game_start"), gte(analyticsEvents.createdAt, weekStart)));

    const gameRows = await db.select({
      gameType: analyticsEvents.gameType,
      count: count(),
    }).from(analyticsEvents)
      .where(and(eq(analyticsEvents.eventType, "game_start"), isNotNull(analyticsEvents.gameType)))
      .groupBy(analyticsEvents.gameType)
      .orderBy(desc(count()))
      .limit(10);

    const sessionGameRows = await db.select({
      gameType: gameSessions.gameType,
      count: count(),
    }).from(gameSessions).groupBy(gameSessions.gameType).orderBy(desc(count())).limit(10);

    const gameMap: Record<string, number> = {};
    for (const r of sessionGameRows) gameMap[r.gameType] = (gameMap[r.gameType] || 0) + Number(r.count);
    for (const r of gameRows) if (r.gameType) gameMap[r.gameType] = (gameMap[r.gameType] || 0) + Number(r.count);
    const sorted = Object.entries(gameMap).sort((a, b) => b[1] - a[1]);
    const topGame = sorted[0];
    const bottomGame = sorted[sorted.length - 1];

    const [avgTimeRow] = await db.select({
      avg: sql<number>`ROUND(AVG(duration_seconds))`,
    }).from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.eventType, "page_exit"),
        isNotNull(analyticsEvents.durationSeconds),
        gte(analyticsEvents.durationSeconds, 1),
      ));

    const [newUsersWeekRow] = await db.select({ count: count() }).from(users)
      .where(gte(users.createdAt, weekStart));

    const totalUsers = Number(totalUsersRow.count);
    const activeSubs = Number(activeSubsRow.count);
    const conversionRate = totalUsers > 0 ? Math.round((activeSubs / totalUsers) * 100) : 0;
    const avgTime = Number(avgTimeRow?.avg || 0);

    const GAME_NAMES: Record<string, string> = {
      "flash-cards": "Flash Card Race", "karuta": "Picture Karuta", "class-battle": "Class Battle",
      "interview-bingo": "Interview Bingo", "listening-bingo": "Listening Bingo",
      "spelling-bee": "Spelling Bee", "sentence-builder": "Sentence Builder",
      "grammar-golf": "Grammar Golf", "role-play": "Role Play",
      "translation-dash": "Translation Dash", "mystery-box": "Mystery Box",
      "shiritori": "Shiritori", "word-hunt": "Word Hunt", "jeopardy": "Jeopardy",
      "3-hint": "3-Hint Quiz", "quiz-show": "Quiz Show", "class-quiz": "Class Quiz",
      "small-talk": "Small Talk", "bongo-bingo": "Bongo Bingo",
    };

    const gamesListStr = sorted.map(([g, c]) => `  - ${GAME_NAMES[g] || g}: ${c} plays`).join("\n") || "  No game data yet";

    const prompt = `You are an expert educational platform analyst for ALT Game Center, an interactive English teaching platform used in Japanese junior high school (JHS) classrooms by ALTs (Assistant Language Teachers) and JTEs (Japanese Teachers of English). Students are aged 12-15 (中1-中3).

Here is the current platform analytics data:

PLATFORM OVERVIEW:
- Total registered users: ${totalUsers}
- Active subscribers: ${activeSubs} (${conversionRate}% conversion rate)
- New users this week: ${Number(newUsersWeekRow.count)}
- Games played today: ${Number(gamesTodayRow.count)}
- Games played this week: ${Number(gamesWeekRow.count)}
- Average time spent per page: ${avgTime} seconds

GAME POPULARITY (most to least played):
${gamesListStr}

${topGame ? `Most popular game: ${GAME_NAMES[topGame[0]] || topGame[0]} (${topGame[1]} plays)` : ""}
${bottomGame && bottomGame[0] !== topGame?.[0] ? `Least popular game: ${GAME_NAMES[bottomGame[0]] || bottomGame[0]} (${bottomGame[1]} plays)` : ""}

Please provide 5-7 specific, actionable insights for the platform administrator. Focus on:
1. What the data tells us about teaching effectiveness and user engagement
2. Which games are working well and why educators choose them
3. Where users drop off or engage less, and what could be improved
4. Growth opportunities for schools and educational institutions
5. Specific recommendations to increase subscription conversions
6. Content or feature gaps visible in the data
7. Any patterns suggesting curriculum alignment opportunities

Format your response as bullet points with clear section labels. Be specific and data-driven. Avoid vague suggestions. Context: this platform targets Japanese JHS English education with MEXT curriculum alignment.`;

    const insights = await callAI(prompt);
    res.json({ insights, generatedAt: new Date().toISOString() });
  } catch (err: any) {
    console.error("AI insights error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
