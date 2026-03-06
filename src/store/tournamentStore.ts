import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Tournament, TournamentSettings, TournamentStatus } from '../types/tournament';
import { BlindLevel, BlindStructure } from '../types/blind';
import { Player, PlayerStatus } from '../types/player';
import { Table, Seat } from '../types/table';
import { PrizeConfig } from '../types/prize';
import { BLIND_PRESETS, clonePreset, renumberLevels } from '../lib/blindPresets';
import { calculatePayouts } from '../lib/payoutCalculator';
import { saveTournament, loadTournament } from '../lib/localPersistence';

interface TournamentStore {
  tournament: Tournament | null;
  saveIndicator: boolean;

  // Lifecycle
  createTournament: (settings: Partial<TournamentSettings>, presetId?: string) => void;
  loadTournamentById: (id: string) => void;
  persistTournament: () => void;

  // Tournament status
  setStatus: (status: TournamentStatus) => void;
  setCurrentLevelIndex: (index: number) => void;

  // Structure
  setBlindStructure: (structure: BlindStructure) => void;
  addBlindLevel: (afterId: string | null, isBreak?: boolean) => void;
  updateBlindLevel: (id: string, changes: Partial<BlindLevel>) => void;
  removeBlindLevel: (id: string) => void;
  reorderBlindLevels: (orderedIds: string[]) => void;

  // Players
  addPlayer: (name: string) => Player;
  removePlayer: (id: string) => void;
  updatePlayer: (id: string, changes: Partial<Player>) => void;
  eliminatePlayer: (id: string) => void;
  addRebuy: (id: string) => void;
  addAddOn: (id: string) => void;
  importPlayers: (names: string[]) => void;

  // Tables
  addTable: () => Table;
  removeTable: (id: string) => void;
  renameTable: (id: string, name: string) => void;
  assignPlayerToSeat: (playerId: string, tableId: string, seat: number) => void;
  removePlayerFromSeat: (playerId: string) => void;
  autoBalanceTables: () => void;

  // Prize
  updatePrizeConfig: (changes: Partial<PrizeConfig>) => void;
  recalculatePayouts: (customSpots?: number) => void;
}

function defaultSettings(): TournamentSettings {
  return {
    name: 'Home Game Tournament',
    date: new Date().toISOString().split('T')[0],
    startingStack: 10000,
    lateRegLevels: 4,
    rebuyLevels: 4,
    addOnLevel: 4,
    maxRebuys: 0,
    playersPerTable: 9,
  };
}

function defaultPrizeConfig(): PrizeConfig {
  return {
    buyInAmount: 50,
    rebuyAmount: 50,
    addOnAmount: 50,
    rakeType: 'flat',
    rakeValue: 0,
    guaranteedPool: 0,
  };
}

function computePrizeSnapshot(players: Player[], config: PrizeConfig) {
  const totalBuyIns = players.length;
  const totalRebuys = players.reduce((s, p) => s + Math.max(0, p.buyInCount - 1), 0);
  const totalAddOns = players.reduce((s, p) => s + p.addOnCount, 0);
  const gross =
    totalBuyIns * config.buyInAmount +
    totalRebuys * config.rebuyAmount +
    totalAddOns * config.addOnAmount;
  const rake =
    config.rakeType === 'percent'
      ? Math.round((gross * config.rakeValue) / 100)
      : config.rakeValue;
  const net = Math.max(gross - rake, config.guaranteedPool);
  return {
    totalBuyIns,
    totalRebuys,
    totalAddOns,
    grossPool: gross,
    rake,
    netPool: net,
    playerCount: players.length,
  };
}

function buildInitialTournament(
  settings: Partial<TournamentSettings>,
  presetId?: string
): Tournament {
  const mergedSettings = { ...defaultSettings(), ...settings };
  const preset = presetId
    ? BLIND_PRESETS.find((p) => p.id === presetId) ?? BLIND_PRESETS[1]
    : BLIND_PRESETS[1];
  const structure = clonePreset(preset, mergedSettings.name);
  structure.isPreset = false;

  const prizeConfig = defaultPrizeConfig();
  const prizeSnapshot = computePrizeSnapshot([], prizeConfig);
  const payoutStructure = calculatePayouts(0, 0);

  return {
    id: uuidv4(),
    settings: mergedSettings,
    status: 'setup',
    structure,
    currentLevelIndex: 0,
    players: [],
    tables: [],
    prizeConfig,
    prizeSnapshot,
    payoutStructure,
    startedAt: null,
    completedAt: null,
    lastSavedAt: new Date().toISOString(),
    version: 0,
  };
}

