import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Play, RotateCcw, CheckCircle2, XCircle, Trophy, Loader, Home } from "lucide-react";
import confetti from "canvas-confetti";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export default function QuizShow() {
  const [grade, setGrade] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<"lobby" | "playing" | "finished">("lobby");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const fetchQuiz = async (selectedGrade: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/games/quiz-show/${selectedGrade}`);
      if (!response.ok) {
        throw new Error(`Quiz API returned ${response.status}`);
      }
      const data = await response.json();
      setQuestions(data);
      setGameState("playing");
    } catch (error) {
      console.error("Failed to fetch quiz:", error);
      // Fallback
      setQuestions([
        {
          question: "I ___ to school every day.",
          options: ["go", "goes", "going", "went"],
          answer: "go",
          explanation: "Use the base form of the verb for 'I' in the present tense."
        }
      ]);
      setGameState("playing");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    if (option === questions[currentIndex].answer) {
      setScore(s => s + 1);
      confetti({ particleCount: 50, spread: 60 });
    }
  };

  const nextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setGameState("finished");
    }
  };

  const resetGame = () => {
    setGrade(null);
    setGameState("lobby");
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  if (gameState === "lobby") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard"><button className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors"><Home size={18}/> Dashboard</button></Link>
            <span className="text-slate-300">·</span>
            <Link href="/games"><button className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors"><ArrowLeft size={18}/> All Games</button></Link>
          </div>
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-indigo-100 rounded-2xl mb-4">
              <Play className="text-indigo-600" size={32} />
            </div>
            <h1 className="text-4xl font-display font-black text-slate-900">Quiz Show</h1>
            <p className="text-slate-500 mt-2 font-medium">Bilingual grammar challenge!</p>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center">Select Grade</p>
            {["1", "2", "3"].map((g) => (
              <button
                key={g}
                onClick={() => {
                  setGrade(g);
                  fetchQuiz(g);
                }}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg transition-all transform hover:-translate-y-1 shadow-lg"
                data-testid={`button-grade-${g}`}
              >
                Grade {g}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader className="animate-spin text-indigo-600 mb-4" size={48} />
        <p className="font-display font-bold text-xl text-slate-700">Preparing the Show...</p>
      </div>
    );
  }

  if (gameState === "finished") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl text-center">
          <Trophy className="mx-auto text-yellow-500 mb-6" size={64} />
          <h2 className="text-3xl font-display font-black mb-2">Show Complete!</h2>
          <div className="text-6xl font-display font-black text-indigo-600 mb-8">
            {score} / {questions.length}
          </div>
          <button
            onClick={resetGame}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} /> Play Again
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button onClick={resetGame} className="flex items-center gap-2 text-slate-500 font-bold">
            <ArrowLeft size={20} /> Exit
          </button>
          <div className="bg-white px-6 py-2 rounded-full border-2 border-slate-200 font-display font-bold">
            Question {currentIndex + 1} of {questions.length}
          </div>
          <div className="bg-indigo-600 text-white px-6 py-2 rounded-full font-display font-bold shadow-lg">
            Score: {score}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-slate-100 mb-8 min-h-[400px] flex flex-col">
          <h2 className="text-2xl md:text-4xl font-display font-black text-slate-900 mb-12 text-center leading-tight">
            {currentQ.question}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
            {currentQ.options.map((option) => (
              <button
                key={option}
                onClick={() => handleOptionClick(option)}
                disabled={isAnswered}
                className={`p-6 rounded-2xl text-xl font-bold border-2 transition-all transform ${
                  isAnswered
                    ? option === currentQ.answer
                      ? "bg-green-500 border-green-600 text-white"
                      : option === selectedOption
                      ? "bg-red-500 border-red-600 text-white"
                      : "bg-slate-50 border-slate-200 text-slate-300"
                    : "bg-white border-slate-200 text-slate-700 hover:border-indigo-500 hover:bg-indigo-50 shadow-sm hover:shadow-md"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {isAnswered && (
          <div className="bg-indigo-50 border-2 border-indigo-100 p-6 rounded-3xl animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-start gap-4">
              {selectedOption === currentQ.answer ? (
                <CheckCircle2 className="text-green-500 shrink-0" size={32} />
              ) : (
                <XCircle className="text-red-500 shrink-0" size={32} />
              )}
              <div>
                <h4 className="font-display font-black text-indigo-900 text-xl mb-1">
                  {selectedOption === currentQ.answer ? "Excellent!" : "Not quite!"}
                </h4>
                <p className="text-indigo-700 font-medium leading-relaxed">
                  {currentQ.explanation}
                </p>
              </div>
            </div>
            <button
              onClick={nextQuestion}
              className="mt-6 w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg"
            >
              Next Question →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
