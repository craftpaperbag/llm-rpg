import { getTheme, saveTheme } from './storage.js';

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'light' ? '#f0f0f0' : '#0a0a0a');
}

export function initTheme() {
  applyTheme(getTheme());
}

export function setTheme(theme) {
  saveTheme(theme);
  applyTheme(theme);
}

export function getCurrentTheme() {
  return getTheme();
}
