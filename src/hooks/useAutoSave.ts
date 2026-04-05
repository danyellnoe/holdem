import { useEffect, useRef } from 'react';
import { useTournamentStore } from '../store/tournamentStore';
import { saveTournament } from '../lib/localPersistence';

const DEBOUNCE_MS = 2000;

/**
 * Automatically saves the tournament to LocalStorage 2 seconds after any change.
 * Mount once at the top level.
 */
export function useAutoSave() {
  const tournament = useTournamentStore((s) => s.tournament);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tournamentRef = useRef<typeof tournament>(null);
  const snapshotRef = useRef<string | null>(null);
  const tournamentIdRef = useRef<string | null>(null);

  useEffect(() => {
    tournamentRef.current = tournament;
  }, [tournament]);

  useEffect(() => {
    if (!tournament) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      snapshotRef.current = null;
      tournamentIdRef.current = null;
      return;
    }

    const snapshot = JSON.stringify(tournament);

    // Treat initial mount / tournament load as the new baseline instead of re-saving immediately.
    if (tournamentIdRef.current !== tournament.id || snapshotRef.current === null) {
      tournamentIdRef.current = tournament.id;
      snapshotRef.current = snapshot;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      return;
    }

    if (snapshot === snapshotRef.current) return;
    snapshotRef.current = snapshot;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (tournamentRef.current) {
        saveTournament(tournamentRef.current);
      }
      timerRef.current = null;
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [tournament]);

  useEffect(() => {
    const flushPendingSave = () => {
      if (!timerRef.current || !tournamentRef.current) return;
      clearTimeout(timerRef.current);
      timerRef.current = null;
      saveTournament(tournamentRef.current);
    };

    window.addEventListener('pagehide', flushPendingSave);

    return () => {
      window.removeEventListener('pagehide', flushPendingSave);
      flushPendingSave();
    };
  }, []);
}
