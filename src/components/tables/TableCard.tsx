import { useState } from 'react';
import { Table } from '../../types/table';
import { SeatSlot } from './SeatSlot';
import { PlayerAssignModal } from './PlayerAssignModal';
import { useTournamentStore } from '../../store/tournamentStore';

interface TableCardProps {
  table: Table;
}

export function TableCard({ table }: TableCardProps) {
  const tournament = useTournamentStore((s) => s.tournament);
  const { removeTable, renameTable } = useTournamentStore();
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(table.name);

  const occupiedCount = table.seats.filter((s) => s.playerId).length;

  const commitName = () => {
    if (nameInput.trim() && nameInput !== table.name) {
      renameTable(table.id, nameInput.trim());
    }
    setEditingName(false);
  };

  return (
    <div className="rounded-xl bg-gray-800/60 border border-gray-700 overflow-hidden">
      {/* Table header */}
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          {editingName ? (
            <input
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={commitName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitName();
                if (e.key === 'Escape') setEditingName(false);
              }}
              className="bg-gray-700 rounded px-2 py-0.5 text-white text-sm outline-none
                focus:ring-1 focus:ring-green-500"
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="font-semibold text-white hover:text-green-300 transition-colors"
            >
              {table.name}
            </button>
          )}
          <span className="text-xs text-gray-500">
            {occupiedCount}/{table.maxSeats}
          </span>
        </div>
        <button
          onClick={() => {
            if (confirm(`Remove ${table.name}?`)) removeTable(table.id);
          }}
          className="text-gray-600 hover:text-red-400 transition-colors p-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Seat grid — oval arrangement */}
      <div className="p-4">
        <div className="flex flex-wrap justify-center gap-3">
          {table.seats.map((seat) => {
            const player = tournament?.players.find((p) => p.id === seat.playerId) ?? null;
            return (
              <SeatSlot
                key={seat.seatNumber}
                seatNumber={seat.seatNumber}
                player={player}
                isActive={seat.isActive}
                onClick={() => setSelectedSeat(seat.seatNumber)}
              />
            );
          })}
        </div>
      </div>

      {/* Seat assignment modal */}
      {selectedSeat !== null && (
        <PlayerAssignModal
          tableId={table.id}
          seatNumber={selectedSeat}
          currentPlayerId={
            table.seats.find((s) => s.seatNumber === selectedSeat)?.playerId ?? null
          }
          onClose={() => setSelectedSeat(null)}
        />
      )}
    </div>
  );
}
