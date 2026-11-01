---
title: L'écran, partie par partie
summary: Visite de chaque barre et de chaque panneau de CivilCraft par son nom à l'écran, de la barre d'outils à la barre d'état.
keywords: interface, écran, barre d'outils, panneaux, propriétés, barre d'état, vue en profil, disposition, visite, ui
from: 76272010
---

CivilCraft n'a qu'un seul écran. Pas d'onglets, pas de dispositions. Les panneaux latéraux peuvent être déplacés, flottants ou placés dans une fenêtre à part : voir [Organiser les panneaux et utiliser un second moniteur](common:arrange-panels). De haut en bas et de gauche à droite :

- la **barre d'application** (marque CadCraft, nom de l'application, version, À propos, mode d'écran, Aide, Enregistrer pour le hors ligne, Papier et Objet)
- la **barre d'outils** avec sept groupes de boutons
- le **panneau de gauche** : Site, Points, Surface, Affichage et, une fois que vous en importez, Couches SIG
- le **plan** au milieu, avec la **vue en profil** en dessous quand elle est ouverte
- le **panneau de droite** : Propriétés de ce qui est sélectionné
- la **barre d'état** tout en bas

## Barre d'application

La fine barre tout en haut appartient au site CadCraft, pas à CivilCraft lui-même.

