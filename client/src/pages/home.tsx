import React from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Check } from "lucide-react";

/* ── Animated cherry blossom petal ───────────────────────── */
function Petal({ style }: { style: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" style={style} className="absolute opacity-0 w-5 h-5 pointer-events-none select-none" aria-hidden>
      <path d="M12 2 C14 6 18 8 12 12 C6 8 10 6 12 2Z" fill="#f9a8d4" />
      <path d="M12 2 C10 6 6 8 12 12 C18 8 14 6 12 2Z" fill="#fbcfe8" opacity=".7" />
    </svg>
  );
}

/* ── Manga-style hero illustration ────────────────────────── */
function HeroIllustration() {
  return (
    <div className="relative w-full max-w-md mx-auto select-none" style={{ height: 420 }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-14px)} }
        @keyframes floatSlow { 0%,100%{transform:translateY(0px) rotate(-3deg)} 50%{transform:translateY(-9px) rotate(3deg)} }
        @keyframes blink { 0%,90%,100%{scaleY:1} 95%{scaleY:0.05} }
        @keyframes shimmer { 0%,100%{opacity:.6} 50%{opacity:1} }
        @keyframes petalFall {
          0%{opacity:0; transform:translateY(-20px) rotate(0deg) translateX(0px)}
          10%{opacity:.9}
          90%{opacity:.7}
          100%{opacity:0; transform:translateY(420px) rotate(720deg) translateX(60px)}
        }
        @keyframes petalFall2 {
          0%{opacity:0; transform:translateY(-20px) rotate(30deg) translateX(0px)}
          10%{opacity:.8}
          90%{opacity:.6}
          100%{opacity:0; transform:translateY(380px) rotate(-540deg) translateX(-40px)}
        }
        @keyframes petalFall3 {
          0%{opacity:0; transform:translateY(-10px) rotate(-20deg)}
          15%{opacity:.7}
          85%{opacity:.5}
          100%{opacity:0; transform:translateY(400px) rotate(600deg) translateX(30px)}
        }
        @keyframes pulse-glow { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:.8;transform:scale(1.08)} }
        @keyframes orbit { 0%{transform:rotate(0deg) translateX(130px) rotate(0deg)} 100%{transform:rotate(360deg) translateX(130px) rotate(-360deg)} }
        @keyframes orbitReverse { 0%{transform:rotate(0deg) translateX(100px) rotate(0deg)} 100%{transform:rotate(-360deg) translateX(100px) rotate(360deg)} }
        @keyframes bobCard { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-8px) rotate(2deg)} }
        @keyframes bobCard2 { 0%,100%{transform:translateY(0) rotate(3deg)} 50%{transform:translateY(-10px) rotate(-1deg)} }
        @keyframes flashLine { 0%,100%{opacity:0} 30%,70%{opacity:.15} }
        .hero-char { animation: float 3.6s ease-in-out infinite; transform-origin: center bottom; }
        .hero-card1 { animation: bobCard 4.2s ease-in-out infinite; }
        .hero-card2 { animation: bobCard2 3.8s ease-in-out infinite; }
        .glow-ring { animation: pulse-glow 3s ease-in-out infinite; }
        .petal1 { animation: petalFall 7s ease-in-out 0s infinite; left: 20%; top: -20px; }
        .petal2 { animation: petalFall2 8.5s ease-in-out 1.5s infinite; left: 60%; top: -10px; }
        .petal3 { animation: petalFall3 6.8s ease-in-out 3s infinite; left: 40%; top: -15px; }
        .petal4 { animation: petalFall 9s ease-in-out 4.5s infinite; left: 80%; top: -20px; }
        .petal5 { animation: petalFall2 7.5s ease-in-out 2.2s infinite; left: 10%; top: -5px; }
        .sparkle { animation: shimmer 2s ease-in-out infinite; }
        .orbit-star { animation: orbit 12s linear infinite; }
        .orbit-star2 { animation: orbitReverse 9s linear infinite; }
      `}</style>

      {/* Falling petals */}
      <Petal style={{ left: "20%", top: -20 }} />
      <div className="petal1 absolute"><svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden><path d="M12 2C14 6 18 8 12 12C6 8 10 6 12 2Z" fill="#f9a8d4"/></svg></div>
      <div className="petal2 absolute"><svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden><path d="M12 2C14 6 18 8 12 12C6 8 10 6 12 2Z" fill="#f472b6"/></svg></div>
      <div className="petal3 absolute"><svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden><path d="M12 2C14 6 18 8 12 12C6 8 10 6 12 2Z" fill="#fbcfe8"/></svg></div>
      <div className="petal4 absolute"><svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden><path d="M12 2C14 6 18 8 12 12C6 8 10 6 12 2Z" fill="#f9a8d4"/></svg></div>
      <div className="petal5 absolute"><svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden><path d="M12 2C14 6 18 8 12 12C6 8 10 6 12 2Z" fill="#f472b6"/></svg></div>

      {/* Glow halo */}
      <div className="glow-ring absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, rgba(59,130,246,0.10) 50%, transparent 70%)" }} />

      {/* Main character SVG */}
      <div className="hero-char absolute left-1/2 -translate-x-1/2" style={{ bottom: 30 }}>
        <svg viewBox="0 0 200 280" width="200" height="280" aria-label="Anime student character">
          {/* School uniform body */}
          <rect x="65" y="155" width="70" height="85" rx="8" fill="#1e3a8a"/>
          {/* Collar / white shirt */}
          <polygon points="100,155 82,175 100,168 118,175" fill="white" opacity=".9"/>
          {/* Tie */}
          <polygon points="100,158 96,185 100,180 104,185" fill="#ef4444"/>
          {/* Arms */}
          <rect x="38" y="158" width="28" height="55" rx="10" fill="#1e3a8a"/>
          <rect x="134" y="158" width="28" height="55" rx="10" fill="#1e3a8a"/>
          {/* Hands */}
          <ellipse cx="52" cy="215" rx="12" ry="10" fill="#fde68a"/>
          <ellipse cx="148" cy="215" rx="12" ry="10" fill="#fde68a"/>
          {/* Legs */}
          <rect x="73" y="238" width="22" height="38" rx="8" fill="#1e40af"/>
          <rect x="105" y="238" width="22" height="38" rx="8" fill="#1e40af"/>
          {/* Shoes */}
          <ellipse cx="84" cy="276" rx="16" ry="7" fill="#0f172a"/>
          <ellipse cx="116" cy="276" rx="16" ry="7" fill="#0f172a"/>
          {/* Head */}
          <ellipse cx="100" cy="100" rx="50" ry="52" fill="#fde68a"/>
          {/* Anime hair – dark, voluminous */}
          <path d="M52,80 Q45,30 100,22 Q155,30 148,80" fill="#1c1917"/>
          <path d="M52,80 Q44,100 48,115" fill="#1c1917"/>
          <path d="M148,80 Q156,100 152,115" fill="#1c1917"/>
          <path d="M68,28 Q60,50 58,70" fill="#292524" stroke="none"/>
          <path d="M100,22 Q95,38 92,55" fill="#292524" stroke="none"/>
          {/* Hair forelock */}
          <path d="M80,40 Q72,65 75,85" fill="#1c1917" opacity=".9"/>
          {/* Eyes – large anime style */}
          <ellipse cx="80" cy="105" rx="13" ry="14" fill="white"/>
          <ellipse cx="120" cy="105" rx="13" ry="14" fill="white"/>
          <ellipse cx="80" cy="107" rx="9" ry="10" fill="#1e40af"/>
          <ellipse cx="120" cy="107" rx="9" ry="10" fill="#1e40af"/>
          <ellipse cx="80" cy="108" rx="6" ry="7" fill="#0c0a09"/>
          <ellipse cx="120" cy="108" rx="6" ry="7" fill="#0c0a09"/>
          {/* Eye shine */}
          <ellipse cx="76" cy="103" rx="3" ry="3" fill="white"/>
          <ellipse cx="116" cy="103" rx="3" ry="3" fill="white"/>
          <ellipse cx="83" cy="112" rx="1.5" ry="1.5" fill="white" opacity=".7"/>
          <ellipse cx="123" cy="112" rx="1.5" ry="1.5" fill="white" opacity=".7"/>
          {/* Eyebrows */}
          <path d="M68,92 Q80,87 90,92" stroke="#1c1917" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <path d="M110,92 Q120,87 132,92" stroke="#1c1917" strokeWidth="3" fill="none" strokeLinecap="round"/>
          {/* Blush marks */}
          <ellipse cx="68" cy="117" rx="8" ry="5" fill="#fca5a5" opacity=".5"/>
          <ellipse cx="132" cy="117" rx="8" ry="5" fill="#fca5a5" opacity=".5"/>
          {/* Smile */}
          <path d="M87,128 Q100,140 113,128" stroke="#c2410c" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          {/* Ears */}
          <ellipse cx="50" cy="108" rx="8" ry="10" fill="#fde68a"/>
          <ellipse cx="150" cy="108" rx="8" ry="10" fill="#fde68a"/>
        </svg>
      </div>

      {/* Floating game card 1 – Quiz */}
      <div className="hero-card1 absolute" style={{ left: -10, top: 100 }}>
        <div className="bg-slate-800/90 border border-purple-500/40 rounded-2xl px-4 py-3 shadow-xl backdrop-blur-sm" style={{ minWidth: 130 }}>
          <div className="flex items-center gap-2 mb-1.5">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-purple-400 fill-current" aria-hidden>
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
              <text x="12" y="17" textAnchor="middle" fontSize="13" fill="currentColor" fontWeight="bold">?</text>
            </svg>
            <span className="text-xs text-purple-300 font-bold">3-Hint Quiz</span>
          </div>
          <div className="flex gap-1">
            {["A","B","C","D"].map(l => (
              <div key={l} className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: l==="A" ? "rgba(167,139,250,0.4)" : "rgba(255,255,255,0.07)", color: l==="A" ? "#c4b5fd" : "#64748b" }}>{l}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating game card 2 – Bingo */}
      <div className="hero-card2 absolute" style={{ right: -15, top: 80 }}>
        <div className="bg-slate-800/90 border border-pink-500/40 rounded-2xl px-4 py-3 shadow-xl backdrop-blur-sm" style={{ minWidth: 130 }}>
          <div className="flex items-center gap-2 mb-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#f472b6" strokeWidth="2"/>
              <rect x="7" y="7" width="4" height="4" rx="1" fill="#f472b6"/>
              <rect x="13" y="7" width="4" height="4" rx="1" fill="#f472b6" opacity=".5"/>
              <rect x="7" y="13" width="4" height="4" rx="1" fill="#f472b6" opacity=".5"/>
              <rect x="13" y="13" width="4" height="4" rx="1" fill="#f472b6"/>
            </svg>
            <span className="text-xs text-pink-300 font-bold">BINGO!</span>
          </div>
          <div className="text-xs text-green-400 font-semibold">Yuki — winner! ✓</div>
        </div>
      </div>

      {/* Floating XP badge */}
      <div className="sparkle absolute" style={{ right: 30, bottom: 100 }}>
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl px-3 py-2 shadow-lg text-center">
          <div className="text-white text-xs font-black">+150 pts</div>
        </div>
      </div>

      {/* Small decorative stars */}
      {[[22,60],[175,160],[15,200],[185,90]].map(([x,y],i) => (
        <svg key={i} viewBox="0 0 20 20" width="16" height="16" className="sparkle absolute" style={{ left:x, top:y, animationDelay:`${i*0.7}s` }} aria-hidden>
          <path d="M10 2l1.8 5.5H18l-4.9 3.6L15 17l-5-3.6L5 17l1.9-5.9L2 7.5h6.2z" fill="#fbbf24" opacity=".8"/>
        </svg>
      ))}
    </div>
  );
}

/* ── SVG icons for game cards ─────────────────────────────── */
const GameIcon = ({ type }: { type: string }) => {
  const icons: Record<string, React.ReactElement> = {
    quiz: <><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8"/><text x="12" y="17" textAnchor="middle" fontSize="12" fill="currentColor" fontWeight="bold">?</text></>,
    search: <><circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="1.8"/><line x1="16.5" y1="16.5" x2="20" y2="20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></>,
    trophy: <><path d="M6 3h12v8a6 6 0 01-12 0V3z" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M6 6H3a3 3 0 003 3m12-3h3a3 3 0 01-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/><line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="1.8"/><line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></>,
    swords: <><path d="M4 20L20 4M4 20l4-4M20 4l-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M20 4l-2 6M4 20l6-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></>,
    chat: <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="none" stroke="currentColor" strokeWidth="1.8"/></>,
    bingo: <><rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8"/><rect x="7" y="7" width="3" height="3" rx=".5" fill="currentColor"/><rect x="14" y="7" width="3" height="3" rx=".5" fill="currentColor" opacity=".5"/><rect x="7" y="14" width="3" height="3" rx=".5" fill="currentColor" opacity=".5"/><rect x="14" y="14" width="3" height="3" rx=".5" fill="currentColor"/><line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".3"/></>,
    users: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" fill="none" stroke="currentColor" strokeWidth="1.8"/><circle cx="9" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></>,
    tv: <><rect x="2" y="3" width="20" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8"/><line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="1.8"/></>,
  };
  return (
    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" aria-hidden>{icons[type]}</svg>
  );
};

const GAMES = [
  { icon: "quiz",   name: "3-Hint Quiz",    desc: "Vocabulary clue guessing",    grade: "All grades",  color: "from-violet-500/20 to-purple-600/10 border-violet-500/30 text-violet-400" },
  { icon: "search", name: "Word Hunt",       desc: "AI word search puzzles",       grade: "All grades",  color: "from-cyan-500/20 to-blue-600/10 border-cyan-500/30 text-cyan-400" },
  { icon: "trophy", name: "Jeopardy",        desc: "AI-generated question boards", grade: "Grades 1–3",  color: "from-amber-500/20 to-yellow-600/10 border-amber-500/30 text-amber-400" },
  { icon: "swords", name: "Class Battle",    desc: "Real-time quiz battles",       grade: "All grades",  color: "from-red-500/20 to-rose-600/10 border-red-500/30 text-red-400" },
  { icon: "chat",   name: "Small Talk",      desc: "Daily conversation starters",  grade: "Grades 1–3",  color: "from-emerald-500/20 to-green-600/10 border-emerald-500/30 text-emerald-400" },
  { icon: "bingo",  name: "Bongo Bingo",     desc: "Fill-in-the-blank bingo",      grade: "Grades 1–3",  color: "from-pink-500/20 to-fuchsia-600/10 border-pink-500/30 text-pink-400" },
  { icon: "users",  name: "Interview Bingo", desc: "Real-time student iPads",      grade: "All grades",  color: "from-indigo-500/20 to-blue-600/10 border-indigo-500/30 text-indigo-400" },
  { icon: "tv",     name: "Quiz Show",       desc: "TV-style classroom quiz",      grade: "All grades",  color: "from-orange-500/20 to-amber-600/10 border-orange-500/30 text-orange-400" },
];

/* ── Feature SVG illustrations ────────────────────────────── */
function AiIllustration() {
  return (
    <div className="relative" style={{ height: 300 }}>
      <style>{`
        @keyframes typeLine { 0%{width:0} 100%{width:100%} }
        @keyframes fadeSlide { 0%{opacity:0;transform:translateY(8px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes pulse2 { 0%,100%{opacity:.5} 50%{opacity:1} }
        .type-line { animation: typeLine 1.8s steps(20,end) forwards; overflow:hidden; white-space:nowrap; }
        .type-line-2 { animation: typeLine 1.8s steps(20,end) .4s forwards; overflow:hidden; white-space:nowrap; width:0; }
        .type-line-3 { animation: typeLine 1.8s steps(20,end) .8s forwards; overflow:hidden; white-space:nowrap; width:0; }
        .fade-in-1 { animation: fadeSlide .5s ease forwards .2s; opacity:0; }
        .fade-in-2 { animation: fadeSlide .5s ease forwards .7s; opacity:0; }
        .fade-in-3 { animation: fadeSlide .5s ease forwards 1.2s; opacity:0; }
        .blink-cursor { animation: pulse2 1s ease-in-out infinite; }
      `}</style>
      <div className="bg-slate-800/60 border border-white/10 rounded-3xl p-7 h-full backdrop-blur-sm">
        {/* Terminal dots */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-3 h-3 bg-red-500/80 rounded-full" />
          <div className="w-3 h-3 bg-yellow-500/80 rounded-full" />
          <div className="w-3 h-3 bg-green-500/80 rounded-full" />
          <span className="ml-2 text-slate-500 text-xs font-mono">kimi-ai · content generation</span>
        </div>

        <div className="space-y-3">
          <div className="fade-in-1 bg-gradient-to-r from-blue-500/15 to-transparent border border-blue-500/20 rounded-2xl p-4">
            <div className="text-xs text-blue-400 mb-1.5 font-semibold uppercase tracking-wide">Grade 2 · Past Tense</div>
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-400 shrink-0" fill="none"><path d="M6 3h12v8a6 6 0 01-12 0V3z" stroke="currentColor" strokeWidth="1.8"/></svg>
              <span className="text-white font-bold">Jeopardy Ready</span>
            </div>
            <div className="text-slate-400 text-xs mt-1.5">5 categories · 25 questions generated</div>
          </div>

          <div className="fade-in-2 bg-gradient-to-r from-purple-500/15 to-transparent border border-purple-500/20 rounded-2xl p-4">
            <div className="text-xs text-purple-400 mb-1.5 font-semibold uppercase tracking-wide">Grade 1 · Vocabulary</div>
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-purple-400 shrink-0" fill="none"><circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.8"/><line x1="16.5" y1="16.5" x2="20" y2="20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              <span className="text-white font-bold">Word Hunt Puzzle</span>
            </div>
            <div className="text-slate-400 text-xs mt-1.5">12 words · 10×10 grid · hints included</div>
          </div>

          <div className="fade-in-3 bg-gradient-to-r from-emerald-500/15 to-transparent border border-emerald-500/20 rounded-2xl p-4">
            <div className="text-xs text-emerald-400 mb-1.5 font-semibold uppercase tracking-wide">Grade 3 · Conditionals</div>
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-emerald-400 shrink-0" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.8"/></svg>
              <span className="text-white font-bold">Grammar Golf</span>
            </div>
            <div className="text-slate-400 text-xs mt-1.5">10 fill-in-the-blank questions · timed</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MultiplayerIllustration() {
  const students = ["Yuki", "Haru", "Aoi", "Sota", "Mia", "Ren", "Kai", "Aya", "Ryo", "Nao"];
  return (
    <div className="bg-slate-800/60 border border-white/10 rounded-3xl p-7 backdrop-blur-sm">
      <div className="text-center mb-5">
        <div className="inline-block bg-slate-700/60 rounded-2xl px-6 py-3">
          <div className="text-4xl font-black text-white tracking-widest font-mono">BXQT</div>
          <div className="text-slate-500 text-xs mt-1">Room Code · Scan to join</div>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2 mb-4">
        {students.map((s, i) => (
          <div key={s} className="rounded-xl py-1.5 text-center text-xs font-semibold transition-all"
            style={{
              background: i < 7 ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)",
              color: i < 7 ? "#86efac" : "#475569",
              border: i < 7 ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.05)"
            }}>
            {s}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 bg-gradient-to-r from-green-500/20 to-emerald-500/10 border border-green-500/30 rounded-xl p-3">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-green-400 shrink-0" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
          <rect x="7" y="7" width="3" height="3" rx=".5" fill="#4ade80"/>
          <rect x="14" y="14" width="3" height="3" rx=".5" fill="#4ade80"/>
          <line x1="3" y1="3" x2="21" y2="21" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" opacity=".4"/>
        </svg>
        <div>
          <div className="text-green-300 font-bold text-sm">BINGO! — Yuki wins!</div>
          <div className="text-green-500 text-xs">7 students connected live</div>
        </div>
      </div>
    </div>
  );
}

/* ── Logo SVG ────────────────────────────────────────────────── */
function LogoIcon() {
  return (
    <svg viewBox="0 0 40 40" className="w-9 h-9" aria-label="ALT Game Center logo">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa"/>
          <stop offset="100%" stopColor="#a78bfa"/>
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#logoGrad)"/>
      {/* Gamepad-like icon */}
      <rect x="8" y="13" width="24" height="14" rx="5" fill="none" stroke="white" strokeWidth="2"/>
      <line x1="14" y1="18" x2="14" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="20" x2="16" y2="20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="26" cy="19" r="1.5" fill="white"/>
      <circle cx="29" cy="21.5" r="1.5" fill="white"/>
    </svg>
  );
}

/* ── Feature icon rows ────────────────────────────────────────── */
const WHY = [
  {
    icon: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8"/></svg>,
    title: "Curriculum-safe",
    desc: "Every game is mapped to MEXT Grades 1–3. Perfectly aligned with New Horizon and Here We Go.",
    color: "text-green-400 bg-green-400/10 border-green-400/20"
  },
  {
    icon: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><polyline points="12 7 12 12 15 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
    title: "Zero prep",
    desc: "Open the app, pick a game, press play. AI generates fresh content in under 5 seconds.",
    color: "text-blue-400 bg-blue-400/10 border-blue-400/20"
  },
  {
    icon: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none"><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: "Real engagement",
    desc: "Teams, timers, streaks, and celebrations. Students compete and beg to play again next class.",
    color: "text-purple-400 bg-purple-400/10 border-purple-400/20"
  },
  {
    icon: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.8"/><path d="M12 2a15 15 0 010 20M12 2a15 15 0 000 20" stroke="currentColor" strokeWidth="1.8"/></svg>,
    title: "Bilingual UI",
    desc: "Japanese and English throughout. No confusion for students or co-teachers.",
    color: "text-orange-400 bg-orange-400/10 border-orange-400/20"
  },
  {
    icon: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.8"/></svg>,
    title: "Textbook aligned",
    desc: "New Horizon, Here We Go, Sunshine — all three major JHS textbooks are fully covered.",
    color: "text-pink-400 bg-pink-400/10 border-pink-400/20"
  },
  {
    icon: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.8"/></svg>,
    title: "All four skills",
    desc: "Speaking, listening, reading, and writing. A complete skill set, every lesson.",
    color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
  },
];

/* ── TESTIMONIALS ─────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    name: "Sarah M.", role: "ALT, Osaka",
    text: "My students fight over who gets to play Jeopardy. This app transformed my classes.",
    initials: "SM", bg: "from-blue-500 to-violet-600"
  },
  {
    name: "Kenji T.", role: "JTE, Tokyo",
    text: "Multiplayer Bingo with student iPads is incredible. 35 kids fully engaged every lesson.",
    initials: "KT", bg: "from-pink-500 to-rose-600"
  },
  {
    name: "Emma L.", role: "ALT, Fukuoka",
    text: "Finally a game app actually aligned with New Horizon. Saves me hours every week.",
    initials: "EL", bg: "from-emerald-500 to-teal-600"
  },
];

/* ═══════════════════════════════════════════════════════════════ */
export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">

      {/* ── Nav ────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/85 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2.5 cursor-pointer">
              <LogoIcon />
              <span className="font-black text-base bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ALT Game Center
              </span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <Link href="/games"><span className="hover:text-white transition-colors cursor-pointer">Games</span></Link>
            <Link href="/pricing"><span className="hover:text-white transition-colors cursor-pointer">Pricing</span></Link>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link href="/games">
                  <button className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors">My Games</button>
                </Link>
                <button onClick={logout} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Sign out</button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <button className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors">Sign in</button>
                </Link>
                <Link href="/signup">
                  <button className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition-all">
                    Get started
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* bg glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          {/* Manga speed lines - subtle */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden>
            {[...Array(24)].map((_, i) => (
              <line key={i} x1="720" y1="450" x2={720 + Math.cos((i/24)*Math.PI*2)*900} y2={450 + Math.sin((i/24)*Math.PI*2)*700} stroke="white" strokeWidth="1"/>
            ))}
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-20">
          {/* Left: text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold px-4 py-2 rounded-full mb-8">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" aria-hidden>
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              Built for Japanese JHS classrooms · 中学校英語ゲーム
            </div>

            <h1 className="text-5xl md:text-6xl font-black mb-6 leading-[1.08]">
              <span className="text-white">English lessons</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                students love.
              </span>
            </h1>

            <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-lg">
              19 interactive games for ALTs and JTEs. Real-time multiplayer, AI-generated content, and full MEXT curriculum alignment — ready in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3 mb-14">
              <Link href={user ? "/games" : "/signup"}>
                <button className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-base rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/25">
                  {user ? "Open my games" : "Start for free"}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/pricing">
                <button className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-white/5 border border-white/10 text-white font-semibold text-base rounded-2xl hover:bg-white/10 transition-all">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8"/></svg>
                  See pricing
                </button>
              </Link>
            </div>

            {/* 4 compact stats */}
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              {[
                { icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none"><path d="M3 3h18v18H3z" stroke="currentColor" strokeWidth="1.5" rx="2"/><path d="M9 9h6M9 12h6M9 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>, val: "19", label: "Games" },
                { icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/></svg>, val: "3", label: "Grade levels" },
                { icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>, val: "40", label: "Topics / grade" },
                { icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.5"/></svg>, val: "100%", label: "MEXT aligned" },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-3">
                  <span className="text-slate-400">{s.icon}</span>
                  <div>
                    <div className="text-white font-black text-lg leading-none">{s.val}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: animated illustration */}
          <div className="flex justify-center">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* ── Games grid ─────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-3">Every lesson, covered.</h2>
            <p className="text-slate-400 max-w-lg">Speaking, listening, reading, and writing — for every MEXT topic from Grade 1 to Grade 3.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {GAMES.map((game) => (
              <Link key={game.name} href="/games">
                <div className={`group relative bg-gradient-to-br ${game.color} border rounded-2xl p-5 hover:scale-[1.02] transition-all duration-200 cursor-pointer h-full`}>
                  <div className="mb-4"><GameIcon type={game.icon} /></div>
                  <h3 className="text-white font-bold text-base mb-1">{game.name}</h3>
                  <p className="text-slate-400 text-sm mb-3 leading-snug">{game.desc}</p>
                  <span className="inline-block text-xs font-semibold bg-white/10 px-2.5 py-1 rounded-full text-slate-300">
                    {game.grade}
                  </span>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight size={14} className="text-white/60" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/games">
              <button className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold transition-colors">
                View all 19 games <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent via-slate-900/40 to-transparent">
        <div className="max-w-6xl mx-auto space-y-28">

          {/* Feature 1: AI content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                AI-Powered Content
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-5 leading-tight">
                Fresh content,<br />every lesson.
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-7">
                Jeopardy boards, word puzzles, and quiz questions generated by Kimi AI — tailored to the grade and MEXT topic. No lesson is ever the same.
              </p>
              <ul className="space-y-2.5">
                {["Grade 1–3 vocabulary and grammar", "New Horizon & Sunshine topics", "Regenerate with one tap if needed"].map(f => (
                  <li key={f} className="flex items-center gap-3 text-slate-300 text-sm">
                    <span className="w-5 h-5 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center shrink-0">
                      <Check size={11} className="text-blue-400" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <AiIllustration />
          </div>

          {/* Feature 2: Multiplayer */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div className="lg:order-2">
              <div className="inline-flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-widest mb-4">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                Real-Time Multiplayer
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-5 leading-tight">
                Every student,<br />on their own iPad.
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-7">
                Students join by scanning a QR code — no app install needed. The teacher sees everyone's progress live on the projector screen.
              </p>
              <ul className="space-y-2.5">
                {["Works on any device with a browser", "QR code join — no install needed", "Live alerts and leaderboard on display"].map(f => (
                  <li key={f} className="flex items-center gap-3 text-slate-300 text-sm">
                    <span className="w-5 h-5 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center justify-center shrink-0">
                      <Check size={11} className="text-purple-400" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:order-1">
              <MultiplayerIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* ── Why us ─────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <h2 className="text-3xl md:text-4xl font-black mb-3">Why teachers choose us</h2>
            <p className="text-slate-400 max-w-md">Designed specifically for the Japanese JHS classroom from day one.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHY.map(f => (
              <div key={f.title} className="bg-slate-900/60 border border-white/[0.06] rounded-2xl p-6 hover:border-white/10 transition-all">
                <div className={`w-11 h-11 ${f.color} border rounded-xl flex items-center justify-center mb-4`}>{f.icon}</div>
                <h3 className="text-white font-bold text-base mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────── */}
      <section className="py-24 px-6 bg-slate-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-2">Teachers love it</h2>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} viewBox="0 0 24 24" className="w-4 h-4" fill="#facc15" aria-hidden>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
              <span className="text-slate-500 text-xs ml-2 self-center">5.0 across Japan</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-slate-800/50 border border-white/[0.08] rounded-2xl p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="#facc15" aria-hidden>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.bg} flex items-center justify-center text-white font-black text-xs`}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">{t.name}</div>
                    <div className="text-slate-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="py-32 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
            Ready to transform<br />your classroom?
          </h2>
          <p className="text-slate-400 text-lg mb-10">
            Join teachers across Japan who use ALT Game Center every week.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={user ? "/games" : "/signup"}>
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-base rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-purple-500/20">
                {user ? "Go to my games" : "Create free account"}
                <ArrowRight size={18} />
              </button>
            </Link>
            <Link href="/pricing">
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold text-base rounded-2xl hover:bg-white/10 transition-all">
                View pricing
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-slate-500">
            <LogoIcon />
            <span className="font-semibold text-slate-400">ALT Game Center</span>
            <span className="text-slate-700 hidden md:block">·</span>
            <span className="text-sm hidden md:block">Interactive English for Japanese classrooms</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-600">
            <Link href="/pricing"><span className="hover:text-slate-400 transition-colors cursor-pointer">Pricing</span></Link>
            <Link href="/games"><span className="hover:text-slate-400 transition-colors cursor-pointer">Games</span></Link>
            <Link href="/login"><span className="hover:text-slate-400 transition-colors cursor-pointer">Sign in</span></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
