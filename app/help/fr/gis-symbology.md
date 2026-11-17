---
title: Styliser une couche par un attribut
summary: Colorer les entités d'une couche SIG selon les valeurs d'un champ (une couleur par valeur, ou par plages de nombres), dimensionner les points selon un nombre, teinter les polygones et afficher une légende sur le plan.
keywords: symbologie, style, couleur, par catégories, gradué, valeurs uniques, intervalle égal, quantile, ruptures naturelles, jenks, rampe, daltonisme, légende, taille, points, choroplèthe, classes, sig
from: a3a69add
---

Ouvrez le menu à **trois points** de la couche dans la liste des couches SIG, et choisissez {{ui:Style by attribute…}}.

## Trois styles

- **Symbole unique :** la couleur de la couche, comme avant.
- **Par catégories :** une couleur par valeur distincte d'un champ quelconque. Jusqu'à huit valeurs reçoivent les huit couleurs Okabe-Ito (choisies pour rester distinctes pour les formes courantes de daltonisme) ; au-delà, les sept valeurs les plus fréquentes reçoivent chacune une couleur, et les autres partagent une classe grise **Autre**. Les entités sans valeur sont grises.
- **Gradué :** un champ numérique est découpé en 2 à 9 plages, chacune avec une couleur d'une rampe. Une valeur située sur une limite va dans la plage inférieure.

## Découpage des plages

| Méthode | Limites |
|---|---|
| Intervalle égal | La plage allant de la plus petite à la plus grande valeur est divisée en largeurs égales. Valeurs de 0 à 30 en trois plages : 0, 10, 20, 30. |
| Quantile | Environ le même nombre d'entités dans chaque plage. Les limites sont lues dans les valeurs triées, avec l'interpolation linéaire habituelle : pour 1 à 10 en deux plages, la limite est 5.5. |
| Ruptures naturelles (Jenks) | Les coupures qui laissent le moins de dispersion à l'intérieur de chaque plage, de sorte que les groupes de valeurs proches restent ensemble. Au-delà de 1,500 valeurs, il travaille sur 1,500 valeurs régulièrement réparties, et le signale. |

## Couleurs

Viridis et Cividis vont du sombre au clair avec une variation de luminosité régulière, de sorte que l'ordre des plages reste lisible même en gris ou pour une personne daltonienne. Blues va du clair au sombre. Rouge à bleu est une rampe bipolaire pour des valeurs autour d'un milieu. **Inverser les couleurs** retourne n'importe laquelle d'entre elles. La boîte de dialogue liste les plages et le nombre d'entités de chacune avant d'appliquer.

## Taille, remplissage et légende

- **Taille des points selon** un champ numérique : chaque point a un carré d'autant plus grand que sa valeur est élevée, entre les deux tailles que vous donnez (la moitié du côté, en millimètres sur papier).
- **Teinter l'intérieur des polygones** remplit chaque polygone de la couleur de sa classe (les trous restent vides). La teinte est à l'écran ; les tracés et les DXF/DWG affichent les contours colorés.
- **Afficher une légende sur le plan** dessine les classes, leur nombre d'entités et la plage de tailles dans le coin inférieur gauche du plan. La légende est à l'écran ; elle ne figure pas dans un tracé.
- Pour étiqueter les entités avec un champ, utilisez **Étiqueter avec** dans le même menu.

Le style est enregistré dans le fichier du projet. Une version qui ne connaît pas les styles ouvre le fichier avec la couleur de la couche. Les tracés, DXF et DWG reprennent les classes sous forme de calques distincts nommés d'après la couche et la classe, dans la couleur CAO de base la plus proche parmi les neuf couleurs de base. Une couche de plus de 200,000 entités est dessinée dans une seule couleur.
