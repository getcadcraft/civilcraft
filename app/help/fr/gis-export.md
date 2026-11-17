---
title: Exporter les données de récolement pour le SIG
summary: Remettre les points topographiques, courbes de niveau, tracés, plateformes, canalisations et regards à un service SIG de ville ou de comté sous forme de shapefiles, GeoPackage, GeoJSON ou KML, dans les coordonnées grille du système de coordonnées du projet.
keywords: sig, export, kml, kmz, google earth, récolement, shapefile, shp, zip, geopackage, gpkg, geojson, canalisations, regards, réseaux, ville, comté, grille, terrain, epsg, prj
from: bba4fea5
---

Beaucoup de villes et de comtés demandent des données de récolement dans un format SIG à la clôture d'un projet : où sont passées les canalisations et les regards, les profils finaux, l'axe de la route. **SIG › Exporter** écrit ce que CivilCraft contient sous forme de couches SIG, une par type d'objet.

## Avant d'exporter

1. Définissez le système de coordonnées du projet dans {{ui:Coordinates}}. Un service SIG doit savoir où se situent les nombres ; sans système, les fichiers portent les nombres propres au projet et n'en nomment aucun.
2. Vérifiez le terrain, les tracés, les plateformes et le réseau de canalisations tels que vous voulez les livrer.
3. Demandez au service quel format et quel système de coordonnées il souhaite. Beaucoup demandent encore des shapefiles dans la zone State Plane locale ; les systèmes plus récents acceptent le GeoPackage.

## Exporter

1. Cliquez sur {{ui:Export}} dans le groupe **SIG**.
2. Sous **Quoi**, cochez les types à envoyer. Chacun indique son nombre d'entités ; les types sans rien sont grisés.
3. Sous **Format**, choisissez le format.
4. Lisez les remarques sur les coordonnées et les unités, puis cliquez sur le bouton de téléchargement. La ligne d'état indique ce qui a été écrit, ainsi que les noms de champs éventuellement raccourcis.

La boîte de dialogue contient aussi l'export de la grille d'altitudes ({{ui:Surface as a GeoTIFF elevation grid}}) ; voir [Grilles d'altitudes et LiDAR](topic:elevation-grids-and-lidar).

## Contenu de chaque type

| Type | Forme | Champs |
|---|---|---|
| Points topographiques | Points avec altitude | `P` numéro de point, `N` nord, `E` est, `Z` altitude, `D` description |
| Courbes de niveau du terrain existant, de la surface projet | Lignes à leur altitude | `ELEV` |
| Lignes de rupture | Lignes avec altitudes | `NAME` |
| Limite de surface | Polygone (la limite dessinée, sinon le bord de la surface) | `NAME` |
| Tracés | Axes | `NAME`, `LENGTH`, `STA_START`, `STA_END` (points kilométriques en nombres simples) |
| Plateformes | Polygones à l'altitude de la plateforme | `NAME`, `ELEV`, `AREA` |
| Lignes de raccordement | Lignes avec altitudes (plateformes et corridors) | `NAME` |
| Lignes caractéristiques de corridor | Lignes avec altitudes : axe, bords de chaussée, accotements | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Canalisations | Lignes du radier amont au radier aval | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (pourcentage), `LENGTH`, `NETWORK` |
| Regards | Points au niveau du tampon | `NAME`, `RIM`, `INVERT` (le radier le plus bas de canalisation à cet endroit), `SUMP`, `DIA`, `DIA_UNIT` |
| Chaque couche SIG | Telle qu'importée | Ses propres champs |

Les longueurs, points kilométriques et altitudes sont dans les unités du projet (pieds US survey ou mètres). Les diamètres des canalisations et des regards sont en pouces pour les projets en pieds, et en millimètres pour les projets en mètres ; `DIA_UNIT` indique lequel.

## Les formats

- **Shapefile** : un `.zip` avec un shapefile par type (`.shp`, `.shx`, `.dbf`), un `.cpg` indiquant que le texte est en UTF-8, et un `.prj` nommant le système de coordonnées. Les formes avec altitudes sont écrites dans les types Z du shapefile. Les noms de champs de plus de 10 caractères sont raccourcis, comme l'exige le format, et la ligne d'état les liste.
- **GeoPackage** : un fichier `.gpkg` avec une table par type, le système de coordonnées stocké avec son code EPSG. Un seul fichier au lieu de plusieurs, et des noms de champs longs conservés.
- **KML** ou **KMZ** (KML compressé) : un fichier de latitudes et longitudes pour Google Earth et les cartes web, un dossier par type, chaque entité étant un repère nommé d'après son champ NAME, avec tous les champs en données étendues ; hauteurs en mètres (mode d'altitude absolu). Comme le GeoJSON, il a besoin du système de coordonnées du projet.
- **GeoJSON** : un fichier de latitudes et longitudes (la norme GeoJSON n'autorise rien d'autre), où chaque entité porte une propriété `kind` (`pipes`, `structures`, …) pour que le destinataire puisse les séparer. Les hauteurs sont converties en mètres, comme l'exige la norme ; elles restent sur le système vertical de votre projet (CivilCraft n'a pas de modèle de géoïde). Un projet sans système de coordonnées ne peut pas exporter en GeoJSON, et la boîte de dialogue en explique la raison.

## Grille, pas terrain

Les services SIG conservent leurs données en coordonnées **grille** d'un système de coordonnées. Si votre projet utilise des coordonnées terrain ou locales (définies dans {{ui:Coordinates}}), chaque coordonnée est reconvertie en grille à la sortie : les nombres des fichiers diffèrent de ceux du plan par votre facteur d'échelle (et par la rotation, pour un système local). Les champs de points `N` et `E` contiennent aussi les valeurs de grille. La boîte de dialogue le rappelle.

:::tip
Joignez une courte note aux fichiers : le système de coordonnées et son code EPSG, le système vertical de vos altitudes, les unités, et le contenu de chaque fichier.
:::

## Ce qui a été vérifié

- Chaque fichier écrit a été relu par GDAL, la bibliothèque que la plupart des logiciels SIG utilisent pour lire ces fichiers : chaque forme, altitude et attribut, les nombres d'entités, et le système de coordonnées sous forme de code EPSG (`.prj` et GeoPackage). Nos propres lecteurs les relisent de la même façon.
- Les fichiers GeoJSON suivent la RFC 7946 : longitude avant latitude, pas de membre `crs`, anneaux extérieurs antihoraires et trous horaires ; les positions correspondent à PROJ à 2 mm près.
- Un projet en coordonnées terrain a été exporté, et chaque point a été vérifié par rapport à ses coordonnées grille.
- Rien ici n'a encore été ouvert dans d'autres logiciels SIG. Vérifiez la première livraison avec le service avant de vous y fier.
