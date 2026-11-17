---
title: Export et import IFC
summary: Enregistrer tout le projet dans un seul fichier IFC en IFC 4.3, IFC4 ou IFC2x3 (tracés, routes, terrassements, surfaces, murs, canalisations), et ouvrir des fichiers IFC pour leurs tracés et leurs surfaces.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, tracé, ifcalignment, route, ifcroad, terrassements, tin, livrable, marché public, exporter ifc, importer ifc
from: 6b998bcf
---

IFC est le format d'échange ouvert que de nombreux maîtres d'ouvrage publics demandent comme livrable. CivilCraft écrit l'ensemble du projet dans un seul fichier IFC et relit les tracés et les surfaces à partir de fichiers IFC.

## Export

1. Cliquez sur {{ui:IFC}} dans le groupe **Exporter** (dans les styles de ruban : {{ui:Sortie}} › {{ui:Exporter}} › {{ui:IFC}}).
2. Choisissez le schéma. **IFC 4.3 ADD2** est proposé en premier et par défaut : c'est l'édition avec tracés, routes et terrassements. Choisissez IFC4 ou IFC2x3 seulement lorsque le logiciel du destinataire ne peut pas lire la 4.3.
3. La boîte de dialogue indique ce que contiendra le fichier et ce que le schéma choisi omet. Cliquez sur {{ui:Exporter l'IFC}}.
   Le fichier se télécharge sous le nom « *nom du projet*-ifc4x3.ifc », « -ifc4.ifc » ou « -ifc2x3.ifc ». CivilCraft retient le dernier schéma choisi.

## Ce que contient chaque schéma

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Tracés | IfcAlignment avec ses tracés horizontal (lignes, arcs de cercle, clothoïdes) et vertical (pentes, courbes paraboliques), leurs courbes (IfcCompositeCurve, IfcGradientCurve), la station de départ et les événements de dévers | Une polyligne 3D sur un élément civil | Une polyligne 3D sur un proxy |
| Corridors | IfcRoad avec des parties de route ; voies, accotements, caniveaux et trottoirs en IfcPavement, bordures en IfcKerb, bandes plantées ; chaque couche de chaussée en IfcCourse avec son épaisseur, son matériau et son volume ; les talus en IfcEarthworksCut et IfcEarthworksFill avec les volumes de déblai et de remblai ; la vitesse de projet et la classe | Éléments civils nommés selon leur nature, regroupés par route | Proxies, regroupés par route |
| Surfaces | IfcGeographicElement TERRAIN avec un réseau irrégulier triangulé | Ensembles de faces triangulées | Modèles de surface à base de faces (fichiers plus volumineux) |
| Plateformes et murs | Le dessus de la plateforme, ses talus en terrassements, murs de soutènement en IfcWall RETAININGWALL | Idem, le mur étant un type de mur défini par l'utilisateur | Idem, le type du mur dans ObjectType |
| Réseaux de canalisations | IfcPipeSegment et IfcDistributionChamberElement dans un IfcDistributionSystem | Idem | IfcFlowSegment et regards dans un IfcSystem |
| Géoréférencement | IfcProjectedCRS et IfcMapConversion | Idem | ePSet_ProjectedCRS et ePSet_MapConversion sur le site |

Un **chemin de fer** (un tracé avec Ferroviaire activé) entre en IFC 4.3 sous forme d'IfcRailway : ses raccordements en types distincts (clothoïde, parabole cubique, Bloss, Helmert, demi-onde sinus en courbe cosinus, sinus), son dévers en IfcAlignmentCant, et sa voie en rails, traverses et couche de ballast, avec la sous-couche en dessous. IFC4 et IFC2x3 reçoivent les mêmes parties en éléments civils ou en proxies. L'ouverture d'un chemin de fer IFC 4.3 restitue ses raccordements et son dévers.

Chaque fichier contient aussi les parcelles (emprises), les végétaux et aménagements durs de l'espace de travail Paysage, et les volumes de bâtiments (chacun un IfcBuilding avec ses niveaux), le tout dans un même site. Les ensembles de propriétés portent ce que vous avez conçu : stations, assemblage, pentes de déblai et de remblai, largeur et nombre de voies, cotes de radier, cotes de tampon, hauteurs de murs ; les quantités (longueurs, surfaces, volumes) sont des ensembles IfcElementQuantity.

## Unités et coordonnées

Le fichier est exprimé dans l'unité de longueur du projet (mètres, ou pieds US survey) ; les surfaces et volumes sont en mètres carrés et mètres cubes. Avec un système de coordonnées (SIG › Coordonnées), le fichier est placé sur la carte : l'est et le nord de son origine, ainsi que la rotation et l'échelle d'un système local du terrain, figurent dans la conversion cartographique. Sans système, le fichier enregistre son origine locale dans un ensemble de propriétés et n'est pas placé sur une carte.

## Import

Ouvrez un fichier .ifc avec {{ui:Ouvrir}} ou déposez-le sur le plan. La boîte de dialogue d'import indique ce que contient le fichier :

- Les **tracés** de l'IFC 4.3 (tracés horizontal et vertical) et les courbes de tracé IFC 4x1 deviennent des tracés CivilCraft avec leurs PI, rayons, longueurs de clothoïdes et PIV. Un tracé que le modèle de PI de CivilCraft ne peut pas porter (courbes composées, raccordements entre deux courbes, tracé qui commence ou finit dans une courbe) n'est pas importé, et la boîte de dialogue indique pourquoi.
- **Surfaces** : choisissez celle qui devient le terrain naturel, ou conservez celle du projet.
- **Tout le reste** (et les autres surfaces) peut être affiché dans la vue 3D comme référence. Les éléments de référence restent tant que le projet est ouvert ; ils ne sont pas enregistrés dans le fichier de projet.

Un fichier écrit par CivilCraft en IFC4 ou IFC2x3 restitue ses tracés à l'identique à partir de leurs ensembles de propriétés.

## Pas encore disponible

- Le dévers d'une route est écrit sous forme d'événements de dévers et dans les surfaces de route (le dévers concerne les chemins de fer).
- Enregistrer les éléments de référence dans le fichier de projet, et importer depuis l'IFC des réseaux de canalisations ou des plateformes comme objets modifiables.
