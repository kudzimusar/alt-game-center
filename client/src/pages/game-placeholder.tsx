import { useParams } from "wouter";
import { Link } from "wouter";
import { ArrowLeft, Lock } from "lucide-react";
import { games } from "@/lib/mockData";

export default function GamePlaceholder() {
  const { gameId } = useParams<{ gameId: string }>();
  const game = games.find((g) => g.id === gameId);

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-display font-black mb-4">Game Not Found</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            This game doesn't exist yet.
          </p>
          <Link href="/games">
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg">
              Back to Games
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/games">
          <button className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8">
            <ArrowLeft size={20} />
            Back to Games
          </button>
        </Link>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border border-white/20 p-12 text-center">
          <Lock size={48} className="mx-auto mb-4 text-slate-400" />
          <h1 className="text-3xl font-display font-black mb-2">{game.title}</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
            {game.description}
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-blue-900 dark:text-blue-400 mb-2">
              🚧 Coming Soon
            </h3>
            <p className="text-blue-800 dark:text-blue-300">
              This game is under development. Check back soon for the full interactive experience!
            </p>
          </div>

          <Link href="/games">
            <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all">
              Explore Other Games
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
