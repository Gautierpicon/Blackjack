<script lang="ts">
	import { dealIn } from './anim';
	import type { Card } from '$lib/game/types';

	interface Props {
		card: Card;
		faceDown?: boolean;
		index?: number;
		/** Fan rotation in degrees (player hands). 0 = straight (dealer). */
		rotation?: number;
		/** Vertical lift in px for fan effect. */
		lift?: number;
	}

	let { card, faceDown = false, index = 0, rotation = 0, lift = 0 }: Props = $props();

	const suitSymbol: Record<Card['suit'], string> = {
		spades: '♠',
		hearts: '♥',
		diamonds: '♦',
		clubs: '♣'
	};

	const isRed = $derived(card.suit === 'hearts' || card.suit === 'diamonds');
</script>

<div
	use:dealIn={{ index, rotation, lift }}
	class="relative shrink-0 overflow-hidden rounded-xl border-2 shadow-[0_14px_36px_rgba(0,0,0,0.6)] {faceDown
		? 'card-back-pattern border-red-900/60'
		: 'border-zinc-100/90 bg-gradient-to-br from-white via-zinc-50 to-zinc-200'} h-32 w-[4.7rem] sm:h-40 sm:w-28"
	style="transform: rotate({rotation}deg) translateY({lift}px);"
	role="img"
	aria-label={faceDown ? 'Face down card' : `${card.rank} of ${card.suit}`}
>
	{#if faceDown}
		<div class="flex h-full w-full items-center justify-center">
			<div
				class="flex h-16 w-11 items-center justify-center rounded-lg border border-amber-300/50 bg-black/40 font-display text-lg font-bold text-amber-300 sm:h-20 sm:w-14 sm:text-xl"
			>
				BJ
			</div>
		</div>
	{:else}
		<div class="flex h-full flex-col justify-between p-2 sm:p-2.5">
			<div
				class="font-display text-base leading-none font-extrabold sm:text-xl {isRed
					? 'text-red-600'
					: 'text-zinc-900'}"
			>
				{card.rank}
				<div class="text-xs sm:text-sm">{suitSymbol[card.suit]}</div>
			</div>
			<div
				class="self-center text-3xl sm:text-4xl {isRed ? 'text-red-600/90' : 'text-zinc-800/90'}"
			>
				{suitSymbol[card.suit]}
			</div>
			<div
				class="rotate-180 self-end font-display text-base leading-none font-extrabold sm:text-xl {isRed
					? 'text-red-600'
					: 'text-zinc-900'}"
			>
				{card.rank}
			</div>
		</div>
	{/if}
</div>
