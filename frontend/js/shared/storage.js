// Typed localStorage helpers that never throw. Every read and write is
// wrapped in try/catch because localStorage can fail in several ways:
// Safari Private Mode (quota 0 on write), Firefox with dom.storage
// disabled, browsers blocking third-party storage, or the user
// clearing site data mid-session. None of those should break the page.

function safeStorage() {
  try {
    return window.localStorage;
  } catch (_) {
    return null;
  }
}

export function getString(key, fallback = null) {
  const ls = safeStorage();
  if (!ls) return fallback;
  try {
    const v = ls.getItem(key);
    return v == null ? fallback : v;
  } catch (_) {
    return fallback;
  }
}

export function setString(key, value) {
  const ls = safeStorage();
  if (!ls) return false;
  try {
    ls.setItem(key, value);
    return true;
  } catch (_) {
    return false;
  }
}

export function getJson(key, fallback = null) {
  const ls = safeStorage();
  if (!ls) return fallback;
  try {
    const raw = ls.getItem(key);
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed == null ? fallback : parsed;
  } catch (_) {
    return fallback;
  }
}

export function setJson(key, value) {
  const ls = safeStorage();
  if (!ls) return false;
  try {
    ls.setItem(key, JSON.stringify(value));
    return true;
  } catch (_) {
    return false;
  }
}
