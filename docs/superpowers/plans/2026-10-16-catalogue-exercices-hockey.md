# Catalogue d'exercices de hockey — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Site statique Vue 3 + Tailwind (GitHub Pages) pour parcourir ~200 exercices de hockey (PNG + PDF), les filtrer, garder des favoris et monter un plan de pratique partageable et imprimable.

**Architecture:** Un script Node copie les PNG/PDF du dossier source dans `public/drills/<slug>/` et génère `src/data/drills.json`. Les catégories vivent dans `src/data/categories.json`, édité à la main. L'app est une SPA Vue en routage hash. L'état (favoris, plan, thème) est géré par des composables à état module, persistés en localStorage. Le plan se partage encodé dans l'URL.

**Tech Stack:** Vite, Vue 3 (`<script setup>`), vue-router 4 (`createWebHashHistory`), Tailwind CSS v4 (`@tailwindcss/vite`), tests `node:test` (sans framework), GitHub Actions → Pages.

**Spec:** `docs/superpowers/specs/2026-10-16-catalogue-exercices-hockey-design.md`

## Global Constraints

- Racine du projet : `/Users/mnantel/www/Martin/coaching`. Dossier source (lecture seule) : `/Users/mnantel/Downloads/2025/2025`.
- **Ne jamais lancer `npm run build`** (convention de Martin). `npm run dev`, `node --test` et le script d'import sont permis.
- **Aucun `.mp4`** copié ni publié.
- Interface en **français**. Titres d'exercices en anglais, tirés du nom de dossier.
- Vite `base: './'` ; router `createWebHashHistory()`.
- **Mode sombre par défaut** : classe `dark` sur `<html>` sauf si localStorage `theme === 'light'`.
- Palette, seules couleurs de base (tokens `@theme` Tailwind) : `--color-navy: #091540`, `--color-royal: #1B2CC1`, `--color-periwinkle: #7692FF`, `--color-ice: #ABD2FA`. Pas d'hexadécimal ailleurs que dans ce bloc `@theme`. Les nuances viennent de l'opacité (`bg-ice/10`) ou de `white`/`black` de Tailwind.
- Transitions ≤ 250 ms, toutes neutralisées sous `prefers-reduced-motion: reduce`.
- `<meta name="robots" content="noindex, nofollow">` dans `index.html` + `public/robots.txt` (`User-agent: *` / `Disallow: /`).
- Pas de Pinia, pas de lib d'UI, pas de lib de glisser-déposer : le plan se réordonne avec des flèches haut/bas.
- Tout accès à `localStorage` passe par `src/lib/storage.js`.

## Review Focus

1. **Lien de plan corrompu ou tronqué** (texto coupé) : aucun plantage. Message « Lien de plan invalide », et le plan en cours reste intact. Test : `decodePlan` renvoie `null` (Task 3).
2. **Lien de plan qui cite un exercice inexistant** (slug renommé après réimport) : les exercices inconnus sont ignorés, et un message dit combien. Test : `resolvePlan` (Task 3).
3. **Noms de dossiers avec `&`, `,`, `.`, `(`, espaces** (`Cut_&_Drop_Warm_Up`, `Bing Bang Bong 2 v 1`) : le slug est une URL propre et les fichiers copiés sont renommés (`main.png`, `variant-N.png`, `fiche.pdf`). Ainsi, aucun chemin publié ne contient de caractère spécial. Test : `slugify` (Task 2).
4. **Exercice sans PNG ou sans PDF** (`Defensive_Transition_Passing`, `1-3-1_Mad_Attacker`, `1_v_1,_to_2_v_2_to_3_v_3`) : carte avec un visuel de remplacement, et pas de bouton PDF. Test : `buildDrill` (Task 2).
5. **localStorage indisponible** (navigation privée, stockage bloqué) : l'app fonctionne sans persistance. Test : `storage` avec un `localStorage` qui lève une erreur (Task 3).

---

### Task 1: Squelette, thème, layout

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `.gitignore`, `public/robots.txt`, `src/main.js`, `src/App.vue`, `src/style.css`, `src/router.js`, `src/composables/useTheme.js`, `src/components/AppNav.vue`, `src/views/CatalogueView.vue` (placeholder), `src/views/DrillView.vue` (placeholder), `src/views/PlanView.vue` (placeholder)

