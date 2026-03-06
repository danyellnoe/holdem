import { useTournamentStore } from '../store/tournamentStore';
import { TableCard } from '../components/tables/TableCard';

export function TablesPage() {
  const tournament = useTournamentStore((s) => s.tournament);
  const { addTable, autoBalanceTables } = useTournamentStore();

  if (!tournament) {
    return <div className="p-6 text-gray-500">No tournament loaded.</div>;
  }

  const unseatedCount = tournament.players.filter(
    (p) => p.status === 'active' && (!p.tableId || !p.seatNumber)
  ).length;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Tables & Seating</h1>
          <p className="text-gray-400 text-sm mt-1">
            {tournament.tables.length} table{tournament.tables.length !== 1 ? 's' : ''}
            {unseatedCount > 0 && (
              <span className="ml-2 text-yellow-400">{unseatedCount} unseated</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tournament.players.filter((p) => p.status === 'active').length > 0 && (
            <button
              onClick={autoBalanceTables}
              className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white
                text-sm font-semibold transition-colors"
            >
              Auto-balance
            </button>
          )}
          <button
            onClick={addTable}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white
              text-sm font-semibold transition-colors"
          >
            + Add Table
          </button>
        </div>
      </div>

      {tournament.tables.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-4xl mb-4">🃏</div>
          <p className="text-lg font-semibold text-gray-400">No tables yet</p>
          <p className="text-sm mt-1">Click "Add Table" to create your first table.</p>
          <button
            onClick={addTable}
            className="mt-4 px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500
              text-white font-semibold transition-colors"
          >
            Add Table
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tournament.tables.map((table) => (
            <TableCard key={table.id} table={table} />
          ))}
        </div>
      )}
    </div>
  );
}
