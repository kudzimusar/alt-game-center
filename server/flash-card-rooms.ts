import type { WebSocket } from "ws";

export interface FCStudent {
  id: string;
  name: string;
  group: "A" | "B" | "C" | "D" | null;
  ws: WebSocket;
  score: number;
  streak: number;
  lastAnswerCorrect: boolean;
}

export interface FCAnswer {
  studentId: string;
  studentName: string;
  answer: string;
  timestamp: number;
  correct: boolean;
  points: number;
  position: number;
}

export interface FCRoom {
  code: string;
  grade: string;
  week: number;
  mode: "individual" | "group";
  hostWs: WebSocket | null;
  students: Map<string, FCStudent>;
  cards: { word: string; emoji: string; hint: string }[];
  currentCardIndex: number;
  phase: "lobby" | "showing" | "locked" | "revealed" | "ended";
  cardAnswers: FCAnswer[];
  correctCount: number;
  createdAt: number;
}

const rooms = new Map<string, FCRoom>();

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return rooms.has(code) ? generateCode() : code;
}

function generateStudentId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function sendJson(ws: WebSocket, data: object) {
  if (ws.readyState === 1) ws.send(JSON.stringify(data));
}

export function broadcastToStudents(room: FCRoom, data: object) {
  room.students.forEach((s) => sendJson(s.ws, data));
}

export function broadcastAll(room: FCRoom, data: object) {
  if (room.hostWs) sendJson(room.hostWs, data);
  broadcastToStudents(room, data);
}

export function createRoom(
  hostWs: WebSocket,
  week: number,
  grade: string,
  mode: "individual" | "group",
  cards: { word: string; emoji: string; hint: string }[]
): string {
  const code = generateCode();
  rooms.set(code, {
    code,
    grade,
    week,
    mode,
    hostWs,
    students: new Map(),
    cards,
    currentCardIndex: 0,
    phase: "lobby",
    cardAnswers: [],
    correctCount: 0,
    createdAt: Date.now(),
  });
  // Auto-expire after 4 hours
  setTimeout(() => rooms.delete(code), 4 * 60 * 60 * 1000);
  return code;
}

export function joinRoom(
  code: string,
  ws: WebSocket,
  name: string,
  group: "A" | "B" | "C" | "D" | null
): { studentId: string; room: FCRoom } | null {
  const room = rooms.get(code.toUpperCase());
  if (!room || room.phase === "ended") return null;
  const studentId = generateStudentId();
  room.students.set(studentId, {
    id: studentId,
    name,
    group,
    ws,
    score: 0,
    streak: 0,
    lastAnswerCorrect: false,
  });
  return { studentId, room };
}

export function getRoom(code: string): FCRoom | undefined {
  return rooms.get(code.toUpperCase());
}

export function submitAnswer(
  room: FCRoom,
  studentId: string,
  answer: string,
  timestamp: number
): FCAnswer | null {
  if (room.phase !== "showing") return null;
  const student = room.students.get(studentId);
  if (!student) return null;
  // Prevent duplicate answers
  if (room.cardAnswers.some((a) => a.studentId === studentId)) return null;

  const currentCard = room.cards[room.currentCardIndex];
  const correct = answer.trim().toLowerCase() === currentCard.word.toLowerCase();
  const correctSoFar = room.cardAnswers.filter((a) => a.correct).length;
  const position = correct ? correctSoFar + 1 : 0;

  // Points: 1st correct=500, 2nd=300, 3rd=200, others=100, wrong=0
  let points = 0;
  if (correct) {
    if (position === 1) points = 500;
    else if (position === 2) points = 300;
    else if (position === 3) points = 200;
    else points = 100;
    student.streak += 1;
    if (student.streak >= 3) points += 100; // streak bonus
    student.lastAnswerCorrect = true;
  } else {
    student.streak = 0;
    student.lastAnswerCorrect = false;
  }

  student.score += points;
  if (correct) room.correctCount += 1;

  const record: FCAnswer = {
    studentId,
    studentName: student.name,
    answer,
    timestamp,
    correct,
    points,
    position,
  };
  room.cardAnswers.push(record);
  return record;
}

export function getScoreboard(room: FCRoom) {
  const entries: { id: string; name: string; group: string | null; score: number; streak: number }[] = [];
  room.students.forEach((s) => {
    entries.push({ id: s.id, name: s.name, group: s.group, score: s.score, streak: s.streak });
  });
  entries.sort((a, b) => b.score - a.score);
  return entries.map((e, i) => ({ ...e, rank: i + 1 }));
}

export function getGroupScoreboard(room: FCRoom) {
  const groups: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  room.students.forEach((s) => {
    if (s.group && groups[s.group] !== undefined) groups[s.group] += s.score;
  });
  return Object.entries(groups)
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score);
}

export function advanceCard(room: FCRoom): boolean {
  room.cardAnswers = [];
  room.correctCount = 0;
  room.currentCardIndex += 1;
  if (room.currentCardIndex >= room.cards.length) {
    room.phase = "ended";
    return false;
  }
  room.phase = "showing";
  return true;
}

export function removeStudent(room: FCRoom, studentId: string) {
  room.students.delete(studentId);
}

export function setHostWs(room: FCRoom, ws: WebSocket) {
  room.hostWs = ws;
}
