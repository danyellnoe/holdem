export type PlayerStatus = 'active' | 'eliminated' | 'late_reg';

export interface Player {
  id: string;
  name: string;
  status: PlayerStatus;
  tableId: string | null;
  seatNumber: number | null;   // 1-10
  buyInCount: number;          // 1 = original buy-in, 2+ = rebuys
  addOnCount: number;
  finishPosition?: number;     // set when eliminated
  eliminatedAtLevel?: number;
  registeredAt: string;
  notes?: string;
}
