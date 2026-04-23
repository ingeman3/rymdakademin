import { getString, setString, getJson, setJson } from '../shared/storage.js';
import {
  DEFAULT_PILOTS,
  NEW_PILOT_COLORS,
  ICONS,
  STORAGE_KEYS,
} from './pilots-data.js';

const MISSIONS = [
  { id: 'solar',   name: 'Solsystemsresan', status: 'active', icon: 'globe', bgColor: 'bg-blue', href: '/solsystemsresan' },
  { id: 'minne',   name: 'Rymdminnet',      status: 'locked', icon: 'brain', bgColor: 'bg-gray' },
  { id: 'bokstav', name: 'Bokstavsjakten',  status: 'locked', icon: 'abc',   bgColor: 'bg-gray' },
];

const WARP_STREAK_COUNT = 25;

const warpContainer = document.getElementById('warp-container');
const pilotsEl = document.getElementById('pilots');
const missionsEl = document.getElementById('missions');
const newPilotForm = document.getElementById('new-pilot-form');
const newPilotInput = document.getElementById('new-pilot-name');
const newPilotError = document.getElementById('new-pilot-error');
const btnCancel = document.getElementById('btn-cancel-pilot');
const btnSave = document.getElementById('btn-save-pilot');

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Spawn warp streaks — 25 evenly distributed rays jittered by up to
// 12 degrees, each with its own 2.5-4 s animation so the field feels
// alive rather than ticking. Skipped entirely under reduced-motion.
if (!prefersReduced) {
  for (let i = 0; i < WARP_STREAK_COUNT; i += 1) {
    const streak = document.createElement('div');
    streak.className = 'warp-streak';
    const angle = (i / WARP_STREAK_COUNT) * 360 + (Math.random() * 25 - 12);
    streak.style.setProperty('--angle', `${angle}deg`);
    streak.style.animationDelay = `${Math.random() * 3}s`;
    streak.style.animationDuration = `${2.5 + Math.random() * 1.5}s`;
    warpContainer.appendChild(streak);
  }
}

let pilots = loadPilots();
let selectedPilotId = loadSelected();

function loadPilots() {
  const stored = getJson(STORAGE_KEYS.pilots, null);
  if (Array.isArray(stored) && stored.length > 0) return stored;
  return DEFAULT_PILOTS.slice();
}

function loadSelected() {
  return getString(STORAGE_KEYS.selectedPilot, 'ted');
}

function persistPilots() {
  setJson(STORAGE_KEYS.pilots, pilots);
}

function persistSelected(id) {
  setString(STORAGE_KEYS.selectedPilot, id);
}

function validatePilotName(name) {
  const trimmed = name.trim();
  if (trimmed.length === 0) return 'Skriv ett namn.';
  if (trimmed.length > 12) return 'Högst 12 tecken.';
  if (!/^[a-zA-ZåäöÅÄÖ0-9 ]+$/.test(trimmed)) return 'Bara bokstäver och siffror.';
  return null;
}

// iconSvg builds an inline <svg> from the hardcoded ICONS map. ICONS is
// not user input, so using innerHTML here is safe — DO NOT extend this
// helper to accept caller-supplied markup.
function iconSvg(name, size = 36) {
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;
}

function renderPilots() {
  pilotsEl.innerHTML = '';

  pilots.forEach((p) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pilot' + (p.id === selectedPilotId ? ' selected' : '');
    btn.setAttribute('aria-label', `Välj pilot ${p.name}`);
    btn.setAttribute('aria-pressed', p.id === selectedPilotId ? 'true' : 'false');

    const avatar = document.createElement('div');
    avatar.className = 'pilot-avatar';
    avatar.style.background = p.color;
    avatar.innerHTML = iconSvg(p.icon, 36);

    const nameEl = document.createElement('span');
    nameEl.className = 'pilot-name';
    nameEl.textContent = p.name;

    btn.appendChild(avatar);
    btn.appendChild(nameEl);
    btn.addEventListener('click', () => {
      selectedPilotId = p.id;
      persistSelected(selectedPilotId);
      renderPilots();
    });
    pilotsEl.appendChild(btn);
  });

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'pilot pilot-new';
  addBtn.setAttribute('aria-label', 'Skapa ny pilot');

  const addAvatar = document.createElement('div');
  addAvatar.className = 'pilot-avatar';
  addAvatar.innerHTML = iconSvg('plus', 28);

  const addName = document.createElement('span');
  addName.className = 'pilot-name';
  addName.textContent = '+ Ny pilot';

  addBtn.appendChild(addAvatar);
  addBtn.appendChild(addName);
  addBtn.addEventListener('click', () => {
    newPilotForm.classList.add('open');
    newPilotInput.value = '';
    newPilotError.textContent = '';
    newPilotInput.focus();
  });
  pilotsEl.appendChild(addBtn);
}

function renderMissions() {
  missionsEl.innerHTML = '';

  MISSIONS.forEach((m) => {
    const card = document.createElement(m.status === 'active' ? 'button' : 'div');
    card.className = `mission-card ${m.status}`;
    if (m.status === 'active') {
      card.type = 'button';
    } else {
      card.setAttribute('aria-disabled', 'true');
    }
    card.setAttribute('aria-label', m.name + (m.status === 'locked' ? ' (låst, kommer snart)' : ''));

    const top = document.createElement('div');
    top.className = 'mission-top';

    const icon = document.createElement('div');
    icon.className = `mission-icon ${m.bgColor}`;
    icon.innerHTML = iconSvg(m.icon, 26);

    const action = document.createElement('div');
    if (m.status === 'active') {
      action.className = 'mission-play';
      action.innerHTML = iconSvg('play', 18);
    } else {
      action.className = 'mission-lock';
      action.innerHTML = iconSvg('lock', 28);
    }

    top.appendChild(icon);
    top.appendChild(action);

    const nameEl = document.createElement('h3');
    nameEl.className = 'mission-name';
    nameEl.textContent = m.name;

    card.appendChild(top);
    card.appendChild(nameEl);

    if (m.status === 'locked') {
      const status = document.createElement('div');
      status.className = 'mission-status';
      status.textContent = 'KOMMER SNART';
      card.appendChild(status);
    }

    if (m.status === 'active' && m.href) {
      card.addEventListener('click', () => {
        window.location.href = m.href;
      });
    }
    missionsEl.appendChild(card);
  });
}

function submitNewPilot() {
  const raw = newPilotInput.value;
  const error = validatePilotName(raw);
  if (error) {
    newPilotError.textContent = error;
    return;
  }
  const trimmed = raw.trim();
  const id = `custom_${Date.now()}`;
  const color = NEW_PILOT_COLORS[pilots.length % NEW_PILOT_COLORS.length];
  pilots.push({ id, name: trimmed, color, icon: 'star' });
  persistPilots();
  selectedPilotId = id;
  persistSelected(selectedPilotId);
  newPilotForm.classList.remove('open');
  renderPilots();
}

btnCancel.addEventListener('click', () => {
  newPilotForm.classList.remove('open');
});

btnSave.addEventListener('click', submitNewPilot);

newPilotInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    submitNewPilot();
  } else if (e.key === 'Escape') {
    newPilotForm.classList.remove('open');
  }
});

renderPilots();
renderMissions();
