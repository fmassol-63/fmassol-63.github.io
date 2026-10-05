// Tourbillon HUD en Canvas 2D, fixé au centre de l'écran.
// Il ne bouge que lorsque la page défile : la boucle d'animation s'arrête dès
// que la rotation affichée a rejoint la rotation cible.
// Le dessin lui-même est dans vortex-hud.js.
import { angleForScroll, isSettled, lerp } from './vortex-math.js';
import { createHud } from './vortex-hud.js';

const MAX_DPR = 2;
const SMOOTHING = 0.12;

export function initVortex(canvas) {
  const ctx = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const renderer = createHud();
  let width = 0;
  let height = 0;
  const colors = { primary: '', secondary: '' };
  let rafId = null;
  let target = reducedMotion.matches ? 0 : angleForScroll(window.scrollY);
  let current = target;

  function readColors() {
    const css = getComputedStyle(canvas);
    colors.primary = css.getPropertyValue('--vortex-color').trim() || '#00e5ff';
    colors.secondary = css.getPropertyValue('--accent-violet').trim() || '#8b6cff';
  }

  /** Ajuste la résolution du canvas à sa taille affichée. Renvoie false si rien n'a changé. */
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    // Le canvas fait 100lvh : la barre d'adresse mobile qui se replie ne change pas sa taille.
    const nextWidth = canvas.clientWidth;
    const nextHeight = canvas.clientHeight;
    if (nextWidth === width && nextHeight === height && canvas.width === Math.round(width * dpr)) {
      return false;
    }
    width = nextWidth;
    height = nextHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return true;
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    renderer.draw(ctx, {
      rotation: current,
      centerX: width / 2,
      centerY: height / 2,
      scale: Math.max(Math.min(width, height) * 0.48, 170),
      width,
      height,
      colors,
    });
    ctx.globalAlpha = 1;
    canvas.dataset.angle = current.toFixed(4);
    // Partagé avec le CSS : les anneaux autour de la photo tournent au même rythme.
    document.documentElement.style.setProperty('--vortex-angle', current.toFixed(4));
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
    if (resize()) draw();
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

  readColors();
  resize();
  draw();
  setAnimating(false);

  return {
    /** À appeler après un changement de thème pour reprendre la couleur. */
    refreshColor() {
      readColors();
      draw();
    },
  };
}
