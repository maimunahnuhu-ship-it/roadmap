# Sécurité de l'application Roadmap

Ce document décrit qui a le droit de faire quoi dans Roadmap. Il repose sur les **policies RLS** (Row Level Security) réellement en place dans la base Supabase.

La RLS est activée sur les cinq tables : `profiles`, `modules`, `sprints`, `features` et `comments`. Pour chaque ligne lue ou écrite, la base vérifie elle-même qui fait la demande. Une action qu'aucune policy n'autorise est refusée.

## 1. Les rôles

| Rôle | Qui c'est | Comment la base le reconnaît |
| --- | --- | --- |
| **Visiteur** | Personne non connectée | Rôle Postgres `anon` |
| **Membre** | Personne connectée, `role = 'user'` dans `profiles` | Rôle Postgres `authenticated` + `profiles.role = 'user'` |
| **Admin** | Personne connectée, `role = 'admin'` dans `profiles` | Rôle Postgres `authenticated` + `profiles.role = 'admin'` |

- **Le rôle métier est stocké dans `profiles.role`.** Les seules valeurs possibles sont `user` (par défaut) et `admin`, grâce à la contrainte `profiles_role_check`.
- **Le front ne décide jamais du rôle.** Les policies relisent `profiles.role` dans la base, à partir de l'identifiant du compte connecté (`auth.uid()`). L'app ne fait qu'afficher le rôle.
- **Un utilisateur ne peut pas modifier son propre rôle.** La policy « Users can update own profile without changing role » lui permet de modifier sa propre ligne, à une condition : la valeur de `role` doit rester identique à celle déjà enregistrée.
- **Le visiteur n'a aucune policy.** Il ne peut rien lire ni rien écrire, même si le rôle `anon` a des droits (GRANT) sur les tables. Avec la RLS, un droit sans policy ne donne accès à aucune ligne.

## 2. Qui peut faire quoi

| Table | Lire | Créer | Modifier | Supprimer |
| --- | --- | --- | --- | --- |
| **profiles** | Tout membre connecté | Personne (le profil est créé automatiquement à l'inscription) | Chacun son propre profil, sans changer son rôle | Personne |
| **modules** | Tout membre connecté | Personne | Personne | Personne |
| **sprints** | Tout membre connecté | Personne | Personne | Personne |
| **features** | Tout membre connecté | Les admins | Les admins, ou la personne assignée à la feature | Les admins, ou la personne assignée à la feature |
| **comments** | Tout membre connecté | Tout membre connecté | Seulement l'auteur du commentaire | Personne |

« Tout membre connecté » inclut les admins. Le visiteur non connecté n'a accès à rien.

Le profil est créé automatiquement par le trigger `on_auth_user_created`, qui appelle la fonction `handle_new_user`. Cette fonction est en `SECURITY DEFINER` : elle s'exécute avec les droits de son créateur et n'a donc pas besoin de policy pour écrire dans `profiles`.

## 3. Les limites connues

- **Personne ne peut modifier les sprints ni les modules depuis l'app.** Ces deux tables n'ont qu'une policy de lecture. Créer un sprint, changer ses dates ou son statut, créer ou modifier un module : tout cela n'est possible que depuis le tableau de bord Supabase. L'app garde ces boutons, mais affiche un message de refus.
- **Un commentaire ne peut pas être supprimé.** Aucune policy ne l'autorise, et l'app ne propose pas ce bouton. Exception : supprimer une feature supprime aussi ses commentaires, grâce à la clé étrangère `ON DELETE CASCADE`.
- **Un membre ne peut pas réassigner sa feature à quelqu'un d'autre.** Dans la policy de modification des features, le `WITH CHECK` vérifie aussi la ligne *après* le changement. Une fois la feature assignée à une autre personne, le membre n'en est plus l'assigné, donc la base refuse. Un admin, lui, peut réassigner.
- **L'auteur d'un nouveau commentaire n'est pas vérifié par la base.** La policy de création des commentaires accepte toute ligne (`WITH CHECK (true)`). L'app remplit toujours `author_id` avec le compte connecté. Mais un membre qui appellerait l'API Supabase directement pourrait signer un commentaire au nom d'un autre. Ce point est à vérifier pendant la red team.
- **Les policies de lecture de `comments`, `modules`, `profiles` et `sprints` portent le nom « Authenticated users can read features ».** Elles s'appliquent bien à leur propre table : seul le nom est trompeur.

## 4. Le front

L'interface cache les boutons selon les mêmes règles que la base. Ces règles sont regroupées dans [`lib/permissions.ts`](../lib/permissions.ts) :

- `isAdmin` : boutons « Nouvelle feature » et capture rapide ;
- `canEditFeature` (admin ou personne assignée) : boutons Modifier et Supprimer, changements rapides du détail, glisser-déposer dans le Kanban, ajout et retrait d'une feature dans un sprint ;
- `canEditComment` (auteur) : bouton Modifier d'un commentaire.

Le rôle est lu côté serveur dans `profiles.role`, par `getCurrentProfile()` dans [`lib/queries.ts`](../lib/queries.ts).

**C'est du confort, pas de la sécurité.** Cacher un bouton évite de proposer une action qui serait refusée, mais n'empêche personne d'appeler l'API directement. La vraie protection est la RLS dans la base.

Quand la base refuse une écriture, la Server Action affiche un message clair au lieu de faire comme si ça avait marché. Un refus peut être une erreur, ou une écriture qui ne touche aucune ligne, comme le fait souvent la RLS. C'est la fonction `checkWrite` dans [`lib/action-result.ts`](../lib/action-result.ts) qui gère les deux cas.

## 5. Tests réalisés

Les tests ont été faits avec deux comptes :

- **Marie Laurent**, `role = 'user'` ;
- **Sarah Kessler**, `role = 'admin'`.

| # | Scénario | Compte | Résultat attendu | Résultat |
| --- | --- | --- | --- | --- |
| 1 | Créer une feature (bouton « Nouvelle feature » ou capture rapide) | Sarah | Les boutons sont visibles et la feature est créée | ✅ Validé |
| 2 | Chercher les boutons de création | Marie | « Nouvelle feature » et la capture rapide sont absents | ✅ Validé |
| 3 | Modifier puis supprimer (avec confirmation) une feature assignée à quelqu'un d'autre | Sarah | Modification enregistrée, suppression faite, retour au Backlog | ✅ Validé |
| 4 | Modifier une feature assignée à Marie (statut, sprint, formulaire Modifier) | Marie | Modifications enregistrées | ✅ Validé |
| 5 | Ouvrir une feature assignée à quelqu'un d'autre | Marie | Lecture seule : pas de Modifier ni de Supprimer, pas de changements rapides | ✅ Validé |
| 6 | Kanban : glisser des cartes d'une colonne à l'autre | Marie, puis Sarah | Marie ne déplace que ses cartes, Sarah les déplace toutes | ✅ Validé |
| 7 | Modifier un commentaire | Marie | « Modifier » n'apparaît que sur ses propres commentaires, et la modification est enregistrée | ✅ Validé |
| 8 | Page « Mon profil » : changer son prénom et son nom | Marie | Nom mis à jour dans le menu, rôle affiché en texte seul, impossible à modifier | ✅ Validé |

## 6. Attaques testées

*À remplir pendant la red team.*

| # | Attaque tentée | Compte | Résultat attendu | Résultat |
| --- | --- | --- | --- | --- |
| | | | | |
