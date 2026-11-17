---
title: Coordonnées terrain et locales
summary: Travailler en coordonnées terrain (surface) à partir de la grille, mises à l'échelle par un facteur d'échelle combiné que vous saisissez ou calculez en un point, ou dans une grille de site supposée rattachée au système par deux points de contrôle.
keywords: coordonnées terrain, coordonnées de surface, grille vers terrain, facteur d'échelle combiné, csf, facteur combiné, facteur de grille, facteur d'altitude, facteur de niveau de la mer, convergence, angle de projection, facteur d'échelle, coordonnées supposées, coordonnées locales, grille de site, 5000 5000, points de contrôle, localisation, calage, deux points, écart de fermeture
from: 3d7453de
---

Les coordonnées State Plane et UTM sont des coordonnées **grille** : une projection cartographique étire ou rétrécit un peu les distances (quelques dizaines de ppm), et plus le site est élevé, plus une distance mesurée au sol diffère de la distance sur la grille. Beaucoup de levés fournissent donc des coordonnées **terrain**, mises à l'échelle pour que les distances sur le plan égalent les distances mesurées au sol, ou une grille de site **supposée** (5000, 5000 en un point de contrôle). CivilCraft conserve vos nombres tels quels et enregistre leur relation avec la grille, pour que la latitude et la longitude, les fichiers SIG et les couches cartographiques tombent toujours au bon endroit.

Ouvrez {{ui:Coordinates}} dans le groupe {{ui:GIS}}, choisissez (ou gardez) le système, puis choisissez sous **Coordonnées grille, terrain ou locales** :

| Choix | Vos coordonnées sont | Leur relation avec la grille |
|---|---|---|
| {{ui:Grid}} | Celles du système (au départ) | Les mêmes nombres |
| {{ui:Ground}} | Mises à l'échelle des distances au sol | grille = base + facteur combiné × (terrain − base) |
| {{ui:Local}} | Une grille de site supposée | Déplacées, tournées et mises à l'échelle sur la grille par deux points de contrôle |

Quel que soit votre choix, il est enregistré avec le projet et constitue une seule étape d'annulation ; rien ne bouge.

## Coordonnées terrain

1. Choisissez {{ui:Ground}}.
2. Saisissez le **Facteur d'échelle combiné** du levé (par exemple `0.99987`), ou calculez-le :
   1. Sous **Calculer le facteur en un point**, le point démarre au milieu du projet. Choisissez {{ui:Pick a point on the plan}} et cliquez à l'endroit voulu (un clic près d'un point topographique prend ce point), ou saisissez E et N.
   2. L'altitude vient de la surface à cet endroit ; saisissez-en une autre si nécessaire.
   3. Choisissez {{ui:Compute}}. CivilCraft affiche :
      - **Facteur d'échelle de grille k** : l'étirement de la projection cartographique à cet endroit.
      - **Facteur d'altitude** : la réduction des distances sur l'ellipsoïde par rapport à leur hauteur réelle.
      - **Facteur combiné** = k × facteur d'altitude : distance grille = distance au sol × ce facteur.
      - **Convergence** : l'angle entre le nord de la grille et le vrai nord à cet endroit (azimut géodésique = azimut grille + convergence).
   4. Choisissez le bouton {{ui:Use}} sous les nombres pour placer le facteur combiné dans la case.
3. Réglez le **Point de base**, où les coordonnées terrain et grille sont identiques. Il démarre à 0, 0 : la plupart des juridictions qui publient des coordonnées terrain mettent à l'échelle autour de l'origine, de sorte que les coordonnées terrain restent reconnaissablement proches de celles de la grille. Certains levés mettent à l'échelle autour du point de contrôle du projet : suivez ce que dit le levé.
4. Choisissez {{ui:Apply}}.

:::warning
L'altitude est prise comme hauteur au-dessus de l'ellipsoïde. CivilCraft n'a pas de modèle de géoïde : là où le géoïde se trouve à 30 m (100 ft) sous ou au-dessus de l'ellipsoïde, le facteur d'altitude est faux d'environ 5 ppm. Lorsque le levé indique son facteur combiné, saisissez celui-là.
:::

## Coordonnées locales (supposées)

1. Choisissez {{ui:Local}}.
2. Pour le **Point de contrôle 1**, saisissez le numéro du point topographique (ou choisissez {{ui:Pick}} puis cliquez dessus sur le plan). Ses coordonnées locales s'affichent à côté.
3. Saisissez ses E et N **grille**, ou sa latitude et sa longitude dans la troisième case (par exemple `30.2672, -97.7431`).
4. Faites de même pour le **Point de contrôle 2**, aussi loin du premier que possible.
5. CivilCraft affiche l'**Échelle** et la **Rotation** trouvées, et rappelle : **Deux points s'ajustent toujours exactement : vérifiez un troisième.**
6. Donnez un **Point de vérification** de la même façon. CivilCraft indique à quelle distance l'ajustement le place des coordonnées grille que vous avez saisies (son écart de fermeture, en unités du projet et en ppm). Un grand écart signale un point erroné, une erreur de saisie, ou des coordonnées dans une autre unité.
7. Choisissez {{ui:Apply}}.

Une échelle très éloignée de 1 (au-delà de 0.5 à 2) est refusée : vérifiez les points et leurs unités.

## Ce qui a été vérifié

- Le facteur d'échelle et la convergence correspondent à PROJ (pyproj 3.7.1 avec PROJ 9.5.1), la bibliothèque de coordonnées que la plupart des logiciels SIG utilisent, à 1 partie sur un milliard près, sur plus de 300 systèmes conformes (State Plane, UTM, Mercator transverse, Lambert conique conforme), et dans le navigateur pour un point choisi sur le plan.
- Les conversions terrain et locales s'effectuent dans les deux sens à 1 partie sur un milliard près ; deux points de contrôle restituent l'échelle et la rotation avec lesquelles ils ont été créés ; un point de vérification décalé de 0.05 ft montre un écart de fermeture de 0.05 ft.
