export interface Seat {
  seatNumber: number;       // 1-10
  playerId: string | null;
  isActive: boolean;        // false = seat closed/blocked
}

export interface Table {
  id: string;
  name: string;             // "Table 1", "Feature Table"
  maxSeats: number;         // 9 or 10
  seats: Seat[];
  isActive: boolean;
  dealerSeat?: number;
}
