// Rank-tiered message pool + letter-panel configuration for
// Rymdsignalen. Each tier defines:
//   panelSize       — how many letter buttons the panel shows
//   alphabet        — the pool distractors are drawn from
//   messages        — an array of { text, gaps, icon } objects where
//                     gaps is the 0-indexed positions that start
//                     hidden. Spaces in phrases are NEVER gaps.
//                     icon is a key into ICONS (added in the next
//                     commit) that renders above the message panel.
//
// Phase 9 rewrite: every message is space-themed. Ambiguous Swedish
// words that shared letters across multiple valid guesses (MÅS, MIN,
// IS standalone, etc.) are gone. The icon above the message panel
// gives a 4-year-old a visual anchor for what the word represents —
// the letter panel is now a tool for spelling, not guessing.
//
// Panel-size note: the new wordlists need more unique letters than
// the phase 7 sizes (kadett union is 15 letters; pilot 21; kapten
// 17). panelSize was bumped per-tier to cover the union + a small
// distractor pool. The rank progression is preserved in relative
// terms (kadett 16 < pilot 22 < kapten 20 ≈ rymdforskare/amiral 29).

export const ALPHABET_ALL = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O',
  'P','Q','R','S','T','U','V','W','X','Y','Z','Å','Ä','Ö',
];

// Letters that are common in everyday Swedish words. Used as the
// distractor pool for the beginner tiers so the panel does not waste
// slots on Q/W/X/Z, which rarely appear in age-appropriate Swedish
// vocabulary.
export const ALPHABET_COMMON = [
  'A','B','D','E','F','G','H','I','J','K','L','M','N','O',
  'P','R','S','T','U','V','Y','Å','Ä','Ö',
];

export const SESSION_LENGTH = 7;

// ---- kadett -------------------------------------------------------
// 3-5 characters, 1 gap per message. All space-themed.
const kadettMessages = [
  { text: 'SOL',  gaps: [1], icon: 'sun' },     // S_L
  { text: 'MÅN',  gaps: [1], icon: 'moon' },    // M_N
  { text: 'UFO',  gaps: [1], icon: 'ufo' },     // U_O
  { text: 'JORD', gaps: [2], icon: 'earth' },   // JO_D
  { text: 'MARS', gaps: [2], icon: 'mars' },    // MA_S
  { text: 'RING', gaps: [1], icon: 'ring' },    // R_NG
  { text: 'BANA', gaps: [1], icon: 'orbit' },   // B_NA
];

// ---- pilot --------------------------------------------------------
// 4-7 chars, 1-2 gaps.
const pilotMessages = [
  { text: 'RAKET',   gaps: [1],    icon: 'rocket' },   // R_KET
  { text: 'KOMET',   gaps: [2],    icon: 'comet' },    // KO_ET
  { text: 'SKEPP',   gaps: [2],    icon: 'ship' },     // SK_PP
  { text: 'PLANET',  gaps: [2, 5], icon: 'planet' },   // PL_NE_
  { text: 'GALAX',   gaps: [2],    icon: 'galaxy' },   // GA_AX
  { text: 'METEOR',  gaps: [1, 4], icon: 'meteor' },   // M_TE_R
  { text: 'KRATER',  gaps: [1, 4], icon: 'crater' },   // K_AT_R
  { text: 'RYMDEN',  gaps: [1, 4], icon: 'space' },    // R_MD_N
  { text: 'HIMLEN',  gaps: [1, 4], icon: 'sky' },      // H_ML_N
  { text: 'STJÄRNA', gaps: [2, 5], icon: 'star' },     // ST_ÄR_A
  { text: 'VENUS',   gaps: [1, 3], icon: 'venus' },    // V_N_S
  { text: 'PLUTO',   gaps: [1, 3], icon: 'pluto' },    // P_U_O
];

