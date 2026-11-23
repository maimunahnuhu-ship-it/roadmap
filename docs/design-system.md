# Design system — Application Roadmap

Direction : **« Pâte à modeler »** (soft 3D, claymorphism pastel) avec des emprunts au style **« Bonbon »** (épaisseur des boutons, barres de progression, gros compteurs), et une touche futuriste : un dégradé « aurore », des halos lumineux et des chiffres en police géométrique.

## Principes

1. **Doux et bombé.** Tout semble modelé : coins très arrondis, ombres diffuses, reflet clair sur le haut des surfaces.
2. **Aéré mais efficace.** Beaucoup d'air autour des blocs, mais le backlog reste compact pour parcourir plus de 200 features.
3. **La couleur a un sens.** Couleurs de module, de statut et de priorité ne se chevauchent pas ; l'interface elle-même reste neutre (lavande et blanc).
4. **La lumière comme signature futuriste.** Le dégradé aurore et les halos sont rares : progression, focus, élément actif. Jamais en décor de fond.

---

## Couleurs

Tous les couples texte / fond des badges ont un contraste d'au moins **4,5:1** (WCAG AA).

### Fonds et surfaces

| Nom | Valeur | Rôle |
| --- | --- | --- |
| `bg` | `#F4F1FF` | Fond de page, lavande très pâle |
| `surface` | `#FFFFFF` | Cartes, modales, menus |
| `surface-sunken` | `#ECE8FB` | Intérieur creusé des champs, piste des barres de progression |
| `border` | `#E3DEF7` | Séparateurs fins, contour des boutons secondaires |
| `overlay` | `rgba(31, 26, 61, 0.32)` | Voile derrière une modale, avec flou de 8 px |

### Texte

| Nom | Valeur | Rôle |
| --- | --- | --- |
| `ink` | `#1F1A3D` | Texte principal, titres (violet nuit) |
| `ink-soft` | `#5B557A` | Texte secondaire, libellés de champs, métadonnées |
| `ink-muted` | `#8A84A8` | Placeholders et icônes décoratives uniquement, jamais pour un texte utile |
| `on-accent` | `#FFFFFF` | Texte sur bouton principal ou danger |

### Accent et lumière

| Nom | Valeur | Rôle |
| --- | --- | --- |
| `accent` | `#6C5CF5` | Couleur de marque : bouton principal, liens, élément actif du menu |
| `accent-hover` | `#5E4DEB` | Survol du bouton principal |
| `accent-edge` | `#4A3BC9` | Épaisseur « Bonbon » sous le bouton principal |
| `accent-soft` | `#E9E5FF` | Fond d'élément sélectionné, survol léger |
| `aurora` | `linear-gradient(120deg, #8B7BFF 0%, #5FC8FF 55%, #6EE7C5 100%)` | Signature futuriste : barres de progression, bouton « + Nouvelle feature », sprint actif |
| `glow` | `0 0 0 4px rgba(108, 92, 245, 0.18), 0 0 24px rgba(95, 200, 255, 0.35)` | Halo de focus et d'élément actif |

### Sémantique

| Nom | Valeur | Rôle |
| --- | --- | --- |
| `danger` | `#D92D55` | Actions destructives, erreurs de formulaire |
| `danger-soft` | `#FFE4EA` | Fond de message d'erreur |
| `danger-edge` | `#A81E3F` | Épaisseur sous le bouton danger |

### Statuts de feature

| Statut | Libellé | Fond | Texte et point | Rôle |
| --- | --- | --- | --- | --- |
| `backlog` | Backlog | `#EEECF5` | `#5E5A7A` | En attente, pas encore planifiée |
| `todo` | À faire | `#DDEEFF` | `#245E9C` | Planifiée, pas commencée |
| `in_progress` | En cours | `#FFF1C7` | `#8A5600` | En cours de réalisation |
| `done` | Terminé | `#D6F5E7` | `#187048` | Livrée |
| `cancelled` | Annulé | `#F6E3E8` | `#8E4459` | Abandonnée |

### Statuts de sprint

| Statut | Libellé | Fond | Texte et point | Rôle |
| --- | --- | --- | --- | --- |
| `planned` | Planifié | `#E9E5FF` | `#5443D9` | En préparation |
| `active` | Actif | `#DDEEFF` + contour `aurora` | `#245E9C` | Sprint en cours, un seul à la fois |
| `completed` | Terminé | `#D6F5E7` | `#187048` | Sprint clos |

### Priorités

