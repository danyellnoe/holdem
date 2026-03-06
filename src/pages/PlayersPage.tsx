import { AddPlayerForm } from '../components/players/AddPlayerForm';
import { PlayerRoster } from '../components/players/PlayerRoster';
import { useTournamentStore } from '../store/tournamentStore';

export function PlayersPage() {
  const tournament = useTournamentStore((s) => s.tournament);

  if (!tournament) {
    return <div className="p-6 text-gray-500">No tournament loaded.</div>;
  }

  const activePlayers = tournament.players.filter((p) => p.status === 'active').length;
  const totalPlayers = tournament.players.length;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Players</h1>
          <p className="text-gray-400 text-sm mt-1">
            {activePlayers} active · {totalPlayers} registered
          </p>
        </div>
      </div>

      <AddPlayerForm />
      <PlayerRoster />
    </div>
  );
}
