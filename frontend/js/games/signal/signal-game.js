// Pure game state and rules for Rymdsignalen. DOM-free — emits
// events that the UI layer translates into DOM updates and
// animations.
//
// Lifecycle:
//   const game = createSignalGame({ onLetterCorrect, onLetterIncorrect,
//                                   onMessageComplete, onMessageAdvance,
//                                   onSessionComplete });
//   game.start(rank);               // seeds 7 random messages
//   game.clickLetter('S');          // fires one or more callbacks
//   game.reset();                   // rebuild session
//
// The game does NOT own a busy-flag for the UI's animation timing.
// Callers are responsible for ignoring clickLetter() calls while
// their own animations run. The game does track `won` internally so
// clicks after session end are no-ops.

import { shuffle } from '../../shared/math.js';
import { getTier, SESSION_LENGTH } from './messages-data.js';

function normaliseChar(ch) {
  return typeof ch === 'string' ? ch.toUpperCase() : '';
}

function letterAt(text, pos) {
  return normaliseChar(text[pos] || '');
}

function computeActiveGap(message, revealed) {
  for (let i = 0; i < message.gaps.length; i += 1) {
    const pos = message.gaps[i];
    if (!revealed[pos]) return pos;
  }
  return null;
}

function freshRevealed(message) {
  // All positions start revealed EXCEPT those in gaps. Spaces stay
  // revealed permanently — they are never clicked.
  const revealed = new Array(message.text.length).fill(true);
  for (const pos of message.gaps) revealed[pos] = false;
  return revealed;
}

function buildLetterPanel(messages, tier) {
  // Required = every non-space letter across the 7 session messages.
  const required = new Set();
  for (const m of messages) {
    for (const ch of m.text) {
      if (ch !== ' ') required.add(normaliseChar(ch));
    }
  }
  // Distractors drawn from the tier alphabet, excluding letters
  // already required.
  const candidates = tier.alphabet.filter((l) => !required.has(l));
  const slots = tier.panelSize;
  const distractorCount = Math.max(0, slots - required.size);
  const distractors = shuffle(candidates).slice(0, distractorCount);
  const panel = [...required, ...distractors];
  // If the required set already exceeded the panel size (shouldn't
  // happen for well-chosen pools), truncate deterministically so
  // clicking still works.
  return shuffle(panel).slice(0, slots);
}

export function createSignalGame(callbacks = {}) {
  const {
    onLetterCorrect = () => {},
    onLetterIncorrect = () => {},
    onMessageComplete = () => {},
    onMessageAdvance = () => {},
    onSessionComplete = () => {},
  } = callbacks;

  const state = {
    rank: 'kadett',
    session: [],       // [{ text, gaps }, ...] — 7 messages
    currentIdx: 0,
    revealed: [],
    activeGap: null,
    letters: [],       // letter panel for this session
    moves: 0,          // correct + incorrect clicks
    started: false,
    won: false,
  };

  function loadMessage(idx) {
    const msg = state.session[idx];
    state.revealed = freshRevealed(msg);
    state.activeGap = computeActiveGap(msg, state.revealed);
  }

  function start(rank) {
    state.rank = typeof rank === 'string' ? rank : 'kadett';
    const tier = getTier(state.rank);
    // Pick SESSION_LENGTH messages without repetition. If the tier
    // has exactly that many, shuffle copies the whole pool.
    const pool = tier.messages.slice();
    const picked = shuffle(pool).slice(0, SESSION_LENGTH);
    state.session = picked;
    state.letters = buildLetterPanel(picked, tier);
    state.currentIdx = 0;
    state.moves = 0;
    state.won = false;
    loadMessage(0);
    state.started = true;
  }

  function reset() {
    state.session = [];
    state.currentIdx = 0;
    state.revealed = [];
    state.activeGap = null;
    state.letters = [];
    state.moves = 0;
    state.started = false;
    state.won = false;
  }

  function clickLetter(letter) {
    if (!state.started || state.won) return;
    const wanted = normaliseChar(letter);
    if (!wanted) return;
    if (state.activeGap === null) return;

    const msg = state.session[state.currentIdx];
    const expected = letterAt(msg.text, state.activeGap);
    state.moves += 1;

    if (wanted !== expected) {
      onLetterIncorrect(wanted);
      return;
    }

    const filledGap = state.activeGap;
    state.revealed[filledGap] = true;
    const nextGap = computeActiveGap(msg, state.revealed);
    state.activeGap = nextGap;
    onLetterCorrect(wanted, filledGap);

    if (nextGap !== null) return; // still gaps in this message

    const completedIdx = state.currentIdx;
    onMessageComplete(completedIdx, msg);

    if (completedIdx + 1 >= state.session.length) {
      state.won = true;
      onSessionComplete({
        moves: state.moves,
        messages: state.session.length,
      });
      return;
    }

    state.currentIdx = completedIdx + 1;
    loadMessage(state.currentIdx);
    onMessageAdvance(state.currentIdx, state.session[state.currentIdx]);
  }

  return {
    state,
    start,
    reset,
    clickLetter,
  };
}
