// The farmer: chases the turkey from behind. He closes in when the turkey
// slows down or stumbles, and falls back when the turkey speeds up.
// If he touches the turkey, the turkey loses a life.
export class Farmer {
  constructor(groundY) {
    this.groundY = groundY;
    this.x = -40; // starts off-screen, jogs in at run start
    this.w = 40;
    this.h = 78;
    this.runPhase = 0;
    this.lunge = 0; // seconds of lunge animation after a catch
    this.baseGap = 150; // how far behind the turkey he trails
    this.pressure = 0; // 0..1: grows while the turkey dawdles, decays while it runs
  }

  reset() {
    this.x = -40;
    this.lunge = 0;
    this.pressure = 0;
  }

  // speed: world scroll speed. playerSlow: true while the turkey holds Left/A.
  update(dt, speed, playerSlow, stumbled) {
    this.runPhase += dt * (8 + speed);
    if (this.lunge > 0) this.lunge -= dt;
    // Pressure grows while the turkey slows or stumbles, decays while it runs.
    if (playerSlow || stumbled) this.pressure = Math.min(1, this.pressure + dt * 0.5);
    else this.pressure = Math.max(0, this.pressure - dt * 0.22);
    // Ease toward the trailing position; at full pressure he reaches the turkey.
    const want = (150 - this.baseGap) + this.pressure * 130;
    const k = this.pressure > 0.4 ? 2.2 : 0.55;
    this.x += (want - this.x) * Math.min(1, k * dt);
    // Keep him on screen once he has jogged in.
    if (this.x < -50) this.x = -50;
  }

  catchLunge() {
    this.lunge = 0.5;
  }

  get catchX() { return this.x + this.w; }

  draw(ctx) {
    const x = this.x;
    const top = this.groundY - this.h;
    const s = Math.sin(this.runPhase);
    const lungeLean = this.lunge > 0 ? 10 : 0;
    ctx.save();
    ctx.translate(x, top);

    // Legs (running)
    ctx.strokeStyle = '#3a2c20'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(14, this.h - 26); ctx.lineTo(8 + s * 9, this.h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(26, this.h - 26); ctx.lineTo(32 - s * 9, this.h); ctx.stroke();
    // Overalls
    ctx.fillStyle = '#3a5a8a';
    ctx.fillRect(8, this.h - 46, 26, 24);
    ctx.fillStyle = '#2c4468';
    ctx.fillRect(8, this.h - 46, 26, 7);
    // Shirt
    ctx.fillStyle = '#c94a3a';
    ctx.fillRect(6, this.h - 62, 30, 18);
    // Arms reaching forward (toward the turkey)
    ctx.strokeStyle = '#c94a3a'; ctx.lineWidth = 7;
    const reach = 6 + Math.sin(this.runPhase * 0.5) * 2 + lungeLean;
    ctx.beginPath(); ctx.moveTo(30, this.h - 58); ctx.lineTo(40 + reach, this.h - 52); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(30, this.h - 50); ctx.lineTo(40 + reach, this.h - 42); ctx.stroke();
    // Head
    ctx.fillStyle = '#e8b88a';
    ctx.beginPath(); ctx.arc(22, this.h - 70, 11, 0, Math.PI * 2); ctx.fill();
    // Straw hat
    ctx.fillStyle = '#d9b25e';
    ctx.beginPath(); ctx.ellipse(22, this.h - 78, 17, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(12, this.h - 88, 20, 10);
    // Angry brows + eyes
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(26, this.h - 74, 5, 2);
    ctx.beginPath(); ctx.arc(28, this.h - 71, 1.6, 0, Math.PI * 2); ctx.fill();
    // Pitchfork slung on his back
    ctx.strokeStyle = '#8a6a42'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(4, this.h - 20); ctx.lineTo(-2, this.h - 66); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-6, this.h - 70); ctx.lineTo(2, this.h - 70); ctx.stroke();
    ctx.restore();
  }
}
