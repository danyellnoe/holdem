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

export type BuyInEventType = 'rebuy' | 'addon' | 'remove_rebuy' | 'remove_addon';

export interface BuyInEvent {
  id: string;
  playerId: string;
  type: BuyInEventType;
  timestamp: string;      // ISO 8601
  levelIndex?: number;    // blind level when it happened (for context)
}
