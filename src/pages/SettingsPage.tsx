import { TournamentSettingsForm } from '../components/settings/TournamentSettings';
import { AudioSettings } from '../components/settings/AudioSettings';
import { SavedTournaments } from '../components/settings/SavedTournaments';

export function SettingsPage() {
  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      <TournamentSettingsForm />
      <AudioSettings />
      <SavedTournaments />
    </div>
  );
}
