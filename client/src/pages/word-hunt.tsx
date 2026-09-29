import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  RotateCcw,
  Zap,
  Home,
  CheckCircle,
  Loader,
  HelpCircle,
} from "lucide-react";
import { wordHuntData } from "../lib/mockData";

interface WordPosition {
  word: string;
  row: number;
  col: number;
  direction: "H" | "V" | "D";
}

export default function WordHunt() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedPuzzle, setSelectedPuzzle] = useState<any | null>(null);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const [showHints, setShowHints] = useState(false);

  const topics = wordHuntData.topics;

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);
    setSelectedPuzzle(null);
    setFoundWords(new Set());
    setScore(0);
    setMessage("");
  };

  const handlePuzzleSelect = (puzzle: any) => {
    setSelectedPuzzle(puzzle);
    setSelectedCells(new Set());
    setFoundWords(new Set());
    setScore(0);
    setMessage("");
    setShowHints(false);
  };

  const getCellKey = (row: number, col: number) => `${row}-${col}`;

  const handleCellClick = (row: number, col: number) => {
    if (!selectedPuzzle) return;

    const key = getCellKey(row, col);
    const newSelected = new Set(selectedCells);

    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }

    setSelectedCells(newSelected);
    checkWord(newSelected);
  };

  const checkWord = (selected: Set<string>) => {
    if (!selectedPuzzle || selected.size === 0) return;

    // Get selected positions
    const selectedPositions = Array.from(selected).map((key) => {
      const [r, c] = key.split("-").map(Number);
      return { row: r, col: c };
    });

    // Check each word
    for (const word of selectedPuzzle.words) {
      if (foundWords.has(word)) continue;

      // Find word in grid
      const wordPositions = findWordInGrid(word, selectedPuzzle.grid);

      if (wordPositions) {
        // Check if selected cells match word positions
        const wordKeys = wordPositions
          .map((p) => getCellKey(p.row, p.col))
          .sort()
          .join(",");
        const selectedKeys = Array.from(selected).sort().join(",");

        if (wordKeys === selectedKeys) {
          const newFound = new Set(foundWords);
          newFound.add(word);
          setFoundWords(newFound);
          setScore((s) => s + word.length * 10);
          setMessage(`✨ Found "${word}"! +${word.length * 10} points`);
          setSelectedCells(new Set());

          setTimeout(() => setMessage(""), 2000);
          return;
        }
      }
    }
  };

  const findWordInGrid = (word: string, grid: string[]) => {
    const rows = grid.length;
    const cols = grid[0].split(" ").length;

    // Check horizontal
    for (let r = 0; r < rows; r++) {
      const row = grid[r].split(" ").join("");
      const index = row.indexOf(word);
      if (index !== -1) {
        return Array.from({ length: word.length }, (_, i) => ({
          row: r,
          col: index + i,
        }));
      }
    }

    // Check vertical
    for (let c = 0; c < cols; c++) {
      let colStr = "";
      for (let r = 0; r < rows; r++) {
        const letters = grid[r].split(" ");
        colStr += letters[c] || "";
      }
      const index = colStr.indexOf(word);
      if (index !== -1) {
        return Array.from({ length: word.length }, (_, i) => ({
          row: index + i,
          col: c,
        }));
      }
    }

    return null;
  };

  const handleReset = () => {
    setSelectedCells(new Set());
    setMessage("");
  };

  const goBack = () => {
    if (selectedPuzzle) {
      setSelectedPuzzle(null);
    } else if (selectedTopic) {
      setSelectedTopic(null);
    }
  };

  // Topic Selection Screen
  if (!selectedTopic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard"><button className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold transition-colors"><Home size={18}/> Dashboard</button></Link>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <Link href="/games"><button className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold transition-colors"><ArrowLeft size={18}/> All Games</button></Link>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-white/20 p-8 mb-6">
            <h1 className="text-4xl font-display font-black mb-2 text-center">
              🔍 Word Hunt
            </h1>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-8">
              Choose a topic to start finding words!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicSelect(topic.id)}
                  className={`${topic.color} hover:opacity-90 text-white p-6 rounded-2xl font-bold text-lg transition-all transform hover:-translate-y-1 hover:shadow-xl`}
                >
                  <div className="text-2xl mb-2">{topic.label}</div>
                  <div className="text-sm opacity-90">{topic.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Puzzle Selection Screen
  const currentTopic = topics.find((t) => t.id === selectedTopic);
  const puzzles =
    wordHuntData.puzzles[selectedTopic as keyof typeof wordHuntData.puzzles] ||
    [];

  if (!selectedPuzzle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8"
          >
            <ArrowLeft size={20} />
            Back to Topics
          </button>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
            <h1 className="text-3xl font-display font-black mb-2 text-center">
              {currentTopic?.label}
            </h1>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-8">
              Select a puzzle difficulty
            </p>

            <div className="space-y-4">
              {puzzles.map((puzzle: any, index: number) => (
                <button
                  key={puzzle.id}
                  onClick={() => handlePuzzleSelect(puzzle)}
                  className="w-full p-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl font-bold text-left transition-all transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl mb-1">{puzzle.title}</div>
                      <div className="text-sm opacity-90">
                        Grade {puzzle.grade} • {puzzle.words.length} words
                      </div>
                    </div>
                    <div className="text-4xl">→</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game Screen
  const progress = (foundWords.size / selectedPuzzle.words.length) * 100;
  const gridArray = selectedPuzzle.grid.map((row: string) => row.split(" "));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft size={20} />
          Back to Puzzles
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Game Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-white/20 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-display font-black">
                    {selectedPuzzle.title}
                  </h1>
                  <p className="text-lg text-slate-600 dark:text-slate-400">
                    Grade {selectedPuzzle.grade}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Score
                  </div>
                  <div className="text-4xl font-display font-black text-blue-600">
                    {score}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Words Found: {foundWords.size}/{selectedPuzzle.words.length}
                  </span>
                  <span className="text-sm font-semibold text-blue-600">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Word grid */}
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto mb-4">
                <div
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${gridArray[0].length}, minmax(0, 1fr))`,
                  }}
                >
                  {gridArray.map((row: string[], r: number) =>
                    row.map((letter: string, c: number) => {
                      const key = getCellKey(r, c);
                      const isSelected = selectedCells.has(key);

                      // Check if this cell is part of any found word
                      let isInFoundWord = false;
                      for (const word of foundWords) {
                        const positions = findWordInGrid(
                          word,
                          selectedPuzzle.grid,
                        );
                        if (
                          positions &&
                          positions.some((p) => p.row === r && p.col === c)
                        ) {
                          isInFoundWord = true;
                          break;
                        }
                      }

                      return (
                        <button
                          key={key}
                          onClick={() => handleCellClick(r, c)}
                          className={`aspect-square flex items-center justify-center text-lg md:text-xl font-bold rounded-lg transition-all transform hover:scale-105 ${
                            isInFoundWord
                              ? "bg-green-400 dark:bg-green-600 text-white"
                              : isSelected
                                ? "bg-blue-500 dark:bg-blue-600 text-white scale-105"
                                : "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
                          }`}
                        >
                          {letter}
                        </button>
                      );
                    }),
                  )}
                </div>
              </div>

              {/* Message */}
              {message && (
                <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-xl font-bold text-center animate-bounce-in">
                  {message}
                </div>
              )}

              {/* Controls */}
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-slate-100 hover:bg-slate-400 dark:hover:bg-slate-500 transition-all"
                >
                  <RotateCcw size={18} className="inline mr-2" />
                  Clear
                </button>
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold bg-yellow-400 dark:bg-yellow-600 text-slate-900 dark:text-slate-100 hover:bg-yellow-500 dark:hover:bg-yellow-700 transition-all"
                >
                  <HelpCircle size={18} className="inline mr-2" />
                  {showHints ? "Hide" : "Show"} Hints
                </button>
                <button
                  onClick={() => {
                    setSelectedPuzzle(null);
                    setSelectedTopic(null);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  <Zap size={18} className="inline mr-2" />
                  New Topic
                </button>
              </div>
            </div>
          </div>

          {/* Word List Sidebar */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-white/20 p-6 h-fit">
            <h3 className="text-xl font-display font-black mb-4">
              Find These Words
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {selectedPuzzle.words.map((word: string, index: number) => (
                <div
                  key={word}
                  className={`p-3 rounded-xl transition-all ${
                    foundWords.has(word)
                      ? "bg-green-100 dark:bg-green-900/30 border-2 border-green-400"
                      : "bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {foundWords.has(word) && (
                      <CheckCircle
                        size={20}
                        className="text-green-600 dark:text-green-400 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <div
                        className={`font-bold text-lg ${
                          foundWords.has(word)
                            ? "text-green-700 dark:text-green-400 line-through"
                            : "text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {word}
                      </div>
                      {showHints && selectedPuzzle.hints && (
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          💡 {selectedPuzzle.hints[index]}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {foundWords.size === selectedPuzzle.words.length && (
              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-xl border-2 border-yellow-400 dark:border-yellow-600 text-center animate-bounce-in">
                <p className="text-2xl font-black text-yellow-800 dark:text-yellow-400">
                  🎉 Perfect!
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  You found all {selectedPuzzle.words.length} words!
                </p>
                <p className="text-lg font-bold text-yellow-800 dark:text-yellow-400 mt-2">
                  Final Score: {score}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
