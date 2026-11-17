---
title: Dessiner avec accrochages, angles choisis, et déplacer, copier, faire pivoter
summary: Placer tracés, plateformes, parcelles et lignes caractéristiques exactement sur des points et des angles existants, saisir ou choisir l'E et le N d'un angle, orienter une tangente vers deux points, et déplacer, copier ou faire pivoter un objet d'une distance ou d'un angle.
keywords: accrochage, accrochages, accrocher à un point, accrocher à un angle, PI, sommet, angle, choisir, réticule, easting, northing, coordonnées, coordonnées saisies, tangente, direction, gisement, déplacer, copier, faire pivoter, transformer, copie pivotée, dupliquer, alt, point libre, dessin
from: 49864dda
---

Nouveau dans la version 0.9 : lorsque vous dessinez, le curseur se pose sur les points et les angles déjà présents dans le plan, et un angle de plateforme, de parcelle ou de ligne caractéristique peut être saisi ou choisi. Cette rubrique décrit les trois outils.

## Ce que vous allez faire

- Dessiner avec accrochages, pour qu'un nouveau tracé, une plateforme, une parcelle ou une ligne commence et finisse exactement sur un élément existant.
- Fixer l'E et le N d'un angle, en les saisissant ou en choisissant un emplacement dans le plan.
- Orienter une tangente de tracé vers deux points choisis.
- Déplacer, copier ou faire pivoter un objet entier.

## Étapes

1. Choisissez un outil de dessin, par exemple {{ui:Tracé en plan}}, {{ui:Plateforme}}, {{ui:Parcelle}} ou {{ui:Ligne caractéristique}}. Approchez le pointeur d'un point topographique, d'un PI de tracé, d'un angle de plateforme, de parcelle ou de masse, d'un sommet de ligne caractéristique ou d'un regard. Un repère apparaît avec une étiquette (PI, Angle, Sommet, Regard, ou Point et son numéro) ainsi que l'E et le N où il se posera. Cliquez pour placer le point à cet endroit.
2. Pour placer un point librement, maintenez {{key:Alt}} pendant le clic. L'accrochage est alors désactivé.
3. Sélectionnez une plateforme, une parcelle ou une ligne caractéristique. Dans les **Propriétés**, le bloc {{ui:Angles}} liste chaque angle avec une case E et une case N. Saisissez de nouveaux nombres, ou appuyez sur le bouton réticule à côté d'un angle et cliquez à un endroit du plan. L'angle prend cet E et ce N. Appuyez sur {{key:Esc}} pour annuler un choix. Le réticule ne fonctionne que dans le plan : fermez d'abord la vue 3D.
4. Pour orienter une tangente, sélectionnez un tracé en plan. Dans les **Propriétés**, sous {{ui:Tangente à partir de deux points}}, choisissez la tangente, appuyez sur {{ui:Premier point}} et cliquez dans le plan, appuyez sur {{ui:Deuxième point}} et cliquez à nouveau, puis appuyez sur {{ui:Définir la direction}}. La tangente s'oriente du premier point vers le second et conserve sa longueur.
5. Pour déplacer, copier ou faire pivoter, sélectionnez un tracé en plan, une plateforme, une parcelle ou une ligne caractéristique. Dans les **Propriétés**, sous {{ui:Déplacer, copier et faire pivoter}}, saisissez {{ui:Déplacer vers l'est}} et {{ui:Déplacer vers le nord}} (les nombres négatifs vont vers l'ouest et le sud), puis appuyez sur {{ui:Déplacer}} ou {{ui:Copier}}. Ou appuyez sur {{ui:Distance entre deux points}} et cliquez sur le point de départ puis sur le point d'arrivée.
6. Pour faire pivoter, saisissez l'angle dans {{ui:Rotation dans le sens antihoraire}} (en degrés), puis appuyez sur {{ui:Faire pivoter}} ou {{ui:Copier en pivotant}}. L'objet pivote autour du milieu de ses angles, sauf si vous choisissez un point de pivot avec le réticule à côté de l'angle.

## Remarques

- Une copie laisse l'original en place et est sélectionnée ensuite.
- Chaque déplacement, copie, rotation, angle choisi et tangente orientée est une étape d'annulation.
- Les accrochages s'étendent à 10 pixels à l'écran autour du curseur. Un repère d'accrochage ne fait que proposer un emplacement : rien ne change tant que vous ne cliquez pas.
- Le même réticule se trouve sur les lignes de PI d'un tracé. Voir [Tracés en plan](topic:alignment), [Parcelles](topic:parcels) et [Lignes caractéristiques](topic:feature-lines).
