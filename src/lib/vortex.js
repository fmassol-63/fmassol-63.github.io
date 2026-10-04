// Tourbillon de particules en Canvas 2D, fixé au centre de l'écran.
// Il ne bouge que lorsque la page défile : la boucle d'animation s'arrête dès
// que la rotation affichée a rejoint la rotation cible.
import {
  angleForScroll,
  createParticles,
  isSettled,
  lerp,
  particleCountForWidth,
  particlePosition,
} from './vortex-math.js';

const MAX_DPR = 2;
const SMOOTHING = 0.12;

export function initVortex(canvas) {
  const ctx = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let width = 0;
  let height = 0;
  let particles = [];
  let color = '';
  let rafId = null;
  let target = reducedMotion.matches ? 0 : angleForScroll(window.scrollY);
  let current = target;

  function readColor() {
    color = getComputedStyle(canvas).getPropertyValue('--vortex-color').trim() || '#00e5ff';
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = particleCountForWidth(width);
    if (count !== particles.length) particles = createParticles(count, { seed: 2026 });
  }

  function draw() {
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.max(Math.min(width, height) * 0.48, 170);

    ctx.clearRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, scale * 0.45);
    glow.addColorStop(0, color);
    glow.addColorStop(1, 'transparent');
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = glow;
    ctx.fillRect(centerX - scale, centerY - scale, scale * 2, scale * 2);

    ctx.fillStyle = color;
    for (const particle of particles) {
      const { x, y } = particlePosition(particle, current, centerX, centerY, scale);
      ctx.globalAlpha = particle.alpha;
      ctx.fillRect(x, y, particle.size, particle.size);
    }
    ctx.globalAlpha = 1;

    canvas.dataset.angle = current.toFixed(4);
  }

  function setAnimating(animating) {
    canvas.dataset.animating = String(animating);
  }

  function frame() {
    current = lerp(current, target, SMOOTHING);
    const settled = isSettled(current, target);
    if (settled) current = target;
    draw();

    if (settled) {
      rafId = null;
      setAnimating(false);
    } else {
      rafId = requestAnimationFrame(frame);
    }
  }

  function start() {
    if (rafId !== null || document.hidden || isSettled(current, target)) return;
    setAnimating(true);
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    setAnimating(false);
  }

  function onScroll() {
    if (reducedMotion.matches) return;
    target = angleForScroll(window.scrollY);
    start();
  }

  function onResize() {
    resize();
    draw();
  }

  function onVisibilityChange() {
    if (document.hidden) stop();
    else start();
  }

  function onReducedMotionChange() {
    stop();
    target = reducedMotion.matches ? 0 : angleForScroll(window.scrollY);
    current = target;
    draw();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', onVisibilityChange);
  reducedMotion.addEventListener('change', onReducedMotionChange);

  readColor();
  resize();
  draw();
  setAnimating(false);

  return {
    /** À appeler après un changement de thème pour reprendre la couleur. */
    refreshColor() {
      readColor();
      draw();
    },
    destroy() {
      stop();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      reducedMotion.removeEventListener('change', onReducedMotionChange);
    },
  };
}
