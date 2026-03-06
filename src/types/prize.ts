export interface PrizeConfig {
  buyInAmount: number;
  rebuyAmount: number;
  addOnAmount: number;
  rakeType: 'percent' | 'flat';
  rakeValue: number;             // percent 0-100 or flat dollar amount
  guaranteedPool: number;        // 0 = no guarantee
}

export interface PrizePoolSnapshot {
  totalBuyIns: number;           // count of buy-ins
  totalRebuys: number;           // count of rebuys
  totalAddOns: number;           // count of add-ons
  grossPool: number;             // total dollars collected
  rake: number;                  // rake amount in dollars
  netPool: number;               // grossPool - rake (or guaranteed, whichever is higher)
  playerCount: number;
}

export interface PayoutSpot {
  position: number;
  percentage: number;
  amount: number;
}

export interface PayoutStructure {
  spots: PayoutSpot[];
  totalPositionsPaid: number;
  customSpots: boolean;          // true if user overrode the auto-calculated count
}
