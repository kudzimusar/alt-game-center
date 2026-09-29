import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, Link } from "wouter";
import { Users, Home, Volume2 } from "lucide-react";
import { flashCardWeeks } from "@/lib/flash-cards/flash-card-weeks";
export default function ListeningBingoHost(){
  const code=new URLSearchParams(window.location.search).get("code")||"";
  const [,setLoc]=useLocation();
  const [phase,setPhase]=useState<"lobby"|"playing"|"ended">("lobby");
  const [studentCount,setStudentCount]=useState(0);
  const [week,setWeek]=useState(1); const [called,setCalled]=useState<number[]>([]);
  const [bingos,setBingos]=useState<{studentName:string;pattern:string}[]>([]);
  const [connected,setConnected]=useState(false);
  const wsRef=useRef<WebSocket|null>(null);
  const send=useCallback((msg:object)=>{if(wsRef.current?.readyState===1)wsRef.current.send(JSON.stringify(msg));},[]);
  useEffect(()=>{
    if(!code)return;
    const proto=window.location.protocol==="https:"?"wss":"ws";
    const ws=new WebSocket(`${proto}://${window.location.host}/ws/listening-bingo`);
    wsRef.current=ws;
    ws.onopen=()=>{setConnected(true);ws.send(JSON.stringify({type:"host_connect",code}));};
    ws.onmessage=(e)=>{
      const msg=JSON.parse(e.data);
      switch(msg.type){
        case "host_reconnected":setPhase(msg.phase);setStudentCount(msg.studentCount);setWeek(msg.week);setCalled(msg.called||[]);break;
        case "student_joined":setStudentCount(msg.count);break;
        case "student_left":setStudentCount(msg.count);break;
        case "game_started":setPhase("playing");break;
        case "word_called":setCalled(msg.called);break;
        case "bingo":setBingos(prev=>[...prev,{studentName:msg.studentName,pattern:msg.pattern}]);break;
        case "game_over":setPhase("ended");break;
      }
    };
    ws.onerror=()=>setConnected(false);ws.onclose=()=>setConnected(false);
    return()=>ws.close();
  },[code]);
  const weekData=flashCardWeeks.find(w=>w.week===week);
  const cards=weekData?.cards||[];
  const uncalled=cards.map((_,i)=>i).filter(i=>!called.includes(i));
  const callRandom=()=>{
    if(uncalled.length===0) return;
    const idx=uncalled[Math.floor(Math.random()*uncalled.length)];
    send({type:"call_word",wordIndex:idx});
  };
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <div className="bg-teal-900/80 border-b border-teal-700/40 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4"><Link href="/dashboard"><button className="text-teal-300 hover:text-white" title="Dashboard"><Home size={20}/></button></Link><Link href="/games"><button className="text-teal-300 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-teal-800/50 hover:bg-teal-700/50" title="All Games">All Games</button></Link><span className="font-black text-lg text-yellow-400 tracking-widest">🎱 LISTENING BINGO</span>{weekData&&<span className="text-teal-300 text-sm">Week {week}: {weekData.title}</span>}</div>
        <div className="flex items-center gap-4"><div className="flex items-center gap-2 text-teal-200"><Users size={18}/><span className="font-black text-lg">{studentCount}</span></div><div className={`px-3 py-1 rounded-full text-xs font-black ${connected?"bg-green-500/20 text-green-400":"bg-red-500/20 text-red-400"}`}>{connected?"● LIVE":"● OFF"}</div><div className="bg-teal-800 px-4 py-1 rounded-full font-black tracking-widest text-yellow-400">{code}</div></div>
      </div>
      <div className="flex-1 p-6 flex gap-6">
        <div className="flex-1 flex flex-col gap-4">
          {phase==="lobby"&&<div className="flex-1 flex flex-col items-center justify-center gap-6"><div className="text-7xl">🎱</div><h2 className="text-3xl font-black">Listening Bingo</h2><div className="bg-white/5 rounded-2xl p-4 text-center"><div className="text-4xl font-black text-yellow-400">{studentCount}</div><div className="text-teal-300 text-sm">students joined</div></div>{weekData&&<div className="text-center text-sm text-teal-300">{cards.length} words in the pool this week</div>}<button onClick={()=>send({type:"start_game"})} className="px-12 py-5 bg-yellow-400 hover:bg-yellow-300 text-teal-900 rounded-2xl font-black text-xl shadow-2xl">Deal Cards!</button></div>}
          {phase==="playing"&&(
            <div className="flex-1 flex flex-col gap-4">
              {called.length>0&&cards[called[called.length-1]]&&<div className="bg-teal-900/40 rounded-3xl border border-teal-500/30 p-6 text-center"><div className="text-xs text-teal-300 font-black uppercase tracking-widest mb-2">Last called</div><div className="text-7xl mb-2">{cards[called[called.length-1]].emoji}</div><div className="text-4xl font-black text-yellow-400">{cards[called[called.length-1]].word}</div></div>}
              <div className="flex gap-3">
                <button onClick={callRandom} disabled={uncalled.length===0} className="flex-1 py-5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-teal-900 rounded-2xl font-black text-xl flex items-center justify-center gap-2"><Volume2 size={24}/> Call Next Word ({uncalled.length} left)</button>
                <button onClick={()=>send({type:"end_game"})} className="px-6 py-5 bg-white/10 hover:bg-white/20 rounded-2xl font-black">End</button>
              </div>
              {bingos.length>0&&<div className="bg-yellow-400/10 rounded-2xl p-4 border border-yellow-400/20"><div className="text-xs font-black text-yellow-400 uppercase tracking-widest mb-2">🎉 BINGO!</div>{bingos.map((b,i)=><div key={i} className="text-yellow-300 font-bold">{b.studentName} — {b.pattern}!</div>)}</div>}
              <div className="flex-1 grid grid-cols-5 gap-2 content-start">
                {cards.map((c,i)=><div key={i} className={`px-2 py-2 rounded-xl text-center text-xs font-bold transition-all ${called.includes(i)?"bg-teal-600 text-white":"bg-white/5 text-white/40"}`}>{c.emoji}<br/>{c.word}</div>)}
              </div>
            </div>
          )}
          {phase==="ended"&&<div className="flex-1 flex flex-col items-center justify-center gap-6"><div className="text-6xl">🎱</div><h2 className="text-3xl font-black text-yellow-400">Bingo Over!</h2>{bingos[0]&&<p className="text-teal-200">First BINGO: <span className="font-black text-white">{bingos[0].studentName}</span></p>}<button onClick={()=>setLoc("/game/listening-bingo")} className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-teal-900 rounded-2xl font-black">Play Again</button></div>}
        </div>
        <div className="w-56 bg-teal-950/60 border-l border-teal-800/40 p-4 flex flex-col"><div className="font-black text-sm uppercase tracking-widest text-teal-200 mb-3">Called ({called.length}/{cards.length})</div><div className="flex-1 flex flex-wrap gap-1 content-start overflow-y-auto">{called.map(i=><div key={i} className="bg-teal-700/40 border border-teal-500/30 rounded-lg px-2 py-1 text-xs font-bold">{cards[i]?.emoji} {cards[i]?.word}</div>)}</div></div>
      </div>
    </div>
  );
}
