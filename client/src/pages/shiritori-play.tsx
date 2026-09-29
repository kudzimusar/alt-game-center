import { useState, useEffect, useRef } from "react";
import GameNavBar from "@/components/GameNavBar";

type Phase = "joining" | "waiting" | "playing" | "ended";

export default function ShiritoriPlay() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code") || "";
  const playerName = decodeURIComponent(params.get("name") || "Player");
  const playerGroup = params.get("group") || "";

  const [phase, setPhase] = useState<Phase>("joining");
  const [currentLetter, setCurrentLetter] = useState("A");
  const [chain, setChain] = useState<{ word: string; studentName: string; valid: boolean }[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [word, setWord] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [lastResult, setLastResult] = useState<{ valid: boolean; points: number; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [finalScoreboard, setFinalScoreboard] = useState<{ name: string; score: number; rank: number }[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!code || !playerName) { setError("Missing info."); return; }
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${proto}://${window.location.host}/ws/shiritori`);
    wsRef.current = ws;
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", code, name: playerName, group: playerGroup || null }));
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      switch (msg.type) {
        case "joined": setPhase("waiting"); break;
        case "game_started": setPhase("playing"); setCurrentLetter(msg.startLetter); break;
        case "chain_update": setChain(msg.chain || []); setCurrentLetter(msg.currentLetter); setSubmitted(false); setWord(""); setTimeout(() => inputRef.current?.focus(), 100); break;
        case "word_result": setLastResult({ valid: msg.valid, points: msg.points || 0, message: msg.message }); if (msg.valid) { setScore(s => s + (msg.points || 0)); setStreak(s => s + 1); } else { setStreak(0); } setSubmitted(false); setTimeout(() => inputRef.current?.focus(), 100); break;
        case "game_over": setPhase("ended"); setFinalScoreboard(msg.scoreboard || []); break;
        case "error": setError(msg.message); break;
      }
    };
    ws.onerror = () => setError("Connection lost.");
    return () => ws.close();
  }, [code]);

  const submitWord = () => {
    if (!word.trim() || submitted) return;
    if (!word.trim().toLowerCase().startsWith(currentLetter.toLowerCase())) {
      setLastResult({ valid: false, points: 0, message: `Must start with "${currentLetter.toUpperCase()}"!` });
      return;
    }
    setSubmitted(true);
    if (wsRef.current?.readyState === 1) wsRef.current.send(JSON.stringify({ type: "submit_word", word: word.trim() }));
  };

  if (error) return <div className="min-h-screen bg-emerald-950 flex items-center justify-center"><div className="text-center text-white"><div className="text-6xl mb-4">⚠️</div><div className="font-black text-xl mb-4">{error}</div><button onClick={() => window.location.href = `/game/shiritori/join?code=${code}`} className="px-6 py-3 bg-yellow-400 text-emerald-900 rounded-xl font-black">Rejoin</button></div></div>;
  if (phase === "joining") return <div className="min-h-screen bg-emerald-950 flex items-center justify-center"><div className="text-center text-white"><div className="text-5xl mb-4 animate-pulse">🔗</div><div className="font-black text-xl">Connecting…</div></div></div>;
  if (phase === "waiting") return <div className="min-h-screen bg-gradient-to-br from-emerald-700 to-teal-900 flex items-center justify-center"><div className="text-center text-white"><div className="text-7xl mb-6 animate-bounce">🔗</div><h2 className="text-3xl font-black mb-2">Ready, {playerName}!</h2><p className="text-emerald-200">Waiting for the teacher to start…</p></div></div>;
  if (phase === "ended") {
    const myRank = finalScoreboard.findIndex(s => s.name === playerName) + 1;
    return <div className="min-h-screen bg-gradient-to-br from-emerald-800 to-teal-950 flex flex-col items-center justify-center p-4 text-white">
      <div className="text-6xl mb-4">🏆</div>
      <h2 className="text-3xl font-black text-yellow-400 mb-2">Chain Complete!</h2>
      <p className="text-emerald-200 mb-6">You scored <span className="font-black text-white">{score}</span> points!</p>
      {myRank > 0 && <div className="bg-white/10 rounded-2xl px-8 py-3 mb-6"><div className="text-sm text-emerald-300 uppercase text-center">Your Rank</div><div className="text-4xl font-black text-yellow-400 text-center">#{myRank}</div></div>}
      <div className="w-full max-w-sm space-y-2">
        {finalScoreboard.slice(0, 5).map((s, i) => <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${s.name === playerName ? "bg-yellow-400/20 border border-yellow-400/50" : "bg-white/10"}`}><div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? "bg-yellow-400 text-emerald-900" : "bg-white/20"}`}>{i+1}</div><div className="flex-1 font-bold">{s.name}</div><div className="font-black text-yellow-400">{s.score}</div></div>)}
      </div>
      <button onClick={() => window.location.href = `/game/shiritori/join?code=${code}`} className="mt-8 px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-emerald-900 rounded-2xl font-black">Play Again</button>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-800 to-teal-950 flex flex-col text-white">
      <GameNavBar />
      <div className="flex-1 flex flex-col p-4"><div className="flex items-center justify-between mb-4">
        <div className="text-sm font-bold text-emerald-300">{playerName}</div>
        <div className="flex items-center gap-3">
          {streak >= 3 && <span className="text-orange-400 font-black">🔥 {streak}</span>}
          <div className="bg-white/10 rounded-xl px-3 py-1 font-black text-yellow-400">{score} pts</div>
        </div>
      </div>

      <div className="bg-emerald-900/40 rounded-2xl p-4 border border-emerald-500/30 text-center mb-4">
        <div className="text-xs font-black text-emerald-300 uppercase tracking-widest mb-1">Next word must start with</div>
        <div className="text-7xl font-black text-yellow-400">{currentLetter.toUpperCase()}</div>
      </div>

      {lastResult && (
        <div className={`rounded-xl px-4 py-2 text-center mb-3 font-black text-sm ${lastResult.valid ? "bg-green-800/50 text-green-300" : "bg-red-800/50 text-red-300"}`}>
          {lastResult.valid ? `✅ ${lastResult.message || "Correct!"} +${lastResult.points} pts` : `❌ ${lastResult.message || "Invalid!"}`}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <input ref={inputRef} type="text" value={word} onChange={e => setWord(e.target.value.replace(/[^a-zA-Z]/g, ""))}
          onKeyDown={e => e.key === "Enter" && submitWord()} placeholder={`Word starting with "${currentLetter.toUpperCase()}"...`}
          className="flex-1 bg-white/10 border-2 border-emerald-500/30 rounded-2xl px-4 py-4 text-white font-black text-xl placeholder-white/30 focus:outline-none focus:border-yellow-400" disabled={submitted} />
        <button onClick={submitWord} disabled={!word.trim() || submitted} className="px-6 py-4 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-emerald-900 rounded-2xl font-black text-xl transition-all">
          {submitted ? "⏳" : "→"}
        </button>
      </div>

      <div className="flex-1 bg-white/5 rounded-2xl p-4 overflow-y-auto">
        <div className="text-xs font-black text-emerald-300 uppercase tracking-widest mb-3">Chain ({chain.length} words)</div>
        <div className="flex flex-wrap gap-2">
          {chain.map((c, i) => <div key={i} className={`px-3 py-1 rounded-xl text-sm font-bold ${c.valid ? "bg-emerald-900/40 text-emerald-200" : "bg-red-900/20 text-red-400 line-through"}`}>{c.word}</div>)}
          {chain.length === 0 && <div className="text-emerald-500 text-sm">Waiting for first word…</div>}
        </div>
      </div>
    </div></div>
  );
}
