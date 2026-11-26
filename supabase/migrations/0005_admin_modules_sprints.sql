-- =====================================================================
-- 0005 — Les admins gèrent les modules et les sprints
-- =====================================================================
-- Jusqu'ici, modules et sprints n'avaient qu'une policy de lecture :
-- personne ne pouvait les créer ni les modifier depuis l'app.
-- Cette migration ouvre la création (INSERT) et la modification (UPDATE)
-- aux seuls admins. Les membres gardent uniquement la lecture.
-- Aucune suppression n'est autorisée pour l'instant (pas de policy DELETE).
--
-- Le rôle est relu dans profiles.role à partir de auth.uid(), comme pour
-- les features (0002_rls.sql). On ne fait jamais confiance au JWT pour le
-- rôle : seule la base sait qui est admin.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. modules
-- ---------------------------------------------------------------------
-- Seuls les admins peuvent créer un module.
create policy "Admins can insert modules"
  on public.modules
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

-- Seuls les admins peuvent modifier un module.
-- USING : quelles lignes l'admin peut viser ; WITH CHECK : la ligne
-- modifiée doit toujours être écrite par un admin.
create policy "Admins can update modules"
  on public.modules
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'admin'
    )
  );


-- ---------------------------------------------------------------------
-- 2. sprints
-- ---------------------------------------------------------------------
-- Seuls les admins peuvent créer un sprint.
create policy "Admins can insert sprints"
  on public.sprints
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

-- Seuls les admins peuvent modifier un sprint (dates, objectif, statut).
create policy "Admins can update sprints"
  on public.sprints
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.role = 'admin'
    )
  );
