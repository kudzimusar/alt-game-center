import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Zap, QrCode, Users, Play, ChevronLeft, ChevronRight, Home } from "lucide-react";
import { flashCardWeeks } from "@/lib/flash-cards/flash-card-weeks";
export default function TranslationDash() {
  const [,setLocation]=useLocation();
  const [selectedWeek,setSelectedWeek]=useState(1);
  const [mode,setMode]=useState<"qr"|"teacher">("qr");
  const [creating,setCreating]=useState(false);
  const [roomCode,setRoomCode]=useState<string|null>(null);
  const [qrUrl,setQrUrl]=useState<string|null>(null);
  const [page,setPage]=useState(0);
  const wsRef=useRef<WebSocket|null>(null);
  const PER_PAGE=10; const totalPages=Math.ceil(flashCardWeeks.length/PER_PAGE);
  const visible=flashCardWeeks.slice(page*PER_PAGE,(page+1)*PER_PAGE);
  const week=flashCardWeeks[selectedWeek-1];
  const createRoom=()=>{
    setCreating(true);
    const proto=window.location.protocol==="https:"?"wss":"ws";
    const ws=new WebSocket(`${proto}://${window.location.host}/ws/translation-dash`);
    wsRef.current=ws;
    ws.onopen=()=>ws.send(JSON.stringify({type:"create_room",week:selectedWeek,mode}));
    ws.onmessage=(e)=>{
      const msg=JSON.parse(e.data);
      if(msg.type==="room_created"){setRoomCode(msg.code);setCreating(false);if(mode==="teacher"){setLocation(`/game/translation-dash/host?code=${msg.code}`);return;}const u=`${window.location.origin}/game/translation-dash/join?code=${msg.code}`;setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(u)}&size=220x220&margin=2`);}
    };
    ws.onerror=()=>setCreating(false);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-orange-600 to-red-700 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard"><button className="flex items-center gap-2 text-white/60 hover:text-white font-bold transition-colors"><Home size={18}/> Dashboard</button></Link>
          <span className="text-white/20">·</span>
          <Link href="/games"><button className="flex items-center gap-2 text-white/60 hover:text-white font-bold transition-colors"><ArrowLeft size={18}/> All Games</button></Link>
        </div>
        <div className="text-center mb-8"><div className="text-6xl mb-3">⚡</div><h1 className="text-5xl font-display font-black uppercase italic mb-2">Translation Dash</h1><p className="text-orange-100 text-lg">Read the clue — find the matching word — race your rivals!</p></div>
        {!roomCode?(
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur rounded-3xl p-6 border border-white/20">
              <h2 className="font-black uppercase tracking-widest text-sm text-orange-200 mb-4">Select Week</h2>
              <div className="grid grid-cols-5 gap-2 mb-4">{visible.map(w=><button key={w.week} onClick={()=>setSelectedWeek(w.week)} className={`py-2 rounded-xl font-black text-sm transition-all ${selectedWeek===w.week?"bg-yellow-400 text-orange-900 shadow-lg scale-105":"bg-white/10 hover:bg-white/20 border border-white/10"}`}>W{w.week}</button>)}</div>
              <div className="flex items-center justify-between mb-4">
                <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30"><ChevronLeft size={18}/></button>
                <span className="text-sm text-orange-200 font-bold">Weeks {page*PER_PAGE+1}–{Math.min((page+1)*PER_PAGE,40)}</span>
                <button onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} disabled={page===totalPages-1} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30"><ChevronRight size={18}/></button>
              </div>
              {week&&<div className="bg-orange-900/40 rounded-2xl p-4 border border-orange-400/30"><div className="font-black text-yellow-400 text-sm uppercase mb-1">Week {week.week} — {week.title}</div><div className="text-orange-200 text-sm mb-2">{week.topic} vocabulary</div><div className="text-orange-300 text-xs">MCQ: read the hint, pick the matching word</div></div>}
            </div>
            <div className="bg-white/10 backdrop-blur rounded-3xl p-6 border border-white/20 flex flex-col gap-4">
              <h2 className="font-black uppercase tracking-widest text-sm text-orange-200">Mode</h2>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={()=>setMode("qr")} className={`p-4 rounded-2xl font-black flex flex-col items-center gap-2 ${mode==="qr"?"bg-yellow-400 text-orange-900 shadow-xl":"bg-white/10 hover:bg-white/20 border border-white/10"}`}><QrCode size={28}/><span className="text-sm">QR Interactive</span><span className={`text-[10px] font-normal ${mode==="qr"?"text-orange-800":"text-orange-300"}`}>Students race to answer</span></button>
                <button onClick={()=>setMode("teacher")} className={`p-4 rounded-2xl font-black flex flex-col items-center gap-2 ${mode==="teacher"?"bg-white text-orange-900 shadow-xl":"bg-white/10 hover:bg-white/20 border border-white/10"}`}><Users size={28}/><span className="text-sm">Teacher Mode</span><span className={`text-[10px] font-normal ${mode==="teacher"?"text-orange-700":"text-orange-300"}`}>ALT-controlled only</span></button>
              </div>
              <div className="flex-1 bg-orange-900/40 rounded-2xl p-4 border border-orange-400/30 text-sm text-orange-100 space-y-1">
                <div className="font-black text-sm text-orange-200 mb-2">How it works</div>
                <p>① A clue/hint appears on student iPads</p><p>② Students pick which word matches the clue</p><p>③ First correct answer = most points</p><p>④ 10 rounds per session</p>
              </div>
              <button onClick={createRoom} disabled={creating} className="w-full py-5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-orange-900 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-2xl"><Zap size={24}/>{creating?"Creating…":"Dash!"}</button>
            </div>
          </div>
        ):(
          <div className="max-w-md mx-auto bg-white/10 backdrop-blur rounded-3xl p-8 border border-white/20 text-center">
            <div className="text-green-400 font-black text-sm uppercase tracking-widest mb-2">Session Ready!</div>
            <div className="text-5xl font-black tracking-widest text-yellow-400 mb-6">{roomCode}</div>
            {qrUrl&&<div className="flex justify-center mb-4"><img src={qrUrl} alt="QR" className="rounded-2xl w-48 h-48 bg-white p-2"/></div>}
            <p className="text-orange-200 text-sm mb-6">Students go to: <span className="font-bold text-white">/game/translation-dash/join</span></p>
            <button onClick={()=>setLocation(`/game/translation-dash/host?code=${roomCode}`)} className="w-full py-5 bg-yellow-400 hover:bg-yellow-300 text-orange-900 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-2xl"><Play size={24}/> Open Host Panel</button>
          </div>
        )}
      </div>
    </div>
  );
}
