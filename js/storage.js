const SAVE_KEY = 'llm-rpg-save';
const ENDINGS_KEY = 'llm-rpg-endings';

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
