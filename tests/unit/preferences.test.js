import { describe, expect, it } from 'vitest';
import { getInitialTheme, nextTheme } from '../../src/lib/theme.js';
import { getInitialLang, nextLang } from '../../src/lib/i18n.js';
import { readStored, writeStored } from '../../src/lib/storage.js';

describe('getInitialTheme', () => {
  it('privilégie le choix enregistré', () => {
    expect(getInitialTheme({ stored: 'light', prefersDark: true })).toBe('light');
    expect(getInitialTheme({ stored: 'dark', prefersDark: false })).toBe('dark');
  });

  it('suit la préférence du système sinon', () => {
    expect(getInitialTheme({ stored: null, prefersDark: true })).toBe('dark');
    expect(getInitialTheme({ stored: null, prefersDark: false })).toBe('light');
  });

  it('ignore une valeur enregistrée invalide', () => {
    expect(getInitialTheme({ stored: 'violet', prefersDark: true })).toBe('dark');
  });

  it('alterne entre clair et sombre', () => {
    expect(nextTheme('dark')).toBe('light');
    expect(nextTheme('light')).toBe('dark');
  });
});

describe('getInitialLang', () => {
  it('privilégie le choix enregistré', () => {
    expect(getInitialLang({ stored: 'en', navigatorLanguage: 'fr-FR' })).toBe('en');
  });

  it('suit la langue du navigateur sinon', () => {
    expect(getInitialLang({ stored: null, navigatorLanguage: 'en-US' })).toBe('en');
    expect(getInitialLang({ stored: null, navigatorLanguage: 'fr-FR' })).toBe('fr');
  });

  it('se replie sur le français', () => {
    expect(getInitialLang({ stored: 'de', navigatorLanguage: 'de-DE' })).toBe('fr');
    expect(getInitialLang({ stored: null, navigatorLanguage: undefined })).toBe('fr');
  });

  it('alterne entre français et anglais', () => {
    expect(nextLang('fr')).toBe('en');
    expect(nextLang('en')).toBe('fr');
  });
});

describe('storage', () => {
  it('ne plante pas si le stockage est indisponible', () => {
    const broken = {
      getItem() {
        throw new Error('bloqué');
      },
      setItem() {
        throw new Error('bloqué');
      },
    };
    expect(readStored('theme', broken)).toBeNull();
    expect(() => writeStored('theme', 'dark', broken)).not.toThrow();
  });

  it('lit ce qui a été écrit', () => {
    const map = new Map();
    const memory = { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => map.set(k, v) };
    writeStored('lang', 'en', memory);
    expect(readStored('lang', memory)).toBe('en');
  });
});
