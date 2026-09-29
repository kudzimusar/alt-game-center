import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Trophy, Zap, Users, Home, ArrowLeft } from "lucide-react";

interface Score {
  participantId: string;
  participantName: string;
  group: string | null;
  totalPoints: number;
  streak: number;
  fastestCount: number;
  badges: string[];
}

interface GroupScore {
  name: string;
  points: number;
  members: string[];
}

const RANK_STYLES = [
  "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",
  "bg-slate-400/20 border-slate-400/50 text-slate-300",
  "bg-orange-700/20 border-orange-700/50 text-orange-500",
];

const GROUP_COLORS: Record<string, string> = {
  A: "from-blue-600 to-blue-800",
  B: "from-green-600 to-green-800",
  C: "from-orange-600 to-orange-800",
  D: "from-purple-600 to-purple-800",
};

export default function ClassBattleScoreboard() {
  const code = new URLSearchParams(window.location.search).get("code") || "";
  const ws = useRef<WebSocket | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [groups, setGroups] = useState<GroupScore[]>([]);
  const [mode, setMode] = useState<"individual" | "group">("individual");
  const [phase, setPhase] = useState("waiting");
  const [question, setQuestion] = useState<any>(null);
  const [questionIndex, setQuestionIndex] = useState(-1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timer, setTimer] = useState(0);
  const [sessionTopic, setSessionTopic] = useState("");
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!code) return;
    // Load session info
    fetch(`/api/class-battle/sessions/${code}`)
      .then(r => r.json())
      .then(d => { setSessionTopic(d.topic || ""); setMode(d.mode || "individual"); })
      .catch(() => {});

    connect();
    return () => { ws.current?.close(); clearInterval(timerRef.current); };
  }, []);

  function connect() {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const socket = new WebSocket(`${protocol}://${window.location.host}/ws/class-battle`);
    ws.current = socket;
    socket.onopen = () => { socket.send(JSON.stringify({ type: "scoreboard-connect", code })); };
    socket.onmessage = (e) => handleMessage(JSON.parse(e.data));
    socket.onclose = () => setTimeout(connect, 2000);
  }

  function handleMessage(msg: any) {
    switch (msg.type) {
      case "scores-update":
        setScores(msg.individual || []);
        setGroups(msg.groups || []);
        if (msg.mode) setMode(msg.mode);
        break;
      case "question-pushed":
        setQuestion(msg.question);
        setQuestionIndex(msg.index);
        setTotalQuestions(msg.total);
        setPhase("question_active");
        startTimer(msg.question.timeLimit);
        break;
      case "answers-locked":
        setPhase("locked");
        clearInterval(timerRef.current);
        break;
      case "answer-revealed":
        setPhase("results");
        break;
      case "session-ended":
        setPhase("ended");
        break;
      case "session-started":
        setPhase("active");
        break;
    }
  }

  function startTimer(seconds: number) {
    setTimer(seconds);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; });
    }, 1000);
  }

  const displayScores = mode === "group" ? [] : scores.slice(0, 10);
  const displayGroups = mode === "group" ? groups.slice(0, 4) : [];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/60 to-purple-900/60 border-b border-white/10 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-sm">
            <Link href="/dashboard">
              <span className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors cursor-pointer">
                <Home size={16} /> Dashboard
              </span>
            </Link>
            <Link href="/games">
              <span className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors cursor-pointer">
                <ArrowLeft size={16} /> Games
              </span>
            </Link>
          </div>
          <div>
            <h1 className="text-2xl font-black">ClassBattle</h1>
            <p className="text-slate-400 text-sm">{sessionTopic} · {mode === "group" ? "Group" : "Individual"} Mode</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {totalQuestions > 0 && (
            <div className="text-center">
              <div className="text-slate-400 text-xs">Question</div>
              <div className="text-3xl font-black">{questionIndex + 1}<span className="text-slate-500 text-lg">/{totalQuestions}</span></div>
            </div>
          )}
          {phase === "question_active" && (
            <div className={`text-center w-24 py-2 rounded-2xl ${timer <= 5 ? "bg-red-500 animate-pulse" : "bg-blue-600"}`}>
              <div className="text-xs text-white/70">TIME</div>
              <div className="text-4xl font-black">{timer}</div>
            </div>
          )}
          <div className="bg-yellow-400 text-slate-900 font-black text-3xl px-6 py-3 rounded-2xl tracking-widest">
            {code}
          </div>
        </div>
      </div>

      {/* Current question display */}
      {question && (phase === "question_active" || phase === "locked" || phase === "results") && (
        <div className={`px-8 py-5 border-b border-white/5 ${phase === "results" ? "bg-green-900/20" : phase === "locked" ? "bg-yellow-900/20" : "bg-blue-900/20"}`}>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-slate-400 text-sm mb-2">{question.grammarPoint}</p>
            <h2 className="text-3xl font-black text-white">{question.content}</h2>
            {(phase === "locked" || phase === "results") && question.correctAnswer && (
              <div className="mt-3 inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-2 rounded-xl font-bold">
                ✓ {question.correctAnswer}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scoreboard */}
      <div className="flex-1 p-8 overflow-hidden">
        {mode === "individual" && (
          <div className="max-w-3xl mx-auto">
            {phase === "waiting" && (
              <div className="text-center py-16">
                <div className="text-7xl mb-6 animate-pulse">⚡</div>
                <h2 className="text-4xl font-black text-white mb-4">Waiting for students to join...</h2>
                <p className="text-slate-400 text-xl">Code: <span className="text-yellow-400 font-black tracking-widest text-3xl">{code}</span></p>
              </div>
            )}

            {scores.length === 0 && phase !== "waiting" && (
              <div className="text-center py-16 text-slate-500">No scores yet</div>
            )}

            <div className="space-y-3">
              {displayScores.map((s, i) => (
                <div
                  key={s.participantId}
                  className={`flex items-center gap-4 rounded-2xl px-6 py-4 border transition-all ${
                    i < 3 ? RANK_STYLES[i] : "bg-slate-800/50 border-white/5 text-slate-300"
                  }`}
                  style={{ transform: `scale(${i === 0 ? 1.03 : 1})` }}
                >
                  <div className="text-3xl font-black w-12 text-center">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : <span className="text-slate-500 text-xl">{i + 1}</span>}
                  </div>
                  <div className="flex-1">
                    <div className="font-black text-2xl">{s.participantName}</div>
                    <div className="text-sm opacity-60 flex gap-3">
                      {s.streak >= 3 && <span>🔥 {s.streak} streak</span>}
                      {s.fastestCount > 0 && <span>⚡ {s.fastestCount}× fastest</span>}
                      {s.group && <span>Group {s.group}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black">{s.totalPoints}</div>
                    <div className="text-sm opacity-60">points</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {mode === "group" && (
          <div className="max-w-4xl mx-auto">
            {phase === "waiting" && (
              <div className="text-center py-16">
                <div className="text-7xl mb-6 animate-pulse">⚡</div>
                <h2 className="text-4xl font-black text-white mb-4">Team Battle Mode!</h2>
                <p className="text-slate-400 text-xl">Code: <span className="text-yellow-400 font-black tracking-widest text-3xl">{code}</span></p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              {displayGroups.map((g, i) => (
                <div key={g.name} className={`bg-gradient-to-br ${GROUP_COLORS[g.name] || "from-slate-700 to-slate-800"} rounded-3xl p-8 text-center border border-white/10 ${i === 0 ? "scale-105 shadow-2xl" : ""}`}>
                  <div className="text-5xl font-black text-white/20 mb-2">Group</div>
                  <div className="text-8xl font-black text-white mb-4">{g.name}</div>
                  <div className="text-5xl font-black text-white mb-2">{g.points}</div>
                  <div className="text-white/60 text-sm">points</div>
                  <div className="mt-4 flex flex-wrap justify-center gap-1">
                    {g.members.slice(0, 6).map(m => (
                      <span key={m} className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">{m}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === "ended" && (
          <div className="text-center mt-8">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-4xl font-black text-white mb-2">Game Over!</h2>
            <p className="text-slate-400">Final standings above</p>
          </div>
        )}
      </div>
    </div>
  );
}
