// Single source of truth for progression state. All game and start-page
// code goes through the functions exported here — no direct
// localStorage access for anything related to pilots/stars/rank.
//
// Primary persistence: localStorage via ./storage.js helpers (safe,
// never throw). Server backup: PUT /api/progress, fire-and-forget on
// mutations and explicit syncFromServer() on app init.
//
// If localStorage is unavailable (Safari Private Mode, locked iframes,
// quota errors) the module falls back to an in-memory snapshot that
// lives for the session only — mutations still resolve, they just do
// not survive a reload.

import { getString, setString, getJson, setJson } from './storage.js';

export const STORAGE_KEY = 'rymdakademin.progress.v1';
export const SCHEMA_VERSION = 1;

// Phase 4 storage keys. Read once on first phase-5 load to rescue the
// pilot roster + selection, then deleted. Never written from phase 5.
const LEGACY_PILOTS_KEY = 'rymdakademin.pilots.v1';
const LEGACY_SELECTED_KEY = 'rymdakademin.selectedPilot.v1';

const DEFAULT_PILOTS = [
  { id: 'harry',   name: 'Harry',   color: '#d85a30', icon: 'rocket' },
  { id: 'ted',     name: 'Ted',     color: '#378add', icon: 'bolt' },
  { id: 'noah',    name: 'Noah',    color: '#7f77dd', icon: 'smile' },
  { id: 'theodor', name: 'Theodor', color: '#1d9e75', icon: 'user' },
  { id: 'nova',    name: 'Nova',    color: '#d4537e', icon: 'star' },
];

// Pure rank lookup. Exported separately so it is independently
// testable and reusable by UI layers that need the label without
// loading the whole snapshot.
export function getRank(totalStars) {
  const n = Number.isFinite(totalStars) ? totalStars : 0;
  if (n >= 80) return 'amiral';
  if (n >= 60) return 'rymdforskare';
  if (n >= 40) return 'kapten';
  if (n >= 20) return 'pilot';
  return 'kadett';
}

function emptySnapshot() {
  return {
    schemaVersion: SCHEMA_VERSION,
    selectedPilot: null,
    pilots: {},
  };
}

function freshPilot({ id, name, color, icon }) {
  const now = new Date().toISOString();
  return {
    id,
    name,
    color,
    icon,
    totalStars: 0,
    rank: 'kadett',
    createdAt: now,
    lastPlayedAt: now,
    games: {},
  };
}

function seedDefaults(snapshot) {
  DEFAULT_PILOTS.forEach((p) => {
    if (!snapshot.pilots[p.id]) {
      snapshot.pilots[p.id] = freshPilot(p);
    }
  });
  if (!snapshot.selectedPilot) {
    snapshot.selectedPilot = 'ted';
  }
}

// Session-only in-memory fallback used when localStorage throws.
let memorySnapshot = null;

function loadFromStorage() {
  const stored = getJson(STORAGE_KEY, null);
  if (stored && typeof stored === 'object' && !Array.isArray(stored)
      && typeof stored.schemaVersion === 'number'
      && stored.pilots && typeof stored.pilots === 'object') {
    return stored;
  }
  return null;
}

// One-time migration from phase 4. If the v1 progress key is absent
// but the phase 4 pilots/selectedPilot keys exist, convert them into a
// fresh snapshot (stars zero, rank kadett, timestamps = now) and
// delete the old keys. Runs at most once per browser: as soon as the
// new key is written, subsequent loads hit loadFromStorage() first.
function migrateFromPhase4() {
  const legacyPilots = getJson(LEGACY_PILOTS_KEY, null);
  const legacySelected = getString(LEGACY_SELECTED_KEY, null);
  if (!Array.isArray(legacyPilots) || legacyPilots.length === 0) return null;

  const snap = emptySnapshot();
  for (const entry of legacyPilots) {
    if (!entry || typeof entry.id !== 'string' || typeof entry.name !== 'string') continue;
    snap.pilots[entry.id] = freshPilot({
      id: entry.id,
      name: entry.name,
      color: entry.color || '#378add',
      icon: entry.icon || 'star',
    });
  }
  if (legacySelected && snap.pilots[legacySelected]) {
    snap.selectedPilot = legacySelected;
  } else {
    snap.selectedPilot = Object.keys(snap.pilots)[0] || null;
  }

  // Wipe the legacy keys so we never read them again. If writes fail
  // (quota) that's fine — next boot will re-migrate into the same
  // shape and the resulting snapshot is idempotent.
  try {
    window.localStorage.removeItem(LEGACY_PILOTS_KEY);
    window.localStorage.removeItem(LEGACY_SELECTED_KEY);
  } catch (_) { /* ignore */ }
  return snap;
}

