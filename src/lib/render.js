// Génère le HTML des sections à partir des données du CV.
// Fonctions pures : (données, libellés) → chaîne HTML, tout texte étant échappé.

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(value) {
  if (value === undefined || value === null) return '';
  return String(value).replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

const e = escapeHtml;
const list = (items, render) => (items ?? []).map(render).join('');

function section(id, title, body, modifier = '') {
  return `
    <section id="${id}" class="section ${modifier}" aria-labelledby="${id}-title">
      <div class="card">
        <h2 id="${id}-title" class="section__title">
          <span class="section__prompt" aria-hidden="true">~/</span>${e(title)}
        </h2>
        ${body}
      </div>
    </section>`;
}

function externalLink(url, label) {
  return `<a href="${e(url)}" target="_blank" rel="noopener noreferrer">${e(label)}</a>`;
}

const ICONS = {
  download:
    '<path d="M12 3v12m0 0-5-5m5 5 5-5M4 17v3h16v-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  phone:
    '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  email:
    '<path d="M3 6h18v12H3zM3 7l9 6 9-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  linkedin:
    '<path d="M4 4h16v16H4zM8 10v6M8 7.5v.01M12 16v-6m0 2.5a2.5 2.5 0 0 1 5 0V16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  address:
    '<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="9" r="2.5" fill="currentColor"/>',
  github:
    '<path d="M9 19c-4 1.5-4-2-6-2.5m12 5v-3.5a3 3 0 0 0-.8-2.3c2.7-.3 5.5-1.3 5.5-6a4.7 4.7 0 0 0-1.3-3.2 4.4 4.4 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6.6 2.7 5.6 3 5.6 3a4.4 4.4 0 0 0-.1 3.2A4.7 4.7 0 0 0 4.2 9.4c0 4.6 2.8 5.7 5.5 6a3 3 0 0 0-.8 2.3V21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
};

const icon = (name) =>
  `<svg class="icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">${ICONS[name]}</svg>`;

function downloadButton(identity, ui, modifier = '') {
  return `<a class="button ${modifier}" href="${e(identity.cv)}" download>${icon('download')}${e(ui.downloadCv)}</a>`;
}

export function renderHero(identity, ui) {
  return `
    <section id="accueil" class="hero" aria-labelledby="accueil-title">
      <img class="hero__photo" src="${e(identity.photo)}" alt="${e(identity.photoAlt)}"
        width="306" height="348" fetchpriority="high" />
      <h1 id="accueil-title" class="hero__name">${e(identity.name)}</h1>
      <p class="hero__title"><span class="hero__prompt" aria-hidden="true">$ whoami → </span>${e(identity.title)}</p>
      <div class="hero__actions">
        ${downloadButton(identity, ui)}
        <a class="button button--ghost" href="#contact">${e(ui.contactMe)}</a>
      </div>
    </section>`;
}

export function renderProfile(profile, ui) {
  return section(
    'profil',
    ui.sections.profile,
    `<p class="profile__text">${e(profile.text)}</p>
     <ul class="facts">${list(profile.facts, (fact) => `<li class="facts__item">${e(fact)}</li>`)}</ul>`,
    'is-left',
  );
}

export function renderSkills(skills, ui) {
  const groups = list(
    skills,
    (group) => `
      <div class="skills__group">
        <h3 class="skills__category">${e(group.category)}</h3>
        <ul class="badges">${list(group.items, (item) => `<li class="badge">${e(item)}</li>`)}</ul>
      </div>`,
  );
  return section(
    'competences',
    ui.sections.skills,
    `<div class="skills">${groups}</div>`,
    'section--wide',
  );
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
  return section(
    'parcours',
    ui.sections.experience,
    `<ol class="timeline">${items}</ol>`,
    'is-right',
  );
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
  return section(
    'missions',
    ui.sections.missions,
    `<div class="missions">${cards}</div>`,
    'is-left',
  );
}

export function renderProject(project, ui) {
  return section(
    'projet',
    ui.sections.project,
    `<h3 class="project__title">${e(project.title)}</h3>
     <p>${e(project.context)}</p>
     <p class="project__subtitle">${e(project.recommendationsTitle)}</p>
     <ul class="checklist">${list(project.recommendations, (item) => `<li>${e(item)}</li>`)}</ul>`,
    'is-right',
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
  return section(
    'formation',
    ui.sections.education,
    `<ol class="timeline">${items}</ol>`,
    'is-left',
  );
}

export function renderInterests(interests, ui) {
  return section(
    'interets',
    ui.sections.interests,
    `<ul class="badges badges--large">${list(interests, (item) => `<li class="badge">${e(item)}</li>`)}</ul>`,
    'is-right',
  );
}

export function renderContact(contact, identity, ui) {
  const row = (iconName, label, value) => `
    <li class="contact__item">
      ${icon(iconName)}
      <div><span class="contact__label">${e(label)}</span>${value}</div>
    </li>`;

  const github = list(contact.github, (repo) => externalLink(repo.url, repo.label)).replace(
    /<\/a><a /g,
    '</a><br /><a ',
  );

  return section(
    'contact',
    ui.sections.contact,
    `<ul class="contact">
       ${row('phone', ui.phone, `<a href="tel:${e(contact.phoneHref)}">${e(contact.phone)}</a>`)}
       ${row('email', ui.email, `<a href="mailto:${e(contact.email)}">${e(contact.email)}</a>`)}
       ${row('linkedin', ui.linkedin, externalLink(contact.linkedin.url, contact.linkedin.label))}
       ${row('github', ui.github, github)}
       ${row('address', ui.address, `<address>${list(contact.address, (line) => `${e(line)}<br />`)}</address>`)}
     </ul>
     ${downloadButton(identity, ui, 'contact__cta')}`,
  );
}

export function renderFooter(identity, ui, year = new Date().getFullYear()) {
  return `<p>© ${e(year)} ${e(identity.name)}. ${e(ui.rights)}</p>`;
}

export function renderPage(cv, ui) {
  return [
    renderHero(cv.identity, ui),
    renderProfile(cv.profile, ui),
    renderSkills(cv.skills, ui),
    renderExperience(cv.experience, ui),
    renderMissions(cv.missions, ui),
    renderProject(cv.project, ui),
    renderEducation(cv.education, ui),
    renderInterests(cv.interests, ui),
    renderContact(cv.contact, cv.identity, ui),
  ].join('');
}
