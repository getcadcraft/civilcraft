---
title: Importer des données SIG
summary: Importer des shapefiles, GeoJSON et GeoPackages dans un projet sous forme de couches SIG, les placer via le bon système de coordonnées, consulter leurs attributs et les utiliser pour la surface.
keywords: sig, étiquettes, étiqueter des entités, attributs sur le plan, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, importer, couches, attributs, système de coordonnées, epsg, latitude, longitude, courbes de niveau, parcelles, lignes de rupture, limite
from: f6b235cc
---

Les services SIG des villes et des comtés fournissent le contexte du site sous forme de fichiers SIG : parcelles, servitudes, courbes de niveau, réseaux, canevas topographique. CivilCraft ouvre trois types de fichiers comme **couches SIG** qui se placent sous votre projet, sur le plan.

| Fichier | Quoi ouvrir |
|---|---|
| Shapefile | Le `.shp` avec ses `.shx`, `.dbf`, `.prj` et `.cpg` (sélectionnez-les tous), ou le `.zip` dans lequel ils sont livrés. Un zip contenant plusieurs shapefiles donne plusieurs couches. |
| GeoJSON | Le fichier `.geojson` (un fichier `.json` dont les premières lignes indiquent `FeatureCollection` ou `Feature` fonctionne aussi). |
| GeoPackage | Le fichier `.gpkg`. Chaque table d'entités qu'il contient est listée. |
| KML ou KMZ | Le fichier `.kml` (de Google Earth ou d'une carte web), ou le `.kmz` compressé. Chaque dossier devient une couche (séparée en points, lignes et polygones lorsqu'il en contient plusieurs types) ; le nom, la description et les données étendues d'un repère deviennent ses attributs. Les hauteurs sont en mètres, et les coordonnées en latitude et longitude, comme pour le GeoJSON. |

Les points, multipoints, lignes, polygones avec trous et formes à plusieurs parties sont lus, avec leurs altitudes (z) lorsque le fichier en contient. Les valeurs de mesure (M) sont ignorées. Les grilles d'altitudes et le LiDAR s'ouvrent de la même façon : voir [Grilles d'altitudes et LiDAR](topic:elevation-grids-and-lidar).

## Ouvrir les fichiers

1. Cliquez sur {{ui:Import}} dans le groupe **SIG** (ou {{ui:Open}}), choisissez les fichiers, ou déposez-les sur le plan. Les fichiers sont lus sur cet ordinateur ; rien n'est téléversé.
2. La boîte de dialogue **Importer des données SIG** liste chaque couche trouvée : son type, son nombre d'entités (et combien n'ont pas de géométrie), son nombre de champs d'attributs, et le système de coordonnées indiqué par le fichier. Décochez les couches dont vous ne voulez pas.
3. Lisez la partie **Système de coordonnées** (ci-dessous) et la ligne **Ce qui va se passer**, puis cliquez sur {{ui:Import}}.
4. Les couches apparaissent sur le plan et sous **Couches SIG** dans le panneau de gauche. L'import est une seule étape : {{key:Mod+Z}} le retire.

Un gros fichier affiche une ligne de progression au-dessus du plan, avec un bouton {{ui:Cancel}}.

## Le système de coordonnées

Les fichiers SIG indiquent leur position par un système de coordonnées (le `.prj` d'un shapefile, la table des systèmes de référence spatiaux d'un GeoPackage ; le GeoJSON est toujours en latitude et longitude). CivilCraft convertit chaque couche depuis son propre système vers celui du projet. Il ne devine jamais :

- **Le projet a un système de coordonnées** (défini dans {{ui:Coordinates}}) : chaque couche ayant son propre système y est convertie, y compris un calage terrain ou local. Un fichier sans `.prj` propose deux choix : **Identique au projet** (ses nombres sont chargés tels quels) ou **Choisir le système du fichier**.
- **Le projet n'en a pas, et le fichier est dans un système projeté aux unités de votre projet** (une zone State Plane en pieds US survey pour un projet en pieds, par exemple) : la boîte de dialogue propose **Utiliser ce système comme système de coordonnées du projet**. Il est défini dans la même étape d'annulation que l'import. Rien ne bouge dans le projet ; le système indique seulement le sens des nombres. Vous pouvez choisir un autre système pour le projet à la place, et les couches y seront converties.
- **Le projet n'en a pas, et le fichier est en latitude et longitude** (tous les GeoJSON) **ou dans d'autres unités** : {{ui:Import}} reste grisé tant que vous n'avez pas choisi le système du projet. Le sélecteur démarre près des données.
- **Ni le projet ni les fichiers ne nomment de système** : les nombres sont chargés tels quels, et la boîte de dialogue l'indique.

Les altitudes sont aussi converties : les hauteurs GeoJSON sont en mètres (la norme GeoJSON le précise) ; celles des autres fichiers sont prises dans l'unité de leur propre système.

:::warning
Les positions d'un fichier GeoJSON situées hors de ±180° de longitude ou de ±90° de latitude ne sont pas des latitudes et longitudes. Ces entités sont écartées, et la boîte de dialogue indique combien. Un tel fichier est généralement un fichier projeté enregistré sans son système ; demandez-le à nouveau, ou demandez le shapefile avec son `.prj`.
:::

