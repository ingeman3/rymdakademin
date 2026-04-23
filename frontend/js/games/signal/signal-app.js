// Entry point for /rymdsignalen. Mirrors memory-app / app (solar):
// - Prepend the shared game shell.
// - Enable server sync.
// - Wire the pure signal-game module to signal-ui and to
//   progress (addStars/setGameProgress/rank celebration).
//
// After each completed message, one star goes to the pilot via
// progress.addStars(pilotId, 'signal', 1). A rank promotion fires
// the shared rank-celebration overlay between that addStars call
// and the UI's message-complete hold, so the child sees PILOT /
// KAPTEN etc before the next message appears.

import { createGameShell } from '../../shared/game-shell.js';
import {
  addStars,
  enableServerSync,
  getSelectedPilot,
  getSelectedPilotId,
  setGameProgress,
} from '../../shared/progress.js';
import { showRankCelebration } from '../../shared/rank-celebration.js';
import { createSignalGame } from './signal-game.js';
import { createSignalUi } from './signal-ui.js';

const GAME_ID = 'signal';

// Captured at session start so the per-message addStars calls can be
// undone on the playCount axis at the end of the session — spec
// expects playCount to count *completions*, not messages.
let sessionStartPlayCount = 0;

const pageRoot = document.querySelector('.signal-page');
const iconEl = document.getElementById('signal-icon');
const messagePanelEl = document.getElementById('signal-message');
const letterPanelEl = document.getElementById('signal-letters');
const completionEl = document.getElementById('signal-completion');

if (pageRoot) {
  pageRoot.prepend(createGameShell());
}

enableServerSync();

const ui = createSignalUi({
  iconEl,
  messagePanelEl,
  letterPanelEl,
  completionEl,
  onLetterClick: (letter) => {
    game.clickLetter(letter);
  },
});

const game = createSignalGame({
  onLetterCorrect: (letter, gap) => {
    ui.animateCorrectLetter(letter, gap);
    // After the flight lands, setActiveGap updates which slot
    // pulses next. We wait for the flight to finish so the new
    // pulse doesn't appear while the letter is still mid-air.
    setTimeout(() => ui.setActiveGap(game.state.activeGap), 620);
  },
  onLetterIncorrect: (letter) => {
    ui.animateWrongLetter(letter);
  },
  onMessageComplete: (_idx, msg) => {
    ui.showMessageComplete(msg);

    const pilotId = getSelectedPilotId();
    if (!pilotId) return;
    const addResult = addStars(pilotId, GAME_ID, 1);
    if (addResult.rankChanged && addResult.newRank) {
      const pilot = getSelectedPilot();
      // Let the glow/speech start, then overlay the celebration
      // before we advance to the next message. The celebration's
      // internal hold (~2.5 s) is longer than the per-message
      // busy window, so the game effectively pauses until the
      // overlay resolves.
      setTimeout(() => {
        showRankCelebration({ rank: addResult.newRank, name: pilot && pilot.name });
      }, 600);
    }
  },
  onMessageAdvance: (_idx, msg) => {
    // Wait out the post-message hold, then swap the panel.
    setTimeout(() => {
      ui.renderMessage(msg, game.state.revealed, game.state.activeGap);
    }, 1400);
  },
  onSessionComplete: (_result) => {
    const pilotId = getSelectedPilotId();
    if (pilotId) {
      // addStars was called 7 times (one per message) to animate the
      // shell counter tick by tick. That also bumped playCount +7.
      // For Rymdsignalen, a "play" is the full 7-message session, so
      // rewrite playCount to one above whatever it was at session
      // start.
      setGameProgress(pilotId, GAME_ID, {
        playCount: sessionStartPlayCount + 1,
        lastPlayedAt: new Date().toISOString(),
      });
    }
    setTimeout(() => {
      ui.showCompletion({
        stars: 7,
        onReplayClick: () => { startSession(); },
        onBackClick: () => { window.location.href = '/'; },
      });
    }, 1500);
  },
});

function startSession() {
  ui.hideCompletion();
  ui.cancelSpeech();
  ui.clearBusy();

  const pilot = getSelectedPilot();
  const rank = (pilot && pilot.rank) || 'kadett';
  const prior = pilot && pilot.games && pilot.games[GAME_ID];
  sessionStartPlayCount = prior && Number.isFinite(prior.playCount) ? prior.playCount : 0;
  game.start(rank);

  ui.renderLetters(game.state.letters);
  ui.renderMessage(
    game.state.session[0],
    game.state.revealed,
    game.state.activeGap
  );
}

// Dev handle so verification scripts can drive the game
// deterministically.
window.__signal = { game, ui, startSession };

// Render the board behind the intro so the page isn't blank if the
// narrative overlay is dismissed fast, then show the intro on top.
startSession();
ui.showIntro({
  onStart: () => {
    // Re-shuffle with a fresh session so the child sees the game
    // begin when they press Starta (avoids the distracting
    // possibility of the background board showing pre-seeded state).
    startSession();
  },
});