- Le menu de version indique quelle version vous utilisez.
- {{ui:À propos de CivilCraft}} ouvre la page de l'application sur le site.
- {{ui:Plein écran}} fait défiler les modes d'écran : plein écran, puis plein écran avec les barres masquées, puis retour à la normale. {{key:Ctrl+Shift+F}} fait la même chose sur toutes les plateformes, y compris sur Mac (c'est la touche Contrôle, pas Commande). Avec les barres masquées, amenez le pointeur sur le bord supérieur pour les faire revenir.
- {{ui:Aide}} (ou {{key:F1}}) ouvre cette aide dans un panneau latéral ; {{key:F1}} ou {{key:Esc}} la ferme.
- {{ui:Enregistrer pour le hors ligne}} conserve CivilCraft dans ce navigateur pour qu'il s'ouvre sans connexion ; le bouton affiche ensuite {{ui:Prêt hors ligne}}. Voir [Fichiers que vous pouvez ouvrir, enregistrer et exporter](topic:files#online-and-offline).
- {{ui:Papier}} et {{ui:Objet}} basculent entre un thème clair et un thème sombre. Le plan et le profil suivent le thème ; les PDF s'impriment toujours sur fond blanc.

## Barre d'outils

Chaque groupe porte une petite étiquette au-dessus de ses boutons. Survolez un bouton pour voir son infobulle et sa touche.

| Groupe | Boutons | Ce qu'ils font |
|---|---|---|
| Fichier | {{ui:Nouveau}}, {{ui:Ouvrir}}, {{ui:Enregistrer}} | Repartir de zéro, ouvrir un fichier de points, un LandXML ou un projet, enregistrer le projet sous forme de téléchargement |
| Exporter | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Écrire du LandXML 1.2, un DXF R12 ou un DWG du plan, ou tracer le plan en PDF |
| Surface | {{ui:Ligne de rupture}}, {{ui:Contour}} | Dessiner une ligne de rupture à travers des points topographiques ; dessiner le contour extérieur |
| Conception | {{ui:Tracé}}, {{ui:Plateforme}}, {{ui:Canalisations}}, {{ui:Profil}} | Dessiner un tracé en plan, une plateforme, un tronçon de canalisation ; afficher ou masquer la vue en profil |
| Édition | {{ui:Annuler}}, {{ui:Rétablir}}, {{ui:Copier}}, {{ui:Coller}}, {{ui:Plus}} | Annuler, rétablir, copier et coller des points topographiques ; {{ui:Plus}} contient Couper, Coller à la même position, Dupliquer, Supprimer, Sélectionner tous les points et Désélectionner tout |
| SIG | {{ui:Coordonnées}}, {{ui:Importer}}, {{ui:Exporter}}, {{ui:Carte}} | Définir le système de coordonnées, importer et exporter des fichiers SIG, afficher des couches cartographiques sous le plan |
| Vue | {{ui:Sélectionner}}, {{ui:Cadrer}}, {{ui:3D}} | Choisir et déplacer des éléments ; zoomer pour tout voir ; afficher le site en 3D ([Voir le site en 3D](topic:site-3d)) |

Un outil de dessin reste enfoncé tant qu'il est actif. Cliquer de nouveau dessus, appuyer sur {{key:Esc}} ou sur {{key:V}} ramène à {{ui:Sélectionner}}. {{ui:Annuler}}, {{ui:Rétablir}}, {{ui:Copier}} et les éléments de {{ui:Plus}} sont grisés quand ils ne peuvent pas agir ; l'infobulle en donne la raison (par exemple « Select survey points first »). Chaque bouton est décrit dans [Référence de la barre d'outils](topic:toolbar).

Sur une fenêtre étroite, la barre d'outils défile latéralement.

## Panneau de gauche

### Site

- **Nom** : le nom du projet. Il nomme chaque fichier que vous enregistrez ou exportez et s'imprime dans le bandeau de titre du PDF.
- **Unités** : {{ui:pieds US}} ou {{ui:Mètres}}. Cela dit ce que les nombres signifient. Le changer ne convertit **pas** les coordonnées ; voir [Unités, points kilométriques et formats de nombres](topic:units-and-stations).

### Points

Vide, il vous explique comment ouvrir un fichier de points. Avec des points, il affiche le nom du fichier, le nombre de points et combien ont une altitude, puis un tableau de **groupes de points** : une ligne par premier mot de la description (GRD, FL, TBS …), avec un compte et un choix **Surface** :

- {{ui:Points}} : les points entrent dans la surface (valeur par défaut de chaque groupe).
- {{ui:Ligne de rupture}} : les points du groupe sont reliés, dans l'ordre des numéros de point, en une seule ligne de rupture.
- {{ui:Écarté}} : le groupe n'intervient pas dans la surface.

### Surface

Les données du terrain existant : points, triangles, altitudes la plus basse et la plus haute, altitude moyenne, aire en 2D et en 3D, lignes de rupture et présence ou non d'un contour. Sous ces données, un cadre énumère tout ce que le constructeur de surface a dû corriger ou n'a pas pu faire. Puis :

- **Plus long bord extérieur** : 0 conserve tous les triangles extérieurs ; un nombre retire à l'extérieur les triangles longs et minces.
- Des liens qui apparaissent quand ils s'appliquent : {{ui:Retirer le contour}}, {{ui:Retirer les lignes de rupture dessinées}} et, pour une surface lue depuis un LandXML, {{ui:Reconstruire la surface à partir des points}}.

### Affichage

- **Surface** : {{ui:Terrain existant}} ou {{ui:Projet (terrassé)}}. La seconde est disponible dès qu'une plateforme ou un corridor est terrassé sans problème.
- **Courbes tous les**, **Maîtresses tous les** et **Tranches** (le nombre de tranches de couleur).
- Cases à cocher : {{ui:Courbes de niveau}}, {{ui:Cotes des courbes de niveau}}, {{ui:Triangles}}, {{ui:Tranches d'altitude}}, {{ui:Flèches de pente}}, {{ui:Points}}, {{ui:Libellés de points}}, {{ui:Lignes de rupture}}, {{ui:Bord de la surface}}, {{ui:Canalisations}}.
- Une légende des altitudes des tranches apparaît quand les tranches sont activées.

Les paramètres d'affichage sont enregistrés avec le projet mais ne sont pas des étapes d'annulation : {{key:Mod+Z}} ne décoche jamais une case.

## Plan

Le plan montre les points, la surface et tout ce que vous concevez, en vue en plan avec le nord en haut. La molette zoome au niveau du pointeur, faire glisser dans le vide déplace la vue. La liste complète se trouve dans [Touches et souris](topic:keyboard).

- Sur un projet vide, un cadre intitulé **Commencez par des points topographiques** énumère les premières étapes et propose {{ui:Ouvrir le site exemple}}.
- Tant qu'un outil de dessin est actif, une indication en haut du plan dit où cliquer et comment terminer.
- Faire glisser un fichier sur le plan affiche « Déposez un fichier de points, un LandXML ou un projet ».
- Les éléments sélectionnés sont mis en évidence. Un tracé en plan ou une plateforme sélectionné affiche des poignées carrées à ses PI ou à ses angles ; un ouvrage sélectionné affiche une poignée. Faites glisser une poignée pour la déplacer.
- Les points topographiques sélectionnés sont entourés d'un anneau. {{key:Shift}} et un clic ajoute ou retire un point ; {{key:Shift}} et un glissement dessinent un rectangle (ou, en tournant autour d'eux, un lasso) qui ajoute les points qu'il contient. Voir [Sélectionner, copier et coller des points topographiques](topic:copy-paste-points).

## Vue en profil

Appuyez sur {{key:R}} ou cliquez sur {{ui:Profil}} pour l'ouvrir sous le plan. Sa barre contient :

- une liste de tracés en plan (activée quand il y en a deux ou plus)
- {{ui:Ajouter des PIV}} : tant que le bouton est enfoncé, un clic dans le profil ajoute un PIV ({{key:I}} le bascule)
- un affichage du point kilométrique, du terrain, de l'altitude de projet, de la pente et du déblai ou remblai sous le pointeur
- un bouton de fermeture

Le profil montre le terrain existant, le profil de projet, les pentes de chaque alignement droit, le point kilométrique et l'altitude de chaque PIV, le L et le K de chaque courbe verticale avec son BVC et son EVC, les points hauts et bas, et l'exagération verticale. Il s'ajuste toujours à tout le tracé : il ne zoome ni ne se déplace. Déplacer le pointeur le long du profil place un point sur le tracé dans le plan.

## Panneau de droite : Propriétés

Son titre dit ce qu'il montre.

- **Projet** (rien de sélectionné) : les tracés en plan et les plateformes sous forme de liens, le bloc **Mouvements de terres** et le bloc **Réseau de canalisations** avec ses règles et ses problèmes.
- **Tracé en plan** : nom, point kilométrique de départ, longueur, tableau des PI, courbes, tableau des PIV du profil de projet et ses données, et paramètres de **Corridor**.
- **Plateforme** : nom, altitude, pentes de déblai et de remblai, aire, données de raccordement et mouvements de terres.
- **Ouvrage** ou **Canalisation** : dimensions, tampons, radiers, pente, recouvrement et problèmes éventuels.
- **Point** et son numéro : les coordonnées, l'altitude, la description et le groupe du point (lecture seule).

Les champs prennent effet quand vous appuyez sur {{key:Enter}} ou quittez le champ. Une valeur refusée est marquée comme non valide et rien ne change.

## Barre d'état

- **E** et **N** : abscisse (Est) et ordonnée (Nord) sous le pointeur.
- Altitude du **terrain** à cet endroit (et **terrassé** là où une plateforme ou un corridor l'a modifiée), ou « Hors de la surface ».
- Le tracé en plan le plus proche (ou celui qui est sélectionné) avec le **PK** et le décalage (**G** ou **D**) sous le pointeur.
- À droite, des messages : ce qui vient de se passer, ou pourquoi quelque chose a été refusé. Un message s'efface de lui-même au bout de quelques secondes.

## Boîtes de dialogue

- **Importer des points** : s'ouvre avec chaque fichier de points. Voir [Importer des points topographiques](topic:import-points).
- **Tracer le plan en PDF** : voir [Tracer le plan en PDF](topic:plot-pdf).
- **Modifications non enregistrées** : demande confirmation avant que {{ui:Nouveau}} ou l'ouverture d'un projet ou d'un fichier LandXML ne jette un travail non enregistré. {{ui:Enregistrer une copie}} télécharge d'abord le projet.

## Petits écrans

Jusqu'à 760 pixels de large, par exemple sur un téléphone, le plan garde l'écran : la barre d'outils tient sur une ligne qui défile latéralement, et les panneaux s'ouvrent comme des feuilles depuis une barre en bas. {{ui:Outils}} masque la barre d'outils et {{ui:Déplacer}} la place en bas.
