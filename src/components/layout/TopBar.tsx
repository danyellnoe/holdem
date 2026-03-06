import { useState } from 'react';
import { useTournamentStore } from '../../store/tournamentStore';
import { useTimerStore } from '../../store/timerStore';
import { RemoteQRCode } from '../remote/RemoteQRCode';

export function TopBar() {
  const tournament = useTournamentStore((s) => s.tournament);
  const saveIndicator = useTournamentStore((s) => s.saveIndicator);
  const { status } = useTimerStore();
  const [showQR, setShowQR] = useState(false);

  const statusLabel =
    status === 'running'
      ? 'Running'
      : status === 'paused'
      ? 'Paused'
      : status === 'on_break'
      ? 'On Break'
      : status === 'complete'
      ? 'Complete'
      : 'Setup';

  const statusColor =
    status === 'running'
      ? 'text-green-400 bg-green-900/30 border-green-800'
      : status === 'paused'
      ? 'text-yellow-400 bg-yellow-900/20 border-yellow-800'
      : status === 'on_break'
      ? 'text-blue-400 bg-blue-900/20 border-blue-800'
      : status === 'complete'
      ? 'text-gray-400 bg-gray-800 border-gray-700'
      : 'text-gray-500 bg-gray-800/50 border-gray-700';

  return (
    <header className="h-12 bg-gray-900 border-b border-gray-800 flex items-center
      px-4 gap-3 flex-shrink-0">
      {/* Tournament name */}
      <div className="flex-1 min-w-0">
        <span className="text-white font-semibold text-sm truncate">
          {tournament?.settings.name ?? 'No tournament loaded'}
        </span>
      </div>

      {/* Status pill */}
      <div className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold
        flex-shrink-0 ${statusColor}`}>
        {statusLabel}
      </div>

      {/* Save indicator */}
      {saveIndicator && (
        <div className="flex items-center gap-1 text-xs text-green-400 animate-fade-in
          flex-shrink-0">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
          Saved
        </div>
      )}

      {/* QR code button */}
      <div className="relative">
        <button
          onClick={() => setShowQR(!showQR)}
          className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-700
            transition-colors"
          title="Remote timer QR code"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </button>
        {showQR && (
          <div className="absolute right-0 top-full mt-2 z-50 bg-gray-800 border border-gray-700
            rounded-xl shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
              <span className="text-sm font-semibold text-white">Remote Timer</span>
              <button
                onClick={() => setShowQR(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <RemoteQRCode />
          </div>
        )}
      </div>
    </header>
  );
}
