import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/auth";
import confetti from "canvas-confetti";

export default function OnboardingSuccess() {
  const [, setLocation] = useLocation();
  const { user, refreshUser } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "pending">("loading");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setStatus("pending");
      return;
    }
    verifyPayment(sessionId);
  }, []);

  async function verifyPayment(sessionId: string) {
    try {
      const res = await apiFetch("/api/stripe/verify-session", {
        method: "POST",
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshUser();
        setStatus("success");
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 }, colors: ["#3b82f6", "#8b5cf6", "#10b981"] });
      } else {
        setStatus("pending");
      }
    } catch {
      setStatus("pending");
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-5xl mb-4 animate-pulse">⏳</div>
          <p className="text-xl font-semibold">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-6">🎉</div>
          <h1 className="text-4xl font-black text-white mb-4">
            You're all set, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-slate-400 text-lg mb-8">
            Your subscription is active. Time to make your lessons unforgettable.
          </p>
          <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-6 mb-8 text-left space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <span className="text-white font-medium">All games unlocked</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎮</span>
              <span className="text-white font-medium">AI content generation ready</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">👥</span>
              <span className="text-white font-medium">Multiplayer classroom tools active</span>
            </div>
          </div>
          <Link href="/games">
            <button className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-black text-lg rounded-2xl hover:opacity-90 transition-all shadow-lg">
              Start playing! 🚀
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">⏳</div>
        <h1 className="text-3xl font-black text-white mb-4">Payment processing...</h1>
        <p className="text-slate-400 mb-8">
          Your payment may take a moment to process. If you've already paid, your access will be activated shortly.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => refreshUser().then(() => setLocation("/games"))}
            className="py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-all"
          >
            Continue to games →
          </button>
          <Link href="/pricing">
            <button className="py-3.5 text-slate-400 hover:text-white font-medium transition-colors text-sm">
              Return to pricing
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
