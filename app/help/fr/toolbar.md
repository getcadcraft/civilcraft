---
title: Référence de la barre d'outils
summary: Chaque bouton de la barre d'outils de CivilCraft, ce qu'il fait, sa touche, et quand il est grisé ou refuse d'agir.
keywords: barre d'outils, boutons, commandes, outils, fichier, exporter, surface, conception, édition, affichage, menu
from: 4c4352bc
---

La barre d'outils occupe le haut de l'application en sept groupes. Chaque bouton affiche son info-bulle et sa touche quand vous passez la souris dessus.

## Fichier

| Bouton | Touche | Ce qu'il fait |
|---|---|---|
| {{ui:Nouveau}} | aucune | Crée un projet vide. Demande d'abord s'il y a des modifications non enregistrées. |
| {{ui:Ouvrir}} | {{key:Mod+O}} | Ouvre un fichier de points (CSV, TXT), un LandXML ou un projet CivilCraft. |
| {{ui:Enregistrer}} | {{key:Mod+S}} | Télécharge le projet sous `<name>.civilcraft.json`. |

## Exporter

| Bouton | Touche | Ce qu'il fait |
|---|---|---|
| {{ui:LandXML}} | aucune | Télécharge `<name>.xml` : points, surfaces, tracés, profils et réseau de canalisations en LandXML 1.2. « Rien à exporter pour l'instant. » quand le projet est vide. |
| {{ui:DXF}} | aucune | Télécharge `<name>.dxf` : les linéaires du plan en DXF R12. |
| {{ui:PDF}} | {{key:Mod+P}} | Ouvre **Tracer le plan en PDF**. « Rien à tracer pour l'instant. » quand le projet est vide. |

## Surface

| Bouton | Touche | Ce qu'il fait |
|---|---|---|
| {{ui:Ligne de rupture}} | {{key:B}} | Cliquez les points topographiques dans l'ordre, {{key:Enter}} pour terminer. La ligne de rupture prend les altitudes des points. |
| {{ui:Contour}} | {{key:O}} | Cliquez les angles du contour extérieur, {{key:Enter}} pour terminer. Remplace tout contour existant. |

Les deux affichent « Il n'y a pas encore de surface : ouvrez d'abord des points topographiques. » quand il n'y a pas de surface.

## Conception

| Bouton | Touche | Ce qu'il fait |
|---|---|---|
| {{ui:Tracé en plan}} | {{key:A}} | Cliquez les PI dans l'ordre, {{key:Enter}} pour terminer. |
| {{ui:Plateforme}} | {{key:G}} | Cliquez les angles de la plateforme, {{key:Enter}} pour terminer. Comme les outils de surface, il avertit quand il n'y a pas de surface ; une plateforme ne se terrasse que sur une surface. |
| {{ui:Canalisations}} | {{key:P}} | Cliquez les regards de l'amont vers l'aval (cliquez sur un regard existant pour le rejoindre), {{key:Enter}} pour terminer. |
| {{ui:Profil}} | {{key:R}} | Affiche ou masque la vue de profil sous le plan. |

## Édition

