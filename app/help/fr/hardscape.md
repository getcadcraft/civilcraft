---
title: Revêtements, murs et marches
summary: Revêtements avec pentes vers un drain ou une pente transversale, motif et structure ; chemins qui suivent le terrain ; murs de soutènement et murs autoportants avec semelles en gradins ; bordures ; rampes et marches vérifiées par rapport à leurs limites ; export IFC.
keywords: aménagements durs, revêtement, pavés, terrasse, patio, pentes, drain, pente transversale, à chevrons, appareil à joints décalés, chemin, cheminement, mur de soutènement, mur de jardin, semelle, couvertine, bordure, rampe, accessibilité, marches, escaliers, contremarches, girons, palier
from: d34b4466
---

Les aménagements durs sont recalculés à partir du terrain à chaque fois ; ils suivent donc le relief et se régénèrent lorsque le terrain ou sa ligne bouge. Faites glisser leurs angles sur le plan comme n'importe quelle ligne. Ouvrez-les depuis {{ui:Aménagements durs}} dans le groupe {{ui:Paysage}}.

## Revêtement

Cliquez sur les angles et appuyez sur {{key:Enter}}. Dans les Propriétés :

- **Niveau** : vide = la moyenne du terrain en dessous.
- **Pentes** : niveau, une **pente transversale** (un % vers une direction) ou **vers un drain** : CivilCraft vous demande de cliquer à l'endroit où se trouve le drain, puis chaque angle remonte depuis le drain selon la pente. Des flèches sur le plan indiquent les pentes.
- **Motif** (quadrillage, appareil à joints décalés, à chevrons) avec la dimension de l'élément, le joint et l'angle ; **Bordure** (largeur). Sur une feuille, les joints inférieurs à un millimètre sont omis.
- Le revêtement fait partie de la surface projet. Ses couches (pavés, lit de pose, fondation) entrent dans l'IFC et dans les quantités.

## Chemins

Cliquez le long du chemin et appuyez sur {{key:Enter}}. Il suit le terrain, avec sa **pente transversale** vers son côté droit. Un chemin plus raide que la **Pente maximale admise** est marqué `!` sur le plan à cet endroit, et les Propriétés indiquent sa pente maximale.

Là où un chemin rencontre une route construite par un corridor, il s'arrête au bord extérieur de la route, au niveau du trottoir ou de l'accotement à cet endroit, dans la surface projet et dans la vue 3D. Un chemin qui traverse une route est calculé et représenté en deux tronçons, et une extrémité tracée à moins de deux fois la largeur du chemin de la route est prolongée jusqu'à son bord. Le plan montre toujours le chemin tel que vous l'avez tracé, et sa longueur et sa surface comptent la ligne entière. Voir [Balayer un corridor routier](topic:corridor).

## Murs

Cliquez le long du mur et appuyez sur {{key:Enter}}. Un mur est **de soutènement** ou **autoportant**. Sans **Sommet**, il s'élève de sa **Hauteur** au-dessus du terrain sur toute sa longueur ; saisissez un sommet pour le maintenir à niveau. Sa **semelle** se trouve à une profondeur fixe sous le terrain et descend par gradins entiers, de sorte qu'elle reste horizontale entre eux. Les Propriétés donnent sa longueur, ses hauteurs, la surface de sa face et ses gradins de semelle ; le plan indique le sommet et le pied du mur (TW / BW) à chaque extrémité.

:::warning
Un mur de soutènement de plus de 1.2 m (4 ft) est signalé : un ingénieur doit le concevoir.
:::

## Bordures

Cliquez le long de la bordure et appuyez sur {{key:Enter}} ; réglez sa largeur et sa hauteur émergée.

## Rampes

Cliquez depuis le bas jusqu'en haut et appuyez sur {{key:Enter}}. Les niveaux proviennent du terrain à chaque extrémité, sauf si vous les saisissez. Une rampe reçoit un palier tous les 750 mm (2.5 ft) de montée et est vérifiée par rapport à la **Pente maximale admise** (1:12 au départ) et à une largeur minimale ; les Propriétés indiquent la longueur qu'elle devrait avoir.

## Marches

Cliquez sur le bord avant de la première marche, puis à l'endroit où les marches atteignent le haut, et appuyez sur {{key:Enter}}. Le nombre de contremarches provient de la hauteur et de la **Contremarche maximale** ; le giron est déduit de la règle de confort 2R + G ≈ 630 mm, sans jamais descendre sous le **Giron minimal** ; un palier tous les **Contremarches par volée au maximum**. Les Propriétés indiquent si elles tiennent entre les deux points ou de combien elles doivent être allongées.

:::note
Les limites des rampes et des marches sont des valeurs par défaut indicatives. Réglez celles qu'exige le code du bâtiment.
:::

## Hors de CivilCraft

- {{ui:Plus}} › {{ui:Exporter l’IFC du paysage}} : revêtements et chemins en `IfcPavement`, murs en `IfcWall` (murs de soutènement en RETAININGWALL) avec leurs couches, bordures en `IfcKerb`, rampes en `IfcRamp`, marches en `IfcStair` avec leurs contremarches et leurs girons.
- Le bouton **Envoyer vers TakeoffCraft** du tableau des plantations transmet les surfaces de revêtement et les volumes des couches, les surfaces de face et les longueurs des murs, les longueurs de bordure et le nombre de marches.
- La feuille de détails dessine la section de chaque mur, la structure de chaque revêtement et chaque volée de marches. Voir [Feuilles paysagères](topic:landscape-sheets).
