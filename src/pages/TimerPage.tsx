import { useEffect, useCallback } from 'react';
import { useTournamentStore } from '../store/tournamentStore';
import { useTimerStore } from '../store/timerStore';
import { useTimer, TimerAlertType } from '../hooks/useTimer';
import { TimerDisplay } from '../components/timer/TimerDisplay';
import { RoundInfo } from '../components/timer/RoundInfo';
import { NextBlindPreview } from '../components/timer/NextBlindPreview';
import { ElapsedTime } from '../components/timer/ElapsedTime';
import { BreakCountdown } from '../components/timer/BreakCountdown';
import { TimerControls } from '../components/timer/TimerControls';
import { BreakScreen } from '../components/timer/BreakScreen';
import { BlindStructureView } from '../components/blinds/BlindStructureView';

interface TimerPageProps {
  timerControls: ReturnType<typeof useTimer>;
}

export function TimerPage({ timerControls }: TimerPageProps) {
  const tournament = useTournamentStore((s) => s.tournament);
  const { status } = useTimerStore();
  const { start, pause, resume, skipLevel, prevLevel, adjustTime, registerFlash } = timerControls;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (status === 'running' || status === 'on_break') pause();
        else if (status === 'paused') resume();
        else if (status === 'setup') start();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        skipLevel();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        prevLevel();
      } else if (e.code === 'Equal' || e.code === 'NumpadAdd') {
        e.preventDefault();
        adjustTime(60_000);
      } else if (e.code === 'Minus' || e.code === 'NumpadSubtract') {
        e.preventDefault();
        adjustTime(-60_000);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [status, start, pause, resume, skipLevel, prevLevel, adjustTime]);

  const handleFlash = useCallback(
    (register: (fn: (type: TimerAlertType) => void) => void) => {
      registerFlash(register as unknown as (type: TimerAlertType) => void);
    },
    [registerFlash]
  );

  if (!tournament) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No tournament loaded. Go to Settings to create one.
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 p-4 overflow-hidden">
      {/* Break overlay */}
      <BreakScreen onPause={pause} onResume={resume} onSkip={skipLevel} />

      {/* Main timer panel */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 min-h-0">
        {/* Timer clock */}
        <TimerDisplay onRegisterFlash={registerFlash} />

        {/* Blind info */}
        <div className="flex flex-col items-center gap-2">
          <RoundInfo />
          <NextBlindPreview />
        </div>

        {/* Controls */}
        <TimerControls
          onStart={start}
          onPause={pause}
          onResume={resume}
          onSkip={skipLevel}
          onPrev={prevLevel}
          onAdjust={adjustTime}
        />

        {/* Elapsed + break countdown */}
        <div className="flex flex-wrap justify-center gap-6 mt-2">
          <ElapsedTime />
          <BreakCountdown />
        </div>
      </div>

      {/* Blind structure sidebar */}
      <div className="lg:w-72 xl:w-80 overflow-y-auto flex-shrink-0 max-h-full">
        <BlindStructureView compact />
      </div>
    </div>
  );
}
