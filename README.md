[![make.fun](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01)
[![make.fun](https://make.fun/badge/turkey-run-game-01/valentinoivan1203-crypto/turkey-run-game-01-entry/rank.svg)](https://make.fun/bounty/turkey-run-game-01)
[![make.fun](https://make.fun/badge/turkey-run-game-01/valentinoivan1203-crypto/turkey-run-game-01-entry/reward.svg)](https://make.fun/bounty/turkey-run-game-01)

# TURKEY RUN — Escape Thanksgiving

A complete, original turkey escape game for [make.fun's best turkey escape game bounty](https://make.fun/bounty/turkey-run-game-01). It runs in a desktop browser from static files with no network request: open `game/index.html` and run.

## The game

You are a turkey on Thanksgiving morning, and the farmer is coming for you. Run right across the farm at dusk — past the barn, fences, hay bales, pumpkins and autumn trees under a setting sun — and don't become dinner. The farmer chases from behind, the oven glows ahead, and the carving knife waits on the fence posts. Reach 2,000 m and you escape the farm and the feast.

## Controls

- **SPACE / ↑ / W, or click / tap** — jump
- **↓ / S, or the DUCK button** — duck under the oven's smoke and heat
- **← / → (or A / D)** — slow down / speed up
- **P** — pause · **R** — restart after caught or escaped · **M** — mute

## What makes it a turkey escape game

- **Jump and duck are real choices**: jump the fences and the carving knife, duck under the oven's heat — mistime either and you lose a life and stumble while the farmer closes in.
- **The farmer never stops**: he runs behind you and lunges when you stumble; slow down too much and he catches you.
- **Speed grows with distance**, and so does the danger: hazards come faster and closer together the further you run.
- **Corn and feathers turn a run into decisions**: corn is +50 points, and a rare feather restores a life (or +150 when you are already full). Three lives; 0 lives means caught.
- **Feel**: jump buffering fires a press made just before landing, the hitbox is forgiving where the drawing clears an obstacle, hits flash and wobble the bird, and WebAudio beeps (jump, corn, hit, caught, escaped) play only after you press a key or click.
- **HUD**: score, distance with a progress bar to 2,000 m, speed, and three heart lives.

## Files

- `game/` — the playable game (`index.html` + ES modules, no library, no network, all art drawn in code)
  - `main.js` — bootstrap, game loop, state machine (title / playing / paused / caught / escaped) and input
  - `turkey.js` — the turkey: running, jumping (with buffering), ducking, flashing after a hit
  - `farmer.js` — the chasing farmer: runs, pressures, lunges on a catch
  - `hazards.js` — fences, carving knives, ovens, corn and feathers: spawning, collision, pickups
  - `world.js` — the farm at dusk: sky, sun, hills, barn, fences, hay bales, pumpkins, trees
  - `hud.js` — score / distance / lives bar, title, pause, caught and escaped screens
  - `audio.js` — WebAudio beeps only, no audio files
- `screenshots/` — 4 real renders of the game's own code (title cover, mid-jump run with HUD, escaped, caught)
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged
- `main.ts` — copies `game/` and `screenshots/` to `/output` and writes `dossier.json`

## Play it

Serve `game/` with any static server (for example `npx serve game`), then open it in desktop Chrome. No network request is made.

Built with [make.fun](https://make.fun/r/dehpqxrn) — referral code `dehpqxrn`.