function persist(snapshot) {
  const ok = setJson(STORAGE_KEY, snapshot);
  if (!ok) {
    memorySnapshot = snapshot;
  }
}

export function getSnapshot() {
  if (memorySnapshot) return memorySnapshot;
  const loaded = loadFromStorage();
  if (loaded) return loaded;
  const migrated = migrateFromPhase4();
  if (migrated) {
    persist(migrated);
    return migrated;
  }
  const fresh = emptySnapshot();
  seedDefaults(fresh);
  persist(fresh);
  return fresh;
}

export function getAllPilots() {
  const snap = getSnapshot();
  return Object.values(snap.pilots);
}

export function getPilot(id) {
  if (typeof id !== 'string') return null;
  const snap = getSnapshot();
  return snap.pilots[id] || null;
}

export function getSelectedPilotId() {
  return getSnapshot().selectedPilot;
}

export function getSelectedPilot() {
  const id = getSelectedPilotId();
  return id ? getPilot(id) : null;
}

export function setSelectedPilot(id) {
  const snap = getSnapshot();
  if (id !== null && !snap.pilots[id]) return false;
  snap.selectedPilot = id;
  persist(snap);
  fireChange();
  return true;
}

export function createPilot({ id, name, color, icon }) {
  if (typeof id !== 'string' || !id) return null;
  if (typeof name !== 'string' || !name) return null;
  const snap = getSnapshot();
  if (snap.pilots[id]) return snap.pilots[id];
  const pilot = freshPilot({ id, name, color, icon });
  snap.pilots[id] = pilot;
  snap.selectedPilot = id;
  persist(snap);
  fireChange();
  return pilot;
}

export function addStars(pilotId, gameId, stars) {
  const snap = getSnapshot();
  const pilot = snap.pilots[pilotId];
  if (!pilot) return { newTotal: 0, newRank: 'kadett', rankChanged: false };
  const inc = Math.max(0, Math.floor(Number(stars) || 0));
  const prevRank = pilot.rank;
  pilot.totalStars = (pilot.totalStars || 0) + inc;
  pilot.rank = getRank(pilot.totalStars);
  pilot.lastPlayedAt = new Date().toISOString();
  const game = pilot.games[gameId] || { starsEarned: 0, playCount: 0 };
  game.starsEarned = (game.starsEarned || 0) + inc;
  game.playCount = (game.playCount || 0) + 1;
  game.completedAt = pilot.lastPlayedAt;
  pilot.games[gameId] = game;
  persist(snap);
  fireChange();
  return {
    newTotal: pilot.totalStars,
    newRank: pilot.rank,
    rankChanged: pilot.rank !== prevRank,
  };
}

export function setGameProgress(pilotId, gameId, data) {
  const snap = getSnapshot();
  const pilot = snap.pilots[pilotId];
  if (!pilot || !data || typeof data !== 'object') return false;
  pilot.games[gameId] = { ...(pilot.games[gameId] || {}), ...data };
  pilot.lastPlayedAt = new Date().toISOString();
  persist(snap);
  fireChange();
  return true;
}

// ---- Change notifications ------------------------------------------------
const listeners = new Set();

export function onChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function fireChange() {
  listeners.forEach((l) => {
    try { l(); } catch (_) { /* listener failures must not corrupt state */ }
  });
}

// ---- Server sync ---------------------------------------------------------
export async function syncFromServer() {
  try {
    const res = await fetch('/api/progress', { credentials: 'include' });
    if (res.status === 404) return { synced: false, reason: 'no-server-data' };
    if (!res.ok) return { synced: false, reason: 'error' };
    const { snapshot: remote, updatedAt } = await res.json();
    if (!remote || typeof remote !== 'object') return { synced: false, reason: 'error' };
    const local = getSnapshot();
    const localTime = newestPilotTimestamp(local);
    const remoteTime = new Date(updatedAt).getTime();
    if (Number.isFinite(remoteTime) && remoteTime > localTime) {
      persist(remote);
      fireChange();
      return { synced: true, reason: 'server-newer' };
    }
    if (localTime > remoteTime) return { synced: false, reason: 'local-newer' };
    return { synced: false, reason: 'equal' };
  } catch (_) {
    return { synced: false, reason: 'error' };
  }
}

export async function syncToServer() {
  try {
    const res = await fetch('/api/progress', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snapshot: getSnapshot() }),
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

function newestPilotTimestamp(snap) {
  let max = 0;
  for (const p of Object.values(snap.pilots || {})) {
    const t = Date.parse(p.lastPlayedAt || p.createdAt || 0);
    if (Number.isFinite(t) && t > max) max = t;
  }
  return max;
}
