import { useState, useEffect, useRef } from "react";
import GameNavBar from "@/components/GameNavBar";
type Phase="joining"|"waiting"|"scenario"|"ended";
interface ScenarioData { title:string; setting:string; goal:string; roleA:string; roleB:string; dialogue:{role:string;text:string}[]; tips:string[]; }
export default function RolePlayPlay(){
  const params=new URLSearchParams(window.location.search);
  const code=params.get("code")||""; const playerName=decodeURIComponent(params.get("name")||"Player"); const playerGroup=params.get("group")||"";
  const [phase,setPhase]=useState<Phase>("joining");
  const [scenario,setScenario]=useState<ScenarioData|null>(null);
  const [myRole,setMyRole]=useState<"A"|"B"|null>(null);
  const [scenarioNum,setScenarioNum]=useState(1); const [totalScenarios,setTotalScenarios]=useState(4);
  const [error,setError]=useState<string|null>(null);
  const wsRef=useRef<WebSocket|null>(null);
  useEffect(()=>{
    if(!code||!playerName){setError("Missing info.");return;}
    const proto=window.location.protocol==="https:"?"wss":"ws";
    const ws=new WebSocket(`${proto}://${window.location.host}/ws/role-play`);
    wsRef.current=ws;
    ws.onopen=()=>ws.send(JSON.stringify({type:"join",code,name:playerName,group:playerGroup||null}));
    ws.onmessage=(e)=>{
      const msg=JSON.parse(e.data);
      switch(msg.type){
        case "joined":setPhase("waiting");setTotalScenarios(msg.totalScenarios||4);break;
        case "scenario_started":setPhase("scenario");setScenario(msg.scenario);setMyRole(msg.role||"A");setScenarioNum(msg.scenarioIndex+1);break;
        case "game_over":setPhase("ended");break;
        case "error":setError(msg.message);break;
      }
    };
    ws.onerror=()=>setError("Connection lost.");
    return()=>ws.close();
  },[code]);
  if(error) return <div className="min-h-screen bg-pink-950 flex items-center justify-center"><div className="text-center text-white"><div className="text-6xl mb-4">⚠️</div><div className="font-black text-xl mb-4">{error}</div><button onClick={()=>window.location.href=`/game/role-play/join?code=${code}`} className="px-6 py-3 bg-yellow-400 text-pink-900 rounded-xl font-black">Rejoin</button></div></div>;
  if(phase==="joining") return <div className="min-h-screen bg-pink-950 flex items-center justify-center"><div className="text-center text-white"><div className="text-5xl mb-4 animate-pulse">🎭</div><div className="font-black text-xl">Connecting…</div></div></div>;
  if(phase==="waiting") return <div className="min-h-screen bg-gradient-to-br from-pink-600 to-rose-900 flex items-center justify-center"><div className="text-center text-white"><div className="text-7xl mb-6 animate-bounce">🎭</div><h2 className="text-3xl font-black mb-2">Ready, {playerName}!</h2><p className="text-pink-200">Waiting for the teacher to start the first scenario…</p></div></div>;
  if(phase==="ended") return <div className="min-h-screen bg-gradient-to-br from-pink-700 to-rose-950 flex flex-col items-center justify-center p-4 text-white"><div className="text-6xl mb-4">🎭</div><h2 className="text-3xl font-black text-yellow-400 mb-4">Performance Complete!</h2><p className="text-pink-200 mb-8">Fantastic role-playing, {playerName}!</p><button onClick={()=>window.location.href=`/game/role-play/join?code=${code}`} className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-pink-900 rounded-2xl font-black">New Session</button></div>;
  if(!scenario) return <div className="min-h-screen bg-pink-950 flex items-center justify-center"><div className="text-center text-white"><div className="text-5xl mb-4">🎭</div><div className="font-black text-xl">Loading scenario…</div></div></div>;
  const roleName=myRole==="A"?scenario.roleA:scenario.roleB;
  const myLines=scenario.dialogue.filter(l=>l.role===myRole);
  const roleColor=myRole==="A"?"bg-blue-600":"bg-purple-600";
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-700 to-rose-950 flex flex-col text-white">
      <GameNavBar />
      <div className="flex-1 flex flex-col p-4"><div className="flex items-center justify-between mb-4">
        <div className="text-sm font-bold text-pink-300">{playerName} • Scenario {scenarioNum}/{totalScenarios}</div>
        <div className={`px-3 py-1 rounded-full font-black text-sm text-white ${roleColor}`}>Role {myRole}: {roleName}</div>
      </div>
      <div className="bg-pink-900/40 rounded-3xl border border-pink-500/30 p-5 mb-4">
        <h2 className="text-xl font-black text-yellow-400 mb-1">{scenario.title}</h2>
        <p className="text-pink-200 text-sm mb-1">📍 {scenario.setting}</p>
        <p className="text-green-400 text-sm font-bold">🎯 {scenario.goal}</p>
      </div>
      <div className="bg-white/5 rounded-2xl p-4 flex-1 mb-4 overflow-y-auto">
        <div className="text-xs font-black text-pink-300 uppercase tracking-widest mb-3">Full Dialogue</div>
        <div className="space-y-2">
          {scenario.dialogue.map((line,i)=><div key={i} className={`flex gap-3 items-start px-3 py-2 rounded-xl ${line.role===myRole?`${roleColor.replace("bg-","bg-")}/20 border border-${myRole==="A"?"blue":"purple"}-500/30`:"bg-white/5"}`}>
            <span className={`font-black text-xs px-2 py-0.5 rounded-full shrink-0 ${line.role==="A"?"bg-blue-600":"bg-purple-600"} text-white`}>{line.role}</span>
            <span className={`text-sm ${line.role===myRole?"text-white font-bold":"text-white/70"}`}>{line.text}</span>
          </div>)}
        </div>
      </div>
      <div className="bg-white/5 rounded-2xl p-4 mb-4">
        <div className="text-xs font-black text-yellow-400 uppercase tracking-widest mb-2">Your Lines (Role {myRole})</div>
        {myLines.map((l,i)=><div key={i} className="bg-yellow-400/10 rounded-xl px-3 py-2 mb-1 border border-yellow-400/20 text-yellow-200 font-bold text-sm">"{l.text}"</div>)}
      </div>
      {scenario.tips.length>0&&<div className="bg-pink-900/30 rounded-2xl p-3 border border-pink-500/20"><div className="text-xs font-black text-pink-300 uppercase tracking-widest mb-1">💡 Tips</div>{scenario.tips.map((t,i)=><div key={i} className="text-xs text-pink-200">{t}</div>)}</div>}
    </div></div>
  );
}
