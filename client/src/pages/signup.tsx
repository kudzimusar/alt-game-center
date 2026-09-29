import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, ArrowRight, BookOpen, Users, Zap } from "lucide-react";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "teacher" as "teacher" | "school_admin",
    school: "",
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === 1) {
      if (!form.name || !form.email) return setError("Please fill in all fields.");
      return setStep(2);
    }
    if (step === 2) {
      if (!form.username || !form.password) return setError("Please fill in all fields.");
      if (form.password.length < 6) return setError("Password must be at least 6 characters.");
      return setStep(3);
    }
    // step 3 - submit
    setLoading(true);
    setError("");
    try {
      await register({
        name: form.name,
        email: form.email,
        username: form.username,
        password: form.password,
        role: form.role,
        school: form.school || undefined,
      });
      setLocation("/pricing");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl">

        {/* Left panel */}
        <div className="hidden lg:flex flex-col bg-gradient-to-br from-blue-600 to-purple-700 p-12 justify-between">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <span className="text-3xl">🎮</span>
              <span className="text-white font-bold text-xl">ALT Game Center</span>
            </div>
            <h2 className="text-white text-4xl font-black mb-4 leading-tight">
              Teach English.<br />Make it fun.
            </h2>
            <p className="text-blue-100 text-lg mb-10">
              50+ interactive games designed for Japanese junior high classrooms. Built by teachers, for teachers.
            </p>
            <div className="space-y-5">
              {[
                { icon: <Zap size={20} />, text: "50+ games for all skill levels" },
                { icon: <Users size={20} />, text: "Real-time multiplayer classroom tools" },
                { icon: <BookOpen size={20} />, text: "Aligned with MEXT curriculum" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                    {item.icon}
                  </div>
                  <span className="text-white/90 font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-blue-200 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-white underline font-semibold">Sign in</Link>
          </p>
        </div>

        {/* Right panel */}
        <div className="bg-white p-8 md:p-12 flex flex-col justify-center">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step >= s ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                }`}>
                  {step > s ? "✓" : s}
                </div>
                {s < 3 && <div className={`h-1 w-8 rounded-full transition-all ${step > s ? "bg-blue-600" : "bg-slate-100"}`} />}
              </div>
            ))}
            <span className="ml-2 text-sm text-slate-500">
              {step === 1 ? "Your info" : step === 2 ? "Account setup" : "Almost done!"}
            </span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 mb-2">
            {step === 1 ? "Create your account" : step === 2 ? "Set up your login" : "Your role"}
          </h1>
          <p className="text-slate-500 mb-8 text-sm">
            {step === 1 ? "Start your journey to better English lessons." :
             step === 2 ? "Choose a username and secure password." :
             "Tell us how you'll use ALT Game Center."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="e.g. Sarah Johnson"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-slate-900"
                    required
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => update("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="e.g. sarah_alt"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-slate-900"
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1">Letters, numbers and underscores only</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-4 py-3 pr-12 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-slate-900"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">I am a...</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "teacher", label: "Teacher / ALT / JTE", emoji: "👩‍🏫" },
                      { value: "school_admin", label: "School Admin", emoji: "🏫" },
                    ].map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => update("role", r.value)}
                        className={`p-4 border-2 rounded-xl text-left transition-all ${
                          form.role === r.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="text-2xl mb-1">{r.emoji}</div>
                        <div className="text-sm font-semibold text-slate-700">{r.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">School Name (optional)</label>
                  <input
                    type="text"
                    value={form.school}
                    onChange={(e) => update("school", e.target.value)}
                    placeholder="e.g. Sakura Junior High School"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-slate-900"
                  />
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? "Creating account..." : step < 3 ? (
                <>Next <ArrowRight size={18} /></>
              ) : (
                <>Create account & choose plan <ArrowRight size={18} /></>
              )}
            </button>

            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="w-full py-3 text-slate-500 hover:text-slate-700 font-medium text-sm transition-colors"
              >
                ← Back
              </button>
            )}
          </form>

          <p className="text-center text-sm text-slate-400 mt-6 lg:hidden">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
