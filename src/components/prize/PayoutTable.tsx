import { useState } from 'react';
import { useTournamentStore } from '../../store/tournamentStore';
import { formatCurrency, getRecommendedSpots } from '../../lib/payoutCalculator';

export function PayoutTable() {
  const tournament = useTournamentStore((s) => s.tournament);
  const { recalculatePayouts } = useTournamentStore();
  const [customSpots, setCustomSpots] = useState('');

  if (!tournament) return null;

  const { prizeSnapshot, payoutStructure } = tournament;
  const recommended = getRecommendedSpots(prizeSnapshot.playerCount);

  const handleCustomSpots = () => {
    const n = parseInt(customSpots, 10);
    if (!isNaN(n) && n >= 1 && n <= prizeSnapshot.playerCount) {
      recalculatePayouts(n);
    }
  };

  const handleReset = () => {
    setCustomSpots('');
    recalculatePayouts(undefined);
  };

  if (prizeSnapshot.netPool === 0) {
    return (
      <div className="rounded-xl bg-gray-800/60 border border-gray-700 p-6 text-center text-gray-500 text-sm">
        Add players to calculate payouts.
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-gray-800/60 border border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-white">Payouts</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {payoutStructure.totalPositionsPaid} position{payoutStructure.totalPositionsPaid !== 1 ? 's' : ''} paid
            {!payoutStructure.customSpots && (
              <span className="ml-1 text-gray-600">(auto)</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={prizeSnapshot.playerCount || 100}
            value={customSpots}
            onChange={(e) => setCustomSpots(e.target.value)}
            placeholder={String(recommended)}
            className="w-16 bg-gray-700 border border-gray-600 rounded px-2 py-1
              text-white text-xs outline-none focus:border-green-500"
          />
          <button
            onClick={handleCustomSpots}
            className="px-3 py-1 rounded bg-green-700 hover:bg-green-600 text-white
              text-xs transition-colors"
          >
            Set
          </button>
          {payoutStructure.customSpots && (
            <button
              onClick={handleReset}
              className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300
                text-xs transition-colors"
            >
              Auto
            </button>
          )}
        </div>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-800/80">
          <tr className="text-gray-500 text-xs uppercase tracking-wide">
            <th className="text-left font-medium py-2 px-4">Place</th>
            <th className="text-right font-medium py-2 px-4">%</th>
            <th className="text-right font-medium py-2 px-4">Payout</th>
          </tr>
        </thead>
        <tbody>
          {payoutStructure.spots.map((spot) => (
            <tr
              key={spot.position}
              className={`border-t border-gray-700/50 ${
                spot.position === 1
                  ? 'text-yellow-400'
                  : spot.position === 2
                  ? 'text-gray-300'
                  : spot.position === 3
                  ? 'text-orange-400'
                  : 'text-gray-400'
              }`}
            >
              <td className="py-2 px-4 font-semibold">
                {spot.position === 1 ? '🥇' : spot.position === 2 ? '🥈' : spot.position === 3 ? '🥉' : `${spot.position}th`}
              </td>
              <td className="py-2 px-4 text-right font-mono text-xs text-gray-500">
                {spot.percentage.toFixed(1)}%
              </td>
              <td className="py-2 px-4 text-right font-mono font-semibold">
                {formatCurrency(spot.amount)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t border-gray-600">
          <tr>
            <td className="py-2 px-4 text-gray-500 text-xs" colSpan={2}>Total</td>
            <td className="py-2 px-4 text-right font-mono font-bold text-green-400">
              {formatCurrency(payoutStructure.spots.reduce((s, p) => s + p.amount, 0))}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
