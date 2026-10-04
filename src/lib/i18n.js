// Choix de la langue (FR / EN) : choix mémorisé, sinon langue du navigateur, sinon français.
import { readStored, writeStored } from './storage.js';

export const LANGS = ['fr', 'en'];

export function getInitialLang({ stored, navigatorLanguage }) {
  if (LANGS.includes(stored)) return stored;
  return navigatorLanguage?.toLowerCase().startsWith('en') ? 'en' : 'fr';
}

export function nextLang(lang) {
  return lang === 'fr' ? 'en' : 'fr';
}

export function detectLang() {
  return getInitialLang({ stored: readStored('lang'), navigatorLanguage: navigator.language });
}

export function persistLang(lang) {
  writeStored('lang', lang);
}
