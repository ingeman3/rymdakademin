// Rank-tiered message pool + letter-panel configuration for
// Rymdsignalen. Each tier defines:
//   panelSize       — how many letter buttons the panel shows
//   alphabet        — the pool distractors are drawn from
//   messages        — an array of { text, gaps } objects where gaps
//                     is the 0-indexed positions that start hidden.
//                     Spaces in phrases are NEVER gaps.
//
// Design note: the letter panel is computed at session start from the
// union of the 7 messages' letters + random distractors to reach
// panelSize. The panel is stable across the whole session so the
// child learns the layout. Messages are chosen to have enough overlap
// that the union + distractors fits within panelSize.

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
// 3-5 characters, 1 gap per message. Panel-size 8 is tight, so
// messages were chosen from a small letter set (A, I, L, M, N, O, S,
// Å) that makes multiple familiar Swedish words.
const kadettMessages = [
  { text: 'SOL',   gaps: [1] },  // S_L
  { text: 'MÅN',   gaps: [1] },  // M_N
  { text: 'NÅL',   gaps: [1] },  // N_L
  { text: 'MÅS',   gaps: [1] },  // M_S (seagull)
  { text: 'MIN',   gaps: [1] },  // M_N (mine)
  { text: 'MAN',   gaps: [1] },  // M_N
  { text: 'SAL',   gaps: [1] },  // S_L (hall)
  { text: 'LAM',   gaps: [1] },  // L_M
  { text: 'NASA',  gaps: [1] },  // N_SA
  { text: 'ÅSNA',  gaps: [0] },  // _SNA (donkey)
  { text: 'MOLN',  gaps: [2] },  // MO_N (cloud)
  { text: 'SIMON', gaps: [2] },  // SI_ON
  { text: 'LÅSA',  gaps: [2] },  // LÅ_A
  { text: 'ANIS',  gaps: [2] },  // AN_S
  { text: 'LISA',  gaps: [2] },  // LI_A
];

// ---- pilot --------------------------------------------------------
// 4-6 chars, 1-2 gaps. 12 letters in panel.
const pilotMessages = [
  { text: 'JORDEN', gaps: [1, 4] },    // J_RD_N
  { text: 'MODER',  gaps: [2] },       // MO_ER
  { text: 'DATOR',  gaps: [3] },       // DAT_R (computer)
  { text: 'MODEM',  gaps: [2] },       // MO_EM
  { text: 'TANTE',  gaps: [2] },       // TA_TE
  { text: 'NORDEN', gaps: [1, 4] },    // N_RD_N
  { text: 'RODER',  gaps: [3] },       // ROD_R (rudder)
  { text: 'STEN',   gaps: [1] },       // S_EN
  { text: 'MORA',   gaps: [2] },       // MO_A
  { text: 'LISA',   gaps: [2] },       // LI_A
  { text: 'SIRIN',  gaps: [2] },       // SI_IN
  { text: 'ASTRO',  gaps: [0, 3] },    // _STR_
  { text: 'JORD',   gaps: [2] },       // JO_D
  { text: 'TOR',    gaps: [1] },       // T_R (Norse god)
  { text: 'DROMEDAR', gaps: [3, 6] }, // DRO_ED_R — actually 8 chars, borderline pilot
];

// ---- kapten -------------------------------------------------------
// 5-8 chars, 2-3 gaps. 16 letters in panel.
const kaptenMessages = [
  { text: 'JUPITER',  gaps: [1, 4] },       // J_PI_ER
  { text: 'KOMETEN',  gaps: [1, 5] },       // K_MET_N
  { text: 'PLANETER', gaps: [1, 6] },       // P_ANETE_
  { text: 'SATURNUS', gaps: [1, 4, 7] },    // S_TUR_U_
  { text: 'NEPTUNUS', gaps: [2, 5] },       // NE_TU_US
  { text: 'URANUS',   gaps: [0, 3] },       // _RA_US
  { text: 'STJÄRNA',  gaps: [2, 5] },       // ST_ÄR_A
  { text: 'STJÄRNOR', gaps: [2, 5] },       // ST_ÄR_OR
  { text: 'RAKETEN',  gaps: [1, 4] },       // R_KE_EN
  { text: 'VÄLKOMMEN', gaps: [1, 4, 7] },   // V_LK_MM_N
  { text: 'HIMLEN',   gaps: [1, 4] },       // H_ML_N
  { text: 'MORGON',   gaps: [1, 4] },       // M_RG_N
  { text: 'HEMMA',    gaps: [1, 3] },       // H_M_A
  { text: 'KVÄLL',    gaps: [1, 3] },       // K_Ä_L
  { text: 'GALAX',    gaps: [1, 3] },       // G_L_X — lower-freq
];

