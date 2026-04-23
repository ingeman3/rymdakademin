// Entry point for /rymdminnet. Mirrors frontend/js/app.js:
// - Prepend the shared game shell.
// - Enable server sync.
// - Wire the pure game module to the UI module and to progress.
//
// The rank-dependent peek, polished completion screen, and
// progress.addStars + setGameProgress + rank celebration are added
// by the follow-up commits in this phase. This commit delivers the
// minimal playable loop: shuffle → click pairs → detect win → log.

import { createGameShell } from '../../shared/game-shell.js';
import { enableServerSync, getSelectedPilotId } from '../../shared/progress.js';
import { createMemoryGame } from './memory-game.js';
import { createMemoryUi } from './memory-ui.js';
import { getMotifById } from './memory-data.js';

const pageRoot = document.querySelector('.memory-page');
const boardEl = document.getElementById('memory-board');
const completionEl = document.getElementById('memory-completion');

if (pageRoot) {
  pageRoot.prepend(createGameShell());
}

enableServerSync();

const ui = createMemoryUi({
  boardEl,
  completionEl,
  onCardClick: (i) => game.click(i),
});

const game = createMemoryGame({
  onReveal: (i) => {
    const card = game.state.cards[i];
    if (card) ui.showReveal(i, card.motifId);
  },
  onMatch: (a, b, motifId) => {
    ui.showMatch([a, b], motifId);
    const motif = getMotifById(motifId);
    if (motif) ui.speakFact(motif.fact);
    ui.flyStarFromCard(b);
  },
  onMismatch: (a, b) => {
    ui.showMismatch([a, b]);
    // Mirror the game's 900 ms timer by flipping the cards back once
    // the hide window has elapsed — the game module has already
    // toggled state.cards[i].revealed back to false by then.
    setTimeout(() => ui.hideCards([a, b]), 900);
  },
  onWin: (result) => {
    // eslint-disable-next-line no-console
    console.log('memory: won in', result.moves, 'moves,', result.starsEarned, 'stars');
    // The polished completion screen + progress.addStars land in the
    // following commits. For now, surface the result so a developer
    // can see the game loop is working end-to-end.
  },
});

function startGame() {
  game.reset();
  ui.hideCompletion();
  ui.renderBoard(game.state.cards);
  game.start();
}

// Expose a tiny debugging handle so manual verification from the
// console is easy in dev. Not used by the UI.
window.__memory = { game, ui, startGame, getSelectedPilotId };

startGame();
