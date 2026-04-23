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
import {
  addStars,
  enableServerSync,
  getSelectedPilot,
  getSelectedPilotId,
  setGameProgress,
} from '../../shared/progress.js';
import { showRankCelebration } from '../../shared/rank-celebration.js';
import { createMemoryGame } from './memory-game.js';
import { createMemoryUi } from './memory-ui.js';
import { getMotifById } from './memory-data.js';

const GAME_ID = 'memory';

// Ranks that trigger the 4-second peek at game start. Higher ranks
// have earned their way past the training wheels.
const PEEK_RANKS = new Set(['kadett', 'pilot']);
function shouldPeek(pilot) {
  if (!pilot) return true; // fresh visitor without stars — give them the peek
  return PEEK_RANKS.has(pilot.rank || 'kadett');
}

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
  onWin: (result) => handleWin(result),
});

async function handleWin(result) {
  const pilotId = getSelectedPilotId();
  const pilot = getSelectedPilot();

  let rankChanged = false;
  let newRank = pilot && pilot.rank;

  if (pilotId) {
    // Persist the per-game stats first (bestMoves must compare
    // against the previous value BEFORE addStars overwrites the
    // games.memory entry via its own merge).
    const prev = pilot && pilot.games && pilot.games[GAME_ID];
    const prevBestMoves = prev && Number.isFinite(prev.bestMoves) ? prev.bestMoves : null;
    const bestMoves = prevBestMoves === null ? result.moves : Math.min(prevBestMoves, result.moves);

    const addResult = addStars(pilotId, GAME_ID, result.starsEarned);
    rankChanged = addResult.rankChanged;
    newRank = addResult.newRank;

    setGameProgress(pilotId, GAME_ID, { bestMoves });
  }

  const afterCelebration = () => {
    ui.showCompletion({
      moves: result.moves,
      starsEarned: result.starsEarned,
      onReplayClick: () => { startGame(); },
      onBackClick: () => { window.location.href = '/'; },
    });
  };

  if (rankChanged && newRank) {
    await showRankCelebration({ rank: newRank, name: pilot && pilot.name });
  }
  afterCelebration();
}

async function startGame() {
  ui.hideCompletion();
  // start() re-shuffles; then we render the board from the fresh
  // state.cards so the DOM matches what click() will operate on.
  game.start();
  ui.renderBoard(game.state.cards);

  const pilot = getSelectedPilot();
  const peek = shouldPeek(pilot) && !ui.prefersReducedMotion();
  if (peek) {
    // During peek, the click-handler in memory-game is still live
    // (state.started is already true) but the UI locks pointer events
    // on every card. After the 4 s window we cascade them face-down
    // and release input.
    ui.revealAllForPeek();
    ui.lockInput(true);
    await new Promise((resolve) => setTimeout(resolve, ui.PEEK_DURATION_MS));
    await ui.hideAllAfterPeek();
    ui.lockInput(false);
  }
}

// Expose a tiny debugging handle so manual verification from the
// console is easy in dev. Not used by the UI.
window.__memory = { game, ui, startGame, getSelectedPilotId };

startGame();
