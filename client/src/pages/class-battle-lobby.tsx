import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/auth";
import { Sparkles, Plus, Trash2, ChevronDown, ChevronUp, Zap, Users, LayoutGrid, ArrowLeft, Home } from "lucide-react";

const GRADES = [
  { value: "1", label: "Grade 1 (中1)", color: "bg-blue-500" },
  { value: "2", label: "Grade 2 (中2)", color: "bg-green-500" },
  { value: "3", label: "Grade 3 (中3)", color: "bg-purple-500" },
];

const TOPICS = {
  "1": ["Self-Introduction", "Daily Life", "School Subjects", "Food & Drink", "Sports & Hobbies", "Family", "Animals", "Colors & Numbers", "My Town", "Can / Ability"],
  "2": ["Past Events", "Travel & Places", "Jobs & Careers", "Health & Body", "Shopping", "Future Plans", "Nature & Environment", "Rules & Obligations", "Comparisons", "My Dream"],
  "3": ["Global Issues", "Technology", "Culture & Tradition", "Environment", "History", "Career & Future", "Social Problems", "Science", "Media & News", "Review All"],
};

const QUESTION_TYPES = [
  { value: "mixed", label: "Mixed Types", desc: "MC + Fill-blank + True/False" },
  { value: "multiple_choice", label: "Multiple Choice", desc: "4 options A–D" },
  { value: "fill_blank", label: "Fill in the Blank", desc: "Students type the answer" },
  { value: "true_false", label: "True / False", desc: "Binary choice" },
];

interface Question {
  id: string;
  content: string;
  options: string[];
  correctAnswer: string;
  grammarPoint: string;
  unit: string;
  questionType: "multiple_choice" | "fill_blank" | "true_false";
  timeLimit: number;
}

