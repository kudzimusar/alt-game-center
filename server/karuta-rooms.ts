import type { WebSocket } from "ws";

export interface KarutaStudent {
  id: string;
  name: string;
  group: "A" | "B" | "C" | "D" | null;
  ws: WebSocket;
  cardsWon: number;
  score: number;
  streak: number;
}

export interface KarutaGrab {
  studentId: string;
  studentName: string;
  timestamp: number;
  cardIndex: number;
  correct: boolean;
  points: number;
}

export interface KarutaRoom {
  code: string;
  week: number;
  mode: "individual" | "group";
  hostWs: WebSocket | null;
  students: Map<string, KarutaStudent>;
  cards: { word: string; emoji: string; hint: string }[];
  board: number[];
  calledCardIndex: number | null;
  currentGrabs: KarutaGrab[];
  cardOwners: Map<number, string>;
  phase: "lobby" | "calling" | "grabbed" | "ended";
  createdAt: number;
}

const rooms = new Map<string, KarutaRoom>();

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

export function broadcastToStudents(room: KarutaRoom, data: object) {
  room.students.forEach((s) => sendJson(s.ws, data));
}

export function broadcastAll(room: KarutaRoom, data: object) {
  if (room.hostWs) sendJson(room.hostWs, data);
  broadcastToStudents(room, data);
}

export function createKarutaRoom(
  hostWs: WebSocket,
  week: number,
  mode: "individual" | "group",
  cards: { word: string; emoji: string; hint: string }[]
): string {
  const code = generateCode();
  const board = cards.map((_, i) => i); // all card indices on board
  rooms.set(code, {
    code, week, mode, hostWs, students: new Map(),
    cards, board, calledCardIndex: null,
    currentGrabs: [], cardOwners: new Map(),
    phase: "lobby", createdAt: Date.now(),
  });
  setTimeout(() => rooms.delete(code), 4 * 60 * 60 * 1000);
  return code;
}

export function joinKarutaRoom(
  code: string, ws: WebSocket, name: string, group: "A" | "B" | "C" | "D" | null
): { studentId: string; room: KarutaRoom } | null {
  const room = rooms.get(code.toUpperCase());
  if (!room || room.phase === "ended") return null;
  const studentId = generateStudentId();
  room.students.set(studentId, { id: studentId, name, group, ws, cardsWon: 0, score: 0, streak: 0 });
  return { studentId, room };
}

export function getKarutaRoom(code: string): KarutaRoom | undefined {
  return rooms.get(code.toUpperCase());
}

export function grabCard(
  room: KarutaRoom, studentId: string, cardIndex: number, timestamp: number
): KarutaGrab | null {
  if (room.phase !== "calling") return null;
  const student = room.students.get(studentId);
  if (!student) return null;
  if (room.currentGrabs.some((g) => g.studentId === studentId)) return null; // already grabbed
  if (!room.board.includes(cardIndex)) return null; // card already taken

  const correct = cardIndex === room.calledCardIndex;
  const isFirst = room.currentGrabs.filter((g) => g.correct).length === 0;
  let points = 0;
  if (correct) {
    points = isFirst ? 300 : 100;
    student.streak += 1;
    if (student.streak >= 3) points += 50;
    student.cardsWon += 1;
    student.score += points;
  } else {
    points = -50;
    student.score = Math.max(0, student.score + points);
    student.streak = 0;
  }

  const grab: KarutaGrab = { studentId, studentName: student.name, timestamp, cardIndex, correct, points };
  room.currentGrabs.push(grab);

  if (correct && isFirst) {
    // Card won — remove from board
    room.board = room.board.filter((i) => i !== cardIndex);
    room.cardOwners.set(cardIndex, studentId);
  }

  return grab;
}

export function getKarutaScoreboard(room: KarutaRoom) {
  const entries: { id: string; name: string; group: string | null; score: number; cardsWon: number; streak: number }[] = [];
  room.students.forEach((s) => entries.push({ id: s.id, name: s.name, group: s.group, score: s.score, cardsWon: s.cardsWon, streak: s.streak }));
  return entries.sort((a, b) => b.score - a.score).map((e, i) => ({ ...e, rank: i + 1 }));
}

export function getKarutaGroupScoreboard(room: KarutaRoom) {
  const groups: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  room.students.forEach((s) => { if (s.group) groups[s.group] += s.score; });
  return Object.entries(groups).map(([name, score]) => ({ name, score })).sort((a, b) => b.score - a.score);
}

export function setKarutaHostWs(room: KarutaRoom, ws: WebSocket) {
  room.hostWs = ws;
}

export function removeKarutaStudent(room: KarutaRoom, studentId: string) {
  room.students.delete(studentId);
}
