import { useTournamentStore } from '../../store/tournamentStore';
import { useTimerStore } from '../../store/timerStore';

export function BreakCountdown() {
  const tournament = useTournamentStore((s) => s.tournament);
  const { currentLevelIndex } = useTimerStore();

  if (!tournament) return null;

  const levels = tournament.structure.levels;

  // Find the next break level after the current level
  let minutesToBreak = 0;
  let levelsToBreak = 0;
  let foundBreak = false;

  for (let i = currentLevelIndex + 1; i < levels.length; i++) {
    const level = levels[i];
    if (level.type === 'break') {
      foundBreak = true;
      break;
    }
    minutesToBreak += level.durationMinutes;
    levelsToBreak++;
  }

  // Also add remaining time in current level (approximately)
  const currentLevel = levels[currentLevelIndex];
  if (currentLevel?.type === 'play') {
    // We don't add this here — just show levels + minutes ahead
  }

  if (!foundBreak) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>No upcoming break</span>
      </div>
    );
  }

  const currentIsBreak = currentLevel?.type === 'break';
  if (currentIsBreak) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-400">
      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>
        Break in{' '}
        <span className="text-blue-400 font-semibold">
          {levelsToBreak} level{levelsToBreak !== 1 ? 's' : ''}
        </span>
        {minutesToBreak > 0 && (
          <span className="text-gray-500"> (~{minutesToBreak} min)</span>
        )}
      </span>
    </div>
  );
}
