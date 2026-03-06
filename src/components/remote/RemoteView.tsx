import { useEffect, useState } from 'react';
import { useTimerStore } from '../../store/timerStore';
import { useRemoteViewer } from '../../hooks/useRemoteSync';
import { formatTime, formatElapsed } from '../../hooks/useTimer';
import { useTournamentStore } from '../../store/tournamentStore';
import { BlindLevel } from '../../types/blind';

function formatBlind(level: BlindLevel): string {
  if (level.type === 'break') return level.breakLabel ?? 'Break';
  const sb = level.smallBlind.toLocaleString();
  const bb = level.bigBlind.toLocaleString();
  if (level.bigBlindAnte) return `${sb} / ${bb} BBA`;
  if (level.ante > 0) return `${sb} / ${bb} (${level.ante.toLocaleString()})`;
  return `${sb} / ${bb}`;
}

export function RemoteView() {
  const { status, levelRemainingMs, totalElapsedMs, currentLevelIndex } = useTimerStore();
  const { isConnected } = useRemoteViewer();
  const tournament = useTournamentStore((s) => s.tournament);
  const [lastConnected] = useState(false);
  void lastConnected;

  const levels = tournament?.structure.levels ?? [];
  const currentLevel = levels[currentLevelIndex];
  const nextLevel = levels[currentLevelIndex + 1];
  const isBreak = currentLevel?.type === 'break';

  const isLow = levelRemainingMs <= 60_000 && levelRemainingMs > 0 && status === 'running';

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-6 p-6">
      {/* Connection indicator */}
      <div className="absolute top-4 right-4">
        <div className={`flex items-center gap-1.5 text-xs ${isConnected ? 'text-green-400' : 'text-gray-600'}`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
          {isConnected ? 'Live' : 'Waiting for host...'}
        </div>
      </div>

      {/* Level info */}
      {currentLevel && (
        <div className="text-center">
          {!isBreak && (
            <div className="text-gray-500 text-sm font-semibold tracking-widest uppercase mb-1">
              Level {currentLevel.levelNumber}
            </div>
          )}
          {isBreak && (
            <div className="text-blue-400 text-2xl font-bold mb-2 tracking-widest">
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

      {/* Blind display */}
      {currentLevel && !isBreak && (
        <div className="text-3xl font-bold text-white text-center">
          {formatBlind(currentLevel)}
        </div>
      )}

      {/* Next blind */}
      {nextLevel && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="text-gray-600">Next:</span>
          <span className={nextLevel.type === 'break' ? 'text-blue-400' : 'text-gray-300'}>
            {formatBlind(nextLevel)}
          </span>
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
