import { useState, useEffect, useRef } from "react";
import { Zap, CheckCircle, XCircle, Trophy, Clock } from "lucide-react";
import GameNavBar from "@/components/GameNavBar";

interface CardData {
  emoji: string;
  hint: string;
  options: string[];
  cardIndex: number;
  total: number;
  timeLimit: number;
}

interface RevealData {
  correctWord: string;
  yourAnswer: string;
  correct: boolean;
  points: number;
  position: number;
}

type GamePhase = "joining" | "waiting" | "card" | "answered" | "revealed" | "ended";

const optionColors = ["bg-red-500 hover:bg-red-400", "bg-blue-500 hover:bg-blue-400", "bg-yellow-500 hover:bg-yellow-400", "bg-green-500 hover:bg-green-400"];
const optionLabels = ["A", "B", "C", "D"];

export default function FlashCardRacePlay() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code") || "";
  const playerName = decodeURIComponent(params.get("name") || "Player");
  const playerGroup = (params.get("group") || "") as "A" | "B" | "C" | "D" | "";

  const [phase, setPhase] = useState<GamePhase>("joining");
  const [studentId, setStudentId] = useState<string | null>(null);
  const [card, setCard] = useState<CardData | null>(null);
  const [reveal, setReveal] = useState<RevealData | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timer, setTimer] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cardsCompleted, setCardsCompleted] = useState(0);
  const [finalScoreboard, setFinalScoreboard] = useState<{ name: string; score: number; rank: number }[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = (seconds: number) => {
    setTimer(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (!code || !playerName) { setError("Missing room code or name."); return; }

    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${proto}://${window.location.host}/ws/flash-cards`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join", code, name: playerName, group: playerGroup || null }));
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      switch (msg.type) {
        case "joined":
          setStudentId(msg.studentId);
          setPhase("waiting");
          break;
        case "card_shown":
          setCard({ emoji: msg.emoji, hint: msg.hint, options: msg.options, cardIndex: msg.cardIndex, total: msg.total, timeLimit: msg.timeLimit || 15 });
          setReveal(null);
          setSelectedAnswer(null);
          setPhase("card");
          startTimer(msg.timeLimit || 15);
          break;
        case "answer_received":
          setPhase("answered");
          if (timerRef.current) clearInterval(timerRef.current);
          break;
        case "answers_locked":
          if (phase === "card") setPhase("answered");
          if (timerRef.current) clearInterval(timerRef.current);
          break;
        case "revealed":
          setReveal({ correctWord: msg.correctWord, yourAnswer: msg.yourAnswer, correct: msg.correct, points: msg.points, position: msg.position });
          if (msg.correct) {
            setTotalScore((s) => s + msg.points);
            setStreak((s) => s + 1);
          } else {
            setStreak(0);
          }
          setCardsCompleted((c) => c + 1);
          setPhase("revealed");
          break;
        case "game_over":
          setFinalScoreboard(msg.scoreboard || []);
          setPhase("ended");
          break;
        case "error":
          setError(msg.message);
          break;
      }
    };

    ws.onerror = () => setError("Connection lost. Please rejoin.");
    ws.onclose = () => {
      if (phase !== "ended") setError("Disconnected from game.");
    };

    return () => { ws.close(); if (timerRef.current) clearInterval(timerRef.current); };
  }, [code]);

  const submitAnswer = (answer: string) => {
    if (phase !== "card" || selectedAnswer) return;
    setSelectedAnswer(answer);
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: "submit_answer", answer, timestamp: Date.now() }));
    }
    setPhase("answered");
  };

  const timerPct = card ? Math.max(0, (timer / card.timeLimit) * 100) : 0;
  const timerColor = timer > 7 ? "#22c55e" : timer > 3 ? "#f59e0b" : "#ef4444";

  if (error) {
    return (
      <div className="min-h-screen bg-blue-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-white font-black text-xl mb-2">Connection Error</div>
          <div className="text-blue-300 mb-6">{error}</div>
          <button onClick={() => window.location.href = `/game/flash-cards/join?code=${code}`} className="px-6 py-3 bg-yellow-400 text-blue-900 rounded-xl font-black">Rejoin</button>
        </div>
      </div>
    );
  }

  if (phase === "joining") {
    return (
      <div className="min-h-screen bg-blue-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-5xl mb-4 animate-pulse">⚡</div>
          <div className="font-black text-xl">Connecting…</div>
        </div>
      </div>
    );
  }

  if (phase === "waiting") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-sm">
          <div className="text-7xl mb-6 animate-bounce">⚡</div>
          <h2 className="text-3xl font-black mb-2">Ready, {playerName}!</h2>
          <p className="text-blue-200 mb-6">Waiting for the teacher to start…</p>
          <div className="bg-white/10 rounded-2xl p-4">
            <div className="text-xs text-blue-300 uppercase tracking-widest mb-1">Your Score</div>
            <div className="text-4xl font-black text-yellow-400">0</div>
          </div>
          {playerGroup && (
            <div className="mt-4 bg-white/10 rounded-xl px-4 py-2 inline-block font-black">
              Team {playerGroup}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === "ended") {
    const myRank = finalScoreboard.findIndex((s) => s.name === playerName) + 1;
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-800 to-indigo-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-3xl font-black text-yellow-400 mb-2">Game Over!</h2>
        <p className="text-blue-200 mb-6">Final score: <span className="font-black text-white text-xl">{totalScore}</span> points</p>
        {myRank > 0 && (
          <div className="bg-white/10 rounded-2xl px-8 py-4 mb-6 text-center">
            <div className="text-sm text-blue-300 uppercase tracking-widest">Your Rank</div>
            <div className="text-5xl font-black text-yellow-400">#{myRank}</div>
          </div>
        )}
        <div className="w-full max-w-sm space-y-2">
          {finalScoreboard.slice(0, 5).map((s, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${s.name === playerName ? "bg-yellow-400/20 border border-yellow-400/50" : "bg-white/10"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? "bg-yellow-400 text-blue-900" : i === 1 ? "bg-gray-300 text-gray-900" : "bg-white/20"}`}>{i + 1}</div>
              <div className="flex-1 font-bold">{s.name}</div>
              <div className="font-black text-yellow-400">{s.score}</div>
            </div>
          ))}
        </div>
        <button onClick={() => window.location.href = `/game/flash-cards/join?code=${code}`} className="mt-8 px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-blue-900 rounded-2xl font-black transition-all">
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 to-indigo-950 flex flex-col text-white">
      <GameNavBar />
      <div className="flex-1 flex flex-col p-4"><div className="flex items-center justify-between mb-4">
        <div className="text-sm font-bold text-blue-300">{playerName}</div>
        <div className="flex items-center gap-3">
          {streak >= 3 && <div className="text-orange-400 font-black text-sm">🔥 {streak}×</div>}
          <div className="bg-white/10 rounded-xl px-3 py-1 text-sm font-black text-yellow-400">{totalScore} pts</div>
        </div>
      </div>

      {/* Card Progress */}
      {card && (
        <div className="flex gap-1 mb-4">
          {Array.from({ length: card.total }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i < card.cardIndex ? "bg-green-500" : i === card.cardIndex ? "bg-yellow-400" : "bg-white/15"}`} />
          ))}
        </div>
      )}

      {/* Timer */}
      {(phase === "card" || phase === "answered") && card && (
        <div className="flex items-center gap-3 mb-4 bg-white/10 rounded-2xl px-4 py-2">
          <Clock size={16} className="text-blue-300" />
          <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${timerPct}%`, backgroundColor: timerColor }}
            />
          </div>
          <span className="font-black text-sm" style={{ color: timerColor }}>{timer}s</span>
        </div>
      )}

      {/* Card Display */}
      {card && (
        <div className="flex-1 flex flex-col">
          <div className="bg-white/10 rounded-3xl p-6 text-center mb-4 border border-white/20">
            <div className="text-8xl mb-4 select-none">{card.emoji}</div>
            <p className="text-blue-200 text-lg leading-relaxed">{card.hint}</p>
          </div>

          {phase === "card" && !selectedAnswer && (
            <div className="grid grid-cols-2 gap-3">
              {card.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => submitAnswer(opt)}
                  className={`${optionColors[i]} text-white py-5 rounded-2xl font-black text-lg shadow-xl active:scale-[0.97] transition-all relative`}
                >
                  <span className="absolute top-2 left-3 text-xs opacity-60 font-black">{optionLabels[i]}</span>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {(phase === "answered") && !reveal && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-yellow-400/20 border-2 border-yellow-400 flex items-center justify-center animate-pulse">
                <Zap size={28} className="text-yellow-400" />
              </div>
              <p className="text-blue-200 font-bold text-lg">Answer locked!</p>
              {selectedAnswer && <p className="text-white/60 text-sm">You answered: <span className="font-black text-white">"{selectedAnswer}"</span></p>}
              <p className="text-blue-300 text-sm">Waiting for the teacher to reveal…</p>
            </div>
          )}

          {phase === "revealed" && reveal && (
            <div className={`rounded-3xl p-6 text-center border-2 ${reveal.correct ? "bg-green-900/40 border-green-500" : "bg-red-900/30 border-red-500/50"}`}>
              <div className="text-5xl mb-3">{reveal.correct ? "✅" : "❌"}</div>
              <div className={`text-2xl font-black mb-2 ${reveal.correct ? "text-green-400" : "text-red-400"}`}>
                {reveal.correct ? "Correct!" : "Not quite!"}
              </div>
              <div className="text-white/70 text-sm mb-3">
                Answer: <span className="font-black text-white text-lg">{reveal.correctWord}</span>
              </div>
              {!reveal.correct && reveal.yourAnswer && (
                <div className="text-white/50 text-sm mb-3">You said: "{reveal.yourAnswer}"</div>
              )}
              {reveal.correct && (
                <div className="mt-3 space-y-1">
                  <div className="text-yellow-400 font-black text-3xl">+{reveal.points}</div>
                  {reveal.position > 0 && <div className="text-yellow-300 text-sm">#{reveal.position} to answer correctly!</div>}
                  {streak >= 3 && <div className="text-orange-400 text-sm font-black">🔥 Streak ×{streak}! (+100 bonus)</div>}
                </div>
              )}
              <div className="mt-4 text-blue-300 text-sm animate-pulse">Next card coming soon…</div>
            </div>
          )}
        </div>
      )}
    </div></div>
  );
}
