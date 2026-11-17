---
title: Épures de giration des véhicules
summary: Faites rouler un véhicule avec jusqu'à trois remorques le long d'une ligne caractéristique ou d'un tracé en plan, en marche avant ou arrière, et voyez la surface balayée, les trajectoires des roues, le braquage et l'endroit où il se met en portefeuille.
keywords: épure de giration, trajectoire de braquage, simulation de giration, gabarit de braquage, véhicule de référence, camion, bus, remorque, semi-remorque, marche arrière, recul, mise en portefeuille, articulation, butée de braquage, débattement, trajectoire de roue, quai de chargement, rayon de braquage
from: 8caafb8a
---

Une épure de giration fait rouler un véhicule le long d'une ligne et montre le sol que traverse sa carrosserie. Utilisez-la pour vérifier qu'un camion peut prendre un virage, atteindre un quai de chargement ou reculer une remorque en place sans sortir de la chaussée.

## Faire rouler un véhicule le long d'une ligne

1. Dessinez la ligne suivie par le véhicule, dans le sens de la marche : une ligne caractéristique (les arcs sont acceptés : appuyez sur {{key:C}} pendant le tracé, voir [Lignes caractéristiques](topic:feature-lines)) ou un tracé en plan.
2. Sélectionnez-la et cliquez sur {{ui:Épure de giration…}} dans ses **Propriétés**.
3. Sous **Partir de**, choisissez un véhicule, puis réglez ses dimensions d'après votre propre véhicule de référence : largeur, débord avant, empattement, débord arrière, voie et **Butée de braquage**. Ajoutez jusqu'à trois remorques, chacune avec son point d'attelage, sa longueur de l'attelage à son essieu, ses débords et son **Articulation maximale**.
4. Choisissez le **Sens de conduite** : marche avant ou marche arrière. Cliquez sur {{ui:Simuler}}.

:::warning
Les véhicules de départ sont des valeurs provisoires, pas une norme. Réglez les dimensions d'après le véhicule de référence utilisé par votre projet.
:::

## Marche avant et marche arrière

| Sens | Ce qui suit la ligne | Ce que CivilCraft calcule |
|---|---|---|
| **Marche avant** | Le centre de l'essieu avant | Où vont l'essieu arrière et chaque remorque, l'angle de braquage et l'articulation |
| **Marche arrière** | Le centre du dernier essieu (l'arrière de la remorque) | Où va chaque unité devant, et le braquage que la cabine doit appliquer pour mettre la remorque en place |

La marche arrière sert à vérifier une manœuvre de recul : indiquez où la remorque doit aller, et CivilCraft dit si la cabine peut y parvenir.

## Lire le résultat

L'épure de giration est dessinée sur le plan en orange : son contour et, en pointillé, les trajectoires des roues extérieures. Sélectionnez-la (cliquez à l'intérieur) pour voir dans **Propriétés** :

- **Longueur parcourue**, le plus grand angle de **Braquage** et l'**Articulation** par rapport à leurs limites, et la **Surface balayée**.
- Tout problème le long de la ligne, avec sa distance : le braquage au-delà de la butée, ou une remorque qui tourne au-delà de sa limite d'articulation (elle se met en portefeuille).
- **Le véhicule le long de la ligne** : déplacez le curseur pour voir le véhicule en n'importe quel point, avec son braquage et son articulation à cet endroit.

Modifiez la ligne, et l'épure suit. {{ui:Modifier le véhicule…}} change les dimensions ; **Sens de conduite** bascule entre marche avant et marche arrière. Chaque modification est une étape : {{key:Mod+Z}} l'annule. {{key:Delete}} supprime l'épure sélectionnée (la ligne reste).

Le contour et les trajectoires des roues vont dans le PDF, le DXF et le DWG, sur le calque C-ROAD-SWPT.

## Calcul

Chaque unité pivote autour de l'axe de son essieu arrière et est entraînée par le point qui se trouve devant elle (l'essieu avant, ou le point d'attelage), selon le modèle à faible vitesse et sans glissement que les vérifications d'épures utilisent. La surface balayée est la réunion des contours de la carrosserie à chaque position. Le modèle ne prend pas en compte la vitesse, le glissement des pneus, le temps que met la direction à tourner, les remorques directrices ni le dégagement sous la caisse.
