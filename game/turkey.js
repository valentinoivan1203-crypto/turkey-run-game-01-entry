// The turkey: running, jumping and ducking. Drawn in code as a plump
// brown bird with a red wattle, fanned tail and worried eyes.
export class Turkey {
  constructor(groundY) {
    this.groundY = groundY;
    this.x = 150;
    this.w = 46;
    this.h = 52;
    this.y = groundY - this.h; // top edge
    this.vy = 0;
    this.onGround = true;
    this.ducking = false;
    this.runPhase = 0;
    this.invuln = 0; // seconds of post-hit flashing
    this.stumble = 0; // seconds of wobble after a hit
  }

  get duckH() { return 30; }
  get height() { return this.ducking && this.onGround ? this.duckH : this.h; }

  jump(sound) {
    if (!this.onGround) return false;
    this.vy = -15.5;
    this.onGround = false;
    this.ducking = false;
    if (sound) sound.jump();
    return true;
  }

  setDuck(down) {
    if (this.onGround) this.ducking = down;
  }

  hit() {
    this.invuln = 1.6;
    this.stumble = 0.6;
  }

  update(dt, speed) {
    this.runPhase += dt * (6 + speed * 1.2);
    if (this.invuln > 0) this.invuln -= dt;
    if (this.stumble > 0) this.stumble -= dt;
    if (!this.onGround) {
      this.vy += 0.6;
      this.y += this.vy;
      if (this.y >= this.groundY - this.h) {
        this.y = this.groundY - this.h;
        this.vy = 0;
        this.onGround = true;
      }
    }
  }

  draw(ctx) {
    if (this.invuln > 0 && Math.floor(this.invuln * 12) % 2 === 0) return; // flash
    const x = this.x;
    const h = this.height;
    // Draw at the real top edge: this.y while jumping; ducking lowers the
    // top by (h - height) so the bird squashes toward the ground.
    const top = this.y + (this.h - h);
    const wob = this.stumble > 0 ? Math.sin(this.runPhase * 20) * 3 : 0;
    ctx.save();
    ctx.translate(x + wob, top);

    // Tail feathers (fanned)
    ctx.fillStyle = '#7a4a1e';
    for (let i = -2; i <= 2; i++) {
      ctx.save();
      ctx.translate(8, 14);
      ctx.rotate(i * 0.32);
      ctx.beginPath(); ctx.ellipse(-14, 0, 16, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#c98a3c';
    for (let i = -1; i <= 1; i++) {
      ctx.save();
      ctx.translate(8, 14);
      ctx.rotate(i * 0.32);
      ctx.beginPath(); ctx.ellipse(-12, 0, 11, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // Body
    ctx.fillStyle = '#8a5a28';
    ctx.beginPath(); ctx.ellipse(22, h - 18, 22, h / 2 - 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#a06a30';
    ctx.beginPath(); ctx.ellipse(22, h - 20, 15, h / 2 - 8, 0, 0, Math.PI * 2); ctx.fill();

    // Wing
    const flap = this.onGround ? Math.sin(this.runPhase) * 4 : -8;
    ctx.fillStyle = '#6a4218';
    ctx.beginPath(); ctx.ellipse(20, h - 22 + flap, 12, 7, -0.4, 0, Math.PI * 2); ctx.fill();

    // Legs (running) or tucked (airborne/ducking)
    ctx.strokeStyle = '#e8a83c'; ctx.lineWidth = 3;
    if (this.onGround && !this.ducking) {
      const s = Math.sin(this.runPhase);
      ctx.beginPath(); ctx.moveTo(16, h - 4); ctx.lineTo(12 + s * 8, h + 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(28, h - 4); ctx.lineTo(32 - s * 8, h + 2); ctx.stroke();
    }

    // Head + neck
    const headY = this.ducking ? 12 : 2;
    ctx.fillStyle = '#8a5a28';
    ctx.fillRect(36, headY + 4, 7, 14);
    ctx.fillStyle = '#d8b25e';
    ctx.beginPath(); ctx.arc(40, headY + 2, 9, 0, Math.PI * 2); ctx.fill();
    // Beak
    ctx.fillStyle = '#e8963c';
    ctx.beginPath(); ctx.moveTo(48, headY); ctx.lineTo(58, headY + 3); ctx.lineTo(48, headY + 6); ctx.closePath(); ctx.fill();
    // Wattle
    ctx.fillStyle = '#c92a2a';
    ctx.beginPath(); ctx.ellipse(46, headY + 9, 3.5, 5.5, 0.2, 0, Math.PI * 2); ctx.fill();
    // Eye (wide when stumbling)
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(42, headY - 1, this.stumble > 0 ? 3.4 : 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(43, headY - 1, 1.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}
