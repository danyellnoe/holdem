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
  const versionRef = useRef<number>(-1);

  useEffect(() => {
    if (!tournament) return;
    // Skip if version hasn't changed
    if (tournament.version === versionRef.current) return;
    versionRef.current = tournament.version;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveTournament(tournament);
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [tournament]);
}
