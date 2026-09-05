<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { Toaster as ShadcnToaster } from '$lib/components/ui/sonner';
	import TableScene from '$lib/table/TableScene.svelte';
	import StatsDialog from '$lib/table/StatsDialog.svelte';
	import HelpModal from '$lib/components/HelpModal.svelte';
	import { createShoe, handValue, isBlackjack, isBust } from '$lib/game/cards';
	import {
		allHandsResolved,
		canDouble as canDoubleHand,
		canSplit as canSplitHand,
		canSurrender as canSurrenderHand,
		dealerHasAceUp,
		dealerHasBlackjack,
		dealerShouldHit,
		needsReshuffle,
		settleHand
	} from '$lib/game/engine';
	import { getHint, type Hint } from '$lib/game/strategy';
	import {
		MIN_BET,
		STARTING_BANKROLL,
		loadBankroll,
		loadHistory,
		loadStats,
		resetAll,
		saveBankroll,
		saveHistory,
		saveStats
	} from '$lib/game/storage';
	import { sound } from '$lib/game/sound';
	import { breakdownChips } from '$lib/table/chips';
	import type {
		Card as TCard,
		DealerHand,
		HistoryEntry,
		GameStats,
		Phase,
		PlayerHand
	} from '$lib/game/types';

	let shoe = $state<TCard[]>(createShoe(6));
	let bankroll = $state<number>(STARTING_BANKROLL);
	let betChips = $state<number[]>([]);
	let lastBet = $state(0);
	let hands = $state<PlayerHand[]>([]);
	let activeIndex = $state(0);
	let dealer = $state<DealerHand>({ cards: [] });
	let phase = $state<Phase>('betting');
	let insuranceBet = $state(0);
	let message = $state('Place your bet to start.');
	let messageTone = $state<'info' | 'good' | 'bad' | 'neutral'>('info');
	let settleProfit = $state<number | null>(null);
	let stats = $state<GameStats>(loadStats());
	let history = $state<HistoryEntry[]>(loadHistory());
	let helpOpen = $state(false);
	let statsOpen = $state(false);
	let soundOn = $state(true);
	let busy = $state(false);
	let handSeq = $state(1);

	// Load persisted bankroll on mount (avoid SSR localStorage mismatch by lazy init)
	$effect(() => {
		bankroll = loadBankroll();
		history = loadHistory();
		stats = loadStats();
		soundOn = sound.enabled;
	});

	const currentBet = $derived(betChips.reduce((s, c) => s + c, 0));
	const totalBet = $derived(hands.reduce((s, h) => s + h.bet, 0) + insuranceBet);
	const activeHand = $derived(hands[activeIndex]);
	const dealerRevealed = $derived(phase === 'dealer' || phase === 'settlement');
	const dealerBust = $derived(dealerRevealed && handValue(dealer.cards).bust);
	const broke = $derived(phase === 'betting' && bankroll < MIN_BET && currentBet === 0);
	const insuranceCost = $derived(hands.length > 0 ? Math.floor(hands[0].bet / 2) : 0);

	const hint: Hint | null = $derived.by(() => {
		if (phase !== 'player' || !activeHand || activeHand.cards.length === 0) return null;
		if (dealer.cards.length === 0) return null;
		return getHint(
			activeHand.cards,
			dealer.cards[0],
			canSplitHand(activeHand, hands.length, bankroll)
		);
	});

	const canHit = $derived(
		phase === 'player' && !!activeHand && !isBust(activeHand.cards) && !activeHand.stood
	);
	const canStand = $derived(
		phase === 'player' && !!activeHand && !isBust(activeHand.cards) && !activeHand.stood
	);
	const canDouble = $derived(
		phase === 'player' && !!activeHand && canDoubleHand(activeHand, bankroll)
	);
	const canSplit = $derived(
		phase === 'player' && !!activeHand && canSplitHand(activeHand, hands.length, bankroll)
	);
	const canSurrender = $derived(
		phase === 'player' && !!activeHand && canSurrenderHand(activeHand, hands.length)
	);
	const canDeal = $derived(
		phase === 'betting' && currentBet >= MIN_BET && currentBet <= bankroll && !busy
	);

	function persist() {
		saveBankroll(bankroll);
		saveStats(stats);
		saveHistory(history);
	}

	function popShoe(): TCard {
		if (shoe.length === 0) shoe = createShoe(6);
		return shoe.pop() as TCard;
	}

	function ensureShoe() {
		if (needsReshuffle(shoe)) {
			shoe = createShoe(6);
			sound.play('shuffle');
			toast.info('Shoe reshuffled', { description: 'A fresh 6-deck shoe is in play.' });
		}
	}

	// --- Betting ---
	function addChip(amount: number) {
		if (phase !== 'betting') return;
		if (currentBet + amount > bankroll) return;
		betChips = [...betChips, amount];
		sound.play('chip');
	}
	function removeLastChip() {
		if (phase !== 'betting' || betChips.length === 0) return;
		betChips = betChips.slice(0, -1);
		sound.play('click');
	}
	function clearBet() {
		betChips = [];
		sound.play('click');
	}
	function allIn() {
		if (phase !== 'betting' || bankroll < MIN_BET) return;
		betChips = breakdownChips(bankroll);
		sound.play('chip');
	}
	function rebet() {
		if (phase !== 'betting' || lastBet > bankroll || lastBet < MIN_BET) return;
		betChips = breakdownChips(lastBet);
		sound.play('chip');
	}

	// --- Deal ---
	function deal() {
		if (!canDeal) return;
		ensureShoe();
		bankroll -= currentBet;
		lastBet = currentBet;
		const bet = currentBet;
		betChips = [];
		insuranceBet = 0;
		settleProfit = null;
		hands = [
			{
				id: handSeq++,
				cards: [],
				bet,
				stood: false,
				doubled: false,
				surrendered: false,
				fromSplitAces: false,
				played: false,
				result: null,
				payout: 0
			}
		];
		activeIndex = 0;
		dealer = { cards: [] };
		message = '';
		// Deal P, D, P, D
		hands[0].cards.push(popShoe());
		dealer.cards.push(popShoe());
		hands[0].cards.push(popShoe());
		dealer.cards.push(popShoe());
		sound.play('card');
		persist();

		const playerBJ = isBlackjack(hands[0].cards);
		if (dealerHasAceUp(dealer) && !isBust(hands[0].cards)) {
			phase = 'insurance';
			message = playerBJ
				? 'Blackjack! Dealer shows an Ace — take even money with insurance?'
				: 'Dealer shows an Ace. Insurance?';
			messageTone = 'info';
			return;
		}
		if (playerBJ || dealerHasBlackjack(dealer)) {
			void settle(true);
			return;
		}
		phase = 'player';
		message = 'Your move.';
		messageTone = 'info';
	}

	function declineInsurance() {
		if (phase !== 'insurance') return;
		sound.play('click');
		if (dealerHasBlackjack(dealer)) {
			void settle(true);
			return;
		}
		if (isBlackjack(hands[0].cards)) {
			void settle(true);
			return;
		}
		phase = 'player';
		message = 'Your move.';
		messageTone = 'info';
	}

	function takeInsurance() {
		if (phase !== 'insurance') return;
		const cost = Math.floor(hands[0].bet / 2);
		if (bankroll < cost) return;
		bankroll -= cost;
		insuranceBet = cost;
		sound.play('chip');
		persist();
		// Resolve immediately: if dealer has BJ, insurance pays 2:1
		if (dealerHasBlackjack(dealer)) {
			const insurancePayout = insuranceBet * 3; // stake back + 2:1 win
			bankroll += insurancePayout;
			void settle(true, insurancePayout - insuranceBet);
			return;
		}
		if (isBlackjack(hands[0].cards)) {
			void settle(true);
			return;
		}
		phase = 'player';
		message = 'Insurance placed. Your move.';
		messageTone = 'info';
	}

	// --- Player actions ---
	function advanceOrDealer() {
		if (allHandsResolved(hands)) {
			void dealerTurn();
			return;
		}
		const next = hands.findIndex(
			(h) => !h.stood && !h.surrendered && !isBust(h.cards) && !h.played
		);
		if (next === -1) {
			void dealerTurn();
		} else {
			activeIndex = next;
		}
	}

	function doHit() {
		if (!canHit || !activeHand) return;
		if (activeHand.fromSplitAces) return; // split aces get exactly one card
		activeHand.cards.push(popShoe());
		sound.play('card');
		const v = handValue(activeHand.cards);
		if (v.bust || v.total === 21) {
			activeHand.played = true;
			activeHand.stood = true;
			advanceOrDealer();
		}
	}

	function doStand() {
		if (!canStand || !activeHand) return;
		activeHand.stood = true;
		activeHand.played = true;
		sound.play('click');
		advanceOrDealer();
	}

	function doDouble() {
		if (!canDouble || !activeHand) return;
		bankroll -= activeHand.bet;
		activeHand.bet *= 2;
		activeHand.cards.push(popShoe());
		activeHand.doubled = true;
		activeHand.stood = true;
		activeHand.played = true;
		sound.play('card');
		persist();
		advanceOrDealer();
	}

	function doSplit() {
		if (!canSplit || !activeHand) return;
		const hand = activeHand;
		bankroll -= hand.bet;
		const [first, second] = hand.cards;
		const isAces = first.rank === 'A';
		const firstHand: PlayerHand = {
			id: handSeq++,
			cards: [first, popShoe()],
			bet: hand.bet,
			stood: false,
			doubled: false,
			surrendered: false,
			fromSplitAces: isAces,
			played: false,
			result: null,
			payout: 0
		};
		const secondHand: PlayerHand = {
			id: handSeq++,
			cards: [second, popShoe()],
			bet: hand.bet,
			stood: false,
			doubled: false,
			surrendered: false,
			fromSplitAces: isAces,
			played: false,
			result: null,
			payout: 0
		};
		if (isAces) {
			// Split aces: one card each, auto-stand
			firstHand.stood = true;
			firstHand.played = true;
			secondHand.stood = true;
			secondHand.played = true;
		}
		hands = [
			...hands.slice(0, activeIndex),
			firstHand,
			secondHand,
			...hands.slice(activeIndex + 1)
		];
		sound.play('card');
		persist();
		if (isAces || allHandsResolved(hands)) {
			void dealerTurn();
			return;
		}
		activeIndex = hands.indexOf(firstHand);
	}

	function doSurrender() {
		if (!canSurrender || !activeHand) return;
		activeHand.surrendered = true;
		activeHand.played = true;
		activeHand.stood = true;
		sound.play('click');
		advanceOrDealer();
	}

	async function dealerTurn() {
		phase = 'dealer';
		message = 'Dealer plays…';
		messageTone = 'info';
		// If all player hands busted/surrendered, skip drawing
		const anyLive = hands.some((h) => !isBust(h.cards) && !h.surrendered);
		if (anyLive) {
			await new Promise((r) => setTimeout(r, 550));
			while (dealerShouldHit(dealer.cards)) {
				dealer.cards.push(popShoe());
				sound.play('card');
				await new Promise((r) => setTimeout(r, 650));
			}
		} else {
			await new Promise((r) => setTimeout(r, 400));
		}
		await settle(false);
	}

	async function settle(instant = false, insuranceProfit = 0) {
		phase = 'dealer';
		if (!instant) await new Promise((r) => setTimeout(r, 250));
		phase = 'settlement';

		let roundProfit = insuranceProfit;
		let wins = 0;
		let losses = 0;
		let pushes = 0;
		let bjCount = 0;

		for (const h of hands) {
			const outcome = settleHand(h, dealer);
			h.result = outcome.result;
			h.payout = outcome.payout;
			bankroll += outcome.payout;
			roundProfit += outcome.profit;
			if (outcome.result === 'win' || outcome.result === 'blackjack') wins++;
			else if (outcome.result === 'push') pushes++;
			else losses++;
			if (outcome.result === 'blackjack') bjCount++;
		}

		stats.rounds += 1;
		// Classify the round by net profit (handles mixed split results)
		if (roundProfit > 0) stats.wins += 1;
		else if (roundProfit < 0) stats.losses += 1;
		else stats.pushes += 1;
		stats.blackjacks += bjCount;
		if (roundProfit > stats.biggestWin) stats.biggestWin = roundProfit;
		settleProfit = roundProfit;

		const pv = hands.length === 1 ? handValue(hands[0].cards).total : 0;
		const dv = handValue(dealer.cards).total;
		const summary =
			hands.length > 1
				? `Split: ${wins}W/${losses}L/${pushes}P`
				: hands[0].result === 'blackjack'
					? 'Blackjack!'
					: hands[0].result === 'bust'
						? 'Bust.'
						: hands[0].result === 'surrender'
							? 'Surrendered.'
							: handValue(dealer.cards).bust
								? 'Dealer busts.'
								: `${pv} vs ${dv}.`;

		if (roundProfit > 0) {
			message = `You win ${insuranceBet > 0 && dealerHasBlackjack(dealer) ? '(insurance paid) ' : ''}+$${roundProfit} — ${summary}`;
			messageTone = 'good';
			sound.play('win');
			toast.success(`+$${roundProfit}`, { description: summary });
		} else if (roundProfit < 0) {
			message = `You lose $${Math.abs(roundProfit)} — ${summary}`;
			messageTone = 'bad';
			sound.play('lose');
			toast.error(`-$${Math.abs(roundProfit)}`, { description: summary });
		} else {
			message = `Push — ${summary} Bet returned.`;
			messageTone = 'neutral';
			sound.play('push');
			toast.info('Push', { description: `${summary} Bet returned.` });
		}

		history = [
			{
				id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
				date: Date.now(),
				label: `${summary} (You ${pv || 'split'} / Dealer ${dv})`,
				profit: roundProfit,
				playerTotal: pv,
				dealerTotal: dv
			},
			...history
		].slice(0, 20);

		insuranceBet = 0;
		persist();
	}

	function newRound() {
		hands = [];
		dealer = { cards: [] };
		activeIndex = 0;
		insuranceBet = 0;
		settleProfit = null;
		phase = 'betting';
		message = 'Place your bet to start.';
		messageTone = 'info';
		sound.play('click');
	}

	function resetBankroll() {
		const r = resetAll();
		bankroll = r.bankroll;
		stats = r.stats;
		history = r.history;
		newRound();
		message = `Bankroll reset to $${STARTING_BANKROLL}. Good luck!`;
	}
