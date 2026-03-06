import { v4 as uuidv4 } from 'uuid';
import { BlindLevel, BlindStructure } from '../types/blind';

function playLevel(
  levelNumber: number,
  durationMinutes: number,
  smallBlind: number,
  bigBlind: number,
  ante: number = 0,
  bigBlindAnte: boolean = false
): BlindLevel {
  return {
    id: uuidv4(),
    levelNumber,
    type: 'play',
    durationMinutes,
    smallBlind,
    bigBlind,
    ante,
    bigBlindAnte,
  };
}

function breakLevel(durationMinutes: number, label: string = 'Break'): BlindLevel {
  return {
    id: uuidv4(),
    levelNumber: 0,
    type: 'break',
    durationMinutes,
    smallBlind: 0,
    bigBlind: 0,
    ante: 0,
    bigBlindAnte: false,
    breakLabel: label,
  };
}

// Renumber play levels sequentially
function numberLevels(levels: BlindLevel[]): BlindLevel[] {
  let n = 1;
  return levels.map((l) => {
    if (l.type === 'play') {
      return { ...l, levelNumber: n++ };
    }
    return l;
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Preset 1: Deep Stack — 15-min levels, ~3 hour game
// ────────────────────────────────────────────────────────────────────────────
const deepStackLevels: BlindLevel[] = numberLevels([
  playLevel(0, 15, 25, 50),
  playLevel(0, 15, 50, 100),
  playLevel(0, 15, 75, 150),
  playLevel(0, 15, 100, 200, 25),
  playLevel(0, 15, 150, 300, 25),
  breakLevel(15, 'Break'),
  playLevel(0, 15, 200, 400, 50),
  playLevel(0, 15, 300, 600, 75),
  playLevel(0, 15, 400, 800, 100),
  playLevel(0, 15, 500, 1000, 100),
  playLevel(0, 15, 600, 1200, 200),
  breakLevel(10, 'Break'),
  playLevel(0, 15, 800, 1600, 200),
  playLevel(0, 15, 1000, 2000, 300),
  playLevel(0, 15, 1500, 3000, 400),
  playLevel(0, 15, 2000, 4000, 500),
  playLevel(0, 15, 3000, 6000, 1000),
]);

// ────────────────────────────────────────────────────────────────────────────
// Preset 2: Standard — 10-min levels, ~2 hour game
// ────────────────────────────────────────────────────────────────────────────
const standardLevels: BlindLevel[] = numberLevels([
  playLevel(0, 10, 25, 50),
  playLevel(0, 10, 50, 100),
  playLevel(0, 10, 100, 200, 25),
  playLevel(0, 10, 150, 300, 50),
  playLevel(0, 10, 200, 400, 50),
  breakLevel(10, 'Break'),
  playLevel(0, 10, 300, 600, 75),
  playLevel(0, 10, 400, 800, 100),
  playLevel(0, 10, 600, 1200, 200),
  playLevel(0, 10, 800, 1600, 200),
  playLevel(0, 10, 1000, 2000, 300),
  breakLevel(10, 'Break'),
  playLevel(0, 10, 1500, 3000, 400),
  playLevel(0, 10, 2000, 4000, 500),
  playLevel(0, 10, 3000, 6000, 1000),
  playLevel(0, 10, 5000, 10000, 1000),
]);

// ────────────────────────────────────────────────────────────────────────────
// Preset 3: Turbo — 7-min levels, ~90 min game
// ────────────────────────────────────────────────────────────────────────────
const turboLevels: BlindLevel[] = numberLevels([
  playLevel(0, 7, 50, 100),
  playLevel(0, 7, 100, 200, 25),
  playLevel(0, 7, 150, 300, 50),
  playLevel(0, 7, 200, 400, 50),
  breakLevel(5, 'Break'),
  playLevel(0, 7, 300, 600, 100),
  playLevel(0, 7, 500, 1000, 100),
  playLevel(0, 7, 1000, 2000, 200),
  playLevel(0, 7, 2000, 4000, 500),
  playLevel(0, 7, 3000, 6000, 1000),
  playLevel(0, 7, 5000, 10000, 1000),
]);

// ────────────────────────────────────────────────────────────────────────────
// Preset 4: Hyper Turbo — 5-min levels, ~45 min game, no breaks
// ────────────────────────────────────────────────────────────────────────────
const hyperTurboLevels: BlindLevel[] = numberLevels([
  playLevel(0, 5, 100, 200),
  playLevel(0, 5, 200, 400, 50),
  playLevel(0, 5, 300, 600, 100),
  playLevel(0, 5, 500, 1000, 100),
  playLevel(0, 5, 1000, 2000, 200),
  playLevel(0, 5, 2000, 4000, 500),
  playLevel(0, 5, 4000, 8000, 1000),
  playLevel(0, 5, 5000, 10000, 2000),
  playLevel(0, 5, 10000, 20000, 3000),
]);

// ────────────────────────────────────────────────────────────────────────────
// Preset 5: WSOP-style — 20-min levels, 6-8 hour event, Big Blind Ante
// ────────────────────────────────────────────────────────────────────────────
const wsopStyleLevels: BlindLevel[] = numberLevels([
  playLevel(0, 20, 100, 100, 100, true),
  playLevel(0, 20, 100, 200, 200, true),
  playLevel(0, 20, 100, 300, 300, true),
  playLevel(0, 20, 200, 400, 400, true),
  playLevel(0, 20, 200, 500, 500, true),
  breakLevel(20, 'Registration Closes'),
  playLevel(0, 20, 300, 600, 600, true),
  playLevel(0, 20, 400, 800, 800, true),
  playLevel(0, 20, 500, 1000, 1000, true),
  playLevel(0, 20, 600, 1200, 1200, true),
  playLevel(0, 20, 800, 1600, 1600, true),
  breakLevel(15, 'Break'),
  playLevel(0, 20, 1000, 2000, 2000, true),
  playLevel(0, 20, 1500, 3000, 3000, true),
  playLevel(0, 20, 2000, 4000, 4000, true),
  playLevel(0, 20, 3000, 6000, 6000, true),
  playLevel(0, 20, 4000, 8000, 8000, true),
  breakLevel(15, 'Break'),
  playLevel(0, 20, 5000, 10000, 10000, true),
  playLevel(0, 20, 6000, 12000, 12000, true),
  playLevel(0, 20, 8000, 16000, 16000, true),
  playLevel(0, 20, 10000, 20000, 20000, true),
]);

export const BLIND_PRESETS: BlindStructure[] = [
  {
    id: 'preset-deep-stack',
    name: 'Deep Stack (3 hrs)',
    levels: deepStackLevels,
    isPreset: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'preset-standard',
    name: 'Standard (2 hrs)',
    levels: standardLevels,
    isPreset: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'preset-turbo',
    name: 'Turbo (90 min)',
    levels: turboLevels,
    isPreset: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'preset-hyper-turbo',
    name: 'Hyper Turbo (45 min)',
    levels: hyperTurboLevels,
    isPreset: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'preset-wsop',
    name: 'WSOP-Style (6-8 hrs)',
    levels: wsopStyleLevels,
    isPreset: true,
    createdAt: new Date().toISOString(),
  },
];

export function getPresetById(id: string): BlindStructure | undefined {
  return BLIND_PRESETS.find((p) => p.id === id);
}

export function clonePreset(preset: BlindStructure, customName?: string): BlindStructure {
  return {
    ...preset,
    id: uuidv4(),
    name: customName ?? `${preset.name} (Custom)`,
    isPreset: false,
    createdAt: new Date().toISOString(),
    levels: preset.levels.map((l) => ({ ...l, id: uuidv4() })),
  };
}

export function renumberLevels(levels: BlindLevel[]): BlindLevel[] {
  return numberLevels(levels);
}
