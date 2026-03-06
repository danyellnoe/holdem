import { useTournamentStore } from '../../store/tournamentStore';
import { Player } from '../../types/player';

function PlayerPrizeRow({
  player,
  config,
}: {
  player: Player;
  config: { rebuyAmount: number; addOnAmount: number };
}) {
  const { addRebuy, addAddOn, eliminatePlayer, updatePlayer } =
    useTournamentStore();

  const totalPaid =
    player.buyInCount * 0 + // buy-in handled in config, this row tracks extras
    0;
  void totalPaid;

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm
        ${player.status === 'eliminated' ? 'opacity-50' : 'bg-gray-800/30'}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`font-medium truncate ${
              player.status === 'eliminated' ? 'line-through text-gray-500' : 'text-white'
            }`}
          >
            {player.name}
          </span>
          {player.finishPosition && (
            <span className="text-xs text-gray-500">#{player.finishPosition}</span>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          {player.buyInCount}×BI
          {player.buyInCount > 1 && <span className="text-yellow-400 ml-1">+{player.buyInCount - 1} rebuy</span>}
          {player.addOnCount > 0 && <span className="text-green-400 ml-1">+{player.addOnCount} addon</span>}
        </div>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => addRebuy(player.id)}
          disabled={player.status === 'eliminated'}
          className="px-2 py-1 rounded bg-yellow-700/60 hover:bg-yellow-600 disabled:opacity-30
            disabled:cursor-not-allowed text-yellow-200 text-xs transition-colors"
          title={`+1 Rebuy ($${config.rebuyAmount})`}
        >
          Rebuy
        </button>
        <button
          onClick={() => addAddOn(player.id)}
          className="px-2 py-1 rounded bg-green-700/60 hover:bg-green-600
            text-green-200 text-xs transition-colors"
          title={`+1 Add-on ($${config.addOnAmount})`}
        >
          +Addon
        </button>
        {player.status === 'active' && (
          <button
            onClick={() => eliminatePlayer(player.id)}
            className="px-2 py-1 rounded bg-red-800/40 hover:bg-red-700/60
              text-red-300 text-xs transition-colors"
          >
            Out
          </button>
        )}
        {player.status === 'eliminated' && (
          <button
            onClick={() => updatePlayer(player.id, { status: 'active', finishPosition: undefined })}
            className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600
              text-gray-300 text-xs transition-colors"
          >
            Undo
          </button>
        )}
      </div>
    </div>
  );
}

export function BuyInTracker() {
  const tournament = useTournamentStore((s) => s.tournament);

  if (!tournament) return null;

  const activePlayers = tournament.players.filter((p) => p.status === 'active');
  const eliminatedPlayers = tournament.players
    .filter((p) => p.status === 'eliminated')
    .sort((a, b) => (b.finishPosition ?? 0) - (a.finishPosition ?? 0));

  return (
    <div className="rounded-xl bg-gray-800/60 border border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <h2 className="font-semibold text-white">Players</h2>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="text-green-400 font-semibold">{activePlayers.length} active</span>
          <span>{eliminatedPlayers.length} out</span>
        </div>
      </div>
      <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
        {activePlayers.length === 0 && eliminatedPlayers.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-4">
            No players yet. Add them in the Players page.
          </p>
        )}
        {activePlayers.map((p) => (
          <PlayerPrizeRow key={p.id} player={p} config={tournament.prizeConfig} />
        ))}
        {eliminatedPlayers.length > 0 && (
          <>
            <div className="text-xs text-gray-600 uppercase tracking-wide px-2 pt-2">Eliminated</div>
            {eliminatedPlayers.map((p) => (
              <PlayerPrizeRow key={p.id} player={p} config={tournament.prizeConfig} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
