import { handValue, rankValue } from './cards';
import type { Card } from './types';

export type Hint = 'Hit' | 'Stand' | 'Double' | 'Split' | 'Surrender';

/**
 * Simplified basic strategy (stand on all 17, late surrender allowed).
 * Good enough for an in-game coach hint.
 */
export function getHint(player: Card[], dealerUp: Card, canSplitPair: boolean): Hint {
	const pv = handValue(player);
	const dealer = rankValue(dealerUp.rank);
	const total = pv.total;

	// Pair splitting
	if (player.length === 2 && canSplitPair) {
		const r = player[0].rank;
		if (r === 'A' || r === '8') return 'Split';
		if (r === '10' || r === 'J' || r === 'Q' || r === 'K') return 'Stand';
		if (r === '9') {
			if (dealer === 7 || dealer === 10 || dealer === 11) return 'Stand';
			return 'Split';
		}
		if (r === '7' && dealer <= 7) return 'Split';
		if (r === '6' && dealer <= 6 && dealer >= 2) return 'Split';
		if ((r === '4' && (dealer === 5 || dealer === 6)) || r === '3' || r === '2') {
			if (dealer <= 7 && dealer >= 2) return 'Split';
		}
	}

	// Soft hands
	if (pv.soft && total >= 13 && total <= 21) {
		if (total >= 19) return 'Stand';
		if (total === 18) {
			if (dealer >= 9 || dealer === 11) return 'Hit';
			if (dealer >= 3 && dealer <= 6) return 'Double';
			return 'Stand';
		}
		if (dealer >= 4 && dealer <= 6 && total >= 13) return 'Double';
		if (dealer >= 5 && dealer <= 6 && total === 12) return 'Double';
		return 'Hit';
	}

	// Surrender (hard 16 vs 9-A, hard 15 vs 10)
	if (player.length === 2 && !pv.soft) {
		if (total === 16 && dealer >= 9) return 'Surrender';
		if (total === 15 && dealer === 10) return 'Surrender';
	}

	// Hard hands
	if (total >= 17) return 'Stand';
	if (total >= 13 && total <= 16) return dealer <= 6 ? 'Stand' : 'Hit';
	if (total === 12) return dealer >= 4 && dealer <= 6 ? 'Stand' : 'Hit';
	if (total === 11) return 'Double';
	if (total === 10) return dealer <= 9 ? 'Double' : 'Hit';
	if (total === 9) return dealer >= 3 && dealer <= 6 ? 'Double' : 'Hit';
	return 'Hit';
}
