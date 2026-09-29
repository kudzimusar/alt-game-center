import { useState, useEffect, useRef } from "react";
import GameNavBar from "@/components/GameNavBar";
type Phase="joining"|"waiting"|"question"|"revealed"|"ended";
export default function SpellingBeePlay(){
  const params=new URLSearchParams(window.location.search);
  const code=params.get("code")||""; const playerName=decodeURIComponent(params.get("name")||"Player"); const playerGroup=params.get("group")||"";
  const [phase,setPhase]=useState<Phase>("joining");
  const [emoji,setEmoji]=useState(""); const [hint,setHint]=useState(""); const [answer,setAnswer]=useState("");
  const [spelling,setSpelling]=useState(""); const [submitted,setSubmitted]=useState(false);
  const [result,setResult]=useState<{correct:boolean;points:number;correctWord:string}|null>(null);
  const [score,setScore]=useState(0); const [qNum,setQNum]=useState(1); const [totalQ,setTotalQ]=useState(10);
  const [timer,setTimer]=useState(0); const [finalScoreboard,setFinalScoreboard]=useState<{name:string;score:number;rank:number}[]>([]);
  const [error,setError]=useState<string|null>(null);
  const wsRef=useRef<WebSocket|null>(null); const timerRef=useRef<NodeJS.Timeout|null>(null);
  const inputRef=useRef<HTMLInputElement|null>(null);
  const startTimer=(s:number)=>{setTimer(s);if(timerRef.current)clearInterval(timerRef.current);timerRef.current=setInterval(()=>setTimer(t=>{if(t<=1){clearInterval(timerRef.current!);return 0;}return t-1;}),1000);};
  useEffect(()=>{
    if(!code||!playerName){setError("Missing info.");return;}
    const proto=window.location.protocol==="https:"?"wss":"ws";
    const ws=new WebSocket(`${proto}://${window.location.host}/ws/spelling-bee`);
    wsRef.current=ws;
    ws.onopen=()=>ws.send(JSON.stringify({type:"join",code,name:playerName,group:playerGroup||null}));
    ws.onmessage=(e)=>{
      const msg=JSON.parse(e.data);
      switch(msg.type){
        case "joined":setPhase("waiting");setTotalQ(msg.totalQuestions||10);break;
        case "question_started":setPhase("question");setEmoji(msg.emoji);setHint(msg.hint);setQNum(msg.qIndex+1);setSpelling("");setSubmitted(false);setResult(null);startTimer(msg.timeLimit||20);setTimeout(()=>inputRef.current?.focus(),100);break;
        case "answer_result":setResult({correct:msg.correct,points:msg.points||0,correctWord:msg.correctWord||""});if(msg.correct){setScore(s=>s+(msg.points||0));setSubmitted(true);}break;
        case "question_ended":setPhase("revealed");setAnswer(msg.answer||"");if(timerRef.current)clearInterval(timerRef.current);break;
        case "game_over":setPhase("ended");setFinalScoreboard(msg.scoreboard||[]);break;
        case "error":setError(msg.message);break;
      }
    };
    ws.onerror=()=>setError("Connection lost.");
    return()=>{ws.close();if(timerRef.current)clearInterval(timerRef.current);};
  },[code]);
  const submit=()=>{
    if(!spelling.trim()||submitted) return;
    if(wsRef.current?.readyState===1) wsRef.current.send(JSON.stringify({type:"submit_answer",answer:spelling.trim()}));
  };
  if(error) return <div className="min-h-screen bg-amber-950 flex items-center justify-center"><div className="text-center text-white"><div className="text-6xl mb-4">⚠️</div><div className="font-black text-xl mb-4">{error}</div><button onClick={()=>window.location.href=`/game/spelling-bee/join?code=${code}`} className="px-6 py-3 bg-yellow-400 text-amber-900 rounded-xl font-black">Rejoin</button></div></div>;
  if(phase==="joining") return <div className="min-h-screen bg-amber-950 flex items-center justify-center"><div className="text-center text-white"><div className="text-5xl mb-4 animate-pulse">🐝</div><div className="font-black text-xl">Connecting…</div></div></div>;
  if(phase==="waiting") return <div className="min-h-screen bg-gradient-to-br from-amber-500 to-yellow-700 flex items-center justify-center"><div className="text-center text-white"><div className="text-7xl mb-6 animate-bounce">🐝</div><h2 className="text-3xl font-black mb-2">Ready to Spell, {playerName}!</h2><p className="text-amber-100">Waiting for the teacher…</p></div></div>;
  if(phase==="ended"){
    const myRank=finalScoreboard.findIndex(s=>s.name===playerName)+1;
    return <div className="min-h-screen bg-gradient-to-br from-amber-600 to-orange-900 flex flex-col items-center justify-center p-4 text-white">
      <div className="text-6xl mb-4">🏆</div><h2 className="text-3xl font-black text-yellow-400 mb-2">Spelling Bee Over!</h2>
      <p className="text-amber-200 mb-6">Final score: <span className="font-black text-white">{score}</span> pts</p>
      {myRank>0&&<div className="bg-white/10 rounded-2xl px-8 py-3 mb-6 text-center"><div className="text-sm text-amber-300 uppercase">Your Rank</div><div className="text-4xl font-black text-yellow-400">#{myRank}</div></div>}
      <div className="w-full max-w-sm space-y-2">{finalScoreboard.slice(0,5).map((s,i)=><div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${s.name===playerName?"bg-yellow-400/20 border border-yellow-400/50":"bg-white/10"}`}><div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${i===0?"bg-yellow-400 text-amber-900":"bg-white/20"}`}>{i+1}</div><div className="flex-1 font-bold">{s.name}</div><div className="font-black text-yellow-400">{s.score}</div></div>)}</div>
      <button onClick={()=>window.location.href=`/game/spelling-bee/join?code=${code}`} className="mt-8 px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-amber-900 rounded-2xl font-black">Play Again</button>
    </div>;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-600 to-orange-900 flex flex-col text-white">
      <GameNavBar />
      <div className="flex-1 flex flex-col p-4"><div className="flex items-center justify-between mb-3">
        <div className="text-sm font-bold text-amber-200">{playerName} • Word {qNum}/{totalQ}</div>
        <div className="flex items-center gap-3">{timer>0&&phase==="question"&&<div className={`font-black text-lg ${timer<=5?"text-red-400 animate-pulse":"text-yellow-400"}`}>⏱{timer}s</div>}<div className="bg-white/10 rounded-xl px-3 py-1 font-black text-yellow-400">{score} pts</div></div>
      </div>
      <div className="text-9xl text-center my-6">{emoji}</div>
      <div className="bg-amber-900/40 rounded-2xl px-4 py-3 text-center text-amber-200 text-sm mb-4 border border-amber-500/20">{hint}</div>
      {phase==="revealed"&&<div className="bg-yellow-400/20 rounded-2xl px-4 py-3 text-center mb-4 border border-yellow-400/30"><div className="text-xs text-yellow-400 font-black uppercase tracking-widest mb-1">Correct spelling:</div><div className="text-3xl font-black text-yellow-300 tracking-widest">{answer}</div></div>}
      {result&&<div className={`rounded-xl px-4 py-2 text-center mb-3 font-black text-sm ${result.correct?"bg-green-800/50 text-green-300":"bg-red-800/50 text-red-300"}`}>{result.correct?`🐝 Correct! +${result.points} pts`:`❌ Incorrect — try again!`}</div>}
      {phase==="question"&&!submitted&&(
        <div className="flex gap-2 mt-auto">
          <input ref={inputRef} type="text" value={spelling} onChange={e=>setSpelling(e.target.value.replace(/[^a-zA-Z]/g,""))} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="Type your spelling…" className="flex-1 bg-white/10 border-2 border-amber-500/30 rounded-2xl px-4 py-4 text-white font-black text-xl tracking-widest placeholder-white/30 focus:outline-none focus:border-yellow-400"/>
          <button onClick={submit} disabled={!spelling.trim()} className="px-6 py-4 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-amber-900 rounded-2xl font-black text-xl">→</button>
        </div>
      )}
      {submitted&&phase==="question"&&<div className="mt-auto bg-yellow-400/20 rounded-2xl px-4 py-3 text-center text-yellow-400 font-black">✓ Submitted — waiting for reveal…</div>}
    </div></div>
  );
}
