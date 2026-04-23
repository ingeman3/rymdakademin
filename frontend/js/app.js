import { createGameShell } from './shared/game-shell.js';
import { enableServerSync } from './shared/progress.js';
import { startSolarSystemGame } from './games/solar-system/solar-system-game.js';

// Prepend the shared header before the game's own DOM so the back
// button and pilot/stars display sit above the solar system map.
const gameRoot = document.querySelector('.solar-game');
if (gameRoot) {
  const shell = createGameShell();
  gameRoot.prepend(shell);
}

// Keep the game page in sync too — addStars from finishGame pushes
// fresh progress to the server via the same debounced path the start
// page uses. Idempotent.
enableServerSync();

startSolarSystemGame();
