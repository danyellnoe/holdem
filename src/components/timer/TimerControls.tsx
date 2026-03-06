import { useTimerStore } from '../../store/timerStore';

interface TimerControlsProps {
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onPrev: () => void;
  onAdjust: (ms: number) => void;
}

export function TimerControls({
  onStart,
  onPause,
  onResume,
  onSkip,
  onPrev,
  onAdjust,
}: TimerControlsProps) {
  const { status } = useTimerStore();

  const isSetup = status === 'setup';
  const isRunning = status === 'running' || status === 'on_break';
  const isPaused = status === 'paused';
  const isComplete = status === 'complete';

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Main control row */}
      <div className="flex items-center gap-3">
        {/* Prev level */}
        <button
          onClick={onPrev}
          disabled={isComplete}
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-30
            disabled:cursor-not-allowed text-white transition-colors"
          title="Previous level (←)"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Play / Pause / Resume */}
        {isSetup && (
          <button
            onClick={onStart}
            className="px-8 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white
              font-bold text-lg tracking-wide transition-colors shadow-lg shadow-green-900/50"
          >
            Start Tournament
          </button>
        )}
        {isRunning && (
          <button
            onClick={onPause}
            className="w-14 h-14 rounded-full bg-yellow-500 hover:bg-yellow-400 text-white
              font-bold text-xl transition-colors flex items-center justify-center shadow-lg"
            title="Pause (Space)"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          </button>
        )}
        {isPaused && (
          <button
            onClick={onResume}
            className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-500 text-white
              font-bold text-xl transition-colors flex items-center justify-center shadow-lg"
            title="Resume (Space)"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}
        {isComplete && (
          <div className="px-6 py-2 rounded-xl bg-gray-700 text-gray-400 font-bold text-lg">
            Tournament Complete
          </div>
        )}

        {/* Skip level */}
        <button
          onClick={onSkip}
          disabled={isComplete}
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-30
            disabled:cursor-not-allowed text-white transition-colors"
          title="Skip to next level (→)"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Time adjustment */}
      {(isRunning || isPaused) && (
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => onAdjust(-60_000)}
            className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300
              font-mono transition-colors text-xs"
            title="-1 minute"
          >
            −1 min
          </button>
          <button
            onClick={() => onAdjust(-30_000)}
            className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300
              font-mono transition-colors text-xs"
            title="-30 seconds"
          >
            −30s
          </button>
          <span className="text-gray-600 text-xs px-1">adjust</span>
          <button
            onClick={() => onAdjust(30_000)}
            className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300
              font-mono transition-colors text-xs"
            title="+30 seconds"
          >
            +30s
          </button>
          <button
            onClick={() => onAdjust(60_000)}
            className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300
              font-mono transition-colors text-xs"
            title="+1 minute"
          >
            +1 min
          </button>
        </div>
      )}
    </div>
  );
}
