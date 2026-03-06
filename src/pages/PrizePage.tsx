import { PrizePoolSummary } from '../components/prize/PrizePoolSummary';
import { RakeConfig } from '../components/prize/RakeConfig';
import { PayoutTable } from '../components/prize/PayoutTable';
import { BuyInTracker } from '../components/prize/BuyInTracker';

export function PrizePage() {
  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white">Prize Pool & Payouts</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <RakeConfig />
          <PrizePoolSummary />
        </div>
        <div className="space-y-6">
          <PayoutTable />
          <BuyInTracker />
        </div>
      </div>
    </div>
  );
}
