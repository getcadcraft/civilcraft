---
title: Revêtements, murs et escaliers
summary: Revêtements avec pentes vers un drain ou un dévers, motif et composition ; cheminements qui suivent le terrain ; murs de soutènement et murs isolés avec semelles en gradins ; bordures ; rampes et escaliers contrôlés par rapport à leurs limites ; export IFC.
keywords: aménagements durs, revêtement, pavés, terrasse, patio, pentes, drain, dévers, chevrons, appareil à joints décalés, cheminement, allée, mur de soutènement, mur de jardin, semelle, chaperon, bordure, bordure de trottoir, bordure de finition, rampe, accessibilité, escaliers, contremarches, marches, palier
from: 51475877
---

Les aménagements durs sont recalculés à partir du terrain à chaque fois : ils suivent le relief et se régénèrent lorsque le terrain ou sa ligne bouge. Faites glisser leurs angles sur le plan comme pour une ligne. Ouvrez-les depuis {{ui:Aménagements durs}} dans le groupe Paysage.

## Revêtement

Cliquez sur les angles puis appuyez sur {{key:Enter}}. Dans Propriétés :

- **Niveau** : vide = niveau moyen du terrain sous le revêtement.
- **Pentes** : un niveau, un **dévers** (un % dans une direction) ou **vers un drain** : CivilCraft vous demande de cliquer à l'emplacement du drain, puis chaque angle remonte depuis le drain selon la pente. Des flèches sur le plan indiquent les pentes.
- **Motif** (quadrillage, appareil à joints décalés, chevrons) avec la dimension d'élément, le joint et l'angle ; **Largeur de bordure**. Sur une feuille, les joints inférieurs à un millimètre sont omis.
- Le revêtement fait partie de la surface projetée. Ses couches (pavés, lit de pose, fondation) entrent dans l'IFC et dans les quantitatifs.

## Cheminements

Cliquez le long du cheminement puis appuyez sur {{key:Enter}}. Il suit le terrain, avec son **dévers** orienté vers son côté droit. Un cheminement plus pentu que la **Pente maximale admise** est marqué `!` sur le plan à cet endroit, et Propriétés indique la pente atteinte.

## Murs

Cliquez le long du mur puis appuyez sur {{key:Enter}}. Un mur est **de soutènement** ou **isolé**. Sans **Sommet**, il s'élève de sa **Hauteur** au-dessus du terrain sur toute sa longueur ; saisissez un sommet pour le maintenir horizontal. Sa **semelle** se trouve à une profondeur donnée sous le terrain et descend par gradins entiers, de sorte qu'elle reste horizontale entre eux. Propriétés donnent sa longueur, ses hauteurs, la surface de sa face et ses gradins de semelle ; le plan indique les cotes de sommet et de pied du mur (TW / BW) à chaque extrémité.

:::warning
Un mur de soutènement de plus de 1.2 m (4 ft) est signalé : un ingénieur le dimensionne.
:::

## Bordures

Cliquez le long de la bordure puis appuyez sur {{key:Enter}} ; réglez sa largeur et sa hauteur émergée.

## Rampes

Cliquez du bas vers le haut puis appuyez sur {{key:Enter}}. Les niveaux proviennent du terrain à chaque extrémité, sauf si vous les saisissez. Une rampe reçoit un palier tous les 750 mm (2.5 ft) de montée et est contrôlée par rapport à la **Pente maximale admise** (1:12 par défaut) et à une largeur minimale ; Propriétés indique la longueur qu'il lui faudrait.

## Escaliers

Cliquez sur le bord avant de la première marche, puis à l'endroit où les marches atteignent le haut, et appuyez sur {{key:Enter}}. Le nombre de contremarches découle de la hauteur et de la **Contremarche maximale** ; le giron, de la règle de confort 2R + G ≈ 630 mm, jamais inférieur au **Giron minimal** ; un palier tous les **Contremarches par volée au maximum**. Propriétés indiquent si elles tiennent entre les deux points ou de combien il faut les allonger.

:::note
Les limites des rampes et des escaliers sont des valeurs par défaut signalées. Définissez celles qu'impose votre code de la construction.
:::

## Hors de CivilCraft

- Plus › {{ui:Exporter l'IFC du paysage}} : revêtements et cheminements en `IfcPavement`, murs en `IfcWall` (murs de soutènement en RETAININGWALL) avec leurs couches, bordures en `IfcKerb`, rampes en `IfcRamp`, escaliers en `IfcStair` avec leurs contremarches et marches.
- La commande **Envoyer vers TakeoffCraft** de la nomenclature des végétaux transmet les surfaces de revêtement et les volumes de couches, les surfaces de face et les longueurs des murs, les longueurs de bordures et le nombre de marches.
- La feuille de détails dessine la coupe de chaque mur, la composition de chaque revêtement et chaque volée d'escaliers. Voir [Feuilles paysagères](topic:landscape-sheets).
