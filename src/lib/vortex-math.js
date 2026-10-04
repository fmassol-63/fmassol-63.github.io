// Fonctions pures du tourbillon : aucune dépendance au DOM, testables directement.

const SCROLL_TO_RADIANS = 0.0018;
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
  if (width < 768) return 700;
  if (width < 1280) return 1200;
  return 1700;
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
 * Particules réparties sur des bras en spirale, plus un halo diffus.
 * `radius` est normalisé dans [0, 1] ; `angle` est l'angle de départ en radians.
 */
export function createParticles(
  count,
  { arms = 3, twist = 4, spread = 1.1, haloRatio = 0.22, seed = 1 } = {},
) {
  const rng = createRng(seed);
  const gaussian = () => (rng() + rng() + rng() - 1.5) / 1.5;
  const particles = [];

  for (let i = 0; i < count; i++) {
    // Racine carrée : densité plus uniforme vers l'extérieur.
    const radius = Math.sqrt(rng());
    const isHalo = rng() < haloRatio;
    // Bras enroulés dans le sens inverse de la rotation : le centre, plus rapide, resserre la spirale.
    const angle = isHalo
      ? rng() * TWO_PI
      : ((i % arms) / arms) * TWO_PI - radius * twist + gaussian() * spread * (1.15 - radius);

    particles.push({
      radius,
      angle,
      size: 0.7 + rng() * 1.8 * (1.15 - radius),
      alpha: isHalo ? 0.1 + rng() * 0.25 : Math.min(1, 0.3 + rng() * 0.5 + (1 - radius) * 0.3),
    });
  }
  return particles;
}

/**
 * Position à l'écran d'une particule pour une rotation donnée.
 * Le centre tourne un peu plus vite que l'extérieur, ce qui donne l'effet de vortex
 * sans déformer la spirale au fil du scroll.
 */
export function particlePosition(particle, rotation, centerX, centerY, scale) {
  const speed = 1 + (1 - particle.radius) * 0.25;
  const angle = particle.angle + rotation * speed;
  const distance = particle.radius * scale;
  return {
    x: centerX + Math.cos(angle) * distance,
    y: centerY + Math.sin(angle) * distance,
  };
}