Le NAD83 est traité comme le WGS 84 (le système qu'utilise le GeoJSON) ; les deux diffèrent de quelques mètres en Amérique du Nord, donc les données GeoJSON peuvent être décalées d'autant. Lorsque le meilleur décalage nécessite un fichier de grille (NADCON pour le NAD27, par exemple), CivilCraft utilise un décalage publié moins précis, et la boîte de dialogue du système de coordonnées indique son imprécision (pour le NAD27, environ 20 m), jusqu'à ce que vous ajoutiez la grille : voir [Fichiers de décalage de grille](topic:coordinate-systems).

## Couches SIG

Chaque ligne sous **Couches SIG** comporte :

- une case à cocher pour afficher ou masquer la couche (les couches masquées ne sont pas non plus sélectionnables) ;
- sa couleur, choisie dans la liste ;
- un menu (les trois points) avec {{ui:Zoom to}}, {{ui:Use for the surface…}}, {{ui:Rename…}} et {{ui:Remove}}.

Afficher, masquer, changer la couleur, renommer et supprimer sont des étapes d'annulation. Les couches SIG sont enregistrées dans le fichier du projet et réapparaissent à son ouverture. Elles sont aussi envoyées avec le tracé PDF du plan et ses exports DXF et DWG, chacune sur un calque nommé `GIS-` suivi de son numéro.

## Étiqueter les entités à partir d'un attribut

Dans le menu {{ui:More}} de la couche (les trois points dans **Couches SIG**), choisissez un champ sous **Étiqueter avec** : chaque entité affiche sa valeur sur le plan, dans la couleur de la couche. Les points sont étiquetés à côté du point, les lignes le long du milieu de leur partie la plus longue (orientées pour se lire de gauche à droite), et les polygones en leur centre. Les nombres s'affichent avec trois décimales au maximum. Les étiquettes mesurent 1.8 mm de haut sur papier, quelle que soit l'échelle, et passent dans le tracé PDF, le DXF et le DWG. Choisissez **Aucune étiquette** pour les retirer ; chaque modification est une étape ({{key:Mod+Z}} l'annule). Une couche étiquette au plus 5,000 entités.

## Examiner une entité

Avec {{ui:Select}} activé, cliquez sur une entité. **Propriétés** affiche sa couche, le numéro de l'entité, sa forme (parties, trous, sommets), ses altitudes, le fichier d'origine et le système de coordonnées de ce fichier, puis chaque attribut dans un tableau. Les attributs sont en lecture seule : CivilCraft affiche les données SIG telles quelles, il ne les modifie pas.

Les points l'emportent sur les lignes lorsque les deux se trouvent sous le pointeur ; à l'intérieur d'un polygone, c'est le plus petit polygone qui est choisi.

## Utiliser pour la surface

Ouvrez le menu d'une couche et choisissez {{ui:Use for the surface…}} (ou le bouton de **Propriétés**). Ce qui est proposé dépend de la couche :

| Couche | Peut devenir |
|---|---|
| Lignes avec altitudes (lignes 3D) | Lignes de rupture à leurs propres altitudes |
| Lignes sans altitude mais avec un champ numérique (courbes de niveau) | Lignes de rupture à l'altitude du champ choisi |
| Polygones | La limite de surface (le polygone sélectionné, sinon le plus grand), ou des lignes de rupture le long de leurs bords |
| Points avec altitudes, ou avec un champ d'altitude | Points topographiques, décrits avec le nom de la couche pour former un groupe de points |

Chaque utilisation est une étape d'annulation qui copie la géométrie dans le projet ; la couche elle-même reste inchangée. Les altitudes sont prises dans les unités du projet.

## Fichiers de points en latitude et longitude

Un fichier de points dont l'en-tête nomme des colonnes **latitude** et **longitude** (`lat`, `latitude`, `lon`, `long`, `longitude`) est lu en degrés, et non en nord et est. La boîte de dialogue d'import l'indique. Lors de {{ui:Import}}, les points sont convertis dans le système de coordonnées du projet ; un projet qui n'en a pas vous demande de le choisir d'abord. Les degrés ne sont jamais chargés comme des pieds. Les lignes hors de ±90° de latitude ou de ±180° de longitude sont refusées, avec la raison. La colonne d'altitude est prise telle quelle, dans les unités du projet.

## Fichiers LandXML qui nomment un système de coordonnées

Lorsqu'un fichier LandXML que vous ouvrez contient un élément `CoordinateSystem` (un code EPSG, une description WKT ou un nom de système), CivilCraft le propose comme système de coordonnées du projet. Rien ne bouge si vous acceptez ; le système indique seulement le sens des nombres.

## Ce qui a été vérifié

- Chaque lecteur a été comparé à GDAL, la bibliothèque que la plupart des logiciels SIG utilisent pour lire ces fichiers, sur des fichiers écrits par GDAL : shapefiles de tous types avec et sans altitudes, lignes à plusieurs parties, polygones avec trous, géométries vides, attributs texte, nombre, date et vrai/faux, texte UTF-8 et Windows-1252 avec et sans `.cpg`, un zip de plusieurs shapefiles, GeoJSON avec tous les types de géométrie, et un GeoPackage à quatre tables. Chaque géométrie, altitude et attribut correspondait.
- Les positions converties depuis la latitude et la longitude, et depuis l'UTM, correspondent à PROJ (la bibliothèque de projection derrière GDAL) à 3 mm près.
- Les fichiers endommagés (tronqués, tailles annoncées erronées, zips ou GeoPackages défectueux) donnent un message simple ; rien ne se bloque.
- Rien ici n'a encore été ouvert dans d'autres logiciels SIG, et les géodatabases fichier, le KML et le KMZ ne sont pas encore lus (voir [Pas encore disponible](topic:not-built-yet)).
