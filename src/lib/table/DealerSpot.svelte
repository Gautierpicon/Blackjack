<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import PlayingCardBig from './PlayingCardBig.svelte';
	import { popIn, revealFlip } from './anim';
	import { formatTotal, rankValue } from '$lib/game/cards';
	import type { Card } from '$lib/game/types';

	interface Props {
		cards: Card[];
		revealed: boolean;
		shoeLeft: number;
		bust: boolean;
	}

	let { cards, revealed, shoeLeft, bust }: Props = $props();

	const upValue = $derived(cards.length > 0 ? rankValue(cards[0].rank) : null);
</script>

<div class="relative flex w-full items-start justify-center gap-6 sm:gap-10">
	<!-- Shoe -->
	<div
		class="absolute top-0 left-1 flex flex-col items-center gap-1 sm:left-4"
		aria-label="Shoe with {shoeLeft} cards"
	>
		<div class="relative h-20 w-14 sm:h-24 sm:w-16">
			<div
				class="card-back-pattern absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-lg border border-red-900/50"
			></div>
			<div
				class="card-back-pattern absolute inset-0 translate-x-0.5 translate-y-0.5 rounded-lg border border-red-900/50"
			></div>
			<div
				class="card-back-pattern absolute inset-0 rounded-lg border border-amber-200/30 shadow-[0_10px_24px_rgba(0,0,0,0.5)]"
			></div>
		</div>
		<Badge variant="secondary" class="font-display text-[10px]">{shoeLeft} left</Badge>
	</div>

	<!-- Dealer cards -->
	<div class="flex flex-col items-center gap-2">
		<div class="flex items-center gap-2">
			<span
				class="font-display text-[11px] font-bold tracking-[0.25em] text-emerald-100/60 uppercase"
			>
				Dealer
			</span>
			{#if cards.length > 0 && revealed}
				<div use:popIn class="inline-flex">
					<Badge
						variant="secondary"
						class="px-2.5 py-1 font-display text-sm font-extrabold {bust
							? 'bg-red-500 text-white hover:bg-red-500'
							: ''}"
					>
						{formatTotal(cards)}{#if bust}
							· bust{/if}
					</Badge>
				</div>
			{/if}
			{#if cards.length > 1 && !revealed && upValue !== null}
				<Badge variant="secondary" class="px-2.5 py-1 font-display text-sm font-extrabold">
					shows {upValue === 11 ? 'A' : upValue}
				</Badge>
			{/if}
		</div>
		<div class="flex gap-1.5 sm:gap-2">
			{#each cards as card, i (card.id)}
				{#if i === 1}
					<div use:revealFlip={revealed}>
						<PlayingCardBig {card} index={i} faceDown={!revealed} />
					</div>
				{:else}
					<PlayingCardBig {card} index={i} faceDown={!revealed && i === 1} />
				{/if}
			{/each}
			{#if cards.length === 0}
				<div
					class="flex h-32 w-[4.7rem] items-center justify-center rounded-xl border-2 border-dashed border-white/15 text-[10px] tracking-widest text-white/30 uppercase sm:h-40 sm:w-28"
				>
					Dealer
				</div>
			{/if}
		</div>
	</div>
</div>
