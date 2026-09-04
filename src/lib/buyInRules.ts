import { Tournament } from '../types/tournament';
import { Player } from '../types/player';

/**
 * Late registration (and rebuys tied to it) closes at the end of `lateRegLevels`.
 * The break immediately following that final late-reg level is the one and only
 * window during which add-ons may be purchased.
 */
export function isAddOnBreak(tournament: Tournament | null, levelIndex: number): boolean {
  if (!tournament) return false;
  const { lateRegLevels } = tournament.settings;
  if (lateRegLevels === 0) return false;
  const currentLevel = tournament.structure.levels[levelIndex];
  const previousLevel = tournament.structure.levels[levelIndex - 1];
  return (
    currentLevel?.type === 'break' &&
    previousLevel?.type === 'play' &&
    previousLevel.levelNumber === lateRegLevels
  );
}

export interface BuyInEligibility {
  allowed: boolean;
  reason?: string;
}

const NOT_STARTED: BuyInEligibility = {
  allowed: false,
  reason: 'Start the game first',
};

export function canAddRebuy(tournament: Tournament | null, player: Player | undefined): BuyInEligibility {
  if (!tournament || !player) return { allowed: false };
  if (tournament.status === 'setup') return NOT_STARTED;
  const { rebuyLevels, maxRebuys } = tournament.settings;
  if (rebuyLevels === 0) {
    return { allowed: false, reason: 'Rebuys are not allowed in this tournament' };
  }
  const currentLevel = tournament.structure.levels[tournament.currentLevelIndex];
  const currentLevelNumber = currentLevel?.levelNumber ?? 0;
  if (currentLevelNumber > rebuyLevels) {
    return { allowed: false, reason: `Rebuys closed after level ${rebuyLevels}` };
  }
  const rebuyCount = Math.max(0, player.buyInCount - 1);
  if (maxRebuys !== 0 && rebuyCount >= maxRebuys) {
    return { allowed: false, reason: `Max rebuys (${maxRebuys}) reached` };
  }
  return { allowed: true };
}

export function canRemoveRebuy(tournament: Tournament | null, player: Player | undefined): BuyInEligibility {
  if (!tournament || !player) return { allowed: false };
  if (tournament.status === 'setup') return NOT_STARTED;
  if (player.buyInCount <= 1) return { allowed: false };
  return { allowed: true };
}

export function canAddAddOn(tournament: Tournament | null): BuyInEligibility {
  if (!tournament) return { allowed: false };
  if (tournament.status === 'setup') return NOT_STARTED;
  if (tournament.settings.lateRegLevels === 0) {
    return { allowed: false, reason: 'Add-ons are not available in this tournament' };
  }
  if (!isAddOnBreak(tournament, tournament.currentLevelIndex)) {
    return {
      allowed: false,
      reason: 'Add-ons are only available during the break after late registration closes',
    };
  }
  return { allowed: true };
}

export function canRemoveAddOn(tournament: Tournament | null, player: Player | undefined): BuyInEligibility {
  if (!tournament || !player) return { allowed: false };
  if (tournament.status === 'setup') return NOT_STARTED;
  if (player.addOnCount <= 0) return { allowed: false };
  return { allowed: true };
}
