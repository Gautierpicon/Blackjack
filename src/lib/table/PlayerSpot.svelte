<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import PlayingCardBig from './PlayingCardBig.svelte';
	import ChipStack from './ChipStack.svelte';
	import { popIn } from './anim';
	import { formatTotal } from '$lib/game/cards';
	import { handValue, isBust } from '$lib/game/cards';
	import { cn } from '$lib/utils';
	import type { HandResult, PlayerHand } from '$lib/game/types';

	interface Props {
		hand: PlayerHand | null;
		label: string;
		active?: boolean;
		dimmed?: boolean;
		interactive?: boolean;
		canHit?: boolean;
		canStand?: boolean;
		canDouble?: boolean;
		showBetCircle?: boolean;
		onHit?: () => void;
		onStand?: () => void;
		onDouble?: () => void;
	}

	let {
		hand,
		label,
		active = false,
		dimmed = false,
		interactive = false,
		canHit = false,
		canStand = false,
		canDouble = false,
		showBetCircle = true,
		onHit,
		onStand,
		onDouble
	}: Props = $props();

	const cards = $derived(hand?.cards ?? []);
	const n = $derived(cards.length);
	const bust = $derived(hand ? isBust(hand.cards) : false);
	const value = $derived(hand ? handValue(hand.cards) : null);
	const result: HandResult = $derived(hand?.result ?? null);

	let startX = 0;
	let startY = 0;
	let startT = 0;

	function onPointerDown(e: PointerEvent) {
		if (!interactive) return;
		startX = e.clientX;
		startY = e.clientY;
		startT = Date.now();
	}

	function onKeyDown(e: KeyboardEvent) {
		if (!interactive) return;
		if ((e.key === 'Enter' || e.key === ' ') && canHit) {
			e.preventDefault();
			onHit?.();
		}
	}

	function onPointerUp(e: PointerEvent) {
		if (!interactive) return;
		const dx = e.clientX - startX;
		const dy = e.clientY - startY;
		const dt = Date.now() - startT;
		const adx = Math.abs(dx);
		const ady = Math.abs(dy);
		if (Math.max(adx, ady) < 12 && dt < 400) {
			if (canHit) onHit?.();
		} else if (dx > 60 && ady < 50) {
			if (canStand) onStand?.();
		} else if (dy < -60 && adx < 60) {
			if (canDouble) onDouble?.();
		}
	}
</script>

<div class={cn('flex flex-col items-center gap-2 transition-opacity', dimmed && 'opacity-55')}>
	<!-- Bet circle -->
	{#if showBetCircle}
		<div
			class={cn(
				'flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed transition-colors sm:h-24 sm:w-24',
				active ? 'border-amber-300/80' : 'border-white/25'
			)}
		>
			{#if hand && hand.bet > 0}
				<ChipStack amount={hand.bet} size={44} />
			{:else}
				<span class="px-2 text-center text-[9px] tracking-widest text-white/30 uppercase">
					{label}
				</span>
			{/if}
		</div>
	{/if}

	<!-- Cards -->
	<div
		class={cn(
			'flex items-start rounded-2xl px-2 pt-3 pb-1 transition-all',
			active && 'bg-amber-300/[0.07] shadow-[0_0_36px_rgba(251,191,36,0.18)]',
			interactive && 'touch-none'
		)}
		style="touch-action: {interactive ? 'none' : 'auto'};"
		onpointerdown={onPointerDown}
		onpointerup={onPointerUp}
		onkeydown={onKeyDown}
		role="button"
		aria-label={interactive
			? `${label}: tap to hit, swipe right to stand, swipe up to double`
			: label}
		tabindex={interactive ? 0 : -1}
	>
		{#each cards as card, i (card.id)}
			{@const off = i - (n - 1) / 2}
			<div class={i > 0 ? '-ml-6 sm:-ml-8' : ''}>
				<PlayingCardBig {card} index={i} rotation={n > 1 ? off * 7 : 0} lift={Math.abs(off) * 5} />
			</div>
		{/each}
		{#if cards.length === 0}
			<div
				class="flex h-32 w-[4.7rem] items-center justify-center rounded-xl border-2 border-dashed border-white/15 text-[10px] tracking-widest text-white/30 uppercase sm:h-40 sm:w-28"
			>
				Your cards
			</div>
		{/if}
	</div>

	<!-- Total + result -->
	<div class="flex min-h-7 flex-wrap items-center justify-center gap-1.5">
		{#if hand && cards.length > 0}
			<div use:popIn class="inline-flex">
				<Badge
					variant="secondary"
					class={cn(
						'border-white/25 bg-black/70 px-3 py-1 font-display text-base font-extrabold text-white',
						bust && 'border-red-400 bg-red-500 text-white hover:bg-red-500'
					)}
				>
					{formatTotal(cards)}{#if value && value.soft && !bust}
						soft{/if}{#if bust}
						· bust{/if}
				</Badge>
			</div>
		{/if}
		{#if result}
			<div use:popIn class="inline-flex">
				<Badge
					class={cn(
						'font-display font-extrabold tracking-wide uppercase',
						result === 'blackjack' || result === 'win'
							? 'bg-emerald-400 text-black hover:bg-emerald-400'
							: result === 'push'
								? 'bg-zinc-400 text-black hover:bg-zinc-400'
								: result === 'surrender'
									? 'bg-orange-400 text-black hover:bg-orange-400'
									: 'bg-red-500 text-white hover:bg-red-500'
					)}
				>
					{result === 'blackjack' ? 'Blackjack!' : result}
				</Badge>
			</div>
		{/if}
		{#if interactive}
			<span class="ml-1 hidden text-[10px] text-white/40 sm:inline">
				tap = hit · swipe → = stand · swipe ↑ = double
			</span>
		{/if}
	</div>
</div>
