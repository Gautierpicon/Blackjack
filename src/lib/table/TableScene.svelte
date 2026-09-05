<script lang="ts">
	import {
		Volume2,
		VolumeX,
		BookOpen,
		RotateCcw,
		ChartNoAxesColumn,
		Wallet,
		ShieldCheck,
		ShieldX,
		Play,
		Trash2,
		PartyPopper,
		Frown,
		Minus,
		Lightbulb
	} from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Progress } from '$lib/components/ui/progress';
	import * as Card from '$lib/components/ui/card';
	import DealerSpot from './DealerSpot.svelte';
	import PlayerSpot from './PlayerSpot.svelte';
	import ChipRail from './ChipRail.svelte';
	import ChipStack from './ChipStack.svelte';
	import Controls from '$lib/components/Controls.svelte';
	import { popIn } from './anim';
	import gsap from 'gsap';
	import { CHIP_STYLES } from './chips';
	import type { Hint } from '$lib/game/strategy';
	import type { DealerHand, Phase, PlayerHand } from '$lib/game/types';

	interface Props {
		// Table state
		dealer: DealerHand;
		dealerRevealed: boolean;
		dealerBust: boolean;
		shoeLeft: number;
		hands: PlayerHand[];
		activeIndex: number;
		phase: Phase;
		// Betting
		betChips: number[];
		currentBet: number;
		lastBet: number;
		bankroll: number;
		minBet: number;
		canDeal: boolean;
		// Messages
		message: string;
		messageTone: 'info' | 'good' | 'bad' | 'neutral';
		settleProfit: number | null;
		// Insurance
		insuranceCost: number;
		// Actions availability
		canHit: boolean;
		canStand: boolean;
		canDouble: boolean;
		canSplit: boolean;
		canSurrender: boolean;
		hint: Hint | null;
		broke: boolean;
		// HUD
		totalBet: number;
		soundOn: boolean;
		// Callbacks
		onAddChip: (amount: number) => void;
		onRemoveLastChip: () => void;
		onClearBet: () => void;
		onAllIn: () => void;
		onDeal: () => void;
		onRebet: () => void;
		onHit: () => void;
		onStand: () => void;
		onDouble: () => void;
		onSplit: () => void;
		onSurrender: () => void;
		onNewRound: () => void;
		onTakeInsurance: () => void;
		onDeclineInsurance: () => void;
		onResetBankroll: () => void;
		onToggleSound: () => void;
		onOpenStats: () => void;
		onOpenHelp: () => void;
	}

	let {
		dealer,
		dealerRevealed,
		dealerBust,
		shoeLeft,
		hands,
		activeIndex,
		phase,
		betChips,
		currentBet,
		lastBet,
		bankroll,
		minBet,
		canDeal,
		message,
		messageTone,
		settleProfit,
		insuranceCost,
		canHit,
		canStand,
		canDouble,
		canSplit,
		canSurrender,
		hint,
		broke,
		totalBet,
		soundOn,
		onAddChip,
		onRemoveLastChip,
		onClearBet,
		onAllIn,
		onDeal,
		onRebet,
		onHit,
		onStand,
		onDouble,
		onSplit,
		onSurrender,
		onNewRound,
		onTakeInsurance,
		onDeclineInsurance,
		onResetBankroll,
		onToggleSound,
		onOpenStats,
		onOpenHelp
	}: Props = $props();

	let circleEl: HTMLDivElement | null = $state(null);
	let flyEl: HTMLDivElement | null = $state(null);
	let drag = $state<{
		amount: number;
		x: number;
		y: number;
		moved: boolean;
		startX: number;
		startY: number;
	} | null>(null);

	// Settlement chip flight (GSAP): chip travels toward the winner.
	$effect(() => {
		if (phase === 'settlement' && settleProfit !== null && settleProfit !== 0 && flyEl) {
			const win = settleProfit > 0;
			gsap.fromTo(
				flyEl,
				{ y: win ? -80 : 60, opacity: 0, scale: 0.55 },
				{ y: 0, opacity: 1, scale: 1, duration: 0.85, ease: 'power3.out' }
			);
		}
	});

	function onChipDown(e: PointerEvent, amount: number) {
		if (phase !== 'betting') return;
		drag = {
			amount,
			x: e.clientX,
			y: e.clientY,
			moved: false,
			startX: e.clientX,
			startY: e.clientY
		};
		const move = (ev: PointerEvent) => {
			if (!drag) return;
			if (Math.hypot(ev.clientX - drag.startX, ev.clientY - drag.startY) > 8) drag.moved = true;
			drag.x = ev.clientX;
			drag.y = ev.clientY;
		};
		const up = (ev: PointerEvent) => {
			window.removeEventListener('pointermove', move);
			window.removeEventListener('pointerup', up);
			window.removeEventListener('pointercancel', up);
			const d = drag;
			drag = null;
			if (!d) return;
			const r = circleEl?.getBoundingClientRect();
			const overCircle =
				r &&
				ev.clientX >= r.left - 20 &&
				ev.clientX <= r.right + 20 &&
				ev.clientY >= r.top - 20 &&
				ev.clientY <= r.bottom + 20;
			if (overCircle || !d.moved) onAddChip(d.amount);
		};
		window.addEventListener('pointermove', move);
		window.addEventListener('pointerup', up);
		window.addEventListener('pointercancel', up);
	}

	const dragStyle = $derived.by(() => {
		if (!drag || !drag.moved) return '';
		const s = CHIP_STYLES[drag.amount] ?? CHIP_STYLES[5];
		return { cls: `${s.ring} ${s.bg} ${s.text}`, label: drag.amount };
	});
