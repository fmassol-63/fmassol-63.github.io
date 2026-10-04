# Tâches : Site vitrine CV — Florian MASSOL

Plan : [`tasks/plan.md`](plan.md) · Spec : [`SPEC.md`](../SPEC.md)

Définition de « terminé » pour chaque tâche : critères d'acceptation cochés, `npm test` et `npm run lint` passent, `npm run build` réussit, aucune erreur console.

---

## Phase 0 : Prérequis

## Tâche 1 : Installer Node.js LTS et initialiser git

**Description :** Installer Node.js LTS (≥ 20) via winget, avec l'accord de Florian, puis initialiser un dépôt git avec un `.gitignore` adapté.

**Critères d'acceptation :**

- [ ] `node -v` affiche ≥ 20 et `npm -v` fonctionne (dans PowerShell et dans Git Bash).
- [ ] `git init` est fait ; `.gitignore` contient `node_modules/`, `dist/`, `test-results/`, `playwright-report/`.
- [ ] Premier commit : `SPEC.md`, `tasks/`, `CV_admin.pdf`.

**Vérification :**

- [ ] `node -v && npm -v && git status`

**Dépendances :** Aucune
**Fichiers :** `.gitignore`
**Taille :** XS

---

## Phase 1 : Fondations

## Tâche 2 : Squelette Vite + outillage

**Description :** Créer le projet Vite (vanilla), installer et configurer ESLint, Prettier, Vitest et Playwright (Chromium + WebKit mobile). Ajouter un `index.html` minimal et un test unitaire et un test e2e « fumée ».

**Critères d'acceptation :**

- [ ] Les scripts `dev`, `build`, `preview`, `test`, `test:e2e`, `lint` et `format` existent et fonctionnent.
- [ ] `index.html` contient `lang="fr"`, un `<title>`, la balise viewport, `<canvas id="vortex">` et un `<main>` vide.
- [ ] Le test e2e fumée vérifie que la page charge sans erreur console.

**Vérification :**

- [ ] `npm test`, `npm run test:e2e`, `npm run lint`, `npm run build`
- [ ] Manuel : `npm run dev` → http://localhost:5173 s'ouvre

**Dépendances :** T1
**Fichiers :** `package.json`, `vite.config.js`, `eslint.config.js`, `.prettierrc`, `playwright.config.js`, `index.html`, `src/main.js`, `tests/unit/smoke.test.js`, `tests/e2e/smoke.spec.js`
**Taille :** M (surtout de la configuration)

## Tâche 3 : Assets : PDF, photo, favicon

**Description :** Copier `CV_admin.pdf` vers `public/cv-florian-massol.pdf`. Écrire `scripts/extract-photo.mjs` (Node, sans dépendance) qui extrait les JPEG intégrés au PDF ; garder la photo de profil dans `public/photo.webp`. Créer un favicon SVG cyan.

**Critères d'acceptation :**

- [ ] `public/photo.webp` est bien la photo du CV, nette et de poids < 80 Ko.
- [ ] `public/cv-florian-massol.pdf` est identique à `CV_admin.pdf`, qui reste intact.
- [ ] Si l'extraction échoue, le repli prévu au plan est appliqué et signalé.

**Vérification :**

- [ ] Manuel : ouvrir `public/photo.webp` ; comparer les empreintes des deux PDF (`certutil -hashfile` ou `sha256sum`)

**Dépendances :** T2
**Fichiers :** `scripts/extract-photo.mjs`, `public/photo.webp`, `public/cv-florian-massol.pdf`, `public/favicon.svg`
**Taille :** S

---

## Phase 2 : Tourbillon

## Tâche 4 : `vortex-math` : fonctions pures + tests

**Description :** En TDD, écrire les fonctions pures du tourbillon : angle cible selon le scroll, lissage (`lerp`), test « au repos » (écart < epsilon), génération des particules en spirale (bras, rayon, angle, taille, opacité) avec graine déterministe, nombre de particules selon la largeur de l'écran.

**Critères d'acceptation :**

- [ ] `angleForScroll(0) === 0` ; l'angle augmente quand on descend et diminue quand on remonte.
- [ ] `lerp` converge vers la cible ; `isSettled` devient vrai en un nombre fini d'itérations.
- [ ] Le nombre de particules est plus petit sur mobile (< 768 px) que sur desktop ; la génération est reproductible avec une même graine.

**Vérification :**

- [ ] `npm test -- vortex-math`

**Dépendances :** T2
**Fichiers :** `src/lib/vortex-math.js`, `tests/unit/vortex-math.test.js`
**Taille :** S

## Tâche 5 : Tourbillon canvas lié au scroll

