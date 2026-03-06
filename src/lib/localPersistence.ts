import { Tournament, SavedTournamentMeta } from '../types/tournament';

const INDEX_KEY = 'holdem_index';
const TOURNAMENT_PREFIX = 'holdem_tournament_';

export function getTournamentKey(id: string): string {
  return `${TOURNAMENT_PREFIX}${id}`;
}

export function saveTournament(tournament: Tournament): void {
  try {
    const updated: Tournament = {
      ...tournament,
      lastSavedAt: new Date().toISOString(),
      version: tournament.version + 1,
    };
    localStorage.setItem(getTournamentKey(updated.id), JSON.stringify(updated));
    updateIndex(updated);
  } catch (e) {
    console.error('Failed to save tournament:', e);
  }
}

export function loadTournament(id: string): Tournament | null {
  try {
    const raw = localStorage.getItem(getTournamentKey(id));
    if (!raw) return null;
    return JSON.parse(raw) as Tournament;
  } catch {
    return null;
  }
}

export function deleteTournament(id: string): void {
  localStorage.removeItem(getTournamentKey(id));
  removeFromIndex(id);
}

export function getIndex(): SavedTournamentMeta[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedTournamentMeta[];
  } catch {
    return [];
  }
}

function updateIndex(tournament: Tournament): void {
  const index = getIndex();
  const meta: SavedTournamentMeta = {
    id: tournament.id,
    name: tournament.settings.name,
    date: tournament.settings.date,
    lastSavedAt: tournament.lastSavedAt,
    status: tournament.status,
    playerCount: tournament.players.length,
  };
  const existing = index.findIndex((m) => m.id === tournament.id);
  if (existing >= 0) {
    index[existing] = meta;
  } else {
    index.unshift(meta);
  }
  localStorage.setItem(INDEX_KEY, JSON.stringify(index));
}

function removeFromIndex(id: string): void {
  const index = getIndex().filter((m) => m.id !== id);
  localStorage.setItem(INDEX_KEY, JSON.stringify(index));
}
