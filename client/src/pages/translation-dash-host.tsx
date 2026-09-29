import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, Link } from "wouter";
import { Trophy, Users, Home, ChevronRight, Eye } from "lucide-react";
import { flashCardWeeks } from "@/lib/flash-cards/flash-card-weeks";
interface Answer { studentName:string; answer:string; correct:boolean; points:number; }
interface ScoreEntry { id:string; name:string; score:number; rank:number; }
export default function TranslationDashHost(){
  const code=new URLSearchParams(window.location.search).get("code")||"";
  const [,setLoc]=useLocation();
  const [phase,setPhase]=useState<"lobby"|"question"|"revealed"|"ended">("lobby");
  const [studentCount,setStudentCount]=useState(0);
  const [week,setWeek]=useState(1); const [qIndex,setQIndex]=useState(0);
  const [answers,setAnswers]=useState<Answer[]>([]); const [scoreboard,setScoreboard]=useState<ScoreEntry[]>([]);
  const [connected,setConnected]=useState(false); const [timer,setTimer]=useState(0);
  const wsRef=useRef<WebSocket|null>(null); const timerRef=useRef<NodeJS.Timeout|null>(null);
  const send=useCallback((msg:object)=>{if(wsRef.current?.readyState===1)wsRef.current.send(JSON.stringify(msg));},[]);
  const startTimer=(s:number)=>{setTimer(s);if(timerRef.current)clearInterval(timerRef.current);timerRef.current=setInterval(()=>setTimer(t=>{if(t<=1){clearInterval(timerRef.current!);return 0;}return t-1;}),1000);};
  useEffect(()=>{
    if(!code)return;
    const proto=window.location.protocol==="https:"?"wss":"ws";
    const ws=new WebSocket(`${proto}://${window.location.host}/ws/translation-dash`);
    wsRef.current=ws;
    ws.onopen=()=>{setConnected(true);ws.send(JSON.stringify({type:"host_connect",code}));};
    ws.onmessage=(e)=>{
      const msg=JSON.parse(e.data);
      switch(msg.type){
        case "host_reconnected":setPhase(msg.phase);setStudentCount(msg.studentCount);setWeek(msg.week);setQIndex(msg.qIndex||0);if(msg.scoreboard)setScoreboard(msg.scoreboard);break;
        case "student_joined":setStudentCount(msg.count);break;
        case "student_left":setStudentCount(msg.count);break;
        case "question_started":setPhase("question");setQIndex(msg.qIndex);setAnswers([]);startTimer(msg.timeLimit||15);break;
        case "answer_in":setAnswers(prev=>[...prev,msg]);break;
        case "question_ended":setPhase("revealed");if(timerRef.current)clearInterval(timerRef.current);if(msg.scoreboard)setScoreboard(msg.scoreboard);break;
        case "game_over":setPhase("ended");if(msg.scoreboard)setScoreboard(msg.scoreboard);break;
      }
    };
    ws.onerror=()=>setConnected(false);ws.onclose=()=>setConnected(false);
    return()=>{ws.close();if(timerRef.current)clearInterval(timerRef.current);};
  },[code]);
  const weekData=flashCardWeeks.find(w=>w.week===week);
  const cards=weekData?.cards||[];
  const questions=cards.map((c,i)=>{
    const distractors=cards.filter((_,j)=>j!==i).sort(()=>Math.random()-0.5).slice(0,3).map(d=>d.word);
    const options=[c.word,...distractors].sort(()=>Math.random()-0.5);
    return {hint:c.hint,emoji:c.emoji,answer:c.word,options};
  });
  const currentQ=questions[qIndex];
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <div className="bg-orange-900/80 border-b border-orange-700/40 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4"><Link href="/dashboard"><button className="text-orange-300 hover:text-white" title="Dashboard"><Home size={20}/></button></Link><Link href="/games"><button className="text-orange-300 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-orange-800/50 hover:bg-orange-700/50" title="All Games">All Games</button></Link><span className="font-black text-lg text-yellow-400 tracking-widest">⚡ TRANSLATION DASH</span>{weekData&&<span className="text-orange-300 text-sm">Week {week}: {weekData.title}</span>}</div>
        <div className="flex items-center gap-4"><div className="flex items-center gap-2 text-orange-200"><Users size={18}/><span className="font-black text-lg">{studentCount}</span></div><div className={`px-3 py-1 rounded-full text-xs font-black ${connected?"bg-green-500/20 text-green-400":"bg-red-500/20 text-red-400"}`}>{connected?"● LIVE":"● OFF"}</div><div className="bg-orange-800 px-4 py-1 rounded-full font-black tracking-widest text-yellow-400">{code}</div></div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col p-6 gap-4">
          {phase==="lobby"&&<div className="flex-1 flex flex-col items-center justify-center gap-6"><div className="text-7xl">⚡</div><h2 className="text-3xl font-black">Translation Dash</h2><div className="bg-white/5 rounded-2xl p-4 text-center"><div className="text-4xl font-black text-yellow-400">{studentCount}</div><div className="text-orange-300 text-sm">students joined</div></div>{weekData&&<div className="text-center text-sm text-orange-300">{cards.length} questions ready</div>}<button onClick={()=>send({type:"start_game"})} className="px-12 py-5 bg-yellow-400 hover:bg-yellow-300 text-orange-900 rounded-2xl font-black text-xl shadow-2xl">Dash!</button></div>}
          {(phase==="question"||phase==="revealed")&&currentQ&&<div className="flex-1 flex flex-col gap-4">
            <div className="bg-orange-900/40 rounded-3xl border border-orange-500/30 p-6">
              <div className="flex items-center justify-between mb-3"><div className="text-xs text-orange-300 font-black uppercase tracking-widest">Round {qIndex+1} of {questions.length}</div>{timer>0&&phase==="question"&&<div className="text-2xl font-black text-yellow-400">⏱ {timer}s</div>}</div>
              <div className="text-5xl text-center mb-3">{currentQ.emoji}</div>
              <div className="text-orange-200 text-center mb-3 italic">"{currentQ.hint}"</div>
              {phase==="revealed"&&<div className="text-center text-2xl font-black text-yellow-400">✓ {currentQ.answer}</div>}
              <div className="grid grid-cols-2 gap-2 mt-4">{currentQ.options.map((opt,i)=><div key={i} className={`px-4 py-2 rounded-xl text-sm font-bold text-center ${phase==="revealed"&&opt===currentQ.answer?"bg-green-600/30 border border-green-500/40 text-green-300":phase==="revealed"?"bg-white/5 text-white/40":"bg-white/10 text-white"}`}>{String.fromCharCode(65+i)}) {opt}</div>)}</div>
            </div>
            {answers.length>0&&<div className="bg-white/5 rounded-2xl p-4"><div className="text-xs font-black text-orange-300 uppercase tracking-widest mb-3">Answers ({answers.length})</div><div className="space-y-1">{answers.slice(-6).map((a,i)=><div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-xl ${a.correct?"bg-green-900/30 border border-green-700/30":"bg-red-900/20"}`}><span className={`font-black text-sm ${a.correct?"text-green-400":"text-red-400"}`}>{a.correct?"✓":"✗"} {a.studentName}</span><span className="text-white/60 text-xs">{a.answer}</span>{a.correct&&<span className="font-black text-xs text-yellow-400 ml-auto">+{a.points}</span>}</div>)}</div></div>}
            <div className="flex gap-3">
              {phase==="question"&&<button onClick={()=>send({type:"end_question"})} className="flex-1 py-4 bg-yellow-400 hover:bg-yellow-300 text-orange-900 rounded-2xl font-black text-lg flex items-center justify-center gap-2"><Eye size={22}/> Reveal Answer</button>}
              {phase==="revealed"&&qIndex<questions.length-1&&<button onClick={()=>send({type:"next_question"})} className="flex-1 py-4 bg-orange-500 hover:bg-orange-400 rounded-2xl font-black text-lg flex items-center justify-center gap-2"><ChevronRight size={22}/> Next Round</button>}
              {phase==="revealed"&&qIndex>=questions.length-1&&<button onClick={()=>send({type:"end_game"})} className="flex-1 py-4 bg-yellow-400 hover:bg-yellow-300 text-orange-900 rounded-2xl font-black text-lg">Final Scores!</button>}
              <button onClick={()=>send({type:"end_game"})} className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-sm">End</button>
            </div>
          </div>}
          {phase==="ended"&&<div className="flex-1 flex flex-col items-center justify-center gap-6"><div className="text-6xl">🏆</div><h2 className="text-3xl font-black text-yellow-400">Dash Complete!</h2>{scoreboard[0]&&<p className="text-orange-200">Winner: <span className="font-black text-white">{scoreboard[0].name}</span> ({scoreboard[0].score} pts)</p>}<button onClick={()=>setLoc("/game/translation-dash")} className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-orange-900 rounded-2xl font-black">Play Again</button></div>}
        </div>
        <div className="w-64 bg-orange-950/60 border-l border-orange-800/40 p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-4"><Trophy size={18} className="text-yellow-400"/><span className="font-black text-sm uppercase tracking-widest text-orange-200">Leaderboard</span></div>
          <div className="flex-1 space-y-2 overflow-y-auto">
            {scoreboard.slice(0,12).map((s,i)=><div key={s.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${i===0?"bg-yellow-400/10 border border-yellow-400/30":"bg-white/5"}`}><div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${i===0?"bg-yellow-400 text-orange-900":i===1?"bg-gray-300 text-gray-900":i===2?"bg-amber-600 text-white":"bg-white/10 text-white/50"}`}>{i+1}</div><div className="flex-1 min-w-0"><div className="font-bold text-xs truncate">{s.name}</div></div><div className="font-black text-yellow-400 text-xs">{s.score}</div></div>)}
            {scoreboard.length===0&&<div className="text-center text-orange-400 text-sm py-8">No scores yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
