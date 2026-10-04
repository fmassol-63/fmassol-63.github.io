import { describe, expect, it } from 'vitest';
import cvFr from '../../src/data/cv.fr.json';
import cvEn from '../../src/data/cv.en.json';
import uiAll from '../../src/data/ui.json';
import { escapeHtml, renderFooter, renderPage } from '../../src/lib/render.js';

/**
 * Toutes les chaînes du JSON, avec leur chemin pour un message d'erreur lisible.
 * Les clés `icon` sont des noms techniques d'icônes, pas du contenu affiché.
 */
function collectStrings(value, path = 'cv') {
  if (typeof value === 'string') return [[path, value]];
  if (Array.isArray(value))
    return value.flatMap((item, i) => collectStrings(item, `${path}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value)
      .filter(([key]) => key !== 'icon')
      .flatMap(([key, item]) => collectStrings(item, `${path}.${key}`));
  }
  return [];
}

describe.each([
  ['fr', cvFr],
  ['en', cvEn],
])('complétude du CV (%s)', (lang, cv) => {
  const html = renderPage(cv, uiAll[lang]) + renderFooter(cv.identity, uiAll[lang], 2026);

  it('affiche chaque information du JSON', () => {
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
