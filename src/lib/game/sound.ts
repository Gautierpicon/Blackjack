export type SoundName = 'click' | 'chip' | 'card' | 'win' | 'lose' | 'push' | 'shuffle';

/**
 * Tiny Web Audio synth — no external assets needed.
 * Sounds are subtle casino-style blips and arpeggios.
 */
class SoundEngine {
	enabled = true;
	private ctx: AudioContext | null = null;

	constructor() {
		if (typeof localStorage !== 'undefined') {
			this.enabled = localStorage.getItem('neon-bj-sound') !== 'off';
		}
	}

	toggle(): boolean {
		this.enabled = !this.enabled;
		try {
			localStorage.setItem('neon-bj-sound', this.enabled ? 'on' : 'off');
		} catch {
			/* ignore */
		}
		return this.enabled;
	}

	private ac(): AudioContext | null {
		if (typeof window === 'undefined') return null;
		if (!this.ctx) {
			const AC = window.AudioContext;
			if (!AC) return null;
			this.ctx = new AC();
		}
		if (this.ctx.state === 'suspended') void this.ctx.resume();
		return this.ctx;
	}

	private tone(freq: number, startIn: number, dur: number, type: OscillatorType, gain = 0.12) {
		const ctx = this.ac();
		if (!ctx || !this.enabled) return;
		const t0 = ctx.currentTime + startIn;
		const osc = ctx.createOscillator();
		const g = ctx.createGain();
		osc.type = type;
		osc.frequency.setValueAtTime(freq, t0);
		g.gain.setValueAtTime(0.0001, t0);
		g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
		g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
		osc.connect(g).connect(ctx.destination);
		osc.start(t0);
		osc.stop(t0 + dur + 0.05);
	}

	play(name: SoundName) {
		if (!this.enabled) return;
		switch (name) {
			case 'click':
				this.tone(660, 0, 0.07, 'sine', 0.06);
				break;
			case 'chip':
				this.tone(1800, 0, 0.05, 'square', 0.04);
				this.tone(2400, 0.04, 0.06, 'square', 0.03);
				break;
			case 'card':
				this.tone(420, 0, 0.08, 'triangle', 0.1);
				this.tone(560, 0.05, 0.07, 'triangle', 0.07);
				break;
			case 'shuffle':
				this.tone(300, 0, 0.06, 'triangle', 0.07);
				this.tone(380, 0.07, 0.06, 'triangle', 0.07);
				this.tone(340, 0.14, 0.08, 'triangle', 0.07);
				break;
			case 'win':
				this.tone(523.25, 0, 0.14, 'sine', 0.1);
				this.tone(659.25, 0.1, 0.14, 'sine', 0.1);
				this.tone(783.99, 0.2, 0.22, 'sine', 0.11);
				break;
			case 'lose':
				this.tone(330, 0, 0.16, 'sawtooth', 0.05);
				this.tone(233, 0.12, 0.24, 'sawtooth', 0.05);
				break;
			case 'push':
				this.tone(440, 0, 0.12, 'sine', 0.08);
				this.tone(440, 0.14, 0.12, 'sine', 0.06);
				break;
		}
	}
}

export const sound = new SoundEngine();
