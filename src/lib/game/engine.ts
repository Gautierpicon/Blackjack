import { handValue, isBlackjack, isBust, isPair } from './cards';
import type { Card, DealerHand, PlayerHand } from './types';

export const BLACKJACK_PAYS = 1.5;
export const MAX_SPLIT_HANDS = 4;

export function drawCard(shoe: Card[]): { card: Card; reshuffled: boolean } {
	if (shoe.length === 0) throw new Error('Shoe is empty');
	const card = shoe.pop() as Card;
	return { card, reshuffled: false };
}

export function needsReshuffle(shoe: Card[], totalCards = 312): boolean {
	return shoe.length < Math.floor(totalCards * 0.25);
}

export function canDouble(hand: PlayerHand, bankroll: number): boolean {
	if (hand.cards.length !== 2) return false;
	if (hand.doubled || hand.surrendered || hand.stood) return false;
	if (hand.fromSplitAces) return false;
	return bankroll >= hand.bet;
}

export function canSplit(hand: PlayerHand, handsCount: number, bankroll: number): boolean {
	if (!isPair(hand.cards)) return false;
	if (hand.cards.length !== 2) return false;
	if (handsCount >= MAX_SPLIT_HANDS) return false;
	if (hand.fromSplitAces) return false;
	return bankroll >= hand.bet;
}

export function canSurrender(hand: PlayerHand, handsCount: number): boolean {
	if (handsCount > 1) return false;
	if (hand.cards.length !== 2) return false;
	if (hand.doubled || hand.stood || hand.surrendered) return false;
	return true;
}

export function dealerShouldHit(cards: Card[]): boolean {
	const v = handValue(cards);
	return v.total < 17;
}

export interface SettleOutcome {
	result: Exclude<PlayerHand['result'], null>;
	/** Total chips returned to bankroll (stake + winnings). */
	payout: number;
	profit: number;
}

export function settleHand(player: PlayerHand, dealer: DealerHand): SettleOutcome {
	const pv = handValue(player.cards);
	const dv = handValue(dealer.cards);

	if (player.surrendered) {
		const payout = Math.floor(player.bet / 2);
		return { result: 'surrender', payout, profit: payout - player.bet };
	}
	if (pv.bust) {
		return { result: 'bust', payout: 0, profit: -player.bet };
	}
	const playerBJ = isBlackjack(player.cards) && !player.fromSplitAces;
	const dealerBJ = isBlackjack(dealer.cards);

	if (playerBJ && dealerBJ) return { result: 'push', payout: player.bet, profit: 0 };
	if (playerBJ && !dealerBJ) {
		const payout = player.bet + Math.floor(player.bet * BLACKJACK_PAYS);
		return { result: 'blackjack', payout, profit: payout - player.bet };
	}
	if (!playerBJ && dealerBJ) return { result: 'lose', payout: 0, profit: -player.bet };
	if (dv.bust) {
		return { result: 'win', payout: player.bet * 2, profit: player.bet };
	}
	if (pv.total > dv.total) return { result: 'win', payout: player.bet * 2, profit: player.bet };
	if (pv.total < dv.total) return { result: 'lose', payout: 0, profit: -player.bet };
	return { result: 'push', payout: player.bet, profit: 0 };
}

export function dealerHasAceUp(dealer: DealerHand): boolean {
	return dealer.cards.length > 0 && dealer.cards[0].rank === 'A';
}

export function dealerHasBlackjack(dealer: DealerHand): boolean {
	return isBlackjack(dealer.cards);
}

export function playerHasBlackjack(hands: PlayerHand[]): boolean {
	return hands.length === 1 && isBlackjack(hands[0].cards);
}

export function allHandsResolved(hands: PlayerHand[]): boolean {
	return hands.every((h) => h.stood || h.played || isBust(h.cards) || h.surrendered);
}
