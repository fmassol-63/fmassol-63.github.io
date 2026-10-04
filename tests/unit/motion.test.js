import { describe, expect, it } from 'vitest';
import { countAt, easeOutCubic } from '../../src/lib/motion.js';
import { buildSteps } from '../../src/lib/terminal.js';

describe('easeOutCubic', () => {
  it('va de 0 à 1 et reste borné', () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(-1)).toBe(0);
    expect(easeOutCubic(2)).toBe(1);
  });

  it('démarre vite puis ralentit', () => {
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });
});

describe('countAt', () => {
  it('part de 0 et finit exactement sur la cible', () => {
    expect(countAt(500, 0)).toBe(0);
    expect(countAt(500, 1)).toBe(500);
    expect(countAt(500, 1.3)).toBe(500);
  });

  it('donne des entiers croissants', () => {
    const values = [0.1, 0.3, 0.6, 0.9].map((p) => countAt(1000, p));
    expect(values.every(Number.isInteger)).toBe(true);
    expect([...values].sort((a, b) => a - b)).toEqual(values);
  });
});

describe('buildSteps (terminal)', () => {
  const steps = buildSteps([{ command: 'ls' }, {}, {}]);

  it('tape la commande caractère par caractère', () => {
    expect(steps.filter((s) => s.index === 0).map((s) => s.text)).toEqual(['', 'l', 'ls']);
  });

  it('affiche ensuite chaque ligne de sortie', () => {
    expect(steps.slice(-2).map((s) => s.index)).toEqual([1, 2]);
  });
});