| Bouton | Touche | Ce qu'il fait |
|---|---|---|
| {{ui:Annuler}} | {{key:Mod+Z}} | Annule la dernière modification (jusqu'à 200). Grisé quand il n'y a rien à annuler. |
| {{ui:Rétablir}} | {{key:Mod+Y}} | Rétablit ce qui a été annulé. Grisé quand il n'y a rien à rétablir. |
| {{ui:Copier}} | {{key:Mod+C}} | Copie les points topographiques sélectionnés et les met dans le presse-papiers sous forme de lignes de points qu'un tableur peut lire. Grisé tant qu'aucun point n'est sélectionné. |
| {{ui:Coller}} | {{key:Mod+V}} | Colle des points : ils suivent le pointeur, et un clic les pose avec des numéros qu'aucun autre point n'a. Les lignes de points copiées dans un tableur se collent aussi. |
| {{ui:Plus}} | aucune | Ouvre le menu ci-dessous. |

Le menu {{ui:Plus}} :

| Élément | Touche | Ce qu'il fait |
|---|---|---|
| {{ui:Couper}} | {{key:Mod+X}} | Copie les points sélectionnés puis les supprime (une étape d'annulation). |
| {{ui:Copier}} | {{key:Mod+C}} | Comme le bouton {{ui:Copier}}. |
| {{ui:Coller}} | {{key:Mod+V}} | Comme le bouton {{ui:Coller}}. |
| {{ui:Coller à place}} | {{key:Mod+Shift+V}} | Colle les points à leurs propres coordonnées, avec des numéros qu'aucun autre point n'a. |
| {{ui:Dupliquer}} | {{key:Mod+D}} | Une copie des points sélectionnés suit le pointeur ; cliquez à l'endroit voulu. Le presse-papiers n'est pas modifié. |
| {{ui:Supprimer}} | {{key:Delete}} | Supprime les points topographiques sélectionnés, ou le tracé, la plateforme, le regard (avec ses canalisations), la canalisation ou le PIV sélectionné. |
| {{ui:Tout sélectionner (points)}} | {{key:Mod+A}} | Sélectionne chaque point topographique. |
| {{ui:Ne rien sélectionner}} | {{key:Esc}} | Vide la sélection. |

Un élément qui ne peut pas agir pour l'instant est grisé, et son info-bulle indique pourquoi. Détails : [Sélectionner, copier et coller des points topographiques](topic:copy-paste-points).

L'annulation couvre les modifications de la conception, des réglages de surface et des points topographiques (coller, couper, dupliquer, supprimer). Elle ne couvre pas les réglages d'affichage, et ouvrir ou importer un fichier la vide.

## SIG

| Bouton | Touche | Ce qu'il fait |
|---|---|---|
| {{ui:Coordonnées}} | aucune | Ouvre la boîte de dialogue **Système de coordonnées** : indiquez le système du projet, ou utilisez des coordonnées terrain ou locales. Voir [Définir le système de coordonnées du projet](topic:coordinate-systems) et [Coordonnées terrain et locales](topic:ground-and-local-coordinates). |
| {{ui:Importer}} | aucune | Importe des données SIG : shapefiles, GeoJSON, GeoPackage, grilles d'altitude et LiDAR. Voir [Importer des données SIG](topic:gis-import). |
| {{ui:Exporter}} | aucune | Exporte les données de récolement pour un service SIG. Voir [Exporter les données de récolement pour le SIG](topic:gis-export). |
| {{ui:Analyser}} | aucune | Ouvre le panneau d'analyse SIG : tampon, superposition, jointure spatiale, sélection par attribut, mesure. Voir [Analyser les couches SIG](topic:gis-analysis). |
| {{ui:Table attributaire}} | aucune | Dans Surface › Plus. Ouvre la table attributaire d'une couche SIG : trier, filtrer, sélectionner, modifier, ajouter des champs, calculer, enregistrer en CSV. Voir [Utiliser la table attributaire d'une couche](topic:gis-table). |
| {{ui:Carte}} | aucune | Ouvre la boîte de dialogue **Couches cartographiques** : une image géoréférencée, ou des serveurs de cartes que vous ajoutez, dessinés sous le plan. Voir [Afficher des couches cartographiques sous le plan](topic:map-layers). |

Les outils SIG se chargent la première fois que vous utilisez l'un de ces boutons, ouvrez un fichier SIG, ou ouvrez un projet qui a un système de coordonnées ou des couches SIG.

## Affichage

| Bouton | Touche | Ce qu'il fait |
|---|---|---|
| {{ui:Sélectionner}} | {{key:V}} ou {{key:Esc}} | Cliquez pour sélectionner tracés, plateformes, regards, canalisations et points ({{key:Shift}} avec un clic ou un glisser ajoute des points) ; faites glisser les poignées pour déplacer les PI, les angles des plateformes et les regards. |
| {{ui:Ajuster}} | {{key:F}} | Fait un zoom sur le plan pour montrer la surface, les points, les tracés et les plateformes (en vue 3D : affiche tout). |
| {{ui:3D}} | {{key:D}} | Affiche le site en 3D par-dessus le plan, ou revient au plan. La barre au-dessus de la vue 3D règle la vue, l'exagération, la couleur et ce qui s'affiche, et exporte en GLB ou OBJ. Voir [Voir le site en 3D](topic:site-3d). |

## Boutons des panneaux

| Bouton | Où | Ce qu'il fait |
|---|---|---|
| {{ui:Ouvrir le site d'exemple}} | La zone sur un plan vide | Charge le levé d'exemple (nécessite une connexion, sauf si CivilCraft est enregistré pour un usage hors ligne) |
| {{ui:Retirer le contour}} | Panneau de gauche, Surface | Retire le contour extérieur |
| {{ui:Retirer les lignes de rupture dessinées}} | Panneau de gauche, Surface | Supprime chaque ligne de rupture dessinée avec l'outil (pas les groupes de lignes de rupture) |
| {{ui:Reconstruire la surface à partir des points}} | Panneau de gauche, Surface (surface LandXML uniquement) | Abandonne le TIN LandXML et construit à partir des points ; ne peut pas être annulé |
| {{ui:Commencer depuis le terrain}} | Panneau de droite, Tracé en plan | Démarre un profil projet avec un PIV sur le terrain à chaque extrémité |
| {{ui:Vue de profil}} | Panneau de droite, Tracé en plan | Ouvre la vue de profil de ce tracé |
| {{ui:Ajouter des PIV}} | Barre du profil | Tant qu'il est enfoncé, un clic dans le profil ajoute un PIV |
| {{ui:Fixer chaque fil d'eau selon les règles}} | Panneau de droite, Réseau de canalisations | Fixe les fils d'eau de toutes les canalisations selon les règles |
| {{ui:Fixer ses fils d'eau selon les règles}} | Panneau de droite, Canalisation | Fixe les fils d'eau de cette canalisation selon les règles |
