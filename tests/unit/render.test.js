import { describe, expect, it } from 'vitest';
import cv from '../../src/data/cv.fr.json';
import uiAll from '../../src/data/ui.json';
import {
  escapeHtml,
  renderContact,
  renderEducation,
  renderExperience,
  renderFooter,
  renderHero,
  renderInterests,
  renderMissions,
  renderPage,
  renderProfile,
  renderProject,
  renderStats,
  renderStrengths,
  renderTerminal,
  renderSkills,
} from '../../src/lib/render.js';

const ui = uiAll.fr;

describe('escapeHtml', () => {
  it('neutralise les caractères HTML spéciaux', () => {
    expect(escapeHtml(`<script>"a" & 'b'</script>`)).toBe(
      '&lt;script&gt;&quot;a&quot; &amp; &#39;b&#39;&lt;/script&gt;',
    );
  });

  it('accepte les nombres et les valeurs absentes', () => {
    expect(escapeHtml(42)).toBe('42');
    expect(escapeHtml(undefined)).toBe('');
    expect(escapeHtml(null)).toBe('');
  });
});

describe('renderHero', () => {
  const html = renderHero(cv.identity, cv.terminal, ui);

  it('affiche la photo, le nom et le titre', () => {
    expect(html).toContain('src="/photo.webp"');
    expect(html).toContain('alt="Photo de Florian MASSOL"');
    expect(html).toContain('Florian MASSOL');
    expect(html).toContain('Administrateur Systèmes et Réseaux');
  });

  it('propose le téléchargement du CV et le contact', () => {
    expect(html).toMatch(/href="\/cv-florian-massol\.pdf"[^>]*download/);
    expect(html).toContain('href="#contact"');
  });

  it('propose le téléchargement de la lettre de recommandation', () => {
    expect(html).toMatch(/href="\/lettre-recommandation-florian-massol\.pdf"[^>]*download/);
    expect(html).toContain('Lettre de recommandation');
  });

  it('affiche le statut, l’accroche et le terminal', () => {
    expect(html).toContain('class="hero__status"');
    expect(html).toContain('class="hero__tagline"');
    expect(html).toContain('data-terminal');
  });

  it('fonctionne sans statut, accroche ni terminal', () => {
    const identity = { ...cv.identity, status: undefined, tagline: undefined };
    const bare = renderHero(identity, undefined, ui);
    expect(bare).not.toContain('hero__status');
    expect(bare).not.toContain('data-terminal');
    expect(bare).not.toContain('undefined');
  });
});

describe('renderTerminal', () => {
  it('affiche chaque commande précédée d’une invite, puis ses sorties', () => {
    const html = renderTerminal([{ command: 'whoami', output: ['root'] }], ui);
    expect(html).toMatch(/terminal__prompt[^>]*>\$ <\/span><span class="terminal__cmd">whoami</);
    expect(html).toContain('<p class="terminal__line">root<span class="terminal__cursor"');
  });

  it('place le curseur dans la dernière ligne (pas de ligne vide en plus)', () => {
    const html = renderTerminal(cv.terminal, ui);
    expect(html.match(/terminal__cursor/g)).toHaveLength(1);
    expect(html).toMatch(
      /<span class="terminal__cursor" aria-hidden="true"><\/span><\/p>\s*<\/div>/,
    );
  });
});

describe('renderStats', () => {
  const html = renderStats(cv.stats, ui);

  it('affiche chaque chiffre clé avec sa valeur finale (lisible sans JS)', () => {
    expect(html.match(/class="stat"/g)).toHaveLength(cv.stats.length);
    expect(html).toContain('<span data-count="500">500</span>');
    expect(html).toContain('<span class="stat__suffix"> ans</span>');
    expect(html).toContain('<span class="stat__prefix">+</span><span data-count="1000">');
  });

  it('ne rend rien sans données', () => {
    expect(renderStats([], ui)).toBe('');
  });
});

describe('renderStrengths', () => {
  it('affiche les 4 atouts avec une icône', () => {
    const html = renderStrengths(cv.strengths, ui);
    expect(html.match(/class="strength"/g)).toHaveLength(4);
    expect(html.match(/class="strength__icon"><svg/g)).toHaveLength(4);
    expect(html).toContain('Gestion de crise');
  });
});

