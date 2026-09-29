import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, Link } from "wouter";
import { Users, Home, ChevronRight, ChevronLeft } from "lucide-react";
import { rolePlayWeeks } from "@/lib/role-play/role-play-weeks";
export default function RolePlayHost() {
  const code=new URLSearchParams(window.location.search).get("code")||"";
  const [,setLoc]=useLocation();
  const [phase,setPhase]=useState<"lobby"|"scenario"|"ended">("lobby");
  const [studentCount,setStudentCount]=useState(0);
  const [week,setWeek]=useState(1); const [scenarioIndex,setScenarioIndex]=useState(0);
  const [connected,setConnected]=useState(false);
  const wsRef=useRef<WebSocket|null>(null);
  const send=useCallback((msg:object)=>{if(wsRef.current?.readyState===1)wsRef.current.send(JSON.stringify(msg));},[]);
  useEffect(()=>{
    if(!code)return;
    const proto=window.location.protocol==="https:"?"wss":"ws";
    const ws=new WebSocket(`${proto}://${window.location.host}/ws/role-play`);
    wsRef.current=ws;
    ws.onopen=()=>{setConnected(true);ws.send(JSON.stringify({type:"host_connect",code}));};
    ws.onmessage=(e)=>{
      const msg=JSON.parse(e.data);
      switch(msg.type){
        case "host_reconnected":setPhase(msg.phase);setStudentCount(msg.studentCount);setWeek(msg.week);setScenarioIndex(msg.scenarioIndex||0);break;
        case "student_joined":setStudentCount(msg.count);break;
        case "student_left":setStudentCount(msg.count);break;
        case "scenario_started":setPhase("scenario");setScenarioIndex(msg.scenarioIndex);break;
        case "game_over":setPhase("ended");break;
      }
    };
    ws.onerror=()=>setConnected(false);ws.onclose=()=>setConnected(false);
    return()=>ws.close();
  },[code]);
  const weekData=rolePlayWeeks.find(w=>w.week===week);
  const scenarios=weekData?.scenarios||[];
  const currentScenario=scenarios[scenarioIndex];
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <div className="bg-pink-900/80 border-b border-pink-700/40 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4"><Link href="/dashboard"><button className="text-pink-300 hover:text-white" title="Dashboard"><Home size={20}/></button></Link><Link href="/games"><button className="text-pink-300 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-pink-800/50 hover:bg-pink-700/50" title="All Games">All Games</button></Link><span className="font-black text-lg text-yellow-400 tracking-widest">🎭 ROLE PLAY HUB</span>{weekData&&<span className="text-pink-300 text-sm">Week {week}: {weekData.title}</span>}</div>
        <div className="flex items-center gap-4"><div className="flex items-center gap-2 text-pink-200"><Users size={18}/><span className="font-black text-lg">{studentCount}</span></div><div className={`px-3 py-1 rounded-full text-xs font-black ${connected?"bg-green-500/20 text-green-400":"bg-red-500/20 text-red-400"}`}>{connected?"● LIVE":"● OFF"}</div><div className="bg-pink-800 px-4 py-1 rounded-full font-black tracking-widest text-yellow-400">{code}</div></div>
      </div>
      <div className="flex-1 p-6">
        {phase==="lobby"&&<div className="flex flex-col items-center justify-center h-full gap-6"><div className="text-7xl">🎭</div><h2 className="text-3xl font-black">Role Play Hub</h2><div className="bg-white/5 rounded-2xl p-4 text-center"><div className="text-4xl font-black text-yellow-400">{studentCount}</div><div className="text-pink-300 text-sm">students joined</div></div>
          {weekData&&<div className="max-w-md text-center"><div className="text-sm text-pink-300 mb-2">Grammar focus: <span className="text-white font-bold">{weekData.grammarFocus}</span></div><div className="text-sm text-pink-300">{scenarios.length} scenarios available</div></div>}
          <button onClick={()=>send({type:"start_scenario",scenarioIndex:0})} className="px-12 py-5 bg-yellow-400 hover:bg-yellow-300 text-pink-900 rounded-2xl font-black text-xl shadow-2xl">Start First Scenario!</button>
        </div>}
        {phase==="scenario"&&currentScenario&&<div className="max-w-2xl mx-auto space-y-4">
          <div className="bg-pink-900/40 rounded-3xl border border-pink-500/30 p-6">
            <div className="flex items-center justify-between mb-3"><div className="text-xs text-pink-300 font-black uppercase tracking-widest">Scenario {scenarioIndex+1} of {scenarios.length}</div></div>
            <h2 className="text-2xl font-black text-yellow-400 mb-1">{currentScenario.title}</h2>
            <p className="text-pink-200 text-sm mb-1">📍 {currentScenario.setting}</p>
            <p className="text-green-400 text-sm font-bold mb-4">🎯 {currentScenario.goal}</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-blue-900/30 rounded-2xl p-3 border border-blue-500/30"><div className="font-black text-blue-400 text-xs uppercase tracking-widest mb-1">Role A</div><div className="font-bold text-white">{currentScenario.roleA}</div></div>
              <div className="bg-purple-900/30 rounded-2xl p-3 border border-purple-500/30"><div className="font-black text-purple-400 text-xs uppercase tracking-widest mb-1">Role B</div><div className="font-bold text-white">{currentScenario.roleB}</div></div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="text-xs font-black text-pink-300 uppercase tracking-widest mb-3">Sample Dialogue</div>
              <div className="space-y-2">{currentScenario.dialogue.map((line,i)=><div key={i} className={`flex gap-3 items-start px-3 py-2 rounded-xl ${line.role==="A"?"bg-blue-900/20":"bg-purple-900/20"}`}><span className={`font-black text-xs px-2 py-0.5 rounded-full ${line.role==="A"?"bg-blue-600 text-white":"bg-purple-600 text-white"}`}>{line.role}</span><span className="text-white text-sm">{line.text}</span></div>)}</div>
            </div>
            {currentScenario.tips.length>0&&<div className="mt-4 bg-yellow-400/10 rounded-2xl p-3 border border-yellow-400/20"><div className="text-xs font-black text-yellow-400 uppercase tracking-widest mb-2">💡 Tips</div>{currentScenario.tips.map((t,i)=><div key={i} className="text-sm text-yellow-200">{t}</div>)}</div>}
          </div>
          <div className="flex gap-3">
            {scenarioIndex>0&&<button onClick={()=>send({type:"start_scenario",scenarioIndex:scenarioIndex-1})} className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black flex items-center gap-2"><ChevronLeft size={20}/> Previous</button>}
            {scenarioIndex<scenarios.length-1&&<button onClick={()=>send({type:"start_scenario",scenarioIndex:scenarioIndex+1})} className="flex-1 py-4 bg-pink-500 hover:bg-pink-400 rounded-2xl font-black text-lg flex items-center justify-center gap-2"><ChevronRight size={22}/> Next Scenario</button>}
            {scenarioIndex>=scenarios.length-1&&<button onClick={()=>send({type:"end_game"})} className="flex-1 py-4 bg-yellow-400 hover:bg-yellow-300 text-pink-900 rounded-2xl font-black text-lg">All Done!</button>}
            <button onClick={()=>send({type:"end_game"})} className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-sm">End</button>
          </div>
        </div>}
        {phase==="ended"&&<div className="flex flex-col items-center justify-center h-full gap-6"><div className="text-6xl">🎭</div><h2 className="text-3xl font-black text-yellow-400">Performance Complete!</h2><p className="text-pink-200">All scenarios completed. Great work!</p><button onClick={()=>setLoc("/game/role-play")} className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-pink-900 rounded-2xl font-black">New Session</button></div>}
      </div>
    </div>
  );
}
