<script lang="ts">
	import { CHIP_STYLES, CHIP_VALUES } from './chips';

	interface Props {
		bankroll: number;
		currentBet: number;
		disabled?: boolean;
		/** Called on pointerdown so drag can start immediately. */
		onChipDown: (e: PointerEvent, amount: number) => void;
		onChipClick: (amount: number) => void;
	}

	let { bankroll, currentBet, disabled = false, onChipDown, onChipClick }: Props = $props();
</script>

<div class="flex items-end justify-center gap-2 sm:gap-3" role="group" aria-label="Chip rail">
	{#each CHIP_VALUES as value (value)}
		{@const s = CHIP_STYLES[value]}
		{@const cant = disabled || currentBet + value > bankroll}
		<button
			class="flex h-12 w-12 touch-none flex-col items-center justify-center rounded-full border-[3px] border-dashed font-display text-xs font-extrabold shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition active:scale-90 sm:h-14 sm:w-14 sm:text-sm {s.ring} {s.bg} {s.text} {cant
				? 'cursor-not-allowed opacity-30'
				: 'cursor-grab hover:-translate-y-1'}"
			disabled={cant}
			aria-label="Bet chip {value}"
			onpointerdown={(e) => {
				if (!cant) onChipDown(e, value);
			}}
			onclick={(e) => {
				// Pointer taps are already handled by onChipDown's pointerup;
				// only handle keyboard-activated clicks here (e.detail === 0).
				if (!cant && e.detail === 0) onChipClick(value);
			}}
		>
			<span class="leading-none opacity-70">◈</span>
			{value}
		</button>
	{/each}
</div>
