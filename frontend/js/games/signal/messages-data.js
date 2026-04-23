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
