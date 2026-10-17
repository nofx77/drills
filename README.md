# Exercices de hockey

Catalogue des exercices (schémas PNG + fiches PDF) pour monter des plans de pratique. Vue 3 + Tailwind, hébergé sur GitHub Pages.

## En local

```bash
npm i
npm run dev
```

## Réimporter les exercices

```bash
npm run import                       # dossiers par défaut : ~/Downloads/2025/2025 et ~/Downloads/FULLICE/FULLICE
npm run import -- /dossier/1 /dossier/2   # tous les dossiers à fusionner
```

Le script copie les PNG et PDF dans `public/drills/` (jamais les vidéos) et régénère `src/data/drills.json`. Il ne touche pas aux catégories.

## Corriger les catégories

Éditer `src/data/categories.json` (`"id-de-l-exercice": ["Transition", "Tir"]`), puis vérifier :

```bash
npm test
```

Les catégories permises sont listées dans `tests/categories.test.js` : ajouter une nouvelle catégorie là aussi.

## Mise en ligne

1. Créer un dépôt GitHub (public) et pousser la branche `main`.
2. Dans le dépôt : Settings → Pages → Source : « GitHub Actions ».
3. Chaque push sur `main` publie le site.

Le site est public mais non référencé (`noindex` + `robots.txt`) : seules les personnes qui ont le lien le trouvent.
