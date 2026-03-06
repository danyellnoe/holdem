import { useRef, useCallback, useEffect } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { TimerAlertType } from './useTimer';
import { generateSound, SoundType } from '../lib/soundGenerator';

const ALL_SOUNDS: SoundType[] = ['bell', 'horn', 'chime', 'buzzer'];

export function useAudio() {
  const { alertSoundId, volume } = useSettingsStore();
  const contextRef = useRef<AudioContext | null>(null);
  const buffersRef = useRef<Map<SoundType, AudioBuffer>>(new Map());
  const unlockedRef = useRef(false);

  const getContext = useCallback(() => {
    if (!contextRef.current) {
      contextRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return contextRef.current;
  }, []);

  // Generate all sounds and cache them
  const generateAllSounds = useCallback(() => {
    const ctx = getContext();
    for (const id of ALL_SOUNDS) {
      if (!buffersRef.current.has(id)) {
        buffersRef.current.set(id, generateSound(ctx, id));
      }
    }
  }, [getContext]);

  // Unlock AudioContext on first user gesture
  const unlock = useCallback(async () => {
    if (unlockedRef.current) return;
    const ctx = getContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    generateAllSounds();
    unlockedRef.current = true;
  }, [getContext, generateAllSounds]);

  useEffect(() => {
    const handler = () => void unlock();
    document.addEventListener('click', handler, { once: true });
    document.addEventListener('keydown', handler, { once: true });
    return () => {
      document.removeEventListener('click', handler);
      document.removeEventListener('keydown', handler);
    };
  }, [unlock]);

  const playSound = useCallback(
    (id: SoundType, vol: number = volume) => {
      const ctx = getContext();
      // Lazy-generate if not yet cached
      if (!buffersRef.current.has(id)) {
        buffersRef.current.set(id, generateSound(ctx, id));
      }
      const buffer = buffersRef.current.get(id)!;
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => playSound(id, vol));
        return;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gainNode = ctx.createGain();
      gainNode.gain.value = Math.max(0, Math.min(1, vol));
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start();
    },
    [getContext, volume]
  );

  const playAlert = useCallback(
    (type: TimerAlertType) => {
      if (type === 'one_minute_warning') {
        playSound('chime', volume * 0.7);
      } else {
        playSound(alertSoundId as SoundType, volume);
      }
    },
    [alertSoundId, volume, playSound]
  );

  const previewSound = useCallback(
    (id: string) => {
      playSound(id as SoundType, volume);
    },
    [playSound, volume]
  );

  return { playAlert, previewSound, unlock };
}
