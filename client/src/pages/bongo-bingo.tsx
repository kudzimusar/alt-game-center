import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { ArrowLeft, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { bongoBingoData, BINGO_WORDS, type BongoQuestion, type BongoWeek, type BongoGrade } from "@/lib/bongo/bongo-data";

type View = "GRADE" | "WEEK" | "GAME";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const BINGO_LINES_5 = [
  [0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24],
  [0,5,10,15,20],[1,6,11,16,21],[2,7,12,17,22],[3,8,13,18,23],[4,9,14,19,24],
  [0,6,12,18,24],[4,8,12,16,20],
];

function makeBingoCard() {
  return shuffle([...BINGO_WORDS]).slice(0, 25);
}

export default function BongoBingo() {
  const [view, setView] = useState<View>("GRADE");
  const [grade, setGrade] = useState<BongoGrade | null>(null);
  const [week, setWeek] = useState<BongoWeek | null>(null);
  const [questions, setQuestions] = useState<BongoQuestion[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [card, setCard] = useState<string[]>([]);
  const [marked, setMarked] = useState<boolean[]>(Array(25).fill(false));
  const [scores, setScores] = useState({ monkeys: 0, elephants: 0 });
  const [hasBingo, setHasBingo] = useState(false);

  const q = questions[qIdx];

  function startGame(g: BongoGrade, w: BongoWeek) {
    setGrade(g);
    setWeek(w);
    setQuestions(shuffle([...w.questions]));
    setQIdx(0);
    setRevealed([]);
    setShowAnswer(false);
    setCard(makeBingoCard());
    setMarked(Array(25).fill(false));
    setScores({ monkeys: 0, elephants: 0 });
    setHasBingo(false);
    setView("GAME");
  }

  function revealLetter() {
    if (!q) return;
    const answer = q.correct.toLowerCase();
    const positions = answer.split("").map((ch, i) => ch !== " " && !revealed.includes(i) ? i : -1).filter(i => i !== -1);
    if (positions.length === 0) return;
    const pick = positions[Math.floor(Math.random() * positions.length)];
    setRevealed(prev => [...prev, pick]);
  }

  function handleShowAnswer() {
    if (!q) return;
    const all = q.correct.toLowerCase().split("").map((_, i) => i);
    setRevealed(all);
    setShowAnswer(true);
  }

  function nextQuestion() {
    const next = qIdx + 1 < questions.length ? qIdx + 1 : 0;
    setQIdx(next);
    setRevealed([]);
    setShowAnswer(false);
  }

  function toggleCell(i: number) {
    const newMarked = [...marked];
    newMarked[i] = !newMarked[i];
    setMarked(newMarked);
    const bingo = BINGO_LINES_5.some(line => line.every(idx => newMarked[idx]));
    if (bingo && !hasBingo) {
      setHasBingo(true);
      confetti({ particleCount: 300, spread: 160, origin: { y: 0.4 } });
      setTimeout(() => confetti({ particleCount: 200, spread: 120, origin: { x: 0.1, y: 0.5 } }), 400);
      setTimeout(() => confetti({ particleCount: 200, spread: 120, origin: { x: 0.9, y: 0.5 } }), 800);
    }
    if (!bingo) setHasBingo(false);
  }

  function adjustScore(team: "monkeys" | "elephants", delta: number) {
    setScores(prev => ({ ...prev, [team]: Math.max(0, prev[team] + delta) }));
  }

  function resetCard() {
    setCard(makeBingoCard());
    setMarked(Array(25).fill(false));
    setHasBingo(false);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (view !== "GAME") return;
      if (e.key === "a") handleShowAnswer();
      if (e.key === "l") revealLetter();
      if (e.key === "n") nextQuestion();
      if (e.key === "s") adjustScore("monkeys", 10);
      if (e.key === "e") adjustScore("elephants", 10);
      if (e.key === "x") adjustScore("monkeys", -5);
      if (e.key === "z") adjustScore("elephants", -5);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, qIdx, revealed, showAnswer]);

  const renderBlankSentence = (sentence: string) => {
    const parts = sentence.split("___");
    return (
      <span>
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <span style={{ display: "inline-block", background: "#FFE69A", padding: "0.1rem 1.2rem", borderRadius: "50px", color: "#C4450E", fontWeight: 900, textDecoration: "underline", textDecorationThickness: "6px", minWidth: "180px", textAlign: "center" }}>
                ______
              </span>
            )}
          </span>
        ))}
      </span>
    );
  };

  const renderLetterBoxes = () => {
    if (!q || (revealed.length === 0 && !showAnswer)) return null;
    const answer = q.correct.toLowerCase();
    return (
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px", padding: "1rem" }}>
        {answer.split("").map((ch, i) => {
          if (ch === " ") return <div key={i} style={{ width: "30px" }} />;
          const isRevealed = revealed.includes(i);
          return (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                background: isRevealed ? "#FFD966" : "#EDD9A3",
                width: "100px", height: "100px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "3.5rem", fontWeight: 900, color: "#8B3C1C",
                borderRadius: "28px", boxShadow: "0 10px 0 #B97F10",
                fontFamily: "monospace",
              }}
            >
              {isRevealed ? ch.toUpperCase() : "?"}
            </motion.div>
          );
        })}
      </div>
    );
  };

  // ─── GRADE SELECT ─────────────────────────────────────────────────────────
  if (view === "GRADE") {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(145deg, #1a6b3c 0%, #0e4523 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>
        <div style={{ maxWidth: "1400px", width: "100%", background: "#FFF8E7", borderRadius: "60px", boxShadow: "0 40px 60px rgba(0,0,0,0.5)", border: "8px solid #F5B042", overflow: "hidden" }}>

          <div style={{ background: "#D4451E", padding: "1.6rem 2rem", textAlign: "center", borderBottom: "10px solid #FFC857" }}>
            <div style={{ position: "absolute", top: "28px", left: "28px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Link href="/dashboard">
                <button style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50px", padding: "0.4rem 1rem", color: "white", fontSize: "0.9rem", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Home size={16} /> Dashboard
                </button>
              </Link>
              <Link href="/games">
                <button style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50px", padding: "0.4rem 1rem", color: "white", fontSize: "0.9rem", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                  <ArrowLeft size={16} /> All Games
                </button>
              </Link>
            </div>
            <h1 style={{ fontSize: "4rem", fontWeight: 900, color: "#FFF5C4", textShadow: "5px 5px 0 #8B2C0D", letterSpacing: "3px", margin: 0, fontFamily: "'Fredoka', cursive" }}>
              🥁 BONGO BINGO 🎵
            </h1>
            <div style={{ fontSize: "1.8rem", background: "#FFE3A4", display: "inline-block", padding: "0.4rem 2rem", borderRadius: "60px", marginTop: "10px", color: "#B33A12", fontWeight: "bold" }}>
              Team Fill-in-the-Blank + BINGO Board!
            </div>
          </div>

          <div style={{ padding: "2.5rem" }}>
            <p style={{ textAlign: "center", fontSize: "1.8rem", color: "#5A3E20", fontWeight: "bold", marginBottom: "2rem" }}>
              Choose your grade to start!
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
              {bongoBingoData.map(g => (
                <motion.div
                  key={g.grade}
                  whileHover={{ y: -10, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setGrade(g); setView("WEEK"); }}
                  style={{ background: "linear-gradient(135deg, #FFF7E8, #FFEFD5)", borderRadius: "50px", padding: "2.5rem", textAlign: "center", cursor: "pointer", border: "5px solid #FFD58C", boxShadow: "0 15px 25px rgba(0,0,0,0.15)" }}
                >
                  <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>{g.emoji}</div>
                  <div style={{ fontSize: "3rem", fontWeight: 900, color: "#D4451E", marginBottom: "0.5rem", fontFamily: "'Fredoka', cursive" }}>{g.label}</div>
                  <div style={{ fontSize: "1.6rem", color: "#5A4A2E", fontWeight: "bold", marginBottom: "1rem" }}>{g.description}</div>
                  <div style={{ fontSize: "1.2rem", background: "#2F6B47", color: "#FFEFB9", padding: "0.5rem 1.2rem", borderRadius: "40px", display: "inline-block", fontWeight: "bold" }}>
                    📖 {g.textbook}
                  </div>
                  <div style={{ marginTop: "1rem", fontSize: "1.1rem", color: "#7A5C30" }}>
                    {g.weeks.length} week{g.weeks.length > 1 ? "s" : ""} available
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div style={{ background: "#D4451E", padding: "1rem", textAlign: "center", fontSize: "1.4rem", color: "#FFF1B5", fontWeight: "bold" }}>
            🎲 Pick a grade → Pick a week → Answer questions → Mark BINGO squares → First BINGO wins!
          </div>
        </div>
      </div>
    );
  }

  // ─── WEEK SELECT ──────────────────────────────────────────────────────────
  if (view === "WEEK" && grade) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(145deg, #1a6b3c 0%, #0e4523 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>
        <div style={{ maxWidth: "1000px", width: "100%", background: "#FFF8E7", borderRadius: "60px", boxShadow: "0 40px 60px rgba(0,0,0,0.5)", border: "8px solid #F5B042", overflow: "hidden" }}>

          <div style={{ background: "#D4451E", padding: "1.6rem 2rem", textAlign: "center", borderBottom: "10px solid #FFC857", position: "relative" }}>
            <button onClick={() => setView("GRADE")} style={{ position: "absolute", top: "28px", left: "28px", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50px", padding: "0.5rem 1.5rem", color: "white", fontSize: "1.2rem", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
              <ArrowLeft size={18} /> Grades
            </button>
            <h1 style={{ fontSize: "3rem", fontWeight: 900, color: "#FFF5C4", textShadow: "4px 4px 0 #8B2C0D", margin: 0, fontFamily: "'Fredoka', cursive" }}>
              {grade.emoji} {grade.label} — Choose a Week
            </h1>
            <div style={{ fontSize: "1.5rem", background: "#FFE3A4", display: "inline-block", padding: "0.3rem 1.5rem", borderRadius: "50px", marginTop: "8px", color: "#B33A12", fontWeight: "bold" }}>
              📖 {grade.textbook}
            </div>
          </div>

          <div style={{ padding: "2rem" }}>
            <div style={{ display: "grid", gap: "1.2rem" }}>
              {grade.weeks.map(w => (
                <motion.div
                  key={w.week}
                  whileHover={{ scale: 1.02, x: 8 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startGame(grade, w)}
                  style={{ background: "linear-gradient(135deg, #FFF7E8, #FFEFD5)", borderRadius: "40px", padding: "1.5rem 2rem", cursor: "pointer", border: "4px solid #FFD58C", boxShadow: "0 8px 15px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "2rem" }}
                >
                  <div style={{ background: "#D4451E", color: "white", borderRadius: "30px", width: "80px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", fontWeight: 900, flexShrink: 0, fontFamily: "'Fredoka', cursive" }}>
                    {w.week}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "2rem", fontWeight: 900, color: "#3D2A1A", marginBottom: "0.3rem" }}>{w.title}</div>
                    <div style={{ fontSize: "1.3rem", color: "#2F6B47", fontWeight: "bold", background: "#E8F5EE", display: "inline-block", padding: "0.2rem 1rem", borderRadius: "30px" }}>
                      🎯 {w.grammarFocus}
                    </div>
                    <div style={{ fontSize: "1.1rem", color: "#7A5C30", marginTop: "0.3rem" }}>
                      {w.questions.length} questions
                    </div>
                  </div>
                  <div style={{ fontSize: "2rem", color: "#F4A261" }}>▶</div>
                </motion.div>
              ))}
            </div>
          </div>

          <div style={{ background: "#D4451E", padding: "1rem", textAlign: "center", fontSize: "1.3rem", color: "#FFF1B5", fontWeight: "bold" }}>
            🎲 Click a week to start the game!
          </div>
        </div>
      </div>
    );
  }

  // ─── GAME SCREEN ──────────────────────────────────────────────────────────
  if (view === "GAME" && grade && week && q) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(145deg, #1a6b3c 0%, #0e4523 100%)", display: "flex", justifyContent: "center", padding: "16px", fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>
        <div style={{ maxWidth: "1600px", width: "100%", background: "#FFF8E7", borderRadius: "60px", boxShadow: "0 40px 60px rgba(0,0,0,0.5)", border: "8px solid #F5B042", overflow: "hidden", display: "flex", flexDirection: "column" }}>

          {/* HEADER */}
          <div style={{ background: "#D4451E", padding: "1rem 2rem", textAlign: "center", borderBottom: "8px solid #FFC857", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ fontSize: "2.5rem", fontWeight: 900, color: "#FFF5C4", fontFamily: "'Fredoka', cursive" }}>
                🥁 BONGO BINGO
              </span>
              <span style={{ background: "#FFE3A4", color: "#B33A12", padding: "0.3rem 1.2rem", borderRadius: "50px", fontSize: "1.4rem", fontWeight: "bold" }}>
                {grade.emoji} {grade.label} · Week {week.week}
              </span>
            </div>
            <div style={{ fontSize: "1.5rem", color: "#FFE3A4", fontWeight: "bold" }}>
              Q {qIdx + 1} / {questions.length}
            </div>
            <button onClick={() => setView("WEEK")} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50px", padding: "0.5rem 1.5rem", color: "white", fontSize: "1.2rem", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
              <Home size={16} /> Weeks
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0", flex: 1 }}>
            <div style={{ padding: "1.2rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>

              {/* GRAMMAR BADGE */}
              <div style={{ display: "inline-flex", alignItems: "center" }}>
                <span style={{ background: "#2F6B47", color: "#FFEFB9", padding: "0.6rem 1.8rem", borderRadius: "50px", fontSize: "1.8rem", fontWeight: "bold" }}>
                  🎯 {q.grammar}
                </span>
              </div>

              {/* QUESTION */}
              <div style={{ background: "#FFF3DF", borderRadius: "50px", padding: "1.5rem 2rem", border: "5px solid #FFD58C", boxShadow: "0 10px 20px rgba(0,0,0,0.08)", borderLeft: "18px solid #FF914D" }}>
                <div style={{ fontSize: "clamp(2.5rem, 5vw, 5rem)", fontWeight: 800, lineHeight: 1.4, color: "#3D2A1A", wordBreak: "break-word" }}>
                  {renderBlankSentence(q.sentence)}
                </div>
              </div>

              {/* LETTER HINT BOXES */}
              <AnimatePresence>
                {(revealed.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    style={{ background: "#FFEBC4", borderRadius: "50px", padding: "1rem" }}
                  >
                    {renderLetterBoxes()}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ANSWER REVEAL */}
              <AnimatePresence>
                {showAnswer && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ background: "#2C5F2D", borderRadius: "50px", padding: "1.2rem", textAlign: "center" }}
                  >
                    <div style={{ fontSize: "4.5rem", fontWeight: 900, color: "#FFE484", background: "#1E3A1E", display: "inline-block", padding: "0.6rem 3rem", borderRadius: "60px", letterSpacing: "5px" }}>
                      {q.correct.toUpperCase()}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ACTION BUTTONS */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" }}>
                {[
                  { label: "🔤 REVEAL LETTER", key: "L", fn: revealLetter, bg: "#F4A261", shadow: "#A05E15", color: "#2D2B1F" },
                  { label: "⭐ SHOW ANSWER",   key: "A", fn: handleShowAnswer, bg: "#3CB371", shadow: "#236B43", color: "white" },
                  { label: "🎯 NEXT QUESTION",  key: "N", fn: nextQuestion, bg: "#5A6B8A", shadow: "#2F3E5A", color: "white" },
                ].map(btn => (
                  <button
                    key={btn.key}
                    onClick={btn.fn}
                    style={{ background: btn.bg, border: "none", fontSize: "1.8rem", fontWeight: "bold", padding: "1rem 2rem", borderRadius: "60px", cursor: "pointer", color: btn.color, fontFamily: "inherit", boxShadow: `0 10px 0 ${btn.shadow}`, display: "flex", alignItems: "center", gap: "10px", transition: "transform 0.05s" }}
                    onMouseDown={e => (e.currentTarget.style.transform = "translateY(5px)")}
                    onMouseUp={e => (e.currentTarget.style.transform = "")}
                  >
                    {btn.label} <span style={{ fontSize: "1rem", opacity: 0.6 }}>({btn.key})</span>
                  </button>
                ))}
              </div>

              {/* TEAM SCORES */}
              <div style={{ display: "flex", gap: "20px", justifyContent: "center", marginTop: "0.5rem" }}>
                {[
                  { team: "monkeys" as const,   label: "🐵 MONKEYS",   color: "#E67E22" },
                  { team: "elephants" as const, label: "🐘 ELEPHANTS", color: "#8E44AD" },
                ].map(t => (
                  <div key={t.team} style={{ background: "#FFEAC5", borderRadius: "40px", padding: "1rem 1.5rem", textAlign: "center", flex: 1, boxShadow: "0 10px 15px rgba(0,0,0,0.15)" }}>
                    <div style={{ fontSize: "2rem", fontWeight: 900, background: "#FFB347", padding: "0.3rem 1.5rem", borderRadius: "40px", display: "inline-block", color: "#5A3A00" }}>{t.label}</div>
                    <div style={{ fontSize: "5rem", fontWeight: 900, background: "#2C3E2B", color: "#FFE484", display: "inline-block", padding: "0.1rem 2rem", borderRadius: "50px", margin: "10px 0", fontFamily: "monospace" }}>
                      {scores[t.team]}
                    </div>
                    <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                      {[{ label: "+10 🎉", delta: 10, bg: "#3CB371" }, { label: "-5 😅", delta: -5, bg: "#E74C3C" }].map(btn => (
                        <button key={btn.label} onClick={() => adjustScore(t.team, btn.delta)} style={{ background: btn.bg, fontSize: "1.5rem", fontWeight: "bold", padding: "0.5rem 1.3rem", borderRadius: "40px", border: "none", cursor: "pointer", color: "white", fontFamily: "inherit" }}>
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BINGO BOARD - right side */}
            <div style={{ width: "420px", background: "#EFE0C7", borderLeft: "6px solid #D4C4A8", padding: "1rem", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem", flexWrap: "wrap", gap: "8px" }}>
                <span style={{ background: "#D4451E", color: "white", fontSize: "1.5rem", fontWeight: 900, padding: "0.4rem 1.2rem", borderRadius: "40px", fontFamily: "'Fredoka', cursive" }}>
                  🐵 BONGO BINGO BOARD
                </span>
              </div>
              <p style={{ textAlign: "center", fontSize: "1rem", color: "#6B4F2E", fontWeight: "bold", marginBottom: "0.5rem" }}>
                Click square when team answers correctly!
              </p>

              {hasBingo && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ textAlign: "center", fontSize: "2rem", fontWeight: 900, background: "#D4451E", color: "#FFE484", borderRadius: "30px", padding: "0.5rem", marginBottom: "0.5rem" }}>
                  🎉🎉 BONGO BINGO! 🎊
                </motion.div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px", flex: 1 }}>
                {card.map((word, i) => {
                  const parts = word.split(" ");
                  const emoji = parts[0];
                  const text = parts.slice(1).join(" ");
                  return (
                    <motion.div
                      key={i}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleCell(i)}
                      style={{
                        background: marked[i] ? "#6FBF4C" : "#FFFAF0",
                        border: marked[i] ? "4px solid #FFD966" : "4px solid #F5B042",
                        borderRadius: "20px",
                        padding: "0.4rem 0.2rem",
                        textAlign: "center",
                        fontSize: "0.85rem",
                        fontWeight: "bold",
                        color: marked[i] ? "white" : "#4A2E1A",
                        cursor: "pointer",
                        minHeight: "70px",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        boxShadow: marked[i] ? "inset 0 0 0 3px #FFF0B5" : "0 5px 0 #C29A4A",
                        textDecoration: marked[i] ? "line-through" : "none",
                        transition: "background 0.15s",
                      }}
                    >
                      <div style={{ fontSize: "1.4rem" }}>{emoji}</div>
                      <div style={{ fontSize: "0.7rem", lineHeight: 1.2 }}>{text}</div>
                    </motion.div>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "0.8rem", justifyContent: "center" }}>
                <button onClick={resetCard} style={{ background: "#FF914D", fontSize: "1.1rem", padding: "0.5rem 1.2rem", borderRadius: "40px", border: "none", fontWeight: "bold", cursor: "pointer", fontFamily: "inherit" }}>
                  🔄 New Card
                </button>
              </div>

              <div style={{ textAlign: "center", marginTop: "0.5rem", fontSize: "0.9rem", color: "#7A5C30", fontWeight: "bold" }}>
                <p>⌨️ Keys: L=Letter A=Answer N=Next</p>
                <p>S/E=+10pts  X/Z=-5pts</p>
              </div>
            </div>
          </div>

          <div style={{ background: "#D4451E", padding: "0.8rem", textAlign: "center", fontSize: "1.3rem", color: "#FFF1B5", fontWeight: "bold", borderTop: "6px solid #FFC857" }}>
            🎲 Teacher reads the sentence → Teams discuss → Say the answer out loud → Click a BINGO square when correct!
          </div>
        </div>
      </div>
    );
  }

  return null;
}
