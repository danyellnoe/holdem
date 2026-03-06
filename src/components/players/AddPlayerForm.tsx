import { useState, useRef } from 'react';
import { useTournamentStore } from '../../store/tournamentStore';

export function AddPlayerForm() {
  const [name, setName] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { addPlayer, importPlayers } = useTournamentStore();

  const handleAdd = () => {
    if (!name.trim()) return;
    addPlayer(name.trim());
    setName('');
    inputRef.current?.focus();
  };

  const handleBulkImport = () => {
    const names = bulkText
      .split('\n')
      .map((n) => n.trim())
      .filter(Boolean);
    if (names.length > 0) {
      importPlayers(names);
      setBulkText('');
      setBulkMode(false);
    }
  };

  return (
    <div className="rounded-xl bg-gray-800/60 border border-gray-700 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white">Add Players</h2>
        <button
          onClick={() => setBulkMode(!bulkMode)}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          {bulkMode ? 'Single' : 'Bulk import'}
        </button>
      </div>

      {!bulkMode ? (
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Player name..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2
              text-white text-sm outline-none focus:border-green-500 placeholder-gray-500"
          />
          <button
            onClick={handleAdd}
            disabled={!name.trim()}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-40
              disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
          >
            Add
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="One player name per line..."
            rows={6}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2
              text-white text-sm outline-none focus:border-green-500 placeholder-gray-500 resize-none"
          />
          <button
            onClick={handleBulkImport}
            disabled={!bulkText.trim()}
            className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-40
              disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
          >
            Import {bulkText.split('\n').filter((l) => l.trim()).length} Players
          </button>
        </div>
      )}
    </div>
  );
}
