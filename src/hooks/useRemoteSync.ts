import { useEffect, useRef, useCallback } from 'react';
import { useTimerStore } from '../store/timerStore';
import { useSettingsStore } from '../store/settingsStore';

export type RemoteSyncPayload =
  | {
      type: 'sync';
      status: string;
      currentLevelIndex: number;
      levelRemainingMs: number;
      totalElapsedMs: number;
      serverTimestamp: number;
    }
  | { type: 'alert'; alertType: string };

/**
 * Hook for the HOST side: broadcasts timer state via BroadcastChannel.
 * Returns a `broadcast` function that the timer hook calls.
 */
export function useHostBroadcast() {
  const { broadcastChannelName } = useSettingsStore();
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(broadcastChannelName);
    return () => channelRef.current?.close();
  }, [broadcastChannelName]);

  const broadcast = useCallback((payload: object) => {
    channelRef.current?.postMessage(payload);
  }, []);

  return { broadcast };
}

/**
 * Hook for the REMOTE VIEWER side: listens to BroadcastChannel and syncs local timer state.
 */
export function useRemoteViewer() {
  const { broadcastChannelName } = useSettingsStore();
  const timerStore = useTimerStore();
  const localIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSyncRef = useRef<number>(0);

  useEffect(() => {
    const channel = new BroadcastChannel(broadcastChannelName);

    channel.onmessage = (event: MessageEvent<RemoteSyncPayload>) => {
      const payload = event.data;

      if (payload.type === 'sync') {
        // Apply drift correction: estimate one-way network/IPC latency
        const receivedAt = Date.now();
        const latency = Math.max(0, (receivedAt - payload.serverTimestamp) / 2);
        const adjustedRemaining = Math.max(0, payload.levelRemainingMs - latency);

        timerStore.setStatus(payload.status as Parameters<typeof timerStore.setStatus>[0]);
        timerStore.setCurrentLevelIndex(payload.currentLevelIndex);
        timerStore.setLevelRemainingMs(adjustedRemaining);
        timerStore.setTotalElapsedMs(payload.totalElapsedMs);
        lastSyncRef.current = receivedAt;

        // Start local countdown between syncs
        if (localIntervalRef.current) clearInterval(localIntervalRef.current);
        if (payload.status === 'running' || payload.status === 'on_break') {
          let lastTick = Date.now();
          localIntervalRef.current = setInterval(() => {
            const now = Date.now();
            const delta = now - lastTick;
            lastTick = now;
            timerStore.tick(delta);
          }, 500);
        }
      }
    };

    return () => {
      channel.close();
      if (localIntervalRef.current) clearInterval(localIntervalRef.current);
    };
  }, [broadcastChannelName, timerStore]);

  const isConnected = Date.now() - lastSyncRef.current < 10_000;
  return { isConnected };
}
