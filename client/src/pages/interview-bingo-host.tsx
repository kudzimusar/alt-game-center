import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { ArrowLeft, Users, Trophy, Play, Square, RefreshCw, Wifi, WifiOff, Home } from "lucide-react";
import GameNavBar from "@/components/GameNavBar";
import { motion, AnimatePresence } from "framer-motion";
import { bingoWeeks } from "@/lib/bingo/bingo-weeks";

interface StudentInfo {
  studentId: string;
  name: string;
  markedCount: number;
  hasBingo: boolean;
}

type HostState = "SETUP" | "WAITING" | "PLAYING" | "ENDED";

function QRCode({ url }: { url: string }) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=1a1a2e&margin=12&qzone=1`;
  return (
    <img
      src={src}
      alt="Join QR code"
      className="rounded-2xl shadow-xl border-4 border-white"
      width={220}
      height={220}
    />
  );
}

export default function InterviewBingoHost() {
  const [hostState, setHostState] = useState<HostState>("SETUP");
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [roomCode, setRoomCode] = useState("");
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [connected, setConnected] = useState(false);
  const [bingoAnnouncements, setBingoAnnouncements] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const weekData = bingoWeeks.find(w => w.week === selectedWeek)!;
  const joinUrl = roomCode
    ? `${window.location.origin}/game/interview-bingo/join?room=${roomCode}`
    : "";

  const connect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${proto}//${window.location.host}/ws/bingo`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: "create-room", weekNumber: selectedWeek }));
    };

    ws.onclose = () => {
      setConnected(false);
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "room-created") {
        setRoomCode(msg.roomCode);
        setHostState("WAITING");
      }

      if (msg.type === "student-joined" || msg.type === "student-left" || msg.type === "student-progress") {
        setStudents(msg.students || []);
      }

      if (msg.type === "student-bingo") {
        setStudents(msg.students || []);
        setBingoAnnouncements(prev => [`🎉 ${msg.studentName} got BINGO!`, ...prev.slice(0, 4)]);
      }
    };
  }, [selectedWeek]);

  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  function handleStart() {
    wsRef.current?.send(JSON.stringify({ type: "start-game" }));
    setHostState("PLAYING");
  }

  function handleEnd() {
    wsRef.current?.send(JSON.stringify({ type: "end-game" }));
    setHostState("ENDED");
    setStudents([]);
    setBingoAnnouncements([]);
  }

  function handleNewGame() {
    setHostState("SETUP");
    setRoomCode("");
    setStudents([]);
    setBingoAnnouncements([]);
    wsRef.current?.close();
    wsRef.current = null;
    setConnected(false);
  }

  const sortedStudents = [...students].sort((a, b) => {
    if (a.hasBingo && !b.hasBingo) return -1;
    if (!a.hasBingo && b.hasBingo) return 1;
    return b.markedCount - a.markedCount;
  });

  if (hostState === "SETUP") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white flex flex-col">
        <GameNavBar />
        <div className="max-w-2xl mx-auto px-6 py-8 w-full">

          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-4 text-sm font-bold uppercase tracking-widest">
              <Users size={16} /> Teacher — Host a Room
            </div>
            <h1 className="text-4xl font-black mb-3" style={{ fontFamily: "Fredoka, sans-serif" }}>
              Interview Bingo
            </h1>
            <p className="text-white/70">Create a room. Students join on their iPads. Guide the class!</p>
          </div>

          <div className="space-y-3 mb-8">
            <p className="text-xs font-black uppercase tracking-widest text-white/40">Choose a week</p>
            {bingoWeeks.map(week => (
              <button
                key={week.week}
                onClick={() => setSelectedWeek(week.week)}
                className={`w-full rounded-2xl p-5 text-left transition-all border-2 ${
                  selectedWeek === week.week
                    ? "bg-white text-gray-900 border-white shadow-xl"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className={`text-xs font-black uppercase ${selectedWeek === week.week ? "text-purple-600" : "text-white/40"}`}>
                      Week {week.week} · Grade {week.grade}
                    </span>
                    <p className={`font-black text-lg ${selectedWeek === week.week ? "text-gray-900" : "text-white"}`}>
                      {week.theme}
                    </p>
                    <p className={`text-sm ${selectedWeek === week.week ? "text-orange-600" : "text-white/50"}`}>
                      {week.grammar}
                    </p>
                  </div>
                  <div className={`text-3xl font-black w-12 h-12 rounded-xl flex items-center justify-center ${selectedWeek === week.week ? "bg-purple-100 text-purple-600" : "bg-white/10"}`}>
                    {week.week}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={connect}
            className="w-full py-5 bg-gradient-to-r from-orange-400 to-pink-500 font-black text-xl rounded-3xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            style={{ fontFamily: "Fredoka, sans-serif" }}
          >
            Create Room →
          </button>
        </div>
      </div>
    );
  }

  if (hostState === "ENDED") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white flex flex-col">
        <GameNavBar />
        <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-4">🏆</div>
          <h2 className="text-5xl font-black mb-4" style={{ fontFamily: "Fredoka, sans-serif" }}>Game Over!</h2>
          <p className="text-white/70 mb-8">Great work, everyone! Here's how it went:</p>

          <div className="bg-white/10 rounded-2xl p-6 mb-8 space-y-2 text-left">
            {sortedStudents.slice(0, 5).map((s, i) => (
              <div key={s.studentId} className="flex items-center gap-3">
                <span className="text-lg font-black w-8 text-center">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}</span>
                <span className="font-bold flex-1">{s.name}</span>
                {s.hasBingo && <span className="text-yellow-300 font-black text-sm">BINGO!</span>}
                <span className="text-white/50 text-sm">{s.markedCount}/16</span>
              </div>
            ))}
          </div>

          <button onClick={handleNewGame} className="w-full py-4 bg-white text-purple-900 font-black text-lg rounded-2xl shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
            <RefreshCw size={20} /> New Game
          </button>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white flex flex-col">
      <GameNavBar />
      <div className="max-w-6xl mx-auto px-4 py-4 w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${connected ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
              {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
              {connected ? "Connected" : "Disconnected"}
            </div>
            <span className="font-black text-sm">{weekData.theme} · Week {weekData.week}</span>
          </div>

          <div className="flex gap-2">
            {hostState === "WAITING" && (
              <button
                onClick={handleStart}
                disabled={students.length === 0}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-400 disabled:bg-white/20 disabled:cursor-not-allowed font-black px-5 py-2.5 rounded-xl transition-all text-sm"
              >
                <Play size={16} /> Start Game
              </button>
            )}
            {hostState === "PLAYING" && (
              <button
                onClick={handleEnd}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-400 font-black px-5 py-2.5 rounded-xl transition-all text-sm"
              >
                <Square size={16} /> End Game
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur rounded-3xl p-6 text-center">
              <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-3">
                {hostState === "WAITING" ? "Students scan this to join" : "Room Code"}
              </p>
              <div className="text-6xl font-black tracking-widest mb-4 text-yellow-300" style={{ fontFamily: "Fredoka, sans-serif" }}>
                {roomCode}
              </div>
              {joinUrl && <QRCode url={joinUrl} />}
              <p className="text-xs text-white/40 mt-3 break-all">{joinUrl}</p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
              <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-2">Grammar focus</p>
              <p className="font-bold text-sm text-yellow-300">{weekData.grammar}</p>
              <p className="text-xs text-white/60 mt-1">{weekData.description}</p>
            </div>

            {bingoAnnouncements.length > 0 && (
              <div className="space-y-2">
                <AnimatePresence>
                  {bingoAnnouncements.map((ann, i) => (
                    <motion.div
                      key={ann + i}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-yellow-400 text-yellow-900 rounded-2xl p-3 font-black text-center"
                    >
                      {ann}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="col-span-2">
            <div className="bg-white/10 backdrop-blur rounded-3xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-black uppercase tracking-widest text-white/50">
                  Students {hostState === "WAITING" ? "— Waiting to start" : "— Live progress"}
                </p>
                <span className="bg-white/20 rounded-full px-3 py-1 text-sm font-black">{students.length} joined</span>
              </div>

              {students.length === 0 ? (
                <div className="text-center py-16 text-white/30">
                  <Users size={40} className="mx-auto mb-3 opacity-40" />
                  <p className="font-bold">Waiting for students to join...</p>
                  <p className="text-sm">Share the code or QR code on the big screen</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-[520px] overflow-y-auto pr-1">
                  {sortedStudents.map((s) => (
                    <motion.div
                      key={s.studentId}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-2xl p-4 transition-all ${
                        s.hasBingo
                          ? "bg-yellow-400 text-yellow-900"
                          : "bg-white/10 border border-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-black truncate">{s.name}</span>
                        {s.hasBingo && (
                          <span className="flex items-center gap-1 text-xs font-black bg-yellow-600/20 rounded-full px-2 py-0.5">
                            <Trophy size={10} /> BINGO
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-3.5 h-3.5 rounded-sm transition-all ${
                              i < s.markedCount
                                ? s.hasBingo ? "bg-yellow-700" : "bg-green-400"
                                : "bg-white/15"
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs mt-1 font-bold ${s.hasBingo ? "text-yellow-700" : "text-white/50"}`}>
                        {s.markedCount}/16 squares
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
