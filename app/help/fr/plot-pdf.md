---
title: Tracer le plan en PDF
summary: Tracer l'ensemble ou la vue actuelle en PDF vectoriel sur une feuille standard, à une échelle d'ingénierie ou métrique, en couleurs de calques ou en noir.
keywords: tracer, imprimer, pdf, feuille, échelle, format de papier, feuille de plan, publier, cartouche, flèche du nord, échelle graphique
from: 9af396ca
---

{{ui:PDF}} trace le plan en PDF vectoriel sur une feuille, avec un cartouche, une flèche du nord et une échelle graphique. Le PDF est produit dans le navigateur et téléchargé ; il ne passe pas par la boîte de dialogue d'impression du navigateur.

## Tracer

1. Réglez le plan dans **Affichage** : la surface affichée, l'équidistance des courbes de niveau et les éléments visibles. Le tracé suit ces réglages.
2. Si vous ne voulez qu'une partie du site, zoomez et faites défiler le plan jusqu'à elle.
3. Cliquez sur {{ui:PDF}} dans le groupe **Exporter**, ou appuyez sur {{key:Mod+P}}.
   La boîte de dialogue **Tracer le plan en PDF** s'ouvre.
4. Choisissez la **Zone** : {{ui:Tout}} ou {{ui:Ce qui est à l'écran}}.
5. Choisissez le **Papier** : Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 ou A1. Un projet en pieds démarre sur Tabloid, un projet en mètres sur A3. Les feuilles sont toujours en paysage.
6. Choisissez l'**Échelle**. La liste marque la plus grande échelle qui convient avec « (convient) » et la sélectionne.
   - Pieds : 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Mètres : 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Choisissez l'**Encre** : {{ui:Couleurs des calques}} ou {{ui:Noir}}.
8. Lisez la ligne sous les choix. Elle donne la taille de la zone sur papier et le format de feuille, par exemple « La zone fait 297 × 222 mm à 1" = 40' sur une feuille de 432 × 279 mm (paysage). »
9. Cliquez sur {{ui:Télécharger le PDF}}.
   Le navigateur télécharge `<name>.pdf`. La barre d'état indique « Tracé : <name>.pdf à 1" = 40' ».

Si la zone est plus grande que la feuille à l'échelle choisie, le tracé est centré et les bords sont coupés. Choisissez l'échelle marquée « (convient) » ou une feuille plus grande.

## Contenu de la feuille

- Le plan, centré dans la zone de dessin, en vrais vecteurs : courbes de niveau, libellés, tracés avec repérage kilométrique, corridors, plateformes et lignes de raccordement, canalisations, points.
- Épaisseurs de trait par calque : tracés, plateformes et canalisations plus épais ; triangles et courbes secondaires plus fins.
- Un cartouche le long du bas, avec le **Nom** du projet, l'échelle, une mention de l'équidistance des courbes et de la surface utilisée (existante ou terrassée), ainsi que la date et la version à droite.
- Une flèche du nord dans l'angle supérieur droit (le nord du plan est vers le haut) et une échelle graphique dans le cartouche.
- Les couches cartographiques affichées sous le plan (une image, des tuiles de carte ou un service de carte), lorsque **Couches cartographiques sous le plan** est cochée : elles sont dessinées en une seule image de toute la zone de dessin à 150 points par pouce, sous le tracé, et la mention d'attribution d'une carte va dans le cartouche. CivilCraft attend jusqu'à 8 secondes les images de carte encore en cours de réception ; si certaines manquent encore, la barre d'état l'indique.

Le texte utilise la police Helvetica intégrée au PDF. Les caractères hors du jeu d'Europe occidentale (Windows-1252) s'impriment sous la forme « ? », et le message d'état les compte.

## Ce qui n'est pas tracé

- Les bandes d'altitude.
- La vue du profil. Le tracé des profils n'est pas encore disponible.
- Plus d'une feuille (pour un tracé, utilisez les [feuilles de plan et de profil en long](topic:plan-profile-sheets)), fenêtres de présentation, cartouche personnalisé ou feuilles en mode portrait.

:::note
La boîte de dialogue indique que les flèches de pente ne sont affichées qu'à l'écran. Dans cette version, les flèches de pente activées sous **Affichage** sont tracées (et exportées en DXF). Désactivez-les avant le tracé si vous n'en voulez pas.
:::

## Impression sur papier

Ouvrez le PDF téléchargé dans n'importe quel lecteur PDF et imprimez-le à 100 % (taille réelle) pour que l'échelle reste exacte. « Ajuster à la page » modifie l'échelle.
