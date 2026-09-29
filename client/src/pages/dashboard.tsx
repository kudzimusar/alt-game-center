import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { apiFetch } from "@/lib/auth";
import { useState } from "react";

const PLAN_NAMES: Record<string, string> = {
  starter: "Starter",
  pro: "Pro Teacher",
  school: "School",
  district: "District",
  free: "Free Access",
};

export default function Dashboard() {
  const { user, logout, isSubscribed } = useAuth();
  const [, setLocation] = useLocation();
  const [portalLoading, setPortalLoading] = useState(false);

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  async function openBillingPortal() {
    setPortalLoading(true);
    try {
      const res = await apiFetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      alert("Failed to open billing portal. Please try again.");
    } finally {
      setPortalLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="mb-4">Please sign in to view your dashboard.</p>
          <Link href="/login"><button className="px-6 py-2.5 bg-blue-600 rounded-xl font-semibold">Sign in</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="text-xl">🎮</span>
            <span className="font-black text-sm bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">ALT Game Center</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link href="/admin">
              <button className="px-4 py-2 text-sm font-semibold bg-amber-600 hover:bg-amber-500 rounded-xl transition-colors">
                Admin Console
              </button>
            </Link>
          )}
          <Link href="/games"><button className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors">Games</button></Link>
          <button onClick={logout} className="text-slate-400 hover:text-white text-sm transition-colors">Sign out</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-black mb-1">Hi, {user.name.split(" ")[0]}! 👋</h1>
          <p className="text-slate-400">{user.email}</p>
          {isAdmin && (
            <div className="mt-2 inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full">
              ⭐ Admin
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-7">
            <h2 className="text-lg font-bold mb-5">Your Plan</h2>
            {isAdmin ? (
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 text-xl">⭐</div>
                <div>
                  <div className="font-bold text-white">Admin Access</div>
                  <div className="text-amber-400 text-sm">Full platform access</div>
                </div>
              </div>
            ) : isSubscribed ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400 text-xl">✓</div>
                  <div>
                    <div className="font-bold text-white">{PLAN_NAMES[user.subscriptionPlan || ""] || user.subscriptionPlan}</div>
                    <div className="text-green-400 text-sm">Active subscription</div>
                  </div>
                </div>
                <button
                  onClick={openBillingPortal}
                  disabled={portalLoading}
                  className="w-full py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60"
                >
                  {portalLoading ? "Loading..." : "Manage billing →"}
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center text-slate-400 text-xl">⚠️</div>
                  <div>
                    <div className="font-bold text-white">No active plan</div>
                    <div className="text-slate-400 text-sm">Subscribe to unlock all games</div>
                  </div>
                </div>
                <Link href="/pricing">
                  <button className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all">
                    Choose a plan →
                  </button>
                </Link>
              </>
            )}
          </div>

          <div className="bg-slate-900 border border-white/10 rounded-2xl p-7">
            <h2 className="text-lg font-bold mb-5">Account Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Name</span>
                <span className="text-white font-medium">{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Username</span>
                <span className="text-white font-medium">@{user.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Role</span>
                <span className="text-white font-medium capitalize">
                  {user.role === "school_admin" ? "School Admin" : user.role === "admin" ? "Admin" : "Teacher"}
                </span>
              </div>
              {(user as any).school && (
                <div className="flex justify-between">
                  <span className="text-slate-400">School</span>
                  <span className="text-white font-medium">{(user as any).school}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="bg-amber-900/20 border border-amber-500/30 rounded-2xl p-7 mb-8">
            <h2 className="text-lg font-bold mb-5 text-amber-300">Admin Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/admin">
                <div className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl p-4 cursor-pointer transition-colors">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-sm font-semibold text-amber-200">Admin Dashboard</div>
                  <div className="text-xs text-amber-400/70 mt-1">Platform stats</div>
                </div>
              </Link>
              <Link href="/admin/users">
                <div className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl p-4 cursor-pointer transition-colors">
                  <div className="text-2xl mb-2">👥</div>
                  <div className="text-sm font-semibold text-amber-200">Manage Users</div>
                  <div className="text-xs text-amber-400/70 mt-1">View, edit, grant access</div>
                </div>
              </Link>
              <Link href="/games">
                <div className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl p-4 cursor-pointer transition-colors">
                  <div className="text-2xl mb-2">🎮</div>
                  <div className="text-sm font-semibold text-amber-200">All Games</div>
                  <div className="text-xs text-amber-400/70 mt-1">19 interactive games</div>
                </div>
              </Link>
            </div>
          </div>
        )}

        <div className="bg-slate-900 border border-white/10 rounded-2xl p-7">
          <h2 className="text-lg font-bold mb-5">Quick Access</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { emoji: "🎮", name: "All Games", href: "/games" },
              { emoji: "💎", name: "Jeopardy", href: "/game/jeopardy" },
              { emoji: "🎯", name: "3-Hint Quiz", href: "/game/3-hint" },
              { emoji: "🟩", name: "Bongo Bingo", href: "/game/bongo-bingo" },
            ].map((g) => (
              <Link key={g.name} href={g.href}>
                <div className="bg-slate-800 hover:bg-slate-700 border border-white/5 rounded-xl p-4 text-center cursor-pointer transition-colors">
                  <div className="text-2xl mb-2">{g.emoji}</div>
                  <div className="text-sm font-semibold text-white">{g.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
