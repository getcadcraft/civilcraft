---
title: Grilles d'altitudes et LiDAR
summary: Construire le terrain naturel à partir d'un MNT (GeoTIFF ou grille ASCII) ou de points LiDAR (LAS, LAZ) — choisir la zone, alléger les données, choisir les classes et vérifier les unités d'altitude — puis renvoyer une surface sous forme de grille d'altitudes GeoTIFF.
keywords: mnt, dem, dtm, grille d'altitudes, geotiff, tif, grille ascii, asc, lidar, las, laz, nuage de points, classes, sol, allègement, nodata, raster, exporter geotiff, sig
from: c8b2d18a
---

Les données d'altitude publiques arrivent de deux façons : les **grilles d'altitudes** (un MNT : une altitude par cellule carrée, en général un GeoTIFF `.tif` ou une grille ASCII `.asc`) et les **points LiDAR** (des millions de retours laser dans un fichier `.las`, ou `.laz` lorsqu'il est compressé). CivilCraft transforme l'un ou l'autre en points topographiques ou en surface, dans le navigateur : rien n'est téléversé.

## Ouvrir le fichier

1. Cliquez sur {{ui:Ouvrir}} (ou {{ui:Importer}} dans le groupe SIG) et choisissez le fichier, ou faites-le glisser sur le plan. Pour une grille ASCII, choisissez aussi son fichier `.prj`, afin que CivilCraft connaisse son système de coordonnées.
2. La boîte de dialogue d'import indique ce que le fichier dit de lui-même : sa taille, ses cellules ou ses points, son système de coordonnées, sa position en latitude et longitude, et sa plage d'altitudes. Pour un LiDAR, elle lit d'abord chaque point une fois pour compter les **classes** (une barre de progression indique l'avancement ; {{ui:Annuler}} l'arrête).

Un GeoTIFF à trois ou quatre bandes (rouge, vert, bleu) est une image, pas un relevé d'altitudes : il va dans les calques de carte.

## Choisir ce qui est importé

- **Zone** : {{ui:L'étendue du projet et une marge}} (saisissez la marge), {{ui:Ce que le plan affiche maintenant}}, ou {{ui:Le fichier entier}}. Seule cette partie du fichier est lue.
- **Alléger à** : l'espacement entre les points obtenus, dans les unités du projet. La ligne sous les réglages indique, pendant la saisie, combien de points cela donne. Pour une grille, CivilCraft conserve une cellule sur deux, sur trois… de sorte que les altitudes restent exactement celles du fichier ; il ne moyenne jamais les cellules. Pour le LiDAR, la zone est découpée en carrés de cette taille et un point est conservé par carré : {{ui:Le point le plus proche du centre de chaque maille}} (par défaut), {{ui:Le point le plus bas de chaque maille}} (utile lorsque le fichier n'a pas de classe sol : le sol est sous les arbres) ou {{ui:La moyenne des points de chaque maille}}.
- **Classes** (LiDAR) : la classe sol (classe 2) est cochée lorsque le fichier la contient ; les bâtiments, les arbres et le bruit sont exclus. Lorsqu'il n'y a pas de classe sol, toutes les classes sont cochées et la boîte de dialogue l'indique.
- **Sol** (LiDAR, 0.8) : un nuage de drone n'a pas de classe sol. Lorsque le fichier n'en a pas, la boîte de dialogue démarre sur {{ui:Trouver le sol moi-même (nuages de drone, sans classe de sol)}} : toutes les classes sauf le bruit sont lues, le point le plus bas de chaque maille est conservé, puis CivilCraft retire les bâtiments, les arbres et les points bas isolés à l'aide d'un filtre morphologique progressif (Zhang et autres, 2003) que vous pouvez régler : **Plus grand objet à retirer** (la largeur du plus grand bâtiment ; les fenêtres grandissent jusqu'à le couvrir ; 0 signifie 20 cellules) et **Pente maximale du sol**. Le calcul se fait sur la grille des points les plus bas, de sorte qu'un nuage de dizaines de millions de points ne coûte pas plus que son nombre de cellules (l'allègement est un seul passage en flux). L'espacement correspond à la cellule : une cellule plus grande est plus rapide et rate moins les petits objets qu'on ne le pense, une cellule plus fine conserve plus de détail du sol. Le rapport indique combien de points ont été conservés comme sol, combien de cellules ont été retirées comme objets et combien de points bas isolés ont été écartés. Sur une campagne de drone fictive de 300 m avec cinq bâtiments, 70 arbres et 200 points bas aberrants, les points conservés étaient à 3 cm près du terrain réel, et aucun toit ni couvert n'a été conservé.
- **Altitudes dans le fichier** : mètres, pieds ou pieds US survey. Lorsque le fichier l'indique, son unité est déjà choisie. Sinon, vous devez la choisir : la boîte de dialogue affiche la plage d'altitudes dans les deux sens, pour que vous puissiez voir laquelle est cohérente pour le site.
- **Importer comme** (grilles seulement) : {{ui:Points topographiques (description DEM)}}, ou {{ui:La surface elle-même (une grille de triangles)}}.

Un import comprend au plus 500,000 points. Lorsqu'un choix en donnerait davantage, la boîte de dialogue indique de combien et quel espacement conviendrait, et {{ui:Importer}} reste désactivé.

Cliquez sur {{ui:Importer}}. Une barre de progression indique la lecture ; {{ui:Annuler}} l'arrête, et rien ne change.

:::warning
Les unités verticales sont un piège fréquent. Beaucoup de MNT en systèmes State Plane ont des coordonnées est et nord en pieds mais des altitudes en mètres. Comparez la plage affichée par la boîte de dialogue avec ce que vous savez du site.
:::

## Ce que vous obtenez

- **Points topographiques** : numérotés à la suite de votre numéro de point le plus élevé, avec la description `DEM` (grilles) ou `LIDAR`, de sorte qu'ils forment un seul groupe de points sous **Points** et servent à construire la surface comme n'importe quels autres points. Les importer constitue une seule étape : {{key:Mod+Z}} les retire.
- **La surface elle-même** : un TIN de grille, deux triangles par cellule, découpés selon la diagonale sud-ouest vers nord-est. Un triangle dont un coin n'a pas de données est exclu, de sorte que les trous des données restent des trous. La surface est égale à la grille en chaque point de grille et est un plan plat à l'intérieur de chaque triangle. Elle remplace la surface du projet (la boîte de dialogue le demande d'abord) ; {{key:Mod+Z}} rétablit la surface précédente. L'en-tête du panneau de gauche indique **Surface (à partir d'une grille d'altitudes)**.

## Systèmes de coordonnées

- Si le projet a un système de coordonnées et que le fichier en nomme un autre, chaque point est converti dans le système du projet (et dans ses coordonnées terrain ou locales lorsqu'il en a).
- Si le projet n'en a pas et que le système du fichier est exprimé dans les unités du projet (pieds ou mètres), la boîte de dialogue propose d'en faire le système de coordonnées du projet, dans la même étape d'annulation que les points.
- Si le fichier est en latitude et longitude, ou en mètres pour un projet en pieds, la boîte de dialogue vous demande d'abord de choisir le système de coordonnées du projet.
- Si le fichier ne l'indique pas, ses nombres sont pris comme coordonnées du projet. Vous pouvez choisir le système du fichier à la place.

## Exporter une surface en GeoTIFF

1. Cliquez sur {{ui:Exporter}} dans le groupe SIG.
2. Dans la partie GeoTIFF, choisissez la surface (terrain naturel ou surface terrassée) et la taille de cellule. La valeur par défaut provient de la longueur moyenne des arêtes des triangles de la surface. La boîte de dialogue indique la taille de la grille qui sera écrite.
3. Cliquez sur {{ui:Télécharger le GeoTIFF}}.

Le fichier est une bande de valeurs d'altitude en virgule flottante 32 bits, dans les unités du projet, sur l'étendue de la surface ; les cellules hors de la surface sont « sans donnée » (−3.4028235e38). La valeur de chaque cellule est l'altitude de la surface au centre de la cellule. Les coordonnées sont des coordonnées **grille** : un projet en coordonnées terrain ou locales est reconverti en grille. Le fichier désigne le système de coordonnées du projet par son code EPSG ; un système sans code EPSG n'est pas écrit, et la boîte de dialogue vous invite à indiquer au service SIG quel système c'est.

## Ce qui a été vérifié

- Les lecteurs GeoTIFF et de grilles ASCII ont été vérifiés avec GDAL (via rasterio), la bibliothèque que la plupart des logiciels SIG utilisent pour lire ces fichiers : grilles en flottants 32 bits et en entiers 16 bits, en tuiles et en bandes, DEFLATE et LZW, nodata, échelle et décalage, pixel-is-point, une grille UTM, une grille State Plane en pieds US survey et une grille en latitude et longitude — chaque valeur est égale.
- Les lecteurs LAS et LAZ ont été vérifiés avec laspy : LAS 1.2 et 1.4, formats de points 0, 1, 3, 6, 7 et 8, avec et sans système de coordonnées, et LAZ écrit par son moteur compatible LASzip — chaque point est égal.
- Les coordonnées converties ont été vérifiées avec PROJ à 1 mm près.
- Les GeoTIFF exportés ont été relus par GDAL : système de coordonnées, positions des cellules, nodata, unités, et valeurs égales à la surface à 0.0001 près.
- Rien ici n'a été ouvert dans d'autres logiciels SIG ou de CAO.

## Pas encore disponible

- Changements de référentiel vertical (modèles de géoïde) : les altitudes sont utilisées telles que le fichier les donne.
- Données de forme d'onde, retours LiDAR autres que par classe, couleurs et intensités.
- Plusieurs bandes, pyramides d'images (overviews), ou fichiers de plus de 200 MB.
- Écriture de LAS ou LAZ à partir d'une surface ou de cet outil (le module complémentaire [Nuages de points](topic:point-clouds) écrit un nuage nettoyé en LAS 1.4 ou LAZ).
