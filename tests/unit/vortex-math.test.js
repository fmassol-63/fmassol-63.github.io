import { describe, expect, it } from 'vitest';
import {
  angleForScroll,
  createParticles,
  createRng,
  isSettled,
  lerp,
  particleCountForWidth,
  particlePosition,
} from '../../src/lib/vortex-math.js';

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

describe('particleCountForWidth', () => {
  it('utilise moins de particules sur mobile que sur desktop', () => {
    expect(particleCountForWidth(375)).toBeLessThan(particleCountForWidth(1440));
  });

  it('reste dans des bornes raisonnables', () => {
    for (const width of [320, 768, 1280, 2560]) {
      const count = particleCountForWidth(width);
      expect(count).toBeGreaterThanOrEqual(200);
      expect(count).toBeLessThanOrEqual(1200);
    }
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

describe('createParticles', () => {
  it('crée le nombre demandé de particules, de façon reproductible', () => {
    const first = createParticles(300, { seed: 1 });
    expect(first).toHaveLength(300);
    expect(createParticles(300, { seed: 1 })).toEqual(first);
  });

  it('place les particules dans le disque unité avec taille et opacité valides', () => {
    for (const p of createParticles(500, { seed: 3 })) {
      expect(p.radius).toBeGreaterThanOrEqual(0);
      expect(p.radius).toBeLessThanOrEqual(1);
      expect(p.size).toBeGreaterThan(0);
      expect(p.alpha).toBeGreaterThan(0);
      expect(p.alpha).toBeLessThanOrEqual(1);
    }
  });
});

describe('particlePosition', () => {
  const particle = { radius: 0.5, angle: 0, size: 1, alpha: 1 };

  it('donne la position polaire sans rotation', () => {
    const { x, y } = particlePosition(particle, 0, 100, 100, 200);
    expect(x).toBeCloseTo(200);
    expect(y).toBeCloseTo(100);
  });

  it('déplace la particule quand la rotation change', () => {
    const before = particlePosition(particle, 0, 0, 0, 100);
    const after = particlePosition(particle, 1, 0, 0, 100);
    expect(after).not.toEqual(before);
    expect(Math.hypot(after.x, after.y)).toBeCloseTo(Math.hypot(before.x, before.y));
  });

  it('fait tourner le centre plus vite que l’extérieur (effet vortex)', () => {
    const inner = { ...particle, radius: 0.1 };
    const outer = { ...particle, radius: 0.9 };
    const angleOf = (p) => {
      const { x, y } = particlePosition(p, 1, 0, 0, 100);
      return Math.atan2(y, x);
    };
    expect(angleOf(inner)).toBeGreaterThan(angleOf(outer));
  });
});
