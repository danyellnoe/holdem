import { BLIND_PRESETS } from '../../lib/blindPresets';
import { useTournamentStore } from '../../store/tournamentStore';
import { clonePreset } from '../../lib/blindPresets';

export function PresetPicker() {
  const { tournament, setBlindStructure } = useTournamentStore();

  const handleSelect = (presetId: string) => {
    const preset = BLIND_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    if (
      tournament?.structure.levels.length &&
      !confirm(`Replace current blind structure with "${preset.name}"?`)
    )
      return;
    const cloned = clonePreset(preset);
    setBlindStructure(cloned);
  };

  const currentId = tournament?.structure.id;

  return (
    <div className="flex flex-wrap gap-2">
      {BLIND_PRESETS.map((preset) => {
        const playLevels = preset.levels.filter((l) => l.type === 'play').length;
        const totalMins = preset.levels.reduce((s, l) => s + l.durationMinutes, 0);
        const hours = Math.floor(totalMins / 60);
        const mins = totalMins % 60;
        const duration = hours > 0 ? `~${hours}h${mins > 0 ? ` ${mins}m` : ''}` : `~${mins}m`;

        return (
          <button
            key={preset.id}
            onClick={() => handleSelect(preset.id)}
            className={`flex flex-col items-start px-4 py-3 rounded-lg border text-left
              transition-colors text-sm
              ${
                currentId === preset.id
                  ? 'border-green-500 bg-green-900/20 text-green-300'
                  : 'border-gray-600 bg-gray-800 hover:border-gray-500 text-gray-300 hover:text-white'
              }`}
          >
            <span className="font-semibold">{preset.name}</span>
            <span className="text-xs text-gray-500 mt-0.5">
              {playLevels} levels · {duration}
            </span>
          </button>
        );
      })}
    </div>
  );
}
