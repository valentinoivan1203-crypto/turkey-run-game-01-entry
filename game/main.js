// Turkey Run — Escape Thanksgiving. Bootstrap, game loop, state machine
// (title / playing / paused / caught / escaped) and input.
// The turkey auto-runs; the player jumps, ducks and manages speed while the
// farmer closes in, hazards fly by, and 2000 m means freedom.
import { Sound } from './audio.js';
import { drawBackground } from './world.js';
import { Turkey } from './turkey.js';
import { Farmer } from './farmer.js';
import { Hazards, KIND } from './hazards.js';
import { drawHud, drawTitle, drawPaused, drawCaught, drawEscaped } from './hud.js';

const W = 960, H = 540;
const GROUND_Y = 452;
const ESCAPE_M = 2000;
const BEST_KEY = 'turkey-run-best-m';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const sound = new Sound();

const state = {
  mode: 'title', // title | playing | paused | caught | escaped
  time: 0,
  scroll: 0,
  speed: 5.2, // px per frame at 60fps (base)
  speedMult: 1, // 0.8 slow .. 1.5 fast (A/D)
  distance: 0,
  score: 0,
  lives: 3,
  best: 0,
  cornBonus: 0,
  jumpBuffer: 0, // seconds: a jump pressed just before landing fires on landing
  muted: false,
  slowHeld: false,
  fastHeld: false,
};

try { state.best = Number(localStorage.getItem(BEST_KEY) || 0) || 0; } catch (e) { state.best = 0; }
function saveBest() {
  try { localStorage.setItem(BEST_KEY, String(Math.floor(state.best))); } catch (e) { /* private mode */ }
}

const turkey = new Turkey(GROUND_Y);
const farmer = new Farmer(GROUND_Y);
const hazards = new Hazards(GROUND_Y);

function resetRun() {
  state.mode = 'playing';
  state.time = 0;
  state.scroll = 0;
  state.speed = 5.2;
  state.speedMult = 1;
  state.distance = 0;
  state.score = 0;
  state.lives = 3;
  state.cornBonus = 0;
  state.slowHeld = false;
  state.fastHeld = false;
  turkey.y = GROUND_Y - turkey.h;
  turkey.vy = 0;
  turkey.onGround = true;
  turkey.ducking = false;
  turkey.invuln = 0;
  turkey.stumble = 0;
  farmer.reset();
  hazards.reset();
}

function loseLife(cause) {
  if (turkey.invuln > 0) return;
  state.lives -= 1;
  turkey.hit();
  sound.hit();
  if (cause === 'farmer') farmer.catchLunge();
  if (state.lives <= 0) endRun('caught');
}

function endRun(how) {
  state.mode = how;
  if (Math.floor(state.distance) > state.best) {
    state.best = Math.floor(state.distance);
    saveBest();
  }
  if (how === 'caught') sound.caught();
  else sound.escaped();
}

function togglePause() {
  if (state.mode === 'playing') state.mode = 'paused';
  else if (state.mode === 'paused') state.mode = 'playing';
}

function startOrRestart() {
  sound.unlock();
  sound.click();
  if (state.mode === 'title' || state.mode === 'caught' || state.mode === 'escaped') resetRun();
}

function doJump() {
  sound.unlock();
  if (state.mode === 'title' || state.mode === 'caught' || state.mode === 'escaped') { startOrRestart(); return; }
  if (state.mode !== 'playing') return;
  // Jump buffering: a press just before landing fires the moment we touch down.
  if (!turkey.jump(sound)) state.jumpBuffer = 0.14;
}

function setDuck(down) {
  if (state.mode !== 'playing') return;
  turkey.setDuck(down);
}

