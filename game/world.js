// Parallax farm-at-dusk scenery: sky, setting sun, hills, barn, fences,
// hay bales, pumpkins and autumn trees. Pure canvas shapes, no images.
// The stage shifts with distance: farmyard -> cornfield -> farmhouse.
export function stageFor(distance) {
  if (distance < 700) return 0; // farmyard
  if (distance < 1400) return 1; // cornfield
  return 2; // farmhouse / kitchen approach
}

const SKIES = [
  { top: '#3a2350', mid: '#b4552d', low: '#e8963c' },
  { top: '#2c1e44', mid: '#8f3d2c', low: '#d97a2e' },
  { top: '#241a38', mid: '#6e2f2a', low: '#c96a28' },
];

function drawSun(ctx, w, h, scroll) {
  const sx = w * 0.78 - (scroll * 0.02 % (w * 0.4));
  const sy = h * 0.30;
  const g = ctx.createRadialGradient(sx, sy, 8, sx, sy, 90);
  g.addColorStop(0, 'rgba(255, 220, 140, 0.95)');
  g.addColorStop(0.4, 'rgba(255, 170, 80, 0.55)');
  g.addColorStop(1, 'rgba(255, 150, 60, 0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(sx, sy, 90, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffd98a';
  ctx.beginPath(); ctx.arc(sx, sy, 34, 0, Math.PI * 2); ctx.fill();
}

function drawHills(ctx, w, h, scroll, groundY) {
  ctx.fillStyle = '#4a2b3d';
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  for (let x = 0; x <= w; x += 40) {
    const y = groundY - 46 - Math.sin((x + scroll * 0.3) * 0.008) * 26;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, groundY); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3a2030';
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  for (let x = 0; x <= w; x += 40) {
    const y = groundY - 18 - Math.sin((x + scroll * 0.5 + 300) * 0.01) * 16;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, groundY); ctx.closePath(); ctx.fill();
}

function drawBarn(ctx, x, groundY, stage) {
  const bw = 150, bh = 105;
  const top = groundY - bh;
  ctx.fillStyle = stage === 2 ? '#5e2f22' : '#7a2e22';
  ctx.fillRect(x, top + 34, bw, bh - 34);
  ctx.fillStyle = stage === 2 ? '#47221a' : '#5e2118';
  ctx.beginPath();
  ctx.moveTo(x - 8, top + 38); ctx.lineTo(x + bw / 2, top); ctx.lineTo(x + bw + 8, top + 38);
  ctx.closePath(); ctx.fill();
  // Door
  ctx.fillStyle = '#3d1a12';
  ctx.fillRect(x + bw / 2 - 20, groundY - 52, 40, 52);
  ctx.strokeStyle = '#d8b25e'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x + bw / 2, groundY - 52); ctx.lineTo(x + bw / 2, groundY); ctx.stroke();
  // Hayloft window
  ctx.fillStyle = '#ffd98a';
  ctx.fillRect(x + bw / 2 - 10, top + 42, 20, 16);
  // Warm window glow on stage 2
  if (stage === 2) {
    ctx.fillStyle = 'rgba(255, 200, 110, 0.9)';
    ctx.fillRect(x + 14, top + 58, 22, 18);
    ctx.fillRect(x + bw - 36, top + 58, 22, 18);
  }
}

function drawFarmhouse(ctx, x, groundY) {
  const bw = 170, bh = 95;
  const top = groundY - bh;
  ctx.fillStyle = '#e8dcc0';
  ctx.fillRect(x, top + 30, bw, bh - 30);
  ctx.fillStyle = '#4a2c20';
  ctx.beginPath();
  ctx.moveTo(x - 10, top + 34); ctx.lineTo(x + bw / 2, top); ctx.lineTo(x + bw + 10, top + 34);
  ctx.closePath(); ctx.fill();
  // Chimney with smoke
  ctx.fillStyle = '#8a6a58';
  ctx.fillRect(x + bw - 42, top - 22, 20, 30);
  ctx.fillStyle = 'rgba(220, 220, 220, 0.5)';
  ctx.beginPath(); ctx.arc(x + bw - 32, top - 34, 10, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + bw - 24, top - 48, 13, 0, Math.PI * 2); ctx.fill();
  // Lit windows
  ctx.fillStyle = '#ffcf7a';
  ctx.fillRect(x + 16, top + 48, 24, 22);
  ctx.fillRect(x + bw - 40, top + 48, 24, 22);
  ctx.fillStyle = '#4a2c20';
  ctx.fillRect(x + bw / 2 - 14, groundY - 44, 28, 44);
}

