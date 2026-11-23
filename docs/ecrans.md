# Écrans et parcours

## Navigation

Présente sur tous les écrans :

- un menu avec **Backlog**, **Sprints**, **Modules** et **Équipe** ;
- la photo de l'utilisateur connecté ;
- un bouton **Déconnexion**.

## 0. Connexion

Email et mot de passe (les membres ont un compte, car `profiles` est relié à `auth.users`).

## 1. Backlog / Liste des features (écran d'accueil)

**On voit :** toutes les features avec titre, module (pastille de couleur), statut, priorité, effort, impact, sprint et personne assignée.

**On fait :**

- filtrer par module, statut, priorité, sprint (dont « sans sprint » = backlog) et personne assignée ;
- rechercher par titre ;
- trier par priorité ou impact ;
- ouvrir une feature ;
- créer une feature.

## 2. Capture rapide / Formulaire de feature (fenêtre par-dessus la liste)

**Obligatoires :** titre et module.

**Facultatifs :** description, priorité (`medium` par défaut), effort, impact (`medium` par défaut), statut (`backlog` par défaut), sprint, personne assignée.

Sert à la fois à créer et à modifier une feature.

## 3. Détail d'une feature

**On voit :** tous ses champs, et ses commentaires (auteur avec photo, date, texte), du plus ancien au plus récent.

**On fait :**

- modifier la feature ;
- changer son statut (`backlog`, `todo`, `in_progress`, `done`, `cancelled`) ;
- l'assigner ;
- la placer dans un sprint ou la renvoyer au backlog ;
- ajouter un commentaire (on tape seulement le texte, l'auteur et la date sont automatiques).

## 4. Liste des sprints

**On voit :** chaque sprint avec objectif, dates, statut (`planned`, `active`, `completed`) et nombre de features (calculé, pas stocké).

**On fait :**

- ouvrir un sprint ;
- créer un sprint (date de début et date de fin obligatoires, objectif en une phrase).

## 5. Détail d'un sprint

**On voit :** objectif, dates, statut, et les features du sprint regroupées par statut.

**On fait :**

- ajouter des features depuis le backlog ;
- retirer une feature (elle retourne au backlog) ;
- changer le statut du sprint ;
- modifier ses dates ou son objectif.

## 6. Modules

**On voit :** chaque module avec sa couleur, sa description et son nombre de features.

**On fait :**

- créer ou modifier un module (nom unique et couleur obligatoires, description facultative) ;
- cliquer sur un module pour voir ses features (écran 1 déjà filtré).

## 7. Équipe

**On voit :** les 4 membres avec photo, prénom, nom, email et nombre de features assignées.

**On fait :**

- cliquer sur un membre pour voir ses features (écran 1 déjà filtré).

## Parcours principaux

| Parcours | Étapes |
| --- | --- |
| Consulter les features d'un sprint | Sprints → clic sur un sprint → Détail du sprint |
| Lire les commentaires d'une feature | Backlog (ou Détail du sprint) → clic sur une feature → Détail de la feature |
| Capturer une idée | Backlog → « + Nouvelle feature » → titre et module → Enregistrer |
| Planifier une feature | Backlog → filtre « sans sprint » → ouvrir la feature → choisir un sprint |
| Commenter une feature | Détail de la feature → écrire le commentaire → Envoyer |
