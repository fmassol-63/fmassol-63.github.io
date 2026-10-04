// Mode clair / sombre : attribut data-theme sur <html>, choix mémorisé.
import { readStored, writeStored } from './storage.js';

const THEMES = ['dark', 'light'];

export function getInitialTheme({ stored, prefersDark }) {
  if (THEMES.includes(stored)) return stored;
  return prefersDark ? 'dark' : 'light';
}

export function nextTheme(theme) {
  return theme === 'dark' ? 'light' : 'dark';
}

export function currentTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export function detectTheme() {
  return getInitialTheme({
    stored: readStored('theme'),
    prefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
  });
}

export function applyTheme(theme, { persist = false } = {}) {
  document.documentElement.dataset.theme = theme;
  if (persist) writeStored('theme', theme);
}
