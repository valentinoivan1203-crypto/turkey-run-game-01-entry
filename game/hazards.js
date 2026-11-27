// Hazards and pickups: fences and carving knives to jump over, ovens whose
// heat hangs at head height (duck under it), corn to collect and rare
// feathers that restore a life. Spawned in fair patterns ahead of the turkey.
export const KIND = { FENCE: 'fence', KNIFE: 'knife', OVEN: 'oven', CORN: 'corn', FEATHER: 'feather' };

export class Hazards {
  constructor(groundY) {
    this.groundY = groundY;
    this.items = [];
    this.spawnIn = 420; // px until the next spawn
    this.sinceFeather = 0;
  }

  reset() {
    this.items = [];
    this.spawnIn = 420;
    this.sinceFeather = 0;
  }

  // distance: metres run, used for difficulty. Returns nothing; fills this.items.
  update(dt, speed, distance, scrollDelta) {
    for (const it of this.items) it.x -= scrollDelta;
    this.items = this.items.filter((it) => it.x + it.w > -80);

    this.spawnIn -= scrollDelta;
    if (this.spawnIn > 0) return;
    const diff = Math.min(1, distance / 1600); // 0..1 difficulty
    // Keep gaps wide enough to land and jump again: one jump covers ~250 px
    // of travel, so the next obstacle must arrive well after the last.
    const gap = 430 - diff * 60 + Math.random() * 140;
    this.spawnIn = gap;
    const roll = Math.random();
    const x = 1000;
    if (roll < 0.30) {
      this.items.push({ kind: KIND.FENCE, x, w: 52, h: 46, scored: false });
    } else if (roll < 0.55) {
      this.items.push({ kind: KIND.KNIFE, x, w: 40, h: 34, scored: false });
    } else if (roll < 0.72) {
      this.items.push({ kind: KIND.OVEN, x, w: 74, h: 62, scored: false });
    } else if (roll < 0.90) {
      // A run of corn: 3-5 cobs, low or at jump height.
      const n = 3 + Math.floor(Math.random() * 3);
      const high = Math.random() < 0.5;
      for (let i = 0; i < n; i++) {
        this.items.push({ kind: KIND.CORN, x: x + i * 36, w: 22, h: 26, yOff: high ? -92 : 0, taken: false });
      }
    } else {
      // Double fence for late game, or a feather if one is overdue.
      this.sinceFeather += 1;
      if (diff > 0.25 && this.sinceFeather >= 3) {
        this.items.push({ kind: KIND.FEATHER, x, w: 26, h: 26, yOff: -92, taken: false });
        this.sinceFeather = 0;
      } else {
        this.items.push({ kind: KIND.FENCE, x, w: 52, h: 46, scored: false });
        this.items.push({ kind: KIND.FENCE, x: x + 130, w: 52, h: 46, scored: false });
      }
    }
  }

  // AABB helpers. Turkey box: x, top, w, height (ducking lowers it).
  static overlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // Check collisions against the turkey. Returns { hit: kind|null, got: [] }.
  // hit: the first hazard kind that struck. got: collected pickups.
  collide(turkey) {
    // The turkey's box follows its real position: turkey.y is the top edge
    // while jumping; ducking lowers the top by (h - height). The box is a
    // few pixels smaller than the drawing (forgiving feet and sides) so a
    // jump that visually clears an obstacle is not punished for a pixel.
    const tb = {
      x: turkey.x + 5,
      y: turkey.y + (turkey.h - turkey.height),
      w: turkey.w - 10,
      h: turkey.height - 8,
    };
    let hit = null;
    const got = [];
    for (const it of this.items) {
      if (it.kind === KIND.CORN || it.kind === KIND.FEATHER) {
        if (it.taken) continue;
        const pb = { x: it.x, y: this.groundY + (it.yOff || 0) - it.h, w: it.w, h: it.h };
        if (Hazards.overlap(tb, pb)) {
          it.taken = true;
          got.push(it.kind);
        }
        continue;
      }
      if (it.scored) continue;
      let hb;
      if (it.kind === KIND.OVEN) {
        // The oven is a brick arch: the low arch mouth is the only way through.
        // Its heat fills the arch down to head height, so only a ducking turkey
        // (top at groundY-30) slips under it; standing or jumping runs into it.
        hb = { x: it.x + 4, y: this.groundY - 62, w: it.w - 8, h: 32 };
      } else {
        hb = { x: it.x + 4, y: this.groundY - it.h, w: it.w - 8, h: it.h };
      }
      if (Hazards.overlap(tb, hb)) {
        hit = it.kind;
        it.scored = true;
      }
    }
    this.items = this.items.filter((it) => !it.taken);
    return { hit, got };
  }

