# Plan d'implémentation : Site vitrine CV — Florian MASSOL

Référence : [`SPEC.md`](../SPEC.md) (validée le 2026-10-04).
Tâches détaillées : [`tasks/todo.md`](todo.md).

## Vue d'ensemble

Un site statique d'une seule page (Vite + JS sans framework) qui affiche tout le contenu de `CV_admin.pdf` en FR et en EN, avec un tourbillon de particules cyan en Canvas 2D, fixé au centre de l'écran, qui tourne uniquement quand on fait défiler la page. Il tourne en localhost.

## État de l'environnement (constaté)

- ❌ **Node.js / npm absents** → indispensable pour Vite, Vitest et Playwright. À installer en premier (Tâche 1).
- ❌ Python absent, pas d'outil PDF (`pdfimages`, ImageMagick).
- ✅ git et winget présents.
- Le dossier n'est pas encore un dépôt git.

## Décisions d'architecture

- **Sans framework, ES modules natifs** : un site vitrine n'a pas d'état complexe, et chaque Ko économisé aide à tenir l'objectif Lighthouse ≥ 90.
- **Contenu dans des JSON + `render.js` en fonctions pures** (JSON → chaîne HTML échappée) : facile à tester dans Vitest sans navigateur. Le changement de langue relance simplement le rendu.
- **Tourbillon divisé en deux fichiers** : `vortex-math.js` (fonctions pures testées) et `vortex.js` (canvas, scroll, boucle d'animation). La boucle `requestAnimationFrame` ne tourne que tant que l'angle affiché n'a pas rejoint l'angle cible : elle s'arrête au repos et redémarre à l'événement `scroll`.
- **État du tourbillon exposé pour les tests** : `data-angle` sur le `<canvas>`, ce qui permet à Playwright de vérifier « immobile sans scroll / tourne avec scroll ».
- **Thème** : un attribut `data-theme` sur `<html>` et des variables CSS. Le tourbillon lit `--vortex-color` via `getComputedStyle` et se redessine quand le thème change.
- **Photo** : extraite par un petit script Node sans dépendance (`scripts/extract-photo.mjs`) qui lit les images JPEG intégrées au PDF (flux `DCTDecode`). Elle est extraite une seule fois, le résultat est enregistré dans le projet, et le script n'est pas appelé au build.
- **Ordre « risque d'abord »** : le tourbillon (la partie la plus incertaine) est construit juste après les fondations, avant le contenu.

## Graphe de dépendances

```
T1 Node.js + git
 └─ T2 Squelette Vite + outillage
     ├─ T3 Assets (PDF, photo, favicon)
     ├─ T4 vortex-math (pur)
     │   └─ T5 vortex canvas + scroll ───────────────┐
     └─ T6 Styles de base + Hero + Profil (render)   │
         └─ T7 Compétences + Parcours + Missions     │
             └─ T8 Projet + Formations + Intérêts + Contact
                 ├─ T9 Thème clair/sombre ◄──────────┘ (couleur du tourbillon)
                 ├─ T10 Version anglaise (i18n)
                 └─ T11 En-tête, navigation, responsive
                     └─ T12 Accessibilité, perf, SEO, suite e2e complète
```

Parallélisables après T2 : T3, T4 et T6 sont indépendants. T9, T10 et T11 sont indépendants entre eux (tous touchent `main.js` : à fusionner avec soin).

## Liste des tâches

### Phase 0 : Prérequis

- [x] T1 : Installer Node.js LTS et initialiser git

### Phase 1 : Fondations

- [x] T2 : Squelette Vite + ESLint/Prettier/Vitest/Playwright
- [x] T3 : Assets : PDF téléchargeable, photo extraite, favicon

### Phase 2 : Tourbillon (risque le plus élevé)

- [x] T4 : `vortex-math` : fonctions pures + tests
- [x] T5 : Tourbillon canvas lié au scroll

### Checkpoint A : le tourbillon fonctionne sur une page vide

### Phase 3 : Contenu

- [x] T6 : Styles de base + rendu Hero et Profil
- [x] T7 : Rendu Compétences, Parcours, Missions
- [x] T8 : Rendu Projet, Formations, Intérêts, Contact, pied de page

### Checkpoint B : tout le CV est affiché en FR

### Phase 4 : Extras

- [ ] T9 : Mode clair / sombre
- [ ] T10 : Version anglaise
- [ ] T11 : En-tête fixe, navigation, responsive

### Checkpoint C : fonctionnalités complètes

### Phase 5 : Finition

- [ ] T12 : Accessibilité, performance, SEO, suite e2e complète

### Checkpoint final : tous les critères de réussite de la spec sont cochés

## Risques et parades

| Risque                                                                       | Impact              | Parade                                                                                                                                                                         |
| ---------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Installation de Node refusée ou impossible                                   | Élevé (bloque tout) | Installer via `winget install OpenJS.NodeJS.LTS` avec ton accord ; sinon installeur officiel nodejs.org.                                                                       |
| Photo du PDF non extractible (image non JPEG, détourage par masque séparé)   | Moyen               | Repli : rendu de la page via Playwright puis recadrage, ou tu fournis la photo directement. Le détourage ovale est refait en CSS (`border-radius: 50%`).                       |
| Tourbillon saccadé sur mobile                                                | Moyen               | Nombre de particules adapté à la largeur de l'écran, `devicePixelRatio` plafonné à 2, boucle arrêtée au repos. Mesure dans le panneau Performance de DevTools au Checkpoint A. |
| Contraste du texte par-dessus les particules                                 | Moyen               | Cartes de contenu sur fond semi-opaque ; vérification Lighthouse/axe en T12.                                                                                                   |
| Liens GitHub/LinkedIn mal transcrits (le texte et le rendu du PDF diffèrent) | Faible              | Vérification manuelle des URL en T8 (version avec tiret par défaut).                                                                                                           |
| Traduction EN approximative                                                  | Faible              | Relecture par Florian au Checkpoint C.                                                                                                                                         |
| Plusieurs tâches modifient `main.js`                                         | Faible              | `main.js` reste un simple assembleur : chaque fonctionnalité expose un `init*()` dans son propre module.                                                                       |

## Questions ouvertes

- Aucune bloquante. Il faudra seulement ton accord pour installer Node.js (T1).
