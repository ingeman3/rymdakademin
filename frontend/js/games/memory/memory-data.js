// Motifs, constants, and Swedish facts for Rymdminnet.
//
// Each motif appears twice on the board (8 pairs × 2 = 16 cards).
// The icon field holds a hardcoded inline-SVG fragment — trusted
// markup, never user input, so consumers may render it via innerHTML
// the same way the start page renders ICONS from pilots-data.js. Keep
// the icons simple: single-color strokes/fills, readable at 60-140 px.

export const GRID_SIZE = 16;
export const PAIRS_COUNT = 8;
export const PEEK_DURATION_MS = 4000;
export const MISMATCH_HIDE_MS = 900;
export const PERFECT_MOVES_THRESHOLD = 20;

export const MOTIFS = [
  {
    id: 'saturn',
    name: 'Saturnus',
    color: '#f1d08a',
    fact: 'Saturnus har fina ringar!',
    icon:
      '<circle cx="32" cy="32" r="14" fill="#f1d08a"/>' +
      '<ellipse cx="32" cy="32" rx="26" ry="7" fill="none" stroke="#c99148" stroke-width="3"/>',
  },
  {
    id: 'earth',
    name: 'Jorden',
    color: '#4fc06e',
    fact: 'Det här är vår hemplanet.',
    icon:
      '<circle cx="32" cy="32" r="18" fill="#2695d4"/>' +
      '<path d="M18 30c4-4 8-2 12 2s8 6 14 2" fill="none" stroke="#4fc06e" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="24" cy="26" r="3" fill="#4fc06e"/>' +
      '<circle cx="40" cy="38" r="3" fill="#4fc06e"/>',
  },
  {
    id: 'sun',
    name: 'Solen',
    color: '#ffd166',
    fact: 'Solen är en stor stjärna.',
    icon:
      '<circle cx="32" cy="32" r="14" fill="#ffd166"/>' +
      '<g stroke="#ffd166" stroke-width="3" stroke-linecap="round">' +
      '<line x1="32" y1="8" x2="32" y2="16"/>' +
      '<line x1="32" y1="48" x2="32" y2="56"/>' +
      '<line x1="8" y1="32" x2="16" y2="32"/>' +
      '<line x1="48" y1="32" x2="56" y2="32"/>' +
      '<line x1="15" y1="15" x2="20" y2="20"/>' +
      '<line x1="44" y1="44" x2="49" y2="49"/>' +
      '<line x1="15" y1="49" x2="20" y2="44"/>' +
      '<line x1="44" y1="20" x2="49" y2="15"/>' +
      '</g>',
  },
  {
    id: 'rocket',
    name: 'Rymdraket',
    color: '#65f7ff',
    fact: 'Raketer flyger till rymden.',
    icon:
      '<path d="M32 10c8 6 12 14 12 24v12h-24V34c0-10 4-18 12-24z" fill="#dffcff" stroke="#65f7ff" stroke-width="2.5"/>' +
      '<circle cx="32" cy="28" r="5" fill="#65f7ff"/>' +
      '<path d="M20 40l-6 12h10z" fill="#55ffb2"/>' +
      '<path d="M44 40l6 12h-10z" fill="#55ffb2"/>',
  },
  {
    id: 'astronaut',
    name: 'Astronaut',
    color: '#c4d4e8',
    fact: 'En astronaut reser i rymden.',
    icon:
      '<ellipse cx="32" cy="22" rx="11" ry="11" fill="#eaf2ff" stroke="#aeb9d8" stroke-width="2"/>' +
      '<rect x="23" y="17" width="18" height="8" rx="2" fill="#273d88"/>' +
      '<rect x="20" y="32" width="24" height="20" rx="4" fill="#eaf2ff" stroke="#aeb9d8" stroke-width="2"/>' +
      '<rect x="28" y="38" width="8" height="8" fill="#65f7ff"/>',
  },
  {
    id: 'ufo',
    name: 'UFO',
    color: '#9d4edd',
    fact: 'Ett flygande tefat!',
    icon:
      '<ellipse cx="32" cy="40" rx="22" ry="7" fill="#6a3aa8" stroke="#9d4edd" stroke-width="2"/>' +
      '<path d="M18 38c0-8 6-14 14-14s14 6 14 14z" fill="#c58dff" stroke="#9d4edd" stroke-width="2"/>' +
      '<circle cx="32" cy="30" r="4" fill="#55ffb2"/>',
  },
  {
    id: 'comet',
    name: 'Komet',
    color: '#ff8c3f',
    fact: 'Kometer har långa svansar.',
    icon:
      '<circle cx="46" cy="20" r="9" fill="#fff7b8"/>' +
      '<path d="M40 24L12 50" stroke="#ff8c3f" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M44 28L22 48" stroke="#ffd166" stroke-width="3" stroke-linecap="round"/>',
  },
  {
    id: 'moon',
    name: 'Månen',
    color: '#d6d6e0',
    fact: 'Månen snurrar runt Jorden.',
    icon:
      '<circle cx="32" cy="32" r="18" fill="#e8e8f2"/>' +
      '<circle cx="24" cy="26" r="3" fill="#aeb9d8"/>' +
      '<circle cx="38" cy="34" r="4" fill="#aeb9d8"/>' +
      '<circle cx="30" cy="42" r="2.5" fill="#aeb9d8"/>',
  },
];

export function getMotifById(id) {
  return MOTIFS.find((m) => m.id === id) || null;
}
