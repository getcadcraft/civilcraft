---
title: Construire et affiner la surface
summary: Comment CivilCraft triangule le terrain existant, et comment le façonner avec des groupes de lignes de rupture, des lignes de rupture dessinées, un contour extérieur et la plus longue arête extérieure.
keywords: tin, surface, triangulation, ligne de rupture, contour, terrain naturel, mnt, créer une surface, delaunay, triangles, arête maximale, contour extérieur
from: b9eea3f3
---

CivilCraft a une seule surface de terrain existant par projet. C'est un TIN (réseau triangulé irrégulier) construit à partir de vos points, et il se reconstruit automatiquement à chaque modification d'une donnée d'entrée. Il n'existe pas de commande « Reconstruire » et il n'y a pas de surface périmée.

## Ce qui entre dans la surface

- Chaque point avec une altitude dans un groupe réglé sur {{ui:Points}}.
- Chaque groupe réglé sur {{ui:Ligne de rupture}}, reliés dans l'ordre des numéros de points.
- Chaque ligne de rupture dessinée avec l'outil {{ui:Ligne de rupture}}.
- Le contour extérieur, si vous en dessinez un.
- Le réglage **Plus longue arête extérieure**.

Aucun triangle ne traverse une ligne de rupture : la surface est forcée à la suivre, puis rendue aussi régulière que possible autour d'elle (Delaunay partout ailleurs).

## Transformer des lignes codées en lignes de rupture

1. Dans le panneau de gauche, sous **Points**, repérez le groupe (par exemple FL).
2. Réglez son choix **Surface** sur {{ui:Ligne de rupture}}.
   La surface se reconstruit, la ligne est tracée en orange (avec {{ui:Lignes de rupture}} activé sous **Affichage**), et **Lignes de rupture** dans les caractéristiques de la surface augmente d'une unité.
3. Vérifiez la ligne sur le plan. Elle doit passer de point en point dans l'ordre où elle a été levée. Si elle zigzague, le groupe contient plus d'une ligne, ou les points ne sont pas numérotés dans l'ordre : remettez le groupe sur {{ui:Points}} et dessinez les lignes à la main (section suivante).

## Dessiner une ligne de rupture à travers des points

1. Appuyez sur {{key:B}}, ou cliquez sur {{ui:Ligne de rupture}} dans le groupe **Surface**.
   L'indication dit « Ligne de rupture : cliquez les points de levé dans l'ordre (elle prend leurs altitudes). Entrée termine. »
2. Placez le pointeur près d'un point. Un petit carré orange marque le point qu'elle prendra.
3. Cliquez sur les points de la ligne l'un après l'autre. Chaque clic nomme le point et son altitude dans la barre d'état.
4. Appuyez sur {{key:Enter}} pour terminer.
   La barre d'état indique « Ligne de rupture 1 ajoutée ; la surface a été reconstruite. »

Les clics doivent tomber sur un point de levé ayant une altitude ; un clic ailleurs est refusé avec le message « Cliquez sur un point de levé avec une altitude : une ligne de rupture prend les altitudes des points. » {{key:Backspace}} retire le dernier point ; {{key:Esc}} annule toute la ligne.

:::warning
Terminez avec {{key:Enter}}. Le double-clic termine aussi, mais dans cette version il supprime le point sur lequel vous double-cliquez. Cliquez une fois sur le dernier point, puis appuyez sur {{key:Enter}}.
:::

Pour retirer en une fois toutes les lignes de rupture dessinées, cliquez sur {{ui:Retirer les lignes de rupture dessinées}} dans la section **Surface**. Pour ne retirer que la dernière, utilisez {{key:Mod+Z}}. Les lignes de rupture dessinées ne peuvent pas encore être sélectionnées ni modifiées une à une.

## Dessiner le contour extérieur

Un contour découpe la surface à la zone en laquelle vous avez confiance, par exemple les limites du levé, afin que les longs triangles traversant les angles non levés disparaissent.

1. Appuyez sur {{key:O}}, ou cliquez sur {{ui:Contour}}.
2. Cliquez sur les angles dans l'ordre, tout autour de la zone. Une ligne en pointillés montre la forme.
3. Appuyez sur {{key:Enter}}.
   La barre d'état indique « Contour défini ; les triangles hors de lui ont disparu. » **Contour** dans les caractéristiques de la surface indique « Oui » et le nombre d'angles.

À savoir :

- Il n'y a qu'un seul contour. En dessiner un autre remplace le précédent. {{ui:Retirer le contour}} le supprime.
- Il ne peut qu'enlever : un contour qui dépasse les points est ramené à leur périmètre, avec la remarque « Le contour dépasse les points ; il a été ramené à leur périmètre. »
- Ses angles prennent leurs altitudes depuis la surface, si bien que le bord suit exactement le terrain.
- Les contours masqués (intérieurs) ne sont pas encore disponibles.

## Couper les longs triangles extérieurs

Sans contour, la surface remplit tout le pourtour des points, y compris les longs triangles fins traversant les arêtes concaves.

1. Dans **Surface**, saisissez une longueur dans **Plus longue arête extérieure** et appuyez sur {{key:Enter}}. Commencez avec environ deux ou trois fois votre espacement habituel entre visées.
2. Les triangles extérieurs dont l'arête extérieure est plus longue que cette valeur sont retirés, en progressant vers l'intérieur jusqu'à ce que chaque arête extérieure soit assez courte. Une arête qui est une ligne de rupture n'est jamais retirée.
3. Saisissez 0 pour retrouver tous les triangles.

## Lire le rapport de surface

Sous les caractéristiques de la surface, un cadre liste ce que le constructeur a fait. Avec une barre ocre à gauche, c'est une information ; avec une barre rouge, il contient une erreur et il n'y a pas de surface.

| Message | Signification |
|---|---|
| « 3 points étaient au même endroit qu'un autre et l'ont rejoint. » | Des points plus proches que 0.0001 en plan sont devenus un seul sommet (le premier est conservé). |
| « 2 endroits ont deux altitudes différentes … » | Des points superposés, ou des lignes de rupture qui se croisent, ne concordent pas en hauteur. L'altitude de la ligne de rupture l'emporte, puis la première. |
| « 1 segment de ligne de rupture n'a pas pu être imposé à la surface. » | Un segment de ligne de rupture très court ou presque superposé n'a pas pu être inséré ; vérifiez cet endroit. |
| « Une surface demande au moins trois points avec altitudes. » | Trop peu de points : vérifiez l'ordre des colonnes et les groupes. |
| « Les points sont tous alignés : aucun triangle. » | Les points n'ont pas de largeur, par exemple une seule ligne de cheminement. |
| « Le contour ne recouvre pas les points. » | Le contour est ailleurs, souvent à cause d'une confusion d'unités ou de système de coordonnées. |
| « Aucun triangle ne reste à l'intérieur du contour. » | Le contour est trop petit ou mal placé. |

## Une surface lue depuis LandXML

Lorsque vous ouvrez un LandXML, sa première surface TIN est utilisée telle quelle : le titre **Surface** indique « Surface (depuis LandXML) » et **Plus longue arête extérieure** est grisé. Tant que cette surface est utilisée, les groupes de lignes de rupture, les lignes de rupture dessinées et un nouveau contour ne la modifient pas. Pour construire la surface à partir des points du fichier, cliquez sur {{ui:Reconstruire la surface à partir des points}}. {{key:Mod+Z}} rétablit la surface LandXML.

## Voir aussi

- [Lire les courbes de niveau, les altitudes et les pentes](topic:contours).
- [Importer des points de levé](topic:import-points).
