import { useState } from 'react';
import { useTournamentStore } from '../../store/tournamentStore';
import { Player } from '../../types/player';
import { BuyInEvent, BuyInEventType } from '../../types/prize';

function PlayerPrizeRow({
  player,
  config,
  isSetup,
}: {
  player: Player;
  config: { rebuyAmount: number; addOnAmount: number };
  isSetup: boolean;
}) {
  const { addRebuy, addAddOn, removeRebuy, removeAddOn, eliminatePlayer, updatePlayer } =
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
        {player.buyInCount > 1 && (
          <button
            onClick={() => removeRebuy(player.id)}
            disabled={player.status === 'eliminated'}
            className="px-2 py-1 rounded bg-yellow-800/40 hover:bg-yellow-700/60 disabled:opacity-30
              disabled:cursor-not-allowed text-yellow-300 text-xs transition-colors"
            title="Remove rebuy"
          >
            −Rebuy
          </button>
        )}
        <button
          onClick={() => addRebuy(player.id)}
          disabled={player.status === 'eliminated' || isSetup}
          className="px-2 py-1 rounded bg-yellow-700/60 hover:bg-yellow-600 disabled:opacity-30
            disabled:cursor-not-allowed text-yellow-200 text-xs transition-colors"
          title={isSetup ? 'Start the game to add rebuys' : `+1 Rebuy ($${config.rebuyAmount})`}
        >
          Rebuy
        </button>
        {player.addOnCount > 0 && (
          <button
            onClick={() => removeAddOn(player.id)}
            disabled={player.status === 'eliminated'}
            className="px-2 py-1 rounded bg-green-800/40 hover:bg-green-700/60 disabled:opacity-30
              disabled:cursor-not-allowed text-green-300 text-xs transition-colors"
            title="Remove add-on"
          >
            −Addon
          </button>
        )}
        <button
          onClick={() => addAddOn(player.id)}
          disabled={isSetup}
          className="px-2 py-1 rounded bg-green-700/60 hover:bg-green-600 disabled:opacity-30
            disabled:cursor-not-allowed text-green-200 text-xs transition-colors"
          title={isSetup ? 'Start the game to add add-ons' : `+1 Add-on ($${config.addOnAmount})`}
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
          <PlayerPrizeRow
            key={p.id}
            player={p}
            config={tournament.prizeConfig}
            isSetup={tournament.status === 'setup'}
          />
        ))}
        {eliminatedPlayers.length > 0 && (
          <>
            <div className="text-xs text-gray-600 uppercase tracking-wide px-2 pt-2">Eliminated</div>
            {eliminatedPlayers.map((p) => (
              <PlayerPrizeRow
                key={p.id}
                player={p}
                config={tournament.prizeConfig}
                isSetup={tournament.status === 'setup'}
              />
            ))}
          </>
        )}
      </div>
      <BuyInHistory events={tournament.buyInEvents ?? []} players={tournament.players} />
    </div>
  );
}

function eventLabel(type: BuyInEventType): string {
  switch (type) {
    case 'rebuy':
      return '+1 rebuy';
    case 'addon':
      return '+1 add-on';
    case 'remove_rebuy':
      return '−1 rebuy';
    case 'remove_addon':
      return '−1 add-on';
    default:
      return type;
  }
}

function BuyInHistory({ events, players }: { events: BuyInEvent[]; players: Player[] }) {
  const [expanded, setExpanded] = useState(false);
  if (events.length === 0) return null;

  const playerName = (id: string) => players.find((p) => p.id === id)?.name ?? 'Unknown';
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  };

  const sorted = [...events].reverse();

  return (
    <div className="border-t border-gray-700">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full px-4 py-2 flex items-center justify-between text-left text-sm
          text-gray-400 hover:text-gray-300 hover:bg-gray-800/40 transition-colors"
      >
        <span>Buy-in history</span>
        <span className="text-xs">{events.length} events</span>
        <svg
          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="px-4 pb-3 max-h-48 overflow-y-auto space-y-1 text-xs text-gray-500">
          {sorted.map((e) => (
            <div key={e.id} className="flex items-center gap-2">
              <span className="text-gray-600 tabular-nums">{formatTime(e.timestamp)}</span>
              <span className="text-gray-400">—</span>
              <span className="text-gray-300">{playerName(e.playerId)}:</span>
              <span>{eventLabel(e.type)}</span>
              {e.levelIndex != null && (
                <span className="text-gray-600">(Level {e.levelIndex + 1})</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
