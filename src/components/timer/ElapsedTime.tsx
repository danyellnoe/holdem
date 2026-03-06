import { useTimerStore } from '../../store/timerStore';
import { formatElapsed } from '../../hooks/useTimer';

export function ElapsedTime() {
  const { totalElapsedMs } = useTimerStore();

  return (
    <div className="flex items-center gap-2 text-sm text-gray-400">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span className="font-mono">{formatElapsed(totalElapsedMs)}</span>
    </div>
  );
}
