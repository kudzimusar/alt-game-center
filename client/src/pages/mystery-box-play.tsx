import { useState, useEffect, useRef } from "react";
import GameNavBar from "@/components/GameNavBar";
type Phase = "joining"|"waiting"|"clue"|"revealed"|"ended";
export default function MysteryBoxPlay() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code")||"";
  const playerName = decodeURIComponent(params.get("name")||"Player");
  const playerGroup = params.get("group")||"";
  const [phase,setPhase] = useState<Phase>("joining");
  const [clues,setClues] = useState<string[]>([]);
  const [clueCount,setClueCount] = useState(0);
  const [answer,setAnswer] = useState("");
  const [guess,setGuess] = useState("");
  const [submitted,setSubmitted] = useState(false);
  const [result,setResult] = useState<{correct:boolean;points:number;message:string}|null>(null);
  const [score,setScore] = useState(0);
  const [boxNum,setBoxNum] = useState(1);
  const [totalBoxes,setTotalBoxes] = useState(5);
  const [finalScoreboard,setFinalScoreboard] = useState<{name:string;score:number;rank:number}[]>([]);
  const [error,setError] = useState<string|null>(null);
  const wsRef = useRef<WebSocket|null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(()=>{
    if(!code||!playerName){setError("Missing info.");return;}
    const proto = window.location.protocol==="https:"?"wss":"ws";
    const ws = new WebSocket(`${proto}://${window.location.host}/ws/mystery-box`);
    wsRef.current=ws;
    ws.onopen=()=>ws.send(JSON.stringify({type:"join",code,name:playerName,group:playerGroup||null}));
    ws.onmessage=(e)=>{
      const msg=JSON.parse(e.data);
      switch(msg.type){
        case "joined": setPhase("waiting"); setTotalBoxes(msg.totalBoxes||5); break;
        case "game_started": setPhase("waiting"); break;
        case "clue_revealed": setPhase("clue"); setClues(msg.clues||[]); setClueCount(msg.clueCount||1); setBoxNum(msg.boxNum||1); setSubmitted(false); setGuess(""); setResult(null); setTimeout(()=>inputRef.current?.focus(),100); break;
        case "guess_result": setResult({correct:msg.correct,points:msg.points||0,message:msg.message}); if(msg.correct){setScore(s=>s+msg.points||0);setSubmitted(true);} break;
        case "box_revealed": setPhase("revealed"); setAnswer(msg.answer||""); break;
        case "game_over": setPhase("ended"); setFinalScoreboard(msg.scoreboard||[]); break;
        case "error": setError(msg.message); break;
      }
    };
    ws.onerror=()=>setError("Connection lost.");
    return ()=>ws.close();
  },[code]);
  const submitGuess = ()=>{
    if(!guess.trim()||submitted) return;
    if(wsRef.current?.readyState===1) wsRef.current.send(JSON.stringify({type:"submit_guess",guess:guess.trim()}));
  };
  if(error) return <div className="min-h-screen bg-purple-950 flex items-center justify-center"><div className="text-center text-white"><div className="text-6xl mb-4">⚠️</div><div className="font-black text-xl mb-4">{error}</div><button onClick={()=>window.location.href=`/game/mystery-box/join?code=${code}`} className="px-6 py-3 bg-yellow-400 text-purple-900 rounded-xl font-black">Rejoin</button></div></div>;
  if(phase==="joining") return <div className="min-h-screen bg-purple-950 flex items-center justify-center"><div className="text-center text-white"><div className="text-5xl mb-4 animate-pulse">📦</div><div className="font-black text-xl">Connecting…</div></div></div>;
  if(phase==="waiting") return <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 flex items-center justify-center"><div className="text-center text-white"><div className="text-7xl mb-6 animate-bounce">📦</div><h2 className="text-3xl font-black mb-2">Ready, {playerName}!</h2><p className="text-purple-200">Waiting for the teacher to open the first box…</p></div></div>;
  if(phase==="ended"){
    const myRank=finalScoreboard.findIndex(s=>s.name===playerName)+1;
    return <div className="min-h-screen bg-gradient-to-br from-purple-800 to-indigo-950 flex flex-col items-center justify-center p-4 text-white">
      <div className="text-6xl mb-4">🏆</div><h2 className="text-3xl font-black text-yellow-400 mb-2">All Boxes Opened!</h2>
      <p className="text-purple-200 mb-6">You scored <span className="font-black text-white">{score}</span> points!</p>
      {myRank>0&&<div className="bg-white/10 rounded-2xl px-8 py-3 mb-6"><div className="text-sm text-purple-300 uppercase text-center">Your Rank</div><div className="text-4xl font-black text-yellow-400 text-center">#{myRank}</div></div>}
      <div className="w-full max-w-sm space-y-2">{finalScoreboard.slice(0,5).map((s,i)=><div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${s.name===playerName?"bg-yellow-400/20 border border-yellow-400/50":"bg-white/10"}`}><div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${i===0?"bg-yellow-400 text-purple-900":"bg-white/20"}`}>{i+1}</div><div className="flex-1 font-bold">{s.name}</div><div className="font-black text-yellow-400">{s.score}</div></div>)}</div>
      <button onClick={()=>window.location.href=`/game/mystery-box/join?code=${code}`} className="mt-8 px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-purple-900 rounded-2xl font-black">Play Again</button>
    </div>;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 to-indigo-950 flex flex-col text-white">
      <GameNavBar />
      <div className="flex-1 flex flex-col p-4"><div className="flex items-center justify-between mb-4">
        <div className="text-sm font-bold text-purple-300">{playerName} • Box {boxNum}/{totalBoxes}</div>
        <div className="bg-white/10 rounded-xl px-3 py-1 font-black text-yellow-400">{score} pts</div>
      </div>
      <div className="text-7xl text-center mb-4">{phase==="revealed"?"🎁":"📦"}</div>
      {phase==="revealed"&&answer&&<div className="text-center mb-4"><div className="text-xs text-purple-300 uppercase tracking-widest mb-1">The answer was</div><div className="text-3xl font-black text-yellow-400">{answer}</div></div>}
      <div className="space-y-3 mb-4">
        {clues.map((clue,i)=><div key={i} className="bg-white/10 rounded-2xl px-4 py-3 border border-purple-500/20">
          <div className="text-xs text-purple-300 font-black uppercase tracking-widest mb-1">Clue {i+1}</div>
          <div className="font-bold">{clue}</div>
        </div>)}
        {phase==="clue"&&Array.from({length:3-clues.length}).map((_,i)=><div key={i} className="bg-white/5 rounded-2xl px-4 py-3 border border-white/10 opacity-30"><div className="text-xs text-purple-400 font-black uppercase tracking-widest">Clue {clues.length+i+1} — Not yet revealed</div></div>)}
      </div>
      {result&&<div className={`rounded-xl px-4 py-2 text-center mb-3 font-black text-sm ${result.correct?"bg-green-800/50 text-green-300":"bg-red-800/50 text-red-300"}`}>{result.correct?`✅ Correct! +${result.points} pts`:`❌ ${result.message||"Wrong guess!"}`}</div>}
      {phase==="clue"&&!submitted&&(
        <div className="flex gap-2">
          <input ref={inputRef} type="text" value={guess} onChange={e=>setGuess(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submitGuess()} placeholder="Type your guess…" className="flex-1 bg-white/10 border-2 border-purple-500/30 rounded-2xl px-4 py-4 text-white font-bold placeholder-white/30 focus:outline-none focus:border-yellow-400"/>
          <button onClick={submitGuess} disabled={!guess.trim()} className="px-6 py-4 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-purple-900 rounded-2xl font-black text-xl">→</button>
        </div>
      )}
      {phase==="clue"&&submitted&&<div className="bg-yellow-400/20 rounded-2xl px-4 py-3 text-center text-yellow-400 font-black">✓ Answer submitted — waiting for next clue or reveal…</div>}
      {phase==="revealed"&&<div className="bg-white/10 rounded-2xl px-4 py-3 text-center text-purple-200 font-bold">Next box coming soon…</div>}
    </div></div>
  );
}
