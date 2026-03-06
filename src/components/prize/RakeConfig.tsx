import { useTournamentStore } from '../../store/tournamentStore';

export function RakeConfig() {
  const config = useTournamentStore((s) => s.tournament?.prizeConfig);
  const { updatePrizeConfig } = useTournamentStore();

  if (!config) return null;

  return (
    <div className="rounded-xl bg-gray-800/60 border border-gray-700 p-4 space-y-4">
      <h2 className="font-semibold text-white">Buy-in Configuration</h2>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">
            Buy-in Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              min={0}
              value={config.buyInAmount}
              onChange={(e) => updatePrizeConfig({ buyInAmount: Number(e.target.value) })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-7 pr-3 py-2
                text-white text-sm outline-none focus:border-green-500"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">
            Rebuy Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              min={0}
              value={config.rebuyAmount}
              onChange={(e) => updatePrizeConfig({ rebuyAmount: Number(e.target.value) })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-7 pr-3 py-2
                text-white text-sm outline-none focus:border-green-500"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">
            Add-on Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              min={0}
              value={config.addOnAmount}
              onChange={(e) => updatePrizeConfig({ addOnAmount: Number(e.target.value) })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-7 pr-3 py-2
                text-white text-sm outline-none focus:border-green-500"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">
            Rake Type
          </label>
          <select
            value={config.rakeType}
            onChange={(e) =>
              updatePrizeConfig({ rakeType: e.target.value as 'percent' | 'flat' })
            }
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2
              text-white text-sm outline-none focus:border-green-500"
          >
            <option value="flat">Flat ($)</option>
            <option value="percent">Percent (%)</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">
            Rake Value
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {config.rakeType === 'percent' ? '%' : '$'}
            </span>
            <input
              type="number"
              min={0}
              max={config.rakeType === 'percent' ? 100 : undefined}
              value={config.rakeValue}
              onChange={(e) => updatePrizeConfig({ rakeValue: Number(e.target.value) })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-7 pr-3 py-2
                text-white text-sm outline-none focus:border-green-500"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide block mb-1">
            Guarantee
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              min={0}
              value={config.guaranteedPool}
              onChange={(e) => updatePrizeConfig({ guaranteedPool: Number(e.target.value) })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-7 pr-3 py-2
                text-white text-sm outline-none focus:border-green-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
