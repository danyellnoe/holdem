import { create } from 'zustand';
import { TournamentStatus } from '../types/tournament';

interface TimerState {
  status: TournamentStatus;
  currentLevelIndex: number;
  levelRemainingMs: number;
  totalElapsedMs: number;
  lastTickAt: number | null;
  oneMinuteWarningFired: boolean;

  // actions
  setStatus: (status: TournamentStatus) => void;
  setCurrentLevelIndex: (index: number) => void;
  setLevelRemainingMs: (ms: number) => void;
  setTotalElapsedMs: (ms: number) => void;
  setLastTickAt: (ts: number | null) => void;
  setOneMinuteWarningFired: (fired: boolean) => void;
  tick: (deltaMs: number) => void;
  initFromTournament: (
    status: TournamentStatus,
    levelIndex: number,
    levelDurationMinutes: number
  ) => void;
  adjustTime: (deltaMs: number) => void;
}

export const useTimerStore = create<TimerState>()((set, get) => ({
  status: 'setup',
  currentLevelIndex: 0,
  levelRemainingMs: 0,
  totalElapsedMs: 0,
  lastTickAt: null,
  oneMinuteWarningFired: false,

  setStatus: (status) => set({ status }),
  setCurrentLevelIndex: (index) => set({ currentLevelIndex: index }),
  setLevelRemainingMs: (ms) => set({ levelRemainingMs: Math.max(0, ms) }),
  setTotalElapsedMs: (ms) => set({ totalElapsedMs: Math.max(0, ms) }),
  setLastTickAt: (ts) => set({ lastTickAt: ts }),
  setOneMinuteWarningFired: (fired) => set({ oneMinuteWarningFired: fired }),

  tick: (deltaMs) => {
    const { status, levelRemainingMs, totalElapsedMs } = get();
    if (status !== 'running' && status !== 'on_break') return;
    const newRemaining = Math.max(0, levelRemainingMs - deltaMs);
    set({
      levelRemainingMs: newRemaining,
      totalElapsedMs: totalElapsedMs + deltaMs,
    });
  },

  initFromTournament: (status, levelIndex, levelDurationMinutes) => {
    set({
      status,
      currentLevelIndex: levelIndex,
      levelRemainingMs: levelDurationMinutes * 60 * 1000,
      totalElapsedMs: 0,
      lastTickAt: null,
      oneMinuteWarningFired: false,
    });
  },

  adjustTime: (deltaMs) => {
    const { levelRemainingMs } = get();
    set({ levelRemainingMs: Math.max(0, levelRemainingMs + deltaMs) });
  },
}));
