import { useTournamentStore } from '../store/tournamentStore';
import { SavedTournaments } from '../components/settings/SavedTournaments';

export function LandingPage() {
  const { createTournament } = useTournamentStore();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      {/* Logo - matches sidebar green spade box */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-14 h-14 rounded-xl bg-green-700 flex items-center justify-center
            text-white font-bold text-2xl flex-shrink-0"
        >
          ♠
        </div>
        <span className="text-white font-bold text-xl leading-tight">
          Poker<br />Tournament
        </span>
      </div>

      <p className="text-gray-400 text-sm mb-6 text-center">
        Load a saved tournament or start fresh.
      </p>

      <div className="w-full max-w-md space-y-4">
        <SavedTournaments />
        <button
          onClick={() => createTournament({})}
          className="w-full py-3 rounded-xl bg-green-700 hover:bg-green-600 text-white
            font-semibold text-sm transition-colors"
        >
          New Blank Tournament
        </button>
      </div>
    </div>
  );
}
