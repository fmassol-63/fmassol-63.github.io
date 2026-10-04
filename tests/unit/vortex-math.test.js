import { describe, expect, it } from 'vitest';
import { angleForScroll, createRng, isSettled, lerp } from '../../src/lib/vortex-math.js';

describe('angleForScroll', () => {
  it('vaut 0 en haut de page', () => {
    expect(angleForScroll(0)).toBe(0);
  });

  it('augmente quand on descend et diminue quand on remonte', () => {
    expect(angleForScroll(800)).toBeGreaterThan(angleForScroll(400));
    expect(angleForScroll(200)).toBeLessThan(angleForScroll(400));
  });
});

describe('lerp et isSettled', () => {
  it('rapproche la valeur courante de la cible', () => {
    expect(lerp(0, 10, 0.1)).toBeCloseTo(1);
    expect(lerp(10, 0, 0.5)).toBeCloseTo(5);
  });

  it('converge vers la cible en un nombre fini d’itérations', () => {
    let current = 0;
    let frames = 0;
    while (!isSettled(current, 5) && frames < 1000) {
      current = lerp(current, 5);
      frames++;
    }
    expect(isSettled(current, 5)).toBe(true);
    expect(frames).toBeLessThan(200);
  });

  it('n’est pas au repos tant que l’écart est visible', () => {
    expect(isSettled(0, 0.1)).toBe(false);
    expect(isSettled(1, 1)).toBe(true);
  });
});

describe('createRng', () => {
  it('est reproductible avec une même graine', () => {
    const a = createRng(42);
    const b = createRng(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('produit des valeurs dans [0, 1[', () => {
    const rng = createRng(7);
    for (let i = 0; i < 100; i++) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
