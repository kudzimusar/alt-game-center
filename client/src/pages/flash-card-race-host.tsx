import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, Link } from "wouter";
import { Lock, Eye, ChevronRight, Trophy, Users, SkipForward, Home, Star, Plus, Minus } from "lucide-react";
import { flashCardWeeks } from "@/lib/flash-cards/flash-card-weeks";

interface StudentAnswer {
  studentId: string;
  studentName: string;
  answer: string;
  correct: boolean;
  points: number;
  position: number;
}

interface ScoreEntry {
  id: string;
  name: string;
  group: string | null;
  score: number;
  streak: number;
  rank: number;
}

type Phase = "lobby" | "showing" | "locked" | "revealed" | "ended";

export default function FlashCardRaceHost() {
  const [location] = useLocation();
  const code = new URLSearchParams(window.location.search).get("code") || "";

  const [phase, setPhase] = useState<Phase>("lobby");
  const [studentCount, setStudentCount] = useState(0);
  const [answerCount, setAnswerCount] = useState(0);
  const [currentCard, setCurrentCard] = useState<{ word: string; emoji: string; hint: string; options: string[]; index: number; total: number } | null>(null);
  const [cardAnswers, setCardAnswers] = useState<StudentAnswer[]>([]);
  const [scoreboard, setScoreboard] = useState<ScoreEntry[]>([]);
  const [week, setWeek] = useState<number>(1);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [, setLoc] = useLocation();

  const sendMsg = useCallback((msg: object) => {
    if (wsRef.current?.readyState === 1) wsRef.current.send(JSON.stringify(msg));
  }, []);

  const startTimer = (seconds: number) => {
    setTimer(seconds);
    setTimerActive(true);
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setTimerActive(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerActive(false);
  };

  useEffect(() => {
    if (!code) return;
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${proto}://${window.location.host}/ws/flash-cards`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: "host_connect", code }));
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      switch (msg.type) {
        case "host_reconnected":
          setPhase(msg.phase);
          setStudentCount(msg.studentCount);
          setWeek(msg.week);
          if (msg.scoreboard) setScoreboard(msg.scoreboard);
          break;
        case "student_joined":
          setStudentCount(msg.count);
          break;
        case "student_left":
          setStudentCount(msg.count);
          break;
        case "card_shown":
          setPhase("showing");
          setCurrentCard({ word: msg.word, emoji: msg.emoji, hint: msg.hint, options: msg.options, index: msg.cardIndex, total: msg.total });
          setCardAnswers([]);
          setAnswerCount(0);
          stopTimer();
          startTimer(msg.timeLimit || 15);
          break;
        case "answer_in":
          setAnswerCount(msg.count);
          break;
        case "answers_locked":
          setPhase("locked");
          stopTimer();
          break;
        case "revealed":
          setPhase("revealed");
          setCardAnswers(msg.answers || []);
          if (msg.scoreboard) setScoreboard(msg.scoreboard);
          break;
        case "game_over":
          setPhase("ended");
          if (msg.scoreboard) setScoreboard(msg.scoreboard);
          break;
        case "error":
          setError(msg.message);
          break;
      }
    };

    ws.onerror = () => setError("Connection error. Check the room code.");
    ws.onclose = () => setConnected(false);

    return () => {
      ws.close();
      stopTimer();
    };
  }, [code]);

  const weekData = flashCardWeeks.find((w) => w.week === week);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="bg-blue-900/80 border-b border-blue-700/40 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard"><button className="text-blue-300 hover:text-white transition-colors" title="Dashboard"><Home size={20} /></button></Link>
          <Link href="/games"><button className="text-blue-300 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-blue-800/50 hover:bg-blue-700/50" title="All Games">All Games</button></Link>
          <span className="font-black text-lg text-yellow-400 tracking-widest">⚡ FLASH CARD RACE</span>
          {weekData && <span className="text-blue-300 text-sm">Week {week}: {weekData.title}</span>}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-blue-200">
            <Users size={18} />
            <span className="font-black text-lg">{studentCount}</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-black uppercase ${connected ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
            {connected ? "● LIVE" : "● DISCONNECTED"}
          </div>
          <div className="bg-blue-800 px-4 py-1 rounded-full font-black tracking-widest text-yellow-400">
            {code}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border-b border-red-700 px-6 py-3 text-red-300 text-sm font-bold">{error}</div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Main Panel */}
        <div className="flex-1 flex flex-col p-6 gap-4">
          {phase === "lobby" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <div className="text-center">
                <div className="text-7xl mb-4">⚡</div>
                <h2 className="text-3xl font-black mb-2">Waiting for Students</h2>
                <p className="text-blue-300">Share the code <span className="font-black text-yellow-400 text-2xl tracking-widest">{code}</span> to join</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 text-center">
                <div className="text-4xl font-black text-yellow-400">{studentCount}</div>
                <div className="text-blue-300 text-sm">students joined</div>
              </div>
              <button
                onClick={() => sendMsg({ type: "show_card" })}
                disabled={studentCount === 0}
                className="px-12 py-5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-blue-900 rounded-2xl font-black text-xl transition-all shadow-2xl disabled:cursor-not-allowed"
              >
                {studentCount === 0 ? "Waiting for students…" : `Start — Show Card 1`}
              </button>
              <p className="text-blue-400 text-xs">You can also start in Teacher Mode without students</p>
              <button
                onClick={() => sendMsg({ type: "show_card" })}
                className="text-blue-400 hover:text-blue-200 underline text-sm"
              >
                Start without students (Teacher Mode)
              </button>
            </div>
          )}

          {(phase === "showing" || phase === "locked" || phase === "revealed") && currentCard && (
            <div className="flex-1 flex flex-col gap-4">
              {/* Card Progress */}
              <div className="flex items-center gap-3">
                {Array.from({ length: currentCard.total }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full ${i < currentCard.index ? "bg-green-500" : i === currentCard.index ? "bg-yellow-400" : "bg-white/10"}`}
                  />
                ))}
                <span className="text-blue-300 text-sm font-bold whitespace-nowrap">
                  {currentCard.index + 1}/{currentCard.total}
                </span>
              </div>

              {/* Main Card */}
              <div className="flex-1 bg-gradient-to-br from-blue-800/40 to-indigo-900/40 rounded-3xl border border-blue-500/30 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                {timerActive && (
                  <div className="absolute top-4 right-4 w-14 h-14 rounded-full bg-blue-900 border-4 border-yellow-400 flex items-center justify-center font-black text-xl text-yellow-400">
                    {timer}
                  </div>
                )}
                <div className="text-8xl mb-6 select-none">{currentCard.emoji}</div>
                <p className="text-blue-200 text-xl mb-4">{currentCard.hint}</p>

                {phase === "revealed" ? (
                  <div className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-2xl font-black text-4xl shadow-2xl">
                    {currentCard.word}
                  </div>
                ) : (
                  <div className="flex gap-3 flex-wrap justify-center">
                    {currentCard.options.map((opt, i) => (
                      <span key={i} className="bg-white/10 border border-white/20 px-6 py-3 rounded-xl font-black text-xl text-white/60">
                        {opt}
                      </span>
                    ))}
                  </div>
                )}

                {/* Teacher-only answer hint */}
                <div className="mt-4 bg-blue-900/50 border border-blue-500/30 rounded-xl px-4 py-2 text-sm font-bold text-blue-300">
                  Teacher: Answer is <span className="text-yellow-400 font-black">{currentCard.word}</span>
                </div>
              </div>

              {/* Answer Progress */}
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-black text-sm text-blue-300 uppercase tracking-widest">Live Responses</span>
                  <span className="font-black text-xl text-yellow-400">{answerCount}/{studentCount}</span>
                </div>
                {phase === "revealed" && cardAnswers.length > 0 && (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {cardAnswers.slice(0, 5).map((a, i) => (
                      <div key={i} className={`flex items-center justify-between px-3 py-1.5 rounded-lg ${a.correct ? "bg-green-900/30 border border-green-700/30" : "bg-red-900/20 border border-red-700/20"}`}>
                        <div className="flex items-center gap-2">
                          <span className={`font-black text-xs ${a.correct ? "text-green-400" : "text-red-400"}`}>
                            {a.correct ? `#${a.position}` : "✗"}
                          </span>
                          <span className="font-bold text-sm">{a.studentName}</span>
                          <span className="text-white/40 text-xs">"{a.answer}"</span>
                        </div>
                        <span className={`font-black text-sm ${a.correct ? "text-yellow-400" : "text-white/30"}`}>
                          {a.correct ? `+${a.points}` : "0"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex gap-3">
                {phase === "showing" && (
                  <button
                    onClick={() => sendMsg({ type: "lock_answers" })}
                    className="flex-1 py-4 bg-orange-500 hover:bg-orange-400 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <Lock size={22} /> Lock Answers ({answerCount}/{studentCount})
                  </button>
                )}
                {phase === "locked" && (
                  <button
                    onClick={() => sendMsg({ type: "reveal" })}
                    className="flex-1 py-4 bg-green-500 hover:bg-green-400 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <Eye size={22} /> Reveal Answer
                  </button>
                )}
                {phase === "revealed" && (
                  <>
                    <button
                      onClick={() => sendMsg({ type: "next_card" })}
                      className="flex-1 py-4 bg-blue-500 hover:bg-blue-400 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all"
                    >
                      <ChevronRight size={22} />
                      {currentCard.index + 1 < currentCard.total ? "Next Card" : "Finish Game"}
                    </button>
                    <button
                      onClick={() => sendMsg({ type: "end_game" })}
                      className="px-6 py-4 bg-red-900/50 hover:bg-red-800/50 text-red-300 rounded-2xl font-black transition-all"
                    >
                      End
                    </button>
                  </>
                )}
                {phase === "showing" && (
                  <button
                    onClick={() => { stopTimer(); sendMsg({ type: "lock_answers" }); }}
                    className="px-4 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black transition-all"
                    title="Skip timer"
                  >
                    <SkipForward size={20} />
                  </button>
                )}
              </div>
            </div>
          )}

          {phase === "ended" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <div className="text-6xl">🏆</div>
              <h2 className="text-3xl font-black text-yellow-400">Game Over!</h2>
              {scoreboard[0] && (
                <div className="text-center">
                  <div className="text-6xl mb-2">{scoreboard[0].name}</div>
                  <div className="text-blue-300">Winner with {scoreboard[0].score} points</div>
                </div>
              )}
              <button
                onClick={() => setLoc("/game/flash-cards")}
                className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-blue-900 rounded-2xl font-black transition-all"
              >
                Play Again
              </button>
            </div>
          )}
        </div>

        {/* Scoreboard Panel */}
        <div className="w-72 bg-blue-950/60 border-l border-blue-800/40 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={18} className="text-yellow-400" />
            <span className="font-black text-sm uppercase tracking-widest text-blue-200">Scoreboard</span>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto">
            {scoreboard.slice(0, 15).map((s, i) => (
              <div key={s.id} className={`flex items-center gap-3 px-3 py-2 rounded-xl ${i === 0 ? "bg-yellow-400/10 border border-yellow-400/30" : "bg-white/5"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? "bg-yellow-400 text-blue-900" : i === 1 ? "bg-gray-300 text-gray-900" : i === 2 ? "bg-amber-600 text-white" : "bg-white/10 text-white/50"}`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{s.name}</div>
                  {s.streak >= 3 && <div className="text-orange-400 text-xs font-bold">🔥 {s.streak}×</div>}
                </div>
                {s.group && <div className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${s.group === "A" ? "bg-red-500" : s.group === "B" ? "bg-blue-500" : s.group === "C" ? "bg-green-500" : "bg-yellow-500"} text-white`}>{s.group}</div>}
                <div className="font-black text-yellow-400 text-sm">{s.score.toLocaleString()}</div>
              </div>
            ))}
            {scoreboard.length === 0 && (
              <div className="text-center text-blue-400 text-sm py-8">No scores yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
