-- =====================================================================
-- 0004 — Date de dernière modification (updated_at)
-- =====================================================================
-- On ajoute à chaque table une colonne updated_at, puis un déclencheur
-- qui la remet à l'heure actuelle à chaque modification d'une ligne.
-- Ainsi on sait toujours quand une feature, un sprint… a changé.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Les colonnes updated_at
-- ---------------------------------------------------------------------
-- Valeur par défaut now() : une nouvelle ligne reçoit l'heure de création.
-- Les lignes déjà présentes reçoivent aussi now() au moment de l'ajout.
-- La colonne accepte null, comme dans la base actuelle.
alter table public.profiles add column updated_at timestamptz default now();
alter table public.modules  add column updated_at timestamptz default now();
alter table public.sprints  add column updated_at timestamptz default now();
alter table public.features add column updated_at timestamptz default now();
alter table public.comments add column updated_at timestamptz default now();


-- ---------------------------------------------------------------------
-- 2. La fonction qui met la date à jour
-- ---------------------------------------------------------------------
-- Elle est appelée juste avant l'enregistrement d'une modification :
-- NEW est la ligne telle qu'elle va être enregistrée, on y écrit l'heure.
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ---------------------------------------------------------------------
-- 3. Un déclencheur set_updated_at par table
-- ---------------------------------------------------------------------
-- BEFORE UPDATE : la fonction tourne avant que la modification soit
-- écrite, pour que la nouvelle date soit enregistrée en même temps.
create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger set_updated_at
  before update on public.modules
  for each row execute function public.update_updated_at();

create trigger set_updated_at
  before update on public.sprints
  for each row execute function public.update_updated_at();

create trigger set_updated_at
  before update on public.features
  for each row execute function public.update_updated_at();

create trigger set_updated_at
  before update on public.comments
  for each row execute function public.update_updated_at();
