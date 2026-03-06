import { useSettingsStore, AlertSoundId } from '../../store/settingsStore';
import { useAudio } from '../../hooks/useAudio';

const SOUNDS: { id: AlertSoundId; label: string }[] = [
  { id: 'bell', label: 'Bell' },
  { id: 'horn', label: 'Air Horn' },
  { id: 'chime', label: 'Chime' },
  { id: 'buzzer', label: 'Buzzer' },
];

export function AudioSettings() {
  const {
    alertSoundId,
    volume,
    oneMinuteWarningEnabled,
    visualFlashEnabled,
    setAlertSoundId,
    setVolume,
    setOneMinuteWarningEnabled,
    setVisualFlashEnabled,
  } = useSettingsStore();
  const { previewSound } = useAudio();

  return (
    <div className="rounded-xl bg-gray-800/60 border border-gray-700 p-4 space-y-4">
      <h2 className="font-semibold text-white">Audio & Alerts</h2>

      {/* Sound picker */}
      <div className="space-y-2">
        <label className="text-xs text-gray-400 uppercase tracking-wide block">
          Alert Sound
        </label>
        <div className="flex flex-wrap gap-2">
          {SOUNDS.map((sound) => (
            <button
              key={sound.id}
              onClick={() => {
                setAlertSoundId(sound.id);
                previewSound(sound.id);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors
                ${
                  alertSoundId === sound.id
                    ? 'border-green-500 bg-green-900/20 text-green-300'
                    : 'border-gray-600 bg-gray-800 hover:border-gray-500 text-gray-300'
                }`}
            >
              {sound.label}
              {alertSoundId === sound.id && (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              )}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500">Click a sound to preview it.</p>
      </div>

      {/* Volume */}
      <div className="space-y-1">
        <label className="text-xs text-gray-400 uppercase tracking-wide flex justify-between">
          <span>Volume</span>
          <span>{Math.round(volume * 100)}%</span>
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full accent-green-500"
        />
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-gray-300">1-minute warning</span>
          <button
            onClick={() => setOneMinuteWarningEnabled(!oneMinuteWarningEnabled)}
            className={`w-10 h-6 rounded-full transition-colors relative
              ${oneMinuteWarningEnabled ? 'bg-green-600' : 'bg-gray-600'}`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
                ${oneMinuteWarningEnabled ? 'translate-x-5' : 'translate-x-1'}`}
            />
          </button>
        </label>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-gray-300">Visual flash on alert</span>
          <button
            onClick={() => setVisualFlashEnabled(!visualFlashEnabled)}
            className={`w-10 h-6 rounded-full transition-colors relative
              ${visualFlashEnabled ? 'bg-green-600' : 'bg-gray-600'}`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
                ${visualFlashEnabled ? 'translate-x-5' : 'translate-x-1'}`}
            />
          </button>
        </label>
      </div>
    </div>
  );
}
