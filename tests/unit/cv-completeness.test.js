import { describe, expect, it } from 'vitest';
import cv from '../../src/data/cv.fr.json';
import uiAll from '../../src/data/ui.json';
import { escapeHtml, renderFooter, renderPage } from '../../src/lib/render.js';

/** Toutes les chaînes du JSON, avec leur chemin pour un message d'erreur lisible. */
function collectStrings(value, path = 'cv') {
  if (typeof value === 'string') return [[path, value]];
  if (Array.isArray(value))
    return value.flatMap((item, i) => collectStrings(item, `${path}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) => collectStrings(item, `${path}.${key}`));
  }
  return [];
}

describe('complétude du CV', () => {
  const html = renderPage(cv, uiAll.fr) + renderFooter(cv.identity, uiAll.fr, 2026);

  it('affiche chaque information de cv.fr.json', () => {
    const missing = collectStrings(cv)
      .filter(([, text]) => !html.includes(escapeHtml(text)))
      .map(([path]) => path);
    expect(missing).toEqual([]);
  });

  it('contient toutes les sections du CV', () => {
    expect(cv.skills).toHaveLength(13);
    expect(cv.experience).toHaveLength(2);
    expect(cv.missions).toHaveLength(2);
    expect(cv.project.recommendations).toHaveLength(8);
    expect(cv.education).toHaveLength(5);
    expect(cv.interests).toHaveLength(4);
  });
});
