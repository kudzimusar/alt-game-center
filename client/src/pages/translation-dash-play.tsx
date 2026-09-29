import { useState, useEffect, useRef } from "react";
import GameNavBar from "@/components/GameNavBar";
type Phase="joining"|"waiting"|"question"|"revealed"|"ended";
export default function TranslationDashPlay(){
  const params=new URLSearchParams(window.location.search);
  const code=params.get("code")||""; const playerName=decodeURIComponent(params.get("name")||"Player"); const playerGroup=params.get("group")||"";
  const [phase,setPhase]=useState<Phase>("joining");
  const [emoji,setEmoji]=useState(""); const [hint,setHint]=useState(""); const [options,setOptions]=useState<string[]>([]); const [correctAnswer,setCorrectAnswer]=useState("");
  const [selected,setSelected]=useState<string|null>(null); const [result,setResult]=useState<{correct:boolean;points:number}|null>(null);
  const [score,setScore]=useState(0); const [streak,setStreak]=useState(0); const [qNum,setQNum]=useState(1); const [totalQ,setTotalQ]=useState(10);
  const [timer,setTimer]=useState(0);
  const [finalScoreboard,setFinalScoreboard]=useState<{name:string;score:number;rank:number}[]>([]);
  const [error,setError]=useState<string|null>(null);
  const wsRef=useRef<WebSocket|null>(null); const timerRef=useRef<NodeJS.Timeout|null>(null);
  const startTimer=(s:number)=>{setTimer(s);if(timerRef.current)clearInterval(timerRef.current);timerRef.current=setInterval(()=>setTimer(t=>{if(t<=1){clearInterval(timerRef.current!);return 0;}return t-1;}),1000);};
  useEffect(()=>{
    if(!code||!playerName){setError("Missing info.");return;}
    const proto=window.location.protocol==="https:"?"wss":"ws";
    const ws=new WebSocket(`${proto}://${window.location.host}/ws/translation-dash`);
    wsRef.current=ws;
    ws.onopen=()=>ws.send(JSON.stringify({type:"join",code,name:playerName,group:playerGroup||null}));
    ws.onmessage=(e)=>{
      const msg=JSON.parse(e.data);
      switch(msg.type){
        case "joined":setPhase("waiting");setTotalQ(msg.totalQuestions||10);break;
        case "question_started":setPhase("question");setEmoji(msg.emoji);setHint(msg.hint);setOptions(msg.options);setQNum(msg.qIndex+1);setSelected(null);setResult(null);startTimer(msg.timeLimit||15);break;
        case "answer_result":setResult({correct:msg.correct,points:msg.points||0});if(msg.correct){setScore(s=>s+(msg.points||0));setStreak(s=>s+1);}else{setStreak(0);}break;
        case "question_ended":setPhase("revealed");setCorrectAnswer(msg.answer||"");if(timerRef.current)clearInterval(timerRef.current);break;
        case "game_over":setPhase("ended");setFinalScoreboard(msg.scoreboard||[]);break;
        case "error":setError(msg.message);break;
      }
    };
    ws.onerror=()=>setError("Connection lost.");
    return()=>{ws.close();if(timerRef.current)clearInterval(timerRef.current);};
  },[code]);
  const submitAnswer=(opt:string)=>{
    if(selected||result||phase!=="question") return;
    setSelected(opt);
    if(wsRef.current?.readyState===1) wsRef.current.send(JSON.stringify({type:"submit_answer",answer:opt}));
  };
  const optColors=["bg-red-600 hover:bg-red-500","bg-blue-600 hover:bg-blue-500","bg-yellow-500 hover:bg-yellow-400","bg-green-600 hover:bg-green-500"];
  if(error) return <div className="min-h-screen bg-orange-950 flex items-center justify-center"><div className="text-center text-white"><div className="text-6xl mb-4">⚠️</div><div className="font-black text-xl mb-4">{error}</div><button onClick={()=>window.location.href=`/game/translation-dash/join?code=${code}`} className="px-6 py-3 bg-yellow-400 text-orange-900 rounded-xl font-black">Rejoin</button></div></div>;
  if(phase==="joining") return <div className="min-h-screen bg-orange-950 flex items-center justify-center"><div className="text-center text-white"><div className="text-5xl mb-4 animate-pulse">⚡</div><div className="font-black text-xl">Connecting…</div></div></div>;
  if(phase==="waiting") return <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-700 flex items-center justify-center"><div className="text-center text-white"><div className="text-7xl mb-6 animate-bounce">⚡</div><h2 className="text-3xl font-black mb-2">Ready, {playerName}!</h2><p className="text-orange-100">Waiting for the teacher…</p></div></div>;
  if(phase==="ended"){
    const myRank=finalScoreboard.findIndex(s=>s.name===playerName)+1;
    return <div className="min-h-screen bg-gradient-to-br from-orange-600 to-red-900 flex flex-col items-center justify-center p-4 text-white">
      <div className="text-6xl mb-4">🏆</div><h2 className="text-3xl font-black text-yellow-400 mb-2">Dash Complete!</h2>
      <p className="text-orange-200 mb-6">Final score: <span className="font-black text-white">{score}</span> pts</p>
      {myRank>0&&<div className="bg-white/10 rounded-2xl px-8 py-3 mb-6 text-center"><div className="text-sm text-orange-300 uppercase">Your Rank</div><div className="text-4xl font-black text-yellow-400">#{myRank}</div></div>}
      <div className="w-full max-w-sm space-y-2">{finalScoreboard.slice(0,5).map((s,i)=><div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${s.name===playerName?"bg-yellow-400/20 border border-yellow-400/50":"bg-white/10"}`}><div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${i===0?"bg-yellow-400 text-orange-900":"bg-white/20"}`}>{i+1}</div><div className="flex-1 font-bold">{s.name}</div><div className="font-black text-yellow-400">{s.score}</div></div>)}</div>
      <button onClick={()=>window.location.href=`/game/translation-dash/join?code=${code}`} className="mt-8 px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-orange-900 rounded-2xl font-black">Play Again</button>
    </div>;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 to-red-900 flex flex-col text-white">
      <GameNavBar />
      <div className="flex-1 flex flex-col p-4"><div className="flex items-center justify-between mb-3">
        <div className="text-sm font-bold text-orange-200">{playerName} • Q{qNum}/{totalQ}</div>
        <div className="flex items-center gap-3">{streak>=3&&<span className="text-yellow-400 font-black">🔥{streak}</span>}{timer>0&&phase==="question"&&<div className={`font-black text-lg ${timer<=5?"text-red-400 animate-pulse":"text-yellow-400"}`}>⏱{timer}s</div>}<div className="bg-white/10 rounded-xl px-3 py-1 font-black text-yellow-400">{score} pts</div></div>
      </div>
      <div className="text-7xl text-center my-4">{emoji}</div>
      <div className="bg-orange-900/40 rounded-2xl px-4 py-3 text-center text-orange-100 mb-4 border border-orange-500/20 italic">"{hint}"</div>
      {result&&<div className={`rounded-xl px-4 py-2 text-center mb-3 font-black text-sm ${result.correct?"bg-green-800/50 text-green-300":"bg-red-800/50 text-red-300"}`}>{result.correct?`⚡ Correct! +${result.points} pts`:`❌ Wrong!`}</div>}
      {phase==="revealed"&&correctAnswer&&<div className="bg-yellow-400/20 rounded-xl px-4 py-2 text-center mb-3 border border-yellow-400/30"><span className="text-yellow-400 font-black">✓ Answer: {correctAnswer}</span></div>}
      {phase==="question"&&!selected&&<div className="grid grid-cols-2 gap-3 mt-auto">
        {options.map((opt,i)=><button key={i} onClick={()=>submitAnswer(opt)} className={`py-5 rounded-2xl font-black text-lg transition-all active:scale-95 text-white ${optColors[i]}`}>{String.fromCharCode(65+i)}) {opt}</button>)}
      </div>}
      {selected&&phase==="question"&&<div className="mt-auto grid grid-cols-2 gap-3">
        {options.map((opt,i)=><div key={i} className={`py-5 rounded-2xl font-black text-lg text-center text-white ${opt===selected?(result?.correct?"bg-green-600":"bg-red-600"):"opacity-30 "+optColors[i].split(" ")[0]}`}>{String.fromCharCode(65+i)}) {opt}</div>)}
      </div>}
      {phase==="revealed"&&<div className="mt-auto grid grid-cols-2 gap-3">
        {options.map((opt,i)=><div key={i} className={`py-5 rounded-2xl font-black text-lg text-center text-white ${opt===correctAnswer?"bg-green-600 border-2 border-green-400":opt===selected&&selected!==correctAnswer?"bg-red-800/50":"opacity-30 "+optColors[i].split(" ")[0]}`}>{String.fromCharCode(65+i)}) {opt}</div>)}
      </div>}
    </div></div>
  );
}
