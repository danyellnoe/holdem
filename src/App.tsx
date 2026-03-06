import { Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { TimerPage } from './pages/TimerPage';
import { StructurePage } from './pages/StructurePage';
import { TablesPage } from './pages/TablesPage';
import { PlayersPage } from './pages/PlayersPage';
import { PrizePage } from './pages/PrizePage';
import { SettingsPage } from './pages/SettingsPage';
import { RemotePage } from './pages/RemotePage';
import { useTimer } from './hooks/useTimer';
import { useAutoSave } from './hooks/useAutoSave';
import { useHostBroadcast } from './hooks/useRemoteSync';
import { useEffect, useRef } from 'react';
import { useTournamentStore } from './store/tournamentStore';
import { useTimerStore } from './store/timerStore';
import { BLIND_PRESETS } from './lib/blindPresets';
import { getIndex, loadTournament } from './lib/localPersistence';

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
      <Route element={<AppShell />}>
        <Route path="/" element={<TimerPage timerControls={timerControls} />} />
        <Route path="/structure" element={<StructurePage />} />
        <Route path="/tables" element={<TablesPage />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/prize" element={<PrizePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

function InitTournament() {
  const tournament = useTournamentStore((s) => s.tournament);
  const { createTournament } = useTournamentStore();
  const { setStatus, setCurrentLevelIndex, setLevelRemainingMs } = useTimerStore();
  const initialized = useRef(false);

  // On mount, load the most recent saved tournament or create a default one
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (!useTournamentStore.getState().tournament) {
      const index = getIndex();
      if (index.length > 0) {
        const saved = loadTournament(index[0].id);
        if (saved) {
          useTournamentStore.setState({ tournament: saved });
          const firstLevel = saved.structure.levels[saved.currentLevelIndex];
          if (firstLevel) {
            setCurrentLevelIndex(saved.currentLevelIndex);
            setLevelRemainingMs(firstLevel.durationMinutes * 60 * 1000);
          }
          setStatus('setup');
          return;
        }
      }
      // No saved tournament — create a default
      createTournament({ name: 'Home Game Tournament' }, BLIND_PRESETS[1].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize timer when tournament loads (on tournament ID change)
  const prevTournamentId = useRef<string | null>(null);
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
