import { useTournamentStore } from '../store/tournamentStore';
import { PresetPicker } from '../components/blinds/PresetPicker';
import { BlindLevelForm } from '../components/blinds/BlindLevelForm';
import { BlindLevel } from '../types/blind';

export function StructurePage() {
  const tournament = useTournamentStore((s) => s.tournament);
  const { addBlindLevel, updateBlindLevel, removeBlindLevel } = useTournamentStore();

  if (!tournament) {
    return (
      <div className="p-6 text-gray-500">No tournament loaded.</div>
    );
  }

  const levels = tournament.structure.levels;
  const playLevels = levels.filter((l) => l.type === 'play').length;
  const totalMins = levels.reduce((s, l) => s + l.durationMinutes, 0);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Blind Structure</h1>
        <p className="text-gray-400 text-sm mt-1">
          {playLevels} levels ·{' '}
          {hours > 0 ? `${hours}h ${mins}m` : `${mins}m`} total
        </p>
      </div>

      {/* Preset picker */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
          Load Preset
        </h2>
        <PresetPicker />
      </div>

      {/* Column headers */}
      <div>
        <div className="flex items-center gap-2 px-3 py-1 text-xs text-gray-600 uppercase tracking-wide">
          <div className="w-8 text-center">#</div>
          <div className="flex-1 grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-1 text-center">
            <span>Small Blind</span>
            <span>Big Blind</span>
            <span>Ante</span>
            <span className="w-16">BBA</span>
            <span className="w-16">Duration</span>
          </div>
        </div>

        {/* Level list */}
        <div className="space-y-1">
          {levels.map((level) => (
            <BlindLevelForm
              key={level.id}
              level={level}
              onChange={(changes: Partial<BlindLevel>) => updateBlindLevel(level.id, changes)}
              onDelete={() => removeBlindLevel(level.id)}
              onAddAfter={(isBreak: boolean) => addBlindLevel(level.id, isBreak)}
            />
          ))}
        </div>

        {/* Add buttons */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => addBlindLevel(null, false)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-700
              hover:bg-gray-600 text-gray-300 text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Level
          </button>
          <button
            onClick={() => addBlindLevel(null, true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-700
              hover:bg-gray-600 text-blue-300 text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Add Break
          </button>
        </div>
      </div>
    </div>
  );
}