| Priorité | Libellé | Fond | Texte et barres | Rôle |
| --- | --- | --- | --- | --- |
| `critical` | Critique | `#FFE1E7` | `#C2254A` | Bloquant, à traiter tout de suite |
| `high` | Haute | `#FFEBD6` | `#A04F00` | Important, prochain sprint |
| `medium` | Moyenne | `#E9E5FF` | `#5443D9` | Valeur par défaut |
| `low` | Basse | `#DDF0FB` | `#1F6E9E` | Quand il y a de la place |
| `nice_to_have` | Bonus | `#F1EFF7` | `#625D84` | Idée à garder sous le coude |

### Couleurs de module

Palette proposée pour le champ `modules.color`. Pastels lumineux, choisis pour rester distincts entre eux et des couleurs de statut.

| Nom | Valeur | Rôle |
| --- | --- | --- |
| `module-lilas` | `#B9A8FF` | Couleur de module |
| `module-menthe` | `#8FE3C0` | Couleur de module |
| `module-peche` | `#FFC29E` | Couleur de module |
| `module-beurre` | `#FFE07A` | Couleur de module |
| `module-ciel` | `#9CD3FF` | Couleur de module |
| `module-rose` | `#FFA8C5` | Couleur de module |
| `module-sauge` | `#B5D99C` | Couleur de module |
| `module-corail` | `#FF9C8A` | Couleur de module |

**Pastille de module (« bille »)** : cercle de 12 px (14 px dans le détail), rempli de la couleur du module avec un reflet en haut à gauche (`radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), transparent 55%)`) et une ombre `0 2px 4px` teintée de la même couleur à 40 %. Le nom du module s'écrit à côté en `ink`, jamais dans la couleur du module.

---

## Typographie

Trois familles Google Fonts, chacune avec un rôle précis.

| Famille | Rôle | Graisses |
| --- | --- | --- |
| **Fredoka** | Titres : ronde et dodue, porte le côté « pâte à modeler » | 500, 600 |
| **Nunito** | Texte, libellés, boutons : ronde et très lisible | 400, 600, 700, 800 |
| **Space Grotesk** | Données : compteurs, dates, effort, pourcentages ; la touche futuriste | 500, 600 |

Les chiffres utilisent toujours `font-variant-numeric: tabular-nums` pour rester alignés.

### Échelle

| Nom | Famille | Taille / interligne | Graisse | Usage |
| --- | --- | --- | --- | --- |
| `display` | Fredoka | 40 / 48 px | 600 | Titre d'écran d'accueil, page de connexion |
| `h1` | Fredoka | 32 / 40 px | 600 | Titre d'écran (Backlog, Sprints…) |
| `h2` | Fredoka | 24 / 32 px | 600 | Titre de feature ou de sprint dans le détail |
| `h3` | Fredoka | 19 / 26 px | 500 | Titre de section, de colonne, de carte |
| `body-lg` | Nunito | 17 / 26 px | 400 | Description d'une feature, objectif d'un sprint |
| `body` | Nunito | 15 / 24 px | 400 | Texte courant, commentaires |
| `body-strong` | Nunito | 15 / 24 px | 700 | Titre de feature dans le backlog, boutons |
| `small` | Nunito | 13 / 20 px | 600 | Badges, métadonnées, messages d'aide |
| `label` | Nunito | 12 / 16 px | 800 | Libellés de champs et en-têtes de colonne ; capitales, espacement de 0,06 em |
| `data-xl` | Space Grotesk | 48 / 52 px | 600 | Gros compteurs (Modules, Équipe, sprint) |
| `data` | Space Grotesk | 14 / 20 px | 500 | Dates, effort (`XS`…`XL`), ratios « 7 / 12 » |

---

## Espacements

Base de **4 px**. On n'utilise que les valeurs de l'échelle.

| Nom | Valeur | Usage type |
| --- | --- | --- |
| `space-1` | 4 px | Écart entre une icône et son texte |
| `space-2` | 8 px | Entre deux badges ; entre deux cartes compactes du backlog |
| `space-3` | 12 px | Rembourrage vertical d'une carte compacte |
| `space-4` | 16 px | Rembourrage horizontal d'une carte compacte ; entre un libellé et son champ + 8 px |
| `space-5` | 20 px | Entre deux champs de formulaire |
| `space-6` | 24 px | Rembourrage d'une carte standard ; gouttière mobile |
| `space-8` | 32 px | Rembourrage d'une modale ; gouttière desktop ; entre deux cartes standard |
| `space-10` | 40 px | Entre le titre d'écran et son contenu |
| `space-12` | 48 px | Entre deux grandes sections d'un écran |
| `space-16` | 64 px | Marges de la page de connexion |

