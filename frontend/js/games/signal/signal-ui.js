// DOM layer for Rymdsignalen. Owns:
// - the cockpit-style message panel with gap slots
// - the letter-button grid at the bottom
// - letter-flight animations from panel to gap
// - wrong-letter shake + red tint
// - message-complete glow + SpeechSynthesis read-aloud
// - star-flight to the game-shell star counter
// - completion screen
// - a single isBusy() gate the caller uses to throttle clicks.
//
// Pattern: every animation respects prefers-reduced-motion and
// short-circuits to an instant outcome when set. Pilot name and
// message text are rendered via textContent. SVG icon markup is
// never accepted from the caller.

const LETTER_FLIGHT_MS = 600;
const WRONG_SHAKE_MS = 300;
const MESSAGE_GLOW_MS = 800;
const STAR_FLIGHT_MS = 900;
const POST_MESSAGE_HOLD_MS = 1500;

export function createSignalUi({
  messagePanelEl,
  letterPanelEl,
  completionEl,
  onLetterClick,
}) {
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersReducedMotion = () => reducedMotionQuery.matches;
  const speechSupported = typeof window !== 'undefined'
    && 'speechSynthesis' in window
    && typeof window.SpeechSynthesisUtterance === 'function';

  let charEls = [];     // per-position spans for the current message
  let letterBtns = new Map(); // letter -> button element
  let busyUntil = 0;

  function isBusy() {
    return performance.now() < busyUntil;
  }

  function extendBusy(ms) {
    const target = performance.now() + ms;
    if (target > busyUntil) busyUntil = target;
  }

  function clearBusy() {
    busyUntil = 0;
  }

  function renderMessage(message, revealed, activeGap) {
    messagePanelEl.innerHTML = '';
    charEls = [];

    const chars = Array.from(message.text);
    chars.forEach((ch, idx) => {
      if (ch === ' ') {
        const space = document.createElement('span');
        space.className = 'signal-char-space';
        space.setAttribute('aria-hidden', 'true');
        messagePanelEl.appendChild(space);
        charEls.push(null);
        return;
      }
      const slot = document.createElement('span');
      slot.className = 'signal-char';
      slot.dataset.index = String(idx);
      if (revealed[idx]) {
        slot.classList.add('revealed');
        // textContent — the char comes from data but MOTIFS-like
        // hardcoded strings only; even so, textContent keeps it
        // impossible to smuggle markup.
        slot.textContent = ch;
      } else {
        slot.classList.add('hidden');
        if (idx === activeGap) slot.classList.add('active-gap');
        slot.textContent = '';
      }
      messagePanelEl.appendChild(slot);
      charEls.push(slot);
    });
  }

  function setActiveGap(nextActive) {
    charEls.forEach((el) => {
      if (el) el.classList.remove('active-gap');
    });
    if (nextActive == null) return;
    const el = charEls[nextActive];
    if (el) el.classList.add('active-gap');
  }

  function renderLetters(letters, sortedAlphabetically = true) {
    letterPanelEl.innerHTML = '';
    letterBtns = new Map();

    // Stable layout is easier on children: sort alphabetically each
    // session, since the shuffle at game-start already randomised
    // which letters appear.
    const ordered = sortedAlphabetically ? [...letters].sort((a, b) => a.localeCompare(b, 'sv')) : letters;

    ordered.forEach((letter) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'signal-letter';
      btn.dataset.letter = letter;
      btn.setAttribute('aria-label', `Bokstaven ${letter}`);
      btn.textContent = letter;
      btn.addEventListener('click', () => {
        if (isBusy()) return;
        if (typeof onLetterClick === 'function') onLetterClick(letter);
      });
      letterPanelEl.appendChild(btn);
      letterBtns.set(letter, btn);
    });
  }

  function animateWrongLetter(letter) {
    const btn = letterBtns.get(letter);
    if (!btn) return;
    if (prefersReducedMotion()) {
      // Brief flash without motion, cleared synchronously.
      btn.classList.add('wrong');
      setTimeout(() => btn.classList.remove('wrong'), 10);
      extendBusy(10);
      return;
    }
    btn.classList.remove('wrong');
    // Force reflow so the animation restarts if re-triggered rapidly.
    void btn.offsetWidth;
    btn.classList.add('wrong');
    setTimeout(() => btn.classList.remove('wrong'), WRONG_SHAKE_MS);
    extendBusy(WRONG_SHAKE_MS);
  }

  function animateCorrectLetter(letter, gapIndex) {
    const btn = letterBtns.get(letter);
    const target = charEls[gapIndex];
    if (!btn || !target) {
      revealGap(gapIndex, letter);
      return;
    }
    if (prefersReducedMotion()) {
      revealGap(gapIndex, letter);
      extendBusy(10);
      return;
    }

    const startRect = btn.getBoundingClientRect();
    const endRect = target.getBoundingClientRect();
    const flying = document.createElement('div');
    flying.className = 'signal-flying-letter';
    flying.textContent = letter;
    flying.style.left = `${startRect.left + startRect.width / 2}px`;
    flying.style.top = `${startRect.top + startRect.height / 2}px`;
    document.body.appendChild(flying);

    const start = { x: startRect.left + startRect.width / 2, y: startRect.top + startRect.height / 2 };
    const end = { x: endRect.left + endRect.width / 2, y: endRect.top + endRect.height / 2 };
    const control = { x: (start.x + end.x) / 2, y: Math.min(start.y, end.y) - 120 };
    const startedAt = performance.now();

    function step(now) {
      const p = Math.min(1, (now - startedAt) / LETTER_FLIGHT_MS);
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const inv = 1 - eased;
      const x = inv * inv * start.x + 2 * inv * eased * control.x + eased * eased * end.x;
      const y = inv * inv * start.y + 2 * inv * eased * control.y + eased * eased * end.y;
      flying.style.left = `${x}px`;
      flying.style.top = `${y}px`;
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        flying.remove();
        revealGap(gapIndex, letter);
      }
    }
    requestAnimationFrame(step);
    extendBusy(LETTER_FLIGHT_MS);
  }

  function revealGap(idx, letter) {
    const el = charEls[idx];
    if (!el) return;
    el.textContent = letter;
    el.classList.remove('hidden', 'active-gap');
    el.classList.add('revealed', 'just-filled');
    setTimeout(() => el.classList.remove('just-filled'), 400);
  }

  function showMessageComplete(message) {
    messagePanelEl.classList.remove('complete');
    void messagePanelEl.offsetWidth;
    messagePanelEl.classList.add('complete');
    if (!prefersReducedMotion()) {
      setTimeout(() => messagePanelEl.classList.remove('complete'), MESSAGE_GLOW_MS);
    }
    speakMessage(message.text);
    flyStarFromMessagePanel();
    extendBusy(prefersReducedMotion() ? 40 : POST_MESSAGE_HOLD_MS);
  }

  function speakMessage(text) {
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
    if (!speechSupported) return;
    try { window.speechSynthesis.cancel(); } catch (_) { /* ignore */ }
  }

  function flyStarFromMessagePanel() {
    const target = document.querySelector('.game-shell-stars');
    if (!target || prefersReducedMotion()) return;
    const startRect = messagePanelEl.getBoundingClientRect();
    const endRect = target.getBoundingClientRect();
    const start = { x: startRect.left + startRect.width / 2, y: startRect.top + startRect.height * 0.75 };
    const end = { x: endRect.left + endRect.width / 2, y: endRect.top + endRect.height / 2 };
    const control = { x: (start.x + end.x) / 2, y: Math.min(start.y, end.y) - 140 };

    const star = document.createElement('div');
    star.className = 'signal-flying-star';
    star.textContent = '\u2B50';
    star.style.left = `${start.x}px`;
    star.style.top = `${start.y}px`;
    document.body.appendChild(star);

    const startedAt = performance.now();
    function step(now) {
      const p = Math.min(1, (now - startedAt) / STAR_FLIGHT_MS);
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const inv = 1 - eased;
      const x = inv * inv * start.x + 2 * inv * eased * control.x + eased * eased * end.x;
      const y = inv * inv * start.y + 2 * inv * eased * control.y + eased * eased * end.y;
      const scale = 1 + Math.sin(eased * Math.PI) * 0.45;
      star.style.left = `${x}px`;
      star.style.top = `${y}px`;
      star.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${eased * 220}deg)`;
      if (p < 1) requestAnimationFrame(step);
      else star.remove();
    }
    requestAnimationFrame(step);
  }

  function showCompletion({ stars, onReplayClick, onBackClick }) {
    if (!completionEl) return;
    completionEl.innerHTML = '';

    const title = document.createElement('h2');
    title.className = 'signal-completion-title';
    title.textContent = 'Kontakten är återställd, pilot!';

    const subtitle = document.createElement('p');
    subtitle.className = 'signal-completion-subtitle';
    subtitle.textContent = 'Tack för hjälpen.';

    const starsEl = document.createElement('p');
    starsEl.className = 'signal-completion-stars';
    starsEl.textContent = '\u2B50'.repeat(stars);

    const actions = document.createElement('div');
    actions.className = 'signal-completion-actions';

    const replay = document.createElement('button');
    replay.type = 'button';
    replay.className = 'signal-action primary';
    replay.textContent = 'Spela igen';
    replay.addEventListener('click', () => {
      if (typeof onReplayClick === 'function') onReplayClick();
    });

    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'signal-action secondary';
    back.textContent = 'Till startsidan';
    back.addEventListener('click', () => {
      if (typeof onBackClick === 'function') onBackClick();
    });

    actions.appendChild(replay);
    actions.appendChild(back);

    completionEl.appendChild(title);
    completionEl.appendChild(subtitle);
    completionEl.appendChild(starsEl);
    completionEl.appendChild(actions);

    completionEl.hidden = false;
    completionEl.setAttribute('aria-hidden', 'false');
    setTimeout(() => { replay.focus(); }, 0);
  }

  function hideCompletion() {
    if (!completionEl) return;
    completionEl.hidden = true;
    completionEl.setAttribute('aria-hidden', 'true');
    completionEl.innerHTML = '';
  }

  return {
    renderMessage,
    setActiveGap,
    renderLetters,
    animateWrongLetter,
    animateCorrectLetter,
    showMessageComplete,
    showCompletion,
    hideCompletion,
    speakMessage,
    cancelSpeech,
    isBusy,
    clearBusy,
    prefersReducedMotion,
  };
}
