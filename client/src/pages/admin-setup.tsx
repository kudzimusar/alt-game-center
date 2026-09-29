import { useState } from "react";
import { Link, useLocation } from "wouter";
import { apiFetch } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminSetup() {
  const { refreshUser } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handlePromote(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await apiFetch("/api/auth/promote-admin", {
        method: "POST",
        body: JSON.stringify({ email, token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult({ success: true, message: data.message || "Admin promotion successful!" });
      await refreshUser();
    } catch (err: any) {
      setResult({ success: false, message: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">⚙️</div>
          <h1 className="text-2xl font-black text-white mb-1">Admin Setup</h1>
          <p className="text-slate-400 text-sm">Promote a registered user to system admin</p>
        </div>

        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
          {result ? (
            <div className={`text-center p-6 rounded-xl mb-4 ${result.success ? "bg-emerald-900/30 border border-emerald-500/30" : "bg-red-900/30 border border-red-500/30"}`}>
              <div className="text-3xl mb-2">{result.success ? "✅" : "❌"}</div>
              <p className={`font-semibold ${result.success ? "text-emerald-300" : "text-red-300"}`}>{result.message}</p>
              {result.success && (
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => setLocation("/admin")}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 rounded-xl font-semibold text-sm transition-colors text-white"
                  >
                    Go to Admin Console →
                  </button>
                  <button
                    onClick={() => setLocation("/login")}
                    className="w-full py-2.5 bg-white/10 hover:bg-white/15 rounded-xl font-semibold text-sm transition-colors text-white"
                  >
                    Sign in again to refresh
                  </button>
                </div>
              )}
              {!result.success && (
                <button
                  onClick={() => setResult(null)}
                  className="mt-3 text-sm text-slate-400 hover:text-white underline"
                >
                  Try again
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handlePromote} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Email address of registered user</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="admin@example.com"
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">The user must already be registered on the platform.</p>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Admin Setup Token</label>
                <input
                  type="password"
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  required
                  placeholder="Enter the ADMIN_SETUP_TOKEN"
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">Found in the environment secrets as ADMIN_SETUP_TOKEN.</p>
              </div>

              <div className="bg-slate-800 rounded-xl p-4 text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300 mb-2">What this does:</p>
                <p>✓ Promotes the user to Admin role</p>
                <p>✓ Grants full platform access (District plan)</p>
                <p>✓ Unlocks the admin console at /admin</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-60 rounded-xl font-bold text-sm transition-colors"
              >
                {loading ? "Promoting..." : "Promote to Admin"}
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-4">
          <Link href="/dashboard">
            <span className="text-slate-500 hover:text-slate-400 text-sm cursor-pointer">← Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
