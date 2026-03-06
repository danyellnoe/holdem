import { useTournamentStore } from '../../store/tournamentStore';
import { TournamentSettings as TSettings } from '../../types/tournament';

export function TournamentSettingsForm() {
  const tournament = useTournamentStore((s) => s.tournament);
  const { createTournament } = useTournamentStore();

  if (!tournament) {
    return (
      <div className="rounded-xl bg-gray-800/60 border border-gray-700 p-4 space-y-4">
        <h2 className="font-semibold text-white">New Tournament</h2>
        <button
          onClick={() => createTournament({})}
          className="w-full py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white
            font-bold transition-colors"
        >
          Create Tournament
        </button>
      </div>
    );
  }

  const settings = tournament.settings;

  const update = (changes: Partial<TSettings>) => {
    // Update the tournament settings via the store
    useTournamentStore.setState((s) => ({
      tournament: s.tournament
        ? { ...s.tournament, settings: { ...s.tournament.settings, ...changes } }
        : null,
    }));
  };

  return (
    <div className="rounded-xl bg-gray-800/60 border border-gray-700 p-4 space-y-4">
      <h2 className="font-semibold text-white">Tournament Settings</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">
            Tournament Name
          </label>
          <input
            type="text"
            value={settings.name}
            onChange={(e) => update({ name: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2
              text-white text-sm outline-none focus:border-green-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">
            Date
          </label>
          <input
            type="date"
            value={settings.date}
            onChange={(e) => update({ date: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2
              text-white text-sm outline-none focus:border-green-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">
            Starting Stack
          </label>
          <input
            type="number"
            min={100}
            value={settings.startingStack}
            onChange={(e) => update({ startingStack: Number(e.target.value) })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2
              text-white text-sm outline-none focus:border-green-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">
            Players Per Table
          </label>
          <select
            value={settings.playersPerTable}
            onChange={(e) => update({ playersPerTable: Number(e.target.value) })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2
              text-white text-sm outline-none focus:border-green-500"
          >
            <option value={8}>8</option>
            <option value={9}>9</option>
            <option value={10}>10</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">
            Late Reg Closes (after level)
          </label>
          <input
            type="number"
            min={0}
            value={settings.lateRegLevels}
            onChange={(e) => update({ lateRegLevels: Number(e.target.value) })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2
              text-white text-sm outline-none focus:border-green-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">
            Rebuys Until (level)
          </label>
          <input
            type="number"
            min={0}
            value={settings.rebuyLevels}
            onChange={(e) => update({ rebuyLevels: Number(e.target.value) })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2
              text-white text-sm outline-none focus:border-green-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">
            Max Rebuys (0 = unlimited)
          </label>
          <input
            type="number"
            min={0}
            value={settings.maxRebuys}
            onChange={(e) => update({ maxRebuys: Number(e.target.value) })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2
              text-white text-sm outline-none focus:border-green-500"
          />
        </div>
      </div>
    </div>
  );
}
