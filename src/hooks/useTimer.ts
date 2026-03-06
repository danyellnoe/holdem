import { useEffect, useRef, useCallback } from 'react';
import { useTimerStore } from '../store/timerStore';
import { useTournamentStore } from '../store/tournamentStore';
import { useSettingsStore } from '../store/settingsStore';
import { useAudio } from './useAudio';

const TICK_INTERVAL_MS = 500;

export type TimerAlertType = 'end_of_round' | 'one_minute_warning';

/**
 * The core timer engine. Mount this once at the top of the app.
 * It owns the setInterval and drives the timer store.
 */
export function useTimer() {
  const timerStore = useTimerStore();
  const { tournament, setStatus, setCurrentLevelIndex, persistTournament } =
    useTournamentStore();
  const { oneMinuteWarningEnabled } = useSettingsStore();
  const { playAlert } = useAudio();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashRef = useRef<((type: TimerAlertType) => void) | null>(null);

  // Remote sync (BroadcastChannel) — defined in useRemoteSync, wired externally
  const broadcastRef = useRef<((payload: object) => void) | null>(null);

  const levels = tournament?.structure.levels ?? [];

  const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const advanceLevel = useCallback(() => {
    const { currentLevelIndex } = useTimerStore.getState();
    const nextIndex = currentLevelIndex + 1;

    if (nextIndex >= levels.length) {
      stopInterval();
      setStatus('complete');
      useTimerStore.getState().setStatus('complete');
      persistTournament();
      return;
    }

    const nextLevel = levels[nextIndex];
    const nextMs = nextLevel.durationMinutes * 60 * 1000;

    useTimerStore.getState().setCurrentLevelIndex(nextIndex);
    useTimerStore.getState().setLevelRemainingMs(nextMs);
    useTimerStore.getState().setOneMinuteWarningFired(false);
    setCurrentLevelIndex(nextIndex);

    if (nextLevel.type === 'break') {
      setStatus('on_break');
      useTimerStore.getState().setStatus('on_break');
    } else {
      setStatus('running');
      useTimerStore.getState().setStatus('running');
    }
  }, [levels, setStatus, setCurrentLevelIndex, persistTournament, stopInterval]);

  const tick = useCallback(() => {
    const state = useTimerStore.getState();
    const { status, levelRemainingMs, lastTickAt, oneMinuteWarningFired } = state;

    if (status !== 'running' && status !== 'on_break') return;

    const now = Date.now();
    const delta = lastTickAt !== null ? Math.min(now - lastTickAt, 2000) : TICK_INTERVAL_MS;
    state.setLastTickAt(now);

    const newRemaining = levelRemainingMs - delta;
    const newElapsed = state.totalElapsedMs + delta;

    // One-minute warning
    if (
      oneMinuteWarningEnabled &&
      !oneMinuteWarningFired &&
      newRemaining <= 60_000 &&
      newRemaining > 0 &&
      status === 'running'
    ) {
      state.setOneMinuteWarningFired(true);
      playAlert('one_minute_warning');
      flashRef.current?.('one_minute_warning');
      broadcastRef.current?.({ type: 'alert', alertType: 'one_minute_warning' });
    }

    if (newRemaining <= 0) {
      state.setLevelRemainingMs(0);
      state.setTotalElapsedMs(newElapsed);
      playAlert('end_of_round');
      flashRef.current?.('end_of_round');
      broadcastRef.current?.({ type: 'alert', alertType: 'end_of_round' });
      advanceLevel();
    } else {
      state.setLevelRemainingMs(newRemaining);
      state.setTotalElapsedMs(newElapsed);
      // Broadcast every ~5 seconds
      if (Math.floor(newElapsed / 5000) !== Math.floor((newElapsed - delta) / 5000)) {
        broadcastSync();
      }
    }
  }, [oneMinuteWarningEnabled, playAlert, advanceLevel]);

  const broadcastSync = useCallback(() => {
    const state = useTimerStore.getState();
    broadcastRef.current?.({
      type: 'sync',
      status: state.status,
      currentLevelIndex: state.currentLevelIndex,
      levelRemainingMs: state.levelRemainingMs,
      totalElapsedMs: state.totalElapsedMs,
      serverTimestamp: Date.now(),
    });
  }, []);

  const startInterval = useCallback(() => {
    stopInterval();
    useTimerStore.getState().setLastTickAt(Date.now());
    intervalRef.current = setInterval(tick, TICK_INTERVAL_MS);
  }, [tick, stopInterval]);

  // ─── Public API ─────────────────────────────────────────────────────────────

  const start = useCallback(() => {
    if (!tournament) return;
    const { status } = useTimerStore.getState();
    if (status !== 'setup' && status !== 'paused') return;

    const currentLevel = levels[useTimerStore.getState().currentLevelIndex];
    if (!currentLevel) return;

    if (status === 'setup') {
      useTimerStore.getState().setLevelRemainingMs(currentLevel.durationMinutes * 60 * 1000);
      useTimerStore.getState().setTotalElapsedMs(0);
    }

    const newStatus = currentLevel.type === 'break' ? 'on_break' : 'running';
    useTimerStore.getState().setStatus(newStatus);
    setStatus(newStatus);
    startInterval();
    broadcastSync();
  }, [tournament, levels, setStatus, startInterval, broadcastSync]);

  const pause = useCallback(() => {
    const { status } = useTimerStore.getState();
    if (status !== 'running' && status !== 'on_break') return;
    stopInterval();
    useTimerStore.getState().setStatus('paused');
    useTimerStore.getState().setLastTickAt(null);
    setStatus('paused');
    broadcastSync();
  }, [stopInterval, setStatus, broadcastSync]);

  const resume = useCallback(() => {
    const { status, currentLevelIndex } = useTimerStore.getState();
    if (status !== 'paused') return;
    const currentLevel = levels[currentLevelIndex];
    const newStatus = currentLevel?.type === 'break' ? 'on_break' : 'running';
    useTimerStore.getState().setStatus(newStatus);
    setStatus(newStatus);
    startInterval();
    broadcastSync();
  }, [levels, setStatus, startInterval, broadcastSync]);

  const skipLevel = useCallback(() => {
    useTimerStore.getState().setLevelRemainingMs(0);
    useTimerStore.getState().setOneMinuteWarningFired(false);
    const { status } = useTimerStore.getState();
    if (status === 'running' || status === 'on_break') {
      advanceLevel();
    } else {
      advanceLevel();
    }
  }, [advanceLevel]);

  const prevLevel = useCallback(() => {
    const { currentLevelIndex } = useTimerStore.getState();
    if (currentLevelIndex <= 0) return;
    const prevIndex = currentLevelIndex - 1;
    const prevLevelData = levels[prevIndex];
    if (!prevLevelData) return;
    useTimerStore.getState().setCurrentLevelIndex(prevIndex);
    useTimerStore.getState().setLevelRemainingMs(prevLevelData.durationMinutes * 60 * 1000);
    useTimerStore.getState().setOneMinuteWarningFired(false);
    setCurrentLevelIndex(prevIndex);
    broadcastSync();
  }, [levels, setCurrentLevelIndex, broadcastSync]);

  const adjustTime = useCallback(
    (deltaMs: number) => {
      useTimerStore.getState().adjustTime(deltaMs);
      broadcastSync();
    },
    [broadcastSync]
  );

  // Register flash callback
  const registerFlash = useCallback((fn: (type: TimerAlertType) => void) => {
    flashRef.current = fn;
  }, []);

  // Register broadcast callback
  const registerBroadcast = useCallback((fn: (payload: object) => void) => {
    broadcastRef.current = fn;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopInterval();
  }, [stopInterval]);

  // If status changes to running from outside (e.g. load from storage) — restart interval
  useEffect(() => {
    const { status } = timerStore;
    if ((status === 'running' || status === 'on_break') && intervalRef.current === null) {
      startInterval();
    }
    if (status !== 'running' && status !== 'on_break' && intervalRef.current !== null) {
      stopInterval();
    }
  }, [timerStore.status, startInterval, stopInterval]);

  return {
    start,
    pause,
    resume,
    skipLevel,
    prevLevel,
    adjustTime,
    registerFlash,
    registerBroadcast,
    broadcastSync,
  };
}

// ─── Formatting helpers ──────────────────────────────────────────────────────

export function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  }
  return `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
}
