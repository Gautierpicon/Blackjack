<script lang="ts">
	import { History, TrendingUp, TrendingDown, Minus } from '@lucide/svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { GameStats, HistoryEntry } from '$lib/game/types';

	interface Props {
		open?: boolean;
		stats: GameStats;
		history: HistoryEntry[];
		net: number;
	}

	let { open = $bindable(false), stats, history, net }: Props = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[85vh] overflow-y-auto sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title class="font-display text-lg font-extrabold">Session</Dialog.Title>
			<Dialog.Description>Your results at this table.</Dialog.Description>
		</Dialog.Header>

		<dl class="grid grid-cols-2 gap-2 text-sm">
			<div class="rounded-xl border bg-muted/40 p-2.5">
				<dt class="text-[11px] tracking-wide text-muted-foreground uppercase">Rounds</dt>
				<dd class="font-display text-lg font-extrabold">{stats.rounds}</dd>
			</div>
			<div class="rounded-xl border bg-muted/40 p-2.5">
				<dt class="text-[11px] tracking-wide text-muted-foreground uppercase">Blackjacks</dt>
				<dd class="font-display text-lg font-extrabold text-amber-300">{stats.blackjacks}</dd>
			</div>
			<div class="rounded-xl border bg-muted/40 p-2.5">
				<dt class="text-[11px] tracking-wide text-muted-foreground uppercase">Biggest win</dt>
				<dd class="font-display text-lg font-extrabold text-emerald-300">+${stats.biggestWin}</dd>
			</div>
			<div class="rounded-xl border bg-muted/40 p-2.5">
				<dt class="text-[11px] tracking-wide text-muted-foreground uppercase">Net</dt>
				<dd
					class="font-display text-lg font-extrabold {net >= 0
						? 'text-emerald-300'
						: 'text-red-300'}"
				>
					{net >= 0 ? '+' : ''}{net}
				</dd>
			</div>
		</dl>

		<Separator />

		<div>
			<h3
				class="mb-2 flex items-center gap-1.5 font-display text-sm font-bold tracking-widest uppercase"
			>
				<History class="h-4 w-4 text-muted-foreground" /> Last rounds
			</h3>
			{#if history.length === 0}
				<p class="text-sm text-muted-foreground">No rounds yet.</p>
			{:else}
				<ul class="max-h-48 space-y-1.5 overflow-y-auto pr-1">
					{#each history as entry (entry.id)}
						<li
							class="flex items-center justify-between gap-2 rounded-xl bg-muted/40 px-3 py-2 text-sm"
						>
							<span class="flex min-w-0 items-center gap-2">
								{#if entry.profit > 0}
									<TrendingUp class="h-3.5 w-3.5 shrink-0 text-emerald-400" />
								{:else if entry.profit < 0}
									<TrendingDown class="h-3.5 w-3.5 shrink-0 text-red-400" />
								{:else}
									<Minus class="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
								{/if}
								<span class="truncate text-zinc-300">{entry.label}</span>
							</span>
							<Badge
								variant={entry.profit > 0
									? 'default'
									: entry.profit < 0
										? 'destructive'
										: 'secondary'}
								class={entry.profit > 0
									? 'shrink-0 bg-emerald-400 font-display text-black hover:bg-emerald-400'
									: 'shrink-0 font-display'}
							>
								{entry.profit > 0 ? '+' : ''}{entry.profit}
							</Badge>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
