import { useTimerStore } from '../../store/timerStore';
import { useTournamentStore } from '../../store/tournamentStore';
import { formatTime } from '../../hooks/useTimer';

interface BreakScreenProps {
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
}

export function BreakScreen({ onPause, onResume, onSkip }: BreakScreenProps) {
  const { status, levelRemainingMs, currentLevelIndex } = useTimerStore();
  const tournament = useTournamentStore((s) => s.tournament);

  if (status !== 'on_break') return null;

  const currentLevel = tournament?.structure.levels[currentLevelIndex];
  const breakLabel = currentLevel?.breakLabel ?? 'Break';
  const previousLevel = tournament?.structure.levels[currentLevelIndex - 1];
  const isAddOnBreak =
    currentLevel?.type === 'break' &&
    tournament?.settings.lateRegLevels !== 0 &&
    previousLevel?.type === 'play' &&
    previousLevel.levelNumber === tournament?.settings.lateRegLevels;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur flex flex-col items-center justify-center gap-8">
      {isAddOnBreak && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 rounded-lg bg-green-900/80
          px-5 py-3 text-center text-lg font-semibold text-green-100 shadow-lg">
          Add-ons are now available until end of this break!
        </div>
      )}
      {/* Break label */}
      <div className="text-blue-400 text-2xl font-bold tracking-widest uppercase">
        {breakLabel}
      </div>

      {/* Big timer */}
      <div
        className="font-mono font-bold text-white tabular-nums"
        style={{ fontSize: 'clamp(5rem, 22vw, 14rem)' }}
      >
        {formatTime(levelRemainingMs)}
      </div>

      <div className="text-gray-400 text-lg">remaining in break</div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {status === 'on_break' ? (
          <button
            onClick={onPause}
            className="px-6 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white
              font-semibold transition-colors"
          >
            Pause
          </button>
        ) : (
          <button
            onClick={onResume}
            className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white
              font-semibold transition-colors"
          >
            Resume
          </button>
        )}
        <button
          onClick={onSkip}
          className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white
            font-semibold transition-colors"
        >
          End Break
        </button>
      </div>
    </div>
  );
}
