// HUD and screens: score/distance/lives bar, title screen, pause overlay,
// and the caught / escaped end screens. All drawn on the canvas.
export function drawHud(ctx, w, state) {
  const pad = 14;
  ctx.save();
  // Top bar
  ctx.fillStyle = 'rgba(20, 10, 25, 0.62)';
  ctx.fillRect(0, 0, w, 44);
  ctx.fillStyle = '#ffe9a8';
  ctx.font = 'bold 17px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('SCORE ' + state.score, pad, 23);
  ctx.fillText('DIST ' + Math.floor(state.distance) + ' m', pad + 136, 23);
  // Distance progress to 2000 m
  const bx = pad + 276, bw = 180, by = 15;
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(bx, by, bw, 14);
  ctx.fillStyle = '#7ac74f';
  ctx.fillRect(bx, by, Math.min(1, state.distance / 2000) * bw, 14);
  ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 1.5;
  ctx.strokeRect(bx, by, bw, 14);
  ctx.fillStyle = '#ffe9a8';
  ctx.font = 'bold 12px "Trebuchet MS", sans-serif';
  ctx.fillText('ESCAPE AT 2000 m', bx + bw + 10, 23);
  // Speed (own slot; pause/mute hints live on the title screen only)
  ctx.fillStyle = 'rgba(255, 233, 168, 0.9)';
  ctx.font = 'bold 13px "Trebuchet MS", sans-serif';
  ctx.fillText('SPEED x' + state.speedMult.toFixed(1), bx + bw + 128, 23);
  // Lives as hearts
  const lx = w - 170;
  ctx.fillStyle = '#ffe9a8';
  ctx.font = 'bold 15px "Trebuchet MS", sans-serif';
  ctx.fillText('LIVES', lx, 23);
  for (let i = 0; i < 3; i++) {
    const hx = lx + 62 + i * 26;
    ctx.fillStyle = i < state.lives ? '#ff5a5a' : 'rgba(255,255,255,0.22)';
    ctx.beginPath();
    ctx.moveTo(hx, 28);
    ctx.bezierCurveTo(hx - 8, 18, hx - 2, 12, hx, 17);
    ctx.bezierCurveTo(hx + 2, 12, hx + 8, 18, hx, 28);
    ctx.fill();
  }
  ctx.restore();
}

function panel(ctx, w, h, lines, accent) {
  ctx.save();
  ctx.fillStyle = 'rgba(15, 8, 20, 0.72)';
  ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center';
  let y = h * 0.5 - (lines.length - 1) * 26;
  for (const line of lines) {
    ctx.fillStyle = line.color || '#fff8ea';
    ctx.font = line.font || '20px "Trebuchet MS", sans-serif';
    ctx.fillText(line.text, w / 2, y);
    y += line.gap || 52;
  }
  if (accent) {
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(24, 24, w - 48, h - 48);
  }
  ctx.restore();
}

export function drawTitle(ctx, w, h, best) {
  panel(ctx, w, h, [
    { text: 'TURKEY RUN', font: 'bold 64px "Trebuchet MS", sans-serif', color: '#ffcf5e', gap: 76 },
    { text: 'Escape Thanksgiving!', font: 'bold 26px "Trebuchet MS", sans-serif', color: '#ffe9a8', gap: 46 },
    { text: 'The farmer is coming. Dodge the oven and the carving knife.', font: '19px "Trebuchet MS", sans-serif', gap: 40 },
    { text: 'SPACE / CLICK — jump      DOWN / S — duck      A / D — slow down / speed up', font: '17px "Trebuchet MS", sans-serif', color: '#ffd98a', gap: 40 },
    { text: 'Collect corn. Grab feathers for an extra life. Reach 2000 m to escape!', font: '17px "Trebuchet MS", sans-serif', gap: 56 },
    { text: '— PRESS SPACE OR CLICK TO START —', font: 'bold 20px "Trebuchet MS", sans-serif', color: '#7ac74f', gap: 44 },
    { text: best > 0 ? 'Best escape: ' + Math.floor(best) + ' m' : 'No escape yet. The farm is waiting.', font: '15px "Trebuchet MS", sans-serif', color: '#c9b8a8' },
  ], '#ffcf5e');
}

export function drawPaused(ctx, w, h) {
  panel(ctx, w, h, [
    { text: 'PAUSED', font: 'bold 44px "Trebuchet MS", sans-serif', color: '#ffcf5e', gap: 60 },
    { text: 'Press P to keep running.', font: '19px "Trebuchet MS", sans-serif' },
  ]);
}

export function drawCaught(ctx, w, h, state) {
  panel(ctx, w, h, [
    { text: 'CAUGHT!', font: 'bold 56px "Trebuchet MS", sans-serif', color: '#ff5a5a', gap: 68 },
    { text: 'The farmer got you at ' + Math.floor(state.distance) + ' m.', font: '22px "Trebuchet MS", sans-serif', gap: 42 },
    { text: 'Score: ' + state.score + '   •   Best: ' + Math.floor(state.best) + ' m', font: '19px "Trebuchet MS", sans-serif', color: '#ffe9a8', gap: 52 },
    { text: 'The oven is already warm. Run again, turkey.', font: '18px "Trebuchet MS", sans-serif', gap: 56 },
    { text: '— PRESS R OR CLICK TO RESTART —', font: 'bold 20px "Trebuchet MS", sans-serif', color: '#7ac74f' },
  ], '#ff5a5a');
}

export function drawEscaped(ctx, w, h, state) {
  panel(ctx, w, h, [
    { text: 'ESCAPED!', font: 'bold 56px "Trebuchet MS", sans-serif', color: '#7ac74f', gap: 68 },
    { text: '2,000 m — you outran the farm and the feast!', font: '22px "Trebuchet MS", sans-serif', gap: 42 },
    { text: 'Score: ' + state.score + '   •   Lives left: ' + state.lives, font: '19px "Trebuchet MS", sans-serif', color: '#ffe9a8', gap: 52 },
    { text: 'Somewhere beyond the fence, a free turkey gobbles.', font: '18px "Trebuchet MS", sans-serif', gap: 56 },
    { text: '— PRESS R OR CLICK TO RUN AGAIN —', font: 'bold 20px "Trebuchet MS", sans-serif', color: '#ffcf5e' },
  ], '#7ac74f');
}
