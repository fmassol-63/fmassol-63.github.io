// Fonctions pures du tourbillon : aucune dépendance au DOM, testables directement.

const SCROLL_TO_RADIANS = 0.0025;
const SETTLE_EPSILON = 0.0005;
const TWO_PI = Math.PI * 2;

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

/** Nombre de particules adapté à la largeur de l'écran. */
export function particleCountForWidth(width) {
  if (width < 768) return 350;
  if (width < 1280) return 700;
  return 1000;
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

/**
 * Particules réparties sur des bras en spirale.
 * `radius` est normalisé dans [0, 1] ; `angle` est l'angle de départ en radians.
 */
export function createParticles(count, { arms = 3, twist = 3.2, spread = 0.45, seed = 1 } = {}) {
  const rng = createRng(seed);
  const particles = [];

  for (let i = 0; i < count; i++) {
    // Racine carrée : densité plus uniforme vers l'extérieur.
    const radius = Math.sqrt(rng());
    const arm = i % arms;
    const jitter = (rng() - 0.5) * spread * (1.2 - radius);

    particles.push({
      radius,
      angle: (arm / arms) * TWO_PI + radius * twist + jitter,
      size: 0.6 + rng() * 1.6 * (1.1 - radius),
      alpha: Math.min(1, 0.25 + rng() * 0.55 + (1 - radius) * 0.3),
    });
  }
  return particles;
}

/**
 * Position à l'écran d'une particule pour une rotation donnée.
 * Le centre tourne plus vite que l'extérieur, ce qui donne l'effet de vortex.
 */
export function particlePosition(particle, rotation, centerX, centerY, scale) {
  const speed = 0.6 + (1 - particle.radius) * 0.9;
  const angle = particle.angle + rotation * speed;
  const distance = particle.radius * scale;
  return {
    x: centerX + Math.cos(angle) * distance,
    y: centerY + Math.sin(angle) * distance,
  };
}
