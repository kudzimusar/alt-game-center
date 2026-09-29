import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/auth";
import { Check, Zap, Star, Building2, Landmark, QrCode, X } from "lucide-react";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    nameJa: "スターター",
    description: "Perfect for individual ALTs trying it out",
    price: 9,
    priceYearly: 89,
    features: [
      "Access to 10 core games",
      "Up to 2 classes",
      "Basic classroom tools",
      "Email support",
    ],
    notIncluded: ["AI-generated content", "Multiplayer Bingo", "Priority support"],
    highlight: false,
    icon: "🌱",
    color: "from-slate-500 to-slate-600",
  },
  {
    id: "pro",
    name: "Pro Teacher",
    nameJa: "プロ教師",
    description: "For ALTs and JTEs who want the full experience",
    price: 19,
    priceYearly: 179,
    features: [
      "All 50+ games unlocked",
      "Unlimited classes",
      "AI-generated content",
      "Interview Bingo multiplayer",
      "Priority email support",
    ],
    notIncluded: ["Admin dashboard", "Team accounts"],
    highlight: true,
    icon: "⭐",
    color: "from-blue-500 to-purple-600",
  },
  {
    id: "school",
    name: "School",
    nameJa: "学校プラン",
    description: "For schools with multiple teachers",
    price: 49,
    priceYearly: 469,
    features: [
      "Everything in Pro",
      "Up to 10 teacher accounts",
      "Admin dashboard",
      "Custom branding",
      "Dedicated support",
    ],
    notIncluded: [],
    highlight: false,
    icon: "🏫",
    color: "from-green-500 to-teal-600",
  },
  {
    id: "district",
    name: "District",
    nameJa: "教育委員会",
    description: "For boards of education & large institutions",
    price: 149,
    priceYearly: 1399,
    features: [
      "Everything in School",
      "Unlimited teacher accounts",
      "SSO / LMS integration",
      "Usage analytics",
      "SLA & phone support",
    ],
    notIncluded: [],
    highlight: false,
    icon: "🏛️",
    color: "from-orange-500 to-red-600",
  },
];

const PLAN_ICONS: Record<string, any> = {
  starter: Zap,
  pro: Star,
  school: Building2,
  district: Landmark,
};

export default function Pricing() {
  const [, setLocation] = useLocation();
  const { user, isSubscribed } = useAuth();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const [qrModal, setQrModal] = useState<{ url: string; qr: string; plan: string } | null>(null);

  async function handleSelectPlan(planId: string) {
    if (!user) {
      setLocation(`/signup?plan=${planId}`);
      return;
    }
    setLoading(planId);
    try {
      const res = await apiFetch("/api/stripe/create-checkout", {
        method: "POST",
        body: JSON.stringify({ planId, billing }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start checkout");

      // Generate QR code for the checkout URL
      const qrRes = await apiFetch(`/api/stripe/checkout-qr?sessionUrl=${encodeURIComponent(data.url)}`);
      if (qrRes.ok) {
        const qrData = await qrRes.json();
        setQrModal({ url: data.url, qr: qrData.qr, plan: planId });
      } else {
        window.location.href = data.url;
      }
    } catch (err: any) {
      alert(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  const savings = (plan: typeof PLANS[0]) => {
    const monthly = plan.price * 12;
    const yearly = plan.priceYearly;
    return Math.round(((monthly - yearly) / monthly) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="text-center pt-16 pb-12 px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8 text-sm">
          ← Back to home
        </Link>
        <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-medium px-4 py-2 rounded-full mb-6">
          <span>🎌</span> Designed for Japanese classrooms
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">
          Choose the plan that fits your classroom. No hidden fees, cancel anytime.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1 gap-1">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              billing === "monthly"
                ? "bg-white text-slate-900"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
              billing === "yearly"
                ? "bg-white text-slate-900"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Yearly
            <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-md font-bold">
              Save up to 22%
            </span>
          </button>
        </div>
      </div>

      {/* Plans grid */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {PLANS.map((plan) => {
            const Icon = PLAN_ICONS[plan.id];
            const price = billing === "yearly" ? plan.priceYearly : plan.price;
            const perMonth = billing === "yearly" ? (plan.priceYearly / 12).toFixed(0) : plan.price;
            const isCurrent = user?.subscriptionPlan === plan.id && isSubscribed;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl overflow-hidden transition-transform hover:-translate-y-1 ${
                  plan.highlight
                    ? "ring-2 ring-blue-500 shadow-2xl shadow-blue-500/25"
                    : "ring-1 ring-white/10"
                }`}
              >
                {plan.highlight && (
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold text-center py-2 tracking-wide">
                    ⭐ MOST POPULAR
                  </div>
                )}
                <div className="bg-slate-800/80 backdrop-blur p-7 h-full flex flex-col">
                  {/* Plan header */}
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-2xl mb-5`}>
                    {plan.icon}
                  </div>
                  <div className="mb-1">
                    <h3 className="text-white text-xl font-black">{plan.name}</h3>
                    <p className="text-slate-400 text-xs">{plan.nameJa}</p>
                  </div>
                  <p className="text-slate-400 text-sm mb-6">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-end gap-1">
                      <span className="text-white text-4xl font-black">${perMonth}</span>
                      <span className="text-slate-400 text-sm mb-1.5">/mo</span>
                    </div>
                    {billing === "yearly" && (
                      <div className="text-xs text-green-400 mt-1">
                        Save {savings(plan)}% — ${plan.priceYearly}/year
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Check size={15} className="text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300 text-sm">{f}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 opacity-40">
                        <X size={15} className="text-slate-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-500 text-sm line-through">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {isCurrent ? (
                    <div className="w-full py-3.5 bg-green-500/20 border border-green-500/30 text-green-400 font-bold rounded-xl text-center text-sm">
                      ✓ Current Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={loading === plan.id}
                      className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                        plan.highlight
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90"
                          : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                      } disabled:opacity-60`}
                    >
                      {loading === plan.id ? (
                        "Loading..."
                      ) : (
                        <>
                          <QrCode size={16} />
                          {user ? "Subscribe Now" : "Get Started"}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust badges */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 text-sm mb-6">Trusted by teachers across Japan</p>
          <div className="flex flex-wrap justify-center gap-6 text-slate-500 text-sm">
            {["🔒 Secure payments via Stripe", "📧 Cancel anytime by email", "💳 Credit card & QR code pay", "🇯🇵 Optimized for Japan classrooms"].map((t) => (
              <span key={t} className="flex items-center gap-1">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {qrModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setQrModal(null)}>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Pay by QR Code</h3>
            <p className="text-slate-500 text-sm mb-6">Scan with your phone or click below to pay on this device</p>
            <div className="flex justify-center mb-6">
              <img src={qrModal.qr} alt="Payment QR Code" className="w-52 h-52 rounded-xl shadow-lg" />
            </div>
            <a
              href={qrModal.url}
              className="block w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-all mb-3"
            >
              Pay on this device →
            </a>
            <button
              onClick={() => setQrModal(null)}
              className="text-slate-400 hover:text-slate-600 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
