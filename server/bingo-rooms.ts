import type { WebSocket } from "ws";

export interface BingoStudent {
  ws: WebSocket;
  name: string;
  marked: number[];
  hasBingo: boolean;
  joinedAt: Date;
}

export interface BingoRoom {
  code: string;
  weekNumber: number;
  teacherWs: WebSocket;
  students: Map<string, BingoStudent>;
  started: boolean;
  createdAt: Date;
}

const rooms = new Map<string, BingoRoom>();

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return rooms.has(code) ? generateCode() : code;
}

function generateStudentId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function sendJson(ws: WebSocket, data: object) {
  if (ws.readyState === 1) {
    ws.send(JSON.stringify(data));
  }
}

export function createRoom(teacherWs: WebSocket, weekNumber: number): string {
  const code = generateCode();
  rooms.set(code, {
    code,
    weekNumber,
    teacherWs,
    students: new Map(),
    started: false,
    createdAt: new Date(),
  });
  return code;
}

export function joinRoom(
  code: string,
  studentWs: WebSocket,
  name: string
): { studentId: string; weekNumber: number } | null {
  const room = rooms.get(code);
  if (!room) return null;
  const studentId = generateStudentId();
  room.students.set(studentId, {
    ws: studentWs,
    name,
    marked: [],
    hasBingo: false,
    joinedAt: new Date(),
  });
  return { studentId, weekNumber: room.weekNumber };
}

export function getRoom(code: string): BingoRoom | undefined {
  return rooms.get(code);
}

export function findRoomByStudentId(
  studentId: string
): { room: BingoRoom; student: BingoStudent } | undefined {
  for (const room of rooms.values()) {
    const student = room.students.get(studentId);
    if (student) return { room, student };
  }
  return undefined;
}

export function getTeacherSnapshot(room: BingoRoom) {
  return Array.from(room.students.entries()).map(([id, s]) => ({
    studentId: id,
    name: s.name,
    markedCount: s.marked.length,
    hasBingo: s.hasBingo,
  }));
}

export function removeRoom(code: string): void {
  rooms.delete(code);
}

setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    if (now - room.createdAt.getTime() > 4 * 60 * 60 * 1000) {
      rooms.delete(code);
    }
  }
}, 60 * 60 * 1000);
