import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Zap, Home } from "lucide-react";
import { grades, skills, games } from "@/lib/mockData";

export default function GameList() {
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const filteredGames = games.filter((game) => {
    const matchesGrade = !selectedGrade || game.grades.includes(selectedGrade);
    const matchesSkill = !selectedSkill || game.skills.includes(selectedSkill);
    return matchesGrade && matchesSkill;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header with back button */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard"><button className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-bold"><Home size={18}/> Dashboard</button></Link>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <Link href="/games"><button className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-bold"><ArrowLeft size={18}/> All Games</button></Link>
          </div>
          <h1 className="text-2xl font-display font-black">Choose Your Game</h1>
          <div className="w-24"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Grade Filter */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h2 className="font-display font-bold text-lg mb-4">Grade Level</h2>
            <div className="space-y-2">
              {grades.map((grade) => (
                <button
                  key={grade.id}
                  onClick={() => setSelectedGrade(selectedGrade === grade.id ? null : grade.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all ${
                    selectedGrade === grade.id
                      ? `${grade.color} text-white`
                      : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                  data-testid={`filter-grade-${grade.id}`}
                >
                  {grade.label}
                </button>
              ))}
            </div>
          </div>

          {/* Skill Filter */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h2 className="font-display font-bold text-lg mb-4">Skill</h2>
            <div className="space-y-2">
              {skills.map((skill) => (
                <button
                  key={skill.id}
                  onClick={() => setSelectedSkill(selectedSkill === skill.id ? null : skill.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all ${
                    selectedSkill === skill.id
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                  data-testid={`filter-skill-${skill.id}`}
                >
                  {skill.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Zap className="text-orange-500" size={24} />
            <h2 className="text-2xl font-display font-bold">
              {filteredGames.length} Games Found
            </h2>
          </div>

          {filteredGames.length === 0 ? (
            <div className="text-center py-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl">
              <p className="text-lg text-slate-600 dark:text-slate-400">
                No games match your filters. Try adjusting your selection!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game) => (
                <Link key={game.id} href={(game as any).route || `/game/${game.id}`}>
                  <div className="game-card-hover h-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden cursor-pointer group">
                    <div className="p-6 h-full flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-display font-bold">{game.title}</h3>
                            {(game as any).category && (
                              <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full uppercase tracking-wide">
                                {(game as any).category}
                              </span>
                            )}
                            {(game as any).isNew && (
                              <span className="text-xs font-black px-2 py-0.5 bg-yellow-400 text-slate-900 rounded-full">NEW</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {game.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex-1"></div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {game.grades.map((gradeId) => {
                          const grade = grades.find((g) => g.id === gradeId);
                          return (
                            <span
                              key={gradeId}
                              className={`text-xs font-bold px-3 py-1 rounded-full ${grade?.color} text-white`}
                            >
                              G{gradeId}
                            </span>
                          );
                        })}
                      </div>

                      <div className="text-right">
                        <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg group-hover:shadow-lg transition-shadow">
                          Play →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