**Interfaces:**
- Produces:
  - routes : `/` nom `catalogue` ; `/favoris` nom `favoris` (même `CatalogueView`, prop `favoritesOnly: true`) ; `/exercice/:id` nom `drill` ; `/plan` nom `plan` (lit `route.query.p`).
  - `useTheme() → { isDark: Ref<boolean>, toggle(): void }`.
  - classes utilitaires CSS dans `style.css` : transition de route `.page-enter-active/.page-leave-active` (fondu + translation 4px), `.list-move/.list-enter-active/.list-leave-active` pour `TransitionGroup`.

- [ ] **Step 1: Initialiser le projet**

`git init`, puis `npm init -y` et `npm i vue vue-router` + `npm i -D vite @vitejs/plugin-vue tailwindcss @tailwindcss/vite`. Scripts : `"dev": "vite"`, `"build": "vite build"`, `"test": "node --test"`, `"import": "node scripts/import.mjs"`. `"type": "module"`. `.gitignore` : `node_modules`, `dist`.

- [ ] **Step 2: Écrire config, `index.html` et thème**

- `vite.config.js` : plugins `vue()` + `tailwindcss()`, `base: './'`.
- `index.html` : `lang="fr"`, meta robots, titre « Exercices de hockey ». Un script inline dans `<head>` ajoute la classe `dark` à `<html>` sauf si `localStorage.theme === 'light'`, dans un try/catch pour éviter un flash clair.
- `style.css` : `@import "tailwindcss";`, `@custom-variant dark (&:where(.dark, .dark *));`, le bloc `@theme` avec les 4 couleurs, puis les classes de transition. Ajouter un `@media (prefers-reduced-motion: reduce)` qui met `transition-duration`/`animation-duration` à `0ms !important` sur `*`.
- Fond : `bg-white text-navy` en clair, `dark:bg-navy dark:text-ice` en sombre.

- [ ] **Step 3: Layout et navigation**

