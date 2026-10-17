# Drill Hub — mémoire du projet

Site de planification de pratiques de hockey pour Martin (coach) et les coachs qu'il invite.
En ligne : https://nofx77.github.io/drills/ — dépôt `git@github.com:nofx77/drills.git` (pousser en **SSH**, HTTPS n'a pas d'identifiants).
Interface en **français**, titres d'exercices en anglais.

## Règles de travail

- **Ne jamais lancer `npm run build`** localement. GitHub Actions teste et compile à chaque push sur `main` (`.github/workflows/deploy.yml`).
- Après un changement : `npm test` → commit → `git push` → attendre la fin du run Actions pour ce SHA (API publique `repos/nofx77/drills/actions/runs`) → confirmer en ligne.
- Tests : `node --test` sans framework (`npm test` = `scripts/*.test.mjs` + `tests/*.test.js`). La logique pure vit dans `src/lib/` et se teste en Node ; l'UI se vérifie dans un vrai Chrome (voir « Vérifier l'UI »).
- Logique testée d'abord (TDD) ; un bogue = un test qui le reproduit avant la correction.
- Martin exécute lui-même le SQL dans Supabase (SQL Editor). Si l'avertissement RLS apparaît, lui dire d'exécuter **tel quel** : l'option « activer la RLS » de Supabase a déjà cassé un script en insérant une ligne au milieu d'un `create table`.
- Pas d'hexadécimal hors du bloc `@theme` de `src/style.css`.

## Pile

Vue 3 (`<script setup>`), vue-router 5 en **mode hash** (`createWebHashHistory`), Vite (`base: './'`), Tailwind CSS v4 (`@tailwindcss/vite`), `@supabase/supabase-js`, SortableJS (glisser-déposer du plan). Pas de Pinia : état partagé = composables à état module + localStorage via `src/lib/storage.js`.

## Données des exercices

- Sources : `~/Downloads/2025/2025` (PNG + PDF) et `~/Downloads/FULLICE/FULLICE` (JPG + PDF). `npm run import [dossiers…]` (`scripts/import.mjs`, logique dans `scripts/lib.mjs`) copie images et PDF dans `public/drills/<slug>/` (`main.png|jpg`, `variant-N`, `fiche.pdf`), retire les images en double (md5), ignore vidéos/HTML/RTF, régénère `src/data/drills.json` (365 exercices). Ne touche jamais aux catégories.
- Catégories : `src/data/categories.json`, éditées à la main ; la liste permise est dans `tests/categories.test.js` (1 à 6 catégories par exercice). Inclut les situations `1 vs 1`, `2 vs 1`, `2 vs 2`, `3 vs 1`, `3 vs 2`, `3 vs 3`, `4 vs 2` (tirées des titres).
- Les PDF n'ont pas de couche texte : le classement initial a utilisé l'OCR Vision de macOS (script Swift jetable, hors dépôt).
- Les fichiers de `public/drills` restent accessibles par URL directe (GitHub Pages ne protège rien) ; la connexion bloque l'interface seulement.

## Fonctionnalités et où elles vivent

- **Connexion obligatoire** pour tout le site (`App.vue`), sauf la route `meta.public` **`/partage`** (plan partagé, lecture seule). Accès **sur invitation** : pas d'inscription dans l'UI ; lien courriel avec `shouldCreateUser: false`.
- **Auth** (`useAuth`, `src/lib/auth.js`, `LoginPanel`, `PasswordForm`, `AccountView` `/compte`, `AccountMenu` avatar dans la nav) : courriel + mot de passe (champs `autocomplete` pour le trousseau), lien courriel PKCE. Les **liens d'invitation** Supabase arrivent en *implicit flow* (`#access_token=…`) : `src/lib/supabase.js` les intercepte **avant** le routeur (`parseAuthHash` → `setSession`) et redirige vers `#/compte?bienvenue=1`.
- **Admin** (`AdminView` `/admin`, visible pour `ADMIN_EMAIL = martinantel@me.com`) : liste des usagers via la RPC `admin_list_users()` (security definer, vérifie le courriel du JWT) ; formulaire « Inviter un coach » → Edge Function **`invite-coach`** (`supabase/functions/invite-coach/index.ts`, déployée par Martin via le dashboard, utilise la clé service de l'environnement Supabase).
- **Catalogue** (`CatalogueView`) : recherche + catégories dans l'URL (`q`, `c`), filtre `filterDrills` (catégories en OU, le reste en ET), affichage par paquets de 24 (IntersectionObserver), bouton « Effacer les filtres ».
- **Plan en cours** (`usePlan`, `PlanView`) : items `{ id, minutes }` (exercice) ou `{ kind: 'note', id, title, text, url, minutes }` (bloc commentaire avec lien YouTube intégré au clic via `NoteThumb` ou page web via `NoteLink`, `src/lib/links.js`). Réordonner : flèches + glisser-déposer. Partage : `encodePlan` en base64url dans `#/partage?p=…` (`src/lib/planCodec.js`, `resolvePlan` garde `savedId` et les blocs).
- **Synchronisation (connecté)** — trois mécanismes, chacun avec écho filtré par clés envoyées :
  - plans enregistrés : table `plans`, `useSavedPlans`, autosauvegarde + temps réel `usePlanSync` (`src/lib/sync.js`) ;
  - plan en cours partagé entre appareils : table `current_plans`, `useCurrentPlanSync` (`src/lib/currentPlanSync.js`) — le plan du compte gagne à la connexion ;
  - favoris : table `favorites`, `useFavoritesSync` (`reconcile` dans `src/lib/favoritesSync.js`) ; les événements DELETE de Supabase arrivent à tous les abonnés → filtrer par `user_id`.
  - Resynchronisation au retour de veille (`visibilitychange`).
- **Thèmes** (`useTheme`) : sombre par défaut, clair, **Canadiens** (`.habs`, rouge `#AF1E2D` / bleu `#192168` ; bouton avec le logo SVG fourni par Martin). Tokens `accent` / `on-accent` pour les boutons principaux.

## Supabase

Projet `wcgfgdxsyfzwvgsgpjoi` (clé anon publique dans `src/lib/supabase.js`, protégée par RLS). Schéma complet et idempotent : `supabase/schema.sql` (tables `plans`, `favorites`, `current_plans`, publication realtime, RPC `admin_list_users`). Authentication → URL Configuration : Site URL et Redirect URL `https://nofx77.github.io/drills/`. Inscriptions à désactiver dans Sign In / Providers (accès sur invitation). Envoi de courriels gratuit limité à quelques messages par heure.

## Vérifier l'UI

Chrome est installé (`/Applications/Google Chrome.app`). Les captures `--headless --screenshot` mentent parfois (transitions Vue figées, largeur minimale ~500 px) ; préférer **puppeteer-core** installé dans le scratchpad, pas dans le projet. Pour passer la connexion, injecter une session factice dans `localStorage['sb-wcgfgdxsyfzwvgsgpjoi-auth-token']` (JWT non signé, `expires_at` futur) et intercepter les requêtes `/rest/v1/*` (répondre aussi aux preflight `OPTIONS`). Tester à 320, 375 et 1280 px.

## Laissé de côté (à proposer si pertinent)

- Lien de plan bricolé avec deux fois le même id ou paramètres d'URL répétés.
- L'import vide `public/drills` avant de valider les slugs.
- `theme-color` toujours bleu foncé ; pas d'image de remplacement si un fichier image manque.
- Deux appareils qui modifient le même plan au même instant : la dernière écriture gagne.
