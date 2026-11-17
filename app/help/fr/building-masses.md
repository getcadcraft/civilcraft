---
title: Dessiner des volumes de bâtiment sur un site
summary: Dessiner un volume de bâtiment sur une parcelle, lui donner des étages et une hauteur d'étage, voir sa surface de plancher brute, choisir comment il s'installe sur un terrain en pente, pousser et tirer sa hauteur en 3D, et l'envoyer à BimCraft ou l'enregistrer en fichier IFC.
keywords: volume, massing, volume de bâtiment, emprise, étages, hauteur d'étage, surface de plancher brute, GFA, pente, soubassement, déblai et remblai, pousser tirer, 3D, étude de site, conception préliminaire, IFC, développer, BimCraft, A-MASS
from: e5a67c16
---

Un volume de bâtiment est une emprise, un nombre d'étages et une hauteur d'étage : la question préliminaire « quelle surface de bâtiment tient ici, et que fait-elle au terrain ? ». Les volumes apparaissent sur le plan avec leur nom, leur nombre d'étages et leur surface de plancher brute, passent dans le tracé PDF et dans les exports DWG et DXF sur les calques `A-MASS` et `A-MASS-TEXT`, et sont enregistrés dans le fichier de projet.

## Dessiner un volume

1. Dans **Propriétés**, sous **Volumes de bâtiment**, cliquez sur **Dessiner un volume**. (Il est aussi dans le menu **Plus** de la barre d'outils, à côté de **Surface**.)
2. Cliquez sur les angles de l'emprise. Un clic près d'un angle de parcelle ou d'un point de levé prend l'emplacement exact de ce point.
3. Recliquez sur le premier angle, ou appuyez sur {{key:Enter}}, pour terminer. {{key:Backspace}} retire le dernier angle ; {{key:Esc}} arrête.

Un nouveau volume a trois étages et une hauteur d'étage de 12 ft (3.6 m), et appartient à la parcelle dans laquelle se trouve son centre.

## Étages, hauteur et surface

Cliquez sur un volume pour modifier son **Nom**, son **Usage**, ses **Étages**, sa **Hauteur d'étage** et sa **Parcelle**. **Hauteur** est égale aux étages multipliés par la hauteur d'étage : saisissez une hauteur et le nombre d'étages devient le nombre entier le plus proche (jamais moins d'un). **Emprise** et **Surface de plancher brute** (emprise multipliée par les étages) sont calculées pour vous.

## Sur terrain en pente

Le terrain sous un volume est lu depuis la surface : terrain existant, ou terrain terrassé lorsque vous avez choisi **Terrain projeté (terrassé)**. **Sur terrain en pente** indique où se place le rez-de-chaussée :

- **Par paliers** : à la moyenne du terrain sous l'emprise. Le côté bas est remblayé jusqu'à ce niveau et le côté haut est déblayé ; les deux se compensent presque.
- **Soubassement** : au point le plus haut du terrain. Une base pleine remblaie le côté bas.
- **Déblai** : au point le plus bas du terrain. Le côté haut est déblayé dans la colline.

Propriétés affiche l'étendue du terrain sous le volume, le **Niveau du rez-de-chaussée**, et le volume de remblai et de déblai entre le terrain et ce niveau. Un point de l'emprise situé hors de la surface est exclu, et Propriétés indique combien.

## Dans la vue 3D

Les volumes sont dessinés dans la vue 3D du site, avec un trait autour de chaque étage et leurs noms au-dessus du toit. **Afficher** comporte une case à cocher **Volumes de bâtiment**. Cliquez sur un volume pour le sélectionner. Lorsqu'un volume est sélectionné :

- faites glisser son toit vers le haut ou vers le bas pour le pousser ou le tirer d'un étage à la fois, ou appuyez sur {{key:PageUp}} et {{key:PageDown}} ;
- le déplacement complet constitue une seule étape d'annulation.

La vue de rue de **Conduite** voit aussi les volumes, et **Soleil** projette leurs ombres sur le sol.

## Les transmettre

- **Volumes en IFC** enregistre chaque volume dans un fichier IFC4 : un site, un bâtiment avec ses niveaux, et le volume comme élément de bâtiment avec ses valeurs dans l'ensemble de propriétés `CadCraft_SiteMass`. Si un système de coordonnées est défini sur le projet, le fichier est placé sur la carte et porte la latitude et la longitude du site ; sans système, il ne dit rien sur sa localisation.
- **Développer dans BimCraft** ouvre BimCraft dans un nouvel onglet avec les volumes. Là, le choix d'un volume affiche ses valeurs et **Développer ce volume**, qui construit des murs à chaque niveau et un plancher sous le bâtiment à partir de l'emprise, en une seule étape d'annulation. Rien n'est téléversé : le fichier passe d'un onglet à l'autre de ce navigateur.

Voir aussi **Limites de zonage** et **Heures d'ensoleillement**.
