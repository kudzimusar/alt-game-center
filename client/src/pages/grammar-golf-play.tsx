import { useState, useEffect, useRef } from "react";
import GameNavBar from "@/components/GameNavBar";
type Phase="joining"|"waiting"|"question"|"revealed"|"ended";
export default function GrammarGolfPlay(){
  const params=new URLSearchParams(window.location.search);
  const code=params.get("code")||""; const playerName=decodeURIComponent(params.get("name")||"Player"); const playerGroup=params.get("group")||"";
  const [phase,setPhase]=useState<Phase>("joining");
  const [sentence,setSentence]=useState(""); const [hint,setHint]=useState(""); const [options,setOptions]=useState<string[]>([]); const [blank,setBlank]=useState("");
  const [selected,setSelected]=useState<string|null>(null); const [attempt,setAttempt]=useState(0);
  const [result,setResult]=useState<{correct:boolean;points:number;message:string}|null>(null);
  const [score,setScore]=useState(0); const [qNum,setQNum]=useState(1); const [totalQ,setTotalQ]=useState(10);
  const [finalScoreboard,setFinalScoreboard]=useState<{name:string;score:number;rank:number}[]>([]);
  const [error,setError]=useState<string|null>(null);
  const wsRef=useRef<WebSocket|null>(null);
  useEffect(()=>{
    if(!code||!playerName){setError("Missing info.");return;}
    const proto=window.location.protocol==="https:"?"wss":"ws";
    const ws=new WebSocket(`${proto}://${window.location.host}/ws/grammar-golf`);
    wsRef.current=ws;
    ws.onopen=()=>ws.send(JSON.stringify({type:"join",code,name:playerName,group:playerGroup||null}));
    ws.onmessage=(e)=>{
      const msg=JSON.parse(e.data);
      switch(msg.type){
        case "joined":setPhase("waiting");setTotalQ(msg.totalQuestions||10);break;
        case "question_started":setPhase("question");setSentence(msg.sentence);setHint(msg.hint);setOptions(msg.options);setBlank(msg.blank);setQNum(msg.qIndex+1);setSelected(null);setAttempt(0);setResult(null);break;
        case "answer_result":setResult({correct:msg.correct,points:msg.points||0,message:msg.message||""});if(msg.correct){setScore(s=>s+(msg.points||0));}else{setAttempt(a=>a+1);setSelected(null);}break;
        case "question_ended":setPhase("revealed");setBlank(msg.correctAnswer||blank);break;
        case "game_over":setPhase("ended");setFinalScoreboard(msg.scoreboard||[]);break;
        case "error":setError(msg.message);break;
      }
    };
    ws.onerror=()=>setError("Connection lost.");
    return()=>ws.close();
  },[code]);
  const submitAnswer=(opt:string)=>{
    if(result?.correct||phase!=="question") return;
    setSelected(opt);
    if(wsRef.current?.readyState===1) wsRef.current.send(JSON.stringify({type:"submit_answer",answer:opt}));
  };
  const optColors=["bg-red-600","bg-blue-600","bg-yellow-500","bg-green-600"];
  if(error) return <div className="min-h-screen bg-green-950 flex items-center justify-center"><div className="text-center text-white"><div className="text-6xl mb-4">⚠️</div><div className="font-black text-xl mb-4">{error}</div><button onClick={()=>window.location.href=`/game/grammar-golf/join?code=${code}`} className="px-6 py-3 bg-yellow-400 text-green-900 rounded-xl font-black">Rejoin</button></div></div>;
  if(phase==="joining") return <div className="min-h-screen bg-green-950 flex items-center justify-center"><div className="text-center text-white"><div className="text-5xl mb-4 animate-pulse">⛳</div><div className="font-black text-xl">Connecting…</div></div></div>;
  if(phase==="waiting") return <div className="min-h-screen bg-gradient-to-br from-green-600 to-emerald-800 flex items-center justify-center"><div className="text-center text-white"><div className="text-7xl mb-6 animate-bounce">⛳</div><h2 className="text-3xl font-black mb-2">Ready to Tee Off, {playerName}!</h2><p className="text-green-200">Waiting for the teacher…</p></div></div>;
  if(phase==="ended"){
    const myRank=finalScoreboard.findIndex(s=>s.name===playerName)+1;
    return <div className="min-h-screen bg-gradient-to-br from-green-700 to-emerald-950 flex flex-col items-center justify-center p-4 text-white">
      <div className="text-6xl mb-4">🏆</div><h2 className="text-3xl font-black text-yellow-400 mb-2">Round Complete!</h2>
      <p className="text-green-200 mb-6">Final score: <span className="font-black text-white">{score}</span> pts</p>
      {myRank>0&&<div className="bg-white/10 rounded-2xl px-8 py-3 mb-6 text-center"><div className="text-sm text-green-300 uppercase">Your Rank</div><div className="text-4xl font-black text-yellow-400">#{myRank}</div></div>}
      <div className="w-full max-w-sm space-y-2">{finalScoreboard.slice(0,5).map((s,i)=><div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${s.name===playerName?"bg-yellow-400/20 border border-yellow-400/50":"bg-white/10"}`}><div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${i===0?"bg-yellow-400 text-green-900":"bg-white/20"}`}>{i+1}</div><div className="flex-1 font-bold">{s.name}</div><div className="font-black text-yellow-400">{s.score}</div></div>)}</div>
      <button onClick={()=>window.location.href=`/game/grammar-golf/join?code=${code}`} className="mt-8 px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-green-900 rounded-2xl font-black">Play Again</button>
    </div>;
  }
  const attemptsLeft=3-attempt;
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 to-emerald-950 flex flex-col text-white">
      <GameNavBar />
      <div className="flex-1 flex flex-col p-4"><div className="flex items-center justify-between mb-3">
        <div className="text-sm font-bold text-green-300">{playerName} • Hole {qNum}/{totalQ}</div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">{Array.from({length:3}).map((_,i)=><div key={i} className={`w-3 h-3 rounded-full ${i<attemptsLeft?"bg-yellow-400":"bg-white/20"}`}/>)}</div>
          <div className="bg-white/10 rounded-xl px-3 py-1 font-black text-yellow-400">{score} pts</div>
        </div>
      </div>
      <div className="bg-green-900/40 rounded-3xl border border-green-500/30 p-6 mb-4">
        <div className="text-xs text-green-300 font-black uppercase tracking-widest mb-2">Fill in the blank:</div>
        <div className="text-xl font-black leading-relaxed mb-3">{sentence.replace("___","______")}</div>
        <div className="text-sm text-green-300 italic">Hint: {hint}</div>
        {phase==="revealed"&&<div className="mt-3 bg-yellow-400/20 rounded-xl px-4 py-2 text-center"><span className="text-yellow-400 font-black">✓ Answer: {blank}</span></div>}
      </div>
      {result&&<div className={`rounded-xl px-4 py-2 text-center mb-3 font-black text-sm ${result.correct?"bg-green-800/50 text-green-300":"bg-red-800/50 text-red-300"}`}>{result.correct?`⛳ Hole in ${attempt+1}! +${result.points} pts`:`❌ Wrong! ${attemptsLeft} attempt${attemptsLeft!==1?"s":""} left`}</div>}
      {phase==="question"&&!result?.correct&&<div className="grid grid-cols-2 gap-3">
        {options.map((opt,i)=><button key={i} onClick={()=>submitAnswer(opt)} disabled={selected===opt&&!result} className={`py-4 rounded-2xl font-black text-lg transition-all active:scale-95 ${optColors[i]} hover:brightness-110 disabled:opacity-50`}>{String.fromCharCode(65+i)}) {opt}</button>)}
      </div>}
      {result?.correct&&<div className="bg-yellow-400/20 rounded-2xl px-4 py-3 text-center text-yellow-400 font-black">⛳ Correct! Waiting for next hole…</div>}
      {phase==="revealed"&&<div className="bg-white/10 rounded-2xl px-4 py-3 text-center text-white/70">Next hole coming…</div>}
    </div></div>
  );
}
