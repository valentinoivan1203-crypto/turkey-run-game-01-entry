// Sound effects: tiny WebAudio beeps only, no audio files, no network.
export class Sound {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  // Must be called from a user gesture at least once.
  unlock() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      } catch (e) { this.ctx = null; }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  beep(freq, dur, type, vol, when = 0) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(vol || 0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  jump() { this.beep(320, 0.12, 'square', 0.06); this.beep(520, 0.1, 'square', 0.05, 0.06); }
  corn() { this.beep(880, 0.08, 'sine', 0.09); this.beep(1320, 0.12, 'sine', 0.08, 0.07); }
  feather() { this.beep(660, 0.1, 'sine', 0.09); this.beep(990, 0.1, 'sine', 0.09, 0.09); this.beep(1320, 0.16, 'sine', 0.09, 0.18); }
  hit() { this.beep(140, 0.25, 'sawtooth', 0.12); this.beep(90, 0.3, 'sawtooth', 0.1, 0.08); }
  caught() { this.beep(392, 0.18, 'triangle', 0.1); this.beep(311, 0.18, 'triangle', 0.1, 0.16); this.beep(233, 0.35, 'triangle', 0.1, 0.32); }
  escaped() { [523, 659, 784, 1047].forEach((f, i) => this.beep(f, 0.18, 'triangle', 0.1, i * 0.13)); }
  click() { this.beep(700, 0.05, 'square', 0.05); }
}
