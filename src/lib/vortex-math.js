// Fonctions pures du tourbillon : aucune dépendance au DOM, testables directement.

const SCROLL_TO_RADIANS = 0.0018;
const SETTLE_EPSILON = 0.0005;

/** Angle cible du tourbillon pour une position de scroll donnée. */
export function angleForScroll(scrollY) {
  return scrollY * SCROLL_TO_RADIANS;
}

/** Interpolation pour lisser la rotation entre deux frames. */
export function lerp(current, target, factor = 0.1) {
  return current + (target - current) * factor;
}

/** Vrai quand l'écart restant n'est plus perceptible : l'animation peut s'arrêter. */
export function isSettled(current, target, epsilon = SETTLE_EPSILON) {
  return Math.abs(target - current) < epsilon;
}

/** Générateur pseudo-aléatoire déterministe (mulberry32). */
export function createRng(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
