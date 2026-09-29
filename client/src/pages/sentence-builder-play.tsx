import { useState, useEffect, useRef } from "react";
import GameNavBar from "@/components/GameNavBar";
type Phase = "joining"|"waiting"|"question"|"revealed"|"ended";
export default function SentenceBuilderPlay() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code")||""; const playerName = decodeURIComponent(params.get("name")||"Player"); const playerGroup = params.get("group")||"";
  const [phase,setPhase] = useState<Phase>("joining");
  const [scrambled,setScrambled] = useState<string[]>([]);
  const [selected,setSelected] = useState<string[]>([]);
  const [remaining,setRemaining] = useState<string[]>([]);
  const [correct,setCorrect] = useState<string[]>([]);
  const [timer,setTimer] = useState(0);
  const [result,setResult] = useState<{correct:boolean;points:number}|null>(null);
  const [submitted,setSubmitted] = useState(false);
  const [score,setScore] = useState(0);
  const [qNum,setQNum] = useState(1);
  const [totalQ,setTotalQ] = useState(8);
  const [grammarNote,setGrammarNote] = useState("");
  const [finalScoreboard,setFinalScoreboard] = useState<{name:string;score:number;rank:number}[]>([]);
  const [error,setError] = useState<string|null>(null);
  const wsRef = useRef<WebSocket|null>(null);
  const timerRef = useRef<NodeJS.Timeout|null>(null);
  const startTimer=(s:number)=>{setTimer(s);if(timerRef.current)clearInterval(timerRef.current);timerRef.current=setInterval(()=>setTimer(t=>{if(t<=1){clearInterval(timerRef.current!);return 0;}return t-1;}),1000);};
  useEffect(()=>{
    if(!code||!playerName){setError("Missing info.");return;}
    const proto=window.location.protocol==="https:"?"wss":"ws";
    const ws=new WebSocket(`${proto}://${window.location.host}/ws/sentence-builder`);
    wsRef.current=ws;
    ws.onopen=()=>ws.send(JSON.stringify({type:"join",code,name:playerName,group:playerGroup||null}));
    ws.onmessage=(e)=>{
      const msg=JSON.parse(e.data);
      switch(msg.type){
        case "joined": setPhase("waiting"); setTotalQ(msg.totalQuestions||8); break;
        case "question_started": setPhase("question"); const sc=[...msg.words].sort(()=>Math.random()-0.5); setScrambled(sc); setRemaining(sc); setSelected([]); setCorrect(msg.words); setGrammarNote(msg.grammarNote||""); setQNum(msg.qIndex+1); setResult(null); setSubmitted(false); startTimer(msg.timeLimit||30); break;
        case "answer_result": setResult({correct:msg.correct,points:msg.points||0}); if(msg.correct){setScore(s=>s+(msg.points||0));setSubmitted(true);} break;
        case "question_ended": setPhase("revealed"); if(timerRef.current)clearInterval(timerRef.current); break;
        case "game_over": setPhase("ended"); setFinalScoreboard(msg.scoreboard||[]); break;
        case "error": setError(msg.message); break;
      }
    };
    ws.onerror=()=>setError("Connection lost.");
    return()=>{ws.close();if(timerRef.current)clearInterval(timerRef.current);};
  },[code]);
  const tapWord=(word:string,fromSelected:boolean)=>{
    if(submitted||phase!=="question") return;
    if(fromSelected){
      const idx=selected.lastIndexOf(word); const newSel=[...selected]; newSel.splice(idx,1); setSelected(newSel);
      setRemaining(prev=>[...prev,word]);
    } else {
      const idx=remaining.indexOf(word); const newRem=[...remaining]; newRem.splice(idx,1); setRemaining(newRem);
      setSelected(prev=>[...prev,word]);
    }
  };
  const submit=()=>{
    if(submitted||selected.length===0) return;
    const sentence=selected.join(" ");
    if(wsRef.current?.readyState===1) wsRef.current.send(JSON.stringify({type:"submit_answer",answer:sentence}));
    setSubmitted(true);
  };
  const clear=()=>{if(submitted||phase!=="question") return; setRemaining([...scrambled]); setSelected([]);};
  if(error) return <div className="min-h-screen bg-blue-950 flex items-center justify-center"><div className="text-center text-white"><div className="text-6xl mb-4">⚠️</div><div className="font-black text-xl mb-4">{error}</div><button onClick={()=>window.location.href=`/game/sentence-builder/join?code=${code}`} className="px-6 py-3 bg-yellow-400 text-blue-900 rounded-xl font-black">Rejoin</button></div></div>;
  if(phase==="joining") return <div className="min-h-screen bg-blue-950 flex items-center justify-center"><div className="text-center text-white"><div className="text-5xl mb-4 animate-pulse">🧩</div><div className="font-black text-xl">Connecting…</div></div></div>;
  if(phase==="waiting") return <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center"><div className="text-center text-white"><div className="text-7xl mb-6 animate-bounce">🧩</div><h2 className="text-3xl font-black mb-2">Ready, {playerName}!</h2><p className="text-blue-200">Waiting for the teacher to start…</p></div></div>;
  if(phase==="ended"){
    const myRank=finalScoreboard.findIndex(s=>s.name===playerName)+1;
    return <div className="min-h-screen bg-gradient-to-br from-blue-700 to-indigo-950 flex flex-col items-center justify-center p-4 text-white">
      <div className="text-6xl mb-4">🏆</div><h2 className="text-3xl font-black text-yellow-400 mb-2">Building Complete!</h2>
      <p className="text-blue-200 mb-6">Final score: <span className="font-black text-white">{score}</span> pts</p>
      {myRank>0&&<div className="bg-white/10 rounded-2xl px-8 py-3 mb-6 text-center"><div className="text-sm text-blue-300 uppercase">Your Rank</div><div className="text-4xl font-black text-yellow-400">#{myRank}</div></div>}
      <div className="w-full max-w-sm space-y-2">{finalScoreboard.slice(0,5).map((s,i)=><div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${s.name===playerName?"bg-yellow-400/20 border border-yellow-400/50":"bg-white/10"}`}><div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${i===0?"bg-yellow-400 text-blue-900":"bg-white/20"}`}>{i+1}</div><div className="flex-1 font-bold">{s.name}</div><div className="font-black text-yellow-400">{s.score}</div></div>)}</div>
      <button onClick={()=>window.location.href=`/game/sentence-builder/join?code=${code}`} className="mt-8 px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-blue-900 rounded-2xl font-black">Play Again</button>
    </div>;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 to-indigo-950 flex flex-col text-white">
      <GameNavBar />
      <div className="flex-1 flex flex-col p-4"><div className="flex items-center justify-between mb-3">
        <div className="text-sm font-bold text-blue-300">{playerName} • Q{qNum}/{totalQ}</div>
        <div className="flex items-center gap-3">{timer>0&&phase==="question"&&<div className={`font-black text-lg ${timer<=5?"text-red-400 animate-pulse":"text-yellow-400"}`}>⏱{timer}s</div>}<div className="bg-white/10 rounded-xl px-3 py-1 font-black text-yellow-400">{score} pts</div></div>
      </div>
      {grammarNote&&<div className="bg-blue-900/40 rounded-xl px-3 py-1 text-xs text-blue-300 font-bold mb-3 text-center">{grammarNote}</div>}
      <div className="bg-white/5 rounded-2xl p-4 mb-4 min-h-16 flex flex-wrap gap-2 items-center border-2 border-dashed border-blue-500/30">
        {selected.length===0&&<div className="text-blue-400 text-sm italic">Tap words below to build the sentence…</div>}
        {selected.map((w,i)=><button key={i} onClick={()=>tapWord(w,true)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm transition-all active:scale-95">{w}</button>)}
      </div>
      {result&&<div className={`rounded-xl px-4 py-2 text-center mb-3 font-black text-sm ${result.correct?"bg-green-800/50 text-green-300":"bg-red-800/50 text-red-300"}`}>{result.correct?`✅ Correct! +${result.points} pts`:`❌ Not quite right!`}</div>}
      {phase==="revealed"&&<div className="bg-green-900/30 rounded-xl px-4 py-2 mb-3 border border-green-700/30"><div className="text-xs text-green-300 font-black uppercase mb-1">Correct answer:</div><div className="font-bold text-green-200">{correct.join(" ")}</div></div>}
      <div className="flex-1 bg-white/5 rounded-2xl p-4 flex flex-wrap gap-2 content-start">
        {remaining.map((w,i)=><button key={i} onClick={()=>tapWord(w,false)} disabled={submitted||phase!=="question"} className="px-3 py-2 bg-white/15 hover:bg-white/25 disabled:opacity-40 rounded-xl font-bold text-sm transition-all active:scale-95">{w}</button>)}
        {remaining.length===0&&selected.length>0&&!submitted&&<div className="text-blue-400 text-sm italic">All words used! Check and submit.</div>}
      </div>
      {phase==="question"&&!submitted&&selected.length>0&&(
        <div className="flex gap-2 mt-3">
          <button onClick={clear} className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-black text-sm">Clear</button>
          <button onClick={submit} className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-300 text-blue-900 rounded-xl font-black text-lg">Submit!</button>
        </div>
      )}
      {submitted&&phase==="question"&&<div className="mt-3 bg-yellow-400/20 rounded-xl px-4 py-3 text-center text-yellow-400 font-black">✓ Submitted — waiting for next sentence…</div>}
    </div></div>
  );
}
