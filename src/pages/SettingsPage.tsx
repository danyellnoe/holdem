import { TournamentSettingsForm } from '../components/settings/TournamentSettings';
import { AudioSettings } from '../components/settings/AudioSettings';
import { SavedTournaments } from '../components/settings/SavedTournaments';
import { useTournamentStore } from '../store/tournamentStore';
import { BLIND_PRESETS } from '../lib/blindPresets';

export function SettingsPage() {
  const { createTournament } = useTournamentStore();

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      {/* New tournament quick-start */}
      <div className="rounded-xl bg-gray-800/60 border border-gray-700 p-4 space-y-3">
        <h2 className="font-semibold text-white">Quick Start</h2>
        <p className="text-sm text-gray-400">Create a new tournament with a preset structure.</p>
        <div className="flex flex-wrap gap-2">
          {BLIND_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => createTournament({}, preset.id)}
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white
                text-sm transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => createTournament({})}
          className="w-full py-2 rounded-lg bg-green-700 hover:bg-green-600 text-white
            font-semibold text-sm transition-colors"
        >
          New Blank Tournament
        </button>
      </div>

      <TournamentSettingsForm />
      <AudioSettings />
      <SavedTournaments />
    </div>
  );
}
