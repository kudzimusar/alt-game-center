import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { apiFetch } from "@/lib/auth";
import { ArrowLeft, Home } from "lucide-react";

function getDeviceId(): string {
  let id = localStorage.getItem("cb_device_id");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("cb_device_id", id);
  }
  return id;
}

export default function ClassBattleJoin() {
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const prefilledCode = params.get("code") || "";

  const [code, setCode] = useState(prefilledCode.toUpperCase());
  const [name, setName] = useState(localStorage.getItem("cb_student_name") || "");
  const [group, setGroup] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (prefilledCode.length === 5) checkSession(prefilledCode);
  }, []);

  async function checkSession(c: string) {
    setChecking(true);
    setError("");
    try {
      const res = await fetch(`/api/class-battle/sessions/${c.toUpperCase()}`);
      if (!res.ok) throw new Error("Session not found");
      const data = await res.json();
      if (data.status === "ended") throw new Error("This session has ended.");
      if (data.rosterLocked) throw new Error("The teacher has locked the roster.");
      setSessionInfo(data);
    } catch (err: any) {
      setError(err.message);
      setSessionInfo(null);
    } finally {
      setChecking(false);
    }
  }

  function handleCodeChange(v: string) {
    const clean = v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5);
    setCode(clean);
    if (clean.length === 5) checkSession(clean);
    else setSessionInfo(null);
  }

  async function join() {
    if (!name.trim()) return setError("Please enter your name.");
    if (!code || code.length !== 5) return setError("Enter the 5-character session code.");
    if (!sessionInfo) return setError("Please wait for session verification.");

    setLoading(true);
    setError("");
    localStorage.setItem("cb_student_name", name.trim());

    // Store join data in sessionStorage and navigate to play
    sessionStorage.setItem("cb_student", JSON.stringify({
      code,
      name: name.trim(),
      group,
      deviceId: getDeviceId(),
      mode: sessionInfo?.mode,
      topic: sessionInfo?.topic,
      grade: sessionInfo?.grade,
    }));
    setLocation(`/class-battle/play?code=${code}`);
  }

  const GROUPS = ["A", "B", "C", "D"];
  const GROUP_COLORS: Record<string, string> = { A: "bg-blue-500", B: "bg-green-500", C: "bg-orange-500", D: "bg-purple-500" };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6 text-sm">
          <Link href="/dashboard">
            <span className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors cursor-pointer">
              <Home size={16} /> Dashboard
            </span>
          </Link>
          <Link href="/games">
            <span className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors cursor-pointer">
              <ArrowLeft size={16} /> Back to Games
            </span>
          </Link>
        </div>
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">⚡</div>
          <h1 className="text-4xl font-black text-white mb-2">ClassBattle</h1>
          <p className="text-slate-400">Join your teacher's live session</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          {/* Code input */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-3">Session Code</label>
            <input
              type="text"
              value={code}
              onChange={e => handleCodeChange(e.target.value)}
              placeholder="XXXXX"
              maxLength={5}
              className="w-full text-center text-4xl font-black tracking-[0.3em] py-4 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors text-slate-900 uppercase"
            />
            {checking && <p className="text-center text-sm text-blue-500 mt-2">Checking code...</p>}
            {sessionInfo && (
              <div className="mt-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <p className="text-green-700 text-sm font-semibold">{sessionInfo.topic}</p>
                  <p className="text-green-600 text-xs">Grade {sessionInfo.grade} · {sessionInfo.participantCount} students joined</p>
                </div>
              </div>
            )}
          </div>

          {/* Name input */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-3">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Yuki"
              maxLength={30}
              className="w-full px-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-slate-900 text-lg font-semibold"
            />
          </div>

          {/* Group selection (if mode is group) */}
          {sessionInfo?.mode === "group" && (
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-3">Your Group <span className="text-slate-400 font-normal">(optional — teacher can assign)</span></label>
              <div className="grid grid-cols-4 gap-2">
                {GROUPS.map(g => (
                  <button
                    key={g}
                    onClick={() => setGroup(group === g ? null : g)}
                    className={`py-3 rounded-xl font-black text-lg transition-all ${
                      group === g ? `${GROUP_COLORS[g]} text-white shadow-lg scale-105` : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            onClick={join}
            disabled={loading || !sessionInfo || !name.trim()}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black text-xl rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
          >
            {loading ? "Joining..." : "Join Game! →"}
          </button>
        </div>
      </div>
    </div>
  );
}
