-- =====================================================================
-- 0003 — Stockage des photos de profil (bucket « avatars »)
-- =====================================================================
-- Supabase Storage range les fichiers dans des « buckets » (des dossiers
-- racine). Chaque fichier est une ligne de la table storage.objects,
-- protégée par la RLS comme nos propres tables.
-- Convention : chaque membre range sa photo dans un dossier qui porte
-- son id, par exemple avatars/<id-du-membre>/photo.png.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Le bucket avatars
-- ---------------------------------------------------------------------
-- public = true : n'importe qui peut afficher une photo avec son URL
-- publique (pratique pour la balise <img>), sans être connecté.
-- Pas de taille maximale ni de types de fichiers imposés (null).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, null, null);


-- ---------------------------------------------------------------------
-- 2. Policies sur storage.objects
-- ---------------------------------------------------------------------
-- La RLS est déjà activée par Supabase sur storage.objects.
-- Les trois policies suivantes limitent un membre connecté à son propre
-- dossier : storage.foldername(name) découpe le chemin du fichier, et
-- [1] est le premier dossier, qui doit être égal à son id.
-- Les noms sont ceux générés par le tableau de bord Supabase.

-- Lire les fichiers de son dossier.
create policy "Give users access to own folder 1oj01fe_0"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'avatars'
    and (select auth.uid()::text) = (storage.foldername(name))[1]
  );

-- Envoyer un fichier dans son dossier.
create policy "Give users access to own folder 1oj01fe_1"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (select auth.uid()::text) = (storage.foldername(name))[1]
  );

-- Remplacer un fichier de son dossier (changer de photo).
create policy "Give users access to own folder 1oj01fe_2"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (select auth.uid()::text) = (storage.foldername(name))[1]
  );