  draw(ctx, time) {
    for (const it of this.items) this.drawOne(ctx, it, time);
  }

  drawOne(ctx, it, time) {
    const gy = this.groundY;
    if (it.kind === KIND.FENCE) {
      ctx.strokeStyle = '#8a6a42'; ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(it.x - 24, gy - 32); ctx.lineTo(it.x + 28, gy - 32);
      ctx.moveTo(it.x - 24, gy - 15); ctx.lineTo(it.x + 28, gy - 15);
      ctx.stroke();
      ctx.fillStyle = '#6a4a28';
      ctx.fillRect(it.x - 26, gy - 44, 6, 44);
      ctx.fillRect(it.x + 24, gy - 44, 6, 44);
      ctx.fillStyle = '#e8dcc0';
      ctx.font = 'bold 11px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('JUMP!', it.x + 2, gy - 52);
    } else if (it.kind === KIND.KNIFE) {
      // Carving knife stuck blade-up in a chopping block.
      ctx.fillStyle = '#7a5228';
      ctx.fillRect(it.x - 4, gy - 12, 48, 12);
      ctx.fillStyle = '#c8c8d0';
      ctx.beginPath();
      ctx.moveTo(it.x + 8, gy - 12);
      ctx.lineTo(it.x + 20, gy - 46);
      ctx.lineTo(it.x + 30, gy - 12);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#3a2c20';
      ctx.fillRect(it.x + 17, gy - 52, 7, 10);
      ctx.fillStyle = '#e8dcc0';
      ctx.font = 'bold 11px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('JUMP!', it.x + 20, gy - 60);
    } else if (it.kind === KIND.OVEN) {
      // Brick oven with a low arch mouth: heat glows inside the arch's top,
      // the dark mouth below it is the duck-through gap.
      ctx.fillStyle = '#8a3a22';
      ctx.fillRect(it.x, gy - 62, it.w, 62);
      ctx.fillStyle = '#5e2818';
      ctx.fillRect(it.x + 8, gy - 62, it.w - 16, 10);
      // Arch mouth (dark opening, groundY-30 .. groundY)
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.moveTo(it.x + 10, gy);
      ctx.lineTo(it.x + 10, gy - 22);
      ctx.quadraticCurveTo(it.x + it.w / 2, gy - 38, it.x + it.w - 10, gy - 22);
      ctx.lineTo(it.x + it.w - 10, gy);
      ctx.closePath(); ctx.fill();
      // Heat glow inside the arch top
      ctx.save();
      ctx.globalAlpha = 0.55 + Math.sin(time * 6 + it.x) * 0.2;
      ctx.fillStyle = '#ff8a2a';
      ctx.beginPath();
      ctx.ellipse(it.x + it.w / 2, gy - 26, 16, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // Heat waves rising from the chimney top
      ctx.save();
      ctx.globalAlpha = 0.4 + Math.sin(time * 5 + it.x) * 0.12;
      ctx.fillStyle = '#ff6a1a';
      for (let i = 0; i < 2; i++) {
        const wx = it.x + 18 + i * 34 + Math.sin(time * 4 + i) * 3;
        ctx.beginPath();
        ctx.ellipse(wx, gy - 72, 6, 10, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      ctx.fillStyle = '#ffe9a8';
      ctx.font = 'bold 11px "Trebuchet MS", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DUCK!', it.x + it.w / 2, gy - 88);
    } else if (it.kind === KIND.CORN) {
      const y = gy + (it.yOff || 0) - 13;
      const bob = Math.sin(time * 3 + it.x * 0.05) * 2;
      ctx.fillStyle = '#e8c33c';
      ctx.beginPath(); ctx.ellipse(it.x + 11, y + bob, 8, 12, 0.15, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7a9a26';
      ctx.beginPath(); ctx.ellipse(it.x + 11, y + bob - 12, 4, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#b89a22'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(it.x + 5, y + bob - 8); ctx.lineTo(it.x + 5, y + bob + 8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(it.x + 11, y + bob - 10); ctx.lineTo(it.x + 11, y + bob + 10); ctx.stroke();
    } else if (it.kind === KIND.FEATHER) {
      const y = gy + (it.yOff || 0) - 13;
      const bob = Math.sin(time * 3 + it.x * 0.05) * 4;
      ctx.fillStyle = '#fff8ea';
      ctx.beginPath(); ctx.ellipse(it.x + 13, y + bob, 7, 13, 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e8a83c';
      ctx.beginPath(); ctx.ellipse(it.x + 13, y + bob, 3, 9, 0.4, 0, Math.PI * 2); ctx.fill();
    }
  }
}
