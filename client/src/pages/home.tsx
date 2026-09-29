import { Link } from "wouter";
import { BookOpen, Users, Zap, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 bg-blue-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-60 h-60 bg-purple-300/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative pt-12 pb-20 text-center">
        <h1 className="text-5xl md:text-7xl font-display font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
          ALT Game Center
        </h1>
        <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 font-medium max-w-2xl mx-auto">
          Interactive English games for Japanese junior high school classrooms
        </p>
      </div>

      {/* Feature grid */}
      <div className="max-w-6xl mx-auto px-4 pb-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <Zap className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">50+ Games</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Speaking, listening, reading & writing</p>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <Globe className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">Bilingual</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Japanese & English UI</p>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
              <Users className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">Team Mode</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Perfect for 35-40 student classes</p>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="text-orange-600 dark:text-orange-400" size={24} />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">Curriculum Aligned</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">MEXT Course of Study</p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mb-16">
          <Link href="/games">
            <button className="group relative px-8 py-4 md:px-12 md:py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-display font-bold text-lg rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
              <span className="relative z-10 flex items-center gap-2">
                Start Playing
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </button>
          </Link>
        </div>

        {/* Recent games preview */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden">
          <div className="px-8 py-6 border-b border-white/10">
            <h2 className="text-2xl font-display font-bold">Priority Games</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Start with these essential games</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-8">
            {[
              { emoji: "🎯", name: "3 Hint Quiz" },
              { emoji: "🔍", name: "Word Search" },
              { emoji: "🎮", name: "Class Quiz" },
              { emoji: "🎲", name: "Bingo" },
              { emoji: "💎", name: "Jeopardy" }
            ].map((game) => (
              <div key={game.name} className="text-center p-4 rounded-xl bg-slate-50/50 dark:bg-slate-700/50 hover:bg-slate-100/50 dark:hover:bg-slate-700 transition-colors">
                <div className="text-4xl mb-2">{game.emoji}</div>
                <p className="font-semibold text-sm">{game.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