// ---- kapten -------------------------------------------------------
// 5-9 chars, 2-3 gaps.
const kaptenMessages = [
  { text: 'ASTRONAUT', gaps: [1, 4, 7], icon: 'astronaut' }, // A_TR_NA_T
  { text: 'SATURNUS',  gaps: [1, 4, 6], icon: 'saturnus' },  // S_TU_N_S
  { text: 'JUPITER',   gaps: [1, 4],    icon: 'jupiter' },   // J_PI_ER
  { text: 'NEPTUNUS',  gaps: [2, 5],    icon: 'neptunus' },  // NE_TU_US
  { text: 'MERKURIUS', gaps: [1, 4, 7], icon: 'merkurius' }, // M_RK_RI_S
  { text: 'UNIVERSUM', gaps: [1, 4, 7], icon: 'universum' }, // U_IV_RS_M
  { text: 'NEBULOSA',  gaps: [1, 4],    icon: 'nebulosa' },  // N_BU_OSA
  { text: 'SPUTNIK',   gaps: [1, 4],    icon: 'sputnik' },   // S_UT_IK
  { text: 'TELESKOP',  gaps: [1, 4],    icon: 'teleskop' },  // T_LE_KOP
  { text: 'RADAR',     gaps: [1, 3],    icon: 'radar' },     // R_D_R
  { text: 'STATION',   gaps: [1, 4],    icon: 'station' },   // S_AT_ON
];

// ---- rymdforskare -------------------------------------------------
// Short phrases, 2-3 gaps. Full alphabet available.
const rymdforskareMessages = [
  { text: 'HEJ SOL',     gaps: [0, 4],    icon: 'greeting-sun' },    // _EJ _OL
  { text: 'TILL MÅNEN',  gaps: [0, 5],    icon: 'to-moon' },         // _ILL _ÅNEN
  { text: 'BRA JOBBAT',  gaps: [0, 4],    icon: 'thumbs-up-helmet' },// _RA _OBBAT
  { text: 'VI FLYGER',   gaps: [0, 3],    icon: 'rocket-motion' },   // _I _LYGER
  { text: 'KOMMA HEM',   gaps: [0, 6],    icon: 'earth-return' },    // _OMMA _EM
  { text: 'NYTT UPPDRAG',gaps: [0, 5],    icon: 'mission-star' },    // _YTT _PPDRAG
  { text: 'HEJ RYMDEN',  gaps: [0, 4],    icon: 'space' },           // _EJ _YMDEN
];

// ---- amiral -------------------------------------------------------
// Longer phrases, 3-5 gaps. Full alphabet.
const amiralMessages = [
  { text: 'VÄLKOMMEN HEM PILOT',   gaps: [0, 3, 10, 14],    icon: 'earth-landing' },  // _ÄL_OMMEN _EM _ILOT
  { text: 'STJÄRNORNA VÄNTAR',     gaps: [0, 3, 11, 14],    icon: 'star-field' },     // _TJ_RNORNA _ÄN_AR
  { text: 'UPPDRAG SLUTFÖRT',      gaps: [0, 4, 8, 12],     icon: 'helmet-check' },   // _PPD_AG _LUT_ÖRT
  { text: 'TACK PILOT',            gaps: [0, 2, 5, 8],      icon: 'helmet-heart' },   // _A_K _IL_T
  { text: 'NÄSTA GALAX',           gaps: [0, 3, 6, 9],      icon: 'galaxy-arrow' },   // _ÄS_A _AL_X
  { text: 'SOLEN ÄR EN STJÄRNA',   gaps: [0, 6, 9, 12, 14], icon: 'sun' },            // _OLEN _R _N _T_ÄRNA
  { text: 'RAKETEN FLYGER HEM',    gaps: [0, 8, 13, 15],    icon: 'rocket' },         // _AKETEN _LYGE_ _EM
];

export const TIERS = {
  kadett: {
    panelSize: 16,
    alphabet: ALPHABET_COMMON,
    messages: kadettMessages,
  },
  pilot: {
    panelSize: 22,
    alphabet: ALPHABET_COMMON,
    messages: pilotMessages,
  },
  kapten: {
    panelSize: 20,
    alphabet: ALPHABET_COMMON,
    messages: kaptenMessages,
  },
  rymdforskare: {
    panelSize: 29,
    alphabet: ALPHABET_ALL,
    messages: rymdforskareMessages,
  },
  amiral: {
    panelSize: 29,
    alphabet: ALPHABET_ALL,
    messages: amiralMessages,
  },
};