// ---- Input: keyboard + mouse/touch ----
const keys = {};
window.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  keys[e.code] = true;
  sound.unlock();
  switch (e.code) {
    case 'Space': case 'ArrowUp': case 'KeyW':
      e.preventDefault(); doJump(); break;
    case 'ArrowDown': case 'KeyS':
      e.preventDefault(); setDuck(true); break;
    case 'ArrowLeft': case 'KeyA': state.slowHeld = true; break;
    case 'ArrowRight': case 'KeyD': state.fastHeld = true; break;
    case 'KeyP': togglePause(); break;
    case 'KeyR':
      if (state.mode === 'caught' || state.mode === 'escaped') resetRun();
      break;
    case 'KeyM':
      state.muted = sound.toggleMute(); break;
  }
});
window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
  if (e.code === 'ArrowDown' || e.code === 'KeyS') setDuck(false);
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') state.slowHeld = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') state.fastHeld = false;
});
canvas.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  doJump();
});
document.getElementById('btn-jump').addEventListener('pointerdown', (e) => { e.preventDefault(); doJump(); });
const duckBtn = document.getElementById('btn-duck');
duckBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); sound.unlock(); setDuck(true); });
duckBtn.addEventListener('pointerup', () => setDuck(false));
duckBtn.addEventListener('pointerleave', () => setDuck(false));

// ---- Game loop ----
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (state.mode === 'playing') update(dt);
  draw();
  requestAnimationFrame(frame);
}

function update(dt) {
  state.time += dt;
  // Speed: base grows with distance; A/D adjust the multiplier.
  const base = 5.2 + Math.min(2.8, state.distance / 500);
  const targetMult = state.fastHeld ? 1.5 : state.slowHeld ? 0.8 : 1;
  state.speedMult += (targetMult - state.speedMult) * Math.min(1, dt * 4);
  state.speed = base * state.speedMult;
  const scrollDelta = state.speed * dt * 60;
  state.scroll += scrollDelta;
  state.distance += scrollDelta * 0.055; // px -> metres
  state.score = Math.floor(state.distance) + state.cornBonus;

  turkey.update(dt, state.speed);
  // Buffered jump: fires the instant the turkey lands after an early press.
  if (state.jumpBuffer > 0) state.jumpBuffer -= dt;
  if (turkey.onGround && state.jumpBuffer > 0) {
    state.jumpBuffer = 0;
    turkey.jump(sound);
  }
  farmer.update(dt, state.speed, state.slowHeld, turkey.stumble > 0);
  hazards.update(dt, state.speed, state.distance, scrollDelta);

  // Farmer catch
  if (farmer.catchX >= turkey.x + 6 && turkey.invuln <= 0) {
    loseLife('farmer');
    if (state.mode === 'playing') {
      farmer.x = -40;
      farmer.pressure = 0;
    }
  }

  // Hazards + pickups
  const res = hazards.collide(turkey);
  if (res.hit && turkey.invuln <= 0) loseLife(res.hit);
  for (const kind of res.got) {
    if (kind === KIND.CORN) { state.cornBonus = (state.cornBonus || 0) + 50; sound.corn(); }
    if (kind === KIND.FEATHER) {
      if (state.lives < 3) { state.lives += 1; sound.feather(); }
      else { state.cornBonus = (state.cornBonus || 0) + 150; sound.corn(); }
    }
  }

  // Escape!
  if (state.distance >= ESCAPE_M && state.mode === 'playing') endRun('escaped');
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  drawBackground(ctx, W, H, state.scroll, state.distance, GROUND_Y);
  hazards.draw(ctx, state.time);
  farmer.draw(ctx);
  turkey.draw(ctx);
  if (state.mode === 'playing' || state.mode === 'paused') drawHud(ctx, W, state);
  if (state.mode === 'title') {
    drawTitle(ctx, W, H, state.best);
  } else if (state.mode === 'paused') {
    drawPaused(ctx, W, H);
  } else if (state.mode === 'caught') {
    drawCaught(ctx, W, H, state);
  } else if (state.mode === 'escaped') {
    drawEscaped(ctx, W, H, state);
  }
}

resetRun();
state.mode = 'title';
requestAnimationFrame(frame);
