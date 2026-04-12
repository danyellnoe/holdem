import { useMemo } from 'react';
import { useTimerStore } from '../../store/timerStore';
import { useRemoteViewer } from '../../hooks/useRemoteSync';
import { formatTime, formatElapsed } from '../../hooks/useTimer';
import { useTournamentStore } from '../../store/tournamentStore';
import { BlindLevel } from '../../types/blind';
import { formatCurrency } from '../../lib/payoutCalculator';

function formatBlindShort(level: BlindLevel): string {
  if (level.type === 'break') return level.breakLabel ?? 'Break';
  const sb = level.smallBlind.toLocaleString();
  const bb = level.bigBlind.toLocaleString();
  if (level.bigBlindAnte) return `${sb} / ${bb} BBA`;
  if (level.ante > 0) return `${sb} / ${bb} (${level.ante.toLocaleString()})`;
  return `${sb} / ${bb}`;
}

const MEDAL_EMOJI: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

function getMedalEmoji(position: number): string {
  return MEDAL_EMOJI[position] ?? `${position}.`;
}

export function RemoteView() {
  const { status, levelRemainingMs, totalElapsedMs, currentLevelIndex } = useTimerStore();
  const { isConnected } = useRemoteViewer();
  const tournament = useTournamentStore((s) => s.tournament);

  const levels = tournament?.structure.levels ?? [];
  const currentLevel = levels[currentLevelIndex];
  const nextLevel = levels[currentLevelIndex + 1];
  const isBreak = currentLevel?.type === 'break';

  const isLow = levelRemainingMs <= 60_000 && levelRemainingMs > 0 && status === 'running';

  // Player counts
  const allPlayers = tournament?.players ?? [];
  const { activePlayers, totalPlayers } = useMemo(() => ({
    activePlayers: allPlayers.filter((p) => p.status === 'active').length,
    totalPlayers: allPlayers.length,
  }), [allPlayers]);

  // Prize info
  const netPool = tournament?.prizeSnapshot.netPool ?? 0;
  const payoutSpots = tournament?.payoutStructure.spots ?? [];
  const topSpots = payoutSpots.slice(0, 3);

  // Blind values for current level
  const showBlinds = currentLevel && !isBreak && currentLevel.type !== 'break';

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-6 p-6">
      {/* Connection indicator */}
      <div className="absolute top-4 right-4">
        <div className={`flex items-center gap-1.5 text-xs ${isConnected ? 'text-green-400' : 'text-gray-600'}`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
          {isConnected ? 'Live' : 'Waiting for host...'}
        </div>
      </div>

      {/* Level label */}
      {currentLevel && (
        <div className="text-center">
          {!isBreak ? (
            <div className="text-gray-500 text-sm font-semibold tracking-widest uppercase">
              Level {currentLevel.levelNumber}
            </div>
          ) : (
            <div className="text-blue-400 text-2xl font-bold tracking-widest">
              {currentLevel.breakLabel ?? 'Break'}
            </div>
          )}
        </div>
      )}

      {/* Giant timer */}
      <div
        className={`font-mono font-bold tabular-nums leading-none
          ${isBreak ? 'text-blue-300' : isLow ? 'text-yellow-400' : 'text-white'}`}
        style={{ fontSize: 'clamp(5rem, 28vw, 18rem)' }}
      >
        {formatTime(levelRemainingMs)}
      </div>

      {/* Blind display — prominent, labeled */}
      {showBlinds && (
        <div className="flex items-center gap-6 text-center">
          <div>
            <div className="text-gray-500 text-xs font-semibold tracking-widest uppercase mb-0.5">Small Blind</div>
            <div className="text-2xl font-bold text-white tabular-nums">
              {currentLevel.smallBlind.toLocaleString()}
            </div>
          </div>
          <div className="text-gray-600 text-2xl font-light">/</div>
          <div>
            <div className="text-gray-500 text-xs font-semibold tracking-widest uppercase mb-0.5">Big Blind</div>
            <div className="text-2xl font-bold text-white tabular-nums">
              {currentLevel.bigBlind.toLocaleString()}
            </div>
          </div>
          {(currentLevel.ante > 0 || currentLevel.bigBlindAnte) && (
            <>
              <div className="text-gray-600 text-2xl font-light">/</div>
              <div>
                <div className="text-gray-500 text-xs font-semibold tracking-widest uppercase mb-0.5">
                  {currentLevel.bigBlindAnte ? 'BBA' : 'Ante'}
                </div>
                <div className="text-2xl font-bold text-green-400 tabular-nums">
                  {currentLevel.bigBlindAnte
                    ? currentLevel.bigBlind.toLocaleString()
                    : currentLevel.ante.toLocaleString()}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Next blind */}
      {nextLevel && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="text-gray-600">Next:</span>
          <span className={nextLevel.type === 'break' ? 'text-blue-400' : 'text-gray-300'}>
            {formatBlindShort(nextLevel)}
          </span>
        </div>
      )}

      {/* Metadata row: players, prize pool, payouts */}
      {tournament && (
        <div className="flex flex-wrap justify-center gap-6 mt-2">
          {/* Players remaining */}
          <div className="text-center">
            <div className="text-gray-500 text-xs font-semibold tracking-widest uppercase mb-1">Players</div>
            <div className="text-white text-xl font-bold tabular-nums">
              {activePlayers}
              <span className="text-gray-600 text-sm font-normal"> / {totalPlayers}</span>
            </div>
          </div>

          {/* Prize pool */}
          {netPool > 0 && (
            <div className="text-center">
              <div className="text-gray-500 text-xs font-semibold tracking-widest uppercase mb-1">Prize Pool</div>
              <div className="text-green-400 text-xl font-bold tabular-nums">
                {formatCurrency(netPool)}
              </div>
            </div>
          )}

          {/* Top payouts */}
          {topSpots.length > 0 && (
            <div className="text-center">
              <div className="text-gray-500 text-xs font-semibold tracking-widest uppercase mb-1">Payouts</div>
              <div className="flex items-baseline gap-3">
                {topSpots.map((spot) => (
                  <div key={spot.position} className="text-center">
                    <div className="text-gray-600 text-xs">
                      {getMedalEmoji(spot.position)}
                    </div>
                    <div className="text-white text-sm font-semibold tabular-nums">
                      {formatCurrency(spot.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Elapsed */}
      <div className="text-gray-600 text-sm font-mono">
        Elapsed: {formatElapsed(totalElapsedMs)}
      </div>

      {status === 'paused' && (
        <div className="text-yellow-400 font-bold text-xl animate-pulse-slow tracking-widest">
          PAUSED
        </div>
      )}
      {status === 'complete' && (
        <div className="text-green-400 font-bold text-2xl tracking-widest">
          TOURNAMENT COMPLETE
        </div>
      )}
    </div>
  );
}