Largeur de contenu maximale : **1200 px**, centrée.

---

## Arrondis

| Nom | Valeur | Usage |
| --- | --- | --- |
| `radius-sm` | 10 px | Badges de priorité, petits éléments internes |
| `radius-md` | 16 px | Champs de formulaire, boutons, menus déroulants |
| `radius-lg` | 20 px | Cartes compactes du backlog |
| `radius-xl` | 32 px | Cartes standard, modales, colonnes du détail de sprint |
| `radius-full` | 999 px | Badges de statut, avatars, pastilles, bouton rond, barres de progression |

Règle : un élément imbriqué a un arrondi plus petit que son parent (rayon intérieur ≈ rayon extérieur − rembourrage).

---

## Relief, lumière et mouvement

C'est ce qui donne l'effet « pâte à modeler ».

| Nom | Valeur | Usage |
| --- | --- | --- |
| `shadow-clay` | `0 12px 28px -10px rgba(76, 60, 170, 0.22), 0 2px 6px rgba(76, 60, 170, 0.06), inset 0 2px 0 rgba(255, 255, 255, 0.9), inset 0 -4px 8px rgba(108, 92, 245, 0.06)` | Cartes standard, modales |
| `shadow-clay-sm` | `0 6px 14px -6px rgba(76, 60, 170, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.9)` | Cartes compactes, badges en relief |
| `shadow-clay-hover` | `0 18px 36px -12px rgba(76, 60, 170, 0.28), 0 2px 6px rgba(76, 60, 170, 0.08), inset 0 2px 0 rgba(255, 255, 255, 0.9)` | Carte survolée |
| `shadow-sunken` | `inset 0 2px 5px rgba(76, 60, 170, 0.12), inset 0 -1px 0 rgba(255, 255, 255, 0.8)` | Champs, piste de progression |
| `edge` | `0 4px 0 <couleur-edge>` | Épaisseur « Bonbon » sous les boutons pleins |

**Mouvement**
- Durée standard **160 ms**, courbe à léger rebond `cubic-bezier(0.34, 1.56, 0.64, 1)`.
- Ouverture de modale **240 ms** : la fenêtre grossit de 96 % à 100 % et apparaît en fondu.
- Respect de `prefers-reduced-motion` : plus de rebond ni de pulsation, seulement des fondus.

---

## Composants

### Bouton

**Anatomie** : texte `body-strong` (Nunito 800 pour les boutons pleins), icône facultative à gauche (18 px, écart `space-2`), arrondi `radius-md`, reflet intérieur clair sur le haut.

| Variante | Fond | Texte | Relief | Usage |
| --- | --- | --- | --- | --- |
| Principal | `accent` | `on-accent` | `edge` en `accent-edge` + reflet `inset 0 1px 0 rgba(255,255,255,0.35)` | Action principale d'un écran : Enregistrer, Créer le sprint |
| Secondaire | `surface` | `accent` | contour 1,5 px `border` + `shadow-clay-sm` | Actions secondaires : Annuler, Modifier |
| Fantôme | transparent | `ink-soft` | aucun ; fond `accent-soft` au survol | Actions discrètes : Retirer du sprint, filtres |
| Danger | `danger` | `on-accent` | `edge` en `danger-edge` | Suppression |
| Flottant « + Nouvelle feature » | `aurora` | `on-accent` | `edge` en `accent-edge` + `glow` léger | Capture rapide, en bas à droite du Backlog |

| Taille | Hauteur | Rembourrage horizontal | Texte |
| --- | --- | --- | --- |
| `sm` | 32 px | 12 px | 13 px |
| `md` (défaut) | 44 px | 20 px | 15 px |
| `lg` | 52 px | 24 px | 16 px |
| Rond (flottant) | 60 × 60 px, `radius-full` | — | icône « + » de 24 px ; s'élargit en pilule avec le libellé au survol |

**États**
- **Survol** : monte de 1 px, fond `accent-hover` pour le principal.
- **Appui** : s'enfonce de 3 px et l'épaisseur passe de 4 px à 1 px, comme une touche pressée.
- **Focus clavier** : `glow`.
- **Désactivé** : opacité 45 %, plus d'épaisseur ni d'ombre, curseur interdit.
- **Chargement** : le texte laisse place à trois points qui rebondissent ; la largeur ne change pas.

### Badge de statut

Pilule `radius-full`, hauteur 26 px, rembourrage horizontal 10 px, texte `small` (Nunito 600). Un **point lumineux** de 8 px précède le libellé, dans la couleur du texte, avec un halo `0 0 6px` de la même couleur à 50 %.

