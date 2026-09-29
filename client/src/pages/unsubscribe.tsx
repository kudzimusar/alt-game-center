import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

export default function Unsubscribe() {
  const [location] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const email = params.get("email");

  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [manualEmail, setManualEmail] = useState(email || "");

  async function doUnsubscribe(tok?: string, em?: string) {
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tok ? { token: tok } : { email: em }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      setStatus("done");
      setMessage("You've been unsubscribed from ALT Game Center newsletters. You'll still receive essential account emails.");
    } catch (e: any) {
      setStatus("error");
      setMessage(e.message);
    }
  }

  useEffect(() => {
    if (token) doUnsubscribe(token);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 w-full max-w-md text-center">
        <div className="text-4xl mb-4">
          {status === "done" ? "✅" : status === "error" ? "❌" : status === "loading" ? "⏳" : "📧"}
        </div>

        <h1 className="text-xl font-black text-white mb-2">
          {status === "done" ? "Unsubscribed" : status === "error" ? "Something went wrong" : "Unsubscribe"}
        </h1>

        {status === "done" && (
          <p className="text-slate-400 text-sm mb-6">{message}</p>
        )}

        {status === "error" && (
          <p className="text-red-400 text-sm mb-6">{message}</p>
        )}

        {(status === "idle" || status === "error") && !token && (
          <div className="mt-4">
            <p className="text-slate-400 text-sm mb-4">Enter your email to unsubscribe from newsletters:</p>
            <input
              type="email"
              value={manualEmail}
              onChange={e => setManualEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 mb-4"
            />
            <button
              onClick={() => doUnsubscribe(undefined, manualEmail)}
              disabled={!manualEmail || status === "loading"}
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-60 rounded-xl font-bold text-sm text-white transition-colors"
            >
              {status === "loading" ? "Processing..." : "Unsubscribe"}
            </button>
          </div>
        )}

        {status === "loading" && !token && (
          <p className="text-slate-400 text-sm">Processing your request...</p>
        )}

        <div className="mt-6 pt-4 border-t border-white/10">
          <Link href="/">
            <button className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors">
              ← Back to ALT Game Center
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
