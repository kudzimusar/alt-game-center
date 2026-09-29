import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import confetti from "canvas-confetti";
import { Home, ArrowLeft } from "lucide-react";

interface Question {
  content: string;
  options: string[];
  correctAnswer: string;
  grammarPoint: string;
  questionType: string;
  timeLimit: number;
  index: number;
  total: number;
}

type GamePhase = "waiting" | "active" | "question" | "answered" | "reveal" | "ended";

export default function ClassBattlePlay() {
  const [, setLocation] = useLocation();
  const code = new URLSearchParams(window.location.search).get("code") || "";
  const studentData = (() => { try { return JSON.parse(sessionStorage.getItem("cb_student") || "{}"); } catch { return {}; } })();

  const ws = useRef<WebSocket | null>(null);
  const [phase, setPhase] = useState<GamePhase>("waiting");
  const [participantId, setParticipantId] = useState("");
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [fillAnswer, setFillAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; points: number; rank: number; correctAnswer: string } | null>(null);
  const [myScore, setMyScore] = useState(0);
  const [myRank, setMyRank] = useState(0);
  const [timer, setTimer] = useState(0);
  const [streak, setStreak] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!code || !studentData.name) {
      setErrorMsg("Missing session info. Please scan the QR again.");
      return;
    }
    connect();
    return () => { ws.current?.close(); clearInterval(timerRef.current); };
  }, []);

  function connect() {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const socket = new WebSocket(`${protocol}://${window.location.host}/ws/class-battle`);
    ws.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: "join-session",
        code,
        name: studentData.name,
        group: studentData.group || null,
        deviceId: studentData.deviceId,
      }));
    };

    socket.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      handleMessage(msg);
    };

    socket.onclose = () => {
      if (phase !== "ended") setTimeout(connect, 2000);
    };
  }

  function send(data: object) {
    if (ws.current?.readyState === 1) ws.current.send(JSON.stringify(data));
  }

  function handleMessage(msg: any) {
    switch (msg.type) {
      case "joined":
        setParticipantId(msg.participantId);
        break;
      case "join-error":
        setErrorMsg(msg.error);
        break;
      case "waiting":
        setPhase("waiting");
        break;
      case "session-started":
        setPhase("active");
        break;
      case "question":
        setQuestion({ ...msg.question, index: msg.index, total: msg.total });
        setPhase("question");
        setSubmitted(false);
        setSelectedAnswer(null);
        setFillAnswer("");
        setFeedback(null);
        startTimer(msg.question.timeLimit);
        break;
      case "answer-locked":
        if (!submitted) setPhase("answered");
        clearInterval(timerRef.current);
        break;
      case "answer-revealed":
        setFeedback({
          correct: msg.wasCorrect,
          points: msg.pointsEarned,
          rank: msg.responseRank || 0,
          correctAnswer: msg.correctAnswer,
        });
        setPhase("reveal");
        if (msg.wasCorrect) {
          setStreak(s => s + 1);
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ["#3b82f6", "#8b5cf6", "#10b981"] });
        } else {
          setStreak(0);
        }
        break;
      case "score-update":
        setMyScore(msg.myScore || 0);
        setMyRank(msg.rank || 0);
        break;
      case "game-ended":
        setPhase("ended");
        break;
    }
  }

  function startTimer(seconds: number) {
    setTimer(seconds);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  }

  function submitAnswer(answer: string) {
    if (submitted || phase !== "question") return;
    setSelectedAnswer(answer);
    setSubmitted(true);
    setPhase("answered");
    clearInterval(timerRef.current);
    send({ type: "submit-answer", code, participantId, answer });
  }

  function submitFill() {
    if (!fillAnswer.trim()) return;
    submitAnswer(fillAnswer.trim());
  }

  const OPTION_COLORS = [
    "bg-red-500 hover:bg-red-400",
    "bg-blue-500 hover:bg-blue-400",
    "bg-yellow-500 hover:bg-yellow-400",
    "bg-green-500 hover:bg-green-400",
  ];

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-center">
        <div>
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-black text-white mb-3">Something went wrong</h2>
          <p className="text-slate-400 mb-6">{errorMsg}</p>
          <button onClick={() => setLocation("/class-battle/join")} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (phase === "waiting" || phase === "active") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-6 animate-bounce">⚡</div>
        <h1 className="text-3xl font-black text-white mb-2">
          {studentData.name ? `Ready, ${studentData.name}!` : "You're in!"}
        </h1>
        <p className="text-slate-400 text-lg mb-8">
          {phase === "waiting" ? "Waiting for your teacher to start..." : "Game starting soon!"}
        </p>
        <div className="bg-white/5 border border-white/10 rounded-2xl px-8 py-4 inline-flex items-center gap-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white font-semibold">Connected to session <span className="text-yellow-400 font-black tracking-wider">{code}</span></span>
        </div>
        {myScore > 0 && <div className="mt-4 text-slate-400 text-sm">Your score: <span className="text-white font-bold">{myScore} pts</span></div>}
        {streak >= 3 && <div className="mt-2 text-orange-400 text-sm font-bold">🔥 {streak}-answer streak!</div>}
      </div>
    );
  }

  if (phase === "ended") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center p-6 text-center">
        <div>
          <div className="text-7xl mb-6">🏆</div>
          <h1 className="text-4xl font-black text-white mb-3">Game Over!</h1>
          <p className="text-slate-400 text-lg mb-6">Great effort, {studentData.name}!</p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 inline-block min-w-[200px]">
            <div className="text-slate-400 text-sm mb-1">Your final score</div>
            <div className="text-5xl font-black text-white">{myScore}</div>
            <div className="text-slate-400 text-sm mt-1">points</div>
            {myRank > 0 && <div className="text-yellow-400 font-bold mt-2">Rank #{myRank}</div>}
            {streak > 0 && <div className="text-orange-400 text-sm mt-1">🔥 Best streak: {streak}</div>}
          </div>
          <br />
          <button onClick={() => setLocation("/class-battle/join")} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors">
            Play again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top HUD */}
      <div className="bg-slate-900 border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <Link href="/dashboard">
            <span className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <Home size={16} /> Dashboard
            </span>
          </Link>
          <Link href="/games">
            <span className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <ArrowLeft size={16} /> Games
            </span>
          </Link>
        </div>
        <div className="text-sm text-slate-400">
          {studentData.name} {studentData.group && <span className="text-white font-bold">· Group {studentData.group}</span>}
        </div>
        <div className="flex items-center gap-4">
          {streak >= 3 && <span className="text-orange-400 text-sm font-bold">🔥 x{streak}</span>}
          <span className="text-yellow-400 font-black">{myScore} pts</span>
          {question && <span className="text-slate-500 text-xs">{question.index + 1}/{question.total}</span>}
        </div>
      </div>

      {/* Timer bar */}
      {phase === "question" && question && (
        <div className="h-2 bg-slate-800">
          <div
            className={`h-2 transition-all duration-1000 ${timer <= 5 ? "bg-red-500" : "bg-blue-500"}`}
            style={{ width: `${(timer / question.timeLimit) * 100}%` }}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col p-4 md:p-8">
        {/* Question */}
        {question && (phase === "question" || phase === "answered" || phase === "reveal") && (
          <div className="mb-6">
            <div className="text-center mb-2">
              <span className="text-xs text-slate-500">{question.grammarPoint}</span>
            </div>
            <div className={`bg-slate-900 border rounded-2xl p-6 md:p-8 text-center mb-6 ${
              phase === "reveal" && feedback?.correct ? "border-green-500" :
              phase === "reveal" && !feedback?.correct ? "border-red-500" :
              "border-white/10"
            }`}>
              <p className="text-xl md:text-2xl font-black text-white leading-relaxed">{question.content}</p>
              {phase === "question" && (
                <div className={`text-3xl font-black mt-4 ${timer <= 5 ? "text-red-400" : "text-blue-400"}`}>{timer}</div>
              )}
            </div>

            {/* Reveal feedback */}
            {phase === "reveal" && feedback && (
              <div className={`text-center mb-6 py-4 rounded-2xl ${feedback.correct ? "bg-green-500/20 border border-green-500/30" : "bg-red-500/20 border border-red-500/30"}`}>
                {feedback.correct ? (
                  <>
                    <div className="text-3xl mb-1">{feedback.rank === 1 ? "🥇" : feedback.rank === 2 ? "🥈" : feedback.rank === 3 ? "🥉" : "✅"}</div>
                    <div className="text-green-400 font-black text-xl">Correct!</div>
                    <div className="text-white font-bold">+{feedback.points} points</div>
                    {feedback.rank === 1 && <div className="text-yellow-400 text-sm">⚡ First correct answer!</div>}
                  </>
                ) : (
                  <>
                    <div className="text-3xl mb-1">❌</div>
                    <div className="text-red-400 font-black text-xl">Not quite!</div>
                    <div className="text-slate-400 text-sm">Correct answer: <span className="text-white font-bold">{feedback.correctAnswer}</span></div>
                  </>
                )}
              </div>
            )}

            {/* MC options */}
            {question.questionType === "multiple_choice" && question.options.length > 0 && phase !== "reveal" && (
              <div className="grid grid-cols-1 gap-3">
                {question.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => submitAnswer(opt)}
                    disabled={submitted}
                    className={`w-full py-4 md:py-5 rounded-2xl font-black text-white text-lg transition-all ${
                      submitted && selectedAnswer === opt ? "opacity-100 scale-95" :
                      submitted ? "opacity-40" :
                      `${OPTION_COLORS[i]} active:scale-95`
                    }`}
                  >
                    <span className="opacity-70 mr-2">{String.fromCharCode(65 + i)}.</span> {opt}
                  </button>
                ))}
              </div>
            )}

            {/* True/False */}
            {question.questionType === "true_false" && phase !== "reveal" && (
              <div className="grid grid-cols-2 gap-4">
                {["True", "False"].map((opt, i) => (
                  <button
                    key={opt}
                    onClick={() => submitAnswer(opt)}
                    disabled={submitted}
                    className={`py-8 rounded-2xl font-black text-white text-2xl transition-all ${
                      submitted && selectedAnswer === opt ? "opacity-100 scale-95" :
                      submitted ? "opacity-40" :
                      i === 0 ? "bg-green-500 hover:bg-green-400 active:scale-95" : "bg-red-500 hover:bg-red-400 active:scale-95"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Fill blank */}
            {question.questionType === "fill_blank" && phase !== "reveal" && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={fillAnswer}
                  onChange={e => setFillAnswer(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && submitFill()}
                  disabled={submitted}
                  placeholder="Type your answer..."
                  className="w-full px-5 py-4 text-xl font-semibold bg-slate-800 border-2 border-white/10 text-white rounded-2xl focus:outline-none focus:border-blue-500 text-center disabled:opacity-50"
                  autoFocus
                />
                <button
                  onClick={submitFill}
                  disabled={submitted || !fillAnswer.trim()}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xl rounded-2xl transition-all disabled:opacity-40 active:scale-95"
                >
                  Submit Answer
                </button>
              </div>
            )}

            {/* Waiting state */}
            {submitted && phase === "answered" && (
              <div className="text-center py-4">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-slate-400">Answer submitted! Waiting for others...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
