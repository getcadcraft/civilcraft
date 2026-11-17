---
title: Modifier un point topographique
summary: Modifier le numéro, les coordonnées, l'altitude ou la description d'un point, ou le faire glisser vers un nouvel emplacement sur le plan.
keywords: modifier point, déplacer point, changer altitude, renuméroter, numéro de point, description, glisser, nord, est, fixer un point, tir erroné
from: 375ae2e9
---

Un tir erroné, une mauvaise hauteur de mire, une description mal saisie : corrigez le seul point, et la surface suit.

## Modifier les valeurs d'un point

1. Avec {{ui:Sélectionner}}, cliquez sur le point sur le plan. **Propriétés** affiche son numéro, sa coordonnée est, sa coordonnée nord, son altitude et sa description, dans des cases.
2. Saisissez la nouvelle valeur et appuyez sur {{key:Enter}} (ou cliquez ailleurs). Laissez **Altitude** vide pour un point sans altitude.
3. La surface, les courbes de niveau et tout ce qui en dépend se mettent à jour immédiatement.

Chaque modification constitue une étape : {{key:Mod+Z}} l'annule et {{key:Mod+Y}} la rétablit. Une valeur que CivilCraft ne peut pas utiliser (un numéro déjà attribué à un autre point, des lettres dans une coordonnée) est refusée : la case est encadrée et la barre d'état indique la raison.

Un nouveau code de description crée un nouveau groupe de points, comme le fait un import (voir [Construire une surface](topic:build-surface)).

## Déplacer un point sur le plan

1. Sélectionnez le point (il reçoit un anneau).
2. Faites glisser l'anneau. La barre d'état affiche la coordonnée est et la coordonnée nord de la nouvelle position.
3. Relâchez pour déplacer le point ; son altitude reste la même. Appuyez sur {{key:Esc}} avant de relâcher pour le remettre en place.

## Les lignes de rupture suivent le point

Une ligne de rupture tracée avec l'outil {{ui:Ligne de rupture}} copie les points qu'elle traverse. Lorsque vous déplacez un point ou modifiez son altitude, les sommets de la ligne de rupture qui s'y trouvent se déplacent avec lui, dans la même étape. Les groupes de lignes de rupture créés à partir de descriptions sont toujours reconstruits à partir des points.

:::note
Une surface lue depuis un fichier LandXML conserve ses propres triangles : les modifications de points ne la changent qu'après {{ui:Reconstruire la surface à partir des points}}.
:::
