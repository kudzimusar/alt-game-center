import { useState, useEffect, useRef } from "react";
import GameNavBar from "@/components/GameNavBar";

interface CardInfo { word: string; emoji: string; hint: string; }
type Phase = "joining" | "waiting" | "calling" | "grabbed" | "ended";

export default function KarutaPlay() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code") || "";
  const playerName = decodeURIComponent(params.get("name") || "Player");
  const playerGroup = (params.get("group") || "") as "A" | "B" | "C" | "D" | "";

  const [phase, setPhase] = useState<Phase>("joining");
  const [studentId, setStudentId] = useState<string | null>(null);
  const [cards, setCards] = useState<CardInfo[]>([]);
  const [board, setBoard] = useState<number[]>([]);
  const [calledIndex, setCalledIndex] = useState<number | null>(null);
  const [grabbed, setGrabbed] = useState<{ cardIndex: number; by: string; isYou: boolean } | null>(null);
  const [myGrab, setMyGrab] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [cardsWon, setCardsWon] = useState(0);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [finalScoreboard, setFinalScoreboard] = useState<{ name: string; score: number; cardsWon: number; rank: number }[]>([]);
  const [grabResult, setGrabResult] = useState<{ correct: boolean; points: number } | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = (s: number) => {
    setTimer(s);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimer((t) => { if (t <= 1) { clearInterval(timerRef.current!); return 0; } return t - 1; }), 1000);
  };

  useEffect(() => {
    if (!code || !playerName) { setError("Missing room code or name."); return; }
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${proto}://${window.location.host}/ws/karuta`);
    wsRef.current = ws;
    ws.onopen = () => ws.send(JSON.stringify({ type: "join", code, name: playerName, group: playerGroup || null }));
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      switch (msg.type) {
        case "joined":
          setStudentId(msg.studentId);
          setCards(msg.cards || []);
          setBoard(msg.board || msg.cards?.map((_: any, i: number) => i) || []);
          setPhase("waiting");
          break;
        case "game_started":
          setPhase("calling");
          break;
        case "card_called":
          setCalledIndex(msg.cardIndex);
          setMyGrab(null);
          setGrabbed(null);
          setGrabResult(null);
          setPhase("calling");
          startTimer(msg.timeLimit || 10);
          break;
        case "grab_result":
          setGrabResult({ correct: msg.correct, points: msg.points });
          if (msg.correct) { setCardsWon((c) => c + 1); setScore((s) => s + msg.points); }
          break;
        case "card_locked":
          setPhase("grabbed");
          if (timerRef.current) clearInterval(timerRef.current);
          if (msg.board) setBoard(msg.board);
          if (msg.winner) setGrabbed({ cardIndex: msg.cardIndex, by: msg.winner, isYou: msg.winner === playerName });
          break;
        case "game_over":
          setPhase("ended");
          setFinalScoreboard(msg.scoreboard || []);
          break;
        case "error": setError(msg.message); break;
      }
    };
    ws.onerror = () => setError("Connection lost.");
    return () => { ws.close(); if (timerRef.current) clearInterval(timerRef.current); };
  }, [code]);

  const handleGrab = (cardIndex: number) => {
    if (phase !== "calling" || myGrab !== null) return;
    setMyGrab(cardIndex);
    if (wsRef.current?.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: "grab_card", cardIndex, timestamp: Date.now() }));
    }
  };

  if (error) return (
    <div className="min-h-screen bg-red-950 flex items-center justify-center p-4">
      <div className="text-center text-white">
        <div className="text-6xl mb-4">⚠️</div>
        <div className="font-black text-xl mb-2">Error</div>
        <div className="text-red-300 mb-6">{error}</div>
        <button onClick={() => window.location.href = `/game/karuta/join?code=${code}`} className="px-6 py-3 bg-yellow-400 text-red-900 rounded-xl font-black">Rejoin</button>
      </div>
    </div>
  );

  if (phase === "joining") return (
    <div className="min-h-screen bg-red-950 flex items-center justify-center">
      <div className="text-center text-white"><div className="text-5xl mb-4 animate-pulse">🃏</div><div className="font-black text-xl">Connecting…</div></div>
    </div>
  );

  if (phase === "waiting") return (
    <div className="min-h-screen bg-gradient-to-br from-red-700 to-pink-900 flex items-center justify-center p-4">
      <div className="text-center text-white max-w-sm">
        <div className="text-7xl mb-6 animate-bounce">🃏</div>
        <h2 className="text-3xl font-black mb-2">Ready, {playerName}!</h2>
        <p className="text-red-200 mb-6">Waiting for the teacher to start…</p>
        <div className="bg-white/10 rounded-2xl p-4 mb-4">
          <div className="text-xs text-red-300 uppercase tracking-widest mb-1">Cards this round</div>
          <div className="flex flex-wrap gap-2 justify-center">
            {cards.map((c, i) => <span key={i} className="bg-white/10 px-2 py-1 rounded-lg text-lg">{c.emoji}</span>)}
          </div>
        </div>
        {playerGroup && <div className="bg-white/10 rounded-xl px-4 py-2 inline-block font-black">Team {playerGroup}</div>}
      </div>
    </div>
  );

  if (phase === "ended") {
    const myRank = finalScoreboard.findIndex((s) => s.name === playerName) + 1;
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-800 to-pink-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-3xl font-black text-yellow-400 mb-2">Game Over!</h2>
        <p className="text-red-200 mb-2">You won <span className="font-black text-white">{cardsWon}</span> cards — <span className="font-black">{score}</span> points</p>
        {myRank > 0 && <div className="bg-white/10 rounded-2xl px-8 py-3 mb-6 text-center"><div className="text-sm text-red-300 uppercase">Your Rank</div><div className="text-4xl font-black text-yellow-400">#{myRank}</div></div>}
        <div className="w-full max-w-sm space-y-2">
          {finalScoreboard.slice(0, 5).map((s, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${s.name === playerName ? "bg-yellow-400/20 border border-yellow-400/50" : "bg-white/10"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? "bg-yellow-400 text-red-900" : "bg-white/20"}`}>{i + 1}</div>
              <div className="flex-1 font-bold">{s.name}</div>
              <div className="text-red-300 text-xs">{s.cardsWon} cards</div>
              <div className="font-black text-yellow-400">{s.score}</div>
            </div>
          ))}
        </div>
        <button onClick={() => window.location.href = `/game/karuta/join?code=${code}`} className="mt-8 px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-red-900 rounded-2xl font-black">Play Again</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-800 to-pink-950 flex flex-col text-white">
      <GameNavBar />
      <div className="flex-1 flex flex-col p-3"><div className="flex items-center justify-between mb-3">
        <div className="text-sm font-bold text-red-300">{playerName}</div>
        <div className="flex items-center gap-3">
          <div className="bg-white/10 rounded-xl px-3 py-1 text-xs font-bold text-red-300">{cardsWon} cards</div>
          <div className="bg-white/10 rounded-xl px-3 py-1 text-sm font-black text-yellow-400">{score} pts</div>
        </div>
      </div>

      {/* Called word banner */}
      {(phase === "calling" || phase === "grabbed") && calledIndex !== null && cards[calledIndex] && (
        <div className={`rounded-2xl p-4 text-center mb-3 border-2 transition-all ${phase === "calling" ? "bg-yellow-400/20 border-yellow-400 animate-pulse" : "bg-white/10 border-white/10"}`}>
          <div className="text-xs font-black uppercase tracking-widest text-red-200 mb-1">
            {phase === "calling" ? "🔊 LISTEN — grab the card!" : "🔒 Locked"}
          </div>
          {phase === "grabbed" && grabbed && (
            <div className={`font-black text-lg ${grabbed.isYou ? "text-green-400" : "text-white"}`}>
              {grabbed.isYou ? "You grabbed it! ✅" : `${grabbed.by} grabbed it!`}
            </div>
          )}
          {timer > 0 && phase === "calling" && <div className="text-yellow-400 font-black text-2xl">{timer}s</div>}
        </div>
      )}

      {/* Grab result notification */}
      {grabResult && phase === "grabbed" && (
        <div className={`rounded-xl px-4 py-2 text-center mb-3 font-black ${grabResult.correct ? "bg-green-800/50 text-green-300" : "bg-red-800/50 text-red-300"}`}>
          {grabResult.correct ? `✅ Correct! +${grabResult.points} pts` : `❌ Wrong card! ${grabResult.points} pts`}
        </div>
      )}

      {/* Card Grid */}
      <div className="flex-1 grid grid-cols-3 gap-3 content-start">
        {cards.map((c, i) => {
          const onBoard = board.includes(i);
          const isCalled = i === calledIndex;
          const isMyGrab = myGrab === i;
          const wasGrabbed = !onBoard && grabbed?.cardIndex === i;

          return (
            <button
              key={i}
              onClick={() => handleGrab(i)}
              disabled={!onBoard || phase !== "calling" || myGrab !== null}
              className={`relative aspect-square rounded-2xl font-black transition-all flex flex-col items-center justify-center gap-1 border-2 p-2
                ${!onBoard ? "bg-white/5 border-white/10 opacity-30 cursor-not-allowed" :
                  isMyGrab ? "bg-yellow-400/20 border-yellow-400 scale-95" :
                  isCalled && phase === "calling" ? "bg-red-500/20 border-red-400 shadow-lg shadow-red-500/30 scale-[1.02]" :
                  "bg-white/10 hover:bg-white/20 border-white/20 active:scale-95"}`}
            >
              <div className="text-3xl">{c.emoji}</div>
              <div className="text-[10px] text-white/80 text-center leading-tight">{c.word}</div>
              {!onBoard && <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40"><span className="text-[9px] font-black text-white/40 uppercase">Taken</span></div>}
            </button>
          );
        })}
      </div>

      {phase === "grabbed" && board.length > 0 && (
        <div className="mt-3 text-center text-red-300 text-sm animate-pulse">Next card coming…</div>
      )}
    </div></div>
  );
}
