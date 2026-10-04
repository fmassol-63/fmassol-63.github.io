# Spec : Site vitrine — CV Administrateur Système

## Hypothèses
1. Site **100 % statique** (aucun backend, aucune base de données). **Pour l'instant : uniquement en localhost** (`npm run dev` / `npm run preview`) ; l'hébergement sera décidé plus tard.
2. Navigateurs modernes uniquement (Chrome, Firefox, Safari, Edge — 2 dernières versions). Pas d'IE.
3. **Source du contenu : `CV_admin.pdf`** (2 pages). Tout ce qui figure sur le CV est affiché, transcrit fidèlement dans `cv.fr.json`.
4. Le contact se fait par liens (tel, mailto, LinkedIn, GitHub) — pas de formulaire.
5. Il n'existe **pas de CV anglais** : la version EN du site est une traduction rédigée à partir du FR (à relire par Florian). Le bouton PDF propose le CV français dans les deux langues.
6. La **photo de profil** est extraite du PDF (opération ponctuelle, pas de dépendance ajoutée au projet) et enregistrée dans `public/photo.webp`.
7. `CV_admin.pdf` est copié dans `public/cv-florian-massol.pdf` pour le téléchargement.

## Objectif
Un site vitrine d'une seule page qui présente le profil d'un **administrateur système** à des recruteurs et des clients.
Au centre de l'écran, un **tourbillon de particules** reste fixe et **tourne quand on fait défiler la page** ; les sections du CV défilent autour de lui.

**Utilisateurs cibles :** recruteurs, responsables techniques, clients potentiels (freelance / missions).
**Ce qui compte pour eux :** voir en moins de 30 secondes qui tu es, ce que tu sais faire et ce que tu as déjà fait, puis te contacter ou télécharger ton CV.

### User stories
- En tant que recruteur, je vois dès l'arrivée le nom, le titre (« Administrateur Système ») et le tourbillon animé.
- En tant que recruteur, en descendant, je découvre **Compétences**, **Missions / Expériences** et **Formations**, et le tourbillon tourne au rythme du scroll.
- En tant que recruteur, je peux **télécharger le CV en PDF** en un clic.
- En tant que recruteur, je trouve tes **coordonnées** (email, LinkedIn, GitHub).
- En tant que visiteur anglophone, je bascule le site en **anglais**.
- En tant que visiteur, je choisis le **mode clair ou sombre** ; mon choix est retenu.
- En tant que visiteur sensible aux animations, le tourbillon reste **immobile** si mon système demande de réduire les animations.

### Sections de la page (dans l'ordre)
Le contenu provient intégralement de `CV_admin.pdf`.

1. **Hero** — photo (ronde), « Florian MASSOL », titre « Administrateur Systèmes et Réseaux », boutons « Télécharger le CV » et « Me contacter ».
2. **Profil** — le texte de profil (militaire en fin de reconversion…), puis infos clés : né le 02/12/1994, permis B et C – véhicule personnel, langues : anglais B1.
3. **Compétences** — 13 catégories, chacune avec ses outils affichés en « badges » : Virtualisation, Systèmes, NAS, Sauvegarde, Antivirus, Services, Réseaux, Supervision, SIEM, Pentest, Autre, Scripting, Prise en main à distance.
4. **Parcours professionnel** — frise chronologique :
   - 3D - Agence Informatique Tribout — Alternant Administrateur Système, Réseau, Cyber (2025–2026, Clermont-Ferrand, 1 an)
   - Armée de Terre — Administrateur Système (2015–2025, Clermont-Ferrand, 9 ans)
5. **Missions** — cartes : Mission Estonie (2023, 4 mois) ; Mission GAO (2018, 4 mois), avec les tâches et les chiffres clés mis en avant (500 postes, 1000 interventions).
6. **Projet** — « Déploiement d'une infrastructure hyperconvergée » : contexte (site unique, pas de redondance) + les 8 recommandations.
7. **Formations** — frise : Bachelor ASRC (2025–2026, GFS), Logiciels métier & environnement militaire (2023–2024), BM1 Administrateur Système (2022, ETNC Rennes), Formation SIO (2015, Armée de Terre), BAC PRO Électrotechnicien (2013).
8. **Centres d'intérêt** — Sport, Bricolage – Menuiserie, Jardinage, Jeux (console, PC, jeux de société).
9. **Contact** — téléphone, email, LinkedIn, adresse, GitHub (profil + dépôt zabbix_vault), bouton PDF.
10. **Pied de page** — © année, nom.

En-tête fixe : navigation par ancres vers chaque section, bascule FR/EN, bascule clair/sombre.

