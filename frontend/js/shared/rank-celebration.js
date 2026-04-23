// Full-screen overlay that celebrates a rank promotion. Games call
// showRankCelebration({ rank, name }) and receive a promise that
// resolves when the overlay has closed — typically after ~2.5 s,
// or immediately under prefers-reduced-motion.

const RANK_LABEL = {
  kadett: 'Kadett',
  pilot: 'Pilot',
  kapten: 'Kapten',
  rymdforskare: 'Rymdforskare',
  amiral: 'Amiral',
};

const VISIBLE_MS = 2500;

export function showRankCelebration({ rank, name }) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const overlay = document.createElement('div');
  overlay.className = 'rank-celebration';
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-live', 'polite');

  const badge = document.createElement('div');
  badge.className = 'rank-celebration-badge';
  badge.textContent = RANK_LABEL[rank] || rank;

  const line = document.createElement('p');
  line.className = 'rank-celebration-line';
  // textContent — name may be user-controlled.
  line.textContent = `Du är nu ${RANK_LABEL[rank] || rank}, ${name || 'pilot'}!`;

  overlay.appendChild(badge);
  overlay.appendChild(line);
  document.body.appendChild(overlay);

  // Force a reflow before adding the 'visible' class so the opening
  // transition actually plays (browsers coalesce class additions on
  // just-appended nodes otherwise).
  void overlay.offsetWidth;
  overlay.classList.add('visible');

  return new Promise((resolve) => {
    const remove = () => {
      overlay.classList.remove('visible');
      // Wait for the fade-out before removing. Under reduced motion
      // this is instant because transition-duration is 0.001 ms.
      window.setTimeout(() => {
        overlay.remove();
        resolve();
      }, prefersReduced ? 0 : 260);
    };
    window.setTimeout(remove, prefersReduced ? 0 : VISIBLE_MS);
  });
}
