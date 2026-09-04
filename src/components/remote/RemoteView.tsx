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
  const previousLevel = levels[currentLevelIndex - 1];
  const isAddOnBreak =
    isBreak &&
    tournament?.settings.lateRegLevels !== 0 &&
    previousLevel?.type === 'play' &&
    previousLevel.levelNumber === tournament?.settings.lateRegLevels;

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
    <div className="h-screen bg-gray-950 flex flex-col items-center justify-between p-6 overflow-hidden">

      {/* ── Top bar: level label + connection indicator ── */}
      <div className="w-full flex items-center justify-between">
        <div className="flex-1" />
        <div className="flex-1 text-center">
          {currentLevel && (
            !isBreak ? (
              <div className="text-gray-400 text-2xl font-semibold tracking-widest uppercase">
                Level {currentLevel.levelNumber}
              </div>
            ) : (
              <div className="text-blue-400 text-4xl font-bold tracking-widest">
                {currentLevel.breakLabel ?? 'Break'}
              </div>
            )
          )}
        </div>
        <div className="flex-1 flex justify-end">
          <div className={`flex items-center gap-2 text-base ${isConnected ? 'text-green-400' : 'text-gray-600'}`}>
            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
            {isConnected ? 'Live' : 'Waiting…'}
          </div>
        </div>
      </div>

      {/* ── Timer ── */}
      <div
        className={`font-mono font-bold tabular-nums leading-none
          ${isBreak ? 'text-blue-300' : isLow ? 'text-yellow-400' : 'text-white'}`}
        style={{ fontSize: 'clamp(6rem, 30vw, 20rem)' }}
      >
        {formatTime(levelRemainingMs)}
      </div>
      {isAddOnBreak && (
        <div className="fixed z-10 max-w-[calc(100%-2rem)] rounded-lg bg-green-900/80 px-5 py-3
          text-center text-xl font-semibold text-green-100 shadow-lg animate-bounce-notice">
          Add-ons are now available until end of this break!
        </div>
      )}

      {/* ── Blinds + next level ── */}
      <div className="flex flex-col items-center gap-3">
        {showBlinds && (
          <div className="flex items-center gap-6 text-center">
            <div>
              <div className="text-gray-500 text-base font-semibold tracking-widest uppercase mb-1">Small Blind</div>
              <div className="font-bold text-white tabular-nums" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>
                {currentLevel.smallBlind.toLocaleString()}
              </div>
            </div>
            <div className="text-gray-500 font-light" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>/</div>
            <div>
              <div className="text-gray-500 text-base font-semibold tracking-widest uppercase mb-1">Big Blind</div>
              <div className="font-bold text-white tabular-nums" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>
                {currentLevel.bigBlind.toLocaleString()}
              </div>
            </div>
            {(currentLevel.ante > 0 || currentLevel.bigBlindAnte) && (
              <>
                <div className="text-gray-500 font-light" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>/</div>
                <div>
                  <div className="text-gray-500 text-base font-semibold tracking-widest uppercase mb-1">
                    {currentLevel.bigBlindAnte ? 'BBA' : 'Ante'}
                  </div>
                  <div className="font-bold text-green-400 tabular-nums" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>
                    {currentLevel.bigBlindAnte
                      ? currentLevel.bigBlind.toLocaleString()
                      : currentLevel.ante.toLocaleString()}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {nextLevel && (
          <div className="flex items-center gap-2 text-gray-400" style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)' }}>
            <span className="text-gray-600">Next:</span>
            <span className={nextLevel.type === 'break' ? 'text-blue-400' : 'text-gray-300'}>
              {formatBlindShort(nextLevel)}
            </span>
          </div>
        )}
      </div>

      {/* ── Metadata row: players, prize pool, payouts ── */}
      {tournament && (
        <div className="flex flex-wrap justify-center gap-10">
          <div className="text-center">
            <div className="text-gray-500 text-base font-semibold tracking-widest uppercase mb-1">Players</div>
            <div className="font-bold tabular-nums" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
              <span className="text-white">{activePlayers}</span>
              <span className="text-gray-600 text-xl font-normal"> / {totalPlayers}</span>
            </div>
          </div>

          {netPool > 0 && (
            <div className="text-center">
              <div className="text-gray-500 text-base font-semibold tracking-widest uppercase mb-1">Prize Pool</div>
              <div className="text-green-400 font-bold tabular-nums" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
                {formatCurrency(netPool)}
              </div>
            </div>
          )}

          {topSpots.length > 0 && (
            <div className="text-center">
              <div className="text-gray-500 text-base font-semibold tracking-widest uppercase mb-1">Payouts</div>
              <div className="flex items-baseline gap-5">
                {topSpots.map((spot) => (
                  <div key={spot.position} className="text-center">
                    <div className="text-gray-500 text-sm mb-0.5">{getMedalEmoji(spot.position)}</div>
                    <div className="text-white font-semibold tabular-nums" style={{ fontSize: 'clamp(1.25rem, 3vw, 2rem)' }}>
                      {formatCurrency(spot.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Bottom bar: elapsed + status banners ── */}
      <div className="w-full flex items-center justify-center gap-6">
        <div className="text-gray-600 text-base font-mono">
          Elapsed: {formatElapsed(totalElapsedMs)}
        </div>
        {status === 'paused' && (
          <div className="text-yellow-400 font-bold text-2xl animate-pulse tracking-widest">
            PAUSED
          </div>
        )}
        {status === 'complete' && (
          <div className="text-green-400 font-bold text-3xl tracking-widest">
            TOURNAMENT COMPLETE
          </div>
        )}
      </div>

    </div>
  );
}