**Description :** `src/lib/vortex.js` : `initVortex(canvas)` dessine la spirale cyan au centre, en `position: fixed` derrière le contenu. Le scroll met à jour l'angle cible ; une boucle rAF lisse vers la cible puis s'arrête. Gérer `prefers-reduced-motion`, le passage de l'onglet en arrière-plan, le redimensionnement et le DPR (plafonné à 2). Exposer `data-angle`. Ajouter temporairement une page longue pour tester.

**Critères d'acceptation :**

- [ ] Sans scroll, `data-angle` ne change pas (vérifié après 1 s) et aucune frame rAF ne tourne.
- [ ] Après un scroll vers le bas, l'angle augmente ; après un retour en haut, il revient à environ 0.
- [ ] Avec `reducedMotion: 'reduce'`, l'angle reste à 0 même après un scroll.

**Vérification :**

- [ ] `npm run test:e2e -- vortex`
- [ ] Manuel : rotation fluide en scrollant, net sur un écran haute densité, pas de saccade dans l'onglet Performance de DevTools

**Dépendances :** T4
**Fichiers :** `src/lib/vortex.js`, `src/main.js`, `src/styles/main.css`, `tests/e2e/vortex.spec.js`
**Taille :** M

### ✅ Checkpoint A : tourbillon

- [ ] Tous les tests passent, le build est propre
- [ ] Florian valide le rendu et la sensation du tourbillon (vitesse, densité, couleur) avant de passer au contenu

---

## Phase 3 : Contenu

## Tâche 6 : Styles de base + rendu Hero et Profil

**Description :** Créer `tokens.css` (palette cyan, typo, espacements, thème sombre par défaut) et la mise en page de base de `main.css` (cartes semi-opaques par-dessus le tourbillon). Créer `cv.fr.json` avec `identity` et `profile` transcrits du CV, et `render.js` avec `escapeHtml`, `renderHero` et `renderProfile`.

**Critères d'acceptation :**

- [ ] Le Hero affiche la photo ronde, « Florian MASSOL », « Administrateur Systèmes et Réseaux », un bouton PDF (lien vers `/cv-florian-massol.pdf` avec `download`) et un bouton « Me contacter » (ancre `#contact`).
- [ ] Le Profil affiche le texte, la date de naissance, le permis et la langue, à l'identique du CV.
- [ ] `escapeHtml` neutralise `<`, `>`, `&`, `"` et `'` (test) ; un champ optionnel absent ne casse pas le rendu (test).

**Vérification :**

- [ ] `npm test -- render`
- [ ] Manuel : comparaison visuelle avec le CV

**Dépendances :** T2, T3
**Fichiers :** `src/styles/tokens.css`, `src/styles/main.css`, `src/data/cv.fr.json`, `src/lib/render.js`, `tests/unit/render.test.js`
**Taille :** M

## Tâche 7 : Rendu Compétences, Parcours, Missions

**Description :** Ajouter à `cv.fr.json` les 13 catégories de compétences, les 2 expériences et les 2 missions. Écrire `renderSkills` (badges), `renderExperience` (frise) et `renderMissions` (cartes, avec mise en avant de « 500 postes » et « 1000 interventions »).

**Critères d'acceptation :**

- [ ] Les 13 catégories et chaque outil du CV sont présents (corrections validées : Synology, rsync).
- [ ] Les deux expériences s'affichent avec l'entreprise, le poste, la période, le lieu, la durée et toutes les tâches.
- [ ] Les deux missions s'affichent avec l'intitulé, le rôle, la période, la durée et toutes les tâches.

**Vérification :**

- [ ] `npm test -- render`
- [ ] Manuel : relecture ligne à ligne avec le CV

**Dépendances :** T6
**Fichiers :** `src/data/cv.fr.json`, `src/lib/render.js`, `src/styles/main.css`, `tests/unit/render.test.js`
**Taille :** M

## Tâche 8 : Rendu Projet, Formations, Intérêts, Contact, pied de page

**Description :** Compléter `cv.fr.json` (projet HCI, 5 formations, intérêts, contact). Écrire `renderProject`, `renderEducation`, `renderInterests`, `renderContact` et `renderFooter`. Ajouter un test de complétude : chaque chaîne attendue du CV figure dans le HTML généré. Vérifier les URL GitHub et LinkedIn.

**Critères d'acceptation :**

- [ ] Le projet affiche son contexte et ses 8 recommandations (« sécurisé » corrigé) ; les 5 formations sont affichées avec leurs détails.
- [ ] Le contact propose des liens `tel:`, `mailto:`, LinkedIn et GitHub (profil + zabbix_vault), l'adresse et un bouton PDF ; les liens externes ont `rel="noopener"`.
- [ ] Le test de complétude passe : toutes les sections du CV sont présentes.

**Vérification :**

- [ ] `npm test`
- [ ] Manuel : ouvrir les liens GitHub et LinkedIn (versions avec tiret ; corriger si 404)

**Dépendances :** T7
**Fichiers :** `src/data/cv.fr.json`, `src/lib/render.js`, `src/styles/main.css`, `tests/unit/render.test.js`, `tests/unit/cv-completeness.test.js`
**Taille :** M

