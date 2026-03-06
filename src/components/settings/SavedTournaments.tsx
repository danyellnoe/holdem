import { useEffect, useState } from 'react';
import { getIndex, deleteTournament } from '../../lib/localPersistence';
import { useTournamentStore } from '../../store/tournamentStore';
import { useTimerStore } from '../../store/timerStore';
import { SavedTournamentMeta } from '../../types/tournament';

export function SavedTournaments() {
  const [saved, setSaved] = useState<SavedTournamentMeta[]>([]);
  const { loadTournamentById } = useTournamentStore();
  const { setStatus, setCurrentLevelIndex, setLevelRemainingMs } = useTimerStore();

  const refresh = () => setSaved(getIndex());

  useEffect(() => {
    refresh();
  }, []);

  const handleLoad = (id: string) => {
    loadTournamentById(id);
    // Reset timer to setup state when loading
    setStatus('setup');
    setCurrentLevelIndex(0);
    setLevelRemainingMs(0);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    deleteTournament(id);
    refresh();
  };

  if (saved.length === 0) {
    return (
      <div className="rounded-xl bg-gray-800/60 border border-gray-700 p-6 text-center">
        <p className="text-gray-500 text-sm">No saved tournaments.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gray-800/60 border border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-700">
        <h2 className="font-semibold text-white">Saved Tournaments</h2>
      </div>
      <div className="divide-y divide-gray-700/50">
        {saved.map((meta) => (
          <div
            key={meta.id}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-700/30 group"
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white text-sm truncate">{meta.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {meta.date} · {meta.playerCount} players · {meta.status}
                <span className="ml-2">
                  Saved {new Date(meta.lastSavedAt).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleLoad(meta.id)}
                className="px-3 py-1 rounded bg-green-700 hover:bg-green-600 text-white
                  text-xs transition-colors"
              >
                Load
              </button>
              <button
                onClick={() => handleDelete(meta.id, meta.name)}
                className="p-1 rounded text-gray-600 hover:text-red-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
