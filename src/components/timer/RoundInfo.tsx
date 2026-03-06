import { useTournamentStore } from '../../store/tournamentStore';
import { useTimerStore } from '../../store/timerStore';
import { BlindLevel } from '../../types/blind';

function formatBlind(level: BlindLevel): string {
  if (level.type === 'break') return level.breakLabel ?? 'Break';
  const sb = level.smallBlind.toLocaleString();
  const bb = level.bigBlind.toLocaleString();
  if (level.bigBlindAnte) return `${sb} / ${bb} BBA`;
  if (level.ante > 0) return `${sb} / ${bb} (${level.ante.toLocaleString()} ante)`;
  return `${sb} / ${bb}`;
}

export function RoundInfo() {
  const tournament = useTournamentStore((s) => s.tournament);
  const { currentLevelIndex } = useTimerStore();

  if (!tournament) return null;

  const levels = tournament.structure.levels;
  const currentLevel = levels[currentLevelIndex];
  if (!currentLevel) return null;

  const isBreak = currentLevel.type === 'break';

  return (
    <div className="flex flex-col items-center gap-1 text-center">
      {!isBreak && (
        <div className="text-gray-400 text-sm font-semibold tracking-widest uppercase">
          Level {currentLevel.levelNumber}
        </div>
      )}
      <div
        className={`font-bold tracking-wide ${
          isBreak ? 'text-blue-400 text-3xl' : 'text-white text-4xl'
        }`}
      >
        {formatBlind(currentLevel)}
      </div>
    </div>
  );
}