// ---- rymdforskare -------------------------------------------------
// Short phrases, 2-3 gaps. Full alphabet available.
const rymdforskareMessages = [
  { text: 'HEJ JORDEN',      gaps: [0, 4] },      // _EJ _ORDEN
  { text: 'KOMMA HEM',       gaps: [2, 6] },      // KO_MA _EM
  { text: 'BRA JOBBAT',      gaps: [1, 4, 8] },   // B_A _OBBA_
  { text: 'RYMDEN ÄR HEM',   gaps: [0, 7, 10] },  // _YMDEN _R _EM
  { text: 'MÅNEN LYSER',     gaps: [0, 6] },      // _ÅNEN _YSER
  { text: 'SOLEN VÄRMER',    gaps: [0, 6] },      // _OLEN _ÄRMER
  { text: 'JORDEN RUNT',     gaps: [0, 7] },      // _ORDEN _UNT
  { text: 'KALLT PÅ MARS',   gaps: [0, 6, 9] },   // _ALLT _Å _ARS
  { text: 'RAKET I RYMD',    gaps: [0, 8] },      // _AKET I _YMD
  { text: 'PILOT I RYMDEN',  gaps: [0, 8] },      // _ILOT I _YMDEN
  { text: 'STJÄRNA LYSER',   gaps: [0, 8] },      // _TJÄRNA _YSER
  { text: 'KOMETEN FLYR',    gaps: [0, 8] },      // _OMETEN _LYR
  { text: 'PLANET JORDEN',   gaps: [0, 7] },      // _LANET _ORDEN
];

// ---- amiral -------------------------------------------------------
// Longer phrases, 3-5 gaps. Full alphabet.
const amiralMessages = [
  { text: 'VÄLKOMMEN HEM PILOT',  gaps: [0, 3, 10, 14] },  // _ÄL_OMMEN _EM _ILOT
  { text: 'STJÄRNORNA VÄNTAR',    gaps: [0, 3, 11, 14] },  // _TJ_RNORNA _ÄN_AR
  { text: 'SOLEN ÄR EN STJÄRNA',  gaps: [0, 6, 9, 12, 15] }, // _OLEN _R _N _TJ_RNA
  { text: 'MÅNEN SNURRAR RUNT',   gaps: [0, 6, 13, 16] },  // _ÅNEN _NURRAR _UN_
  { text: 'PLANETER I OMLOPP',    gaps: [0, 5, 11, 14] },  // _LANE_ER I _ML_PP
  { text: 'JUPITER HAR MÅNAR',    gaps: [0, 8, 12, 15] },  // _UPITER _AR _ÅN_R
  { text: 'RAKETEN FLYGER HEM',   gaps: [0, 8, 14, 16] },  // _AKETEN _LYGER _E_
  { text: 'SATURNUS HAR RINGAR',  gaps: [0, 5, 9, 13, 16] }, // _ATUR_US _AR _IN_A_
  { text: 'MERKURIUS ÄR VARM',    gaps: [0, 4, 10, 14] },  // _ERK_RIUS _R _AR_
  { text: 'BRA JOBBAT PILOT',     gaps: [0, 4, 11, 14] },  // _RA _OBBAT _IL_T
  { text: 'SKEPPET ÄR SNABBT',    gaps: [0, 4, 8, 12, 15] }, // _KEP_ET _R _NAB_T
  { text: 'ASTRONAUTER LANDAR',   gaps: [0, 5, 12, 15, 17] }, // _STRO_AUTER _AN_A_
];

export const TIERS = {
  kadett: {
    panelSize: 8,
    alphabet: ALPHABET_COMMON,
    messages: kadettMessages,
  },
  pilot: {
    panelSize: 12,
    alphabet: ALPHABET_COMMON,
    messages: pilotMessages,
  },
  kapten: {
    panelSize: 16,
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
