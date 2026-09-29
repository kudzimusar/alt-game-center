import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, Link } from "wouter";
import { Trophy, Users, Home, Check, X } from "lucide-react";
import { flashCardWeeks } from "@/lib/flash-cards/flash-card-weeks";

interface ChainEntry { word: string; studentName: string; startLetter: string; valid: boolean; }
interface ScoreEntry { id: string; name: string; score: number; streak: number; rank: number; }

export default function ShiritoriHost() {
  const code = new URLSearchParams(window.location.search).get("code") || "";
  const [, setLoc] = useLocation();
  const [phase, setPhase] = useState<"lobby" | "playing" | "ended">("lobby");
  const [studentCount, setStudentCount] = useState(0);
  const [week, setWeek] = useState(1);
  const [chain, setChain] = useState<ChainEntry[]>([]);
  const [currentLetter, setCurrentLetter] = useState("A");
  const [pending, setPending] = useState<{ studentId: string; studentName: string; word: string; id: string }[]>([]);
  const [scoreboard, setScoreboard] = useState<ScoreEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const [timer, setTimer] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const send = useCallback((msg: object) => { if (wsRef.current?.readyState === 1) wsRef.current.send(JSON.stringify(msg)); }, []);

  useEffect(() => {
    if (!code) return;
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${proto}://${window.location.host}/ws/shiritori`);
    wsRef.current = ws;
    ws.onopen = () => { setConnected(true); ws.send(JSON.stringify({ type: "host_connect", code })); };
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      switch (msg.type) {
        case "host_reconnected": setPhase(msg.phase); setStudentCount(msg.studentCount); setWeek(msg.week); setChain(msg.chain || []); setCurrentLetter(msg.currentLetter || "A"); if (msg.scoreboard) setScoreboard(msg.scoreboard); break;
        case "student_joined": setStudentCount(msg.count); break;
        case "student_left": setStudentCount(msg.count); break;
        case "game_started": setPhase("playing"); setCurrentLetter(msg.startLetter); break;
        case "word_submitted": setPending(prev => [...prev, msg]); break;
        case "word_validated": setPending(prev => prev.filter(p => p.id !== msg.submissionId)); setChain(prev => [...prev, { word: msg.word, studentName: msg.studentName, startLetter: msg.startLetter, valid: msg.valid }]); if (msg.valid) setCurrentLetter(msg.nextLetter); if (msg.scoreboard) setScoreboard(msg.scoreboard); break;
        case "game_over": setPhase("ended"); if (msg.scoreboard) setScoreboard(msg.scoreboard); break;
      }
    };
    ws.onerror = () => setConnected(false);
    ws.onclose = () => setConnected(false);
    return () => ws.close();
  }, [code]);

  const weekData = flashCardWeeks.find(w => w.week === week);
  const validWords = weekData?.cards.map(c => c.word.toLowerCase()) || [];

  const approve = (id: string, word: string, studentId: string) => send({ type: "validate_word", submissionId: id, word, studentId, valid: true });
  const reject = (id: string, word: string, studentId: string) => send({ type: "validate_word", submissionId: id, word, studentId, valid: false });

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <div className="bg-emerald-900/80 border-b border-emerald-700/40 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard"><button className="text-emerald-300 hover:text-white" title="Dashboard"><Home size={20} /></button></Link>
          <Link href="/games"><button className="text-emerald-300 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-emerald-800/50 hover:bg-emerald-700/50" title="All Games">All Games</button></Link>
          <span className="font-black text-lg text-yellow-400 tracking-widest">🔗 SHIRITORI CHAIN</span>
          {weekData && <span className="text-emerald-300 text-sm">Week {week}: {weekData.title}</span>}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-emerald-200"><Users size={18} /><span className="font-black text-lg">{studentCount}</span></div>
          <div className={`px-3 py-1 rounded-full text-xs font-black ${connected ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{connected ? "● LIVE" : "● OFF"}</div>
          <div className="bg-emerald-800 px-4 py-1 rounded-full font-black tracking-widest text-yellow-400">{code}</div>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col p-6 gap-4">
          {phase === "lobby" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <div className="text-7xl">🔗</div>
              <h2 className="text-3xl font-black">Waiting for Students</h2>
              <div className="bg-white/5 rounded-2xl p-4 text-center"><div className="text-4xl font-black text-yellow-400">{studentCount}</div><div className="text-emerald-300 text-sm">students joined</div></div>
              {weekData && <div className="text-center"><div className="text-sm text-emerald-300 mb-2">Valid words this session:</div><div className="flex flex-wrap gap-2 justify-center max-w-md">{weekData.cards.map(c => <span key={c.word} className="bg-white/10 px-3 py-1 rounded-xl text-sm font-bold">{c.emoji} {c.word}</span>)}</div></div>}
              <button onClick={() => send({ type: "start_game" })} className="px-12 py-5 bg-yellow-400 hover:bg-yellow-300 text-emerald-900 rounded-2xl font-black text-xl shadow-2xl">Start Chain!</button>
            </div>
          )}
          {phase === "playing" && (
            <div className="flex-1 flex flex-col gap-4">
              <div className="bg-emerald-900/40 rounded-2xl p-4 border border-emerald-500/30 text-center">
                <div className="text-xs font-black text-emerald-300 uppercase tracking-widest mb-1">Next word must start with</div>
                <div className="text-6xl font-black text-yellow-400">{currentLetter.toUpperCase()}</div>
              </div>
              {pending.length > 0 && (
                <div className="bg-white/5 rounded-2xl p-4">
                  <div className="text-xs font-black text-emerald-300 uppercase tracking-widest mb-3">⏳ Pending — Approve or Reject</div>
                  <div className="space-y-2">
                    {pending.map(p => (
                      <div key={p.id} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2">
                        <span className="font-bold text-yellow-400 text-lg tracking-wider">{p.word.toUpperCase()}</span>
                        <span className="text-emerald-300 text-sm">by {p.studentName}</span>
                        <span className={`ml-auto text-xs font-black ${p.word.toLowerCase().startsWith(currentLetter.toLowerCase()) ? "text-green-400" : "text-red-400"}`}>{p.word.toLowerCase().startsWith(currentLetter.toLowerCase()) ? "✓ Correct letter" : "✗ Wrong letter"}</span>
                        <button onClick={() => approve(p.id, p.word, p.studentId)} className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded-lg font-black text-sm"><Check size={14} /></button>
                        <button onClick={() => reject(p.id, p.word, p.studentId)} className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded-lg font-black text-sm"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex-1 bg-white/5 rounded-2xl p-4 overflow-y-auto">
                <div className="text-xs font-black text-emerald-300 uppercase tracking-widest mb-3">Chain ({chain.length} words)</div>
                <div className="flex flex-wrap gap-2">
                  {chain.map((c, i) => (
                    <div key={i} className={`px-3 py-1 rounded-xl text-sm font-bold border ${c.valid ? "bg-emerald-900/30 border-emerald-500/30 text-emerald-200" : "bg-red-900/20 border-red-500/20 text-red-400 line-through"}`}>
                      {c.word} <span className="text-[10px] opacity-60">({c.studentName})</span>
                    </div>
                  ))}
                  {chain.length === 0 && <div className="text-emerald-500 text-sm">No words yet — game just started!</div>}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => send({ type: "end_game" })} className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black">End Game</button>
              </div>
            </div>
          )}
          {phase === "ended" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <div className="text-6xl">🏆</div>
              <h2 className="text-3xl font-black text-yellow-400">Chain Complete!</h2>
              <p className="text-emerald-200">Total words in chain: <span className="font-black text-white">{chain.filter(c => c.valid).length}</span></p>
              {scoreboard[0] && <p className="text-emerald-200">Winner: <span className="font-black text-white">{scoreboard[0].name}</span> ({scoreboard[0].score} pts)</p>}
              <button onClick={() => setLoc("/game/shiritori")} className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-emerald-900 rounded-2xl font-black">Play Again</button>
            </div>
          )}
        </div>
        <div className="w-64 bg-emerald-950/60 border-l border-emerald-800/40 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-4"><Trophy size={18} className="text-yellow-400" /><span className="font-black text-sm uppercase tracking-widest text-emerald-200">Leaderboard</span></div>
          <div className="flex-1 space-y-2 overflow-y-auto">
            {scoreboard.slice(0, 12).map((s, i) => (
              <div key={s.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${i === 0 ? "bg-yellow-400/10 border border-yellow-400/30" : "bg-white/5"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? "bg-yellow-400 text-emerald-900" : i === 1 ? "bg-gray-300 text-gray-900" : i === 2 ? "bg-amber-600 text-white" : "bg-white/10 text-white/50"}`}>{i + 1}</div>
                <div className="flex-1 min-w-0"><div className="font-bold text-xs truncate">{s.name}</div></div>
                <div className="font-black text-yellow-400 text-xs">{s.score}</div>
              </div>
            ))}
            {scoreboard.length === 0 && <div className="text-center text-emerald-400 text-sm py-8">No scores yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
