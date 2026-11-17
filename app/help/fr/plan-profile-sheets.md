---
title: Feuilles de plan et de profil en long
summary: Tracer un tracé en plan sous forme d'un jeu de feuilles de plan et de profil en long dans un seul PDF, avec des lignes de raccord entre elles.
keywords: plan et profil, feuilles, tracer, pdf, ligne de raccord, production de plans, plans de routes, tracé du profil, exagération verticale, jeu de feuilles
from: 34b4ec78
---

Les feuilles de plan et de profil en long sont la façon habituelle de dessiner les plans de routes : chaque feuille montre un tronçon de la route deux fois, le plan au-dessus et le profil en dessous, à la même échelle horizontale, si bien qu'un point kilométrique se trouve au même endroit dans les deux.

## Créer les feuilles

1. Sélectionnez le tracé. Dans **Propriétés**, cliquez sur {{ui:Feuilles de plan et profil en long}}.
2. Choisissez le **Papier**, l'**Échelle du plan** et l'**Exagération du profil** (nombre de fois que le profil est dessiné plus haut qu'il n'est long ; 10× pour commencer). La boîte de dialogue indique combien de feuilles cela fait et quelle part du tracé chacune montre.
3. Pour tracer une partie du tracé, modifiez le **Point kilométrique de début** et le **Point kilométrique de fin**.
4. Cliquez sur {{ui:Télécharger le PDF}}. Le PDF comporte une page par feuille.

## Contenu d'une feuille

| Élément | Ce qu'il montre |
|---|---|
| Plan | Tout le contenu du plan (courbes de niveau, points topographiques, tracé en plan et son repérage kilométrique, corridors, plateformes, lignes caractéristiques, canalisations, lignes d'échantillonnage), pivoté pour que ce tronçon traverse la feuille, avec une flèche du nord pivotée en conséquence |
| Lignes de raccord | Un trait mixte perpendiculaire au tracé à chaque extrémité qui se poursuit sur une autre feuille, libellé « Ligne de raccord sta 5+50.00, voir feuille 2 » |
| Profil | Le terrain existant (tireté), le profil projet (rouge), la pente de chaque alignement droit et, pour chaque courbe verticale, son PIV, son altitude, L et K ; points kilométriques en bas, altitudes des deux côtés |
| Cartouche | Le nom du projet, le tracé et sa plage de points kilométriques, « Feuille 1 sur 3 », les échelles horizontale et verticale et l'exagération |

La longueur de tronçon par feuille est celle que permet la fenêtre de plan à l'échelle choisie, arrondie à l'inférieur à un multiple de 50 ft (20 m) pour les longs tronçons ou de 10 ft (5 m) pour les courts.

:::note
Si les altitudes du profil ne tiennent pas à l'exagération choisie, CivilCraft dessine toutes les feuilles avec la plus grande valeur parmi 10×, 5×, 4×, 2× et 1× qui convient, et la barre d'état l'indique. Un tracé courbe est orienté selon la direction du début à la fin de chaque tronçon ; la route peut donc monter ou descendre légèrement sur la feuille.
:::