</script>

<!-- HUD top bar -->
<div class="flex items-center gap-2">
	<Badge variant="secondary" class="gap-1.5 px-3 py-1.5 font-display text-sm">
		<Wallet class="h-3.5 w-3.5 text-emerald-300" /> ${bankroll}
	</Badge>
	<Badge variant="secondary" class="gap-1.5 px-3 py-1.5 font-display text-sm text-amber-300">
		Bet ${phase === 'betting' ? currentBet : totalBet}
	</Badge>
	<div class="ml-auto flex items-center gap-1.5">
		<div class="mr-1 hidden w-24 sm:block">
			<Progress value={shoeLeft} max={312} class="h-1.5" />
		</div>
		<Button variant="ghost" size="icon-sm" onclick={onToggleSound} aria-label="Toggle sound">
			{#if soundOn}<Volume2 />{:else}<VolumeX />{/if}
		</Button>
		<Button variant="ghost" size="icon-sm" onclick={onOpenStats} aria-label="Open session stats">
			<ChartNoAxesColumn />
		</Button>
		<Button variant="ghost" size="icon-sm" onclick={onOpenHelp} aria-label="Open tutorial">
			<BookOpen />
		</Button>
		<Button variant="ghost" size="icon-sm" onclick={onResetBankroll} aria-label="Reset bankroll">
			<RotateCcw />
		</Button>
	</div>
</div>

<!-- Table -->
<div class="relative">
	<!-- Wooden rim -->
	<div
		class="rounded-[2.5rem] bg-gradient-to-b from-amber-950 via-[#3a2412] to-amber-950 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.7)] sm:rounded-[3rem] sm:p-3"
	>
		<div class="felt-table relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem]">
			<div
				class="pb-10"
				style="transform: perspective(1400px) rotateX(7deg); transform-origin: center top;"
			>
				<div class="relative flex flex-col items-center px-2 pt-3">
					<DealerSpot cards={dealer.cards} revealed={dealerRevealed} {shoeLeft} bust={dealerBust} />

					<!-- Center zone -->
					<div class="my-2 flex min-h-16 flex-col items-center justify-center gap-2">
						{#if phase === 'settlement'}
							<div
								use:popIn
								class="z-10 flex items-center gap-2 rounded-2xl border bg-black/70 px-4 py-2.5 font-display text-sm font-bold backdrop-blur {messageTone ===
								'good'
									? 'border-emerald-300/50 text-emerald-200'
									: messageTone === 'bad'
										? 'border-red-400/50 text-red-200'
										: 'border-white/20 text-zinc-200'}"
							>
								{#if messageTone === 'good'}<PartyPopper class="h-4 w-4" />{/if}
								{#if messageTone === 'bad'}<Frown class="h-4 w-4" />{/if}
								{#if messageTone === 'neutral' || messageTone === 'info'}<Minus
										class="h-4 w-4"
									/>{/if}
								{message}
							</div>
							{#if settleProfit !== null && settleProfit !== 0}
								<div bind:this={flyEl} aria-hidden="true">
									<ChipStack amount={Math.abs(settleProfit)} size={40} showTotal={false} />
								</div>
							{/if}
							<Button
								onclick={onNewRound}
								class="z-10 bg-emerald-400 font-display font-extrabold text-black hover:bg-emerald-300"
							>
								<RotateCcw /> NEW ROUND{lastBet > 0 && lastBet <= bankroll
									? ` · REBET $${lastBet}`
									: ''}
							</Button>
						{:else if phase === 'insurance'}
							<div use:popIn class="z-10">
								<Card.Root class="w-72 border-amber-300/40 bg-black/80 backdrop-blur sm:w-80">
									<Card.Header class="pb-2">
										<Card.Title class="flex items-center gap-2 font-display text-sm text-amber-200">
											<Lightbulb class="h-4 w-4" /> Insurance ${insuranceCost}?
										</Card.Title>
										<Card.Description class="text-xs">
											Dealer shows an Ace. 2:1 if dealer has blackjack.
										</Card.Description>
									</Card.Header>
									<Card.Footer class="grid grid-cols-2 gap-2">
										<Button
											onclick={onTakeInsurance}
											disabled={bankroll < insuranceCost}
											class="bg-amber-300 font-display font-extrabold text-black hover:bg-amber-200"
										>
											<ShieldCheck /> Take
										</Button>
										<Button variant="outline" onclick={onDeclineInsurance}>
											<ShieldX /> No
										</Button>
									</Card.Footer>
								</Card.Root>
							</div>
						{:else if phase === 'betting' && !broke}
							{#if canDeal}
								<div use:popIn class="z-10 flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onclick={onClearBet}
										class="border-white/25 bg-black/60 backdrop-blur"
									>
										<Trash2 /> Clear
									</Button>
									<Button
										variant="outline"
										size="sm"
										onclick={onAllIn}
										class="border-amber-300/50 bg-amber-300/10 text-amber-200 backdrop-blur hover:bg-amber-300/20 hover:text-amber-100"
									>
										All-in
									</Button>
									<Button
										onclick={onDeal}
										class="bg-emerald-400 px-6 py-2.5 font-display text-base font-extrabold text-black hover:bg-emerald-300"
									>
										<Play /> DEAL
									</Button>
								</div>
							{:else if currentBet === 0}
								<p
									class="z-10 rounded-full bg-black/50 px-4 py-1.5 text-xs tracking-widest text-white/60 uppercase backdrop-blur"
								>
									Drag chips onto the circle — or tap them
								</p>
							{/if}
							{#if currentBet === 0 && lastBet >= minBet && lastBet <= bankroll}
								<Button
									variant="outline"
									size="sm"
									onclick={onRebet}
									class="z-10 border-sky-400/50 bg-sky-400/10 text-sky-200 backdrop-blur hover:bg-sky-400/20 hover:text-sky-100"
								>
									Rebet ${lastBet}
								</Button>
							{/if}
						{:else if phase === 'dealer'}
							<p
								class="z-10 animate-glow-pulse rounded-full bg-black/50 px-4 py-1.5 text-xs font-semibold tracking-widest text-white/80 uppercase backdrop-blur"
							>
								Dealer plays…
							</p>
						{:else if broke}
							<div use:popIn class="z-10">
								<Card.Root class="w-72 border-red-400/40 bg-black/80 text-center backdrop-blur">
									<Card.Header class="pb-2">
										<Card.Title class="font-display text-red-200">Out of chips!</Card.Title>
										<Card.Description>Reset your bankroll to keep playing.</Card.Description>
									</Card.Header>
									<Card.Footer>
										<Button onclick={onResetBankroll} variant="destructive" class="w-full">
											<RotateCcw /> Reset to $1000
										</Button>
									</Card.Footer>
								</Card.Root>
							</div>
						{:else}
							<p class="z-10 min-h-5 text-center text-xs text-white/50">{message}</p>
						{/if}
					</div>

					<!-- Player spots -->
					<div class="flex items-start justify-center gap-3 sm:gap-6">
						{#if hands.length === 0}
							<!-- Betting circle (drop target) -->
							<div class="flex flex-col items-center gap-2">
								<div
									bind:this={circleEl}
									class="flex h-28 w-28 items-center justify-center rounded-full border-[3px] border-dashed transition-colors sm:h-32 sm:w-32 {drag?.moved
										? 'border-amber-300 bg-amber-300/10'
										: currentBet > 0
											? 'border-amber-300/70'
											: 'border-white/30'}"
									role="button"
									aria-label="Betting circle. Click the stack to remove the last chip."
									tabindex={betChips.length > 0 ? 0 : undefined}
									onclick={() => {
										if (betChips.length > 0) onRemoveLastChip();
									}}
									onkeydown={(e) => {
										if ((e.key === 'Enter' || e.key === ' ') && betChips.length > 0) {
											e.preventDefault();
											onRemoveLastChip();
										}
									}}
								>
									{#if betChips.length > 0}
										{#key betChips.length}
											<div use:popIn>
												<ChipStack chips={betChips} amount={currentBet} size={48} maxVisible={6} />
											</div>
										{/key}
									{:else}
										<span
											class="px-3 text-center text-[10px] tracking-[0.2em] text-white/35 uppercase"
										>
											Place bet
										</span>
									{/if}
								</div>
								{#if betChips.length > 0}
									<span class="text-[10px] text-white/40">click stack to remove a chip</span>
								{/if}
							</div>
						{:else}
							{#each hands as hand, i (hand.id)}
								<PlayerSpot
									{hand}
									label={hands.length > 1 ? `Hand ${i + 1}` : 'You'}
									active={phase === 'player' && i === activeIndex}
									dimmed={phase === 'player' && i !== activeIndex}
									interactive={phase === 'player' && i === activeIndex}
									{canHit}
									{canStand}
									{canDouble}
									showBetCircle={hands.length > 1}
									{onHit}
									{onStand}
									{onDouble}
								/>
							{/each}
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Chip rail on the rim -->
	<div class="mt-3 flex justify-center">
		{#if phase === 'betting' && !broke}
			<ChipRail {bankroll} {currentBet} {onChipDown} onChipClick={onAddChip} />
		{:else if phase === 'player'}
			<div class="w-full max-w-xl">
				<Controls
					{canHit}
					{canStand}
					{canDouble}
					{canSplit}
					{canSurrender}
					{hint}
					{onHit}
					{onStand}
					{onDouble}
					{onSplit}
					{onSurrender}
				/>
			</div>
		{/if}
	</div>
</div>

<!-- Drag ghost -->
{#if drag?.moved && dragStyle}
	<div
		class="pointer-events-none fixed z-50 flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-dashed font-display text-xs font-extrabold {dragStyle.cls}"
		style="left: {drag.x - 24}px; top: {drag.y - 24}px;"
		aria-hidden="true"
	>
		{dragStyle.label}
	</div>
{/if}
