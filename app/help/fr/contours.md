---
title: Lire les courbes de niveau, les altitudes et les pentes
summary: Régler l'équidistance des courbes et les courbes maîtresses, afficher les tranches d'altitude, les flèches de pente et les triangles, et lire les altitudes du terrain sous le pointeur.
keywords: courbes de niveau, équidistance, courbes maîtresses, cotes, tranches d'altitude, flèches de pente, triangles, altitude ponctuelle, analyse de surface, analyse d'altitude, analyse de pente
from: 585e500a
---

La surface est affichée avec ses courbes de niveau dès qu'elle existe. Tout ce qui est décrit dans cette rubrique se règle sous **Affichage**, dans le panneau de gauche. Les réglages d'affichage ne modifient que ce que vous voyez (et ce que vous exportez) ; ils ne sont pas des étapes d'annulation.

## Régler l'équidistance des courbes

1. Sous **Affichage**, choisissez une valeur dans **Courbes tous les**.
   - En pieds : 0.25, 0.5, 1, 2, 5, 10 ou 20 ft.
   - En mètres : 0.1, 0.25, 0.5, 1, 2, 5 ou 10 m.
2. Choisissez **Maîtresses tous les** : la 2e, la 4e, la 5e ou la 10e courbe.
   Les courbes maîtresses sont tracées plus épaisses et annotées de leur altitude. Elles tombent sur des multiples entiers de l'espacement des maîtresses (avec des courbes de 1 ft et une maîtresse sur cinq : 245, 250, 255 …).
3. Désactivez {{ui:Cotes des courbes de niveau}} si les cotes encombrent un petit plan.

Un nouveau projet démarre avec une équidistance de 1 unité, la cinquième courbe étant maîtresse. Les courbes s'infléchissent aux lignes de rupture ; si elles coupent en ligne droite une ligne d'écoulement ou une crête, cette ligne n'est pas encore une ligne de rupture (voir [Construire et affiner la surface](topic:build-surface)).

:::note
Les courbes ne sont tracées que s'il y a au plus 2 000 niveaux entre le point le plus bas et le point le plus haut. Sur un site très accidenté avec une équidistance très petite, le plan n'affiche aucune courbe : choisissez une équidistance plus grande.
:::

## Lisser les courbes

Les courbes sont tracées sous forme de segments droits, un par triangle de la surface, si bien qu'elles forment un petit angle à chaque arête de triangle. **Lissage des courbes**, sous **Affichage**, arrondit ces angles :

- **Aucun (segments droits)** : les lignes tracées telles quelles. C'est ce que montrent un dessin nouveau ou ancien.
- **Léger** : angles légèrement arrondis. Une ligne ne se déplace jamais de plus de 10 % du chemin vers la courbe suivante, et jamais plus loin de son segment droit que le sixième de la longueur de ce segment.
- **Fort** : une courbe fluide. Une ligne ne se déplace jamais de plus de 25 % du chemin vers la courbe suivante, et jamais plus loin de son segment droit que le tiers de la longueur de ce segment.

Dans les deux cas, une courbe lissée croise toujours chaque arête de triangle au même point que la courbe tracée, reste à l'intérieur du triangle traversé par chaque segment, et ne peut donc jamais croiser ni toucher une autre courbe. Là où une courbe croise une ligne de rupture ou la limite, elle conserve son angle vif. Les lignes lissées sont celles qui sont tracées et exportées (DXF, DWG, PDF, GIS et 3D), avec plus de sommets que les lignes tracées.

Le lissage ne modifie que les lignes dessinées. Les altitudes, les volumes, les profils et les coupes sont toujours lus dans la surface elle-même. Une courbe qui passe exactement par des points topographiques (un point à 250.00 sur la courbe 250) conserve un petit angle à chacun de ces points.

## Comment est construite la surface sous les courbes

Les courbes suivent la surface, et la surface suit la **Méthode de tracé des courbes** sous **Surface**, dans le panneau de gauche. Par défaut, **Triangulation avec interpolation linéaire** relie vos points en triangles et conserve exactement chaque point et chaque ligne de rupture. Les autres méthodes ajustent d'abord une grille régulière aux points (krigeage, courbure minimale, plus proche voisin, distance inverse et autres). Elles donnent des courbes plus arrondies entre les points, mais ne passent pas exactement par chaque point ; le rapport de surface sous **Surface** indique l'écart du résultat à vos points.

**ABOS** (approximation fondée sur le lissage) est l'une des méthodes par grille. Elle a deux réglages propres : **Lissage** (0.5 pour commencer ; plus bas = plus lisse) et **Précision** (1 pour commencer : la surface est ramenée à 1 % de l'étendue des altitudes du site à vos points ; saisissez un nombre plus petit pour un ajustement plus serré). Si elle ne peut pas atteindre la précision sur la grille dont elle dispose, le rapport de surface le signale : saisissez un **Espacement de grille** plus petit.

## Lire une altitude n'importe où

Déplacez le pointeur sur le plan. La barre d'état affiche :

- **E** et **N** sous le pointeur
- **Terrain** et l'altitude du terrain existant à cet endroit, interpolée sur le triangle sous le pointeur
- **Terrassé** et l'altitude projetée, là où une plateforme ou un corridor a modifié le terrain
- « Hors de la surface » en dehors de la surface

Pour lire exactement un point topographique, choisissez {{ui:Sélectionner}} et cliquez sur le point : le panneau de droite affiche son numéro, son E, son N, son altitude, sa description et son groupe.

## Afficher les tranches d'altitude

1. Cochez {{ui:Tranches d'altitude}}.
   La surface est remplie de couleurs, du bas (bleu-vert) au haut (ocre-brun). Une légende sous les cases à cocher indique la plage d'altitude de chaque tranche.
2. Choisissez le nombre de tranches dans **Tranches** : 5, 8, 10 ou 12. Les tranches découpent la plage des altitudes, de la plus basse à la plus haute, en paliers égaux.

Les tranches ne servent qu'à regarder. Elles ne sont ni exportées en DXF, ni tracées en PDF.

## Afficher les flèches de pente

Cochez {{ui:Flèches de pente}}. Une courte flèche sur chaque triangle assez grand pour la contenir indique la descente. Les triangles plats n'ont pas de flèche. Les flèches servent à vérifier rapidement le sens d'écoulement ; la valeur de la pente elle-même n'est pas encore affichée.

## Afficher les triangles, les points et les arêtes

- {{ui:Triangles}} affiche les arêtes du TIN. Activez-le pour vérifier comment la surface relie les points, surtout le long des lignes de rupture et sur le pourtour.
- {{ui:Points}} affiche chaque point topographique ; {{ui:Libellés de points}} ajoute son numéro, son altitude et sa description (ou seulement une partie : voir **Libellés de points** dans [Paramètres de CivilCraft](topic:settings)).
- {{ui:Lignes de rupture}} affiche les lignes de rupture (et la limite) en orange.
- {{ui:Bord de la surface}} affiche le contour de la surface.

## Existant ou projeté

Une fois qu'une plateforme ou un corridor se terrasse sans problème, **Surface** sous **Affichage** propose {{ui:Projet (terrassé)}}. Les courbes, les tranches et les flèches montrent alors la surface terrassée, pour voir le nouveau terrain et les raccordements autour. Revenez à {{ui:Terrain existant}} pour voir le levé.

## Ce qui est exporté

Les sorties DXF et PDF suivent ces réglages : ce que vous avez désactivé n'est pas écrit, et les courbes sont celles de la surface affichée. Les tranches d'altitude ne sont jamais exportées.
