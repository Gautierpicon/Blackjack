import type { GameStats, HistoryEntry } from './types';

const BANKROLL_KEY = 'neon-bj-bankroll-v1';
const STATS_KEY = 'neon-bj-stats-v1';
const HISTORY_KEY = 'neon-bj-history-v1';

export const STARTING_BANKROLL = 1000;
export const MIN_BET = 5;

export const emptyStats: GameStats = {
	rounds: 0,
	wins: 0,
	losses: 0,
	pushes: 0,
	blackjacks: 0,
	biggestWin: 0
};

function safeParse<T>(raw: string | null, fallback: T): T {
	if (!raw) return fallback;
	try {
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
}

export function loadBankroll(): number {
	if (typeof localStorage === 'undefined') return STARTING_BANKROLL;
	const raw = localStorage.getItem(BANKROLL_KEY);
	if (raw === null) return STARTING_BANKROLL;
	const n = Number(raw);
	return Number.isFinite(n) && n >= 0 ? Math.floor(n) : STARTING_BANKROLL;
}

export function saveBankroll(v: number): void {
	try {
		localStorage.setItem(BANKROLL_KEY, String(Math.floor(v)));
	} catch {
		/* ignore */
	}
}

export function loadStats(): GameStats {
	if (typeof localStorage === 'undefined') return { ...emptyStats };
	return { ...emptyStats, ...safeParse(localStorage.getItem(STATS_KEY), {}) };
}

export function saveStats(s: GameStats): void {
	try {
		localStorage.setItem(STATS_KEY, JSON.stringify(s));
	} catch {
		/* ignore */
	}
}

export function loadHistory(): HistoryEntry[] {
	if (typeof localStorage === 'undefined') return [];
	const h = safeParse<HistoryEntry[]>(localStorage.getItem(HISTORY_KEY), []);
	return Array.isArray(h) ? h.slice(0, 20) : [];
}

export function saveHistory(h: HistoryEntry[]): void {
	try {
		localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 20)));
	} catch {
		/* ignore */
	}
}

export function resetAll(): { bankroll: number; stats: GameStats; history: HistoryEntry[] } {
	const bankroll = STARTING_BANKROLL;
	const stats = { ...emptyStats };
	const history: HistoryEntry[] = [];
	saveBankroll(bankroll);
	saveStats(stats);
	saveHistory(history);
	return { bankroll, stats, history };
}
