import { describe, expect, it } from 'vitest';
import cv from '../../src/data/cv.fr.json';
import { ICON_NAMES, icon } from '../../src/lib/icons.js';

describe('icon', () => {
  it('produit un SVG décoratif masqué aux lecteurs d’écran', () => {
    const svg = icon('server', 18);
    expect(svg).toMatch(/^<svg[^>]*aria-hidden="true"/);
    expect(svg).toContain('width="18"');
  });

  it('renvoie une chaîne vide pour une icône inconnue', () => {
    expect(icon('inexistante')).toBe('');
    expect(icon(undefined)).toBe('');
  });

  it('connaît toutes les icônes référencées dans le CV', () => {
    const used = [...cv.skills, ...cv.strengths].map((item) => item.icon);
    expect(used.filter((name) => !ICON_NAMES.includes(name))).toEqual([]);
  });
});
