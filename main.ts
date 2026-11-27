// turkey-run-game-01 — "Turkey Run" (Node 22, standard library only).
//
// The game is this directory's game/ folder, plain static files a desktop browser loads offline
// (game/index.html and its ES modules, no library and no network request), and the program hands it
// in. It copies game/ and screenshots/ from beside this file to /output and writes
// /output/dossier.json, the summary the judge reads, with the vendored make.fun library.
// Leave vendor/makefun-game.ts as it is: the scorer requires dossier.json to be byte for byte
// what its own copy writes.
//
// Turkey Run: a side-scrolling runner — a turkey escapes Thanksgiving across a farm at dusk,
// chased by the farmer, jumping fences and carving knives, ducking under the oven's heat,
// collecting corn. Title screen, HUD (score, distance, lives), caught and escaped end screens
// with restart. Keyboard and mouse/touch controls.
//
// Serve it locally with `node serve.ts` (from the kit starter), then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));

function resolveOutDir(): string {
  const configured = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  try {
    mkdirSync(configured, { recursive: true });
    return configured;
  } catch {
    const fallback = join(here, 'output');
    mkdirSync(fallback, { recursive: true });
    return fallback;
  }
}

const out = resolveOutDir();

// Fail fast with a clear message when the game is missing, instead of handing in an empty output.
if (!existsSync(join(here, 'game', 'index.html'))) {
  throw new Error('game/index.html is missing: the game was not built');
}
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB of game
// files, in all, or a path under game/ over 1000 bytes: game/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