### Comportement du tourbillon
- Rendu en **Canvas 2D** : spirale de particules (type galaxie / vortex), positionnée en `position: fixed` au centre de l'écran, derrière le contenu.
- **Angle de rotation = fonction de la position de scroll** (`window.scrollY`), avec un léger lissage (interpolation) pour éviter les à-coups. Descendre fait tourner dans un sens, remonter dans l'autre.
- **Immobile tant qu'on ne défile pas** : aucune rotation au repos. Une fois le lissage terminé, la boucle d'animation s'arrête (pas de calcul inutile) et redémarre au prochain scroll.
- **Couleur dominante : cyan « tech »** (ex. `#00e5ff` en sombre, cyan plus foncé en clair pour le contraste), tirée des variables CSS du thème → s'adapte au mode clair/sombre.
- Nombre de particules adapté à la taille de l'écran (moins sur mobile).
- Rendu via `requestAnimationFrame`, **mis en pause** quand l'onglet est caché.
- `prefers-reduced-motion: reduce` → tourbillon dessiné une fois, immobile.
- Redimensionnement géré (canvas net sur écrans haute densité via `devicePixelRatio`).
- Le contenu reste lisible par-dessus (fond de carte semi-opaque ou contraste suffisant).

## Tech Stack
- **Vite** (v6) — serveur de dev et build statique
- **HTML / CSS / JavaScript** (ES modules, aucun framework)
- **Canvas 2D** natif pour le tourbillon (aucune librairie 3D)
- **Vitest** — tests unitaires
- **Playwright** — tests de bout en bout (e2e)
- **ESLint** + **Prettier** — lint et formatage
- Node.js ≥ 20

## Commandes
```
Installation : npm install
Dev :          npm run dev            # vite, http://localhost:5173
Build :        npm run build          # vite build → dist/
Aperçu :       npm run preview        # sert dist/
Tests unit. :  npm test               # vitest run
Tests e2e :    npm run test:e2e       # playwright test
Lint :         npm run lint           # eslint . --fix
Format :       npm run format         # prettier --write .
```

## Structure du projet
```
index.html               → Page unique, sections vides remplies par le JS
CV_admin.pdf             → CV source (ne pas modifier)
public/
  cv-florian-massol.pdf  → Copie du CV, téléchargeable
  photo.webp             → Photo extraite du CV (détourée, WebP)
  favicon.svg
src/
  main.js                → Point d'entrée : initialise thème, langue, rendu, tourbillon
  data/
    cv.fr.json           → Contenu du CV en français (source de vérité)
    cv.en.json           → Contenu du CV en anglais
    ui.json              → Libellés de l'interface (FR/EN : titres de sections, boutons)
  lib/
    vortex.js            → Tourbillon Canvas (création, rendu, liaison au scroll)
    vortex-math.js       → Fonctions pures : position des particules, angle selon scroll
    i18n.js              → Choix et bascule de langue
    theme.js             → Choix et bascule clair/sombre
    render.js            → Génère le HTML des sections à partir du JSON
  styles/
    tokens.css           → Variables CSS (couleurs clair/sombre, espacements, typo)
    main.css             → Mise en page et composants
tests/
  unit/                  → Tests Vitest (vortex-math, i18n, theme, render)
  e2e/                   → Tests Playwright (parcours visiteur)
```

