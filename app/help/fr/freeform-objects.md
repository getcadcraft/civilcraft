---
title: Objets de forme libre
summary: Importer sur le site une forme créée dans une autre application (STL, OBJ ou un élément de bibliothèque) ; elle repose sur le terrain ou y est creusée, et son volume, sa surface et son emprise sont comptés comme le reste.
keywords: forme libre, objet personnalisé, sculpture, bac à plantes, banc, maillage, stl, obj, élément de bibliothèque, tient compte du terrain, suit le terrain, creuser dans le terrain, quantités, volume, ifc
from: ec835f33
---

Un élément unique (un bac à plantes, un muret de banc, une sculpture, un monticule de jeu) peut être créé dans ModelCraft ou PartCraft, puis placé ici, afin qu'il figure dans le même modèle et les mêmes nomenclatures que tous les autres éléments.

1. Aménagement › Plus › {{ui:Objet de forme libre…}} et choisissez un fichier **STL** ou **OBJ** (dans les unités du projet : pieds dans un projet en pieds, mètres dans un projet en mètres) ou un **élément de bibliothèque** CadCraft (`.json`) avec un corps en maillage.
2. Cliquez à l'endroit où il doit aller.

## Sa base

- **Suit le terrain** : son point le plus bas repose sur le terrain le plus bas sous son emprise, de sorte que rien ne flotte. Les propriétés estiment la part qui se trouve sous le terrain.
- **Creuse le terrain** : sa base est fixée à une altitude, et le terrain à l'intérieur de son emprise est terrassé jusqu'à elle avec des talus de raccordement au terrain, comptés dans les terrassements comme une plateforme.

Tournez-le avec le champ **Tourné**, et faites-le glisser sur le plan pour le déplacer.

## Comptés

Les propriétés donnent son **volume** (pour un solide fermé), son **aire**, son **emprise** et sa **hauteur**, mesurés sur le maillage. L'export IFC l'écrit avec la **classe IFC** que vous choisissez et ces quantités.

:::note
L'emprise est l'enveloppe convexe du contour : une forme concave (un bac en L) est terrassée comme si elle était pleine.
:::
