export const CHIP_VALUES = [500, 100, 50, 25, 5] as const;

export const CHIP_STYLES: Record<number, { ring: string; text: string; bg: string }> = {
	5: { ring: 'border-red-400', text: 'text-red-300', bg: 'bg-red-950' },
	25: { ring: 'border-emerald-400', text: 'text-emerald-300', bg: 'bg-emerald-950' },
	50: { ring: 'border-sky-400', text: 'text-sky-300', bg: 'bg-sky-950' },
	100: { ring: 'border-violet-400', text: 'text-violet-300', bg: 'bg-violet-950' },
	500: { ring: 'border-amber-300', text: 'text-amber-300', bg: 'bg-amber-950' }
};

/** Greedy breakdown of an amount into chip values (for display stacks). */
export function breakdownChips(amount: number): number[] {
	const chips: number[] = [];
	let rest = Math.floor(amount);
	for (const v of CHIP_VALUES) {
		while (rest >= v) {
			chips.push(v);
			rest -= v;
		}
	}
	return chips;
}
