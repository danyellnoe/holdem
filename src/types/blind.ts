export type LevelType = 'play' | 'break';

export interface BlindLevel {
  id: string;
  levelNumber: number;      // 1-based play level number; breaks share previous level's number
  type: LevelType;
  durationMinutes: number;
  smallBlind: number;       // 0 during breaks
  bigBlind: number;         // 0 during breaks
  ante: number;             // 0 if no antes
  bigBlindAnte: boolean;    // true = one BBA posted by big blind position
  breakLabel?: string;      // e.g. "Dinner Break"
}

export interface BlindStructure {
  id: string;
  name: string;
  levels: BlindLevel[];
  isPreset: boolean;
  createdAt: string;
}
