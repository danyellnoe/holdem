import { useTournamentStore } from '../../store/tournamentStore';
import { useTimerStore } from '../../store/timerStore';
import { BlindLevel } from '../../types/blind';

function formatBlindRow(level: BlindLevel): string {
  if (level.type === 'break') return level.breakLabel ?? 'Break';
  const sb = level.smallBlind.toLocaleString();
  const bb = level.bigBlind.toLocaleString();
  if (level.bigBlindAnte) return `${sb} / ${bb} BBA`;
  if (level.ante > 0) return `${sb} / ${bb} / ${level.ante.toLocaleString()}`;
  return `${sb} / ${bb}`;
}

interface BlindStructureViewProps {
  compact?: boolean;
}

export function BlindStructureView({ compact = false }: BlindStructureViewProps) {
  const tournament = useTournamentStore((s) => s.tournament);
  const { currentLevelIndex } = useTimerStore();

  if (!tournament) return null;

  const levels = tournament.structure.levels;

  return (
    <div className={`rounded-xl bg-gray-800/60 border border-gray-700 overflow-hidden ${compact ? '' : 'w-full'}`}>
      {!compact && (
        <div className="px-4 py-3 border-b border-gray-700">
          <h2 className="font-semibold text-white">Blind Structure</h2>
          <p className="text-xs text-gray-500 mt-0.5">{tournament.structure.name}</p>
        </div>
      )}
      {compact && (
        <div className="px-3 py-2 border-b border-gray-700">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Blind Structure</p>
        </div>
      )}
      <div className="overflow-y-auto" style={{ maxHeight: compact ? '100%' : '500px' }}>
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-800/90">
            <tr className="text-gray-500 text-xs uppercase tracking-wide">
              <th className={`text-left font-medium py-2 ${compact ? 'px-3' : 'px-4'}`}>Lvl</th>
              <th className={`text-left font-medium py-2 ${compact ? 'px-3' : 'px-4'}`}>Blinds</th>
              <th className={`text-right font-medium py-2 ${compact ? 'px-3' : 'px-4'}`}>Min</th>
            </tr>
          </thead>
          <tbody>
            {levels.map((level, i) => {
              const isCurrent = i === currentLevelIndex;
              const isPast = i < currentLevelIndex;
              const isBreak = level.type === 'break';

              return (
                <tr
                  key={level.id}
                  className={`border-t border-gray-700/50 transition-colors
                    ${isCurrent ? 'bg-green-900/40 border-l-2 border-l-green-500' : ''}
                    ${isPast ? 'opacity-40' : ''}
                    ${isBreak ? 'bg-blue-900/10' : ''}`}
                >
                  <td className={`py-2 font-mono ${compact ? 'px-3' : 'px-4'}`}>
                    {isBreak ? (
                      <span className="text-blue-400 text-xs">BRK</span>
                    ) : (
                      <span className={isCurrent ? 'text-green-400 font-bold' : 'text-gray-400'}>
                        {level.levelNumber}
                      </span>
                    )}
                  </td>
                  <td className={`py-2 ${compact ? 'px-3' : 'px-4'}`}>
                    <span
                      className={
                        isBreak
                          ? 'text-blue-400 text-xs italic'
                          : isCurrent
                          ? 'text-white font-semibold'
                          : 'text-gray-300'
                      }
                    >
                      {formatBlindRow(level)}
                    </span>
                  </td>
                  <td className={`py-2 text-right font-mono ${compact ? 'px-3' : 'px-4'}`}>
                    <span className={isCurrent ? 'text-green-400 font-bold' : 'text-gray-500'}>
                      {level.durationMinutes}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
