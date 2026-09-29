import type { WebSocket } from "ws";

export interface GenStudent {
  id: string;
  name: string;
  group: "A" | "B" | "C" | "D" | null;
  ws: WebSocket;
  score: number;
  streak: number;
  answers: number;
  correct: number;
}

export interface GenAnswer {
  studentId: string;
  studentName: string;
  answer: string;
  timestamp: number;
  correct: boolean;
  points: number;
  position: number;
}

export interface GenRoom {
  code: string;
  gameType: string;
  week: number;
  mode: "individual" | "group";
  hostWs: WebSocket | null;
  students: Map<string, GenStudent>;
  questions: any[];
  currentIndex: number;
  phase: "lobby" | "question" | "locked" | "ended";
  answers: GenAnswer[];
  createdAt: number;
}

const rooms = new Map<string, GenRoom>();

function genCode(): string {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) code += c[Math.floor(Math.random() * c.length)];
  return rooms.has(code) ? genCode() : code;
}

export function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function sendJson(ws: WebSocket, data: object) {
  if (ws.readyState === 1) ws.send(JSON.stringify(data));
}

export function broadcastStudents(room: GenRoom, data: object) {
  room.students.forEach((s) => sendJson(s.ws, data));
}

export function broadcastAll(room: GenRoom, data: object) {
  if (room.hostWs) sendJson(room.hostWs, data);
  broadcastStudents(room, data);
}

export function createRoom(
  hostWs: WebSocket, gameType: string, week: number,
  mode: "individual" | "group", questions: any[]
): string {
  const code = genCode();
  rooms.set(code, {
    code, gameType, week, mode, hostWs,
    students: new Map(),
    questions, currentIndex: 0,
    phase: "lobby", answers: [],
    createdAt: Date.now(),
  });
  setTimeout(() => rooms.delete(code), 4 * 60 * 60 * 1000);
  return code;
}

export function getRoom(code: string): GenRoom | undefined {
  return rooms.get(code.toUpperCase());
}

export function joinRoom(code: string, ws: WebSocket, name: string, group: "A" | "B" | "C" | "D" | null): { studentId: string; room: GenRoom } | null {
  const room = rooms.get(code.toUpperCase());
  if (!room || room.phase === "ended") return null;
  const studentId = genId();
  room.students.set(studentId, { id: studentId, name, group, ws, score: 0, streak: 0, answers: 0, correct: 0 });
  return { studentId, room };
}

export function submitAnswer(
  room: GenRoom, studentId: string, answer: string, isCorrect: boolean, basePoints = 300, streakBonus = 50
): GenAnswer | null {
  if (room.phase !== "question") return null;
  const student = room.students.get(studentId);
  if (!student) return null;
  if (room.answers.some((a) => a.studentId === studentId)) return null;

  const position = room.answers.filter((a) => a.correct).length + 1;
  let points = 0;
  if (isCorrect) {
    points = position === 1 ? basePoints : position === 2 ? 200 : position === 3 ? 150 : 100;
    student.streak += 1;
    if (student.streak >= 3) points += streakBonus;
    student.correct += 1;
    student.score += points;
  } else {
    student.streak = 0;
  }
  student.answers += 1;

  const ans: GenAnswer = { studentId, studentName: student.name, answer, timestamp: Date.now(), correct: isCorrect, points, position };
  room.answers.push(ans);
  return ans;
}

export function getScoreboard(room: GenRoom) {
  const entries: any[] = [];
  room.students.forEach((s) => entries.push({ id: s.id, name: s.name, group: s.group, score: s.score, streak: s.streak, correct: s.correct, answers: s.answers }));
  return entries.sort((a, b) => b.score - a.score).map((e, i) => ({ ...e, rank: i + 1 }));
}

export function getGroupScoreboard(room: GenRoom) {
  const groups: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  room.students.forEach((s) => { if (s.group) groups[s.group] += s.score; });
  return Object.entries(groups).map(([name, score]) => ({ name, score })).sort((a, b) => b.score - a.score);
}

export function setHostWs(room: GenRoom, ws: WebSocket) { room.hostWs = ws; }
export function removeStudent(room: GenRoom, id: string) { room.students.delete(id); }
