import { useState, useEffect } from 'react';
import { BlindLevel } from '../../types/blind';

interface BlindLevelFormProps {
  level: BlindLevel;
  onChange: (changes: Partial<BlindLevel>) => void;
  onDelete: () => void;
  onAddAfter: (isBreak: boolean) => void;
}

export function BlindLevelForm({ level, onChange, onDelete, onAddAfter }: BlindLevelFormProps) {
  const [localSmall, setLocalSmall] = useState(String(level.smallBlind));
  const [localBig, setLocalBig] = useState(String(level.bigBlind));
  const [localAnte, setLocalAnte] = useState(String(level.ante));
  const [localDuration, setLocalDuration] = useState(String(level.durationMinutes));

  useEffect(() => {
    setLocalSmall(String(level.smallBlind));
    setLocalBig(String(level.bigBlind));
    setLocalAnte(String(level.ante));
    setLocalDuration(String(level.durationMinutes));
  }, [level.id]);

  const commit = (field: keyof BlindLevel, rawVal: string) => {
    const num = parseInt(rawVal, 10);
    if (!isNaN(num) && num >= 0) {
      onChange({ [field]: num });
    }
  };

  const isBreak = level.type === 'break';

  return (
    <div
      className={`group flex items-center gap-2 px-3 py-2 rounded-lg border text-sm
        ${isBreak ? 'border-blue-800/40 bg-blue-950/20' : 'border-gray-700/60 bg-gray-800/40'}
        hover:border-gray-600 transition-colors`}
    >
      {/* Level indicator */}
      <div className="w-8 text-center flex-shrink-0">
        {isBreak ? (
          <span className="text-blue-400 text-xs font-bold">BRK</span>
        ) : (
          <span className="text-gray-500 text-xs font-mono">{level.levelNumber}</span>
        )}
      </div>

      {isBreak ? (
        /* Break row */
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={level.breakLabel ?? 'Break'}
            onChange={(e) => onChange({ breakLabel: e.target.value })}
            className="flex-1 bg-transparent text-blue-300 text-sm outline-none
              border-b border-transparent focus:border-blue-600 min-w-0"
            placeholder="Break label"
          />
          <span className="text-gray-600 text-xs">for</span>
          <input
            type="number"
            value={localDuration}
            min={1}
            max={120}
            onChange={(e) => setLocalDuration(e.target.value)}
            onBlur={() => commit('durationMinutes', localDuration)}
            className="w-12 bg-gray-700 rounded px-2 py-0.5 text-white text-center
              text-xs outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-gray-600 text-xs">min</span>
        </div>
      ) : (
        /* Play level row */
        <div className="flex-1 flex items-center gap-1 flex-wrap">
          <input
            type="number"
            value={localSmall}
            min={0}
            onChange={(e) => setLocalSmall(e.target.value)}
            onBlur={() => commit('smallBlind', localSmall)}
            className="w-20 bg-gray-700 rounded px-2 py-0.5 text-white text-center
              text-xs outline-none focus:ring-1 focus:ring-green-500"
            placeholder="SB"
          />
          <span className="text-gray-600">/</span>
          <input
            type="number"
            value={localBig}
            min={0}
            onChange={(e) => setLocalBig(e.target.value)}
            onBlur={() => commit('bigBlind', localBig)}
            className="w-20 bg-gray-700 rounded px-2 py-0.5 text-white text-center
              text-xs outline-none focus:ring-1 focus:ring-green-500"
            placeholder="BB"
          />
          <span className="text-gray-600 text-xs">/</span>
          <input
            type="number"
            value={localAnte}
            min={0}
            onChange={(e) => setLocalAnte(e.target.value)}
            onBlur={() => commit('ante', localAnte)}
            className="w-20 bg-gray-700 rounded px-2 py-0.5 text-white text-center
              text-xs outline-none focus:ring-1 focus:ring-green-500"
            placeholder="Ante"
          />
          <label className="flex items-center gap-1 ml-1 text-xs text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={level.bigBlindAnte}
              onChange={(e) => onChange({ bigBlindAnte: e.target.checked })}
              className="accent-green-500"
            />
            BBA
          </label>
          <span className="text-gray-600 text-xs ml-1">·</span>
          <input
            type="number"
            value={localDuration}
            min={1}
            max={120}
            onChange={(e) => setLocalDuration(e.target.value)}
            onBlur={() => commit('durationMinutes', localDuration)}
            className="w-12 bg-gray-700 rounded px-2 py-0.5 text-white text-center
              text-xs outline-none focus:ring-1 focus:ring-green-500"
          />
          <span className="text-gray-500 text-xs">min</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => onAddAfter(false)}
          className="p-1 rounded text-gray-500 hover:text-green-400 transition-colors"
          title="Add play level after"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={() => onAddAfter(true)}
          className="p-1 rounded text-gray-500 hover:text-blue-400 transition-colors"
          title="Add break after"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="p-1 rounded text-gray-600 hover:text-red-400 transition-colors"
          title="Delete level"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
