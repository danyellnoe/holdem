import { BlindStructure } from './blind';
import { Player } from './player';
import { Table } from './table';
import { PrizeConfig, PrizePoolSnapshot, PayoutStructure } from './prize';

export type TournamentStatus =
  | 'setup'
  | 'running'
  | 'paused'
  | 'on_break'
  | 'complete';

export interface TournamentSettings {
  name: string;
  date: string;
  startingStack: number;
  lateRegLevels: number;       // late reg closes after level N (0 = no late reg)
  rebuyLevels: number;         // rebuys allowed until end of level N (0 = no rebuys)
  addOnLevel: number;          // add-on available at the end of this level (0 = no add-ons)
  maxRebuys: number;           // 0 = unlimited
  playersPerTable: number;     // default 9
}

export interface Tournament {
  id: string;
  settings: TournamentSettings;
  status: TournamentStatus;
  structure: BlindStructure;
  currentLevelIndex: number;
  players: Player[];
  tables: Table[];
  prizeConfig: PrizeConfig;
  prizeSnapshot: PrizePoolSnapshot;
  payoutStructure: PayoutStructure;
  startedAt: string | null;
  completedAt: string | null;
  lastSavedAt: string;
  version: number;
}

export interface SavedTournamentMeta {
  id: string;
  name: string;
  date: string;
  lastSavedAt: string;
  status: TournamentStatus;
  playerCount: number;
}