function drawTree(ctx, x, groundY, seed) {
  const h = 70 + (seed % 3) * 16;
  ctx.fillStyle = '#4a2c18';
  ctx.fillRect(x - 4, groundY - h * 0.45, 8, h * 0.45);
  const cols = ['#c96a1e', '#d98a1e', '#b34a16'];
  ctx.fillStyle = cols[seed % 3];
  ctx.beginPath(); ctx.arc(x, groundY - h * 0.62, 30 + (seed % 3) * 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x - 22, groundY - h * 0.5, 18, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 22, groundY - h * 0.5, 18, 0, Math.PI * 2); ctx.fill();
}

function drawHay(ctx, x, groundY) {
  ctx.fillStyle = '#d9a83c';
  ctx.beginPath(); ctx.arc(x, groundY - 16, 24, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = '#a87c22'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, groundY - 16, 16, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, groundY - 16, 8, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke();
}

function drawPumpkin(ctx, x, groundY, seed) {
  const r = 12 + (seed % 2) * 4;
  ctx.fillStyle = '#e06a10';
  ctx.beginPath(); ctx.ellipse(x, groundY - r * 0.8, r, r * 0.8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#a84a08'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x, groundY - r * 1.6); ctx.lineTo(x, groundY); ctx.stroke();
  ctx.strokeStyle = '#3f7a1e'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x, groundY - r * 1.6); ctx.quadraticCurveTo(x + 8, groundY - r * 2, x + 12, groundY - r * 1.7); ctx.stroke();
}

function drawCornStalk(ctx, x, groundY, seed) {
  const h = 74 + (seed % 3) * 12;
  ctx.strokeStyle = '#5e7a1e'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x, groundY); ctx.lineTo(x + (seed % 2 ? 4 : -4), groundY - h); ctx.stroke();
  ctx.fillStyle = '#7a9a26';
  ctx.beginPath(); ctx.ellipse(x - 8, groundY - h * 0.55, 12, 5, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + 8, groundY - h * 0.75, 12, 5, 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e8c33c';
  ctx.beginPath(); ctx.ellipse(x + 2, groundY - h * 0.4, 6, 12, 0.2, 0, Math.PI * 2); ctx.fill();
}

export function drawBackground(ctx, w, h, scroll, distance, groundY) {
  const stage = stageFor(distance);
  const sky = SKIES[stage];
  const g = ctx.createLinearGradient(0, 0, 0, groundY);
  g.addColorStop(0, sky.top); g.addColorStop(0.55, sky.mid); g.addColorStop(1, sky.low);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, groundY + 2);
  drawSun(ctx, w, h, scroll);
  drawHills(ctx, w, h, scroll, groundY);

  // Far props (slow parallax): trees, barn/farmhouse, hay, pumpkins, corn
  const span = 560;
  const base = -((scroll * 0.35) % span);
  for (let i = -1; i < w / span + 2; i++) {
    const x = base + i * span;
    const seed = Math.abs(Math.floor((scroll * 0.35 + i * span) / span)) + i;
    if (stage === 0 && i % 3 === 1) drawBarn(ctx, x + 40, groundY, stage);
    else if (stage === 2 && i % 3 === 1) drawFarmhouse(ctx, x + 20, groundY);
    else if (stage === 1) drawCornStalk(ctx, x + 120, groundY, seed);
    else drawTree(ctx, x + 120, groundY, seed);
  }
  // Near props (fast parallax)
  const span2 = 320;
  const base2 = -((scroll * 0.8) % span2);
  for (let i = -1; i < w / span2 + 2; i++) {
    const x = base2 + i * span2;
    const seed = Math.abs(i * 7 + 3);
    if (i % 2 === 0) drawHay(ctx, x + 60, groundY);
    else drawPumpkin(ctx, x + 200, groundY, seed);
  }

  // Ground
  ctx.fillStyle = stage === 1 ? '#6a4a22' : '#5a3a1e';
  ctx.fillRect(0, groundY, w, h - groundY);
  ctx.fillStyle = '#7a5228';
  ctx.fillRect(0, groundY, w, 6);
  // Dirt speckles scrolling with the world
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  const span3 = 90;
  const base3 = -((scroll) % span3);
  for (let x = base3; x < w; x += span3) {
    ctx.fillRect(x + 20, groundY + 16, 14, 3);
    ctx.fillRect(x + 55, groundY + 30, 10, 3);
  }
}

export function drawFence(ctx, x, groundY) {
  ctx.strokeStyle = '#8a6a42'; ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x - 26, groundY - 34); ctx.lineTo(x + 26, groundY - 34);
  ctx.moveTo(x - 26, groundY - 16); ctx.lineTo(x + 26, groundY - 16);
  ctx.stroke();
  ctx.fillStyle = '#6a4a28';
  ctx.fillRect(x - 28, groundY - 44, 6, 44);
  ctx.fillRect(x + 22, groundY - 44, 6, 44);
}
