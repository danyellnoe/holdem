import { useTournamentStore } from '../../store/tournamentStore';
import { formatCurrency } from '../../lib/payoutCalculator';

export function PrizePoolSummary() {
  const snapshot = useTournamentStore((s) => s.tournament?.prizeSnapshot);
  const config = useTournamentStore((s) => s.tournament?.prizeConfig);

  if (!snapshot || !config) return null;

  const rows = [
    { label: 'Buy-ins', count: snapshot.totalBuyIns, amount: snapshot.totalBuyIns * config.buyInAmount },
    { label: 'Rebuys', count: snapshot.totalRebuys, amount: snapshot.totalRebuys * config.rebuyAmount },
    { label: 'Add-ons', count: snapshot.totalAddOns, amount: snapshot.totalAddOns * config.addOnAmount },
  ];

  return (
    <div className="rounded-xl bg-gray-800/60 border border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-700">
        <h2 className="font-semibold text-white">Prize Pool</h2>
      </div>
      <div className="p-4 space-y-3">
        {/* Breakdown */}
        <div className="space-y-1.5">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between text-sm">
              <span className="text-gray-400">
                {row.label}
                {row.count > 0 && (
                  <span className="text-gray-600 ml-1">×{row.count}</span>
                )}
              </span>
              <span className="font-mono text-gray-300">{formatCurrency(row.amount)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-700 pt-3 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Gross Pool</span>
            <span className="font-mono text-gray-300">{formatCurrency(snapshot.grossPool)}</span>
          </div>
          {snapshot.rake > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">
                Rake ({config.rakeType === 'percent' ? `${config.rakeValue}%` : 'flat'})
              </span>
              <span className="font-mono text-red-400">−{formatCurrency(snapshot.rake)}</span>
            </div>
          )}
          {config.guaranteedPool > snapshot.grossPool - snapshot.rake && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Guarantee overlay</span>
              <span className="font-mono text-green-400">
                +{formatCurrency(config.guaranteedPool - (snapshot.grossPool - snapshot.rake))}
              </span>
            </div>
          )}
        </div>

        {/* Net total */}
        <div className="border-t border-gray-600 pt-3">
          <div className="flex justify-between items-baseline">
            <span className="text-white font-semibold">Net Prize Pool</span>
            <span className="font-mono text-2xl font-bold text-green-400">
              {formatCurrency(snapshot.netPool)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{snapshot.playerCount} players</p>
        </div>
      </div>
    </div>
  );
}
