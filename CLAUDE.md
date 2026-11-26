# CLAUDE.md — Application Roadmap

## Le projet

**But.** Le produit du client grossit : plus de 200 idées de features, bugs et améliorations sont notées en vrac dans un Notion, sans ordre. Roadmap est une application d'équipe (4 personnes pour l'instant) pour **capturer rapidement** les idées de features, les **ranger par module** (facturation, onboarding, dashboard…), les **prioriser**, puis **planifier leur réalisation par sprints**.

**Fonctionnement.**

- Une **feature** a un titre, une description, une priorité, un effort (facultatif), un impact, un statut, un module (obligatoire), éventuellement un sprint et une personne assignée.
- Chaque **module** a une couleur pour s'y retrouver visuellement.
- Un **sprint** dure une ou deux semaines : dates de début et de fin, objectif en une phrase, statut (planifié, actif, terminé). Une feature sans sprint est dans le **backlog**.
- L'équipe **commente** les features pour garder l'historique des discussions ; chaque commentaire indique son auteur et sa date.
- Les membres se connectent avec leur email et leur mot de passe.

Détails : `docs/brief.md` (besoin), `docs/modele.md` (modèle de données), `docs/ecrans.md` (écrans et parcours).

**Pages attendues.** Toutes les pages, sauf la connexion, affichent le menu (Backlog, Sprints, Modules, Équipe), la photo de l'utilisateur connecté et un bouton Déconnexion.

| Écran | Adresse prévue |
| --- | --- |
| 0. Connexion | `/login` |
| 1. Backlog / liste des features (accueil) | `/` (filtres dans l'adresse, ex. `/?module=3`, `/?sprint=none`) |
| 2. Capture rapide / formulaire de feature | fenêtre par-dessus le backlog ou le détail, pas de page dédiée |
| 3. Détail d'une feature | `/features/[id]` |
| 4. Liste des sprints | `/sprints` |
| 5. Détail d'un sprint | `/sprints/[id]` |
| 6. Modules | `/modules` (clic sur un module → `/?module=[id]`) |
| 7. Équipe | `/equipe` (clic sur un membre → `/?assignee=[id]`) |

## Design

Respecte strictement `docs/design-system.md` (couleurs, typographie, espacements, arrondis, composants). Le prototype de référence est dans `prototype/`.

## Règles de travail

Après chaque fonctionnalité testée, fais un commit sur main avec un message clair. Ne crée jamais de branche. Ne fais jamais de push, je le fais moi-même. Avance étape par étape et explique chaque étape en une phrase simple.

Lis aussi @AGENTS.md (consignes propres à cette version de Next.js).

Tu génères du code en respectant strictement cette stack. Objectif prioritaire : le code doit être lu et compris par des étudiants qui débutent en code. Clarté avant élégance.
Stack

Framework : Next.js (App Router, Server Components par défaut, "use client" uniquement quand nécessaire)
Langage : TypeScript (strict mode). Pas de any ; si un type est vraiment impossible, unknown + narrowing, jamais any
UI : React 19
Styling : Tailwind CSS v4 (utility-first ; thème et tokens définis dans globals.css via @theme, pas de fichier de config JS ; pas de CSS modules ni styled-components)
Composants : shadcn/ui (Radix UI + Tailwind). Utilise les composants existants avant d'en créer. Installe-les via npx shadcn@latest add <component>
Icônes : lucide-react
Formulaires : react-hook-form + zod
Données : Supabase via @supabase/ssr
State serveur : Server Actions (pas de React Query pour ces apps)

Supabase

La base Supabase existe déjà : tu la réutilises, tu ne la (re)crées pas.
Avant d'écrire le moindre code de données, lis le schéma existant (via le MCP Supabase). N'invente jamais de table ni de colonne
Tout changement de schéma passe par un nouveau fichier de migration dans supabase/migrations/.
Reprends exactement les noms de tables et de colonnes existants
Génère les types TypeScript à partir du schéma réel (generate_typescript_types via le MCP, ou des types strictement alignés sur les colonnes existantes) — pas de types inventés
Deux clients séparés : createServerClient côté serveur (lit les cookies) et createBrowserClient côté navigateur, rangés dans lib/supabase/
Lecture/écriture via Server Components et Server Actions par défaut
Clé anon côté client (protégée par RLS). Clé service_role server-only, jamais dans un bundle client
L'introspection du schéma passe par le MCP (outil de dev) ; le code applicatif lit et écrit toujours via @supabase/ssr

Conventions

Structure : app/ pour les routes, components/ pour le réutilisable, lib/ pour les utilitaires
Server Components par défaut ; passe en "use client" seulement pour l'interactivité (state, effects, event handlers). Garde ces composants client petits et en feuille de l'arbre
Place un commentaire en français au-dessus de chaque "use client" qui explique pourquoi ce composant doit être client
cn() (clsx + tailwind-merge) pour composer les classes conditionnelles
Accessibilité : composants sémantiques, attributs ARIA quand pertinent

Lisibilité (audience débutante)

Privilégie la solution correcte la plus simple. Pas d'abstraction prématurée, fichiers courts
Commentaires en français, sobres, qui expliquent le pourquoi plutôt que le quoi

Ce que tu ne fais pas

Pas de CSS inline arbitraire (un style inline n'est toléré que pour une valeur réellement dynamique, ex. une largeur calculée) ni de fichiers .css custom (sauf globals.css)
Pas de librairie UI concurrente (Material UI, Chakra, etc.)
Pas de valeur Tailwind arbitraire hors des tokens définis dans globals.css
Pas de React Query ni de fetch client pour des données qu'un Server Component peut charger
