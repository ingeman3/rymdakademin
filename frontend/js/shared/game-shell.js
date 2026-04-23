// Common header prepended to every game: back-to-start button on the
// left, selected pilot + star count on the right. Games call
// createGameShell() and insert the returned element at the top of
// their layout. The shell subscribes to progress.onChange and refreshes
// itself whenever the player's stars go up.

import { getSelectedPilot, onChange } from './progress.js';

const BACK_ARROW_SVG = '<svg viewBox="0 0 24 24" width="22" height="22" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>';
const STAR_GLYPH = '\u2B50';

function avatarSvg(icon) {
  // Icon strings are reused from phase 4 pilots-data via a tiny
  // lookup here rather than re-importing, to keep the shell decoupled
  // from the pilot roster's visual assets. If the icon name is not in
  // this table, the avatar is plain-coloured.
  const ICONS = {
    rocket: '<path d="M12 2L12 2 C8 6 8 10 8 14 L8 20 L16 20 L16 14 C16 10 16 6 12 2 Z M9 22 L15 22 M12 8 L12 12"/>',
    bolt:   '<path d="M13 2 L4 14 L11 14 L11 22 L20 10 L13 10 Z" fill="#fff"/>',
    smile:  '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
    user:   '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2"/>',
    star:   '<polygon points="12 2 15 9 22 9 17 14 19 22 12 18 5 22 7 14 2 9 9 9 12 2"/>',
  };
  const body = ICONS[icon] || '';
  return `<svg viewBox="0 0 24 24" width="22" height="22" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

export function createGameShell({ onBackToStart } = {}) {
  const shell = document.createElement('header');
  shell.className = 'game-shell';

  // Back button — always on the left.
  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'game-shell-back';
  back.setAttribute('aria-label', 'Till startsidan');
  // Trusted static SVG markup; no user input reaches innerHTML here.
  back.innerHTML = `${BACK_ARROW_SVG}<span class="game-shell-back-label">Till startsidan</span>`;
  back.addEventListener('click', () => {
    if (typeof onBackToStart === 'function') {
      onBackToStart();
      return;
    }
    window.location.href = '/';
  });
  shell.appendChild(back);

  // Pilot + stars — right side.
  const right = document.createElement('div');
  right.className = 'game-shell-pilot';

  const avatar = document.createElement('span');
  avatar.className = 'game-shell-avatar';

  const nameEl = document.createElement('span');
  nameEl.className = 'game-shell-name';

  const starsEl = document.createElement('span');
  starsEl.className = 'game-shell-stars';

  right.appendChild(avatar);
  right.appendChild(nameEl);
  right.appendChild(starsEl);
  shell.appendChild(right);

  function render() {
    const pilot = getSelectedPilot();
    if (!pilot) {
      avatar.style.background = 'rgba(255, 255, 255, 0.14)';
      avatar.innerHTML = '';
      nameEl.textContent = '';
      starsEl.textContent = '';
      right.hidden = true;
      return;
    }
    right.hidden = false;
    avatar.style.background = pilot.color || '#378add';
    // Trusted avatar SVG from a hardcoded table; pilot.icon is a key
    // into ICONS, not a caller-supplied markup string.
    avatar.innerHTML = avatarSvg(pilot.icon);
    // textContent for pilot name — user-supplied value.
    nameEl.textContent = pilot.name;
    starsEl.textContent = `${STAR_GLYPH} ${pilot.totalStars || 0}`;
  }

  render();
  const unsubscribe = onChange(render);

  shell.update = render;
  shell.destroy = () => { unsubscribe(); };

  return shell;
}
