import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Check, Trophy, Wifi, WifiOff, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { bingoWeeks, type BingoCell } from "@/lib/bingo/bingo-weeks";

type StudentState = "JOIN" | "WAITING" | "PLAYING" | "BINGO" | "ENDED" | "ERROR";

const BINGO_LINES = [
  [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15],
  [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15],
  [0, 5, 10, 15], [3, 6, 9, 12],
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function InterviewBingoStudent() {
  const [location] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const urlRoom = params.get("room") || "";

  const [state, setStudentState] = useState<StudentState>("JOIN");
  const [roomCode, setRoomCode] = useState(urlRoom.toUpperCase());
  const [studentName, setStudentName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [connected, setConnected] = useState(false);
  const [weekNumber, setWeekNumber] = useState(1);
  const [bingoCard, setBingoCard] = useState<BingoCell[]>([]);
  const [marked, setMarked] = useState<Map<number, string>>(new Map());
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [winningLines, setWinningLines] = useState<number[][]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { wsRef.current?.close(); }, []);

  function sendWs(data: object) {
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify(data));
    }
  }

  function handleJoin() {
    const name = studentName.trim();
    const code = roomCode.trim().toUpperCase();
    if (!name) { setErrorMsg("Please enter your name."); return; }
    if (code.length !== 4) { setErrorMsg("Room code must be 4 letters."); return; }

    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${proto}//${window.location.host}/ws/bingo`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: "join-room", roomCode: code, studentName: name }));
    };

    ws.onclose = () => {
      setConnected(false);
      if (state !== "BINGO" && state !== "ENDED") {
        setStudentState("ERROR");
        setErrorMsg("Connection lost. Please try again.");
      }
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "error") {
        setErrorMsg(msg.message);
        ws.close();
        return;
      }

      if (msg.type === "joined") {
        setWeekNumber(msg.weekNumber);
        const week = bingoWeeks.find(w => w.week === msg.weekNumber);
        if (week) {
          setBingoCard(shuffle([...week.cells]));
        }
        setStudentState("WAITING");
      }

      if (msg.type === "game-started") {
        setStudentState("PLAYING");
      }

      if (msg.type === "game-ended") {
        setStudentState("ENDED");
      }
    };
  }

  function handleCellClick(cellIndex: number) {
    if (state !== "PLAYING") return;
    const cell = bingoCard[cellIndex];
    if (marked.has(cell.id)) return;
    setActiveCell(cellIndex);
    setInputValue("");
    setTimeout(() => inputRef.current?.focus(), 80);
  }

  function handleUnmark(e: React.MouseEvent, cellIndex: number) {
    e.stopPropagation();
    const cell = bingoCard[cellIndex];
    const newMarked = new Map(marked);
    newMarked.delete(cell.id);
    setMarked(newMarked);
    sendWs({ type: "mark-cell", cellId: cell.id, friendName: "" });
  }

  function handleMarkCell() {
    if (activeCell === null) return;
    const cell = bingoCard[activeCell];
    const name = inputValue.trim() || "✓";
    const newMarked = new Map(marked);
    newMarked.set(cell.id, name);
    setMarked(newMarked);
    setActiveCell(null);
    setInputValue("");
    sendWs({ type: "mark-cell", cellId: cell.id, friendName: name });

    const markedIndices = bingoCard
      .map((c, i) => (newMarked.has(c.id) ? i : -1))
      .filter(i => i !== -1);

    const newWinningLines = BINGO_LINES.filter(line => line.every(i => markedIndices.includes(i)));
    if (newWinningLines.length > 0) {
      setWinningLines(newWinningLines);
      confetti({ particleCount: 250, spread: 130, origin: { y: 0.4 } });
      setTimeout(() => confetti({ particleCount: 150, spread: 100, origin: { x: 0.15, y: 0.5 } }), 300);
      setTimeout(() => confetti({ particleCount: 150, spread: 100, origin: { x: 0.85, y: 0.5 } }), 600);
      sendWs({ type: "bingo" });
      setStudentState("BINGO");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleMarkCell();
    if (e.key === "Escape") setActiveCell(null);
  }

  function isInWinningLine(cellIndex: number) {
    return winningLines.some(line => line.includes(cellIndex));
  }

  const weekData = bingoWeeks.find(w => w.week === weekNumber);
  const markedCount = marked.size;

  if (state === "JOIN" || state === "ERROR") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
          <h1 className="text-3xl font-black text-gray-900 mb-1 text-center" style={{ fontFamily: "Fredoka, sans-serif" }}>
            Join Bingo!
          </h1>
          <p className="text-center text-gray-500 text-sm mb-6">Enter the code from the big screen</p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">Room Code</label>
              <input
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase().slice(0, 4))}
                placeholder="e.g. ABCD"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-2xl font-black text-center tracking-widest uppercase focus:outline-none focus:border-orange-400"
                maxLength={4}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-1.5">Your Name</label>
              <input
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleJoin()}
                placeholder="e.g. Taro"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:border-orange-400"
              />
            </div>

            {errorMsg && (
              <p className="text-red-500 text-sm font-bold text-center bg-red-50 rounded-xl p-3">{errorMsg}</p>
            )}

            <button
              onClick={handleJoin}
              className="w-full py-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-black text-lg rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Join! →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state === "WAITING") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center p-6 text-white">
        <div className="text-center">
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <div className="text-7xl mb-4">⏳</div>
          </motion.div>
          <h2 className="text-4xl font-black mb-2" style={{ fontFamily: "Fredoka, sans-serif" }}>You're in!</h2>
          <p className="text-white/80 text-lg mb-2">Hi, <strong>{studentName}</strong>!</p>
          <p className="text-white/60">Waiting for the teacher to start the game...</p>
          <div className="mt-6 bg-white/10 rounded-2xl px-6 py-4 inline-block">
            <p className="text-sm font-bold text-white/60">Room</p>
            <p className="text-3xl font-black tracking-widest">{roomCode}</p>
          </div>
        </div>
      </div>
    );
  }

  if (state === "BINGO") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 flex items-center justify-center p-6 text-white">
        <div className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.6 }}>
            <div className="text-7xl mb-2">🎉</div>
            <h1 className="text-8xl font-black" style={{ fontFamily: "Fredoka, sans-serif" }}>BINGO!</h1>
            <p className="text-xl font-bold mt-3 text-white/90">Amazing, {studentName}!</p>
            <p className="text-white/70 mt-1">You found {markedCount} people who said YES!</p>
            <p className="mt-6 text-sm text-white/50">Wait for your teacher to end the game</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (state === "ENDED") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-6 text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">🏁</div>
          <h2 className="text-4xl font-black mb-3" style={{ fontFamily: "Fredoka, sans-serif" }}>Game Over!</h2>
          <p className="text-white/70 mb-2">The teacher ended the game.</p>
          <p className="font-bold text-xl text-yellow-300">You found {markedCount} people who said YES!</p>
          <a href="/game/interview-bingo/join" className="mt-8 inline-block bg-white text-purple-900 font-black px-8 py-4 rounded-2xl shadow-xl text-lg hover:scale-[1.02] transition-all">
            Play Again
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 text-white">
      <div className="max-w-lg mx-auto px-3 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`} />
            <span className="font-black text-sm">{studentName}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/20 rounded-xl px-3 py-1 text-xs font-black">{markedCount}/16 ✓</div>
            {weekData && <div className="bg-white/20 rounded-xl px-3 py-1 text-xs font-bold">{weekData.theme}</div>}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-xl p-3 mb-3 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-bold">
            <Mic size={12} className="text-yellow-300" />
            <span>Tap a square → Ask the question → Write their name if they say </span>
            <span className="text-yellow-300 font-black">YES!</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {bingoCard.map((cell, idx) => {
            const isMarked = marked.has(cell.id);
            const isActive = activeCell === idx;
            const inWin = isInWinningLine(idx);

            return (
              <motion.div
                key={cell.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.025 }}
                onClick={() => !isMarked && !isActive && handleCellClick(idx)}
                className={`relative rounded-xl p-2.5 flex flex-col items-center text-center cursor-pointer select-none transition-all min-h-[110px]
                  ${inWin ? "ring-4 ring-yellow-300 ring-offset-1" : ""}
                  ${isMarked
                    ? "bg-green-400 text-white shadow-md"
                    : isActive
                    ? "bg-yellow-300 text-gray-900 shadow-lg scale-[1.04]"
                    : "bg-white/15 hover:bg-white/25 border border-white/20 active:scale-[0.97]"
                  }`}
              >
                {isMarked && (
                  <button
                    onClick={e => handleUnmark(e, idx)}
                    className="absolute top-1 right-1 bg-white/30 hover:bg-white/50 rounded-full w-4 h-4 flex items-center justify-center text-[10px] transition-all"
                  >
                    ×
                  </button>
                )}

                {inWin && (
                  <div className="absolute -top-1 -left-1 bg-yellow-300 rounded-full w-5 h-5 flex items-center justify-center">
                    <Trophy size={10} className="text-orange-600" />
                  </div>
                )}

                <div className="text-2xl mb-1">{cell.emoji}</div>
                <p className={`font-black text-[10px] leading-tight mb-0.5 ${isMarked ? "text-white" : isActive ? "text-gray-900" : "text-white"}`}>
                  {cell.label}
                </p>

                {!isMarked && !isActive && (
                  <p className="text-[8px] leading-snug text-white/55 italic">"{cell.question}"</p>
                )}

                {isActive && (
                  <div className="w-full mt-1" onClick={e => e.stopPropagation()}>
                    <p className="text-[8px] text-gray-600 italic mb-1">"{cell.question}"</p>
                    <input
                      ref={inputRef}
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Name..."
                      className="w-full rounded-lg px-1.5 py-1 text-[10px] font-bold text-gray-900 bg-white border-0 outline-none focus:ring-2 focus:ring-orange-400 mb-1"
                    />
                    <button
                      onClick={handleMarkCell}
                      className="w-full bg-orange-500 text-white rounded-lg py-1 text-[10px] font-black flex items-center justify-center gap-1"
                    >
                      <Check size={10} /> YES!
                    </button>
                  </div>
                )}

                {isMarked && (
                  <div className="mt-auto flex items-center gap-0.5 bg-white/25 rounded-full px-1.5 py-0.5">
                    <Check size={8} />
                    <span className="text-[9px] font-black truncate max-w-[60px]">{marked.get(cell.id)}</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-3 text-center">
          <div className="inline-flex gap-0.5 bg-white/10 rounded-lg p-1">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-sm transition-all ${i < markedCount ? "bg-green-400" : "bg-white/20"}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
