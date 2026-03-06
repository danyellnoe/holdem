import { useTournamentStore } from '../../store/tournamentStore';

export function PlayerRoster() {
  const tournament = useTournamentStore((s) => s.tournament);
  const { removePlayer, eliminatePlayer, addRebuy, removeRebuy, updatePlayer } = useTournamentStore();

  if (!tournament) return null;

  const isSetup = tournament.status === 'setup';

  const players = tournament.players;
  const activePlayers = players.filter((p) => p.status === 'active');
  const eliminatedPlayers = players
    .filter((p) => p.status === 'eliminated')
    .sort((a, b) => (b.finishPosition ?? 0) - (a.finishPosition ?? 0));

  return (
    <div className="rounded-xl bg-gray-800/60 border border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <h2 className="font-semibold text-white">Player Roster</h2>
        <span className="text-sm text-gray-400">
          {activePlayers.length} active / {players.length} total
        </span>
      </div>
      <div className="divide-y divide-gray-700/50 max-h-[60vh] overflow-y-auto">
        {players.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-8">
            No players registered yet.
          </p>
        )}

        {activePlayers.map((player) => {
          const table = tournament.tables.find((t) => t.id === player.tableId);
          return (
            <div
              key={player.id}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-700/30 group"
            >
              <div className="w-8 h-8 rounded-full bg-green-800/50 flex items-center justify-center
                text-green-300 text-sm font-bold flex-shrink-0">
                {player.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm truncate">{player.name}</div>
                <div className="text-xs text-gray-500">
                  {table
                    ? `${table.name} · Seat ${player.seatNumber}`
                    : 'Unseated'}
                  {player.buyInCount > 1 && (
                    <span className="ml-2 text-yellow-500">{player.buyInCount - 1}R</span>
                  )}
                  {player.addOnCount > 0 && (
                    <span className="ml-1 text-green-500">{player.addOnCount}A</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {player.buyInCount > 1 && (
                  <button
                    onClick={() => removeRebuy(player.id)}
                    className="px-2 py-0.5 rounded text-xs bg-yellow-900/50 hover:bg-yellow-800/60
                      text-yellow-400 transition-colors"
                    title="Remove rebuy"
                  >
                    −Rebuy
                  </button>
                )}
                <button
                  onClick={() => addRebuy(player.id)}
                  disabled={isSetup}
                  className="px-2 py-0.5 rounded text-xs bg-yellow-800/40 hover:bg-yellow-700/60
                    disabled:opacity-30 disabled:cursor-not-allowed text-yellow-300 transition-colors"
                  title={isSetup ? 'Start the game to add rebuys' : 'Add rebuy'}
                >
                  Rebuy
                </button>
                <button
                  onClick={() => eliminatePlayer(player.id)}
                  className="px-2 py-0.5 rounded text-xs bg-red-800/40 hover:bg-red-700/60
                    text-red-300 transition-colors"
                >
                  Eliminate
                </button>
                <button
                  onClick={() => removePlayer(player.id)}
                  className="p-1 rounded text-gray-600 hover:text-red-400 transition-colors"
                  title="Remove player"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}

        {eliminatedPlayers.length > 0 && (
          <>
            <div className="px-4 py-2 text-xs text-gray-600 uppercase tracking-wide bg-gray-800/40">
              Eliminated
            </div>
            {eliminatedPlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-3 px-4 py-2 opacity-50 hover:opacity-70 group"
              >
                <div className="w-8 h-8 rounded-full bg-red-900/30 flex items-center justify-center
                  text-red-400 text-sm font-bold flex-shrink-0">
                  {player.finishPosition ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-300 font-medium text-sm line-through truncate">
                    {player.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    Finished {player.finishPosition ? `${player.finishPosition}th` : 'out'}
                  </div>
                </div>
                <button
                  onClick={() =>
                    updatePlayer(player.id, { status: 'active', finishPosition: undefined })
                  }
                  className="px-2 py-0.5 rounded text-xs bg-gray-700 hover:bg-gray-600
                    text-gray-300 transition-colors opacity-0 group-hover:opacity-100"
                >
                  Undo
                </button>
                <button
                  onClick={() => removePlayer(player.id)}
                  className="p-1 rounded text-gray-700 hover:text-red-400 transition-colors
                    opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
