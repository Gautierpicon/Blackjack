import type { Card, Rank, Suit } from './types';

export const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

let uid = 0;
const nextId = () => `c${Date.now().toString(36)}-${uid++}`;

export function createShoe(decks = 6): Card[] {
	const shoe: Card[] = [];
	for (let d = 0; d < decks; d++) {
		for (const suit of SUITS) {
			for (const rank of RANKS) {
				shoe.push({ id: nextId(), rank, suit });
			}
		}
	}
	return shuffle(shoe);
}

export function shuffle<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

export function rankValue(rank: Rank): number {
	if (rank === 'A') return 11;
	if (rank === 'K' || rank === 'Q' || rank === 'J') return 10;
	return parseInt(rank, 10);
}

export interface HandValue {
	total: number;
	soft: boolean;
	low: number;
	bust: boolean;
	blackjack: boolean;
}

export function handValue(cards: Card[]): HandValue {
	let total = 0;
	let aces = 0;
	for (const c of cards) {
		total += rankValue(c.rank);
		if (c.rank === 'A') aces++;
	}
	while (total > 21 && aces > 0) {
		total -= 10;
		aces--;
	}
	const low = total;
	const soft = hasUsableAce(cards);
	return {
		total,
		soft,
		low,
		bust: total > 21,
		blackjack: cards.length === 2 && total === 21
	};
}

function hasUsableAce(cards: Card[]): boolean {
	let total = 0;
	let aces = 0;
	for (const c of cards) {
		total += c.rank === 'A' ? 1 : rankValue(c.rank);
		if (c.rank === 'A') aces++;
	}
	return aces > 0 && total + 10 <= 21;
}

export function isBlackjack(cards: Card[]): boolean {
	return handValue(cards).blackjack;
}

export function isBust(cards: Card[]): boolean {
	return handValue(cards).bust;
}

export function isPair(cards: Card[]): boolean {
	if (cards.length !== 2) return false;
	return rankValue(cards[0].rank) === rankValue(cards[1].rank);
}

export function dealerUpValue(card: Card): number {
	return rankValue(card.rank);
}

export function formatTotal(cards: Card[]): string {
	const v = handValue(cards);
	if (cards.length === 0) return '';
	if (v.soft && v.total !== 21 && v.total > 11) {
		return `${v.total - 10}/${v.total}`;
	}
	return `${v.total}`;
}
