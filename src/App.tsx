import { Routes, Route, Outlet } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { TimerPage } from './pages/TimerPage';
import { StructurePage } from './pages/StructurePage';
import { TablesPage } from './pages/TablesPage';
import { PlayersPage } from './pages/PlayersPage';
import { PrizePage } from './pages/PrizePage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage';
import { RemotePage } from './pages/RemotePage';
import { LandingPage } from './pages/LandingPage';
import { useTimer } from './hooks/useTimer';
import { useAutoSave } from './hooks/useAutoSave';
import { useHostBroadcast } from './hooks/useRemoteSync';
import { useEffect, useRef } from 'react';
import { useTournamentStore } from './store/tournamentStore';
import { useTimerStore } from './store/timerStore';

function AppLayout() {
  const tournament = useTournamentStore((s) => s.tournament);
  if (!tournament) {
    return <LandingPage />;
  }
  return <Outlet />;
}

function AppRoutes() {
  const timerControls = useTimer();
  useAutoSave();
  const { broadcast } = useHostBroadcast();

  // Wire BroadcastChannel into timer
  useEffect(() => {
    timerControls.registerBroadcast(broadcast);
  }, [broadcast, timerControls.registerBroadcast]);

  return (
    <Routes>
      <Route path="/remote" element={<RemotePage />} />
      <Route element={<AppLayout />}>
        <Route element={<AppShell />}>
          <Route index element={<TimerPage timerControls={timerControls} />} />
          <Route path="structure" element={<StructurePage />} />
          <Route path="tables" element={<TablesPage />} />
          <Route path="players" element={<PlayersPage />} />
          <Route path="prize" element={<PrizePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="help" element={<HelpPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

function InitTournament() {
  const tournament = useTournamentStore((s) => s.tournament);
  const { setStatus, setCurrentLevelIndex, setLevelRemainingMs } = useTimerStore();
  const prevTournamentId = useRef<string | null>(null);

  // Initialize timer when tournament loads (on tournament ID change)
  useEffect(() => {
    if (!tournament) return;
    if (tournament.id === prevTournamentId.current) return;
    prevTournamentId.current = tournament.id;

    const firstLevel = tournament.structure.levels[tournament.currentLevelIndex];
    if (firstLevel) {
      setCurrentLevelIndex(tournament.currentLevelIndex);
      setLevelRemainingMs(firstLevel.durationMinutes * 60 * 1000);
    }
    setStatus('setup');
  }, [tournament?.id, setCurrentLevelIndex, setLevelRemainingMs, setStatus]);

  return null;
}

export function App() {
  return (
    <>
      <InitTournament />
      <AppRoutes />
    </>
  );
}
