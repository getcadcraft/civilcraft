---
title: Calques du plan
summary: Noms fixes, couleurs et épaisseurs de trait des calques utilisés par CivilCraft à l'écran, en DXF et en PDF, et le réglage d'affichage qui commande chacun.
keywords: calques, noms de calques, ncs, couleurs, aci, épaisseurs de trait, calques dxf, pdf, réglages d'affichage, tracés
from: c2aa8475
---

Tout ce qui se trouve sur le plan appartient à un calque. Les noms suivent la convention usuelle des calques de génie civil (discipline, groupe principal, groupe secondaire). Les calques sont fixes dans cette version : vous ne pouvez pas les renommer, changer leurs couleurs ni en ajouter. En DXF, chaque calque a le numéro de couleur indiqué ; en PDF avec {{ui:Couleurs des calques}}, les mêmes couleurs sont utilisées, et avec {{ui:Noir}}, tout s'imprime en noir.

| Calque | Contient | Couleur (numéro DXF) | Affiché quand |
|---|---|---|---|
| C-TOPO-MINR | Courbes secondaires | Gris (8) | {{ui:Courbes de niveau}} |
| C-TOPO-MAJR | Courbes maîtresses | Blanc ou noir (7) | {{ui:Courbes de niveau}} |
| C-TOPO-TEXT | Cotes des courbes de niveau | Blanc ou noir (7) | {{ui:Courbes de niveau}} et {{ui:Cotes des courbes de niveau}} |
| C-TOPO-TINN | Arêtes des triangles | Gris (8) | {{ui:Triangles}} |
| C-TOPO-BRKL | Lignes de rupture et limite | Orange (30) | {{ui:Lignes de rupture}} |
| C-TOPO-BNDY | Bord de la surface | Blanc ou noir (7) | {{ui:Bord de la surface}} |
| C-TOPO-SLOP | Flèches de pente | Cyan (4) | {{ui:Flèches de pente}} |
| V-NODE | Points topographiques | Vert (3) | {{ui:Points}} |
| V-NODE-TEXT | Libellés de points : numéro, altitude, description | Vert (3) | {{ui:Points}} et {{ui:Libellés de points}} |
| V-NODE-LINE | Lignes issues des codes de ligne (groupes qui ne sont pas des lignes de rupture) | Vert (3) | {{ui:Points}} |
| C-ROAD-CNTR | Axes du tracé en plan | Rouge (1) | Toujours |
| C-ROAD-STAN | Repères et libellés de points kilométriques, PC et PT | Rouge (1) | Toujours |
| C-ROAD-CORR | Bords de corridor | Jaune (2) | Toujours |
| C-ROAD-SCTN | Lignes d'échantillonnage (là où les coupes sont faites) | Gris (8) | Quand le tracé a des lignes d'échantillonnage |
| C-GRAD-PADS | Contours des plateformes | Bleu (5) | Toujours |
| C-GRAD-DAYL | Lignes de raccordement au terrain | Magenta (6) | Toujours |
| C-GRAD-SLOP | Lignes de pente de terrassement | Magenta (6) | Toujours |
| C-GRAD-FEAT | Lignes caractéristiques (3D) | Vert (3) | Toujours |
| C-ROAD-SWPT | Trajectoires balayées : contour, trajectoires des roues extérieures, nom | Orange (30) | Toujours |
| C-STRM-PIPE | Canalisations | Bleu (5) | {{ui:Canalisations}} |
| C-STRM-STRC | Regards | Bleu (5) | {{ui:Canalisations}} |
| C-STRM-TEXT | Libellés de canalisations et de regards | Bleu (5) | {{ui:Canalisations}} |
| C-STRM-PROB | Canalisations et regards en anomalie | Rouge (1) | {{ui:Canalisations}} |

Les lignes de rupture ne sont dessinées que si **Surface** dans **Affichage** est sur {{ui:Terrain existant}} ; la limite est dessinée avec l'une ou l'autre surface.

## Épaisseurs de trait en PDF

| Épaisseur | Calques |
|---|---|
| 0.50 mm | Axes du tracé en plan, plateformes, canalisations, canalisations en anomalie |
| 0.35 mm | Courbes maîtresses, lignes de raccordement au terrain, regards |
| 0.25 mm | Lignes de rupture |
| 0.13 mm | Courbes secondaires |
| 0.09 mm | Arêtes des triangles, lignes de pente de terrassement |
| 0.18 mm | Tout le reste |

Les fichiers DXF ne portent pas d'épaisseurs de trait ; réglez-les par calque dans votre logiciel de CAO.

## Tailles des libellés

Les libellés sont dimensionnés sur papier : cotes des courbes de niveau 2.0 mm, libellés des points kilométriques 1.8 mm, libellés PC et PT ainsi que libellés des canalisations et des regards 1.6 mm, libellés de points 1.5 mm. Les libellés de canalisations donnent le nom, le diamètre et la pente ; ceux des regards donnent le nom et la cote de tampon. À l'écran, ils gardent la même taille quand vous zoomez. En DXF, ils sont mis à l'échelle selon l'échelle indiquée dans le message d'export ; voir [Exporter le plan en DXF](topic:dxf-export).

## Non affiché sur aucun calque

Les bandes d'altitude ne sont dessinées sous le tracé qu'à l'écran. La vue du profil ne fait pas partie du plan.
