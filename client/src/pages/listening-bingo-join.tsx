import { useState } from "react";
import { useLocation } from "wouter";
import { Radio, User } from "lucide-react";
import GameNavBar from "@/components/GameNavBar";
export default function ListeningBingoJoin(){
  const [,setLocation]=useLocation();
  const params=new URLSearchParams(window.location.search);
  const [code,setCode]=useState(params.get("code")||"");
  const [name,setName]=useState(""); const [error,setError]=useState("");
  const join=()=>{if(!code.trim()||code.trim().length<4){setError("Enter a valid room code.");return;}if(!name.trim()){setError("Enter your name.");return;}setError("");setLocation(`/game/listening-bingo/play?code=${code.trim().toUpperCase()}&name=${encodeURIComponent(name.trim())}`);};
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 flex flex-col">
      <GameNavBar />
      <div className="flex-1 flex items-center justify-center p-4"><div className="w-full max-w-sm">
        <div className="text-center mb-8"><div className="text-6xl mb-3">🎱</div><h1 className="text-4xl font-black text-white uppercase italic">Listening Bingo</h1><p className="text-teal-200 mt-2">Join the game!</p></div>
        <div className="bg-white/10 backdrop-blur rounded-3xl p-6 border border-white/20 space-y-4">
          <div><label className="text-teal-200 text-xs font-black uppercase tracking-widest block mb-2">Room Code</label><input type="text" value={code} onChange={e=>setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,5))} placeholder="XXXXX" maxLength={5} onKeyDown={e=>e.key==="Enter"&&join()} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-center text-2xl font-black tracking-widest placeholder-white/30 focus:outline-none focus:border-yellow-400"/></div>
          <div><label className="text-teal-200 text-xs font-black uppercase tracking-widest block mb-2">Your Name</label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-300" size={18}/><input type="text" value={name} onChange={e=>setName(e.target.value.slice(0,20))} placeholder="Enter your name" maxLength={20} onKeyDown={e=>e.key==="Enter"&&join()} className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 font-bold focus:outline-none focus:border-yellow-400"/></div></div>
          {error&&<div className="bg-red-900/40 border border-red-600/40 rounded-xl px-4 py-2 text-red-300 text-sm font-bold text-center">{error}</div>}
          <button onClick={join} disabled={!code.trim()||!name.trim()} className="w-full py-5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-teal-900 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-2xl"><Radio size={22}/> Get My Card!</button>
        </div>
        <p className="text-center text-teal-400 text-xs mt-4">Ask your teacher for the room code</p>
      </div></div>
    </div>
  );
}
