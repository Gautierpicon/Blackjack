import gsap from 'gsap';

/**
 * GSAP entrance animations as Svelte actions (client-side only).
 * Static inline styles in components provide the resting state for SSR.
 */

interface DealInOpts {
	index?: number;
	rotation?: number;
	lift?: number;
}

/** Card dealing: slides from above with a slight turn, staggered by index. */
export function dealIn(node: HTMLElement, opts: DealInOpts = {}) {
	const { index = 0, rotation = 0, lift = 0 } = opts;
	const tween = gsap.fromTo(
		node,
		{ y: -34, opacity: 0, rotation: rotation - 10 },
		{
			y: lift,
			opacity: 1,
			rotation,
			duration: 0.5,
			delay: 0.05 + index * 0.09,
			ease: 'power3.out'
		}
	);
	return {
		destroy() {
			tween.kill();
		}
	};
}

/** Small pop for badges, banners and bet stacks. */
export function popIn(node: HTMLElement, delay = 0) {
	const tween = gsap.from(node, {
		scale: 0.8,
		y: 12,
		opacity: 0,
		duration: 0.32,
		delay,
		ease: 'back.out(1.7)'
	});
	return {
		destroy() {
			tween.kill();
		}
	};
}

/**
 * Flip reveal for the dealer's hole card.
 * Attach with the current `revealed` state; animates on false -> true.
 */
export function revealFlip(node: HTMLElement, revealed: boolean) {
	let shown = revealed;
	return {
		update(next: boolean) {
			if (next && !shown) {
				shown = true;
				gsap.fromTo(
					node,
					{ rotationY: 90, opacity: 0.3 },
					{ rotationY: 0, opacity: 1, duration: 0.55, ease: 'power2.out' }
				);
			}
			if (!next) shown = false;
		},
		destroy() {
			gsap.killTweensOf(node);
		}
	};
}
