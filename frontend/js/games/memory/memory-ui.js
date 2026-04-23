// DOM layer for Rymdminnet. Owns the 4×4 grid, card-flip animations,
// star-flight to the shell, speech synthesis of facts, and the
// completion screen. Takes click callbacks from memory-app.
//
// Patterns carried over from solar-system-ui:
// - Reduced-motion guards for every animation (flight, pulse, flip).
// - textContent for anything user-controlled (pilot name, if ever
//   embedded). Motif icon strings are hardcoded SVG from MOTIFS,
//   safe to innerHTML.
// - addEventListener for all interactions, never inline handlers.

import { getMotifById, MISMATCH_HIDE_MS, PEEK_DURATION_MS } from './memory-data.js';

const MISMATCH_BLINK_MS = 600;
const MATCH_PULSE_MS = 400;
const FLIP_MS = 300;
const CASCADE_STEP_MS = 50;
const STAR_FLIGHT_MS = 900;

export function createMemoryUi({ boardEl, completionEl, onCardClick, onReplay, onBackToStart }) {
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersReducedMotion = () => reducedMotionQuery.matches;
  const speechSupported = typeof window !== 'undefined'
    && 'speechSynthesis' in window
    && typeof window.SpeechSynthesisUtterance === 'function';

  let cardEls = [];

  function clearBoard() {
    boardEl.innerHTML = '';
    cardEls = [];
  }

  function renderBoard(cards) {
    clearBoard();
    cards.forEach((card, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'memory-card';
      btn.setAttribute('aria-label', 'Dolt kort');
      btn.dataset.index = String(index);

      const inner = document.createElement('div');
      inner.className = 'memory-card-inner';

      const back = document.createElement('div');
      back.className = 'memory-card-face memory-card-back';
      back.setAttribute('aria-hidden', 'true');
      back.textContent = '?';

      const front = document.createElement('div');
      front.className = 'memory-card-face memory-card-front';
      front.setAttribute('aria-hidden', 'true');
      const motif = getMotifById(card.motifId);
      if (motif) {
        front.style.background = motif.color;
        // Trusted SVG markup from memory-data.MOTIFS — keys into a
        // hardcoded table, never user input.
        front.innerHTML = `<svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">${motif.icon}</svg>`;
      }

      inner.appendChild(back);
      inner.appendChild(front);
      btn.appendChild(inner);

      btn.addEventListener('click', () => {
        if (typeof onCardClick === 'function') onCardClick(index);
      });
      boardEl.appendChild(btn);
      cardEls.push(btn);
    });
  }

  function getCardEl(index) {
    return cardEls[index] || null;
  }

  function flipToFront(index) {
    const el = getCardEl(index);
    if (!el) return;
    el.classList.add('revealed');
    const motif = getMotifById(el.dataset.motif || null);
    if (motif) el.setAttribute('aria-label', motif.name);
  }

  function setAriaForReveal(index, motifId) {
    const el = getCardEl(index);
    if (!el) return;
    const motif = getMotifById(motifId);
    el.setAttribute('aria-label', motif ? motif.name : 'Kort');
  }

  function flipToBack(index) {
    const el = getCardEl(index);
    if (!el) return;
    el.classList.remove('revealed');
    el.classList.remove('mismatch');
    el.setAttribute('aria-label', 'Dolt kort');
  }

  function markMatched(indices) {
    indices.forEach((i) => {
      const el = getCardEl(i);
      if (!el) return;
      el.classList.add('matched');
      el.disabled = true;
    });
  }

  function showReveal(index, motifId) {
    flipToFront(index);
    setAriaForReveal(index, motifId);
  }

  function showMatch(indices, motifId) {
    markMatched(indices);
    // Scale pulse via a class the CSS drives. Removed after the
    // animation so repeated matches can re-pulse if needed.
    indices.forEach((i) => {
      const el = getCardEl(i);
      if (!el) return;
      el.classList.remove('match-pulse');
      void el.offsetWidth; // force reflow so the animation restarts
      el.classList.add('match-pulse');
      setTimeout(() => el.classList.remove('match-pulse'), MATCH_PULSE_MS + 50);
    });
  }

  function showMismatch(indices) {
    indices.forEach((i) => {
      const el = getCardEl(i);
      if (!el) return;
      el.classList.add('mismatch');
    });
    // The game module handles the hide timer; we just need to clear
    // the mismatch tint when it fires.
    setTimeout(() => {
      indices.forEach((i) => {
        const el = getCardEl(i);
        if (el) el.classList.remove('mismatch');
      });
    }, MISMATCH_HIDE_MS);
  }

  function hideCards(indices) {
    indices.forEach(flipToBack);
  }

  function speakFact(text) {
    if (!speechSupported || !text) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.lang = 'sv-SE';
      utter.rate = 0.95;
      window.speechSynthesis.speak(utter);
    } catch (_) { /* ignore */ }
  }

  function cancelSpeech() {
    if (speechSupported) {
      try { window.speechSynthesis.cancel(); } catch (_) { /* ignore */ }
    }
  }

  function flyStarFromCard(cardIndex) {
    const cardEl = getCardEl(cardIndex);
    const starTarget = document.querySelector('.game-shell-stars');
    if (!cardEl || !starTarget) return;
    if (prefersReducedMotion()) return;

    const startRect = cardEl.getBoundingClientRect();
    const endRect = starTarget.getBoundingClientRect();
    const start = { x: startRect.left + startRect.width / 2, y: startRect.top + startRect.height / 2 };
    const end = { x: endRect.left + endRect.width / 2, y: endRect.top + endRect.height / 2 };

    const star = document.createElement('div');
    star.className = 'memory-flying-star';
    star.textContent = '\u2B50';
    star.style.left = `${start.x}px`;
    star.style.top = `${start.y}px`;
    document.body.appendChild(star);

    const started = performance.now();
    function step(now) {
      const p = Math.min(1, (now - started) / STAR_FLIGHT_MS);
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const control = { x: (start.x + end.x) / 2, y: Math.min(start.y, end.y) - 140 };
      const inv = 1 - eased;
      const x = inv * inv * start.x + 2 * inv * eased * control.x + eased * eased * end.x;
      const y = inv * inv * start.y + 2 * inv * eased * control.y + eased * eased * end.y;
      const scale = 1 + Math.sin(eased * Math.PI) * 0.4;
      star.style.left = `${x}px`;
      star.style.top = `${y}px`;
      star.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${eased * 200}deg)`;
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        star.remove();
      }
    }
    requestAnimationFrame(step);
  }

  function revealAllForPeek() {
    cardEls.forEach((el) => el.classList.add('peek', 'revealed'));
  }

  function hideAllAfterPeek() {
    // Staggered cascade: 50 ms apart. Under reduced-motion everything
    // snaps at once. Returns a promise that resolves when every card
    // is face-down so the caller can unlock input.
    const reduced = prefersReducedMotion();
    return new Promise((resolve) => {
      let remaining = cardEls.length;
      const done = () => { remaining -= 1; if (remaining <= 0) resolve(); };
      cardEls.forEach((el, i) => {
        const delay = reduced ? 0 : i * CASCADE_STEP_MS;
        setTimeout(() => {
          el.classList.remove('revealed', 'peek');
          el.setAttribute('aria-label', 'Dolt kort');
          done();
        }, delay);
      });
    });
  }

  function lockInput(locked) {
    cardEls.forEach((el) => {
      if (locked) {
        el.setAttribute('aria-disabled', 'true');
        el.dataset.locked = '1';
      } else {
        el.removeAttribute('aria-disabled');
        delete el.dataset.locked;
      }
    });
    boardEl.classList.toggle('locked', !!locked);
  }

  function showCompletion({ moves, starsEarned, onReplayClick, onBackClick }) {
    if (!completionEl) return;
    completionEl.innerHTML = '';

    const title = document.createElement('h2');
    title.className = 'memory-completion-title';
    title.textContent = 'Uppdrag slutfört!';

    const stars = document.createElement('p');
    stars.className = 'memory-completion-stars';
    stars.textContent = `${'\u2B50'.repeat(starsEarned)}`;

    const statsLine = document.createElement('p');
    statsLine.className = 'memory-completion-stats';
    statsLine.textContent = `Antal drag: ${moves}`;

    const actions = document.createElement('div');
    actions.className = 'memory-completion-actions';

    const replay = document.createElement('button');
    replay.type = 'button';
    replay.className = 'memory-action primary';
    replay.textContent = 'Spela igen';
    replay.addEventListener('click', () => {
      if (typeof onReplayClick === 'function') onReplayClick();
    });

    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'memory-action secondary';
    back.textContent = 'Till startsidan';
    back.addEventListener('click', () => {
      if (typeof onBackClick === 'function') onBackClick();
    });

    actions.appendChild(replay);
    actions.appendChild(back);

    completionEl.appendChild(title);
    completionEl.appendChild(stars);
    completionEl.appendChild(statsLine);
    completionEl.appendChild(actions);

    completionEl.hidden = false;
    completionEl.setAttribute('aria-hidden', 'false');
    // Focus the primary action so keyboard users can replay immediately.
    setTimeout(() => { replay.focus(); }, 0);
  }

  function hideCompletion() {
    if (!completionEl) return;
    completionEl.hidden = true;
    completionEl.setAttribute('aria-hidden', 'true');
    completionEl.innerHTML = '';
  }

  return {
    renderBoard,
    showReveal,
    showMatch,
    showMismatch,
    hideCards,
    speakFact,
    cancelSpeech,
    flyStarFromCard,
    revealAllForPeek,
    hideAllAfterPeek,
    lockInput,
    showCompletion,
    hideCompletion,
    prefersReducedMotion,
    PEEK_DURATION_MS,
  };
}
