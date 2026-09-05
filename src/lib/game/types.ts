export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
	id: string;
	rank: Rank;
	suit: Suit;
}

export type HandResult = 'blackjack' | 'win' | 'push' | 'lose' | 'bust' | 'surrender' | null;

export interface PlayerHand {
	id: number;
	cards: Card[];
	bet: number;
	stood: boolean;
	doubled: boolean;
	surrendered: boolean;
	fromSplitAces: boolean;
	played: boolean;
	result: HandResult;
	payout: number;
}

export interface DealerHand {
	cards: Card[];
}

export type Phase = 'betting' | 'insurance' | 'player' | 'dealer' | 'settlement';

export interface HistoryEntry {
	id: string;
	date: number;
	label: string;
	profit: number;
	playerTotal: number;
	dealerTotal: number;
}

export interface GameStats {
	rounds: number;
	wins: number;
	losses: number;
	pushes: number;
	blackjacks: number;
	biggestWin: number;
}
