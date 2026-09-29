import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Zap, QrCode, Users, Play, ChevronLeft, ChevronRight, Home } from "lucide-react";
import { flashCardWeeks } from "@/lib/flash-cards/flash-card-weeks";
import { apiFetch } from "@/lib/auth";

export default function FlashCardRace() {
  const [, setLocation] = useLocation();
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [mode, setMode] = useState<"teacher" | "qr">("qr");
  const [creating, setCreating] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const WEEKS_PER_PAGE = 10;

  const week = flashCardWeeks[selectedWeek - 1];
  const totalPages = Math.ceil(flashCardWeeks.length / WEEKS_PER_PAGE);
  const visibleWeeks = flashCardWeeks.slice(page * WEEKS_PER_PAGE, (page + 1) * WEEKS_PER_PAGE);

  const createRoom = () => {
    setCreating(true);
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${proto}://${window.location.host}/ws/flash-cards`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "create_room", week: selectedWeek, grade: "1", mode }));
    };

    ws.onmessage = async (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "room_created") {
        setRoomCode(msg.code);
        setCreating(false);
        apiFetch("/api/sessions/start", {
          method: "POST",
          body: JSON.stringify({ gameType: "flash-cards", weekNumber: selectedWeek, roomCode: msg.code, mode }),
        }).catch(() => {});
        if (mode === "teacher") {
          setLocation(`/game/flash-cards/host?code=${msg.code}`);
        } else {
          const joinUrl = `${window.location.origin}/game/flash-cards/join?code=${msg.code}`;
          setQrDataUrl(`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(joinUrl)}&size=220x220&margin=2`);
        }
      }
    };

    ws.onerror = () => setCreating(false);
  };

  const goToHost = () => {
    if (roomCode) setLocation(`/game/flash-cards/host?code=${roomCode}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard"><button className="flex items-center gap-2 text-white/60 hover:text-white font-bold transition-colors"><Home size={18}/> Dashboard</button></Link>
          <span className="text-white/20">·</span>
          <Link href="/games"><button className="flex items-center gap-2 text-white/60 hover:text-white font-bold transition-colors"><ArrowLeft size={18}/> All Games</button></Link>
        </div>

        <div className="text-center mb-8">
          <div className="text-6xl mb-3">⚡</div>
          <h1 className="text-5xl font-display font-black uppercase italic mb-2">Flash Card Race</h1>
          <p className="text-blue-200 text-lg">Students race to name the card — fastest correct answer wins!</p>
        </div>

        {!roomCode ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur rounded-3xl p-6 border border-white/20">
              <h2 className="font-black uppercase tracking-widest text-sm text-blue-200 mb-4">Select Week</h2>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {visibleWeeks.map((w) => (
                  <button
                    key={w.week}
                    onClick={() => setSelectedWeek(w.week)}
                    className={`py-2 rounded-xl font-black text-sm transition-all ${
                      selectedWeek === w.week
                        ? "bg-yellow-400 text-blue-900 shadow-lg scale-105"
                        : "bg-white/10 hover:bg-white/20 border border-white/10"
                    }`}
                  >
                    W{w.week}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm text-blue-200 font-bold">
                  Weeks {page * WEEKS_PER_PAGE + 1}–{Math.min((page + 1) * WEEKS_PER_PAGE, 40)}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              {week && (
                <div className="bg-blue-900/40 rounded-2xl p-4 border border-blue-400/30">
                  <div className="font-black text-yellow-400 text-sm uppercase mb-1">Week {week.week}</div>
                  <div className="font-bold text-lg mb-1">{week.title}</div>
                  <div className="text-blue-200 text-sm mb-2">Topic: {week.topic}</div>
                  <div className="text-blue-300 text-xs">Grammar: {week.grammarFocus}</div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {week.cards.slice(0, 5).map((c) => (
                      <span key={c.word} className="bg-white/10 px-2 py-0.5 rounded-full text-xs font-bold">
                        {c.emoji} {c.word}
                      </span>
                    ))}
                    <span className="text-blue-300 text-xs self-center">+{week.cards.length - 5} more</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white/10 backdrop-blur rounded-3xl p-6 border border-white/20 flex flex-col gap-4">
              <h2 className="font-black uppercase tracking-widest text-sm text-blue-200">Mode</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode("qr")}
                  className={`p-4 rounded-2xl font-black flex flex-col items-center gap-2 transition-all ${
                    mode === "qr" ? "bg-yellow-400 text-blue-900 shadow-xl" : "bg-white/10 hover:bg-white/20 border border-white/10"
                  }`}
                >
                  <QrCode size={28} />
                  <span className="text-sm">QR Interactive</span>
                  <span className={`text-[10px] font-normal ${mode === "qr" ? "text-blue-800" : "text-blue-300"}`}>
                    Students join on iPad
                  </span>
                </button>
                <button
                  onClick={() => setMode("teacher")}
                  className={`p-4 rounded-2xl font-black flex flex-col items-center gap-2 transition-all ${
                    mode === "teacher" ? "bg-white text-blue-900 shadow-xl" : "bg-white/10 hover:bg-white/20 border border-white/10"
                  }`}
                >
                  <Users size={28} />
                  <span className="text-sm">Teacher Mode</span>
                  <span className={`text-[10px] font-normal ${mode === "teacher" ? "text-blue-700" : "text-blue-300"}`}>
                    ALT-controlled only
                  </span>
                </button>
              </div>

              <div className="flex-1 bg-blue-900/40 rounded-2xl p-4 border border-blue-400/30">
                <div className="font-black text-sm text-blue-200 mb-2">How it works</div>
                {mode === "qr" ? (
                  <ul className="text-sm text-blue-100 space-y-1">
                    <li>① ALT creates a session and shares QR</li>
                    <li>② Students scan and join on their iPads</li>
                    <li>③ ALT shows each card on the projector</li>
                    <li>④ Students race to pick the correct word</li>
                    <li>⑤ Fastest correct answer gets the most points</li>
                  </ul>
                ) : (
                  <ul className="text-sm text-blue-100 space-y-1">
                    <li>① ALT opens the host view on the projector</li>
                    <li>② Cards are shown one at a time</li>
                    <li>③ Students shout the answer aloud</li>
                    <li>④ ALT awards points manually</li>
                    <li>⑤ No student devices needed</li>
                  </ul>
                )}
              </div>

              <button
                onClick={createRoom}
                disabled={creating}
                className="w-full py-5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-blue-900 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-2xl"
              >
                <Zap size={24} />
                {creating ? "Creating session…" : "Start Session"}
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto bg-white/10 backdrop-blur rounded-3xl p-8 border border-white/20 text-center">
            <div className="text-green-400 font-black text-sm uppercase tracking-widest mb-2">Session Ready!</div>
            <div className="text-5xl font-black tracking-widest text-yellow-400 mb-6">{roomCode}</div>
            {qrDataUrl && (
              <div className="flex justify-center mb-4">
                <img src={qrDataUrl} alt="QR Code" className="rounded-2xl w-48 h-48 bg-white p-2" />
              </div>
            )}
            <p className="text-blue-200 text-sm mb-6">
              Students go to: <span className="font-bold text-white">/game/flash-cards/join</span>
            </p>
            <button
              onClick={goToHost}
              className="w-full py-5 bg-yellow-400 hover:bg-yellow-300 text-blue-900 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-2xl"
            >
              <Play size={24} /> Open Host Panel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
