// Icon library and constants shared by the start page.
// ICONS holds hardcoded SVG path fragments — never user input —
// so consumers may assign them via innerHTML (see iconSvg in start.js).
// There is no pre-seeded pilot roster: every account starts with an
// empty pilots map and the user creates their own via the empty-state
// onboarding card on the start page.

export const NEW_PILOT_COLORS = [
  '#d85a30',
  '#378add',
  '#7f77dd',
  '#1d9e75',
  '#d4537e',
  '#ba7517',
  '#0f6e56',
];

export const ICONS = {
  rocket: '<path d="M12 2L12 2 C8 6 8 10 8 14 L8 20 L16 20 L16 14 C16 10 16 6 12 2 Z M9 22 L15 22 M12 8 L12 12"/>',
  bolt:   '<path d="M13 2 L4 14 L11 14 L11 22 L20 10 L13 10 Z" fill="#fff"/>',
  smile:  '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
  user:   '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2"/>',
  star:   '<polygon points="12 2 15 9 22 9 17 14 19 22 12 18 5 22 7 14 2 9 9 9 12 2"/>',
  plus:   '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  globe:  '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  brain:  '<path d="M12 4a4 4 0 0 0-4 4 4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4 4 4 0 0 0 4-4 4 4 0 0 0-4-4 4 4 0 0 0-4-4z"/>',
  abc:    '<path d="M4 18V9a3 3 0 0 1 6 0v9M4 13h6"/><path d="M14 18V9h3a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-3M14 13h3a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-3"/>',
  lock:   '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  play:   '<polygon points="6 4 20 12 6 20 6 4" stroke="none"/>',
  radio:  '<path d="M4.5 10a10 10 0 0 1 15 0"/><path d="M7 13a6 6 0 0 1 10 0"/><circle cx="12" cy="17" r="2"/><line x1="12" y1="3" x2="12" y2="9"/>',
};

export const STORAGE_KEYS = {
  pilots: 'rymdakademin.pilots.v1',
  selectedPilot: 'rymdakademin.selectedPilot.v1',
};