</script>

<svelte:head>
	<title>Neon Blackjack — at the table</title>
</svelte:head>

<ShadcnToaster theme="dark" position="top-center" richColors closeButton />

<div class="min-h-screen">
	<div class="mx-auto max-w-3xl space-y-3 px-3 py-4 sm:px-4">
		<TableScene
			{dealer}
			{dealerRevealed}
			{dealerBust}
			shoeLeft={shoe.length}
			{hands}
			{activeIndex}
			{phase}
			{betChips}
			{currentBet}
			{lastBet}
			{bankroll}
			minBet={MIN_BET}
			{canDeal}
			{message}
			{messageTone}
			{settleProfit}
			{insuranceCost}
			{canHit}
			{canStand}
			{canDouble}
			{canSplit}
			{canSurrender}
			{hint}
			{broke}
			{totalBet}
			{soundOn}
			onAddChip={addChip}
			onRemoveLastChip={removeLastChip}
			onClearBet={clearBet}
			onAllIn={allIn}
			onDeal={deal}
			onRebet={rebet}
			onHit={doHit}
			onStand={doStand}
			onDouble={doDouble}
			onSplit={doSplit}
			onSurrender={doSurrender}
			onNewRound={newRound}
			onTakeInsurance={takeInsurance}
			onDeclineInsurance={declineInsurance}
			onResetBankroll={resetBankroll}
			onToggleSound={() => {
				soundOn = sound.toggle();
			}}
			onOpenStats={() => (statsOpen = true)}
			onOpenHelp={() => {
				helpOpen = true;
				sound.play('click');
			}}
		/>

		<footer class="space-y-1 pb-2 text-center text-[11px] text-muted-foreground">
			<p class="font-display font-bold tracking-[0.2em] text-amber-100/40 uppercase">
				Blackjack pays 3 to 2 · Dealer must stand on 17 · Insurance pays 2 to 1
			</p>
			<p>Tap cards to hit · swipe → to stand · swipe ↑ to double</p>
		</footer>
	</div>
</div>

<StatsDialog bind:open={statsOpen} {stats} {history} net={bankroll - STARTING_BANKROLL} />
<HelpModal bind:open={helpOpen} />
