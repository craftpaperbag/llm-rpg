const SAVE_KEY = 'llm-rpg-save';
const ENDINGS_KEY = 'llm-rpg-endings';
const THEME_KEY = 'llm-rpg-theme';

export function saveGame(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (_) {}
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}

export function hasSave() {
  return !!localStorage.getItem(SAVE_KEY);
}

export function getUnlockedEndings() {
  try {
    const raw = localStorage.getItem(ENDINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) { return []; }
}

export function unlockEnding(id) {
  const list = getUnlockedEndings();
  if (!list.includes(id)) {
    list.push(id);
    try { localStorage.setItem(ENDINGS_KEY, JSON.stringify(list)); } catch (_) {}
  }
}

export function getTheme() {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === 'light' ? 'light' : 'dark';
  } catch (_) { return 'dark'; }
}

export function saveTheme(theme) {
  try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
}
