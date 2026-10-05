// Génère le HTML des sections à partir des données du CV.
// Fonctions pures : (données, libellés) → chaîne HTML, tout texte étant échappé.
import { icon } from './icons.js';

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(value) {
  if (value === undefined || value === null) return '';
  return String(value).replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

const e = escapeHtml;
const list = (items, render) => (items ?? []).map(render).join('');

function section(id, title, body, { modifier = '', iconName } = {}) {
  return `
    <section id="${id}" class="section ${modifier}" aria-labelledby="${id}-title">
      <div class="card">
        <h2 id="${id}-title" class="section__title">
          <span class="section__icon">${icon(iconName, 22)}</span>${e(title)}
        </h2>
        ${body}
      </div>
    </section>`;
}

function externalLink(url, label) {
  return `<a href="${e(url)}" target="_blank" rel="noopener noreferrer">${e(label)}</a>`;
}

function downloadButton(identity, ui, modifier = '') {
  return `<a class="button ${modifier}" href="${e(identity.cv)}" download>${icon('download')}${e(ui.downloadCv)}</a>`;
}

function recommendationButton(identity, ui) {
  if (!identity.recommendation) return '';
  return `<a class="button button--ghost" href="${e(identity.recommendation)}" download>${icon('download')}${e(ui.downloadRecommendation)}</a>`;
}

export function renderTerminal(terminal, ui) {
  if (!terminal?.length) return '';
  const lines = list(
    terminal,
    (entry) => `
      <p class="terminal__line terminal__line--command"><span class="terminal__prompt" aria-hidden="true">$ </span><span class="terminal__cmd">${e(entry.command)}</span></p>
      ${list(entry.output, (line) => `<p class="terminal__line">${e(line)}</p>`)}`,
  );
  // Curseur placé dans la dernière ligne : seul après elle, il occuperait une ligne
  // de plus, qui disparaîtrait au début de la frappe (décalage de mise en page).
  const cursor = '<span class="terminal__cursor" aria-hidden="true"></span>';
  const end = lines.lastIndexOf('</p>');
  return `
    <div class="terminal" data-terminal>
      <div class="terminal__bar" aria-hidden="true">
        <span class="terminal__dot"></span><span class="terminal__dot"></span><span class="terminal__dot"></span>
        <span class="terminal__name">${e(ui.terminalTitle)}</span>
      </div>
      <div class="terminal__body">${lines.slice(0, end)}${cursor}${lines.slice(end)}</div>
    </div>`;
}

export function renderHero(identity, terminal, ui) {
  const status = identity.status
    ? `<p class="hero__status"><span class="hero__status-dot" aria-hidden="true"></span>${e(identity.status)}</p>`
    : '';
  const tagline = identity.tagline ? `<p class="hero__tagline">${e(identity.tagline)}</p>` : '';
  return `
    <section id="accueil" class="hero" aria-labelledby="accueil-title">
      ${status}
      <img class="hero__photo" src="${e(identity.photo)}" alt="${e(identity.photoAlt)}"
        width="306" height="348" fetchpriority="high" />
      <h1 id="accueil-title" class="hero__name">${e(identity.name)}</h1>
      <p class="hero__title">${e(identity.title)}</p>
      ${tagline}
      <div class="hero__actions">
        ${downloadButton(identity, ui)}
        ${recommendationButton(identity, ui)}
        <a class="button button--ghost" href="#contact">${e(ui.contactMe)}</a>
      </div>
      ${renderTerminal(terminal, ui)}
    </section>`;
}

export function renderStats(stats, ui) {
  if (!stats?.length) return '';
  const items = list(
    stats,
    (stat) => `
      <li class="stat">
        <span class="stat__value">${
          stat.prefix ? `<span class="stat__prefix">${e(stat.prefix)}</span>` : ''
        }<span data-count="${e(stat.value)}">${e(stat.value)}</span>${
          stat.suffix ? `<span class="stat__suffix">${e(stat.suffix)}</span>` : ''
        }</span>
        <span class="stat__label">${e(stat.label)}</span>
      </li>`,
  );
  return `
    <section id="chiffres" class="stats" aria-label="${e(ui.statsLabel)}">
      <ul class="stats__list">${items}</ul>
    </section>`;
}

export function renderProfile(profile, ui) {
  return section(
    'profil',
    ui.sections.profile,
    `<p class="profile__text">${e(profile.text)}</p>
     <ul class="facts">${list(profile.facts, (fact) => `<li class="facts__item">${e(fact)}</li>`)}</ul>`,
    { modifier: 'is-left', iconName: 'user' },
  );
}

export function renderStrengths(strengths, ui) {
  if (!strengths?.length) return '';
  const items = list(
    strengths,
    (item) => `
      <li class="strength">
        <span class="strength__icon">${icon(item.icon, 26)}</span>
        <h3 class="strength__title">${e(item.title)}</h3>
        <p class="strength__text">${e(item.text)}</p>
      </li>`,
  );
  return section('atouts', ui.sections.strengths, `<ul class="strengths">${items}</ul>`, {
    modifier: 'section--wide',
    iconName: 'star',
  });
}

export function renderSkills(skills, ui) {
  const groups = list(
    skills,
    (group) => `
      <div class="skills__group">
        <h3 class="skills__category"><span class="skills__icon">${icon(group.icon, 18)}</span>${e(group.category)}</h3>
        <ul class="badges">${list(group.items, (item) => `<li class="badge">${e(item)}</li>`)}</ul>
      </div>`,
  );
  return section('competences', ui.sections.skills, `<div class="skills">${groups}</div>`, {
    modifier: 'section--wide',
    iconName: 'cpu',
  });
}

function timelineMeta(parts) {
  return parts
    .filter(Boolean)
    .map((part) => e(part))
    .join(' <span aria-hidden="true">•</span> ');
}

function tasksList(tasks) {
  if (!tasks?.length) return '';
  return `<ul class="tasks">${list(tasks, (task) => `<li>${e(task)}</li>`)}</ul>`;
}

export function renderExperience(experience, ui) {
  const items = list(
    experience,
    (job) => `
      <li class="timeline__item">
        <h3 class="timeline__title">${e(job.company)} <span class="timeline__role">— ${e(job.role)}</span></h3>
        <p class="timeline__meta">${timelineMeta([job.period, job.location, job.duration])}</p>
        ${tasksList(job.tasks)}
      </li>`,
  );
  return section('parcours', ui.sections.experience, `<ol class="timeline">${items}</ol>`, {
    modifier: 'is-right',
    iconName: 'briefcase',
  });
}

export function renderMissions(missions, ui) {
  const cards = list(missions, (mission) => {
    const stats = mission.highlights?.length
      ? `<dl class="mission__stats">${list(
          mission.highlights,
          (stat) => `
            <div class="mission__stat">
              <dt class="mission__stat-value">${e(stat.value)}</dt>
              <dd class="mission__stat-label">${e(stat.label)}</dd>
            </div>`,
        )}</dl>`
      : '';
    const role = mission.role ? ` <span class="timeline__role">— ${e(mission.role)}</span>` : '';
    return `
      <article class="mission">
        <h3 class="mission__title">${e(mission.title)}${role}</h3>
        <p class="timeline__meta">${timelineMeta([mission.period, mission.duration])}</p>
        ${stats}
        ${tasksList(mission.tasks)}
      </article>`;
  });
  return section('missions', ui.sections.missions, `<div class="missions">${cards}</div>`, {
    modifier: 'is-left',
    iconName: 'flag',
  });
}

export function renderProject(project, ui) {
  return section(
    'projet',
    ui.sections.project,
    `<h3 class="project__title">${e(project.title)}</h3>
     <p>${e(project.context)}</p>
     <p class="project__subtitle">${e(project.recommendationsTitle)}</p>
     <ul class="checklist">${list(project.recommendations, (item) => `<li>${e(item)}</li>`)}</ul>`,
    { modifier: 'is-right', iconName: 'lightbulb' },
  );
}

export function renderEducation(education, ui) {
  const items = list(
    education,
    (course) => `
      <li class="timeline__item">
        <h3 class="timeline__title">${e(course.title)}</h3>
        <p class="timeline__meta">${timelineMeta([course.period, course.place])}</p>
        ${course.description ? `<p class="timeline__text">${e(course.description)}</p>` : ''}
      </li>`,
  );
  return section('formation', ui.sections.education, `<ol class="timeline">${items}</ol>`, {
    modifier: 'is-left',
    iconName: 'graduation',
  });
}

export function renderInterests(interests, ui) {
  return section(
    'interets',
    ui.sections.interests,
    `<ul class="badges badges--large">${list(interests, (item) => `<li class="badge">${e(item)}</li>`)}</ul>`,
    { modifier: 'is-right', iconName: 'heart' },
  );
}

export function renderContact(contact, identity, ui) {
  const row = (iconName, label, value) => `
    <li class="contact__item">
      <span class="contact__icon">${icon(iconName)}</span>
      <div><span class="contact__label">${e(label)}</span>${value}</div>
    </li>`;

  const github = (contact.github ?? [])
    .map((repo) => externalLink(repo.url, repo.label))
    .join('<br />');

  return section(
    'contact',
    ui.sections.contact,
    `<ul class="contact">
       ${row('phone', ui.phone, `<a href="tel:${e(contact.phoneHref)}">${e(contact.phone)}</a>`)}
       ${row('email', ui.email, `<a href="mailto:${e(contact.email)}">${e(contact.email)}</a>`)}
       ${row('linkedin', ui.linkedin, externalLink(contact.linkedin.url, contact.linkedin.label))}
       ${row('github', ui.github, github)}
       ${
         contact.address?.length
           ? row(
               'address',
               ui.address,
               `<address>${list(contact.address, (line) => `${e(line)}<br />`)}</address>`,
             )
           : ''
       }
     </ul>
     ${downloadButton(identity, ui, 'contact__cta')}`,
    { iconName: 'email' },
  );
}

export function renderHeader(identity, ui, { theme = 'dark', lang = 'fr' } = {}) {
  const links = list(
    Object.entries(ui.nav),
    ([id, label]) => `<li><a class="header__link" href="#${e(id)}">${e(label)}</a></li>`,
  );
  const otherLang = lang === 'fr' ? 'en' : 'fr';
  const themeLabel = theme === 'dark' ? ui.toLight : ui.toDark;
  return `
    <a class="skip-link" href="#content">${e(ui.skipLink)}</a>
    <div class="header__inner">
      <a class="header__brand" href="#accueil">
        <span class="header__logo" aria-hidden="true">FM</span>
        <span class="header__brand-name">${e(identity.name)}</span>
      </a>
      <nav id="site-nav" class="header__nav" aria-label="${e(ui.navLabel)}">
        <ul class="header__links">${links}</ul>
      </nav>
      <div class="header__actions">
        <button type="button" class="header__button" data-action="lang"
          aria-label="${e(ui.otherLangShort)} – ${e(ui.switchLang)}" lang="${otherLang}">${icon('globe', 18)}<span>${e(ui.otherLangShort)}</span></button>
        <button type="button" class="header__button" data-action="theme"
          aria-label="${e(themeLabel)}">${icon(theme === 'dark' ? 'sun' : 'moon', 18)}</button>
        <button type="button" class="header__button header__menu" data-action="menu"
          aria-label="${e(ui.menu)}" aria-expanded="false" aria-controls="site-nav">${icon('menu', 20)}</button>
      </div>
    </div>`;
}

export function renderFooter(identity, ui, year = new Date().getFullYear()) {
  return `<p>© ${e(year)} ${e(identity.name)}. ${e(ui.rights)}</p>`;
}

export function renderPage(cv, ui) {
  return [
    renderHero(cv.identity, cv.terminal, ui),
    renderStats(cv.stats, ui),
    renderProfile(cv.profile, ui),
    renderStrengths(cv.strengths, ui),
    renderSkills(cv.skills, ui),
    renderExperience(cv.experience, ui),
    renderMissions(cv.missions, ui),
    renderProject(cv.project, ui),
    renderEducation(cv.education, ui),
    renderInterests(cv.interests, ui),
    renderContact(cv.contact, cv.identity, ui),
  ].join('');
}
