import { useEffect, useState } from 'react';
import { useTimerStore } from '../../store/timerStore';
import { formatTime } from '../../hooks/useTimer';
import { TimerAlertType } from '../../hooks/useTimer';
import { useSettingsStore } from '../../store/settingsStore';

interface TimerDisplayProps {
  onRegisterFlash?: (fn: (type: TimerAlertType) => void) => void;
}

export function TimerDisplay({ onRegisterFlash }: TimerDisplayProps) {
  const { levelRemainingMs, status } = useTimerStore();
  const { visualFlashEnabled } = useSettingsStore();
  const [flashClass, setFlashClass] = useState('');
  const [flashColor, setFlashColor] = useState('');

  useEffect(() => {
    if (onRegisterFlash) {
      onRegisterFlash((type: TimerAlertType) => {
        if (!visualFlashEnabled) return;
        setFlashColor(type === 'end_of_round' ? 'text-red-400' : 'text-yellow-400');
        setFlashClass('animate-flash');
        setTimeout(() => {
          setFlashClass('');
          setFlashColor('');
        }, 1500);
      });
    }
  }, [onRegisterFlash, visualFlashEnabled]);

  const isLow = levelRemainingMs <= 60_000 && levelRemainingMs > 0 && status === 'running';
  const isZero = levelRemainingMs === 0;
  const isPaused = status === 'paused';

  const baseColor = isZero
    ? 'text-red-500'
    : flashColor
    ? flashColor
    : isLow
    ? 'text-yellow-400'
    : 'text-white';

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div
        className={`font-mono font-bold tabular-nums leading-none transition-colors duration-300
          ${baseColor} ${flashClass} ${isPaused ? 'opacity-60' : ''}`}
        style={{ fontSize: 'clamp(4rem, 18vw, 12rem)' }}
      >
        {formatTime(levelRemainingMs)}
      </div>
      {isPaused && (
        <div className="mt-2 text-gray-400 text-lg font-semibold tracking-widest uppercase animate-pulse-slow">
          Paused
        </div>
      )}
    </div>
  );
}
