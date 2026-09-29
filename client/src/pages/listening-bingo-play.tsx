import { useState, useEffect, useRef } from "react";
import GameNavBar from "@/components/GameNavBar";
type Phase="joining"|"waiting"|"playing"|"ended";
interface BingoCell { word:string; emoji:string; index:number; marked:boolean; }
export default function ListeningBingoPlay(){
  const params=new URLSearchParams(window.location.search);
  const code=params.get("code")||""; const playerName=decodeURIComponent(params.get("name")||"Player");
  const [phase,setPhase]=useState<Phase>("joining");
  const [card,setCard]=useState<BingoCell[]>([]);
  const [lastCalled,setLastCalled]=useState<{word:string;emoji:string}|null>(null);
  const [bingo,setBingo]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const wsRef=useRef<WebSocket|null>(null);
  useEffect(()=>{
    if(!code||!playerName){setError("Missing info.");return;}
    const proto=window.location.protocol==="https:"?"wss":"ws";
    const ws=new WebSocket(`${proto}://${window.location.host}/ws/listening-bingo`);
    wsRef.current=ws;
    ws.onopen=()=>ws.send(JSON.stringify({type:"join",code,name:playerName}));
    ws.onmessage=(e)=>{
      const msg=JSON.parse(e.data);
      switch(msg.type){
        case "joined":setPhase("waiting");break;
        case "card_dealt":setPhase("playing");setCard(msg.card.map((c:any,i:number)=>({...c,marked:false,index:i})));break;
        case "word_called":setLastCalled({word:msg.word,emoji:msg.emoji});break;
        case "bingo_confirmed":setBingo(true);break;
        case "game_over":setPhase("ended");break;
        case "error":setError(msg.message);break;
      }
    };
    ws.onerror=()=>setError("Connection lost.");
    return()=>ws.close();
  },[code]);
  const markCell=(i:number)=>{
    const newCard=[...card]; newCard[i]={...newCard[i],marked:!newCard[i].marked};
    setCard(newCard);
    checkBingo(newCard);
  };
  const checkBingo=(c:BingoCell[])=>{
    const m=c.map(cell=>cell.marked);
    const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for(const line of lines){
      if(line.every(i=>m[i])){
        if(!bingo){
          setBingo(true);
          if(wsRef.current?.readyState===1) wsRef.current.send(JSON.stringify({type:"claim_bingo",pattern:line.join("-")}));
        }
        break;
      }
    }
  };
  if(error) return <div className="min-h-screen bg-teal-950 flex items-center justify-center"><div className="text-center text-white"><div className="text-6xl mb-4">⚠️</div><div className="font-black text-xl mb-4">{error}</div><button onClick={()=>window.location.href=`/game/listening-bingo/join?code=${code}`} className="px-6 py-3 bg-yellow-400 text-teal-900 rounded-xl font-black">Rejoin</button></div></div>;
  if(phase==="joining") return <div className="min-h-screen bg-teal-950 flex items-center justify-center"><div className="text-center text-white"><div className="text-5xl mb-4 animate-pulse">🎱</div><div className="font-black text-xl">Connecting…</div></div></div>;
  if(phase==="waiting") return <div className="min-h-screen bg-gradient-to-br from-teal-600 to-cyan-800 flex items-center justify-center"><div className="text-center text-white"><div className="text-7xl mb-6 animate-bounce">🎱</div><h2 className="text-3xl font-black mb-2">Ready, {playerName}!</h2><p className="text-teal-200">Waiting for the teacher to deal your bingo card…</p></div></div>;
  if(phase==="ended") return <div className="min-h-screen bg-gradient-to-br from-teal-700 to-cyan-950 flex flex-col items-center justify-center p-4 text-white"><div className="text-6xl mb-4">{bingo?"🏆":"🎱"}</div><h2 className="text-3xl font-black text-yellow-400 mb-4">Game Over!</h2><p className="text-teal-200 mb-8">{bingo?"You got BINGO! 🎉":"Great listening practice!"}</p><button onClick={()=>window.location.href=`/game/listening-bingo/join?code=${code}`} className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-teal-900 rounded-2xl font-black">Play Again</button></div>;
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-700 to-cyan-950 flex flex-col text-white">
      <GameNavBar />
      <div className="flex-1 flex flex-col p-4"><div className="flex items-center justify-between mb-3">
        <div className="text-sm font-bold text-teal-300">{playerName}</div>
        {bingo&&<div className="bg-yellow-400 text-teal-900 font-black px-4 py-1 rounded-full text-sm animate-bounce">🎉 BINGO!</div>}
      </div>
      {lastCalled&&<div className={`rounded-2xl p-3 text-center mb-4 border-2 transition-all ${bingo?"bg-yellow-400/20 border-yellow-400":"bg-teal-900/40 border-teal-500/30 animate-pulse"}`}>
        <div className="text-xs font-black text-teal-300 uppercase tracking-widest mb-1">Last called</div>
        <div className="text-4xl mb-1">{lastCalled.emoji}</div>
        <div className="text-xl font-black text-yellow-400">{lastCalled.word}</div>
      </div>}
      <div className="flex-1 grid grid-cols-3 gap-3 content-center">
        {card.map((cell,i)=><button key={i} onClick={()=>markCell(i)} className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 border-2 transition-all active:scale-95 ${cell.marked?"bg-teal-500 border-teal-400 shadow-lg shadow-teal-500/30":"bg-white/10 hover:bg-white/20 border-white/20"}`}>
          <div className="text-3xl">{cell.emoji}</div>
          <div className="text-[10px] font-bold text-center leading-tight">{cell.word}</div>
          {cell.marked&&<div className="text-lg">✓</div>}
        </button>)}
      </div>
      <div className="mt-4 text-center text-teal-400 text-xs">Tap a word when you hear it called! Get a row, column, or diagonal to win.</div>
    </div></div>
  );
}
