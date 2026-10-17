# Catalogue d'exercices de hockey — design

## Intention

Martin est coach de hockey. Il a environ 200 exercices téléchargés d'icehockeysystems.com dans
`/Users/mnantel/Downloads/2025/2025` (un dossier par exercice). Il veut un site web, sur son cell
ou son ordi, pour **parcourir ces exercices et monter ses plans de pratique**. Aujourd'hui, il doit
fouiller dans des dossiers de fichiers.

Le succès : en quelques minutes, sur son cell, il trouve des exercices par catégorie ou par nom,
consulte le schéma et la fiche PDF, garde ses préférés sous la main et assemble un plan de pratique
qu'il peut imprimer, partager à d'autres coachs ou rouvrir à l'aréna.

## Objectifs

1. **Catalogue** : grille de tous les exercices (image PNG du schéma + titre).
   - Recherche par nom.
   - Filtre par catégorie (un exercice peut avoir plusieurs catégories). La recherche et le filtre se combinent.
   - Filtre « Favoris seulement ».
2. **Fiche d'exercice** : grande image, images de variantes s'il y en a, catégories, lien pour
   ouvrir le PDF (nouvel onglet), bouton favori, bouton « Ajouter au plan ».
3. **Favoris** : une étoile/cœur sur chaque exercice, et une vue ou un filtre des favoris.
4. **Plan de pratique** : liste ordonnée d'exercices.
   - Ajouter, retirer et réordonner les exercices.
   - Imprimer (version papier propre : titre du plan, puis chaque exercice avec son titre et son image).
   - Partager par lien (le plan est encodé dans l'URL). Le lien sert aussi à le rouvrir sur un autre appareil.
5. **Hébergement sur GitHub Pages**, en site statique.

## Non-objectifs

- **Pas de vidéos** : les MP4 ne sont ni copiés ni publiés.
- Pas de compte, pas de serveur, pas de base de données.
- Pas d'édition des exercices ni des catégories dans le site : les catégories se corrigent dans un fichier.
- Pas de recherche plein texte dans le contenu des PDF (v1).

## Anti-objectifs (échec même si ça « marche »)

- Un site lent ou lourd sur un cell à l'aréna.
- Une interface chargée. Martin veut un look **épuré, clean, dans les tendances web actuelles**.
- Perdre un plan en cours en fermant l'onglet.

## Contraintes (décidées par Martin)

- **Vue 3 + Tailwind CSS.**
- **GitHub Pages** comme hébergement.
- Consultation sur **cell et ordi** : mobile-first.
- **Internet disponible à l'aréna** : pas de mode hors ligne (pas de service worker / PWA).
- **Dépôt GitHub public, mais non référencé** : `noindex` + `robots.txt`. Martin accepte que le contenu soit visible par quiconque a le lien.
- Les vidéos ne sont **pas** publiées sur GitHub Pages.
- Les catégories sont un **mélange** de trois sources : celles d'icehockeysystems, mon classement et ses
  propres thèmes. Il me laisse décider des détails.

## Les données source

`/Users/mnantel/Downloads/2025/2025/<Dossier_Exercice>/` contient :

- `<TITRE_EN_MAJUSCULES>.png` : le schéma principal. C'est l'image de la carte.
- parfois des PNG en plus (`drill-maker-*.png`, `field_content_image.png`), à montrer comme variantes sur la fiche.
- `drill.pdf` ou `ihs-print-*.pdf` : la fiche (schéma, description, mise en place, points de coaching).
- `open_in_browser.html` : une redirection qui contient l'URL de l'exercice sur icehockeysystems.com.
- des `.mp4`, à ignorer.

Cas particuliers vus : deux dossiers sans PDF (`1-3-1_Mad_Attacker`, `1_v_1,_to_2_v_2_to_3_v_3`), un dossier sans PNG
(`Defensive_Transition_Passing`). Le site doit les gérer : pas de lien PDF si absent, et une image
de remplacement neutre si le PNG manque.

200 dossiers. PNG ≈ 39 Mo (schéma principal ≈ 186 Ko, 2313×1156), PDF ≈ 269 Mo : acceptable pour GitHub Pages.

## Décisions prises (mes choix, à valider par Martin)

- **Import des données par script** : un script Node (`scripts/import.mjs`), lancé à la main, lit
  le dossier source et :
  - copie les PNG et PDF dans `public/drills/<slug>/` ;
  - génère `src/data/drills.json` avec `id` (slug), `title` (nom du dossier, `_` → espaces), `image`,
    `variants[]`, `pdf` (ou null) et `sourceUrl` (extrait du HTML) ;
  - ne réécrit **jamais** le fichier de catégories.
- **Catégories** dans un fichier séparé, édité à la main : `src/data/categories.json`, sous la forme
  `{ "<slug>": ["Transition", "Angle"] }`. Je le remplis une première fois en lisant les PDF. Les
  noms sont en français. Liste de départ (à ajuster selon le contenu réel) : Réchauffement,
  Patinage, Passes, Tir, Angle / pression, Batailles 1 c. 1, Petits jeux, Transition, Zone neutre,
  Sortie de zone, Entrée de zone, Jeu défensif, Avantage numérique, Gardien. Les thèmes propres à
  Martin s'ajoutent dans ce même fichier.
- **icehockeysystems.com bloque les requêtes automatisées (403)** : on ne récupère pas leurs
  catégories. Leur URL reste dans les données, et la fiche peut offrir un lien « Voir sur le site d'origine ».
- **Favoris** : enregistrés sur l'appareil (localStorage). Ils ne se synchronisent pas tout seuls
  entre le cell et l'ordi.
- **Plan** :
  - un seul plan « en cours », gardé sur l'appareil, plus un titre de plan libre et une durée en
    minutes optionnelle par exercice, avec le total affiché ;
  - le lien de partage contient le titre, les exercices dans l'ordre et les durées ;
  - ouvrir un lien de plan propose de remplacer le plan en cours.
  - Pas de plans multiples nommés en v1 : le lien sauvegardé (favori du navigateur, texto à soi-même)
    en tient lieu.
- **Routage en mode hash** (`#/exercice/<slug>`) pour éviter les 404 de GitHub Pages sur les sous-pages.
- **Interface en français.** Les titres d'exercices restent en anglais (comme la source).
- **Look** (couleurs et sombre par défaut décidés par Martin) :
  - **mode sombre par défaut**. Un bouton permet de passer en clair, et le choix est retenu sur l'appareil (mon choix) ;
  - **palette** ([colorhunt](https://colorhunt.co/palette/0915401b2cc17692ffabd2fa)) : `#091540` (fond sombre),
    `#1B2CC1` (accent fort), `#7692FF` (accent / liens), `#ABD2FA` (texte secondaire / pastilles).
    À déclarer comme couleurs du thème Tailwind. Les nuances intermédiaires et le mode clair sont dérivés de ces quatre couleurs ;
  - **transitions** demandées par Martin : changement de page en fondu, survol et appui sur les cartes,
    apparition des résultats lors du filtrage, réordonnancement animé du plan (`TransitionGroup`), bouton favori animé.
    Elles sont courtes (≤ 250 ms) et désactivées si l'appareil demande moins de mouvement (`prefers-reduced-motion`) ;
  - cartes à coins arrondis, catégories en pastilles horizontales défilables, beaucoup d'espace ;
  - navigation basse sur mobile (Exercices, Favoris, Plan), en haut sur ordi ;
  - images en `loading="lazy"`.
- **Déploiement** : workflow GitHub Actions officiel vers Pages. `base` de Vite = `'./'` (chemins relatifs, compatibles avec le routage hash) : le site marche quel que soit le nom du dépôt, qui n'est pas encore choisi.
- **Premier classement** : fait par l'agent qui construit, en lisant les ~200 PDF (étape réelle du plan). Les thèmes propres à Martin s'ajouteront ensuite dans `categories.json`.
- **Discrétion** : `<meta name="robots" content="noindex">` et `robots.txt` interdisant tout.

## Laissé au builder

- Le choix de Vite, des versions de Vue, Tailwind et vue-router, et de la librairie de glisser-déposer
  pour réordonner (des flèches haut/bas suffisent si c'est plus simple).
- L'encodage exact du plan dans l'URL. Une seule vérification exécutable suffit : un aller-retour
  encode → décode qui retrouve le même plan.
- Le détail visuel, dans l'esprit ci-dessus.
- Note de convention : Martin ne veut pas que l'agent lance de build (il gère sa compilation). Le
  serveur de dev et le script d'import peuvent être lancés pour vérifier.
