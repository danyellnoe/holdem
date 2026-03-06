import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AlertSoundId = 'bell' | 'horn' | 'chime' | 'buzzer';

interface SettingsState {
  alertSoundId: AlertSoundId;
  volume: number;                        // 0-1
  oneMinuteWarningEnabled: boolean;
  visualFlashEnabled: boolean;
  broadcastChannelName: string;

  setAlertSoundId: (id: AlertSoundId) => void;
  setVolume: (v: number) => void;
  setOneMinuteWarningEnabled: (v: boolean) => void;
  setVisualFlashEnabled: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      alertSoundId: 'bell',
      volume: 0.8,
      oneMinuteWarningEnabled: true,
      visualFlashEnabled: true,
      broadcastChannelName: 'holdem-timer',

      setAlertSoundId: (id) => set({ alertSoundId: id }),
      setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)) }),
      setOneMinuteWarningEnabled: (v) => set({ oneMinuteWarningEnabled: v }),
      setVisualFlashEnabled: (v) => set({ visualFlashEnabled: v }),
    }),
    { name: 'holdem_settings' }
  )
);
