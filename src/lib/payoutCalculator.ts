import { PayoutSpot, PayoutStructure } from '../types/prize';

// Number of positions paid based on field size
const POSITIONS_PAID_TABLE: [number, number, number][] = [
  // [minPlayers, maxPlayers, spots]
  [2, 9, 1],
  [10, 19, 2],
  [20, 27, 3],
  [28, 36, 4],
  [37, 49, 5],
  [50, 74, 7],
  [75, 99, 9],
  [100, 149, 12],
  [150, 199, 15],
  [200, 299, 20],
  [300, 499, 27],
  [500, 999, 36],
  [1000, 9999, 54],
];

// Percentage distributions for common spots-paid counts.
// Must sum to 100.
const PAYOUT_DISTRIBUTIONS: Record<number, number[]> = {
  1: [100],
  2: [65, 35],
  3: [50, 30, 20],
  4: [45, 26, 17, 12],
  5: [40, 24, 16, 11, 9],
  6: [37, 22, 15, 11, 9, 6],
  7: [35, 21, 14, 10, 8, 7, 5],
  9: [32, 19, 13, 9, 7, 6, 5, 5, 4],
  12: [28, 17, 12, 9, 7, 6, 5, 4, 3.5, 3, 2.5, 2],
  15: [
    25, 15, 11, 8, 6.5, 5.5, 4.5, 4, 3.5, 3, 2.5, 2.5, 2, 1.5, 1.5,
  ],
  20: [
    22, 13, 9.5, 7, 5.5, 4.5, 4, 3.5, 3, 2.5, 2, 2, 1.8, 1.6, 1.4, 1.3,
    1.2, 1.1, 1, 1,
  ],
  27: [
    20, 12, 8.5, 6.5, 5, 4, 3.5, 3, 2.5, 2.2, 2, 1.8, 1.6, 1.5, 1.4, 1.3,
    1.2, 1.1, 1, 1, 0.9, 0.9, 0.8, 0.8, 0.7, 0.7, 0.6,
  ],
  36: Array.from({ length: 36 }, (_, i) => {
    const base = [18, 11, 7.5, 5.5, 4.5, 3.5, 3, 2.5, 2.2, 2];
    return i < base.length ? base[i] : 1.5;
  }),
};

function getPositionsPaid(playerCount: number): number {
  for (const [min, max, spots] of POSITIONS_PAID_TABLE) {
    if (playerCount >= min && playerCount <= max) return spots;
  }
  return 1;
}

function getClosestDistribution(spots: number): number[] {
  if (PAYOUT_DISTRIBUTIONS[spots]) {
    return PAYOUT_DISTRIBUTIONS[spots];
  }
  // Find the nearest available distribution
  const keys = Object.keys(PAYOUT_DISTRIBUTIONS).map(Number).sort((a, b) => a - b);
  let closest = keys[0];
  for (const k of keys) {
    if (k <= spots) closest = k;
  }
  const base = PAYOUT_DISTRIBUTIONS[closest];
  // Pad with equal shares of remaining if spots > base length
  if (spots <= base.length) {
    return base.slice(0, spots);
  }
  const lastVal = base[base.length - 1] / 2;
  const extra = spots - base.length;
  return [...base, ...Array(extra).fill(lastVal)];
}

function normalizeToSum100(percentages: number[]): number[] {
  const sum = percentages.reduce((a, b) => a + b, 0);
  return percentages.map((p) => (p / sum) * 100);
}

/**
 * Calculate payouts for a tournament.
 *
 * @param netPool    The net prize pool after rake (dollars)
 * @param playerCount Total number of entrants
 * @param customSpots Override the auto-calculated number of positions paid
 * @returns PayoutStructure
 */
export function calculatePayouts(
  netPool: number,
  playerCount: number,
  customSpots?: number
): PayoutStructure {
  if (netPool <= 0 || playerCount <= 0) {
    return { spots: [], totalPositionsPaid: 0, customSpots: false };
  }

  const spots = customSpots ?? getPositionsPaid(playerCount);
  const actualSpots = Math.min(spots, playerCount);

  let percentages = getClosestDistribution(actualSpots);
  percentages = normalizeToSum100(percentages.slice(0, actualSpots));

  // Calculate raw dollar amounts
  const rawAmounts = percentages.map((p) => (p / 100) * netPool);

  // Round to nearest $5 (or $1 for small pools)
  const roundTo = netPool < 200 ? 1 : netPool < 1000 ? 5 : 5;
  const roundedAmounts = rawAmounts.map((a) => Math.round(a / roundTo) * roundTo);

  // Fix rounding errors — add/subtract from top position
  const roundedSum = roundedAmounts.reduce((a, b) => a + b, 0);
  const diff = netPool - roundedSum;
  if (roundedAmounts.length > 0) {
    roundedAmounts[0] = Math.round((roundedAmounts[0] + diff) / roundTo) * roundTo;
  }

  const payoutSpots: PayoutSpot[] = roundedAmounts.map((amount, i) => ({
    position: i + 1,
    percentage: Math.round(percentages[i] * 10) / 10,
    amount,
  }));

  return {
    spots: payoutSpots,
    totalPositionsPaid: actualSpots,
    customSpots: !!customSpots,
  };
}

export function getRecommendedSpots(playerCount: number): number {
  return getPositionsPaid(playerCount);
}

export function formatCurrency(amount: number): string {
  if (amount >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
