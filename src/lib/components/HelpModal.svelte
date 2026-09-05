<script lang="ts">
	import { ShieldCheck, Coins } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import * as Dialog from '$lib/components/ui/dialog';

	interface Props {
		open?: boolean;
	}

	let { open = $bindable(false) }: Props = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-h-[85vh] overflow-y-auto sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title class="font-display text-lg font-extrabold">How to play</Dialog.Title>
			<Dialog.Description>
				Casino blackjack — 6 decks, dealer stands on all 17, blackjack pays 3:2.
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4 text-sm leading-relaxed text-zinc-300">
			<section>
				<h3 class="mb-1 font-display font-bold text-amber-300">Goal</h3>
				<p>Beat the dealer by getting closer to 21 without going over.</p>
			</section>
			<Separator />
			<section>
				<h3 class="mb-1 flex items-center gap-1.5 font-display font-bold text-amber-300">
					<Coins class="h-4 w-4" /> Payouts
				</h3>
				<ul class="list-disc space-y-1 pl-5">
					<li>Blackjack pays <strong>3:2</strong></li>
					<li>Win pays <strong>1:1</strong>, push returns your bet</li>
					<li>Insurance pays <strong>2:1</strong> (side bet = half your bet)</li>
					<li>Surrender returns <strong>half</strong> your bet</li>
				</ul>
			</section>
			<Separator />
			<section>
				<h3 class="mb-1 flex items-center gap-1.5 font-display font-bold text-amber-300">
					<ShieldCheck class="h-4 w-4" /> Actions
				</h3>
				<ul class="list-disc space-y-1 pl-5">
					<li><strong>Hit</strong> — take another card</li>
					<li><strong>Stand</strong> — keep your total</li>
					<li><strong>Double</strong> — double bet, take exactly 1 card</li>
					<li>
						<strong>Split</strong> — split a pair into 2 hands (up to 4). Split aces get 1 card each.
					</li>
					<li><strong>Surrender</strong> — give up half the bet (first decision only)</li>
				</ul>
			</section>
			<Separator />
			<Button variant="outline" class="w-full" onclick={() => (open = false)}>Got it</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
