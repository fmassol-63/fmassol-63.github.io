import { describe, expect, it } from 'vitest';
import cvFr from '../../src/data/cv.fr.json';
import cvEn from '../../src/data/cv.en.json';
import ui from '../../src/data/ui.json';

/** Structure d'un JSON : clés, longueurs des tableaux et types, sans les textes. */
function shape(value) {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, shape(value[key])]),
    );
  }
  return typeof value;
}

/** Valeurs qui ne se traduisent pas : icônes, liens, chiffres. */
function invariants(value, key = '') {
  if (Array.isArray(value)) return value.flatMap((item) => invariants(item, key));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => invariants(v, k));
  }
  const fixedKeys = ['icon', 'url', 'photo', 'cv', 'email', 'phone', 'phoneHref', 'name'];
  return typeof value === 'number' || fixedKeys.includes(key) ? [`${key}=${value}`] : [];
}

describe('parité FR / EN', () => {
  it('le CV anglais a exactement la structure du CV français', () => {
    expect(shape(cvEn)).toEqual(shape(cvFr));
  });

  it('les icônes, liens, chiffres et coordonnées sont identiques', () => {
    expect(invariants(cvEn)).toEqual(invariants(cvFr));
  });

  it('les libellés d’interface existent dans les deux langues', () => {
    expect(shape(ui.en)).toEqual(shape(ui.fr));
  });
});
