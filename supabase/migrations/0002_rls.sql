-- =====================================================================
-- 0002 — Sécurité au niveau des lignes (RLS)
-- =====================================================================
-- La RLS (Row Level Security) bloque par défaut tout accès aux lignes
-- d'une table. Chaque policy ci-dessous ouvre un accès précis :
--   - FOR      : l'action concernée (select, insert, update, delete) ;
--   - TO       : le rôle concerné (ici toujours authenticated, donc
--                un visiteur non connecté (anon) ne voit rien) ;
--   - USING    : quelles lignes existantes on peut lire / modifier / supprimer ;
--   - WITH CHECK : à quoi doit ressembler une ligne ajoutée ou modifiée.
-- auth.uid() renvoie l'id de l'utilisateur connecté. On l'écrit
-- (select auth.uid()) pour que Postgres ne le calcule qu'une fois par requête.
-- Les noms des policies sont repris exactement de la base actuelle.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Activation de la RLS sur les 5 tables
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.modules  enable row level security;
alter table public.sprints  enable row level security;
alter table public.features enable row level security;
alter table public.comments enable row level security;


-- ---------------------------------------------------------------------
-- 2. profiles
-- ---------------------------------------------------------------------
-- Tout membre connecté peut voir les profils de l'équipe.
-- (Le nom mentionne « features » mais la policy porte bien sur profiles.)
create policy "Authenticated users can read features"
  on public.profiles
  for select
  to authenticated
  using (true);

-- Chacun ne peut modifier que son propre profil, et sans changer son rôle :
-- le rôle de la ligne modifiée doit rester égal au rôle déjà enregistré.
create policy "Users can update own profile without changing role"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (
    id = (select auth.uid())
    and role = (
      select p.role
      from public.profiles p
      where p.id = (select auth.uid())
    )
  );


-- ---------------------------------------------------------------------
-- 3. modules
-- ---------------------------------------------------------------------
-- Tout membre connecté peut lire les modules.
create policy "Authenticated users can read features"
  on public.modules
  for select
  to authenticated
  using (true);


-- ---------------------------------------------------------------------
-- 4. sprints
-- ---------------------------------------------------------------------
-- Tout membre connecté peut lire les sprints.
create policy "Authenticated users can read features"
  on public.sprints
  for select
  to authenticated
  using (true);


-- ---------------------------------------------------------------------
-- 5. features
-- ---------------------------------------------------------------------
-- Tout membre connecté peut lire les features.
create policy "Authenticated users can read features"
  on public.features
  for select
  to authenticated
  using (true);

-- Seuls les admins peuvent créer une feature.
create policy "Admins can insert features"
  on public.features
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'admin'
    )
  );

-- Un admin, ou la personne assignée, peut modifier la feature.
create policy "Admins or assignees can update features"
  on public.features
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'admin'
    )
    or assigned_to = (select auth.uid())
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'admin'
    )
    or assigned_to = (select auth.uid())
  );

-- Un admin, ou la personne assignée, peut supprimer la feature.
create policy "Admins or assignees can delete features"
  on public.features
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'admin'
    )
    or assigned_to = (select auth.uid())
  );


-- ---------------------------------------------------------------------
-- 6. comments
-- ---------------------------------------------------------------------
-- Tout membre connecté peut lire les commentaires.
-- (Le nom mentionne « features » mais la policy porte bien sur comments.)
create policy "Authenticated users can read features"
  on public.comments
  for select
  to authenticated
  using (true);

-- Tout membre connecté peut ajouter un commentaire.
create policy "Authenticated users can insert comments"
  on public.comments
  for insert
  to authenticated
  with check (true);

-- Seul l'auteur d'un commentaire peut le modifier.
create policy "Authors can update their own comments"
  on public.comments
  for update
  to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));
