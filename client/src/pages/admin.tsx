import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { apiFetch } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  inactiveUsers: number;
  totalSessions: number;
  schoolCount: number;
  planBreakdown: Record<string, number>;
  roleBreakdown: Record<string, number>;
  gameBreakdown: Record<string, number>;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    school: string | null;
    subscriptionStatus: string;
    subscriptionPlan: string | null;
    isActive: boolean;
    createdAt: string;
  }>;
  recentSessions: Array<{
    id: string;
    teacherName: string | null;
    gameType: string;
    weekNumber: number | null;
    studentCount: number;
    startedAt: string;
  }>;
}

const PLAN_COLORS: Record<string, string> = {
  starter: "text-emerald-400",
  pro: "text-blue-400",
  school: "text-purple-400",
  district: "text-amber-400",
  free: "text-slate-400",
};

const GAME_LABELS: Record<string, string> = {
  "flash-cards": "Flash Card Race",
  "karuta": "Picture Karuta",
  "class-battle": "Class Battle",
  "interview-bingo": "Interview Bingo",
  "listening-bingo": "Listening Bingo",
  "spelling-bee": "Spelling Bee",
  "sentence-builder": "Sentence Builder",
  "grammar-golf": "Grammar Golf",
  "role-play": "Role Play",
  "translation-dash": "Translation Dash",
  "mystery-box": "Mystery Box",
  "shiritori": "Shiritori",
  "word-hunt": "Word Hunt",
  "jeopardy": "Jeopardy",
  "3-hint": "3-Hint Quiz",
  "quiz-show": "Quiz Show",
  "class-quiz": "Class Quiz",
  "small-talk": "Small Talk",
  "bongo-bingo": "Bongo Bingo",
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin" && user.role !== "super_admin") {
      setLocation("/dashboard");
      return;
    }
    loadStats();
  }, [user]);

  async function loadStats() {
    setLoading(true);
    try {
      const res = await apiFetch("/api/admin/stats");
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to load stats");
      }
      setStats(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="mb-4">Please sign in.</p>
          <Link href="/login"><button className="px-6 py-2.5 bg-blue-600 rounded-xl font-semibold">Sign in</button></Link>
        </div>
      </div>
    );
  }

  if (user.role !== "admin" && user.role !== "super_admin") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-2xl mb-2">🔒</p>
          <p className="mb-4 text-slate-400">Admin access required.</p>
          <Link href="/dashboard"><button className="px-6 py-2.5 bg-blue-600 rounded-xl font-semibold">Go to Dashboard</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <span className="text-xl">🎮</span>
              <span className="font-black text-sm bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">ALT Game Center</span>
            </div>
          </Link>
          <span className="text-slate-600">|</span>
          <span className="text-sm font-bold text-amber-400">Admin Console</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/analytics">
            <button className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors">📊 Analytics</button>
          </Link>
          <Link href="/admin/newsletter">
            <button className="px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors">📧 Newsletter</button>
          </Link>
          <Link href="/admin/users">
            <button className="px-4 py-2 text-sm font-semibold bg-white/10 hover:bg-white/15 rounded-xl transition-colors">Users</button>
          </Link>
          <Link href="/games">
            <button className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors">Games</button>
          </Link>
          <Link href="/dashboard">
            <button className="text-slate-400 hover:text-white text-sm transition-colors">Dashboard</button>
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-1">Admin Console</h1>
          <p className="text-slate-400">Platform overview and management</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 mb-6 text-red-300">
            {error}
            <button onClick={loadStats} className="ml-4 underline text-red-400 hover:text-red-300">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-900 border border-white/10 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-slate-700 rounded mb-3 w-2/3"></div>
                <div className="h-8 bg-slate-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "text-blue-400" },
                { label: "Active Subscriptions", value: stats.activeSubscriptions, icon: "✅", color: "text-emerald-400" },
                { label: "Schools", value: stats.schoolCount, icon: "🏫", color: "text-purple-400" },
                { label: "Game Sessions", value: stats.totalSessions, icon: "🎮", color: "text-amber-400" },
              ].map((stat) => (
                <div key={stat.label} className="bg-slate-900 border border-white/10 rounded-2xl p-6">
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className={`text-3xl font-black mb-1 ${stat.color}`}>{stat.value.toLocaleString()}</div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4">Subscriptions by Plan</h2>
                {Object.keys(stats.planBreakdown).length === 0 ? (
                  <p className="text-slate-500 text-sm">No active subscriptions yet</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(stats.planBreakdown).map(([plan, count]) => (
                      <div key={plan} className="flex justify-between items-center">
                        <span className={`font-semibold capitalize ${PLAN_COLORS[plan] || "text-white"}`}>{plan}</span>
                        <span className="bg-slate-800 px-3 py-1 rounded-full text-sm font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4">Users by Role</h2>
                <div className="space-y-3">
                  {Object.entries(stats.roleBreakdown).map(([role, count]) => (
                    <div key={role} className="flex justify-between items-center">
                      <span className="font-semibold capitalize text-slate-300">{role.replace("_", " ")}</span>
                      <span className="bg-slate-800 px-3 py-1 rounded-full text-sm font-bold">{count}</span>
                    </div>
                  ))}
                  {Object.keys(stats.roleBreakdown).length === 0 && (
                    <p className="text-slate-500 text-sm">No users yet</p>
                  )}
                </div>
              </div>

              <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-4">Top Games Played</h2>
                {Object.keys(stats.gameBreakdown).length === 0 ? (
                  <p className="text-slate-500 text-sm">No sessions recorded yet</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(stats.gameBreakdown)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 6)
                      .map(([game, count]) => (
                        <div key={game} className="flex justify-between items-center">
                          <span className="text-sm text-slate-300">{GAME_LABELS[game] || game}</span>
                          <span className="bg-slate-800 px-2 py-0.5 rounded-full text-xs font-bold">{count}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold">Recent Signups</h2>
                  <Link href="/admin/users">
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-semibold">View all →</button>
                  </Link>
                </div>
                <div className="space-y-3">
                  {stats.recentUsers.length === 0 ? (
                    <p className="text-slate-500 text-sm">No users yet</p>
                  ) : stats.recentUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div>
                        <div className="font-semibold text-sm flex items-center gap-2">
                          {u.name}
                          {!u.isActive && <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">Inactive</span>}
                        </div>
                        <div className="text-slate-500 text-xs">{u.email}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-semibold ${u.subscriptionStatus === "active" ? "text-emerald-400" : "text-slate-500"}`}>
                          {u.subscriptionStatus === "active" ? (u.subscriptionPlan || "active") : "free"}
                        </div>
                        <div className="text-slate-600 text-xs">{new Date(u.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold">Recent Game Sessions</h2>
                </div>
                <div className="space-y-3">
                  {stats.recentSessions.length === 0 ? (
                    <p className="text-slate-500 text-sm">No sessions recorded yet. Sessions are logged when teachers start multiplayer games.</p>
                  ) : stats.recentSessions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div>
                        <div className="font-semibold text-sm">{GAME_LABELS[s.gameType] || s.gameType}</div>
                        <div className="text-slate-500 text-xs">{s.teacherName || "Unknown teacher"}{s.weekNumber ? ` · Week ${s.weekNumber}` : ""}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-semibold text-blue-400">{s.studentCount} students</div>
                        <div className="text-slate-600 text-xs">{new Date(s.startedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