- Couleurs : voir les tableaux *Statuts de feature* et *Statuts de sprint*.
- `in_progress` : le point pulse doucement (2 s, en boucle).
- `cancelled` : dans une carte, le titre de la feature passe en `ink-muted` et barré.
- Sprint `active` : contour de 1,5 px en dégradé `aurora` autour de la pilule.
- Cliquable dans le détail d'une feature : au survol, `shadow-clay-sm` ; au clic, menu des 5 statuts.

### Badge de priorité

Forme volontairement différente du badge de statut pour ne jamais les confondre : rectangle arrondi `radius-sm`, hauteur 26 px, rembourrage horizontal 8 px, texte `small`.

Avant le libellé, un **indicateur à 4 barres** verticales (3 × 10 px, écart 2 px, arrondies) : les barres pleines sont dans la couleur de texte de la priorité, les vides à 25 % d'opacité.

| Priorité | Barres pleines | Particularité |
| --- | --- | --- |
| Critique | 4 | Halo `0 0 10px` corail autour du badge |
| Haute | 3 | — |
| Moyenne | 2 | — |
| Basse | 1 | — |
| Bonus | 0 | Les barres sont remplacées par une petite étincelle « ✦ » |

En vue très compacte (colonnes de sprint), le badge peut n'afficher que les barres, avec le libellé en infobulle.

### Carte

Trois formats, tous sur `surface`.

**Carte standard** : détail d'une feature, formulaires, colonnes de sprint.
- `radius-xl`, rembourrage `space-6`, `shadow-clay`.
- Titre `h3`, écart `space-4` avant le contenu.

**Carte compacte** : une ligne du Backlog.
- `radius-lg`, hauteur 60 px, rembourrage `space-3` / `space-4`, `shadow-clay-sm`, écart `space-2` entre deux cartes.
- Contenu sur une seule ligne, de gauche à droite : bille du module, titre (`body-strong`, coupé par « … » si trop long), badge de statut, badge de priorité, effort (`data`), sprint (`small`, `ink-soft`), avatar de 28 px.
- Survol : monte de 2 px, `shadow-clay-hover`. Ouverte ou sélectionnée : contour de 2 px `accent` + `glow`.

**Carte compteur** : écrans Modules, Équipe et Liste des sprints.
- `radius-xl`, rembourrage `space-6`, `shadow-clay`.
- Bandeau supérieur de 6 px dans la couleur du module (Modules) ou en `aurora` (sprint actif).
- Gros chiffre en `data-xl`, avec son libellé en `label` dessous (« features », « assignées »).
- Pour un sprint : **barre de progression** de 12 px, `radius-full`. La piste est en `surface-sunken` avec `shadow-sunken` ; le remplissage est en `aurora` avec un reflet `inset 0 2px 0 rgba(255,255,255,0.5)`. Le ratio « 7 / 12 terminées » s'affiche à droite en `data`.
- Pour un membre : avatar de 72 px bombé avec liseré blanc de 3 px et `shadow-clay-sm`, prénom et nom en `h3`, email en `small`.

### Champ de formulaire

**Anatomie** : libellé au-dessus (`label`, `ink-soft`), écart `space-2`, puis le champ, puis éventuellement un message d'aide ou d'erreur (`small`, écart `space-1`).

- Champ : hauteur 48 px, `radius-md`, rembourrage horizontal `space-4`, texte `body` en `ink`.
- Au repos, le champ est **creusé** dans la surface : fond `surface-sunken`, `shadow-sunken`, aucune bordure.
- Placeholder en `ink-muted`.
- Champ obligatoire : petit point `accent` de 6 px après le libellé (Titre, Module, dates de sprint).

| État | Apparence |
| --- | --- |
| Survol | Fond un peu plus clair (`#F0EDFC`) |
| Focus | Le champ « remonte » : fond `surface`, ombre creusée remplacée par `glow`, curseur `accent` |
| Erreur | Contour 1,5 px `danger`, message en `danger` sous le champ, précédé d'une icône |
| Désactivé | Opacité 55 %, plus d'ombre |

**Variantes**
- **Zone de texte** (description, commentaire) : hauteur minimale 120 px, s'agrandit avec le contenu, arrondi `radius-md`.
- **Liste déroulante** (module, statut, priorité, sprint, assigné) : chevron à droite ; le menu ouvert est une carte `surface`, `radius-md`, `shadow-clay`. Chaque option affiche son badge ou sa bille de module, l'option survolée a un fond `accent-soft`.
- **Date** : texte en `data`, calendrier dans une carte `radius-xl`, jour sélectionné en pastille `accent` pleine.
