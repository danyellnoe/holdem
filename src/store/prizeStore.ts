// Prize state is managed within tournamentStore to keep it co-located with
// player data (since buy-ins and rebuys are per-player). This file re-exports
// the prize-related selectors for convenient use in prize components.

import { useTournamentStore } from './tournamentStore';

export function usePrizeConfig() {
  return useTournamentStore((s) => s.tournament?.prizeConfig);
}

export function usePrizeSnapshot() {
  return useTournamentStore((s) => s.tournament?.prizeSnapshot);
}

export function usePayoutStructure() {
  return useTournamentStore((s) => s.tournament?.payoutStructure);
}