- `App.vue` : `<AppNav>` + `<RouterView v-slot>` enveloppé dans `<Transition name="page" mode="out-in">`.
- `AppNav` : liens Exercices / Favoris / Plan (badge = nombre d'exercices du plan, branché en Task 3), plus le bouton thème (icône soleil/lune en SVG inline).
- Sur mobile, la nav est fixée en bas, avec `pb-[env(safe-area-inset-bottom)]` et un padding bas sur le contenu. À partir de `md:`, elle passe en haut, collante.
- `useTheme` bascule la classe `dark` et écrit `theme` via `storage` (Task 3). D'ici là, utiliser un appel direct dans un try/catch, puis le remplacer en Task 3.

- [ ] **Step 4: Vérifier**

Run: `npm run dev`, ouvrir l'URL. Attendu : fond navy au premier chargement, le bouton passe en clair et le choix tient au rechargement, la navigation entre les trois pages placeholder fait un fondu, et la nav est en bas sous 768 px.

- [ ] **Step 5: Commit** (inclure `docs/`)

```bash
git add -A && git commit -m "feat: squelette Vue + Tailwind, thème sombre, navigation"
```

---

### Task 2: Import des exercices

**Files:**
- Create: `scripts/lib.mjs`, `scripts/import.mjs`, `scripts/lib.test.mjs`
- Generated (committés) : `src/data/drills.json`, `public/drills/<slug>/*`

**Interfaces:**
- Produces (`scripts/lib.mjs`) :
  - `slugify(folder: string) → string` : NFD sans accents, minuscules, toute suite hors `[a-z0-9]` → `-`, sans `-` aux extrémités.
  - `titleFromFolder(folder: string) → string` : `_` → espace, espaces multiples réduits, trim.
  - `extractSourceUrl(html: string) → string | null` : l'URL du `content="0; url=..."`.
  - `buildDrill(folder: string, files: string[], html?: string) → { drill: Drill, copies: Array<[from: string, to: string]> }`.
- Type `Drill` (forme exacte de chaque entrée de `drills.json`, triées par `title`) :
  `{ id: string, title: string, image: string|null, variants: string[], pdf: string|null, sourceUrl: string|null }`. Les chemins sont relatifs à `public/`, ex. `drills/cut-drop-warm-up/main.png`.
- Règles de `buildDrill` :
  - image principale = premier `.png` dont le nom ne commence ni par `drill-maker-` ni par `field_content_image`. À défaut, le premier `.png`, et sinon `null` ;
  - les autres PNG deviennent `variant-1.png`, `variant-2.png`… ;
  - PDF = `drill.pdf` s'il existe, sinon le premier `.pdf`, copié sous `fiche.pdf` ;
  - `.mp4` et `.html` ne sont jamais copiés.

- [ ] **Step 1: Écrire les tests (`scripts/lib.test.mjs`, `node:test` + `assert/strict`)**

```js
assert.equal(slugify('Cut_&_Drop_Warm_Up'), 'cut-drop-warm-up')
assert.equal(slugify('1_v_1,_to_2_v_2_to_3_v_3'), '1-v-1-to-2-v-2-to-3-v-3')
assert.equal(slugify('3_vs._3_Corner_Drill'), '3-vs-3-corner-drill')
assert.equal(slugify('1_v_1_to_2_v_2_(Stick_vs_No_Stick)'), '1-v-1-to-2-v-2-stick-vs-no-stick')
assert.equal(titleFromFolder('3_v_3__Neutral_Zone_Break_Game'), '3 v 3 Neutral Zone Break Game')
assert.equal(extractSourceUrl('<meta http-equiv="refresh" content="0; url=https://x.com/a">'), 'https://x.com/a')
// buildDrill: dossier complet avec variantes + mp4
const { drill, copies } = buildDrill('1_on_1_Retrievals',
  ['1_ON_1_RETRIEVALS.png','drill-maker-1.png','field_content_image.png','drill.pdf','a.mp4','open_in_browser.html'])
assert.equal(drill.image, 'drills/1-on-1-retrievals/main.png')
assert.deepEqual(drill.variants, ['drills/1-on-1-retrievals/variant-1.png','drills/1-on-1-retrievals/variant-2.png'])
assert.equal(drill.pdf, 'drills/1-on-1-retrievals/fiche.pdf')
assert.ok(copies.every(([from]) => !from.endsWith('.mp4')))
// sans PDF / sans PNG
assert.equal(buildDrill('X', ['X.png']).drill.pdf, null)
assert.equal(buildDrill('Y', ['ihs-print-1.pdf']).drill.image, null)
assert.equal(buildDrill('Y', ['ihs-print-1.pdf']).drill.pdf, 'drills/y/fiche.pdf')
```

- [ ] **Step 2: Vérifier l'échec** — Run: `node --test scripts/` → FAIL (module introuvable).

- [ ] **Step 3: Implémenter `scripts/lib.mjs`**

- [ ] **Step 4: Vérifier le succès** — Run: `node --test scripts/` → PASS.

- [ ] **Step 5: Implémenter `scripts/import.mjs`**

Usage : `node scripts/import.mjs [sourceDir]`, avec par défaut `/Users/mnantel/Downloads/2025/2025`.
- Vider `public/drills/`, puis pour chaque sous-dossier : `buildDrill`, copier les fichiers et collecter les drills.
- Si deux dossiers donnent le même slug, s'arrêter avec une erreur qui nomme les deux dossiers.
- Écrire `src/data/drills.json` (indenté sur 2 espaces, trié par `title`).
- Afficher un résumé : nombre d'exercices, nombre sans image, nombre sans PDF.
- Ne pas toucher à `src/data/categories.json`.

- [ ] **Step 6: Lancer l'import** — Run: `npm run import`. Attendu : `200 exercices, 1 sans image, 2 sans PDF` (environ), aucun `.mp4` sous `public/drills` (`find public/drills -name '*.mp4' | wc -l` → `0`), et `du -sh public/drills` ≈ 310 Mo.

- [ ] **Step 7: Commit**

```bash
git add scripts src/data/drills.json public/drills && git commit -m "feat: import des exercices (PNG + PDF)"
```

---

### Task 3: État — stockage, favoris, plan, filtre

**Files:**
- Create: `src/lib/storage.js`, `src/lib/planCodec.js`, `src/lib/filter.js`, `src/composables/useFavorites.js`, `src/composables/usePlan.js`, `src/data/drills.js`, `tests/lib.test.js`
- Modify: `src/composables/useTheme.js` (passer par `storage`), `src/components/AppNav.vue` (badge du plan)

**Interfaces:**
- `storage.get(key: string, fallback: any) → any` (JSON.parse, avec repli sur `fallback` en cas d'erreur) et `storage.set(key, value): void` (silencieux en cas d'erreur). Clés : `theme`, `favorites`, `plan`.
- `src/data/drills.js` : `export const drills` (le JSON auquel on attache `categories: string[]`, tiré de `categories.json`, `[]` par défaut), `export const drillById: Map<string, Drill>` et `export const allCategories: string[]` (triées, en français). `src/data/categories.json` est créé vide (`{}`) ici et rempli en Task 4.
- Type `Plan = { title: string, items: Array<{ id: string, minutes: number|null }> }`.
- `encodePlan(plan: Plan) → string` : JSON compact `{t, i:[[id, minutes]]}` en base64url (UTF-8 sûr).
- `decodePlan(s: string) → Plan | null` : `null` si la chaîne est invalide ou si la forme est incorrecte.
- `resolvePlan(plan: Plan, knownIds: Set<string>) → { plan: Plan, missing: number }`.
- `filterDrills(drills, { query: string, categories: string[], favoritesOnly: boolean, favorites: Set<string> }) → Drill[]` :
  - `query` : sur le titre, sans tenir compte de la casse ni des accents ;
  - `categories` : correspond si l'exercice a **au moins une** catégorie sélectionnée (liste vide = tout) ;
  - les conditions se combinent en ET.
- `useFavorites() → { favorites: Ref<Set<string>>, isFavorite(id): boolean, toggle(id): void }`.
- `usePlan() → { plan: Ref<Plan>, has(id): boolean, add(id): void /* sans doublon */, remove(id): void, move(index: number, delta: -1|1): void, setMinutes(index, minutes: number|null): void, totalMinutes: ComputedRef<number>, replace(plan: Plan): void, clear(): void }`.
- Les deux composables utilisent un état au niveau du module et persistent via `watch(..., { deep: true })`.

- [ ] **Step 1: Écrire les tests (`tests/lib.test.js`)**

```js
const p = { title: 'U13 mardi — été', items: [{ id: 'cut-drop-warm-up', minutes: 10 }, { id: 'go-go', minutes: null }] }
assert.deepEqual(decodePlan(encodePlan(p)), p)
assert.equal(decodePlan('!!!pas-un-plan'), null)
assert.equal(decodePlan(encodePlan(p).slice(0, 10)), null)
assert.equal(decodePlan(btoa('{"t":1}')), null)
assert.deepEqual(resolvePlan(p, new Set(['go-go'])), { plan: { title: p.title, items: [{ id: 'go-go', minutes: null }] }, missing: 1 })
const D = [{ id: 'a', title: 'Défense rapide', categories: ['Transition'] }, { id: 'b', title: 'Go Go', categories: ['Tir'] }]
assert.deepEqual(filterDrills(D, { query: 'defense', categories: [], favoritesOnly: false, favorites: new Set() }).map(d => d.id), ['a'])
assert.deepEqual(filterDrills(D, { query: '', categories: ['Tir', 'Passes'], favoritesOnly: false, favorites: new Set() }).map(d => d.id), ['b'])
assert.deepEqual(filterDrills(D, { query: '', categories: [], favoritesOnly: true, favorites: new Set(['a']) }).map(d => d.id), ['a'])
// storage : localStorage qui lève une erreur
globalThis.localStorage = { getItem() { throw new Error() }, setItem() { throw new Error() } }
assert.equal(storage.get('x', 42), 42)
assert.doesNotThrow(() => storage.set('x', 1))
```

- [ ] **Step 2: Vérifier l'échec** — Run: `node --test tests/` → FAIL.
- [ ] **Step 3: Implémenter `storage.js`, `planCodec.js` et `filter.js`** (modules purs, sans import Vue).
- [ ] **Step 4: Vérifier le succès** — Run: `node --test tests/ scripts/` → PASS.
- [ ] **Step 5: Implémenter `drills.js`, `useFavorites`, `usePlan`, le badge de la nav et la migration de `useTheme`.**
- [ ] **Step 6: Commit** — `git commit -am "feat: favoris, plan, filtre, encodage du plan"` (ajouter les nouveaux fichiers).

---

### Task 4: Premier classement par catégories

**Files:**
- Modify: `src/data/categories.json`
- Test: `tests/categories.test.js`

**Interfaces:**
- Consumes : `src/data/drills.json` (ids).
- Liste fermée des catégories :
  - Réchauffement
  - Patinage
  - Passes
  - Tir
  - Angle / pression
  - Batailles 1 c. 1
  - Petits jeux
  - Transition
  - Zone neutre
  - Sortie de zone
  - Entrée de zone
  - Jeu défensif
  - Avantage numérique
  - Gardien

  Retirer une catégorie qui ne reçoit aucun exercice.

- [ ] **Step 1: Écrire le test**

Pour chaque `id` de `drills.json`, `categories.json[id]` est un tableau de 1 à 3 catégories, toutes présentes dans la liste fermée (déclarée dans le test). Aucune clé de `categories.json` n'est absente de `drills.json`.

- [ ] **Step 2: Vérifier l'échec** — Run: `node --test tests/categories.test.js` → FAIL (fichier vide).

- [ ] **Step 3: Classer**

Extraire le texte des PDF avec un script jetable placé **dans le scratchpad, pas dans le dépôt**. Utiliser `pdfjs-dist` installé dans le scratchpad, et produire une ligne par exercice : `id | titre | 400 premiers caractères`. Classer ensuite chaque exercice à partir du titre et de la description. Pour les exercices sans PDF, classer à partir du titre seul.

- [ ] **Step 4: Vérifier le succès** — Run: `node --test tests/` → PASS. Afficher le décompte par catégorie et vérifier qu'aucune catégorie ne dépasse ~60 % des exercices (sinon, elle ne filtre rien et il faut la scinder).

- [ ] **Step 5: Commit** — `git commit -am "feat: classement initial des exercices par catégorie"`.

---

### Task 5: Catalogue

**Files:**
- Create: `src/components/DrillCard.vue`, `src/components/FavoriteButton.vue`, `src/components/CategoryChips.vue`, `src/components/DrillImage.vue`
- Modify: `src/views/CatalogueView.vue`

**Interfaces:**
- Consumes : `drills`, `allCategories`, `filterDrills`, `useFavorites`, `usePlan`.
- `DrillImage` props `{ src: string|null, alt: string }`. Quand `src` est `null`, afficher un visuel neutre (patinoire stylisée en SVG ou dégradé `royal → navy` + icône), au même ratio **2 / 1**. Les images sont en `loading="lazy"`, préfixées par `import.meta.env.BASE_URL`.
- `FavoriteButton` props `{ id }`. C'est un cœur qui se remplit avec une petite animation `scale` à l'activation, avec `aria-pressed` et `aria-label` « Ajouter aux favoris » / « Retirer des favoris ».
- `CategoryChips` utilise `v-model: string[]`. Les pastilles défilent horizontalement sur mobile (`overflow-x-auto`, sans barre visible) et passent à la ligne sur ordi.
- `CatalogueView` prop `favoritesOnly: boolean`. Le champ de recherche et les catégories sélectionnées sont gardés dans `route.query` (`q`, `c` séparées par `,`), pour que le retour arrière depuis une fiche les conserve.

- [ ] **Step 1: Implémenter les composants et la vue**

- Grille : 1 colonne, puis `sm:` 2, `lg:` 3, `xl:` 4.
- Carte : image, titre, 1 à 3 pastilles, favori, bouton « + Plan » (« ✓ Dans le plan » si déjà présent). Cliquer sur la carte ouvre `drill`.
- Survol et appui : léger soulèvement (`-translate-y-0.5`, ombre `royal/30`), en 200 ms.
- La liste est dans `<TransitionGroup name="list">`.
- Compteur « N exercices ».
- État vide : « Aucun exercice ne correspond » + bouton « Effacer les filtres ». En vue Favoris sans favori : « Touche le cœur d'un exercice pour le retrouver ici ».

- [ ] **Step 2: Vérifier** dans `npm run dev`, à 375 px et 1280 px :
  - la recherche « corner » trouve « 3 vs. 3 Corner Drill » ;
  - deux pastilles cumulent les résultats (OU) ;
  - le cœur persiste au rechargement ;
  - `Defensive_Transition_Passing` montre le visuel de remplacement ;
  - le retour depuis une fiche garde les filtres.

- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat: catalogue avec recherche, catégories et favoris"`.

---

### Task 6: Fiche d'exercice

**Files:**
- Modify: `src/views/DrillView.vue`

**Interfaces:**
- Consumes : `drillById`, `DrillImage`, `FavoriteButton`, `usePlan`.

- [ ] **Step 1: Implémenter**

- Bouton retour (`router.back()` s'il y a un historique, sinon le catalogue).
- Titre, pastilles des catégories et grande image cliquable, qui ouvre le PNG en plein écran dans un nouvel onglet.
- Variantes en miniatures sous l'image.
- Boutons :
  - « Ouvrir la fiche PDF » (`target="_blank"`), seulement si `pdf` existe ;
  - « Ajouter au plan » / « Retirer du plan » ;
  - favori ;
  - lien discret « Voir sur icehockeysystems.com » si `sourceUrl` existe.
- Si l'id est inconnu, afficher « Exercice introuvable » et un lien vers le catalogue.

- [ ] **Step 2: Vérifier**

Ouvrir `#/exercice/1-on-1-retrievals` : 2 variantes et le PDF s'ouvre. Ouvrir `#/exercice/1-3-1-mad-attacker` : pas de bouton PDF. Ouvrir `#/exercice/nimporte-quoi` : message « introuvable ».

- [ ] **Step 3: Commit** — `git commit -am "feat: fiche d'exercice"`.

---

### Task 7: Plan de pratique — édition, partage, impression

**Files:**
- Modify: `src/views/PlanView.vue`, `src/style.css` (règles `@media print`)

**Interfaces:**
- Consumes : `usePlan`, `encodePlan`, `decodePlan`, `resolvePlan`, `drillById`, `DrillImage`.

- [ ] **Step 1: Implémenter l'édition**

- Titre éditable (placeholder « Pratique du … »).
- Liste numérotée dans `<TransitionGroup name="list">` : miniature, titre (lien vers la fiche), champ minutes (`inputmode="numeric"`, vide = `null`), flèches ↑ ↓ (désactivées aux extrémités) et bouton retirer.
- Total « Durée totale : X min » (exercices avec durée seulement).
- État vide : « Ton plan est vide » + lien vers le catalogue.
- Bouton « Vider le plan » avec `confirm()`.

- [ ] **Step 2: Implémenter le partage**

Le bouton « Partager » construit `location.origin + location.pathname + '#/plan?p=' + encodePlan(plan)`.
- Si `navigator.share` existe : `navigator.share({ title, url })`.
- Sinon : `navigator.clipboard.writeText(url)` + toast « Lien copié » (2 s).

- [ ] **Step 3: Implémenter l'ouverture d'un lien**

Quand `route.query.p` est présent :
- `decodePlan`. Si le résultat est `null`, afficher le toast « Lien de plan invalide » et ne rien changer.
- Sinon, appliquer `resolvePlan`. Si le plan en cours est vide, le remplacer directement. Sinon, demander `confirm('Remplacer ton plan actuel par celui du lien ?')`.
- Si `missing > 0`, afficher le toast « N exercice(s) introuvable(s) ignoré(s) ».
- Dans tous les cas, `router.replace({ name: 'plan' })` pour retirer `p` de l'URL.

- [ ] **Step 4: Implémenter l'impression**

- Le bouton « Imprimer » appelle `window.print()`.
- `@media print` :
  - nav, boutons et champs masqués (`print:hidden`) ;
  - fond blanc, texte noir, quel que soit le thème ;
  - titre du plan et durée totale en tête ;
  - chaque exercice affiche numéro, titre, durée et image pleine largeur, avec `break-inside: avoid` ;
  - environ 2 exercices par page.

- [ ] **Step 5: Vérifier**

- Ajouter 3 exercices, réordonner, saisir des durées : le total est juste et le tout tient au rechargement.
- « Partager » donne un lien. L'ouvrir dans une fenêtre privée restaure le même plan.
- Modifier un caractère au milieu de `p` donne « Lien de plan invalide » sans perte.
- Remplacer un id dans un plan encodé à la main donne « 1 exercice introuvable ignoré ».
- L'aperçu d'impression du navigateur est propre en mode sombre comme en mode clair.

- [ ] **Step 6: Commit** — `git commit -am "feat: plan de pratique (réordonner, durées, partage, impression)"`.

---

### Task 8: Déploiement GitHub Pages

**Files:**
- Create: `.github/workflows/deploy.yml`, `README.md`

- [ ] **Step 1: Workflow**

Sur `push` vers `main` + `workflow_dispatch`. Il utilise `actions/checkout`, `actions/setup-node` (Node LTS, cache npm), `npm ci`, `npm run build` (c'est la CI qui build, pas l'agent), puis `actions/upload-pages-artifact` (`path: dist`) et `actions/deploy-pages`. Permissions : `pages: write`, `id-token: write`.

- [ ] **Step 2: README (court, en français)**

- Lancer en local : `npm i`, `npm run dev`.
- Réimporter : `npm run import [dossier]`.
- Corriger les catégories : éditer `src/data/categories.json`, puis `npm test`.
- Activer Pages : Settings → Pages → Source « GitHub Actions ».
- Le site est public mais non référencé.

- [ ] **Step 3: Vérifier** — Run: `node --test tests/ scripts/` → PASS. Vérifier aussi que `git ls-files | grep -c '\.mp4$'` donne `0`.

- [ ] **Step 4: Commit** — `git add -A && git commit -m "chore: déploiement GitHub Pages"`. Ne pas pousser : la création du dépôt GitHub et le push reviennent à Martin.
