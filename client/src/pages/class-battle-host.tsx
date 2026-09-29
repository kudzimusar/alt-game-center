import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/auth";
import {
  Play, Lock, Eye, ChevronRight, Trophy, Users, Zap, SkipForward,
  Plus, Minus, Radio, LayoutGrid, QrCode, Crown, Home, ArrowLeft
} from "lucide-react";

type Phase = "waiting" | "roster_locked" | "active" | "question_active" | "locked" | "results" | "ended";

interface Participant { id: string; name: string; group: string | null; isActive: boolean; }
interface Score { participantId: string; participantName: string; group: string | null; totalPoints: number; streak: number; fastestCount: number; badges: string[]; }
interface Response { participantId: string; name: string; answer: string; isCorrect: boolean; points: number; rank: number; }
interface Question { content: string; options: string[]; correctAnswer: string; grammarPoint: string; questionType: string; timeLimit: number; }

const GROUPS = ["A", "B", "C", "D"];
const GROUP_COLORS: Record<string, string> = { A: "bg-blue-500", B: "bg-green-500", C: "bg-orange-500", D: "bg-purple-500" };

export default function ClassBattleHost() {
  const [location] = useLocation();
  const { user } = useAuth();

  const code = new URLSearchParams(window.location.search).get("code") || "";
  const sessionData = (() => { try { return JSON.parse(sessionStorage.getItem("cb_session") || "{}"); } catch { return {}; } })();

  const ws = useRef<WebSocket | null>(null);
  const [phase, setPhase] = useState<Phase>("waiting");
  const [roster, setRoster] = useState<Participant[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [groupScores, setGroupScores] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState(-1);
  const [totalQuestions, setTotalQuestions] = useState(sessionData.questionCount || 0);
  const [responses, setResponses] = useState<Response[]>([]);
  const [timer, setTimer] = useState(0);
  const [mode] = useState(sessionData.mode || "individual");
  const [qr] = useState(sessionData.qr || "");
  const [joinUrl] = useState(sessionData.joinUrl || "");
  const [showQR, setShowQR] = useState(true);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!code) return;
    connect();
    return () => { ws.current?.close(); clearInterval(timerRef.current); };
  }, [code]);

  function connect() {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const socket = new WebSocket(`${protocol}://${window.location.host}/ws/class-battle`);
    ws.current = socket;

    socket.onopen = () => {
      send({ type: "teacher-connect", code, teacherId: user?.id });
    };

    socket.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      handleMessage(msg);
    };

    socket.onclose = () => setTimeout(connect, 2000);
  }

  function send(data: object) {
    if (ws.current?.readyState === 1) ws.current.send(JSON.stringify(data));
  }

  function handleMessage(msg: any) {
    switch (msg.type) {
      case "participant-joined":
        setRoster(msg.roster);
        break;
      case "roster-locked":
        setPhase("roster_locked");
        setRoster(msg.roster);
        break;
      case "session-started":
        setPhase("active");
        break;
      case "question-pushed":
        setCurrentQuestion(msg.question);
        setQuestionIndex(msg.index);
        setTotalQuestions(msg.total);
        setPhase("question_active");
        setResponses([]);
        startTimer(msg.question.timeLimit);
        break;
      case "response-received":
        setResponses(prev => [...prev, {
          participantId: msg.participantId,
          name: msg.participantName,
          answer: msg.answer,
          isCorrect: msg.isCorrect,
          points: msg.pointsAwarded,
          rank: msg.responseRank,
        }]);
        break;
      case "answers-locked":
        setPhase("locked");
        clearInterval(timerRef.current);
        break;
      case "answer-revealed":
        setPhase("results");
        break;
      case "scores-update":
        setScores(msg.individual || []);
        setGroupScores(msg.groups || []);
        break;
      case "session-ended":
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

  function lockRoster() { send({ type: "lock-roster", code }); }
  function startSession() { send({ type: "start-session", code }); }
  function nextQuestion() { send({ type: "next-question", code }); }
  function lockAnswers() { send({ type: "lock-answers", code }); }
  function revealAnswer() { send({ type: "reveal-answer", code }); }
  function endSession() { send({ type: "end-session", code }); }
  function assignGroup(participantId: string, group: string) { send({ type: "set-group", code, participantId, group }); }
  function awardPoints(participantId: string, delta: number) {
    apiFetch(`/api/class-battle/sessions/${code}/award`, {
      method: "POST", body: JSON.stringify({ participantId, delta }),
    }).then(r => r.json()).then(d => { setScores(d.scores?.individual || []); });
  }

  const isWaiting = phase === "waiting";
  const isRosterLocked = phase === "roster_locked";
  const canStart = isRosterLocked && roster.length > 0;
  const isQuestionActive = phase === "question_active";
  const isLocked = phase === "locked";
  const isResults = phase === "results";
  const isActive = phase === "active";
  const isEnded = phase === "ended";

  if (!code) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">No session code.</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top bar */}
      <div className="bg-slate-900 border-b border-white/5 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <button className="text-slate-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
                <Home size={16} /> Dashboard
              </button>
            </Link>
            <Link href="/games">
              <button className="text-slate-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
                <ArrowLeft size={16} /> Games
              </button>
            </Link>
          </div>
          <div>
            <div className="font-black text-lg">ClassBattle — Mission Control</div>
            <div className="text-xs text-slate-400">{sessionData.topic} · Grade {sessionData.grade} · {mode === "group" ? "Group" : "Individual"} mode</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowQR(!showQR)} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white px-3 py-1.5 border border-white/10 rounded-lg transition-colors">
            <QrCode size={14} /> {showQR ? "Hide" : "Show"} QR
          </button>
          <div className="bg-yellow-400 text-slate-900 font-black text-2xl px-5 py-2 rounded-xl tracking-widest">
            {code}
          </div>
          <a href={`/class-battle/scoreboard?code=${code}`} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white px-3 py-1.5 border border-white/10 rounded-lg transition-colors">
            <Trophy size={14} /> Scoreboard
          </a>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Control panel */}
        <div className="w-64 bg-slate-900/50 border-r border-white/5 flex flex-col p-4 gap-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">Session Control</h3>

          {/* Phase status */}
          <div className={`px-3 py-2 rounded-xl text-center text-sm font-bold ${
            isEnded ? "bg-slate-700 text-slate-400" :
            isQuestionActive ? "bg-green-500/20 text-green-400 animate-pulse" :
            isLocked ? "bg-yellow-500/20 text-yellow-400" :
            isResults ? "bg-blue-500/20 text-blue-400" :
            "bg-slate-800 text-slate-300"
          }`}>
            {phase.replace("_", " ").toUpperCase()}
          </div>

          {/* Timer */}
          {isQuestionActive && (
            <div className={`text-center py-3 rounded-xl font-black text-4xl ${timer <= 5 ? "bg-red-500/20 text-red-400" : "bg-slate-800 text-white"}`}>
              {timer}s
            </div>
          )}

          {/* Control buttons */}
          <div className="space-y-2 flex-1">
            {isWaiting && (
              <button onClick={lockRoster} disabled={roster.length === 0}
                className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 transition-colors">
                <Lock size={16} /> Lock Roster ({roster.length})
              </button>
            )}
            {isRosterLocked && (
              <button onClick={startSession}
                className="w-full py-3 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                <Play size={16} /> Start Game
              </button>
            )}
            {(isActive || isResults) && (
              <button onClick={nextQuestion}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                <ChevronRight size={16} />
                {questionIndex < 0 ? "First Question" : questionIndex + 1 < totalQuestions ? "Next Question" : "Final Results"}
              </button>
            )}
            {isQuestionActive && (
              <button onClick={lockAnswers}
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                <Lock size={16} /> Lock Answers
              </button>
            )}
            {isLocked && (
              <button onClick={revealAnswer}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
                <Eye size={16} /> Reveal Answer
              </button>
            )}
            {!isEnded && !isWaiting && (
              <button onClick={endSession}
                className="w-full py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 mt-2 transition-colors">
                End Session
              </button>
            )}
          </div>

          {/* Question counter */}
          {totalQuestions > 0 && (
            <div className="text-center text-sm text-slate-500">
              Question {Math.max(0, questionIndex + 1)} / {totalQuestions}
              <div className="h-1 bg-slate-800 rounded-full mt-2">
                <div className="h-1 bg-blue-500 rounded-full transition-all" style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Center: Main view */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* QR code overlay */}
          {showQR && isWaiting && (
            <div className="mb-6 bg-slate-900 border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="text-center">
                {qr && <img src={qr} alt="Join QR" className="w-48 h-48 rounded-2xl shadow-lg mx-auto mb-3" />}
                <p className="text-slate-400 text-sm">Students scan to join</p>
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-black mb-2">Waiting for students...</h2>
                <p className="text-slate-400 mb-4">Share the QR code or the join link:</p>
                <div className="bg-slate-800 rounded-xl px-4 py-2 font-mono text-sm text-blue-300 break-all mb-4">{joinUrl}</div>
                <div className="text-lg">Session code: <span className="font-black text-yellow-400 text-2xl tracking-widest">{code}</span></div>
              </div>
            </div>
          )}

          {/* Current question */}
          {currentQuestion && (phase === "question_active" || phase === "locked" || phase === "results") && (
            <div className={`mb-6 border rounded-3xl p-8 ${
              phase === "results" ? "bg-green-500/10 border-green-500/30" :
              phase === "locked" ? "bg-yellow-500/10 border-yellow-500/30" :
              "bg-blue-500/10 border-blue-500/30"
            }`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400">{currentQuestion.grammarPoint}</span>
                <span className="text-xs bg-slate-700 px-2 py-1 rounded">{currentQuestion.questionType.replace("_", " ")}</span>
              </div>
              <h3 className="text-2xl font-black text-white mb-6">{currentQuestion.content}</h3>

              {currentQuestion.options.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {currentQuestion.options.map((opt, i) => (
                    <div key={i} className={`px-4 py-3 rounded-xl font-semibold text-sm ${
                      (phase === "results" || phase === "locked") && opt === currentQuestion.correctAnswer
                        ? "bg-green-500 text-white"
                        : "bg-slate-800 text-slate-300"
                    }`}>
                      {String.fromCharCode(65 + i)}. {opt}
                    </div>
                  ))}
                </div>
              )}

              {(phase === "results" || phase === "locked") && (
                <div className="flex items-center gap-2 text-green-400 font-bold">
                  <Eye size={16} /> Correct answer: <span className="text-white">{currentQuestion.correctAnswer}</span>
                </div>
              )}
            </div>
          )}

          {/* Live responses */}
          {responses.length > 0 && (
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 mb-6">
              <h3 className="text-sm font-bold text-slate-400 mb-4">LIVE RESPONSES ({responses.length})</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {responses.map((r, i) => (
                  <div key={i} className={`flex items-center justify-between px-4 py-2 rounded-xl ${r.isCorrect ? "bg-green-500/10" : "bg-slate-800/50"}`}>
                    <div className="flex items-center gap-2">
                      {r.rank === 1 && <span className="text-yellow-400 text-sm">🥇</span>}
                      {r.rank === 2 && <span className="text-slate-300 text-sm">🥈</span>}
                      {r.rank === 3 && <span className="text-orange-400 text-sm">🥉</span>}
                      <span className="text-white text-sm font-medium">{r.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-mono ${r.isCorrect ? "text-green-400" : "text-slate-500"}`}>{r.answer}</span>
                      {r.isCorrect && <span className="text-xs text-green-400">+{r.points}pt</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Roster + Scores */}
        <div className="w-72 bg-slate-900/50 border-l border-white/5 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Students ({roster.length})</h3>
            {mode === "group" && <span className="text-xs text-slate-500">Group mode</span>}
          </div>

          {/* Scores */}
          {scores.length > 0 ? (
            <div className="space-y-2 mb-4">
              {(mode === "group" ? groupScores : scores).slice(0, 10).map((s: any, i: number) => (
                <div key={s.participantId || s.name} className="flex items-center gap-2 bg-slate-800/50 rounded-xl px-3 py-2">
                  <span className="text-xs text-slate-500 w-5 text-center">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</span>
                  <span className="flex-1 text-sm font-medium text-white truncate">{s.participantName || s.name}</span>
                  {mode !== "group" && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => awardPoints(s.participantId, -50)} className="w-5 h-5 bg-slate-700 hover:bg-red-500/30 rounded text-xs flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors">
                        <Minus size={10} />
                      </button>
                      <span className="text-xs text-yellow-400 font-bold w-10 text-center">{s.totalPoints}</span>
                      <button onClick={() => awardPoints(s.participantId, 100)} className="w-5 h-5 bg-slate-700 hover:bg-green-500/30 rounded text-xs flex items-center justify-center text-slate-400 hover:text-green-400 transition-colors">
                        <Plus size={10} />
                      </button>
                    </div>
                  )}
                  {mode === "group" && <span className="text-xs text-yellow-400 font-bold">{s.points}</span>}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 mb-4">
              {roster.map(p => (
                <div key={p.id} className="bg-slate-800/50 rounded-xl px-3 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{p.name}</span>
                    {p.group && <span className={`text-xs text-white px-1.5 py-0.5 rounded ${GROUP_COLORS[p.group] || "bg-slate-600"}`}>{p.group}</span>}
                  </div>
                  {mode === "group" && isWaiting && (
                    <div className="flex gap-1 mt-1">
                      {GROUPS.map(g => (
                        <button key={g} onClick={() => assignGroup(p.id, g)}
                          className={`flex-1 text-xs py-0.5 rounded font-bold transition-colors ${p.group === g ? `${GROUP_COLORS[g]} text-white` : "bg-slate-700 text-slate-400 hover:bg-slate-600"}`}>
                          {g}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
