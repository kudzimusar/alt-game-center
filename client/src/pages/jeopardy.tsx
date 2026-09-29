import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Trophy, Loader, CheckCircle2, XCircle } from "lucide-react";
import confetti from "canvas-confetti";

interface Question {
  value: number;
  question: string;
  answer: string;
}

interface Category {
  title: string;
  questions: Question[];
}

interface JeopardyData {
  categories: Category[];
}

export default function Jeopardy() {
  const [grade, setGrade] = useState<string | null>(null);
  const [teamCount, setTeamCount] = useState<number>(2);
  const [customTopic, setCustomTopic] = useState("");
  const [data, setData] = useState<JeopardyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<{catIndex: number, qIndex: number} | null>(null);
  const [answered, setAnswered] = useState<Set<string>>(new Set());
  const [scores, setScores] = useState<number[]>([]);
  const [activeTeam, setActiveTeam] = useState(0);
  const [attemptingTeam, setAttemptingTeam] = useState(0);
  const [teamsTried, setTeamsTried] = useState<Set<number>>(new Set());
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  const fetchJeopardy = async (selectedGrade: string, topic?: string) => {
    setLoading(true);
    try {
      const url = `/api/games/jeopardy/${selectedGrade}${topic ? `?topic=${encodeURIComponent(topic)}` : ''}`;
      const response = await fetch(url);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        throw new Error("Failed to fetch");
      }
    } catch (error) {
      console.error("Failed to fetch Jeopardy:", error);
      // Client-side fallback if both API and server fallback fail
      setData({
        categories: [
          {
            title: "General",
            questions: [
              { value: 100, question: "Common Greeting?", answer: "Hello" },
              { value: 200, question: "Opposite of Hot?", answer: "Cold" },
              { value: 300, question: "Capital of Japan?", answer: "Tokyo" },
              { value: 400, question: "Who is the Prime Minister of Japan?", answer: "Varies" },
              { value: 500, question: "Tallest mountain in Japan?", answer: "Mt. Fuji" }
            ]
          },
          {
            title: "Grammar",
            questions: [
              { value: 100, question: "I ___ a student.", answer: "am" },
              { value: 200, question: "He ___ a dog.", answer: "has" },
              { value: 300, question: "They ___ playing.", answer: "are" },
              { value: 400, question: "Past tense of 'buy'?", answer: "bought" },
              { value: 500, question: "Past participle of 'go'?", answer: "gone" }
            ]
          },
          {
            title: "Vocabulary",
            questions: [
              { value: 100, question: "Red fruit?", answer: "Apple" },
              { value: 200, question: "Color of the sky?", answer: "Blue" },
              { value: 300, question: "King of the jungle?", answer: "Lion" },
              { value: 400, question: "Largest ocean?", answer: "Pacific" },
              { value: 500, question: "Study of plants?", answer: "Botany" }
            ]
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const startGame = (selectedGrade: string) => {
    setGrade(selectedGrade);
    fetchJeopardy(selectedGrade, customTopic);
    setScores(new Array(teamCount).fill(0));
  };

  useEffect(() => {
    // Only fetch on grade change if we don't have data yet
    // This is now handled by startGame
  }, []);
  
  // ... existing fetchJeopardy ...

  const handleCellClick = (catIndex: number, qIndex: number) => {
    const key = `${catIndex}-${qIndex}`;
    if (answered.has(key)) return;
    setIsAnswerRevealed(false);
    setSelectedQuestion({ catIndex, qIndex });
    setAttemptingTeam(activeTeam);
    setTeamsTried(new Set([activeTeam]));
  };

  const handleAnswer = (correct: boolean) => {
    if (!selectedQuestion || !data) return;
    
    const key = `${selectedQuestion.catIndex}-${selectedQuestion.qIndex}`;
    const value = data.categories[selectedQuestion.catIndex].questions[selectedQuestion.qIndex].value;
    
    if (correct) {
      const newScores = [...scores];
      newScores[attemptingTeam] += value;
      setScores(newScores);
      confetti({ particleCount: 100, spread: 70 });
      
      setAnswered(prev => new Set(prev).add(key));
      setSelectedQuestion(null);
      setActiveTeam((activeTeam + 1) % teamCount);
    } else {
      const newTried = new Set(teamsTried);
      newTried.add(attemptingTeam);
      setTeamsTried(newTried);

      if (newTried.size >= teamCount) {
        // All teams failed
        setAnswered(prev => new Set(prev).add(key));
        setSelectedQuestion(null);
        setActiveTeam((activeTeam + 1) % teamCount);
      } else {
        // Pass to next team (cycle through until we find one that hasn't tried)
        let nextTeam = (attemptingTeam + 1) % teamCount;
        while (newTried.has(nextTeam)) {
          nextTeam = (nextTeam + 1) % teamCount;
        }
        setAttemptingTeam(nextTeam);
      }
    }
  };

  if (!grade) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link href="/games">
            <button className="flex items-center gap-2 text-slate-600 mb-8" data-testid="button-back"><ArrowLeft size={20}/> Back</button>
          </Link>
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700">
            <h1 className="text-4xl font-display font-black text-center mb-6">Jeopardy Battle</h1>
            
            <div className="mb-8">
              <label className="block text-sm font-bold text-slate-500 mb-2 text-center uppercase tracking-wider">Number of Teams</label>
              <div className="flex justify-center gap-2">
                {[2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setTeamCount(n)}
                    className={`w-12 h-12 rounded-xl font-black text-lg transition-all ${teamCount === n ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-slate-100 text-slate-400'}`}
                    data-testid={`button-team-count-${n}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-bold text-slate-500 mb-2 text-center uppercase tracking-wider">Custom Topic (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Weather, Sports, Anime..."
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none text-center font-bold"
                data-testid="input-custom-topic"
              />
              <p className="text-[10px] text-slate-400 mt-2 text-center italic">AI will apply grade-specific grammar to this topic</p>
            </div>

            <label className="block text-sm font-bold text-slate-500 mb-2 text-center uppercase tracking-wider">Select Grade</label>
            <div className="space-y-3">
              {["1", "2", "3"].map(g => (
                <button 
                  key={g} 
                  onClick={() => startGame(g)}
                  className="w-full py-4 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white transition-all transform hover:-translate-y-1"
                  data-testid={`button-grade-${g}`}
                >
                  Grade {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader className="animate-spin mb-4" size={48} />
        <p className="font-display font-bold">Generating AI Battle Board...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => setGrade(null)} className="flex items-center gap-2 text-slate-600" data-testid="button-exit"><ArrowLeft size={20}/> Exit</button>
          <div className="flex flex-wrap gap-4 justify-center">
            {scores.map((score, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-2xl border-2 transition-all min-w-[120px] ${activeTeam === idx ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-500/20' : 'border-slate-200 bg-white'}`}
                data-testid={`text-team-${idx}-score`}
              >
                <div className="text-[10px] font-bold text-slate-500 uppercase">Team {idx + 1}</div>
                <div className="text-xl font-display font-black">{score}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {data.categories.map((cat, catIdx) => (
            <div key={catIdx} className="space-y-4">
              <div className="bg-slate-800 text-white p-4 rounded-xl text-center font-display font-bold h-24 flex items-center justify-center uppercase tracking-wider shadow-inner" data-testid={`text-category-${catIdx}`}>
                {cat.title}
              </div>
              {cat.questions.map((q, qIdx) => (
                <button
                  key={qIdx}
                  onClick={() => handleCellClick(catIdx, qIdx)}
                  className={`w-full h-24 rounded-xl text-2xl font-display font-black transition-all transform ${
                    answered.has(`${catIdx}-${qIdx}`)
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                      : 'bg-blue-600 hover:bg-blue-700 text-white hover:-translate-y-1 shadow-lg'
                  }`}
                  data-testid={`button-question-${catIdx}-${qIdx}`}
                >
                  {q.value}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {selectedQuestion && (
        <div className="fixed inset-0 bg-slate-900/95 flex items-center justify-center p-6 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-3xl w-full text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="text-blue-500 font-display font-black text-xl mb-4">
              {data.categories[selectedQuestion.catIndex].title} for {data.categories[selectedQuestion.catIndex].questions[selectedQuestion.qIndex].value}
            </div>
            
            <div className="mb-6 inline-block px-4 py-2 bg-slate-100 rounded-full text-sm font-bold border-2 border-slate-200">
              <span className="text-slate-500 uppercase mr-2">Now Attempting:</span>
              <span className={`text-lg ${attemptingTeam === 0 ? 'text-blue-600' : attemptingTeam === 1 ? 'text-red-600' : attemptingTeam === 2 ? 'text-green-600' : attemptingTeam === 3 ? 'text-purple-600' : 'text-orange-600'}`}>
                Team {attemptingTeam + 1}
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-display font-black mb-8 leading-tight dark:text-white" data-testid="text-question-content">
              {data.categories[selectedQuestion.catIndex].questions[selectedQuestion.qIndex].question}
            </h2>
            
            <div className="mb-8 space-y-4">
              {!isAnswerRevealed ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={() => setIsAnswerRevealed(true)}
                    className="flex items-center justify-center gap-2 p-6 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold transition-all border-2 border-dashed border-slate-300"
                    data-testid="button-reveal-tap"
                  >
                    Tap to Reveal Answer
                  </button>
                  <div className="group relative flex items-center justify-center p-6 bg-slate-100 rounded-2xl font-bold transition-all border-2 border-dashed border-slate-300 cursor-help hidden sm:flex">
                    <span className="group-hover:opacity-0 transition-opacity">Hover to Reveal Answer</span>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 backdrop-blur-sm rounded-2xl text-blue-600">
                      {data.categories[selectedQuestion.catIndex].questions[selectedQuestion.qIndex].answer}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 dark:bg-blue-900/30 p-8 rounded-2xl border-2 border-blue-200 dark:border-blue-800 animate-in fade-in zoom-in" data-testid="text-answer-revealed">
                  <div className="text-xs font-bold text-blue-500 uppercase mb-2">The Answer Is:</div>
                  <div className="text-2xl font-display font-black text-blue-700 dark:text-blue-300">
                    {data.categories[selectedQuestion.catIndex].questions[selectedQuestion.qIndex].answer}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => handleAnswer(true)}
                className="flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold text-xl transition-all hover:scale-105"
                data-testid="button-answer-correct"
              >
                <CheckCircle2 /> Correct
              </button>
              <button 
                onClick={() => handleAnswer(false)}
                className="flex items-center gap-2 px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-xl transition-all hover:scale-105"
                data-testid="button-answer-incorrect"
              >
                <XCircle /> Incorrect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