export const useTournamentStore = create<TournamentStore>()((set, get) => ({
  tournament: null,
  saveIndicator: false,

  createTournament: (settings, presetId) => {
    const tournament = buildInitialTournament(settings, presetId);
    set({ tournament });
    saveTournament(tournament);
  },

  loadTournamentById: (id) => {
    const t = loadTournament(id);
    if (t) set({ tournament: t });
  },

  persistTournament: () => {
    const { tournament } = get();
    if (!tournament) return;
    saveTournament(tournament);
    set({ saveIndicator: true });
    setTimeout(() => set({ saveIndicator: false }), 3000);
  },

  setStatus: (status) => {
    set((s) => {
      if (!s.tournament) return s;
      const updates: Partial<Tournament> = { status };
      if (status === 'running' && !s.tournament.startedAt) {
        updates.startedAt = new Date().toISOString();
      }
      if (status === 'complete') {
        updates.completedAt = new Date().toISOString();
      }
      return { tournament: { ...s.tournament, ...updates } };
    });
  },

  setCurrentLevelIndex: (index) => {
    set((s) => {
      if (!s.tournament) return s;
      return { tournament: { ...s.tournament, currentLevelIndex: index } };
    });
  },

  // ─── Structure ──────────────────────────────────────────────────────────────

  setBlindStructure: (structure) => {
    set((s) => {
      if (!s.tournament) return s;
      return { tournament: { ...s.tournament, structure, currentLevelIndex: 0 } };
    });
  },

  addBlindLevel: (afterId, isBreak = false) => {
    set((s) => {
      if (!s.tournament) return s;
      const levels = [...s.tournament.structure.levels];
      const newLevel: BlindLevel = {
        id: uuidv4(),
        levelNumber: 0,
        type: isBreak ? 'break' : 'play',
        durationMinutes: isBreak ? 10 : 15,
        smallBlind: 0,
        bigBlind: 0,
        ante: 0,
        bigBlindAnte: false,
        breakLabel: isBreak ? 'Break' : undefined,
      };
      const idx = afterId ? levels.findIndex((l) => l.id === afterId) : levels.length - 1;
      levels.splice(idx + 1, 0, newLevel);
      const numbered = renumberLevels(levels);
      return {
        tournament: {
          ...s.tournament,
          structure: { ...s.tournament.structure, levels: numbered },
        },
      };
    });
  },

  updateBlindLevel: (id, changes) => {
    set((s) => {
      if (!s.tournament) return s;
      const levels = s.tournament.structure.levels.map((l) =>
        l.id === id ? { ...l, ...changes } : l
      );
      const numbered = renumberLevels(levels);
      return {
        tournament: {
          ...s.tournament,
          structure: { ...s.tournament.structure, levels: numbered },
        },
      };
    });
  },

  removeBlindLevel: (id) => {
    set((s) => {
      if (!s.tournament) return s;
      const levels = renumberLevels(
        s.tournament.structure.levels.filter((l) => l.id !== id)
      );
      return {
        tournament: {
          ...s.tournament,
          structure: { ...s.tournament.structure, levels },
        },
      };
    });
  },

  reorderBlindLevels: (orderedIds) => {
    set((s) => {
      if (!s.tournament) return s;
      const map = new Map(s.tournament.structure.levels.map((l) => [l.id, l]));
      const levels = renumberLevels(orderedIds.map((id) => map.get(id)!).filter(Boolean));
      return {
        tournament: {
          ...s.tournament,
          structure: { ...s.tournament.structure, levels },
        },
      };
    });
  },

  // ─── Players ────────────────────────────────────────────────────────────────

  addPlayer: (name) => {
    const player: Player = {
      id: uuidv4(),
      name,
      status: 'active',
      tableId: null,
      seatNumber: null,
      buyInCount: 1,
      addOnCount: 0,
      registeredAt: new Date().toISOString(),
    };
    set((s) => {
      if (!s.tournament) return s;
      const players = [...s.tournament.players, player];
      const prizeSnapshot = computePrizeSnapshot(players, s.tournament.prizeConfig);
      const payoutStructure = calculatePayouts(
        prizeSnapshot.netPool,
        players.length,
        s.tournament.payoutStructure.customSpots
          ? s.tournament.payoutStructure.totalPositionsPaid
          : undefined
      );
      return { tournament: { ...s.tournament, players, prizeSnapshot, payoutStructure } };
    });
    return player;
  },

  removePlayer: (id) => {
    set((s) => {
      if (!s.tournament) return s;
      const players = s.tournament.players.filter((p) => p.id !== id);
      const tables = s.tournament.tables.map((t) => ({
        ...t,
        seats: t.seats.map((seat) =>
          seat.playerId === id ? { ...seat, playerId: null } : seat
        ),
      }));
      const prizeSnapshot = computePrizeSnapshot(players, s.tournament.prizeConfig);
      const payoutStructure = calculatePayouts(prizeSnapshot.netPool, players.length);
      return { tournament: { ...s.tournament, players, tables, prizeSnapshot, payoutStructure } };
    });
  },

  updatePlayer: (id, changes) => {
    set((s) => {
      if (!s.tournament) return s;
      const players = s.tournament.players.map((p) =>
        p.id === id ? { ...p, ...changes } : p
      );
      return { tournament: { ...s.tournament, players } };
    });
  },

  eliminatePlayer: (id) => {
    set((s) => {
      if (!s.tournament) return s;
      const activePlayers = s.tournament.players.filter(
        (p) => p.status === 'active'
      );
      const position = activePlayers.length; // last active = next to be eliminated
      const players = s.tournament.players.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'eliminated' as PlayerStatus,
              finishPosition: position,
              eliminatedAtLevel: s.tournament!.currentLevelIndex + 1,
            }
          : p
      );
      const tables = s.tournament.tables.map((t) => ({
        ...t,
        seats: t.seats.map((seat) =>
          seat.playerId === id ? { ...seat, playerId: null } : seat
        ),
      }));
      return { tournament: { ...s.tournament, players, tables } };
    });
  },

  addRebuy: (id) => {
    set((s) => {
      if (!s.tournament) return s;
      const players = s.tournament.players.map((p) =>
        p.id === id ? { ...p, buyInCount: p.buyInCount + 1, status: 'active' as PlayerStatus } : p
      );
      const prizeSnapshot = computePrizeSnapshot(players, s.tournament.prizeConfig);
      const payoutStructure = calculatePayouts(prizeSnapshot.netPool, players.length);
      return { tournament: { ...s.tournament, players, prizeSnapshot, payoutStructure } };
    });
  },

  addAddOn: (id) => {
    set((s) => {
      if (!s.tournament) return s;
      const players = s.tournament.players.map((p) =>
        p.id === id ? { ...p, addOnCount: p.addOnCount + 1 } : p
      );
      const prizeSnapshot = computePrizeSnapshot(players, s.tournament.prizeConfig);
      const payoutStructure = calculatePayouts(prizeSnapshot.netPool, players.length);
      return { tournament: { ...s.tournament, players, prizeSnapshot, payoutStructure } };
    });
  },

  importPlayers: (names) => {
    set((s) => {
      if (!s.tournament) return s;
      const newPlayers: Player[] = names
        .filter((n) => n.trim())
        .map((name) => ({
          id: uuidv4(),
          name: name.trim(),
          status: 'active' as PlayerStatus,
          tableId: null,
          seatNumber: null,
          buyInCount: 1,
          addOnCount: 0,
          registeredAt: new Date().toISOString(),
        }));
      const players = [...s.tournament.players, ...newPlayers];
      const prizeSnapshot = computePrizeSnapshot(players, s.tournament.prizeConfig);
      const payoutStructure = calculatePayouts(prizeSnapshot.netPool, players.length);
      return { tournament: { ...s.tournament, players, prizeSnapshot, payoutStructure } };
    });
  },

  // ─── Tables ─────────────────────────────────────────────────────────────────

  addTable: () => {
    const { tournament } = get();
    const maxSeats = tournament?.settings.playersPerTable ?? 9;
    const tableNum = (tournament?.tables.length ?? 0) + 1;
    const table: Table = {
      id: uuidv4(),
      name: `Table ${tableNum}`,
      maxSeats,
      seats: Array.from({ length: maxSeats }, (_, i) => ({
        seatNumber: i + 1,
        playerId: null,
        isActive: true,
      })),
      isActive: true,
    };
    set((s) => {
      if (!s.tournament) return s;
      return { tournament: { ...s.tournament, tables: [...s.tournament.tables, table] } };
    });
    return table;
  },

  removeTable: (id) => {
    set((s) => {
      if (!s.tournament) return s;
      // Unseat any players at this table
      const tableToRemove = s.tournament.tables.find((t) => t.id === id);
      const seatedPlayerIds = new Set(
        tableToRemove?.seats.map((s) => s.playerId).filter(Boolean) ?? []
      );
      const players = s.tournament.players.map((p) =>
        seatedPlayerIds.has(p.id) ? { ...p, tableId: null, seatNumber: null } : p
      );
      const tables = s.tournament.tables.filter((t) => t.id !== id);
      return { tournament: { ...s.tournament, tables, players } };
    });
  },

  renameTable: (id, name) => {
    set((s) => {
      if (!s.tournament) return s;
      const tables = s.tournament.tables.map((t) =>
        t.id === id ? { ...t, name } : t
      );
      return { tournament: { ...s.tournament, tables } };
    });
  },

  assignPlayerToSeat: (playerId, tableId, seatNum) => {
    set((s) => {
      if (!s.tournament) return s;
      // Remove player from current seat first
      let tables = s.tournament.tables.map((t) => ({
        ...t,
        seats: t.seats.map((seat) =>
          seat.playerId === playerId ? { ...seat, playerId: null } : seat
        ) as Seat[],
      }));
      // Check if target seat is occupied — if so, swap or displace
      tables = tables.map((t) => {
        if (t.id !== tableId) return t;
        return {
          ...t,
          seats: t.seats.map((seat) => {
            if (seat.seatNumber === seatNum) return { ...seat, playerId };
            return seat;
          }),
        };
      });
      const players = s.tournament.players.map((p) =>
        p.id === playerId ? { ...p, tableId, seatNumber: seatNum } : p
      );
      return { tournament: { ...s.tournament, tables, players } };
    });
  },

  removePlayerFromSeat: (playerId) => {
    set((s) => {
      if (!s.tournament) return s;
      const tables = s.tournament.tables.map((t) => ({
        ...t,
        seats: t.seats.map((seat) =>
          seat.playerId === playerId ? { ...seat, playerId: null } : seat
        ),
      }));
      const players = s.tournament.players.map((p) =>
        p.id === playerId ? { ...p, tableId: null, seatNumber: null } : p
      );
      return { tournament: { ...s.tournament, tables, players } };
    });
  },

  autoBalanceTables: () => {
    set((s) => {
      if (!s.tournament) return s;
      const activePlayers = s.tournament.players.filter((p) => p.status === 'active');
      const activeTables = s.tournament.tables.filter((t) => t.isActive);
      if (activeTables.length === 0) return s;

      const playersPerTable = Math.ceil(activePlayers.length / activeTables.length);
      const maxSeats = s.tournament.settings.playersPerTable;

      // Clear all seats
      let tables: Table[] = activeTables.map((t) => ({
        ...t,
        seats: t.seats.map((seat) => ({ ...seat, playerId: null as string | null })) as Seat[],
      }));

      // Re-assign players
      let playerIndex = 0;
      const assignments: { playerId: string; tableId: string; seatNumber: number }[] = [];

      for (const table of tables) {
        for (let seat = 1; seat <= Math.min(playersPerTable, maxSeats); seat++) {
          if (playerIndex >= activePlayers.length) break;
          const player = activePlayers[playerIndex++];
          assignments.push({ playerId: player.id, tableId: table.id, seatNumber: seat });
        }
      }

      // Apply assignments to tables
      for (const { playerId, tableId, seatNumber } of assignments) {
        tables = tables.map((t) => {
          if (t.id !== tableId) return t;
          return {
            ...t,
            seats: t.seats.map((seat) =>
              seat.seatNumber === seatNumber
                ? ({ ...seat, playerId } as Seat)
                : seat
            ),
          };
        });
      }

      const players = s.tournament.players.map((p) => {
        const assignment = assignments.find((a) => a.playerId === p.id);
        if (assignment) {
          return { ...p, tableId: assignment.tableId, seatNumber: assignment.seatNumber };
        }
        return { ...p, tableId: null, seatNumber: null };
      });

      const allTables = s.tournament.tables.map((t) => {
        const updated = tables.find((ut) => ut.id === t.id);
        return updated ?? t;
      });

      return { tournament: { ...s.tournament, tables: allTables, players } };
    });
  },

  // ─── Prize ──────────────────────────────────────────────────────────────────

  updatePrizeConfig: (changes) => {
    set((s) => {
      if (!s.tournament) return s;
      const prizeConfig = { ...s.tournament.prizeConfig, ...changes };
      const prizeSnapshot = computePrizeSnapshot(s.tournament.players, prizeConfig);
      const payoutStructure = calculatePayouts(
        prizeSnapshot.netPool,
        s.tournament.players.length,
        s.tournament.payoutStructure.customSpots
          ? s.tournament.payoutStructure.totalPositionsPaid
          : undefined
      );
      return { tournament: { ...s.tournament, prizeConfig, prizeSnapshot, payoutStructure } };
    });
  },

  recalculatePayouts: (customSpots) => {
    set((s) => {
      if (!s.tournament) return s;
      const payoutStructure = calculatePayouts(
        s.tournament.prizeSnapshot.netPool,
        s.tournament.players.length,
        customSpots
      );
      return { tournament: { ...s.tournament, payoutStructure } };
    });
  },
}));
