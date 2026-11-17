---
title: Analyser les couches SIG
summary: Zone tampon, superposition (intersection, union, effacement, dissolution), jointure spatiale, sélection par attribut et mesure des couches SIG d'un projet, chacune sous forme de nouvelle couche annulable.
keywords: sig, analyse, zone tampon, superposition, intersection, union, effacer, découper, dissoudre, jointure spatiale, jointure, sélection par attribut, requête, où, expression, statistiques, aire, longueur, périmètre, mesure, parcelles, servitude, recul, shapefile, geopackage, table attributaire
from: a6b2d3f9
---

Une fois qu'un projet contient des couches SIG (voir [Importer des données SIG](topic:gis-import)), le bouton **Analyser** du groupe SIG (saisi `GISANALYSIS`, `ANALYZE` ou `BUFFER`) ouvre un panneau à cinq onglets. Il reste ouvert à côté du plan : ce que vous sélectionnez est dessiné sur le plan pendant votre travail.

Chaque outil qui produit quelque chose **ajoute une nouvelle couche** et laisse intactes les couches qu'il a lues. Chacun constitue une seule étape d'annulation : {{ui:Undo}} dans le panneau (ou Ctrl+Z) supprime la nouvelle couche. Exportez le résultat comme n'importe quelle couche avec [Exporter les données de récolement pour le SIG](topic:gis-export), au format shapefile, GeoJSON ou GeoPackage.

La table complète d'une couche, avec tri, modification et calculatrice de champs, est décrite dans [Travailler avec la table attributaire d'une couche](topic:gis-table) ; la coloration selon un champ est décrite dans [Styliser une couche par un attribut](topic:gis-symbology).

Tout se travaille dans le plan, dans les unités du projet (pieds ou mètres). Un projet est toujours dans un système projeté ou local : une distance de 50 signifie donc 50 pieds ou 50 mètres, jamais des degrés. Les hauteurs (z) ne sont pas conservées dans les résultats.

## Zone tampon

Trace une zone à une distance donnée autour de chaque entité, sous forme de nouvelle couche de polygones. Les points deviennent des cercles, les lignes deviennent des corridors aux extrémités arrondies, et les polygones s'agrandissent. Une distance **négative** réduit les polygones (un carré de 100 sur 100 réduit de 5 devient 90 sur 90 ; réduit de 60, il ne reste rien, et le panneau l'indique). Prenez la distance dans un champ numérique pour donner sa propre distance à chaque entité, ou cochez **Fusionner toutes les zones tampons en une seule forme** pour les dissoudre.

Les parties arrondies sont des segments droits tracés à l'intérieur de la vraie courbe : une zone tampon est donc un tout petit peu plus petite que le cercle exact, d'environ 0.6 % en surface au réglage normal, et de 0.16 % au réglage Fin. Utilisez Fin pour tout ce que vous mesurerez.

## Superposition

| Outil | Ce que vous obtenez |
|---|---|
| Intersection | Les morceaux où la couche d'entrée rencontre les polygones de superposition, chacun avec les champs des deux couches. Les lignes et les points sont découpés selon les polygones. |
| Union | Les deux couches de polygones, découpées le long des contours l'une de l'autre : les morceaux communs portent les champs des deux couches, les autres portent ceux d'une seule couche (les champs de l'autre restent vides). |
| Effacement | Les polygones d'entrée, moins les polygones de superposition. Les champs restent ceux de l'entrée. Une entité entièrement effacée est retirée (le panneau les compte). |
| Dissolution | Fusionne les polygones qui se touchent ou se chevauchent, tous ensemble, ou une forme par valeur d'un champ. Ajoute `COUNT` et `AREA`. |

Un nom de champ présent dans les deux couches est conservé pour la première couche, et celui de la seconde est écrit avec `_2`. Les entités d'une même couche ne devraient pas se chevaucher : lorsque c'est le cas, une union compte le chevauchement dans les deux.

## Jointure

Une jointure spatiale copie les attributs d'une couche **source** sur chaque entité **cible** qu'elle rencontre, et donne une nouvelle couche avec les formes de la cible. Choisissez la condition de rencontre : contact ou chevauchement, cible située à l'intérieur d'un polygone source, cible qui contient l'entité source, entité source la plus proche (avec une limite facultative), ou toute entité source à une distance donnée.

Lorsque plusieurs entités source correspondent, vous prenez les attributs de la première (la plus proche, pour les jointures au plus proche et à distance ; `DISTANCE` est ajouté), ou vous les **comptez et totalisez leurs champs numériques** : `COUNT`, et `SUM_`, `MEAN_`, `MIN_`, `MAX_` pour chaque champ numérique. Décochez **Conserver les entités cibles sans correspondance** pour les retirer. Les champs joints restent vides là où rien ne correspond, et le panneau compte les entités sans correspondance.

## Sélection

Tapez une question sur les attributs ou la forme, appuyez sur **Sélectionner**, et les entités sont dessinées sur le plan avec leur nombre, une table et l'aire, la longueur ou le total. Vous pouvez ensuite en faire une couche distincte, zoomer dessus ou effacer la sélection.

| Vous pouvez écrire | Exemple |
|---|---|
| Un champ par son nom ; utilisez "guillemets" ou [crochets] si le nom contient des espaces | `VALUE`, `"Lot Number"` |
| Nombres, 'texte', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (le texte ignore la casse ; avec `like`, `%` représente une suite quelconque de caractères et `_` une lettre) | `Notes contains 'corner'` |
| `is null`, `is not null` (une valeur vide compte comme null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` et parenthèses | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Valeurs de forme `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Une question incomplète, ou qui nomme un champ absent de la couche, est refusée par une phrase qui indique où se trouve le problème.

## Mesure

Affiche l'aire totale et le périmètre, la longueur ou le nombre d'entités de la couche, et **ajoute des champs** à celle-ci : `AREA` et `PERIMETER` pour les polygones, `LENGTH` pour les lignes (longueur sur le plan), `X` et `Y` pour les points. Un champ qui existe déjà n'est jamais écrasé : le nouveau s'appelle `AREA_2`. C'est une seule étape d'annulation. **Statistiques** donne le nombre, la somme, la moyenne, le minimum et le maximum d'un champ numérique, éventuellement pour chaque valeur d'un autre champ.

:::note
Les vérifications de ces outils sont calculées à la main dans le test (`node bin/test-civilcraft-gisanalysis.mjs`) : par exemple, des parcelles de 100 sur 100 sous une zone de 100 sur 80 se recoupent sur 3,000 et 3,000, et une ligne de 100 de long, tamponnée de 10, vaut 2,000 et un cercle.
:::
