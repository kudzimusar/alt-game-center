import { useState, useRef } from "react";
import { Link } from "wouter";
import { ArrowLeft, RefreshCw, Check, Trophy, Mic, Users, MonitorPlay, Smartphone, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { bingoWeeks, type BingoCell } from "@/lib/bingo/bingo-weeks";

type GameState = "LOBBY" | "PLAYING" | "BINGO";

const BINGO_LINES = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [8, 9, 10, 11],
  [12, 13, 14, 15],
  [0, 4, 8, 12],
  [1, 5, 9, 13],
  [2, 6, 10, 14],
  [3, 7, 11, 15],
  [0, 5, 10, 15],
  [3, 6, 9, 12],
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const GRADE_COLORS: Record<string, string> = {
  "1": "bg-green-500",
  "2": "bg-blue-500",
  "3": "bg-purple-500",
};

export default function InterviewBingo() {
  const [gameState, setGameState] = useState<GameState>("LOBBY");
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [bingoCard, setBingoCard] = useState<BingoCell[]>([]);
  const [marked, setMarked] = useState<Map<number, string>>(new Map());
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [winningLines, setWinningLines] = useState<number[][]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const weekData = bingoWeeks.find(w => w.week === selectedWeek)!;

  function startGame() {
    setBingoCard(shuffle([...weekData.cells]));
    setMarked(new Map());
    setActiveCell(null);
    setInputValue("");
    setWinningLines([]);
    setGameState("PLAYING");
  }

  function handleCellClick(cellIndex: number) {
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

    const markedIndices = bingoCard
      .map((c, i) => (newMarked.has(c.id) ? i : -1))
      .filter(i => i !== -1);

    const newWinningLines = BINGO_LINES.filter(line =>
      line.every(i => markedIndices.includes(i))
    );

    if (newWinningLines.length > 0) {
      setWinningLines(newWinningLines);
      confetti({ particleCount: 250, spread: 130, origin: { y: 0.4 } });
      setTimeout(() => confetti({ particleCount: 150, spread: 100, origin: { x: 0.2, y: 0.5 } }), 300);
      setTimeout(() => confetti({ particleCount: 150, spread: 100, origin: { x: 0.8, y: 0.5 } }), 600);
      setGameState("BINGO");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleMarkCell();
    if (e.key === "Escape") setActiveCell(null);
  }

  function isInWinningLine(cellIndex: number) {
    return winningLines.some(line => line.includes(cellIndex));
  }

  const markedCount = marked.size;

  if (gameState === "LOBBY") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard"><button className="flex items-center gap-2 text-white/70 hover:text-white transition-colors font-semibold"><Home size={18}/> Dashboard</button></Link>
            <span className="text-white/30">·</span>
            <Link href="/games"><button className="flex items-center gap-2 text-white/70 hover:text-white transition-colors font-semibold"><ArrowLeft size={18}/> All Games</button></Link>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur rounded-2xl px-6 py-3 mb-6">
              <Users size={22} />
              <span className="font-black tracking-wide text-sm uppercase">Interview Bingo</span>
            </div>
            <h1 className="text-5xl font-black mb-3" style={{ fontFamily: "Fredoka, sans-serif" }}>
              Ask Friends. Get Bingo!
            </h1>

            <div className="bg-white/15 backdrop-blur rounded-2xl p-5 max-w-lg mx-auto text-left space-y-2 mb-6">
              <p className="font-black text-white text-sm uppercase tracking-wide mb-1">How to play</p>
              <div className="flex gap-3 text-white/90 text-sm">
                <span className="text-xl">1️⃣</span>
                <span>Your bingo card has 16 squares. Each square has a question.</span>
              </div>
              <div className="flex gap-3 text-white/90 text-sm">
                <span className="text-xl">2️⃣</span>
                <span>Stand up and walk around. Ask a classmate the question in a square.</span>
              </div>
              <div className="flex gap-3 text-white/90 text-sm">
                <span className="text-xl">3️⃣</span>
                <span>If they say <strong>YES</strong> → tap the square and write their name.</span>
              </div>
              <div className="flex gap-3 text-white/90 text-sm">
                <span className="text-xl">4️⃣</span>
                <span>Fill a full row, column, or diagonal line → <strong>BINGO!</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto mb-2">
              <Link href="/game/interview-bingo/host">
                <button className="w-full py-4 bg-white text-purple-700 font-black text-sm rounded-2xl shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                  <MonitorPlay size={18} /> Teacher — Host a Room
                </button>
              </Link>
              <Link href="/game/interview-bingo/join">
                <button className="w-full py-4 bg-white/20 border-2 border-white font-black text-sm rounded-2xl hover:bg-white/30 transition-all flex items-center justify-center gap-2">
                  <Smartphone size={18} /> Student — Join a Room
                </button>
              </Link>
            </div>
            <p className="text-white/50 text-xs">↑ For the full classroom experience with iPads</p>
          </div>

          <div className="grid gap-4 mb-10">
            {bingoWeeks.map(week => (
              <button
                key={week.week}
                onClick={() => setSelectedWeek(week.week)}
                className={`w-full rounded-3xl p-6 text-left transition-all border-2 ${
                  selectedWeek === week.week
                    ? "bg-white text-gray-900 border-white shadow-2xl scale-[1.01]"
                    : "bg-white/10 border-white/20 hover:bg-white/20 backdrop-blur"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-black px-3 py-1 rounded-full text-white uppercase tracking-wider ${GRADE_COLORS[week.grade]}`}>
                        Grade {week.grade}
                      </span>
                      <span className={`text-xs font-bold uppercase tracking-widest ${selectedWeek === week.week ? "text-gray-400" : "text-white/50"}`}>
                        Week {week.week}
                      </span>
                    </div>
                    <h3 className={`text-xl font-black mb-1 ${selectedWeek === week.week ? "text-gray-900" : "text-white"}`}>
                      {week.theme}
                    </h3>
                    <p className={`text-sm font-medium mb-2 ${selectedWeek === week.week ? "text-orange-600" : "text-white/70"}`}>
                      {week.grammar}
                    </p>
                    <p className={`text-sm ${selectedWeek === week.week ? "text-gray-500" : "text-white/60"}`}>
                      {week.description}
                    </p>
                  </div>
                  <div className={`text-4xl font-black rounded-2xl w-14 h-14 flex items-center justify-center flex-shrink-0 ${
                    selectedWeek === week.week ? "bg-orange-100 text-orange-500" : "bg-white/10"
                  }`}>
                    {week.week}
                  </div>
                </div>

                {selectedWeek === week.week && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {week.cells.slice(0, 8).map(cell => (
                      <span key={cell.id} className="text-xs bg-orange-50 text-orange-700 rounded-full px-3 py-1 font-medium border border-orange-100">
                        {cell.emoji} {cell.label}
                      </span>
                    ))}
                    <span className="text-xs bg-gray-100 text-gray-400 rounded-full px-3 py-1 font-medium">
                      +{week.cells.length - 8} more...
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={startGame}
            className="w-full py-5 bg-white text-orange-500 font-black text-xl rounded-3xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            style={{ fontFamily: "Fredoka, sans-serif" }}
          >
            Let's Play — Week {selectedWeek}! 🎯
          </button>
        </div>
      </div>
    );
  }

  if (gameState === "BINGO") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 flex items-center justify-center text-white p-6">
        <div className="text-center max-w-lg">
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            <div className="text-8xl mb-4">🎉</div>
            <h1 className="text-9xl font-black tracking-tight mb-4" style={{ fontFamily: "Fredoka, sans-serif" }}>
              BINGO!
            </h1>
            <p className="text-2xl font-bold mb-2 text-white/90">You filled a line!</p>
            <p className="text-lg text-white/70 mb-8">
              You spoke English with {marked.size} different people.
            </p>
          </motion.div>

          <div className="bg-white/20 backdrop-blur rounded-3xl p-6 mb-8">
            <p className="text-sm font-black uppercase tracking-widest text-white/60 mb-3">Your marked squares</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {Array.from(marked.entries()).map(([cellId, name]) => {
                const cell = bingoCard.find(c => c.id === cellId);
                return cell ? (
                  <span key={cellId} className="bg-white/20 rounded-xl px-3 py-1.5 text-sm font-bold">
                    {cell.emoji} {name}
                  </span>
                ) : null;
              })}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={startGame}
              className="flex-1 py-4 bg-white text-orange-500 font-black text-lg rounded-2xl shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={20} /> New Card
            </button>
            <button
              onClick={() => setGameState("LOBBY")}
              className="flex-1 py-4 bg-white/20 border-2 border-white font-black text-lg rounded-2xl hover:bg-white/30 transition-all"
            >
              Change Week
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 text-white">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setGameState("LOBBY")}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors font-semibold"
          >
            <ArrowLeft size={18} /> Back
          </button>

          <div className="text-center">
            <div className="flex items-center gap-2 justify-center">
              <span className={`text-xs font-black px-2 py-0.5 rounded-full text-white uppercase tracking-wider ${GRADE_COLORS[weekData.grade]}`}>
                G{weekData.grade}
              </span>
              <span className="font-black text-sm">Week {weekData.week} — {weekData.theme}</span>
            </div>
            <p className="text-xs text-white/60 mt-0.5">{weekData.grammar}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-xl px-3 py-1.5 text-sm font-black">
              {markedCount}/16 ✓
            </div>
            <button
              onClick={startGame}
              title="New card"
              className="bg-white/20 hover:bg-white/30 rounded-xl p-2 transition-all"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-2xl p-3 mb-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-bold">
            <Mic size={14} className="text-yellow-300" />
            <span>Ask the question in each square. Write a classmate's name when they say </span>
            <span className="text-yellow-300 font-black">YES!</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {bingoCard.map((cell, idx) => {
            const isMarked = marked.has(cell.id);
            const isActive = activeCell === idx;
            const inWin = isInWinningLine(idx);

            return (
              <motion.div
                key={cell.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => !isMarked && !isActive && handleCellClick(idx)}
                className={`relative rounded-2xl p-3 flex flex-col items-center text-center cursor-pointer select-none transition-all min-h-[130px]
                  ${inWin ? "ring-4 ring-yellow-300 ring-offset-2 ring-offset-transparent" : ""}
                  ${isMarked
                    ? "bg-green-400 text-white shadow-lg"
                    : isActive
                    ? "bg-yellow-300 text-gray-900 shadow-xl scale-[1.03]"
                    : "bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur"
                  }`}
              >
                {isMarked && (
                  <button
                    onClick={(e) => handleUnmark(e, idx)}
                    className="absolute top-1.5 right-1.5 bg-white/30 hover:bg-white/50 rounded-full w-5 h-5 flex items-center justify-center text-xs transition-all"
                    title="Remove mark"
                  >
                    ×
                  </button>
                )}

                {inWin && (
                  <div className="absolute -top-1 -left-1 bg-yellow-300 rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                    <Trophy size={12} className="text-orange-600" />
                  </div>
                )}

                <div className="text-3xl mb-1">{cell.emoji}</div>

                <p className={`font-black text-xs leading-tight mb-1 ${isMarked ? "text-white" : isActive ? "text-gray-900" : "text-white"}`}>
                  {cell.label}
                </p>

                {!isMarked && !isActive && (
                  <p className="text-[10px] leading-snug text-white/60 italic">
                    "{cell.question}"
                  </p>
                )}

                {isActive && (
                  <div className="w-full mt-1" onClick={e => e.stopPropagation()}>
                    <p className="text-[10px] text-gray-700 italic mb-1.5">"{cell.question}"</p>
                    <input
                      ref={inputRef}
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Name..."
                      className="w-full rounded-lg px-2 py-1 text-xs font-bold text-gray-900 bg-white border-0 outline-none focus:ring-2 focus:ring-orange-400 mb-1.5"
                    />
                    <button
                      onClick={handleMarkCell}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-1 text-xs font-black flex items-center justify-center gap-1 transition-all"
                    >
                      <Check size={12} /> YES!
                    </button>
                  </div>
                )}

                {isMarked && (
                  <div className="mt-auto flex items-center gap-1 bg-white/25 rounded-full px-2 py-0.5">
                    <Check size={10} />
                    <span className="text-[11px] font-black truncate max-w-[80px]">{marked.get(cell.id)}</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 text-center">
          <div className="inline-flex gap-1 bg-white/10 rounded-xl p-1">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-sm transition-all ${i < markedCount ? "bg-green-400" : "bg-white/20"}`}
              />
            ))}
          </div>
          <p className="text-xs text-white/50 mt-1">{markedCount} of 16 squares filled</p>
        </div>
      </div>
    </div>
  );
}
