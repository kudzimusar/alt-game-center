import { useState } from "react";
import { useLocation } from "wouter";
import { Mic, User, Users } from "lucide-react";
import GameNavBar from "@/components/GameNavBar";
export default function SpellingBeeJoin(){
  const [,setLocation]=useLocation();
  const params=new URLSearchParams(window.location.search);
  const [code,setCode]=useState(params.get("code")||"");
  const [name,setName]=useState(""); const [group,setGroup]=useState<"A"|"B"|"C"|"D"|"">("");
  const [error,setError]=useState("");
  const colors:Record<string,string>={A:"bg-red-500 border-red-400",B:"bg-blue-500 border-blue-400",C:"bg-green-500 border-green-400",D:"bg-yellow-500 border-yellow-400"};
  const join=()=>{if(!code.trim()||code.trim().length<4){setError("Enter a valid room code.");return;}if(!name.trim()){setError("Enter your name.");return;}setError("");setLocation(`/game/spelling-bee/play?code=${code.trim().toUpperCase()}&name=${encodeURIComponent(name.trim())}&group=${group}`);};
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-500 via-orange-600 to-yellow-700 flex flex-col">
      <GameNavBar />
      <div className="flex-1 flex items-center justify-center p-4"><div className="w-full max-w-sm">
        <div className="text-center mb-8"><div className="text-6xl mb-3">🐝</div><h1 className="text-4xl font-black text-white uppercase italic">Spelling Bee</h1><p className="text-amber-100 mt-2">Join the game!</p></div>
        <div className="bg-white/10 backdrop-blur rounded-3xl p-6 border border-white/20 space-y-4">
          <div><label className="text-amber-100 text-xs font-black uppercase tracking-widest block mb-2">Room Code</label><input type="text" value={code} onChange={e=>setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,5))} placeholder="XXXXX" maxLength={5} onKeyDown={e=>e.key==="Enter"&&join()} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-center text-2xl font-black tracking-widest placeholder-white/30 focus:outline-none focus:border-white"/></div>
          <div><label className="text-amber-100 text-xs font-black uppercase tracking-widest block mb-2">Your Name</label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-200" size={18}/><input type="text" value={name} onChange={e=>setName(e.target.value.slice(0,20))} placeholder="Enter your name" maxLength={20} onKeyDown={e=>e.key==="Enter"&&join()} className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 font-bold focus:outline-none focus:border-white"/></div></div>
          <div><label className="text-amber-100 text-xs font-black uppercase tracking-widest block mb-2 flex items-center gap-2"><Users size={14}/> Team (optional)</label><div className="grid grid-cols-5 gap-2"><button onClick={()=>setGroup("")} className={`py-2 rounded-xl font-black text-sm border-2 ${group===""?"bg-white text-amber-900 border-white":"bg-white/10 text-white/60 border-white/10 hover:bg-white/20"}`}>None</button>{(["A","B","C","D"] as const).map(g=><button key={g} onClick={()=>setGroup(g)} className={`py-2 rounded-xl font-black text-sm border-2 text-white ${group===g?`${colors[g]} shadow-lg scale-105`:"bg-white/10 border-white/10 hover:bg-white/20"}`}>{g}</button>)}</div></div>
          {error&&<div className="bg-red-900/40 border border-red-600/40 rounded-xl px-4 py-2 text-red-300 text-sm font-bold text-center">{error}</div>}
          <button onClick={join} disabled={!code.trim()||!name.trim()} className="w-full py-5 bg-white hover:bg-amber-50 disabled:opacity-50 text-amber-900 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-2xl"><Mic size={22}/> Let's Spell!</button>
        </div>
        <p className="text-center text-amber-200 text-xs mt-4">Ask your teacher for the room code</p>
      </div></div>
    </div>
  );
}