export default function ClassBattleLobby() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const [grade, setGrade] = useState("1");
  const [topic, setTopic] = useState(TOPICS["1"][0]);
  const [mode, setMode] = useState<"individual" | "group">("individual");
  const [questionType, setQuestionType] = useState("mixed");
  const [questionCount, setQuestionCount] = useState(10);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [generating, setGenerating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/class-battle/ai-status")
      .then(r => r.json())
      .then(d => setAiEnabled(d.kimiEnabled))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setTopic(TOPICS[grade as keyof typeof TOPICS][0]);
  }, [grade]);

  async function generateQuestions() {
    setGenerating(true);
    setError("");
    try {
      const res = await apiFetch("/api/class-battle/questions/generate", {
        method: "POST",
        body: JSON.stringify({ grade, topic, count: questionCount, questionType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const withIds = data.questions.map((q: any, i: number) => ({ ...q, id: `q_${i}_${Date.now()}` }));
      setQuestions(withIds);
    } catch (err: any) {
      setError(err.message || "Failed to generate questions");
    } finally {
      setGenerating(false);
    }
  }

  async function createSession() {
    if (!questions.length) return setError("Generate questions first.");
    setCreating(true);
    setError("");
    try {
      const res = await apiFetch("/api/class-battle/sessions", {
        method: "POST",
        body: JSON.stringify({ grade, topic, mode, questions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      sessionStorage.setItem("cb_session", JSON.stringify(data));
      setLocation(`/class-battle/host?code=${data.code}`);
    } catch (err: any) {
      setError(err.message || "Failed to create session");
    } finally {
      setCreating(false);
    }
  }

  function removeQuestion(id: string) {
    setQuestions(qs => qs.filter(q => q.id !== id));
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-center p-6">
        <div>
          <p className="mb-4 text-slate-400">Sign in to create a ClassBattle session.</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/login"><button className="px-6 py-2.5 bg-blue-600 rounded-xl font-semibold">Sign in</button></Link>
            <Link href="/dashboard"><button className="px-6 py-2.5 bg-white/10 rounded-xl font-semibold">Dashboard</button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="bg-slate-900 border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <button className="text-slate-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
              <Home size={16} /> Dashboard
            </button>
          </Link>
          <span className="text-slate-700">·</span>
          <Link href="/games">
            <button className="text-slate-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
              <ArrowLeft size={16} /> Back to Games
            </button>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="font-black text-lg bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            ClassBattle
          </span>
        </div>
        <div className={`text-xs px-3 py-1 rounded-full font-semibold ${aiEnabled ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-slate-700 text-slate-400"}`}>
          {aiEnabled ? "✨ Kimi AI Active" : "⚙ Using Built-in Questions"}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">ClassBattle</p>
            <h1 className="text-3xl font-black">Create a session</h1>
          </div>
          <Link href="/dashboard">
            <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
              Back to Dashboard
            </button>
          </Link>
        </div>

        <div className="bg-slate-900 border border-white/10 rounded-3xl p-8">
          <h2 className="text-2xl font-black mb-7">Session Setup</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-3">Grade Level</label>
              <div className="space-y-2">
                {GRADES.map(g => (
                  <button
                    key={g.value}
                    onClick={() => setGrade(g.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-left text-sm font-semibold transition-all ${
                      grade === g.value ? "border-blue-500 bg-blue-500/10 text-white" : "border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    <span className={`inline-block w-2 h-2 rounded-full ${g.color} mr-2`} />
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-3">Topic / Unit</label>
              <select
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 mb-4"
              >
                {TOPICS[grade as keyof typeof TOPICS].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <label className="block text-sm font-semibold text-slate-400 mb-3">Question Type</label>
              <select
                value={questionType}
                onChange={e => setQuestionType(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
              >
                {QUESTION_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-3">Play Mode</label>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { value: "individual", label: "Individual", emoji: "👤", desc: "Each student scores" },
                  { value: "group", label: "Group", emoji: "👥", desc: "Team scores combined" },
                ].map(m => (
                  <button
                    key={m.value}
                    onClick={() => setMode(m.value as any)}
                    className={`p-3 border rounded-xl text-center transition-all ${
                      mode === m.value ? "border-orange-500 bg-orange-500/10" : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="text-2xl mb-1">{m.emoji}</div>
                    <div className="text-xs font-bold text-white">{m.label}</div>
                    <div className="text-xs text-slate-500">{m.desc}</div>
                  </button>
                ))}
              </div>

              <label className="block text-sm font-semibold text-slate-400 mb-3">
                Questions: <span className="text-white">{questionCount}</span>
              </label>
              <input
                type="range" min={5} max={20} value={questionCount}
                onChange={e => setQuestionCount(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1"><span>5</span><span>20</span></div>
            </div>
          </div>

          <button
            onClick={generateQuestions}
            disabled={generating}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-60"
          >
            <Sparkles size={22} />
            {generating ? "Generating questions..." : aiEnabled ? "Generate with Kimi AI" : "Generate Questions"}
          </button>
        </div>

        {questions.length > 0 && (
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black">{questions.length} Questions Ready</h2>
              <button
                onClick={generateQuestions}
                disabled={generating}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Sparkles size={14} /> Regenerate
              </button>
            </div>

            <div className="space-y-3 mb-8">
              {questions.map((q, i) => (
                <div key={q.id} className="bg-slate-800/60 border border-white/5 rounded-2xl overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer"
                    onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="w-7 h-7 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{q.content}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{q.grammarPoint} · {q.questionType.replace("_", " ")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-lg font-mono">{q.correctAnswer}</span>
                      <button onClick={e => { e.stopPropagation(); removeQuestion(q.id); }} className="text-slate-600 hover:text-red-400 ml-2">
                        <Trash2 size={14} />
                      </button>
                      {expandedQ === q.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </div>
                  </div>
                  {expandedQ === q.id && q.options.length > 0 && (
                    <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className={`text-sm px-3 py-2 rounded-lg ${opt === q.correctAnswer ? "bg-green-500/20 text-green-300 border border-green-500/30" : "bg-slate-700/50 text-slate-400"}`}>
                          {String.fromCharCode(65 + oi)}. {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {error && <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>}

            <button
              onClick={createSession}
              disabled={creating}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-black rounded-2xl hover:opacity-90 transition-all text-lg flex items-center justify-center gap-3 disabled:opacity-60"
            >
              <Zap size={22} />
              {creating ? "Creating session..." : "Launch Session →"}
            </button>
          </div>
        )}

        {error && !questions.length && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>
        )}
      </div>
    </div>
  );
}
