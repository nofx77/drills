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

## Plans enregistrés (Supabase)

Les coachs se connectent par lien courriel et enregistrent leurs plans dans Supabase (projet `wcgfgdxsyfzwvgsgpjoi`).

- Schéma de la table et règles d'accès : `supabase/schema.sql` (à exécuter dans l'éditeur SQL de Supabase).
- Authentication → URL Configuration : Site URL `https://nofx77.github.io/drills/`, Redirect URLs `https://nofx77.github.io/drills/` et `http://localhost:5179/`.
- La clé « anon » dans `src/lib/supabase.js` est publique par conception : ce sont les règles d'accès (RLS) qui protègent les plans.