export function getTier(rank) {
  return TIERS[rank] || TIERS.kadett;
}

// ---- ICONS -------------------------------------------------------------
// Hardcoded inline-SVG fragments keyed by the `icon` field on each
// message. Designed for a 120×120 viewBox, rendered at ~100 px on
// desktop and ~80 px on mobile. Style:
// - filled shapes over strokes (readable at small sizes)
// - palette borrows from Solsystemsresan's planet styling
//   (cyan #65f7ff, amber #ffd166, Mars #d85a30, Earth blues/greens,
//   muted rock greys)
// - no gradients (keeps CSP straightforward and visual language tight)
//
// This map holds trusted authored markup, never user input, so
// consumers may assign it via innerHTML — same trust model as the
// planet ICONS in start.js. NEVER extend this helper to accept
// caller-supplied strings.

const ICON_RAYS = (
  '<g stroke="#ffd166" stroke-width="4" stroke-linecap="round">' +
  '<line x1="60" y1="10" x2="60" y2="24"/>' +
  '<line x1="60" y1="96" x2="60" y2="110"/>' +
  '<line x1="10" y1="60" x2="24" y2="60"/>' +
  '<line x1="96" y1="60" x2="110" y2="60"/>' +
  '<line x1="22" y1="22" x2="32" y2="32"/>' +
  '<line x1="88" y1="88" x2="98" y2="98"/>' +
  '<line x1="22" y1="98" x2="32" y2="88"/>' +
  '<line x1="88" y1="32" x2="98" y2="22"/>' +
  '</g>'
);