## Style de code
- JavaScript moderne, ES modules, `const` par défaut, pas de `var`.
- Fonctions pures dans `vortex-math.js` / `render.js` pour être testables ; les effets de bord (DOM, canvas, localStorage) sont isolés.
- Noms de fichiers en `kebab-case`, fonctions en `camelCase`, constantes en `UPPER_SNAKE_CASE`.
- CSS : variables dans `tokens.css`, classes en BEM léger (`.timeline__item`), mobile-first.
- Aucun texte de contenu en dur dans le JS ou le HTML : tout vient des JSON.
- Échappement systématique du texte inséré dans le DOM (`textContent` ou fonction d'échappement).

```js
// src/lib/vortex-math.js
const SCROLL_TO_RADIANS = 0.0025;

/** Angle cible du tourbillon pour une position de scroll donnée. */
export function angleForScroll(scrollY) {
  return scrollY * SCROLL_TO_RADIANS;
}

/** Interpolation pour lisser la rotation entre deux frames. */
export function lerp(current, target, factor = 0.1) {
  return current + (target - current) * factor;
}
```

```json
// src/data/cv.fr.json (extrait)
{
  "identity": { "name": "Florian MASSOL", "title": "Administrateur Systèmes et Réseaux", "photo": "/photo.webp" },
  "profile": { "text": "Militaire en fin de reconversion, ...", "facts": ["Né le 02/12/1994", "Permis B et C – Véhicule personnel"], "languages": ["Anglais – B1"] },
  "skills": [{ "category": "Virtualisation", "items": ["Hyper-V", "Cluster HCI", "vCenter", "ESXi", "Proxmox"] }],
  "experience": [{ "company": "Armée de Terre", "role": "Administrateur Système", "period": "2015 – 2025", "location": "Clermont-Ferrand", "duration": "9 ans", "tasks": ["..."] }],
  "missions": [{ "title": "Mission Estonie", "role": "Administrateur Système", "period": "2023", "duration": "4 mois", "tasks": ["Migration de Windows Server 2012 vers 2016", "..."] }],
  "project": { "title": "Déploiement d'une infrastructure hyperconvergée", "context": "...", "recommendations": ["..."] },
  "education": [{ "title": "BM1 Administrateur Système", "period": "2022", "school": "École des Transmissions du Numérique et du Cyber, Rennes", "description": "..." }],
  "interests": ["Sport", "Bricolage – Menuiserie", "Jardinage", "Jeux (console, PC, jeux de société)"],
  "contact": { "phone": "...", "email": "...", "linkedin": "...", "address": "...", "github": ["..."] }
}
```

## Stratégie de test
- **Unitaires (Vitest)** :
  - `vortex-math` : angle proportionnel au scroll, sens inversé à la remontée, lissage converge, nombre de particules selon largeur d'écran.
  - `i18n` : langue par défaut selon `navigator.language`, choix enregistré prioritaire, repli sur FR.
  - `theme` : thème par défaut selon `prefers-color-scheme`, choix enregistré prioritaire.
  - `render` : chaque section est générée à partir du JSON ; le texte est échappé ; les champs optionnels manquants ne cassent pas le rendu.
  - Les fichiers `cv.fr.json` et `cv.en.json` ont la **même structure** (mêmes clés, même nombre d'entrées).
- **E2E (Playwright, Chromium + WebKit mobile)** :
  - La page charge sans erreur console.
  - Le canvas du tourbillon est présent ; sa rotation **ne change pas** sans scroll, et change après un scroll (attribut/état exposé pour le test).
  - Avec `reducedMotion: 'reduce'`, la rotation ne change pas.
  - Bascule FR → EN change les titres des sections ; choix conservé après rechargement.
  - Bascule clair/sombre change le thème ; choix conservé après rechargement.
  - Le lien PDF pointe vers un fichier existant (réponse 200).
  - Les ancres de navigation amènent à la bonne section.
- **Contrôles manuels / audit** : Lighthouse (mobile) sur le build de prod.
- Pas d'objectif de couverture chiffré global ; tous les modules de `src/lib/` ont des tests.

## Limites (Boundaries)
- **Toujours :**
  - Lancer `npm test` et `npm run lint` avant de déclarer une tâche finie.
  - Garder le contenu dans les JSON, jamais en dur.
  - Respecter `prefers-reduced-motion` et un contraste WCAG AA.
  - Garder FR et EN synchronisés (même structure).
- **Demander d'abord :**
  - Ajouter une dépendance (au-delà de la stack listée).
  - Changer la forme du tourbillon ou passer en 3D.
  - Modifier le contenu du CV (formulations, ajouts) au-delà de la transcription fidèle.
  - Choisir / configurer l'hébergement et le nom de domaine.
  - **Avant toute mise en ligne publique** : revalider l'affichage de l'adresse postale, du téléphone et de la date de naissance (OK en localhost, à reconfirmer une fois le site public).
- **Jamais :**
  - Modifier ou supprimer `CV_admin.pdf`.
  - Ajouter du tracking / analytics / cookies tiers.
  - Charger des scripts depuis un CDN externe non validé.
  - Inventer des expériences, diplômes ou compétences absents du CV.

## Critères de réussite
- [ ] Les 10 sections s'affichent avec **tout** le contenu de `CV_admin.pdf` (rien d'oublié, rien d'inventé), en FR et en EN.
- [ ] La photo extraite du CV s'affiche dans le hero.
- [ ] Le tourbillon est centré, fixe, cyan, **immobile sans scroll**, et tourne de façon fluide quand on défile (dans les deux sens).
- [ ] Animation fluide : pas de saccade visible sur un ordinateur portable récent ; reste utilisable sur mobile milieu de gamme.
- [ ] Avec « réduire les animations » activé, le tourbillon est immobile.
- [ ] Bascules langue et thème fonctionnelles et mémorisées.
- [ ] Le bouton PDF télécharge le CV.
- [ ] Responsive de 360 px à 1920 px de large, sans défilement horizontal.
- [ ] Lighthouse mobile : Performance ≥ 90, Accessibilité ≥ 95, Bonnes pratiques ≥ 95, SEO ≥ 95.
- [ ] Poids total de la page (hors PDF) < 300 Ko compressé.
- [ ] Aucune erreur dans la console.
- [ ] `npm test`, `npm run test:e2e` et `npm run lint` passent.

## Décisions prises
- CV source : `CV_admin.pdf` · pas de CV anglais · tout le contenu du CV est affiché · tourbillon immobile sans scroll · cyan « tech » · localhost pour l'instant · photo reprise du CV.

## Questions ouvertes
1. **Liens à vérifier** : le texte du PDF et son rendu visuel ne concordent pas.
   - GitHub : `github.com/fmassol63` ou `github.com/fmassol-63` ? (le texte du PDF dit `fmassol63`, l'image montre `fmassol-63`)
   - LinkedIn : `linkedin.com/in/florian-massol-2243ab212` ou `florianmassol-2243ab212` ?
   → Par défaut, je prends la version **avec tiret** (rendu visuel) et je la vérifierai en ouvrant les liens.
2. **Fautes de frappe du CV** : corriger les noms de produits évidents sur le site (« Synologie » → Synology, « Rsynch » → rsync, « sécurise » → sécurisé), ou recopier à l'identique ? → Par défaut, je **corrige** ces trois coquilles uniquement.
