import { useTournamentStore } from '../../store/tournamentStore';

interface PlayerAssignModalProps {
  tableId: string;
  seatNumber: number;
  currentPlayerId: string | null;
  onClose: () => void;
}

export function PlayerAssignModal({
  tableId,
  seatNumber,
  currentPlayerId,
  onClose,
}: PlayerAssignModalProps) {
  const tournament = useTournamentStore((s) => s.tournament);
  const { assignPlayerToSeat, removePlayerFromSeat } = useTournamentStore();

  if (!tournament) return null;

  const unseatedPlayers = tournament.players.filter(
    (p) => p.status === 'active' && (!p.tableId || !p.seatNumber)
  );
  const currentPlayer = tournament.players.find((p) => p.id === currentPlayerId);

  const handleAssign = (playerId: string) => {
    assignPlayerToSeat(playerId, tableId, seatNumber);
    onClose();
  };

  const handleClear = () => {
    if (currentPlayerId) removePlayerFromSeat(currentPlayerId);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-white">
            Seat {seatNumber}
            {currentPlayer && (
              <span className="text-gray-400 font-normal ml-2">— {currentPlayer.name}</span>
            )}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-3 space-y-1 max-h-64 overflow-y-auto">
          {currentPlayer && (
            <button
              onClick={handleClear}
              className="w-full text-left px-3 py-2 rounded-lg bg-red-900/20 hover:bg-red-900/40
                text-red-300 text-sm transition-colors"
            >
              Clear seat (remove {currentPlayer.name})
            </button>
          )}
          {unseatedPlayers.length === 0 && !currentPlayer && (
            <p className="text-gray-500 text-sm text-center py-4">
              No unseated players available.
            </p>
          )}
          {unseatedPlayers.map((player) => (
            <button
              key={player.id}
              onClick={() => handleAssign(player.id)}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-700
                text-white text-sm transition-colors flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-full bg-green-800/50 flex items-center justify-center
                text-green-300 text-xs font-bold flex-shrink-0">
                {player.name.charAt(0).toUpperCase()}
              </div>
              {player.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