export const ICONS = {
  // ---- planets and bodies --------------------------------------------
  sun:
    ICON_RAYS +
    '<circle cx="60" cy="60" r="26" fill="#ffd166"/>' +
    '<circle cx="52" cy="52" r="6" fill="#fff7b8" opacity="0.8"/>',

  moon:
    '<path d="M80 28a38 38 0 1 0 0 64 30 30 0 0 1 0-64z" fill="#e8e8f2"/>' +
    '<circle cx="66" cy="46" r="3" fill="#aeb9d8"/>' +
    '<circle cx="70" cy="68" r="4" fill="#aeb9d8"/>' +
    '<circle cx="58" cy="80" r="2.5" fill="#aeb9d8"/>',

  ufo:
    '<ellipse cx="60" cy="82" rx="46" ry="12" fill="#6a3aa8"/>' +
    '<path d="M24 76c0-16 16-28 36-28s36 12 36 28z" fill="#c58dff"/>' +
    '<circle cx="60" cy="56" r="9" fill="#55ffb2"/>' +
    '<circle cx="40" cy="88" r="3" fill="#ffd166"/>' +
    '<circle cx="60" cy="90" r="3" fill="#ffd166"/>' +
    '<circle cx="80" cy="88" r="3" fill="#ffd166"/>',

  earth:
    '<circle cx="60" cy="60" r="38" fill="#2695d4"/>' +
    '<path d="M32 52c8-2 14 4 20 2s10-8 18-4 14 12 18 6" fill="none" stroke="#4fc06e" stroke-width="8" stroke-linecap="round"/>' +
    '<circle cx="42" cy="44" r="6" fill="#4fc06e"/>' +
    '<circle cx="76" cy="72" r="5" fill="#4fc06e"/>',

  mars:
    '<circle cx="60" cy="60" r="38" fill="#d85a30"/>' +
    '<circle cx="72" cy="48" r="6" fill="#8f2d1a" opacity="0.7"/>' +
    '<circle cx="46" cy="70" r="8" fill="#8f2d1a" opacity="0.5"/>' +
    '<circle cx="64" cy="78" r="4" fill="#ffb08a" opacity="0.8"/>',

  ring:
    '<ellipse cx="60" cy="62" rx="52" ry="10" fill="none" stroke="#c99148" stroke-width="5"/>' +
    '<circle cx="60" cy="58" r="26" fill="#f1d08a"/>',

  orbit:
    '<ellipse cx="60" cy="60" rx="46" ry="18" fill="none" stroke="#65f7ff" stroke-width="3" stroke-dasharray="4 4"/>' +
    '<circle cx="60" cy="60" r="8" fill="#ffd166"/>' +
    '<circle cx="100" cy="66" r="6" fill="#65f7ff"/>',

  rocket:
    '<path d="M60 12c10 10 14 24 14 38v30H46V50c0-14 4-28 14-38z" fill="#dffcff" stroke="#65f7ff" stroke-width="3"/>' +
    '<circle cx="60" cy="44" r="7" fill="#65f7ff"/>' +
    '<path d="M46 80l-10 20h14z" fill="#55ffb2"/>' +
    '<path d="M74 80l10 20h-14z" fill="#55ffb2"/>' +
    '<path d="M52 98l8 14 8-14z" fill="#ffd166"/>',

  comet:
    '<circle cx="88" cy="34" r="14" fill="#fff7b8"/>' +
    '<circle cx="88" cy="34" r="9" fill="#ffd166"/>' +
    '<path d="M80 42L14 98" stroke="#ff8c3f" stroke-width="9" stroke-linecap="round"/>' +
    '<path d="M86 48L38 96" stroke="#ffd166" stroke-width="5" stroke-linecap="round" opacity="0.85"/>',

  ship:
    '<path d="M10 60c20-22 54-30 100-18-14 10-14 26 0 36-46 12-80 4-100-18z" fill="#dffcff" stroke="#65f7ff" stroke-width="3"/>' +
    '<circle cx="78" cy="60" r="10" fill="#111a3d" stroke="#65f7ff" stroke-width="3"/>' +
    '<path d="M22 52l-8-10h12z" fill="#55ffb2"/>' +
    '<path d="M22 68l-8 10h12z" fill="#55ffb2"/>',

  planet:
    '<circle cx="60" cy="60" r="38" fill="#8a5dd4"/>' +
    '<path d="M32 56c10-4 22 6 38 0s14-8 28-2" fill="none" stroke="#c58dff" stroke-width="6" stroke-linecap="round"/>' +
    '<circle cx="48" cy="76" r="5" fill="#c58dff"/>',

  galaxy:
    '<circle cx="60" cy="60" r="10" fill="#ffd166"/>' +
    '<path d="M60 60q30-24 48 4" fill="none" stroke="#65f7ff" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M60 60q-30 24-48-4" fill="none" stroke="#65f7ff" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M60 60q18 28-16 40" fill="none" stroke="#c58dff" stroke-width="4" stroke-linecap="round"/>' +
    '<path d="M60 60q-18-28 16-40" fill="none" stroke="#c58dff" stroke-width="4" stroke-linecap="round"/>' +
    '<circle cx="86" cy="46" r="3" fill="#ffffff"/>' +
    '<circle cx="34" cy="76" r="3" fill="#ffffff"/>',

  meteor:
    '<path d="M92 30l-72 72" stroke="#ff8c3f" stroke-width="16" stroke-linecap="round"/>' +
    '<path d="M96 38l-56 56" stroke="#ffd166" stroke-width="9" stroke-linecap="round" opacity="0.9"/>' +
    '<circle cx="92" cy="30" r="14" fill="#fff7b8"/>' +
    '<circle cx="92" cy="30" r="8" fill="#ff6b6b"/>',

  crater:
    '<circle cx="60" cy="60" r="44" fill="#d6d6e0"/>' +
    '<circle cx="44" cy="48" r="10" fill="#aeb9d8"/>' +
    '<circle cx="44" cy="48" r="6" fill="#8a92ae"/>' +
    '<circle cx="78" cy="66" r="12" fill="#aeb9d8"/>' +
    '<circle cx="78" cy="66" r="7" fill="#8a92ae"/>' +
    '<circle cx="54" cy="82" r="6" fill="#aeb9d8"/>' +
    '<circle cx="54" cy="82" r="3" fill="#8a92ae"/>',

  space:
    '<rect x="6" y="6" width="108" height="108" rx="14" fill="#050818"/>' +
    '<circle cx="28" cy="30" r="3" fill="#ffffff"/>' +
    '<circle cx="72" cy="22" r="2" fill="#65f7ff"/>' +
    '<circle cx="94" cy="48" r="3" fill="#ffffff"/>' +
    '<circle cx="42" cy="62" r="2" fill="#ffd166"/>' +
    '<circle cx="86" cy="82" r="3" fill="#ffffff"/>' +
    '<circle cx="30" cy="92" r="2" fill="#65f7ff"/>' +
    '<circle cx="60" cy="72" r="1.5" fill="#ffffff"/>' +
    '<circle cx="54" cy="40" r="1.5" fill="#ffffff"/>',

  sky:
    '<rect x="6" y="6" width="108" height="108" rx="14" fill="#0d1336"/>' +
    '<circle cx="28" cy="30" r="3" fill="#ffffff"/>' +
    '<circle cx="72" cy="22" r="2" fill="#65f7ff"/>' +
    '<circle cx="94" cy="48" r="3" fill="#ffffff"/>' +
    '<circle cx="42" cy="62" r="2" fill="#ffd166"/>' +
    '<circle cx="86" cy="82" r="3" fill="#ffffff"/>' +
    '<circle cx="30" cy="92" r="2" fill="#65f7ff"/>',

  star:
    '<polygon points="60 8 74 48 116 48 82 72 94 114 60 90 26 114 38 72 4 48 46 48" fill="#ffd166"/>',

  venus:
    '<circle cx="60" cy="60" r="38" fill="#f6ca76"/>' +
    '<path d="M24 56c14-6 28 6 44 0s20-6 28 4" fill="none" stroke="#d99b4e" stroke-width="6" stroke-linecap="round" opacity="0.8"/>' +
    '<path d="M26 76c12-2 24 4 38 2s22-4 30 0" fill="none" stroke="#d99b4e" stroke-width="5" stroke-linecap="round" opacity="0.6"/>',

  pluto:
    '<circle cx="60" cy="60" r="26" fill="#d6d6c8"/>' +
    '<circle cx="48" cy="54" r="8" fill="#9a8e76" opacity="0.7"/>' +
    '<circle cx="70" cy="70" r="5" fill="#9a8e76" opacity="0.6"/>',

  astronaut:
    '<circle cx="60" cy="56" r="34" fill="#eaf2ff" stroke="#aeb9d8" stroke-width="3"/>' +
    '<rect x="36" y="48" width="48" height="22" rx="4" fill="#111a3d"/>' +
    '<rect x="40" y="52" width="40" height="14" rx="2" fill="#65f7ff"/>' +
    '<rect x="46" y="90" width="28" height="20" rx="3" fill="#eaf2ff" stroke="#aeb9d8" stroke-width="3"/>',

  saturnus:
    '<ellipse cx="60" cy="62" rx="56" ry="12" fill="none" stroke="#c99148" stroke-width="6" opacity="0.9"/>' +
    '<ellipse cx="60" cy="62" rx="56" ry="12" fill="none" stroke="#f1d08a" stroke-width="2" opacity="0.7"/>' +
    '<circle cx="60" cy="56" r="28" fill="#f1d08a"/>' +
    '<circle cx="50" cy="48" r="6" fill="#c99148" opacity="0.5"/>',

  jupiter:
    '<circle cx="60" cy="60" r="40" fill="#f5ddbb"/>' +
    '<rect x="22" y="42" width="76" height="7" fill="#b8754c"/>' +
    '<rect x="22" y="58" width="76" height="7" fill="#8f523d"/>' +
    '<rect x="22" y="74" width="76" height="7" fill="#d39861"/>' +
    '<ellipse cx="72" cy="64" rx="10" ry="6" fill="#a3432f" opacity="0.85"/>' +
    '<circle cx="60" cy="60" r="40" fill="none" stroke="#8f523d" stroke-width="2" opacity="0.6"/>',

  neptunus:
    '<circle cx="60" cy="60" r="38" fill="#436ce3"/>' +
    '<circle cx="50" cy="48" r="8" fill="#8eb0ff" opacity="0.7"/>' +
    '<circle cx="72" cy="72" r="12" fill="#162b84" opacity="0.75"/>',

  merkurius:
    '<circle cx="60" cy="60" r="26" fill="#bbb5ad"/>' +
    '<circle cx="50" cy="52" r="5" fill="#6d707d" opacity="0.7"/>' +
    '<circle cx="68" cy="66" r="7" fill="#6d707d" opacity="0.6"/>' +
    '<circle cx="56" cy="70" r="3" fill="#6d707d" opacity="0.7"/>' +
    // small sun behind the planet to anchor "inner solar system"
    '<circle cx="100" cy="20" r="10" fill="#ffd166"/>',

  universum:
    '<circle cx="60" cy="60" r="52" fill="#1a0a34"/>' +
    '<ellipse cx="60" cy="60" rx="40" ry="16" fill="#6b2fb3" opacity="0.6" transform="rotate(-22 60 60)"/>' +
    '<ellipse cx="60" cy="60" rx="46" ry="12" fill="#a83d7a" opacity="0.55" transform="rotate(18 60 60)"/>' +
    '<circle cx="60" cy="60" r="8" fill="#ffd166"/>' +
    '<circle cx="32" cy="40" r="2" fill="#ffffff"/>' +
    '<circle cx="92" cy="52" r="2" fill="#65f7ff"/>' +
    '<circle cx="80" cy="92" r="2" fill="#ffffff"/>' +
    '<circle cx="36" cy="88" r="2" fill="#ffd166"/>',

  nebulosa:
    '<circle cx="60" cy="60" r="52" fill="#1a0a34"/>' +
    '<circle cx="48" cy="54" r="28" fill="#ff4eb8" opacity="0.55"/>' +
    '<circle cx="72" cy="64" r="24" fill="#65f7ff" opacity="0.45"/>' +
    '<circle cx="62" cy="76" r="18" fill="#ffd166" opacity="0.45"/>' +
    '<circle cx="60" cy="60" r="6" fill="#ffffff"/>' +
    '<circle cx="30" cy="36" r="2" fill="#ffffff"/>' +
    '<circle cx="90" cy="90" r="2" fill="#ffffff"/>',

  sputnik:
    '<circle cx="60" cy="60" r="18" fill="#d6d6e0" stroke="#ffffff" stroke-width="2"/>' +
    '<g stroke="#aeb9d8" stroke-width="3" stroke-linecap="round">' +
    '<line x1="60" y1="42" x2="60" y2="14"/>' +
    '<line x1="60" y1="78" x2="60" y2="106"/>' +
    '<line x1="42" y1="60" x2="14" y2="60"/>' +
    '<line x1="78" y1="60" x2="106" y2="60"/>' +
    '</g>' +
    '<circle cx="60" cy="14" r="3" fill="#ff6b6b"/>' +
    '<circle cx="14" cy="60" r="3" fill="#ff6b6b"/>',

  teleskop:
    '<rect x="16" y="34" width="80" height="22" rx="4" fill="#d6d6e0" transform="rotate(-22 56 45)"/>' +
    '<circle cx="24" cy="44" r="10" fill="#111a3d" stroke="#65f7ff" stroke-width="3"/>' +
    '<path d="M60 74l-18 30h36z" fill="#aeb9d8"/>' +
    '<rect x="50" y="96" width="24" height="6" rx="2" fill="#8a92ae"/>',

  radar:
    '<path d="M20 56 L70 26 A44 22 0 0 1 100 56 Z" fill="#d6d6e0" stroke="#65f7ff" stroke-width="3"/>' +
    '<circle cx="82" cy="42" r="5" fill="#65f7ff"/>' +
    '<rect x="56" y="54" width="6" height="30" fill="#8a92ae"/>' +
    '<rect x="42" y="82" width="34" height="8" rx="3" fill="#aeb9d8"/>',

  station:
    '<rect x="42" y="44" width="36" height="32" rx="6" fill="#d6d6e0" stroke="#65f7ff" stroke-width="3"/>' +
    '<rect x="4" y="52" width="34" height="16" fill="#2d6fd1"/>' +
    '<rect x="82" y="52" width="34" height="16" fill="#2d6fd1"/>' +
    '<g stroke="#65f7ff" stroke-width="1.5">' +
    '<line x1="4" y1="56" x2="38" y2="56"/><line x1="4" y1="60" x2="38" y2="60"/><line x1="4" y1="64" x2="38" y2="64"/>' +
    '<line x1="82" y1="56" x2="116" y2="56"/><line x1="82" y1="60" x2="116" y2="60"/><line x1="82" y1="64" x2="116" y2="64"/>' +
    '</g>' +
    '<rect x="56" y="32" width="8" height="14" fill="#aeb9d8"/>' +
    '<rect x="56" y="74" width="8" height="14" fill="#aeb9d8"/>',

  // ---- compound phrase icons ----------------------------------------
  'greeting-sun':
    ICON_RAYS +
    '<circle cx="60" cy="60" r="26" fill="#ffd166"/>' +
    '<path d="M46 56c2-4 4-4 6 0M74 56c-2-4-4-4-6 0" stroke="#0c1634" stroke-width="3" stroke-linecap="round" fill="none"/>' +
    '<path d="M48 72c4 6 20 6 24 0" stroke="#0c1634" stroke-width="3" stroke-linecap="round" fill="none"/>',

  'to-moon':
    // moon in top-right, small rocket heading up at angle
    '<path d="M94 20a28 28 0 1 0 0 48 22 22 0 0 1 0-48z" fill="#e8e8f2"/>' +
    '<g transform="translate(20 72) rotate(-45)">' +
      '<path d="M0 -18c6 6 8 14 8 22v16H-8V4c0-8 2-16 8-22z" fill="#dffcff" stroke="#65f7ff" stroke-width="2"/>' +
      '<circle cx="0" cy="-4" r="4" fill="#65f7ff"/>' +
      '<path d="M-8 14l-6 10h6z" fill="#55ffb2"/>' +
      '<path d="M8 14l6 10h-6z" fill="#55ffb2"/>' +
    '</g>' +
    '<g stroke="#ffd166" stroke-width="3" stroke-linecap="round" opacity="0.7">' +
    '<line x1="30" y1="96" x2="24" y2="104"/>' +
    '<line x1="40" y1="88" x2="34" y2="96"/>' +
    '</g>',

  'thumbs-up-helmet':
    '<circle cx="46" cy="52" r="28" fill="#eaf2ff" stroke="#aeb9d8" stroke-width="3"/>' +
    '<rect x="28" y="46" width="36" height="16" rx="3" fill="#111a3d"/>' +
    '<rect x="32" y="50" width="28" height="8" rx="2" fill="#65f7ff"/>' +
    // thumbs-up in bottom-right
    '<g transform="translate(86 78)">' +
      '<path d="M-8 10h16v16h-16z" fill="#ffd166"/>' +
      '<path d="M-8 10c0-10 6-18 10-18 4 0 4 6 2 10h6v8h-18z" fill="#ffd166"/>' +
    '</g>',

  'rocket-motion':
    '<g transform="rotate(-18 60 60)">' +
      '<path d="M60 18c8 8 12 20 12 32v26H48V50c0-12 4-24 12-32z" fill="#dffcff" stroke="#65f7ff" stroke-width="3"/>' +
      '<circle cx="60" cy="42" r="6" fill="#65f7ff"/>' +
      '<path d="M48 76l-8 16h10z" fill="#55ffb2"/>' +
      '<path d="M72 76l8 16h-10z" fill="#55ffb2"/>' +
    '</g>' +
    '<g stroke="#ffd166" stroke-width="4" stroke-linecap="round">' +
    '<line x1="18" y1="96" x2="8"  y2="106"/>' +
    '<line x1="34" y1="98" x2="22" y2="110"/>' +
    '<line x1="28" y1="84" x2="14" y2="98"/>' +
    '</g>',

  'earth-return':
    '<circle cx="72" cy="60" r="32" fill="#2695d4"/>' +
    '<path d="M46 56c8 0 12 4 18 2s12-6 22-2" fill="none" stroke="#4fc06e" stroke-width="6" stroke-linecap="round"/>' +
    '<circle cx="62" cy="50" r="5" fill="#4fc06e"/>' +
    '<circle cx="82" cy="72" r="4" fill="#4fc06e"/>' +
    // arrow pointing into earth
    '<path d="M12 60h26l-10-10m10 10l-10 10" fill="none" stroke="#ffd166" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>',

  'mission-star':
    '<polygon points="60 10 72 48 112 48 80 72 92 112 60 88 28 112 40 72 8 48 48 48" fill="#ffd166"/>' +
    '<rect x="55" y="40" width="10" height="30" rx="2" fill="#0c1634"/>' +
    '<circle cx="60" cy="78" r="4" fill="#0c1634"/>',

  'earth-landing':
    '<circle cx="58" cy="80" r="32" fill="#2695d4"/>' +
    '<path d="M32 78c8 0 12 4 18 2s12-6 22-2" fill="none" stroke="#4fc06e" stroke-width="6" stroke-linecap="round"/>' +
    '<circle cx="48" cy="72" r="5" fill="#4fc06e"/>' +
    '<circle cx="72" cy="88" r="4" fill="#4fc06e"/>' +
    // rocket descending from top
    '<g transform="translate(88 34)">' +
      '<path d="M0 -16c5 5 7 13 7 20v14H-7V4c0-7 2-15 7-20z" fill="#dffcff" stroke="#65f7ff" stroke-width="2"/>' +
      '<circle cx="0" cy="-2" r="4" fill="#65f7ff"/>' +
      '<path d="M-7 14l-4 8h4z" fill="#55ffb2"/>' +
      '<path d="M7 14l4 8h-4z" fill="#55ffb2"/>' +
    '</g>',

  'star-field':
    '<circle cx="20" cy="24" r="3" fill="#ffffff"/>' +
    '<circle cx="50" cy="16" r="2" fill="#65f7ff"/>' +
    '<circle cx="84" cy="28" r="3" fill="#ffd166"/>' +
    '<circle cx="32" cy="54" r="2" fill="#ffffff"/>' +
    '<circle cx="70" cy="62" r="3" fill="#ffffff"/>' +
    '<circle cx="24" cy="86" r="2" fill="#65f7ff"/>' +
    '<circle cx="60" cy="94" r="3" fill="#ffd166"/>' +
    '<circle cx="98" cy="72" r="2" fill="#ffffff"/>' +
    // arrow pointing forward
    '<path d="M40 60h40l-10-10m10 10l-10 10" fill="none" stroke="#65f7ff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>',

  'helmet-check':
    '<circle cx="50" cy="56" r="32" fill="#eaf2ff" stroke="#aeb9d8" stroke-width="3"/>' +
    '<rect x="28" y="48" width="44" height="20" rx="4" fill="#111a3d"/>' +
    '<rect x="32" y="52" width="36" height="12" rx="2" fill="#65f7ff"/>' +
    // check mark in bottom-right
    '<path d="M80 74l10 12 22-28" fill="none" stroke="#55ffb2" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>',

  'helmet-heart':
    '<circle cx="50" cy="56" r="32" fill="#eaf2ff" stroke="#aeb9d8" stroke-width="3"/>' +
    '<rect x="28" y="48" width="44" height="20" rx="4" fill="#111a3d"/>' +
    '<rect x="32" y="52" width="36" height="12" rx="2" fill="#65f7ff"/>' +
    // heart in bottom-right
    '<path d="M94 66c-6-10-22-6-10 10l10 14 10-14c12-16-4-20-10-10z" fill="#ff4fa3"/>',

  'galaxy-arrow':
    // galaxy moved to the left
    '<circle cx="36" cy="60" r="8" fill="#ffd166"/>' +
    '<path d="M36 60q22-18 36 4" fill="none" stroke="#65f7ff" stroke-width="4" stroke-linecap="round"/>' +
    '<path d="M36 60q-22 18-30-4" fill="none" stroke="#65f7ff" stroke-width="4" stroke-linecap="round"/>' +
    '<path d="M36 60q14 20-12 28" fill="none" stroke="#c58dff" stroke-width="3" stroke-linecap="round"/>' +
    // arrow on right
    '<path d="M78 60h28l-10-10m10 10l-10 10" fill="none" stroke="#ffd166" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>',
};

export function getIcon(key) {
  return ICONS[key] || null;
}