describe('renderProfile', () => {
  it('affiche le texte et les infos clés', () => {
    const html = renderProfile(cv.profile, ui);
    expect(html).toContain('id="profil"');
    expect(html).toContain('Ancien militaire ayant terminé ma reconversion');
    expect(html).toContain('Permis B et C – Véhicule personnel');
    expect(html).not.toContain('02/12/1994');
    expect(html).toContain('Langues : Anglais – B1');
  });
});

describe('renderSkills', () => {
  it('affiche les 13 catégories avec leurs outils', () => {
    const html = renderSkills(cv.skills, ui);
    expect(cv.skills).toHaveLength(13);
    expect(html.match(/class="skills__group"/g)).toHaveLength(13);
    expect(html).toContain('Proxmox');
    expect(html).toContain('Synology');
    expect(html).toContain('rsync (NetGear)');
  });

  it('échappe le contenu', () => {
    const html = renderSkills([{ category: '<b>', items: ['<i>'] }], ui);
    expect(html).not.toContain('<b>');
    expect(html).toContain('&lt;i&gt;');
  });
});

describe('renderExperience', () => {
  it('affiche les deux expériences avec leurs détails', () => {
    const html = renderExperience(cv.experience, ui);
    expect(html.match(/class="timeline__item"/g)).toHaveLength(2);
    expect(html).toContain('3D - Agence Informatique Tribout');
    expect(html).toContain('10 ans');
    expect(html).toContain('Chef de trois équipes (chef de groupe).');
  });
});

describe('renderMissions', () => {
  it('affiche les deux missions et les chiffres clés', () => {
    const html = renderMissions(cv.missions, ui);
    expect(html.match(/class="mission"/g)).toHaveLength(2);
    expect(html).toContain('Migration de Windows Server 2012 vers 2016.');
    expect(html).toMatch(/class="mission__stat-value">500</);
    expect(html).toMatch(/class="mission__stat-value">1000</);
  });

  it('supporte une mission sans chiffres clés', () => {
    const html = renderMissions([{ title: 'X', tasks: [] }], ui);
    expect(html).not.toContain('mission__stats');
  });
});

describe('renderProject', () => {
  it('affiche le contexte et les 8 recommandations', () => {
    const html = renderProject(cv.project, ui);
    expect(html.match(/<li>/g)).toHaveLength(8);
    expect(html).toContain('Active Directory sécurisé et redondant');
  });
});

describe('renderEducation', () => {
  it('affiche les 5 formations, avec ou sans description', () => {
    const html = renderEducation(cv.education, ui);
    expect(html.match(/class="timeline__item"/g)).toHaveLength(5);
    expect(html).toContain('BAC PRO Électrotechnicien');
    expect(html).not.toContain('undefined');
  });
});

describe('renderInterests', () => {
  it('affiche les centres d’intérêt', () => {
    const html = renderInterests(cv.interests, ui);
    expect(html).toContain('Bricolage – Menuiserie');
  });
});

describe('renderContact', () => {
  const html = renderContact(cv.contact, cv.identity, ui);

  it('propose des liens cliquables', () => {
    expect(html).toContain('href="tel:+33647853462"');
    expect(html).toContain('href="mailto:massolflorian@gmail.com"');
    expect(html).toContain('href="https://github.com/fmassol-63"');
    expect(html).not.toContain('zabbix_vault');
  });

  it('n’affiche pas d’adresse postale sur le site public', () => {
    expect(html).not.toContain('<address>');
    expect(html).not.toContain('Chavaroux');
  });

  it('affiche l’adresse si elle est fournie', () => {
    const withAddress = renderContact({ ...cv.contact, address: ['1 rue X'] }, cv.identity, ui);
    expect(withAddress).toContain('<address>1 rue X<br /></address>');
  });

  it('sécurise les liens externes', () => {
    const external = html.match(/<a [^>]*href="https:[^>]*>/g);
    expect(external.length).toBeGreaterThan(0);
    for (const link of external) expect(link).toContain('rel="noopener noreferrer"');
  });
});

describe('renderFooter', () => {
  it('affiche l’année et le nom', () => {
    expect(renderFooter(cv.identity, ui, 2026)).toContain('© 2026 Florian MASSOL');
  });
});

describe('renderPage', () => {
  it('place les sections dans l’ordre de la spec', () => {
    const html = renderPage(cv, ui);
    const ids = [...html.matchAll(/<section[^>]*id="([^"]+)"/g)].map((m) => m[1]);
    expect(ids).toEqual([
      'accueil',
      'chiffres',
      'profil',
      'atouts',
      'competences',
      'parcours',
      'missions',
      'projet',
      'formation',
      'interets',
      'contact',
    ]);
  });
});
