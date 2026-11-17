---
title: Sélection au lasso de points topographiques
summary: Maintenez Maj et glissez un contour à main levée autour de points topographiques pour les sélectionner, en fenêtre, en capture ou en clôture ; changez avec Espace pendant le glissement. Un glissement droit trace toujours un cadre.
keywords: lasso, main levée, sélectionner des points, sélection, fenêtre, capture, clôture, espace, polygone, sélection par cadre, glisser avec maj
from: 3dd4fcaa
---

## Ce que vous allez apprendre

Comment sélectionner des points topographiques en les contournant, lorsqu'un cadre prendrait des points que vous ne voulez pas.

## Tracer un lasso

1. Cliquez sur {{ui:Sélectionner}} (ou appuyez sur {{key:V}}).
2. Maintenez la touche {{key:Shift}} enfoncée, appuyez sur le plan et faites glisser **autour** des points voulus, en allant d'abord **vers la droite**.
3. Relâchez.

Les points situés à l'intérieur du contour sont ajoutés à la sélection. Un glissement qui reste proche d'une ligne droite trace un cadre, comme auparavant ; dès qu'il s'écarte de cette ligne (de plus d'environ 12 pixels), il devient un lasso.

## Fenêtre, capture et clôture

| Vous glissez | Lasso | Sélectionne |
|---|---|---|
| Vers la droite d'abord | Fenêtre (contour plein) | Les points à l'intérieur |
| Vers la gauche d'abord | Capture (en pointillés, vert) | Les points à l'intérieur, et les points que le contour touche |
| Appuyez sur {{key:Space}} pendant le glissement | Fenêtre, puis capture, puis clôture | Clôture (un trajet en pointillés orange, non fermé) : les points que le trajet survole |

La ligne d'état indique le nom du lasso pendant que vous glissez. {{key:Esc}} pendant le glissement l'annule et ne sélectionne rien.

:::tip
Une clôture est le moyen rapide de choisir les points de levé le long d'une bordure ou d'un fossé : glissez le long de ceux-ci et relâchez.
:::

## Voir aussi

- [Sélectionner, copier et coller des points topographiques](topic:copy-paste-points)
- [Touches et souris](topic:keyboard)
