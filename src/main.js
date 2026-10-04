import './styles/main.css';
import cvEn from './data/cv.en.json';
import cvFr from './data/cv.fr.json';
import uiAll from './data/ui.json';
import { detectLang, nextLang, persistLang } from './lib/i18n.js';
import { initMotion, revealAll } from './lib/motion.js';
import { renderFooter, renderHeader, renderPage } from './lib/render.js';
import { initTerminal } from './lib/terminal.js';
import { applyTheme, currentTheme, detectTheme, nextTheme } from './lib/theme.js';
import { initVortex } from './lib/vortex.js';

const CONTENT = { fr: cvFr, en: cvEn };

const header = document.getElementById('header');
const content = document.getElementById('content');
const footer = document.getElementById('footer');

let lang = detectLang();

function renderHeaderOnly() {
  header.innerHTML = renderHeader(CONTENT[lang].identity, uiAll[lang], {
    lang,
    theme: currentTheme(),
  });
}

function renderAll() {
  const cv = CONTENT[lang];
  const ui = uiAll[lang];
  document.documentElement.lang = lang;
  document.title = ui.pageTitle;
  document.querySelector('meta[name="description"]')?.setAttribute('content', ui.metaDescription);
  renderHeaderOnly();
  content.innerHTML = renderPage(cv, ui);
  footer.innerHTML = renderFooter(cv.identity, ui);
}

function setMenuOpen(open) {
  header.classList.toggle('is-open', open);
  header.querySelector('[data-action="menu"]')?.setAttribute('aria-expanded', String(open));
}

applyTheme(detectTheme());
renderAll();

const vortex = initVortex(document.getElementById('vortex'));
initTerminal();
initMotion();

header.addEventListener('click', (event) => {
  if (event.target.closest('.header__link')) {
    setMenuOpen(false);
    return;
  }

  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'theme') {
    applyTheme(nextTheme(currentTheme()), { persist: true });
    vortex.refreshColor();
    renderHeaderOnly();
    header.querySelector('[data-action="theme"]').focus();
  } else if (action === 'lang') {
    lang = nextLang(lang);
    persistLang(lang);
    renderAll();
    revealAll();
    header.querySelector('[data-action="lang"]').focus();
  } else if (action === 'menu') {
    setMenuOpen(!header.classList.contains('is-open'));
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && header.classList.contains('is-open')) {
    setMenuOpen(false);
    header.querySelector('[data-action="menu"]').focus();
  }
});
