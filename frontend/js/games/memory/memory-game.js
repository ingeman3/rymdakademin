// Pure game state and rules for Rymdminnet. Knows nothing about the
// DOM — it emits events (`onReveal`, `onMatch`, `onMismatch`, `onWin`)
// and the UI layer turns those into DOM updates and animations.
//
// The game lifecycle is:
//   createMemoryGame({ onReveal, onMatch, onMismatch, onWin })
//     → { state, start(), click(index), reset() }
//
// `state` is read-only from the outside. Mutations only happen via
// click() and reset(). Timings outside 900 ms are the UI's problem;
// this module only tracks the "mismatch hide in flight" boolean so the
// click handler knows when to ignore input.

import { shuffle } from '../../shared/math.js';
import {
  GRID_SIZE,
  MISMATCH_HIDE_MS,
  MOTIFS,
  PAIRS_COUNT,
  PERFECT_MOVES_THRESHOLD,
} from './memory-data.js';

export function createMemoryGame(callbacks = {}) {
  const {
    onReveal = () => {},
    onMatch = () => {},
    onMismatch = () => {},
    onWin = () => {},
  } = callbacks;

  const state = {
    cards: [],              // [{ motifId, revealed: bool, matched: bool }, ...]
    firstPick: null,         // index of the first revealed card in a pair, or null
    moves: 0,                // incremented on every SECOND click of a pair
    pairsMatched: 0,
    busy: false,             // true during mismatch hide timer
    started: false,
    won: false,
  };

  let mismatchTimer = null;

  function buildDeck() {
    const deck = [];
    MOTIFS.forEach((m) => {
      deck.push({ motifId: m.id, revealed: false, matched: false });
      deck.push({ motifId: m.id, revealed: false, matched: false });
    });
    if (deck.length !== GRID_SIZE) {
      throw new Error(`memory-game: expected ${GRID_SIZE} cards, got ${deck.length}`);
    }
    return shuffle(deck);
  }

  function start() {
    // Re-shuffle the deck and flag click handling active. Callers
    // should render the board from state.cards AFTER start() so the
    // DOM reflects the same deck that click() will operate on.
    reset();
    state.started = true;
  }

  function reset() {
    if (mismatchTimer) {
      clearTimeout(mismatchTimer);
      mismatchTimer = null;
    }
    state.cards = buildDeck();
    state.firstPick = null;
    state.moves = 0;
    state.pairsMatched = 0;
    state.busy = false;
    state.won = false;
    state.started = false;
  }

  function click(index) {
    if (!state.started || state.won || state.busy) return;
    if (!Number.isInteger(index) || index < 0 || index >= state.cards.length) return;
    const card = state.cards[index];
    if (!card || card.revealed || card.matched) return;

    card.revealed = true;
    onReveal(index);

    if (state.firstPick === null) {
      state.firstPick = index;
      return;
    }
    if (state.firstPick === index) return; // same card twice — ignore

    state.moves += 1;
    const first = state.firstPick;
    const a = state.cards[first];
    const b = card;

    if (a.motifId === b.motifId) {
      a.matched = true;
      b.matched = true;
      state.pairsMatched += 1;
      state.firstPick = null;
      onMatch(first, index, a.motifId);
      if (state.pairsMatched === PAIRS_COUNT) {
        state.won = true;
        onWin(calculateReward());
      }
      return;
    }

    // Mismatch — lock input until both cards hide.
    state.busy = true;
    const toHide = [first, index];
    onMismatch(first, index);
    mismatchTimer = setTimeout(() => {
      toHide.forEach((i) => {
        const c = state.cards[i];
        if (c && !c.matched) c.revealed = false;
      });
      state.firstPick = null;
      state.busy = false;
      mismatchTimer = null;
    }, MISMATCH_HIDE_MS);
  }

  function calculateReward() {
    const completion = 1;
    const bonus = state.moves <= PERFECT_MOVES_THRESHOLD ? 1 : 0;
    return {
      moves: state.moves,
      starsEarned: completion + bonus,
      perfect: bonus === 1,
    };
  }

  return {
    state,
    start,
    click,
    reset,
    _internal: { calculateReward },
  };
}
