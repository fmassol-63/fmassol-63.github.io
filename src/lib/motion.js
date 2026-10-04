// Animations d'interface : apparition des cartes au scroll et compteurs des chiffres clés.
// Sans IntersectionObserver ou avec « réduire les animations », rien ne bouge et tout reste visible.

const COUNT_DURATION_MS = 1400;

export function easeOutCubic(t) {
  const clamped = Math.min(Math.max(t, 0), 1);
  return 1 - (1 - clamped) ** 3;
}

/** Valeur affichée par un compteur à un instant donné (progress dans [0, 1]). */
export function countAt(target, progress) {
  return Math.round(target * easeOutCubic(progress));
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
        entry.target.querySelectorAll('[data-count]').forEach(animateCount);
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  );

  targets.forEach((target) => observer.observe(target));
}
