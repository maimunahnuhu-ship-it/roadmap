# Modèle de données — Application Roadmap

Base de données : **Supabase** (PostgreSQL).

## Tables

### `modules`

| Champ | Type | Contraintes |
|---|---|---|
| `id` | `int8` | PK, identity |
| `name` | `text` | NOT NULL, UNIQUE |
| `color` | `text` | NOT NULL |
| `description` | `text` | — |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` |

### `sprints`

| Champ | Type | Contraintes |
|---|---|---|
| `id` | `int8` | PK, identity |
| `goal` | `text` | — |
| `start_date` | `date` | NOT NULL |
| `end_date` | `date` | NOT NULL |
| `status` | `text` | NOT NULL, DEFAULT `'planned'`, CHECK IN (`'planned'`, `'active'`, `'completed'`) |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` |

### `profiles`

| Champ | Type | Contraintes |
|---|---|---|
| `id` | `uuid` | PK, FK → `auth.users(id)` ON DELETE CASCADE |
| `firstname` | `text` | — |
| `lastname` | `text` | — |
| `email` | `text` | NOT NULL, UNIQUE |
| `avatar_url` | `text` | — |
| `role` | `text` | NOT NULL, DEFAULT `'user'`, CHECK IN (`'user'`, `'admin'`) |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` |

### `features`

| Champ | Type | Contraintes |
|---|---|---|
| `id` | `int8` | PK, identity |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` |
| `title` | `text` | NOT NULL |
| `description` | `text` | — |
| `status` | `text` | NOT NULL, DEFAULT `'backlog'`, CHECK IN (`'backlog'`, `'todo'`, `'in_progress'`, `'done'`, `'cancelled'`) |
| `priority` | `text` | NOT NULL, DEFAULT `'medium'`, CHECK IN (`'critical'`, `'high'`, `'medium'`, `'low'`, `'nice_to_have'`) |
| `effort` | `text` | CHECK IN (`'xs'`, `'s'`, `'m'`, `'l'`, `'xl'`) |
| `impact` | `text` | NOT NULL, DEFAULT `'medium'`, CHECK IN (`'low'`, `'medium'`, `'high'`) |
| `module_id` | `int8` | NOT NULL, FK → `modules(id)` |
| `sprint_id` | `int8` | FK → `sprints(id)` |
| `assigned_to` | `uuid` | FK → `profiles(id)` |

### `comments`

| Champ | Type | Contraintes |
|---|---|---|
| `id` | `int8` | PK, identity |
| `created_at` | `timestamptz` | NOT NULL, DEFAULT `now()` |
| `content` | `text` | NOT NULL |
| `feature_id` | `int8` | NOT NULL, FK → `features(id)` ON DELETE CASCADE |
| `author_id` | `uuid` | NOT NULL, FK → `profiles(id)` |

## Relations

Toutes les relations sont de type **1-n** ; la clé étrangère se trouve du côté « n ».

| Relation | Clé étrangère | Obligatoire ? |
|---|---|---|
| `modules` 1-n `features` | `features.module_id` | Oui |
| `sprints` 1-n `features` | `features.sprint_id` | Non (feature dans le backlog) |
| `profiles` 1-n `features` (assignation) | `features.assigned_to` | Non |
| `features` 1-n `comments` | `comments.feature_id` | Oui |
| `profiles` 1-n `comments` (auteur) | `comments.author_id` | Oui |

## Choix de modélisation

- **Pas de table `backlog`.** Une feature du backlog est simplement une feature dont `sprint_id` est vide (`NULL`). La rattacher à un sprint revient à renseigner ce champ.
- **Pas de table de jonction entre `features` et `sprints`.** Une feature n'appartient qu'à un seul sprint à la fois : une clé étrangère `sprint_id` dans `features` suffit.
- **`profiles` étend `auth.users`.** Le profil partage le même `uuid` que l'utilisateur Supabase Auth. Il est créé automatiquement par un trigger à la création d'un utilisateur, et supprimé avec lui (ON DELETE CASCADE).
- **Dates des sprints en `date`.** Un sprint se planifie au jour près : l'heure n'est pas utile.
- **RLS pas encore activées.** Les tables sont pour l'instant en accès libre (UNRESTRICTED). Les politiques de Row Level Security seront mises en place plus tard.
