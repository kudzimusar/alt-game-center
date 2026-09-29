import { randomBytes } from "crypto";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SessionStatus =
  | "waiting"
  | "roster_locked"
  | "active"
  | "question_active"
  | "locked"
  | "results"
  | "ended";

export type SessionMode = "individual" | "group";

export interface Participant {
  id: string;
  name: string;
  group: string | null;        // "A" | "B" | "C" | "D" | null
  joinedAt: number;
  isActive: boolean;
  deviceId: string;
  ws?: any;                    // live WebSocket handle
}

export interface Question {
  id: string;
  content: string;
  options: string[];           // MC options; empty for open answer
  correctAnswer: string;
  grammarPoint: string;
  unit: string;
  questionType: "multiple_choice" | "fill_blank" | "true_false";
  timeLimit: number;           // seconds
}

export interface Response {
  participantId: string;
  answer: string;
  submittedAt: number;         // ms timestamp
  isCorrect: boolean;
  pointsAwarded: number;
  responseRank: number;        // 1st, 2nd, 3rd correct
}

export interface Score {
  participantId: string;
  participantName: string;
  group: string | null;
  totalPoints: number;
  streak: number;
  fastestCount: number;
  badges: string[];
}

export interface ClassBattleRoom {
  sessionId: string;
  code: string;
  teacherId: string;
  teacherWs: any | null;
  scoreboardWs: any | null;
  grade: string;
  topic: string;
  mode: SessionMode;
  status: SessionStatus;
  participants: Map<string, Participant>;
  questions: Question[];
  currentQuestionIndex: number;
  responses: Map<string, Response[]>;  // questionId → responses[]
  scores: Map<string, Score>;
  createdAt: number;
  rosterLocked: boolean;
}

// ─── In-memory store ───────────────────────────────────────────────────────────

const rooms = new Map<string, ClassBattleRoom>();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generateId(): string {
  return randomBytes(8).toString("hex");
}

function sendJson(ws: any, data: object) {
  try {
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify(data));
    }
  } catch {}
}

// ─── Room API ─────────────────────────────────────────────────────────────────

export function createRoom(opts: {
  teacherId: string;
  grade: string;
  topic: string;
  mode: SessionMode;
  questions: Question[];
}): ClassBattleRoom {
  let code = generateCode();
  while (rooms.has(code)) code = generateCode();

  const sessionId = generateId();
  const room: ClassBattleRoom = {
    sessionId,
    code,
    teacherId: opts.teacherId,
    teacherWs: null,
    scoreboardWs: null,
    grade: opts.grade,
    topic: opts.topic,
    mode: opts.mode,
    status: "waiting",
    participants: new Map(),
    questions: opts.questions,
    currentQuestionIndex: -1,
    responses: new Map(),
    scores: new Map(),
    createdAt: Date.now(),
    rosterLocked: false,
  };
  rooms.set(code, room);
  return room;
}

export function getRoom(code: string): ClassBattleRoom | undefined {
  return rooms.get(code.toUpperCase());
}

export function getRoomById(sessionId: string): ClassBattleRoom | undefined {
  for (const room of rooms.values()) {
    if (room.sessionId === sessionId) return room;
  }
  return undefined;
}

export function joinRoom(opts: {
  code: string;
  name: string;
  group: string | null;
  deviceId: string;
  ws: any;
}): { success: boolean; participant?: Participant; room?: ClassBattleRoom; error?: string } {
  const room = getRoom(opts.code);
  if (!room) return { success: false, error: "Session not found. Check the code and try again." };
  if (room.status === "ended") return { success: false, error: "This session has ended." };
  if (room.rosterLocked) return { success: false, error: "The teacher has locked the roster. Ask your teacher to reopen." };

  // Prevent duplicate device
  for (const p of room.participants.values()) {
    if (p.deviceId === opts.deviceId && p.isActive) {
      // Re-attach ws on reconnect
      p.ws = opts.ws;
      return { success: true, participant: p, room };
    }
  }

  const id = generateId();
  const participant: Participant = {
    id,
    name: opts.name.trim().slice(0, 30),
    group: opts.group,
    joinedAt: Date.now(),
    isActive: true,
    deviceId: opts.deviceId,
    ws: opts.ws,
  };
  room.participants.set(id, participant);

  // Init score
  room.scores.set(id, {
    participantId: id,
    participantName: participant.name,
    group: participant.group,
    totalPoints: 0,
    streak: 0,
    fastestCount: 0,
    badges: [],
  });

  return { success: true, participant, room };
}

