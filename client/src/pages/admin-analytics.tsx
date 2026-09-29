import { useEffect, useState, useCallback } from "react";
import { Link } from "wouter";
import { apiFetch } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { usePageAnalytics } from "@/hooks/useAnalytics";

const GAME_NAMES: Record<string, string> = {
  "flash-cards": "Flash Card Race ⚡",
  "karuta": "Picture Karuta 🃏",
  "class-battle": "Class Battle ⚔️",
  "interview-bingo": "Interview Bingo 🎤",
  "listening-bingo": "Listening Bingo 👂",
  "spelling-bee": "Spelling Bee 🐝",
  "sentence-builder": "Sentence Builder 🧩",
  "grammar-golf": "Grammar Golf ⛳",
  "role-play": "Role Play 🎭",
  "translation-dash": "Translation Dash 🏃",
  "mystery-box": "Mystery Box 🎁",
  "shiritori": "Shiritori 🔗",
  "word-hunt": "Word Hunt 🔍",
  "jeopardy": "Jeopardy 💎",
  "3-hint": "3-Hint Quiz 🎯",
  "quiz-show": "Quiz Show 📺",
  "class-quiz": "Class Quiz ✏️",
  "small-talk": "Small Talk 💬",
  "bongo-bingo": "Bongo Bingo 🟩",
};

const PAGE_NAMES: Record<string, string> = {
  "/": "Home",
  "/games": "Games List",
  "/login": "Login",
  "/signup": "Sign Up",
  "/pricing": "Pricing",
  "/dashboard": "Dashboard",
  "/admin": "Admin Dashboard",
  "/admin/users": "Admin Users",
  "/admin/analytics": "Admin Analytics",
};

interface AnalyticsSummary {
  overview: {
    totalUsers: number;
    activeSubscriptions: number;
    dau: number;
    wau: number;
    pageViewsToday: number;
    pageViewsWeek: number;
    pageViewsTotal: number;
    avgTimeOnPageSeconds: number;
    gamesToday: number;
    gamesThisWeek: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
  };
  gamePopularity: Array<{ gameType: string; plays: number }>;
  pagePopularity: Array<{ pagePath: string | null; views: number }>;
  timePerPage: Array<{ pagePath: string | null; avgSeconds: number; count: number }>;
  recentEvents: Array<{
    id: string;
    eventType: string;
    pagePath: string | null;
    gameType: string | null;
    durationSeconds: number | null;
    createdAt: string;
    userId: string | null;
  }>;
  eventTypeBreakdown: Array<{ eventType: string; count: number }>;
  trend: Array<{ day: string; count: number }>;
}

function StatCard({ icon, label, value, sub, color = "text-white" }: {
  icon: string; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-5">
      <div className="text-2xl mb-2">{icon}</div>
      <div className={`text-3xl font-black mb-0.5 ${color}`}>{value}</div>
      <div className="text-slate-400 text-xs font-medium uppercase tracking-wide">{label}</div>
      {sub && <div className="text-slate-500 text-xs mt-1">{sub}</div>}
    </div>
  );
}

function HorizBar({ label, value, max, color = "bg-blue-500" }: {
  label: string; value: number; max: number; color?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-40 text-sm text-slate-300 truncate flex-shrink-0">{label}</div>
      <div className="flex-1 bg-slate-800 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="w-10 text-right text-sm font-bold text-white flex-shrink-0">{value}</div>
    </div>
  );
}

