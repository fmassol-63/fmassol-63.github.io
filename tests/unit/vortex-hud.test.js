import { describe, expect, it } from 'vitest';
import { createHud, transparentOf } from '../../src/lib/vortex-hud.js';

/** Faux contexte 2D qui enregistre les arcs dessinés. */
function fakeContext() {
  const arcs = [];
  const gradient = { addColorStop() {} };
  const ctx = new Proxy(
    { arcs },
    {
      get(target, prop) {
        if (prop in target) return target[prop];
        if (prop === 'arc') return (...args) => arcs.push(args);
        if (prop === 'createRadialGradient') return () => gradient;
        return () => {};
      },
      set(target, prop, value) {
        target[prop] = value;
        return true;
      },
    },
  );
  return ctx;
}

const frame = (rotation) => ({
  rotation,
  centerX: 400,
  centerY: 300,
  scale: 280,
  width: 800,
  height: 600,
  colors: { primary: '#00e5ff', secondary: '#8b6cff' },
});

describe('transparentOf', () => {
  it('donne la même couleur avec une opacité nulle', () => {
    expect(transparentOf('#00e5ff')).toBe('rgb(0 229 255 / 0)');
    expect(transparentOf('#0af')).toBe('rgb(0 170 255 / 0)');
  });

  it('se replie sur « transparent » pour une valeur inconnue', () => {
    expect(transparentOf('cyan')).toBe('transparent');
  });
});

describe('createHud', () => {
  it('dessine le même HUD pour une même rotation (aucune animation propre)', () => {
    const a = fakeContext();
    const b = fakeContext();
    createHud().draw(a, frame(1));
    createHud().draw(b, frame(1));
    expect(a.arcs.length).toBeGreaterThan(0);
    expect(a.arcs).toEqual(b.arcs);
  });

  it('fait tourner les anneaux quand la rotation change', () => {
    const hud = createHud();
    const before = fakeContext();
    const after = fakeContext();
    hud.draw(before, frame(0));
    hud.draw(after, frame(0.5));
    expect(after.arcs).not.toEqual(before.arcs);
  });
});
