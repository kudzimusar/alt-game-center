import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, Link } from "wouter";
import { Trophy, Users, Home, Eye, ChevronRight } from "lucide-react";
import { flashCardWeeks } from "@/lib/flash-cards/flash-card-weeks";

interface Guess { studentName: string; guess: string; correct: boolean; points: number; clueLevel: number; }
interface ScoreEntry { id: string; name: string; score: number; rank: number; }

export default function MysteryBoxHost() {
  const code = new URLSearchParams(window.location.search).get("code") || "";
  const [, setLoc] = useLocation();
  const [phase, setPhase] = useState<"lobby"|"clue1"|"clue2"|"clue3"|"revealed"|"ended">("lobby");
  const [studentCount, setStudentCount] = useState(0);
  const [week, setWeek] = useState(1);
  const [itemIndex, setItemIndex] = useState(0);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [scoreboard, setScoreboard] = useState<ScoreEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const [winner, setWinner] = useState<string|null>(null);
  const wsRef = useRef<WebSocket|null>(null);
  const send = useCallback((msg: object) => { if(wsRef.current?.readyState===1) wsRef.current.send(JSON.stringify(msg)); },[]);

  useEffect(() => {
    if(!code) return;
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${proto}://${window.location.host}/ws/mystery-box`);
    wsRef.current = ws;
    ws.onopen = () => { setConnected(true); ws.send(JSON.stringify({ type:"host_connect", code })); };
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      switch(msg.type) {
        case "host_reconnected": setPhase(msg.phase); setStudentCount(msg.studentCount); setWeek(msg.week); setItemIndex(msg.itemIndex||0); if(msg.scoreboard) setScoreboard(msg.scoreboard); break;
        case "student_joined": setStudentCount(msg.count); break;
        case "student_left": setStudentCount(msg.count); break;
        case "clue_revealed": setPhase(msg.clueLevel==="clue1"?"clue1":msg.clueLevel==="clue2"?"clue2":"clue3"); setGuesses([]); setWinner(null); break;
        case "guess_in": setGuesses(prev=>[...prev,msg]); if(msg.correct && !winner) setWinner(msg.studentName); break;
        case "box_revealed": setPhase("revealed"); if(msg.scoreboard) setScoreboard(msg.scoreboard); break;
        case "game_over": setPhase("ended"); if(msg.scoreboard) setScoreboard(msg.scoreboard); break;
      }
    };
    ws.onerror = () => setConnected(false);
    ws.onclose = () => setConnected(false);
    return () => ws.close();
  }, [code]);

  const weekData = flashCardWeeks.find(w => w.week === week);
  const items = weekData?.cards || [];
  const currentItem = items[itemIndex];
  const clueNum = phase==="clue1"?1:phase==="clue2"?2:phase==="clue3"?3:0;

  const makeClues = (item: typeof currentItem) => item ? [
    `It is a ${weekData?.topic?.toLowerCase() || "word"} word.`,
    item.hint,
    `It starts with the letter "${item.word[0].toUpperCase()}" and has ${item.word.length} letters.`
  ] : [];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <div className="bg-purple-900/80 border-b border-purple-700/40 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard"><button className="text-purple-300 hover:text-white" title="Dashboard"><Home size={20}/></button></Link>
          <Link href="/games"><button className="text-purple-300 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-purple-800/50 hover:bg-purple-700/50" title="All Games">All Games</button></Link>
          <span className="font-black text-lg text-yellow-400 tracking-widest">📦 MYSTERY BOX</span>
          {weekData && <span className="text-purple-300 text-sm">Week {week}: {weekData.title}</span>}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-purple-200"><Users size={18}/><span className="font-black text-lg">{studentCount}</span></div>
          <div className={`px-3 py-1 rounded-full text-xs font-black ${connected?"bg-green-500/20 text-green-400":"bg-red-500/20 text-red-400"}`}>{connected?"● LIVE":"● OFF"}</div>
          <div className="bg-purple-800 px-4 py-1 rounded-full font-black tracking-widest text-yellow-400">{code}</div>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col p-6 gap-4">
          {phase==="lobby" && (
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <div className="text-7xl">📦</div>
              <h2 className="text-3xl font-black">Waiting for Students</h2>
              <div className="bg-white/5 rounded-2xl p-4 text-center"><div className="text-4xl font-black text-yellow-400">{studentCount}</div><div className="text-purple-300 text-sm">students joined</div></div>
              {weekData && <div className="text-center"><div className="text-sm text-purple-300 mb-2">Mystery items ({items.length} boxes):</div><div className="flex flex-wrap gap-2 justify-center max-w-md">{items.map(c => <span key={c.word} className="bg-purple-800/40 px-3 py-1 rounded-xl text-sm font-bold">{c.emoji} ?</span>)}</div></div>}
              <button onClick={() => send({type:"start_game"})} className="px-12 py-5 bg-yellow-400 hover:bg-yellow-300 text-purple-900 rounded-2xl font-black text-xl shadow-2xl">Open First Box!</button>
            </div>
          )}
          {(phase==="clue1"||phase==="clue2"||phase==="clue3"||phase==="revealed") && currentItem && (
            <div className="flex-1 flex flex-col gap-4">
              <div className="bg-gradient-to-br from-purple-800/50 to-indigo-900/40 rounded-3xl border border-purple-500/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs text-purple-300 uppercase tracking-widest font-black">Box {itemIndex+1} of {items.length}</div>
                  {phase!=="revealed" && <div className="px-3 py-1 bg-yellow-400/20 rounded-full text-yellow-400 font-black text-sm">Clue {clueNum} of 3</div>}
                </div>
                <div className="text-7xl text-center mb-4">{phase==="revealed"?currentItem.emoji:"📦"}</div>
                {phase==="revealed" && <div className="text-4xl font-black text-yellow-400 text-center mb-2">{currentItem.word}</div>}
                <div className="space-y-2">
                  {makeClues(currentItem).map((clue, i) => (
                    <div key={i} className={`px-4 py-2 rounded-xl text-sm transition-all ${i < clueNum || phase==="revealed" ? "bg-white/10 text-white" : "bg-white/5 text-white/20"}`}>
                      <span className="font-black text-purple-300 mr-2">Clue {i+1}:</span>{i < clueNum || phase==="revealed" ? clue : "???"}
                    </div>
                  ))}
                </div>
              </div>
              {guesses.length > 0 && <div className="bg-white/5 rounded-2xl p-4">
                <div className="text-xs font-black text-purple-300 uppercase tracking-widest mb-3">Guesses</div>
                <div className="space-y-1">
                  {guesses.slice(-6).map((g,i) => <div key={i} className={`flex items-center justify-between px-3 py-1.5 rounded-lg ${g.correct?"bg-green-900/30 border border-green-700/30":"bg-red-900/20"}`}>
                    <span className={`font-bold text-sm ${g.correct?"text-green-400":"text-red-400"}`}>{g.correct?"✓":"✗"} {g.studentName}: {g.guess}</span>
                    {g.correct && <span className="font-black text-sm text-yellow-400">+{g.points}</span>}
                  </div>)}
                </div>
              </div>}
              <div className="flex gap-3">
                {phase==="clue1" && <button onClick={() => send({type:"reveal_clue",clueLevel:"clue2"})} className="flex-1 py-4 bg-purple-500 hover:bg-purple-400 rounded-2xl font-black text-lg flex items-center justify-center gap-2"><Eye size={22}/> Show Clue 2</button>}
                {phase==="clue2" && <button onClick={() => send({type:"reveal_clue",clueLevel:"clue3"})} className="flex-1 py-4 bg-purple-500 hover:bg-purple-400 rounded-2xl font-black text-lg flex items-center justify-center gap-2"><Eye size={22}/> Show Clue 3</button>}
                {(phase==="clue1"||phase==="clue2"||phase==="clue3") && <button onClick={() => send({type:"reveal_answer"})} className="flex-1 py-4 bg-yellow-400 hover:bg-yellow-300 text-purple-900 rounded-2xl font-black text-lg">Reveal Answer</button>}
                {phase==="revealed" && itemIndex < items.length-1 && <button onClick={() => send({type:"next_box"})} className="flex-1 py-4 bg-purple-500 hover:bg-purple-400 rounded-2xl font-black text-lg flex items-center justify-center gap-2"><ChevronRight size={22}/> Next Box</button>}
                {phase==="revealed" && itemIndex >= items.length-1 && <button onClick={() => send({type:"end_game"})} className="flex-1 py-4 bg-yellow-400 hover:bg-yellow-300 text-purple-900 rounded-2xl font-black text-lg">All Done — Scores!</button>}
                <button onClick={() => send({type:"end_game"})} className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-sm">End</button>
              </div>
            </div>
          )}
          {phase==="ended" && <div className="flex-1 flex flex-col items-center justify-center gap-6"><div className="text-6xl">🏆</div><h2 className="text-3xl font-black text-yellow-400">All Boxes Opened!</h2>{scoreboard[0]&&<p className="text-purple-200">Winner: <span className="font-black text-white">{scoreboard[0].name}</span> ({scoreboard[0].score} pts)</p>}<button onClick={() => setLoc("/game/mystery-box")} className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-purple-900 rounded-2xl font-black">Play Again</button></div>}
        </div>
        <div className="w-64 bg-purple-950/60 border-l border-purple-800/40 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-4"><Trophy size={18} className="text-yellow-400"/><span className="font-black text-sm uppercase tracking-widest text-purple-200">Leaderboard</span></div>
          <div className="flex-1 space-y-2 overflow-y-auto">
            {scoreboard.slice(0,12).map((s,i) => <div key={s.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${i===0?"bg-yellow-400/10 border border-yellow-400/30":"bg-white/5"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${i===0?"bg-yellow-400 text-purple-900":i===1?"bg-gray-300 text-gray-900":i===2?"bg-amber-600 text-white":"bg-white/10 text-white/50"}`}>{i+1}</div>
              <div className="flex-1 min-w-0"><div className="font-bold text-xs truncate">{s.name}</div></div>
              <div className="font-black text-yellow-400 text-xs">{s.score}</div>
            </div>)}
            {scoreboard.length===0 && <div className="text-center text-purple-400 text-sm py-8">No scores yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