export function getRoster(room: ClassBattleRoom) {
  return Array.from(room.participants.values()).map((p) => ({
    id: p.id,
    name: p.name,
    group: p.group,
    isActive: p.isActive,
  }));
}

export function getScoreboard(room: ClassBattleRoom) {
  const scores = Array.from(room.scores.values()).sort(
    (a, b) => b.totalPoints - a.totalPoints
  );

  if (room.mode === "group") {
    const groups: Record<string, { name: string; points: number; members: string[] }> = {};
    for (const s of scores) {
      const g = s.group || "None";
      if (!groups[g]) groups[g] = { name: g, points: 0, members: [] };
      groups[g].points += s.totalPoints;
      groups[g].members.push(s.participantName);
    }
    return {
      mode: "group",
      groups: Object.values(groups).sort((a, b) => b.points - a.points),
      individual: scores,
    };
  }

  return { mode: "individual", individual: scores, groups: [] };
}

export function submitAnswer(opts: {
  room: ClassBattleRoom;
  participantId: string;
  answer: string;
}): { isCorrect: boolean; rank: number; pointsAwarded: number } {
  const { room, participantId, answer } = opts;
  if (room.currentQuestionIndex < 0) return { isCorrect: false, rank: 0, pointsAwarded: 0 };

  const question = room.questions[room.currentQuestionIndex];
  if (!question) return { isCorrect: false, rank: 0, pointsAwarded: 0 };

  const questionResponses = room.responses.get(question.id) || [];

  // Prevent duplicate submission
  if (questionResponses.some((r) => r.participantId === participantId)) {
    return { isCorrect: false, rank: 0, pointsAwarded: 0 };
  }

  const isCorrect = answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
  const correctSoFar = questionResponses.filter((r) => r.isCorrect).length;
  const rank = isCorrect ? correctSoFar + 1 : 0;

  // Scoring: speed + correctness
  let points = 0;
  if (isCorrect) {
    if (rank === 1) points = 300;
    else if (rank === 2) points = 200;
    else if (rank === 3) points = 150;
    else points = 100;

    // Streak bonus
    const score = room.scores.get(participantId);
    if (score) {
      score.streak++;
      if (score.streak >= 3) points += 50;
      if (rank === 1) score.fastestCount++;
      score.totalPoints += points;
    }
  } else {
    // Reset streak on wrong answer
    const score = room.scores.get(participantId);
    if (score) score.streak = 0;
  }

  const response: Response = {
    participantId,
    answer,
    submittedAt: Date.now(),
    isCorrect,
    pointsAwarded: points,
    responseRank: rank,
  };
  questionResponses.push(response);
  room.responses.set(question.id, questionResponses);

  return { isCorrect, rank, pointsAwarded: points };
}

export function manualAwardPoints(room: ClassBattleRoom, participantId: string, delta: number) {
  const score = room.scores.get(participantId);
  if (score) {
    score.totalPoints = Math.max(0, score.totalPoints + delta);
  }
}

export function broadcastToAll(room: ClassBattleRoom, data: object) {
  for (const p of room.participants.values()) {
    if (p.ws) sendJson(p.ws, data);
  }
  if (room.scoreboardWs) sendJson(room.scoreboardWs, data);
}

export function broadcastToStudent(room: ClassBattleRoom, participantId: string, data: object) {
  const p = room.participants.get(participantId);
  if (p?.ws) sendJson(p.ws, data);
}

export function broadcastToTeacher(room: ClassBattleRoom, data: object) {
  if (room.teacherWs) sendJson(room.teacherWs, data);
}

export function broadcastToScoreboard(room: ClassBattleRoom, data: object) {
  if (room.scoreboardWs) sendJson(room.scoreboardWs, data);
}

// Cleanup stale rooms (> 6 hours)
setInterval(() => {
  const cutoff = Date.now() - 6 * 60 * 60 * 1000;
  for (const [code, room] of rooms.entries()) {
    if (room.createdAt < cutoff) rooms.delete(code);
  }
}, 30 * 60 * 1000);

export { sendJson, generateId };
