// Animations d'interface : apparition des cartes au scroll et compteurs des chiffres clés.
// Sans IntersectionObserver ou avec « réduire les animations », rien ne bouge et tout reste visible.

const COUNT_DURATION_MS = 1400;
// Le compteur atteint sa valeur quand le haut de sa carte arrive à cette hauteur de l'écran.
const COUNT_END_RATIO = 0.55;

export function easeOutCubic(t) {
  const clamped = Math.min(Math.max(t, 0), 1);
  return 1 - (1 - clamped) ** 3;
}

/** Valeur affichée par un compteur à un instant donné (progress dans [0, 1]). */
export function countAt(target, progress) {
  return Math.round(target * easeOutCubic(progress));
}

/**
 * Avancement d'un compteur selon le scroll : 0 quand sa carte entre par le bas de l'écran,
 * 1 quand son haut atteint COUNT_END_RATIO de la hauteur de l'écran.
 */
export function scrollProgress(top, viewportHeight) {
  const distance = viewportHeight * (1 - COUNT_END_RATIO);
  return Math.min(Math.max((viewportHeight - top) / distance, 0), 1);
}

function animateCount(element) {
  const target = Number(element.dataset.count);
  if (!Number.isFinite(target)) return;
  const start = performance.now();

  function tick(now) {
    const progress = (now - start) / COUNT_DURATION_MS;
    element.textContent = String(countAt(target, progress));
    if (progress < 1) requestAnimationFrame(tick);
  }
  element.textContent = '0';
  requestAnimationFrame(tick);
}

/** Fait monter les compteurs au rythme du scroll ; ils ne redescendent jamais. */
function initScrollCounters(root) {
  let counters = [...root.querySelectorAll('[data-count]')]
    .map((element) => ({ element, target: Number(element.dataset.count), progress: 0 }))
    .filter((counter) => Number.isFinite(counter.target));
  if (!counters.length) return;

  // Déjà entièrement à l'écran au chargement : rien à faire défiler, on compte dans le temps.
  const viewportHeight = window.innerHeight;
  counters = counters.filter(({ element }) => {
    if (scrollProgress(element.getBoundingClientRect().top, viewportHeight) < 1) return true;
    animateCount(element);
    return false;
  });
  if (!counters.length) return;

  let scheduled = false;
  function update() {
    scheduled = false;
    const height = window.innerHeight;
    for (const counter of counters) {
      const progress = scrollProgress(counter.element.getBoundingClientRect().top, height);
      if (progress <= counter.progress) continue;
      counter.progress = progress;
      counter.element.textContent = String(countAt(counter.target, progress));
    }
    counters = counters.filter((counter) => counter.progress < 1);
    if (!counters.length) window.removeEventListener('scroll', schedule);
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  }

  counters.forEach(({ element }) => (element.textContent = '0'));
  window.addEventListener('scroll', schedule, { passive: true });
  update();
}

/** Affiche tout de suite les éléments (après un nouveau rendu, par exemple un changement de langue). */
export function revealAll(root = document) {
  root
    .querySelectorAll('.section, .stat')
    .forEach((element) => element.classList.add('is-visible'));
}

export function initMotion(root = document) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion || !('IntersectionObserver' in window)) return;

  const targets = root.querySelectorAll('.section, .stat');
  document.documentElement.classList.add('motion-ready');

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  );

  targets.forEach((target) => observer.observe(target));
  initScrollCounters(root);
}
