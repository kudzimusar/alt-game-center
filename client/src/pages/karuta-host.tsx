import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, Link } from "wouter";
import { Volume2, Lock, Trophy, Users, Home, ChevronRight, SkipForward } from "lucide-react";
import { flashCardWeeks } from "@/lib/flash-cards/flash-card-weeks";

interface GrabResult {
  studentName: string;
  correct: boolean;
  points: number;
  cardIndex: number;
}

interface ScoreEntry {
  id: string;
  name: string;
  group: string | null;
  score: number;
  cardsWon: number;
  rank: number;
}

type Phase = "lobby" | "calling" | "grabbed" | "ended";

export default function KarutaHost() {
  const code = new URLSearchParams(window.location.search).get("code") || "";
  const [, setLoc] = useLocation();

  const [phase, setPhase] = useState<Phase>("lobby");
  const [studentCount, setStudentCount] = useState(0);
  const [week, setWeek] = useState(1);
  const [board, setBoard] = useState<number[]>([]);
  const [calledIndex, setCalledIndex] = useState<number | null>(null);
  const [grabs, setGrabs] = useState<GrabResult[]>([]);
  const [scoreboard, setScoreboard] = useState<ScoreEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastWinner, setLastWinner] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const sendMsg = useCallback((msg: object) => {
    if (wsRef.current?.readyState === 1) wsRef.current.send(JSON.stringify(msg));
  }, []);

  const startTimer = (s: number) => {
    setTimer(s);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimer((t) => { if (t <= 1) { clearInterval(timerRef.current!); return 0; } return t - 1; }), 1000);
  };

  useEffect(() => {
    if (!code) return;
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${proto}://${window.location.host}/ws/karuta`);
    wsRef.current = ws;
    ws.onopen = () => { setConnected(true); ws.send(JSON.stringify({ type: "host_connect", code })); };
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      switch (msg.type) {
        case "host_reconnected":
          setPhase(msg.phase); setStudentCount(msg.studentCount); setWeek(msg.week);
          setBoard(msg.board || []); if (msg.scoreboard) setScoreboard(msg.scoreboard);
          break;
        case "student_joined": setStudentCount(msg.count); break;
        case "student_left": setStudentCount(msg.count); break;
        case "card_called":
          setPhase("calling"); setCalledIndex(msg.cardIndex); setGrabs([]); setLastWinner(null);
          startTimer(msg.timeLimit || 10);
          break;
        case "grab_in":
          setGrabs((prev) => [...prev, { studentName: msg.studentName, correct: msg.correct, points: msg.points, cardIndex: msg.cardIndex }]);
          if (msg.correct && !lastWinner) setLastWinner(msg.studentName);
          break;
        case "card_locked":
          setPhase("grabbed"); if (timerRef.current) clearInterval(timerRef.current);
          if (msg.board) setBoard(msg.board);
          if (msg.scoreboard) setScoreboard(msg.scoreboard);
          break;
        case "game_over":
          setPhase("ended"); if (msg.scoreboard) setScoreboard(msg.scoreboard); break;
        case "error": console.error(msg.message); break;
      }
    };
    ws.onerror = () => setConnected(false);
    ws.onclose = () => setConnected(false);
    return () => { ws.close(); if (timerRef.current) clearInterval(timerRef.current); };
  }, [code]);

  const weekData = flashCardWeeks.find((w) => w.week === week);
  const cards = weekData?.cards || [];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <div className="bg-red-900/80 border-b border-red-700/40 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard"><button className="text-red-300 hover:text-white" title="Dashboard"><Home size={20} /></button></Link>
          <Link href="/games"><button className="text-red-300 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-red-800/50 hover:bg-red-700/50" title="All Games">All Games</button></Link>
          <span className="font-black text-lg text-yellow-400 tracking-widest">🃏 PICTURE KARUTA</span>
          {weekData && <span className="text-red-300 text-sm">Week {week}: {weekData.title}</span>}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-red-200"><Users size={18} /><span className="font-black text-lg">{studentCount}</span></div>
          <div className={`px-3 py-1 rounded-full text-xs font-black uppercase ${connected ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{connected ? "● LIVE" : "● OFF"}</div>
          <div className="bg-red-800 px-4 py-1 rounded-full font-black tracking-widest text-yellow-400">{code}</div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col p-6 gap-4">
          {phase === "lobby" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <div className="text-7xl">🃏</div>
              <h2 className="text-3xl font-black">Waiting for Students</h2>
              <p className="text-red-300">Code: <span className="font-black text-yellow-400 text-2xl tracking-widest">{code}</span></p>
              <div className="bg-white/5 rounded-2xl p-4 text-center">
                <div className="text-4xl font-black text-yellow-400">{studentCount}</div>
                <div className="text-red-300 text-sm">students joined</div>
              </div>
              {weekData && (
                <div className="text-center">
                  <div className="text-sm text-red-300 mb-2">Cards for this session:</div>
                  <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                    {weekData.cards.map((c) => (
                      <span key={c.word} className="bg-white/10 px-3 py-1 rounded-xl text-sm font-bold">{c.emoji} {c.word}</span>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={() => sendMsg({ type: "start_game" })}
                className="px-12 py-5 bg-yellow-400 hover:bg-yellow-300 text-red-900 rounded-2xl font-black text-xl transition-all shadow-2xl">
                Start Game
              </button>
            </div>
          )}

          {(phase === "calling" || phase === "grabbed") && (
            <div className="flex-1 flex flex-col gap-4">
              {/* Called card display */}
              {calledIndex !== null && cards[calledIndex] && (
                <div className="bg-gradient-to-br from-red-800/50 to-pink-900/40 rounded-3xl border border-red-500/30 p-6 text-center">
                  <div className="text-xs text-red-300 uppercase tracking-widest mb-2 font-black">Currently Called</div>
                  <div className="text-7xl mb-3">{cards[calledIndex].emoji}</div>
                  <div className="text-4xl font-black text-yellow-400 mb-2">{cards[calledIndex].word}</div>
                  <div className="text-red-200 text-sm">{cards[calledIndex].hint}</div>
                  {timer > 0 && phase === "calling" && (
                    <div className="mt-3 text-2xl font-black text-white">⏱ {timer}s</div>
                  )}
                </div>
              )}

              {/* Grabs list */}
              {grabs.length > 0 && (
                <div className="bg-white/5 rounded-2xl p-4">
                  <div className="text-xs font-black uppercase tracking-widest text-red-300 mb-3">Grabs</div>
                  <div className="space-y-1">
                    {grabs.map((g, i) => (
                      <div key={i} className={`flex items-center justify-between px-3 py-1.5 rounded-lg ${g.correct ? "bg-green-900/30 border border-green-700/30" : "bg-red-900/20"}`}>
                        <span className={`font-bold text-sm ${g.correct ? "text-green-400" : "text-red-400"}`}>{g.correct ? "✓" : "✗"} {g.studentName}</span>
                        <span className={`font-black text-sm ${g.correct ? "text-yellow-400" : "text-red-400"}`}>{g.points > 0 ? `+${g.points}` : g.points}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Board */}
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="text-xs font-black uppercase tracking-widest text-red-300 mb-3">
                  Board — {board.length} cards remaining
                </div>
                <div className="flex flex-wrap gap-2">
                  {cards.map((c, i) => (
                    <div key={i}
                      className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${!board.includes(i) ? "bg-white/5 text-white/20 line-through" : i === calledIndex && phase === "calling" ? "bg-yellow-400 text-red-900 shadow-lg" : "bg-white/15 text-white"}`}>
                      {c.emoji} {c.word}
                    </div>
                  ))}
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-3">
                {phase === "calling" && (
                  <button onClick={() => sendMsg({ type: "lock_card" })}
                    className="flex-1 py-4 bg-orange-500 hover:bg-orange-400 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all">
                    <Lock size={22} /> Lock Grabs
                  </button>
                )}
                {phase === "grabbed" && board.length > 0 && (
                  <button onClick={() => sendMsg({ type: "call_next" })}
                    className="flex-1 py-4 bg-red-500 hover:bg-red-400 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all">
                    <Volume2 size={22} /> Call Next Card
                  </button>
                )}
                {phase === "grabbed" && board.length === 0 && (
                  <button onClick={() => sendMsg({ type: "end_game" })}
                    className="flex-1 py-4 bg-yellow-400 hover:bg-yellow-300 text-red-900 rounded-2xl font-black text-lg transition-all">
                    All Cards Taken — View Results
                  </button>
                )}
                <button onClick={() => sendMsg({ type: "end_game" })}
                  className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black transition-all text-sm">
                  End
                </button>
              </div>
            </div>
          )}

          {phase === "ended" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <div className="text-6xl">🏆</div>
              <h2 className="text-3xl font-black text-yellow-400">Karuta Complete!</h2>
              {scoreboard[0] && <p className="text-red-200">Winner: <span className="font-black text-white">{scoreboard[0].name}</span> with {scoreboard[0].cardsWon} cards ({scoreboard[0].score} pts)</p>}
              <button onClick={() => setLoc("/game/karuta")} className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-red-900 rounded-2xl font-black">Play Again</button>
            </div>
          )}
        </div>

        {/* Scoreboard */}
        <div className="w-64 bg-red-950/60 border-l border-red-800/40 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-4"><Trophy size={18} className="text-yellow-400" /><span className="font-black text-sm uppercase tracking-widest text-red-200">Leaderboard</span></div>
          <div className="flex-1 space-y-2 overflow-y-auto">
            {scoreboard.slice(0, 12).map((s, i) => (
              <div key={s.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${i === 0 ? "bg-yellow-400/10 border border-yellow-400/30" : "bg-white/5"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? "bg-yellow-400 text-red-900" : i === 1 ? "bg-gray-300 text-gray-900" : i === 2 ? "bg-amber-600 text-white" : "bg-white/10 text-white/50"}`}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs truncate">{s.name}</div>
                  <div className="text-red-400 text-[10px]">{s.cardsWon} cards</div>
                </div>
                <div className="font-black text-yellow-400 text-xs">{s.score}</div>
              </div>
            ))}
            {scoreboard.length === 0 && <div className="text-center text-red-400 text-sm py-8">No scores yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
