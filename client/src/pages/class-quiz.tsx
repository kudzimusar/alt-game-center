import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Clock, Trophy, CheckCircle2, XCircle, Users, Zap, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

// Question bank structured by grade and grammar
const quizData: Record<string, any[]> = {
  "1-can": [
    { id: 1, question: "I ___ swim very well.", options: ["can", "cans", "could", "canning"], answer: 0, explanation: "Use 'can' for ability. No 's' is needed after can.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 2, question: "She ___ speak English.", options: ["can", "can to", "cans", "could to"], answer: 0, explanation: "Can is followed by the base form of the verb without 'to'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 3, question: "___ you play the piano?", options: ["Can", "Do can", "Are can", "Could"], answer: 0, explanation: "Start a question with 'Can' to ask about ability.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 4, question: "Which sentence is CORRECT?", options: ["I can to swim.", "I can swim.", "I can swimming.", "I cans swim."], answer: 1, explanation: "Subject + can + base verb is the correct pattern.", type: "Best Answer", difficulty: "Medium" },
    { id: 5, question: "Find the mistake: 'She cans play guitar.'", options: ["She -> He", "cans -> can", "play -> plays", "guitar -> the guitar"], answer: 1, explanation: "Modal verbs like 'can' do not change for the third person singular.", type: "Error Correction", difficulty: "Medium" }
  ],
  "2-past": [
    { id: 1, question: "What did you ___ yesterday?", options: ["do", "does", "did", "doing"], answer: 0, explanation: "After 'did' in a question, use the base form of the verb.", type: "Fill in the Blank", difficulty: "Medium" },
    { id: 2, question: "I ___ to school yesterday.", options: ["go", "goes", "went", "going"], answer: 2, explanation: "'Went' is the past form of 'go'.", type: "Fill in the Blank", difficulty: "Easy" },
    { id: 3, question: "Find the mistake: 'She don't like apples yesterday.'", options: ["She -> He", "don't -> didn't", "like -> likes", "apples -> apple"], answer: 1, explanation: "Use 'didn't' for past simple negative sentences.", type: "Error Correction", difficulty: "Medium" }
  ],
  "3-perfect": [
    { id: 1, question: "Have you ever ___ to America?", options: ["go", "went", "been", "be"], answer: 2, explanation: "Use 'been' for the experience of visiting a place in Present Perfect.", type: "Fill in the Blank", difficulty: "Medium" },
    { id: 2, question: "I have ___ English for three years.", options: ["study", "studied", "studying", "studies"], answer: 1, explanation: "Present Perfect uses 'have/has' + past participle.", type: "Fill in the Blank", difficulty: "Easy" }
  ]
};

type GameState = "LOBBY" | "QUESTION" | "REVEAL" | "LEADERBOARD" | "FINAL";

export default function ClassQuiz() {
  const [gameState, setGameState] = useState<GameState>("LOBBY");
  const [selectedQuiz, setSelectedQuiz] = useState("1-can");
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [timer, setTimer] = useState(15);
  const [scores, setScores] = useState<Record<string, number>>({
    "Team Dragons": 0,
    "Team Phoenix": 0,
    "Team Tigers": 0,
    "Team Pandas": 0
  });
  const [streak, setStreak] = useState<Record<string, number>>({
    "Team Dragons": 0,
    "Team Phoenix": 0,
    "Team Tigers": 0,
    "Team Pandas": 0
  });
  const [lastAnswers, setLastAnswers] = useState<Record<string, number | null>>({});
  const [isTimerActive, setIsTimerActive] = useState(false);

  const questions = quizData[selectedQuiz] || [];
  const currentQuestion = questions[currentQuestionIdx];

  useEffect(() => {
    let interval: any;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0 && gameState === "QUESTION") {
      handleTimeUp();
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer, gameState]);

  const startQuiz = () => {
    setGameState("QUESTION");
    setTimer(15);
    setIsTimerActive(true);
    setLastAnswers({});
  };

  const handleTimeUp = () => {
    setIsTimerActive(false);
    setGameState("REVEAL");
  };

  const submitAnswer = (team: string, optionIdx: number) => {
    if (gameState !== "QUESTION") return;
    
    const timeTaken = 15 - timer;
    const isCorrect = optionIdx === currentQuestion.answer;
    
    setLastAnswers(prev => ({ ...prev, [team]: optionIdx }));

    if (isCorrect) {
      let points = 1000;
      if (timeTaken <= 5) points += 500;
      else if (timeTaken <= 10) points += 300;
      else if (timeTaken <= 15) points += 100;

      const newStreak = (streak[team] || 0) + 1;
      if (newStreak >= 3) points += 200;
      if (newStreak >= 5) points += 500;
      
      setScores(prev => ({ ...prev, [team]: (prev[team] || 0) + points }));
      setStreak(prev => ({ ...prev, [team]: newStreak }));
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } else {
      setStreak(prev => ({ ...prev, [team]: 0 }));
    }

    const teams = Object.keys(scores);
    const newAnswers = { ...lastAnswers, [team]: optionIdx };
    if (Object.keys(newAnswers).length === teams.length) {
      handleTimeUp();
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setTimer(15);
      setIsTimerActive(true);
      setGameState("QUESTION");
      setLastAnswers({});
    } else {
      setGameState("FINAL");
    }
  };

  const formatPoints = (num: number) => new Intl.NumberFormat().format(num);

  if (gameState === "LOBBY") {
    return (
      <div className="min-h-screen bg-[#46178F] flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-4xl w-full bg-white/10 backdrop-blur-md rounded-[3rem] p-12 shadow-2xl border border-white/20">
          <div className="flex justify-between items-start mb-12">
            <Link href="/games">
              <button className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-bold">
                <ArrowLeft size={20} /> Back
              </button>
            </Link>
            <div className="bg-yellow-400 text-[#46178F] px-6 py-2 rounded-full font-black text-sm tracking-widest uppercase italic">
              New Game
            </div>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-7xl font-display font-black mb-4 uppercase italic tracking-tight">CLASS QUIZ</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">Fast-paced multiple choice battles for JHS English. Ready to compete?</p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-white/40">Select Topic</label>
              {Object.keys(quizData).map(key => (
                <button
                  key={key}
                  onClick={() => setSelectedQuiz(key)}
                  className={`w-full p-6 rounded-2xl text-left font-bold transition-all ${selectedQuiz === key ? "bg-white text-[#46178F] shadow-xl scale-[1.02]" : "bg-white/5 hover:bg-white/10 border border-white/10"}`}
                >
                  <span className="block text-[10px] opacity-60 uppercase mb-1">Grade {key.split('-')[0]}</span>
                  {key.split('-')[1].toUpperCase().replace('_', ' ')}
                </button>
              ))}
            </div>
            <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <Users className="text-yellow-400" />
                <h3 className="font-black uppercase tracking-wider text-sm">Teams Ready</h3>
              </div>
              <div className="space-y-3">
                {Object.keys(scores).map(team => (
                  <div key={team} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                    <span className="font-bold">{team}</span>
                    <div className="w-3 h-3 bg-green-400 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={startQuiz}
            className="w-full py-8 bg-yellow-400 hover:bg-yellow-300 text-[#46178F] rounded-[2rem] font-black text-2xl uppercase tracking-widest shadow-2xl transition-all active:scale-[0.98]"
          >
            Start Battle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex flex-col font-sans overflow-hidden">
      <div className="bg-white px-10 py-6 flex items-center justify-between shadow-sm z-30 border-b border-slate-100">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-[#46178F] rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Zap size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase italic leading-none tracking-tight">CLASS QUIZ</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">
              Question {currentQuestionIdx + 1} of {questions.length} • {currentQuestion.difficulty}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className={`flex flex-col items-center justify-center w-24 h-24 rounded-full border-8 transition-all ${timer <= 5 ? "border-red-500 text-red-500 scale-110" : "border-[#46178F] text-[#46178F]"}`}>
            <span className="text-3xl font-black">{timer}</span>
            <span className="text-[8px] font-bold uppercase">Sec</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-10 flex flex-col gap-10">
        <div className="flex-1 bg-white rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center text-center p-20 relative overflow-hidden group">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-20 max-w-6xl mx-auto tracking-tight leading-[1.1]">
                {currentQuestion.question}
              </h1>

              {gameState === "QUESTION" && (
                <div className="grid grid-cols-2 gap-6 w-full max-w-6xl mx-auto">
                  {currentQuestion.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => submitAnswer("Team Dragons", idx)}
                      className={`relative group/opt p-10 rounded-[2.5rem] text-3xl font-bold flex items-center justify-center transition-all active:scale-[0.98] shadow-lg
                        ${idx === 0 ? "bg-blue-500 hover:bg-blue-400 text-white" : ""}
                        ${idx === 1 ? "bg-green-500 hover:bg-green-400 text-white" : ""}
                        ${idx === 2 ? "bg-yellow-400 hover:bg-yellow-300 text-slate-900" : ""}
                        ${idx === 3 ? "bg-red-500 hover:bg-red-400 text-white" : ""}
                      `}
                    >
                      <div className="absolute top-4 left-6 opacity-30 text-5xl font-black">{["A", "B", "C", "D"][idx]}</div>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {gameState === "REVEAL" && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-4xl mx-auto space-y-8"
                >
                  <div className={`p-12 rounded-[3rem] flex flex-col items-center gap-6 shadow-2xl ${lastAnswers["Team Dragons"] === currentQuestion.answer ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                    {lastAnswers["Team Dragons"] === currentQuestion.answer ? (
                      <>
                        <CheckCircle2 size={80} />
                        <h2 className="text-5xl font-black uppercase italic">Correct!</h2>
                      </>
                    ) : (
                      <>
                        <XCircle size={80} />
                        <h2 className="text-5xl font-black uppercase italic">Time Up!</h2>
                      </>
                    )}
                    <p className="text-2xl font-medium opacity-90 max-w-2xl">
                      Correct Answer: <span className="font-black">{currentQuestion.options[currentQuestion.answer]}</span>
                    </p>
                  </div>

                  <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] text-left relative overflow-hidden">
                    <div className="absolute -top-3 left-10 bg-slate-900 px-5 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Quick Insight</div>
                    <p className="text-2xl leading-relaxed italic">{currentQuestion.explanation}</p>
                  </div>

                  <button 
                    onClick={nextQuestion}
                    className="w-full py-8 bg-[#46178F] text-white rounded-[2rem] font-black text-2xl uppercase tracking-widest hover:bg-[#5b1eb9] transition-all shadow-xl"
                  >
                    Next Question
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {Object.keys(scores).map((team, idx) => (
            <div key={team} className="bg-white p-6 rounded-[2rem] shadow-sm flex items-center justify-between border border-slate-100">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white
                  ${idx === 0 ? "bg-purple-500" : ""}
                  ${idx === 1 ? "bg-orange-500" : ""}
                  ${idx === 2 ? "bg-blue-500" : ""}
                  ${idx === 3 ? "bg-green-500" : ""}
                `}>
                  {idx === 0 ? "🐉" : idx === 1 ? "🔥" : idx === 2 ? "🐯" : "🐼"}
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{team}</h4>
                  <p className="text-xl font-black text-slate-900">{formatPoints(scores[team])}</p>
                </div>
              </div>
              {streak[team] >= 3 && (
                <div className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full flex items-center gap-1 animate-bounce">
                  <Zap size={14} fill="currentColor" />
                  <span className="text-xs font-black">{streak[team]}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {gameState === "FINAL" && (
        <div className="fixed inset-0 z-50 bg-[#46178F] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl w-full bg-white rounded-[3rem] p-16 shadow-2xl text-center"
          >
            <Crown size={100} className="text-yellow-400 mx-auto mb-8 animate-bounce" />
            <h1 className="text-6xl font-black text-slate-900 mb-4 uppercase italic">VICTORY!</h1>
            <p className="text-xl text-slate-500 mb-12">The battle has ended. Here is the final standing.</p>

            <div className="space-y-4 mb-12">
              {Object.entries(scores)
                .sort(([, a], [, b]) => b - a)
                .map(([team, score], idx) => (
                  <div key={team} className={`flex items-center justify-between p-6 rounded-2xl ${idx === 0 ? "bg-yellow-50 border-2 border-yellow-200" : "bg-slate-50"}`}>
                    <div className="flex items-center gap-6">
                      <span className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${idx === 0 ? "bg-yellow-400 text-white" : "bg-slate-200 text-slate-500"}`}>
                        {idx + 1}
                      </span>
                      <span className="text-2xl font-black text-slate-900">{team}</span>
                    </div>
                    <span className="text-3xl font-display font-black text-[#46178F]">{formatPoints(score)}</span>
                  </div>
                ))}
            </div>

            <button
              onClick={() => {
                setGameState("LOBBY");
                setCurrentQuestionIdx(0);
                setScores({
                  "Team Dragons": 0,
                  "Team Phoenix": 0,
                  "Team Tigers": 0,
                  "Team Pandas": 0
                });
                setStreak({});
              }}
              className="w-full py-8 bg-[#46178F] text-white rounded-[2rem] font-black text-2xl uppercase tracking-widest shadow-xl"
            >
              Play Again
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
