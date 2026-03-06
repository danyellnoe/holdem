import { useTournamentStore } from '../../store/tournamentStore';
import { useTimerStore } from '../../store/timerStore';
import { BlindLevel } from '../../types/blind';

function formatBlindShort(level: BlindLevel): string {
  if (level.type === 'break') return level.breakLabel ?? 'Break';
  const sb = level.smallBlind.toLocaleString();
  const bb = level.bigBlind.toLocaleString();
  if (level.bigBlindAnte) return `${sb}/${bb} BBA`;
  if (level.ante > 0) return `${sb}/${bb} (${level.ante.toLocaleString()})`;
  return `${sb}/${bb}`;
}

export function NextBlindPreview() {
  const tournament = useTournamentStore((s) => s.tournament);
  const { currentLevelIndex } = useTimerStore();

  if (!tournament) return null;

  const levels = tournament.structure.levels;
  const nextLevel = levels[currentLevelIndex + 1];

  if (!nextLevel) {
    return (
      <div className="text-center text-gray-600 text-sm">Final Level</div>
    );
  }

  const isBreakNext = nextLevel.type === 'break';

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-500 uppercase tracking-wide text-xs">
        {isBreakNext ? 'Up next' : 'Next level'}
      </span>
      <span className={`font-semibold ${isBreakNext ? 'text-blue-400' : 'text-gray-300'}`}>
        {formatBlindShort(nextLevel)}
      </span>
      {!isBreakNext && nextLevel.levelNumber && (
        <span className="text-gray-600 text-xs">L{nextLevel.levelNumber}</span>
      )}
    </div>
  );
}
