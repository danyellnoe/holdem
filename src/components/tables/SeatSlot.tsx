import { Player } from '../../types/player';

interface SeatSlotProps {
  seatNumber: number;
  player: Player | null;
  isActive: boolean;
  onClick: () => void;
}

export function SeatSlot({ seatNumber, player, isActive, onClick }: SeatSlotProps) {
  if (!isActive) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 rounded-full border border-dashed border-gray-700
          flex items-center justify-center opacity-30">
          <span className="text-xs text-gray-600">{seatNumber}</span>
        </div>
      </div>
    );
  }

  const isEmpty = !player;
  const isEliminated = player?.status === 'eliminated';

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 group`}
    >
      <div
        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center
          transition-all text-xs font-bold
          ${
            isEmpty
              ? 'border-dashed border-gray-600 hover:border-gray-400 text-gray-600'
              : isEliminated
              ? 'border-red-800 bg-red-900/20 text-red-500'
              : 'border-green-700 bg-green-900/30 text-green-300 hover:border-green-500'
          }`}
      >
        {isEmpty ? (
          <span className="text-gray-600 group-hover:text-gray-400">{seatNumber}</span>
        ) : (
          <span>{player!.name.charAt(0).toUpperCase()}</span>
        )}
      </div>
      {player && !isEmpty && (
        <span
          className={`text-xs truncate max-w-[3rem] text-center leading-tight
            ${isEliminated ? 'text-red-500/60 line-through' : 'text-gray-300'}`}
        >
          {player.name.split(' ')[0]}
        </span>
      )}
      {isEmpty && (
        <span className="text-xs text-gray-600 group-hover:text-gray-400">Empty</span>
      )}
    </button>
  );
}
