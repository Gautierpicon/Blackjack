<script lang="ts">
	import { Hand as HandIcon, Plus, ChevronsUp, Copy, Flag, Sparkles } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { popIn } from '$lib/table/anim';
	import type { Hint } from '$lib/game/strategy';

	interface Props {
		canHit: boolean;
		canStand: boolean;
		canDouble: boolean;
		canSplit: boolean;
		canSurrender: boolean;
		hint: Hint | null;
		onHit: () => void;
		onStand: () => void;
		onDouble: () => void;
		onSplit: () => void;
		onSurrender: () => void;
	}

	let {
		canHit,
		canStand,
		canDouble,
		canSplit,
		canSurrender,
		hint,
		onHit,
		onStand,
		onDouble,
		onSplit,
		onSurrender
	}: Props = $props();

	interface Action {
		key: string;
		label: string;
		tip: string;
		icon: typeof Plus;
		enabled: boolean;
		handler: () => void;
		primary?: boolean;
	}

	const actions = $derived<Action[]>([
		{
			key: 'hit',
			label: 'Hit',
			tip: 'Take another card',
			icon: Plus,
			enabled: canHit,
			handler: onHit,
			primary: true
		},
		{
			key: 'stand',
			label: 'Stand',
			tip: 'Keep your total',
			icon: HandIcon,
			enabled: canStand,
			handler: onStand
		},
		{
			key: 'double',
			label: 'Double',
			tip: 'Double bet, take exactly 1 card',
			icon: ChevronsUp,
			enabled: canDouble,
			handler: onDouble
		},
		{
			key: 'split',
			label: 'Split',
			tip: 'Split a pair into 2 hands',
			icon: Copy,
			enabled: canSplit,
			handler: onSplit
		},
		{
			key: 'surrender',
			label: 'Surrender',
			tip: 'Give up half the bet',
			icon: Flag,
			enabled: canSurrender,
			handler: onSurrender
		}
	]);
</script>

<Tooltip.Provider>
	<Card.Root class="bg-card/60 backdrop-blur">
		<Card.Content class="pt-4">
			<div class="grid grid-cols-2 gap-2 sm:grid-cols-5">
				{#each actions as action (action.key)}
					<Tooltip.Root>
						<Tooltip.Trigger>
							{#snippet child({ props })}
								<Button
									{...props}
									onclick={action.handler}
									disabled={!action.enabled}
									variant={action.primary ? 'default' : 'outline'}
									class={action.primary
										? 'w-full bg-emerald-400 font-display text-black hover:bg-emerald-300'
										: action.key === 'double'
											? 'w-full border-amber-300/50 bg-amber-300/10 text-amber-200 hover:bg-amber-300/20 hover:text-amber-100'
											: action.key === 'split'
												? 'w-full border-sky-400/50 bg-sky-400/10 text-sky-200 hover:bg-sky-400/20 hover:text-sky-100'
												: action.key === 'surrender'
													? 'w-full border-orange-400/40 bg-orange-400/10 text-orange-200 hover:bg-orange-400/20 hover:text-orange-100'
													: 'w-full'}
								>
									<action.icon />
									{action.label}
								</Button>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content>{action.tip}</Tooltip.Content>
					</Tooltip.Root>
				{/each}
			</div>
			{#if hint}
				<div
					use:popIn
					class="mt-3 flex items-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/10 px-3 py-2 text-sm text-violet-200"
				>
					<Sparkles class="h-4 w-4 shrink-0" />
					<span
						><strong class="font-display">Coach:</strong> best move is <strong>{hint}</strong></span
					>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</Tooltip.Provider>
