import { Router } from "express";
import { requireAuth } from "./auth";
import {
  createRoom,
  getRoom,
  getRoster,
  getScoreboard,
  manualAwardPoints,
  broadcastToAll,
  broadcastToTeacher,
} from "./class-battle-rooms";
import {
  generateClassBattleQuestions,
  getFallbackQuestions,
} from "./kimiAI";
import { db } from "./db";
import { sql } from "drizzle-orm";
import QRCode from "qrcode";

const router = Router();

// ─── Generate questions via Kimi AI ──────────────────────────────────────────
router.post("/questions/generate", requireAuth, async (req, res) => {
  try {
    const { grade, topic, count = 10, questionType = "mixed" } = req.body;
    if (!grade || !topic) return res.status(400).json({ error: "grade and topic required" });

    let questions;
    const hasKimi = !!process.env.KIMI_API_KEY;

    if (hasKimi) {
      try {
        questions = await generateClassBattleQuestions({ grade, topic, count, questionType });
      } catch (err: any) {
        console.error("Kimi AI error, using fallback:", err.message);
        questions = getFallbackQuestions(grade, topic, count);
      }
    } else {
      questions = getFallbackQuestions(grade, topic, count);
    }

    res.json({ questions, aiGenerated: hasKimi });
  } catch (err: any) {
    console.error("Generate questions error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Create session ───────────────────────────────────────────────────────────
router.post("/sessions", requireAuth, async (req, res) => {
  try {
    const teacher = (req as any).user;
    const { grade, topic, mode = "individual", questions = [] } = req.body;

    if (!grade || !topic) return res.status(400).json({ error: "grade and topic required" });
    if (!questions.length) return res.status(400).json({ error: "At least one question required" });

    const room = createRoom({
      teacherId: teacher.id,
      grade,
      topic,
      mode,
      questions,
    });

    // Persist to DB
    await db.execute(sql`
      INSERT INTO live_sessions (id, code, teacher_id, grade, topic, mode, status, created_at)
      VALUES (${room.sessionId}, ${room.code}, ${teacher.id}, ${grade}, ${topic}, ${mode}, 'waiting', NOW())
    `);

    // Generate QR code for join URL
    const host = req.headers.host;
    const joinUrl = `https://${host}/class-battle/join?code=${room.code}`;
    const qr = await QRCode.toDataURL(joinUrl, {
      width: 300,
      margin: 2,
      color: { dark: "#1e293b", light: "#ffffff" },
    });

    res.json({
      sessionId: room.sessionId,
      code: room.code,
      joinUrl,
      qr,
      grade,
      topic,
      mode,
      questionCount: questions.length,
    });
  } catch (err: any) {
    console.error("Create session error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Get session info ─────────────────────────────────────────────────────────
router.get("/sessions/:code", async (req, res) => {
  const room = getRoom(req.params.code);
  if (!room) return res.status(404).json({ error: "Session not found" });

  res.json({
    sessionId: room.sessionId,
    code: room.code,
    grade: room.grade,
    topic: room.topic,
    mode: room.mode,
    status: room.status,
    participantCount: room.participants.size,
    questionCount: room.questions.length,
    currentQuestionIndex: room.currentQuestionIndex,
    rosterLocked: room.rosterLocked,
  });
});

// ─── Get roster ───────────────────────────────────────────────────────────────
router.get("/sessions/:code/roster", requireAuth, async (req, res) => {
  const room = getRoom(req.params.code);
  if (!room) return res.status(404).json({ error: "Session not found" });
  res.json({ roster: getRoster(room) });
});

// ─── Get scoreboard ───────────────────────────────────────────────────────────
router.get("/sessions/:code/scores", async (req, res) => {
  const room = getRoom(req.params.code);
  if (!room) return res.status(404).json({ error: "Session not found" });
  res.json(getScoreboard(room));
});

// ─── Manual point award ───────────────────────────────────────────────────────
router.post("/sessions/:code/award", requireAuth, async (req, res) => {
  const room = getRoom(req.params.code);
  if (!room) return res.status(404).json({ error: "Session not found" });

  const { participantId, delta } = req.body;
  manualAwardPoints(room, participantId, delta);

  const scoreboard = getScoreboard(room);
  broadcastToAll(room, { type: "scores-update", ...scoreboard });
  broadcastToTeacher(room, { type: "scores-update", ...scoreboard });

  res.json({ success: true, scores: scoreboard });
});

// ─── Get session history from DB ──────────────────────────────────────────────
router.get("/history", requireAuth, async (req, res) => {
  try {
    const teacher = (req as any).user;
    const rows = await db.execute(sql`
      SELECT id, code, grade, topic, mode, status, participant_count, created_at
      FROM live_sessions
      WHERE teacher_id = ${teacher.id}
      ORDER BY created_at DESC
      LIMIT 20
    `);
    res.json({ sessions: rows.rows });
  } catch {
    res.json({ sessions: [] });
  }
});

// ─── Kimi AI status ───────────────────────────────────────────────────────────
router.get("/ai-status", (_req, res) => {
  res.json({ kimiEnabled: !!process.env.KIMI_API_KEY });
});

export default router;