### ✅ Checkpoint B : contenu FR complet

- [ ] Tous les tests passent, le build est propre
- [ ] Les 10 sections sont visibles, le tourbillon tourne derrière
- [ ] Florian relit le contenu face au CV

---

## Phase 4 : Extras

## Tâche 9 : Mode clair / sombre

**Description :** `theme.js` : thème initial = choix enregistré, sinon `prefers-color-scheme`. Bouton de bascule dans l'en-tête ; le choix est enregistré dans `localStorage` (protégé par try/catch). Ajouter les tokens du thème clair ; le tourbillon se redessine avec la nouvelle couleur.

**Critères d'acceptation :**

- [ ] La bascule change `data-theme` et les couleurs ; le choix est conservé après rechargement.
- [ ] Le tourbillon passe au cyan foncé en mode clair, sans rechargement.
- [ ] Contraste AA respecté dans les deux thèmes.

**Vérification :**

- [ ] `npm test -- theme` ; `npm run test:e2e -- theme`

**Dépendances :** T5, T8
**Fichiers :** `src/lib/theme.js`, `src/styles/tokens.css`, `src/lib/vortex.js`, `src/main.js`, `tests/unit/theme.test.js`
**Taille :** M

## Tâche 10 : Version anglaise

**Description :** Créer `ui.json` (libellés FR/EN) et `cv.en.json` (traduction complète). `i18n.js` : langue initiale = choix enregistré, sinon `navigator.language`, sinon FR. La bascule FR/EN relance le rendu et met à jour `<html lang>` et `<title>`.

**Critères d'acceptation :**

- [ ] La bascule FR → EN traduit tous les textes visibles ; le choix est conservé après rechargement.
- [ ] Test de parité : `cv.fr.json` et `cv.en.json` ont les mêmes clés et le même nombre d'entrées.
- [ ] Le PDF proposé reste le CV français (libellé EN : « Download CV (French) »).

**Vérification :**

- [ ] `npm test -- i18n` ; `npm run test:e2e -- i18n`
- [ ] Manuel : relecture de la traduction par Florian

**Dépendances :** T8
**Fichiers :** `src/data/ui.json`, `src/data/cv.en.json`, `src/lib/i18n.js`, `src/main.js`, `tests/unit/i18n.test.js`
**Taille :** M

## Tâche 11 : En-tête fixe, navigation, responsive

**Description :** En-tête fixe avec ancres vers chaque section (défilement fluide, désactivé si reduced-motion) et les deux bascules. Menu compact sur mobile. Mise en page vérifiée de 360 à 1920 px.

**Critères d'acceptation :**

- [ ] Chaque ancre amène à la bonne section, sans que l'en-tête ne masque le titre (`scroll-margin-top`).
- [ ] Aucun défilement horizontal à 360, 768, 1280 et 1920 px.
- [ ] Menu mobile utilisable au clavier (`aria-expanded`, focus visible).

**Vérification :**

- [ ] `npm run test:e2e -- nav`
- [ ] Manuel : mode appareil de DevTools

**Dépendances :** T8 (T9/T10 pour placer les bascules)
**Fichiers :** `index.html`, `src/styles/main.css`, `src/main.js`, `tests/e2e/nav.spec.js`
**Taille :** M

### ✅ Checkpoint C : fonctionnalités complètes

- [ ] Tous les tests passent, le build est propre
- [ ] Parcours complet testé : arrivée → scroll → bascule EN → mode clair → PDF → contact
- [ ] Revue avec Florian (traduction comprise)

---

## Phase 5 : Finition

## Tâche 12 : Accessibilité, performance, SEO, suite e2e complète

**Description :** Ajouter les méta (description, Open Graph), un `alt` sur la photo, la hiérarchie des titres et un lien d'évitement. Lancer Lighthouse mobile sur `npm run preview` et corriger. Mesurer le poids de `dist/`. Compléter la suite e2e avec tous les cas de la spec (PDF en 200, etc.).

**Critères d'acceptation :**

- [ ] Lighthouse mobile : Performance ≥ 90, Accessibilité ≥ 95, Bonnes pratiques ≥ 95, SEO ≥ 95.
- [ ] Page (hors PDF) < 300 Ko compressé.
- [ ] Tous les cas e2e de la spec sont couverts et passent (Chromium + WebKit mobile).

**Vérification :**

- [ ] `npm run build && npm run preview` + Lighthouse ; `npm run test:e2e` ; `npm test` ; `npm run lint`

**Dépendances :** T9, T10, T11
**Fichiers :** `index.html`, `src/styles/main.css`, `tests/e2e/*.spec.js`
**Taille :** M

### ✅ Checkpoint final

- [ ] Tous les critères de réussite de `SPEC.md` sont cochés
- [ ] Prêt pour revue (`/review`)
