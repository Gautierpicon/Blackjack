<script lang="ts">
	import { CHIP_STYLES, breakdownChips } from './chips';

	interface Props {
		/** Total amount, or explicit chip list. */
		amount: number;
		chips?: number[];
		/** px size of one chip. */
		size?: number;
		/** Show total badge (absolutely positioned, doesn't shift the stack). */
		showTotal?: boolean;
		/** Max chips drawn; overflow shown as +N in the badge. */
		maxVisible?: number;
	}

	let { amount, chips, size = 52, showTotal = true, maxVisible = 8 }: Props = $props();

	const list = $derived(chips ?? breakdownChips(amount));
	const visible = $derived(list.slice(0, maxVisible));
	const extra = $derived(list.length - visible.length);
	const stackH = $derived(visible.length === 0 ? 0 : size + (visible.length - 1) * 5);
</script>

<div
	class="relative flex flex-col items-center justify-center"
	style="width: {size}px; {showTotal && list.length > 0 ? 'padding-bottom: 20px;' : ''}"
	aria-label="Bet of ${amount}"
>
	<div class="relative" style="width: {size}px; height: {stackH}px;">
		{#each visible as chip, i (i)}
			{@const s = CHIP_STYLES[chip] ?? CHIP_STYLES[5]}
			<div
				class="absolute top-0 left-0 flex items-center justify-center rounded-full border-4 border-dashed {s.ring} {s.bg} shadow-[0_6px_16px_rgba(0,0,0,0.55)]"
				style="width: {size}px; height: {size}px; transform: translateY({(visible.length - 1 - i) *
					-5}px);"
			>
				<span
					class="rounded-full bg-black/60 px-1 font-display font-extrabold {s.text}"
					style="font-size: {size * 0.24}px;"
				>
					{chip}
				</span>
			</div>
		{/each}
	</div>
	{#if showTotal && list.length > 0}
		<div
			class="absolute bottom-0 rounded-full bg-black/70 px-2.5 py-0.5 font-display text-xs font-extrabold whitespace-nowrap text-amber-300 ring-1 ring-amber-300/40"
		>
			${amount}{#if extra > 0}+{/if}
		</div>
	{/if}
</div>