function formatSeconds(s: number): string {
  if (!s) return "—";
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function EventBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    page_view: "bg-blue-500/20 text-blue-300",
    page_exit: "bg-slate-500/20 text-slate-400",
    game_start: "bg-emerald-500/20 text-emerald-300",
    game_end: "bg-amber-500/20 text-amber-300",
    game_join: "bg-purple-500/20 text-purple-300",
    signup: "bg-pink-500/20 text-pink-300",
    login: "bg-cyan-500/20 text-cyan-300",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[type] || "bg-slate-700 text-slate-300"}`}>
      {type}
    </span>
  );
}

function TrendChart({ data }: { data: Array<{ day: string; count: number }> }) {
  if (!data.length) return <div className="text-slate-500 text-sm">No trend data yet</div>;
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d) => {
        const h = Math.round((d.count / max) * 100);
        const date = new Date(d.day);
        const label = `${date.getMonth() + 1}/${date.getDate()}`;
        return (
          <div key={d.day} className="flex-1 flex flex-col items-center gap-1" title={`${d.day}: ${d.count} events`}>
            <div className="w-full flex items-end justify-center" style={{ height: 80 }}>
              <div
                className="w-full bg-blue-500 rounded-t-sm transition-all duration-700"
                style={{ height: `${h}%`, minHeight: d.count > 0 ? 2 : 0 }}
              />
            </div>
            <span className="text-[9px] text-slate-500 truncate w-full text-center">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminAnalytics() {
  usePageAnalytics("/admin/analytics");
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<string | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"games" | "pages" | "time" | "events">("games");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/analytics/summary");
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to load analytics");
      }
      setData(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "super_admin") loadData();
  }, [user]);

  async function generateInsights() {
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const res = await apiFetch("/api/analytics/insights", { method: "POST" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to generate insights");
      }
      const d = await res.json();
      setInsights(d.insights);
    } catch (err: any) {
      setInsightsError(err.message);
    } finally {
      setInsightsLoading(false);
    }
  }

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-2xl mb-2">🔒</p>
          <p className="mb-4 text-slate-400">Admin access required.</p>
          <Link href="/dashboard"><button className="px-6 py-2.5 bg-blue-600 rounded-xl font-semibold">Dashboard</button></Link>
        </div>
      </div>
    );
  }

  const o = data?.overview;
  const maxGamePlays = data?.gamePopularity[0]?.plays || 1;
  const maxPageViews = data?.pagePopularity[0]?.views || 1;
  const maxAvgTime = Math.max(...(data?.timePerPage.map(r => Number(r.avgSeconds)) || [1]));

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <span className="text-xl">🎮</span>
              <span className="font-black text-sm bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">ALT Game Center</span>
            </div>
          </Link>
          <span className="text-slate-600">|</span>
          <span className="text-sm font-bold text-amber-400">Analytics</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin"><button className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/15 rounded-xl transition-colors">Overview</button></Link>
          <Link href="/admin/users"><button className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/15 rounded-xl transition-colors">Users</button></Link>
          <button onClick={loadData} className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors">↻ Refresh</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-1">Platform Analytics</h1>
          <p className="text-slate-400">Real-time usage data, game engagement, and AI-powered insights</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 mb-6 text-red-300">
            {error} <button onClick={loadData} className="ml-3 underline">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-slate-900 border border-white/10 rounded-2xl p-5 animate-pulse h-28" />
            ))}
          </div>
        ) : o ? (
          <>
            {/* ── Overview Cards ──────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <StatCard icon="👥" label="Total Users" value={o.totalUsers.toLocaleString()} color="text-blue-400" />
              <StatCard icon="✅" label="Active Subs" value={o.activeSubscriptions.toLocaleString()} sub={`${o.totalUsers > 0 ? Math.round((o.activeSubscriptions / o.totalUsers) * 100) : 0}% conversion`} color="text-emerald-400" />
              <StatCard icon="🌅" label="Daily Active" value={o.dau.toLocaleString()} sub="unique sessions today" color="text-cyan-400" />
              <StatCard icon="📅" label="Weekly Active" value={o.wau.toLocaleString()} sub="unique sessions 7d" color="text-purple-400" />
              <StatCard icon="🎮" label="Games Today" value={o.gamesToday.toLocaleString()} sub={`${o.gamesThisWeek} this week`} color="text-amber-400" />
              <StatCard icon="⏱️" label="Avg Time/Page" value={formatSeconds(o.avgTimeOnPageSeconds)} sub="all pages" color="text-pink-400" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <StatCard icon="👀" label="Page Views Today" value={o.pageViewsToday.toLocaleString()} color="text-blue-300" />
              <StatCard icon="📊" label="Page Views Week" value={o.pageViewsWeek.toLocaleString()} color="text-blue-300" />
              <StatCard icon="🆕" label="New Users (7d)" value={o.newUsersThisWeek.toLocaleString()} color="text-emerald-300" />
              <StatCard icon="🆕" label="New Users (30d)" value={o.newUsersThisMonth.toLocaleString()} color="text-emerald-300" />
            </div>

            {/* ── 14-Day Trend ────────────────────────────────────────────── */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-bold mb-4">14-Day Activity Trend</h2>
              <TrendChart data={data!.trend} />
              <p className="text-slate-500 text-xs mt-2">Total analytics events per day</p>
            </div>

            {/* ── Tabbed Detail Panels ─────────────────────────────────────── */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 mb-6">
              <div className="flex gap-2 mb-6 flex-wrap">
                {[
                  { key: "games", label: "🎮 Game Popularity" },
                  { key: "pages", label: "📄 Page Views" },
                  { key: "time", label: "⏱️ Time on Page" },
                  { key: "events", label: "📡 Event Types" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      activeTab === key ? "bg-blue-600 text-white" : "bg-white/10 hover:bg-white/15 text-slate-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {activeTab === "games" && (
                <div>
                  <h2 className="text-base font-bold mb-1 text-slate-300">Games — Most to Least Played</h2>
                  <p className="text-slate-500 text-xs mb-4">Combined from session logs and analytics events</p>
                  {data!.gamePopularity.length === 0 ? (
                    <p className="text-slate-500 text-sm">No game data yet. Games will appear here once teachers start sessions.</p>
                  ) : (
                    <div className="space-y-1">
                      {data!.gamePopularity.map((g, i) => (
                        <div key={g.gameType} className="flex items-center gap-3 py-1">
                          <span className="w-5 text-center text-xs font-bold text-slate-500">{i + 1}</span>
                          <HorizBar
                            label={GAME_NAMES[g.gameType] || g.gameType}
                            value={g.plays}
                            max={maxGamePlays}
                            color={i === 0 ? "bg-emerald-500" : i < 3 ? "bg-blue-500" : i === data!.gamePopularity.length - 1 ? "bg-red-500/70" : "bg-slate-600"}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "pages" && (
                <div>
                  <h2 className="text-base font-bold mb-1 text-slate-300">Page View Counts</h2>
                  <p className="text-slate-500 text-xs mb-4">Total visits per page (all time)</p>
                  {data!.pagePopularity.length === 0 ? (
                    <p className="text-slate-500 text-sm">No page view data yet. Views are tracked as users navigate the app.</p>
                  ) : (
                    <div className="space-y-1">
                      {data!.pagePopularity.map((p) => (
                        <HorizBar
                          key={p.pagePath}
                          label={PAGE_NAMES[p.pagePath || ""] || p.pagePath || "Unknown"}
                          value={p.views}
                          max={maxPageViews}
                          color="bg-purple-500"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "time" && (
                <div>
                  <h2 className="text-base font-bold mb-1 text-slate-300">Average Time Spent per Page</h2>
                  <p className="text-slate-500 text-xs mb-4">Measured from page entry to exit</p>
                  {data!.timePerPage.length === 0 ? (
                    <p className="text-slate-500 text-sm">No time-on-page data yet. This is tracked as users navigate between pages.</p>
                  ) : (
                    <div className="space-y-2">
                      {data!.timePerPage.map((p) => (
                        <div key={p.pagePath} className="flex items-center gap-3">
                          <div className="w-48 text-sm text-slate-300 truncate flex-shrink-0">
                            {PAGE_NAMES[p.pagePath || ""] || p.pagePath || "Unknown"}
                          </div>
                          <div className="flex-1 bg-slate-800 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-amber-500 transition-all duration-700"
                              style={{ width: `${maxAvgTime > 0 ? Math.round((Number(p.avgSeconds) / maxAvgTime) * 100) : 0}%` }}
                            />
                          </div>
                          <div className="w-16 text-right text-sm font-bold text-amber-300 flex-shrink-0">
                            {formatSeconds(Number(p.avgSeconds))}
                          </div>
                          <div className="w-16 text-right text-xs text-slate-500 flex-shrink-0">
                            {p.count} exits
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "events" && (
                <div>
                  <h2 className="text-base font-bold mb-1 text-slate-300">Analytics Event Breakdown</h2>
                  <p className="text-slate-500 text-xs mb-4">Total count by event type (all time)</p>
                  {data!.eventTypeBreakdown.length === 0 ? (
                    <p className="text-slate-500 text-sm">No events recorded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {data!.eventTypeBreakdown.map((e) => {
                        const maxEvents = Number(data!.eventTypeBreakdown[0]?.count || 1);
                        return (
                          <div key={e.eventType} className="flex items-center gap-3">
                            <EventBadge type={e.eventType} />
                            <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-cyan-500 transition-all"
                                style={{ width: `${Math.round((Number(e.count) / maxEvents) * 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold w-12 text-right">{Number(e.count).toLocaleString()}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── AI Insights ──────────────────────────────────────────────── */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-500/30 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <span>🤖</span> AI-Powered Insights
                  </h2>
                  <p className="text-slate-400 text-sm">Powered by Kimi Moonshot AI · Analyzes your platform data</p>
                </div>
                <button
                  onClick={generateInsights}
                  disabled={insightsLoading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
                >
                  {insightsLoading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>✨ Generate Insights</>
                  )}
                </button>
              </div>

              {insightsError && (
                <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3 mb-4 text-red-300 text-sm">{insightsError}</div>
              )}

              {!insights && !insightsLoading && (
                <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-xl p-6 text-center">
                  <p className="text-indigo-300 text-sm mb-1">Click "Generate Insights" to analyze your platform data</p>
                  <p className="text-slate-500 text-xs">AI will review game popularity, user engagement, and conversion data to provide actionable recommendations</p>
                </div>
              )}

              {insightsLoading && (
                <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-xl p-6 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
                  </div>
                  <p className="text-indigo-300 text-sm">Analyzing platform data and generating insights...</p>
                  <p className="text-slate-500 text-xs mt-1">This may take 10-20 seconds</p>
                </div>
              )}

              {insights && (
                <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-xl p-5">
                  <div className="prose prose-invert max-w-none">
                    {insights.split("\n").map((line, i) => {
                      if (!line.trim()) return <div key={i} className="h-2" />;
                      if (line.startsWith("##") || line.match(/^\*\*[^*]+\*\*:?\s*$/)) {
                        const text = line.replace(/^#+\s*/, "").replace(/\*\*/g, "");
                        return <h3 key={i} className="text-indigo-300 font-bold text-sm uppercase tracking-wide mt-4 mb-2">{text}</h3>;
                      }
                      if (line.startsWith("- ") || line.startsWith("• ") || line.startsWith("* ")) {
                        const text = line.replace(/^[-•*]\s*/, "").replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                        return (
                          <div key={i} className="flex gap-2 mb-2">
                            <span className="text-indigo-400 flex-shrink-0 mt-0.5">•</span>
                            <p className="text-slate-200 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: text }} />
                          </div>
                        );
                      }
                      const text = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                      return <p key={i} className="text-slate-300 text-sm mb-2" dangerouslySetInnerHTML={{ __html: text }} />;
                    })}
                  </div>
                  <div className="mt-4 pt-3 border-t border-indigo-500/20 flex justify-between items-center">
                    <span className="text-slate-500 text-xs">Generated by AI · Based on current platform data</span>
                    <button onClick={generateInsights} className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold">
                      ↻ Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Recent Events Feed ───────────────────────────────────────── */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4">Recent Activity Feed</h2>
              {data!.recentEvents.length === 0 ? (
                <p className="text-slate-500 text-sm">No events recorded yet. Events appear here as users interact with the platform.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {data!.recentEvents.map((ev) => (
                    <div key={ev.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                      <EventBadge type={ev.eventType} />
                      <div className="flex-1 min-w-0">
                        <span className="text-slate-300 text-sm truncate">
                          {ev.gameType ? (GAME_NAMES[ev.gameType] || ev.gameType) :
                            ev.pagePath ? (PAGE_NAMES[ev.pagePath] || ev.pagePath) : "—"}
                        </span>
                        {ev.durationSeconds != null && ev.durationSeconds > 0 && (
                          <span className="ml-2 text-slate-500 text-xs">({formatSeconds(ev.durationSeconds)})</span>
                        )}
                      </div>
                      <span className="text-xs text-slate-600 flex-shrink-0">
                        {new Date(ev.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
