---
title: Travailler avec la table attributaire d'une couche
summary: Voir chaque entité d'une couche SIG sous forme de table, la trier et la filtrer, sélectionner lignes et entités ensemble, corriger des valeurs, ajouter des champs, calculer de nouvelles valeurs et enregistrer la table en CSV.
keywords: table attributaire, table, champs, colonnes, lignes, trier, filtrer, expression, sélectionner, modifier, calculatrice de champs, calculer, ajouter un champ, renommer un champ, supprimer un champ, csv, exporter, sig, shapefile, geopackage, symbologie
from: fd9d6c11
---

Ouvrez la table d'une couche depuis son menu **trois points** dans la liste des couches SIG ({{ui:Attribute table…}}), depuis Surface › Plus › {{ui:Attribute table}}, ou en saisissant `ATTRIBUTES`, `ATTTABLE` ou `TABLE`. La table s'ouvre à côté du plan et reste ouverte pendant votre travail. Seules les lignes visibles sont dessinées : une couche de milliers d'entités s'ouvre et défile donc rapidement.

## Trier, filtrer, sélectionner

- **Trier :** cliquez sur un titre de colonne. Un second clic inverse l'ordre, un troisième rétablit l'ordre du fichier. Les valeurs vides restent toujours en bas. Le tri ne change que ce que vous voyez, jamais la couche.
- **Filtrer :** saisissez dans la zone de filtre. Une expression telle que `AREA > 500 and USE = 'Res'` conserve les lignes pour lesquelles elle est vraie (les mêmes mots que dans l'onglet Sélection de [Analyser les couches SIG](topic:gis-analysis) : `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Ce qui n'est pas une expression, comme `oak maple`, cherche ces mots dans toutes les colonnes.
- **Sélectionner des lignes :** cliquez sur une ligne. Ctrl+clic ajoute ou retire une ligne, Maj+clic sélectionne une plage, et {{ui:Select shown rows}} prend toutes les lignes qui passent le filtre. Les entités sélectionnées sont dessinées sur le plan, et un clic sur une entité du plan sélectionne sa ligne ici.
- Lorsque des lignes sont sélectionnées, vous pouvez {{ui:Zoom}} dessus, créer une **couche à partir de la sélection**, et lire l'aire ou la longueur totale dans la barre d'état.

## Corriger des valeurs

Double-cliquez sur une cellule (ou déplacez-vous avec les flèches, puis appuyez sur Entrée), saisissez la nouvelle valeur et appuyez sur Entrée. Échap la laisse telle qu'elle était. Une valeur doit correspondre à sa colonne : nombres en nombres, dates au format `YYYY-MM-DD`, oui/non en oui, non, true ou false. Une valeur qui ne convient pas est refusée par une phrase, et rien ne change. Une case vide rend la valeur vide. Chaque modification est une étape d'annulation : {{ui:Undo}} et {{ui:Redo}} se trouvent en bas de la table, et Ctrl+Z fonctionne sur le plan.

## Champs

Sous **Champs**, vous pouvez ajouter un champ (texte, nombre, date ou oui/non), en renommer un ou en supprimer un. Un nouveau champ démarre vide. Un renommage se propage : le champ d'étiquette et le [style par attribut](topic:gis-symbology) de la couche passent au nouveau nom, et la suppression d'un champ retire l'étiquette et le style qui l'utilisaient. Chaque action est une étape d'annulation qui rétablit tout.

## Calculatrice de champs

Écrit une valeur dans chaque ligne (ou seulement dans les lignes sélectionnées), à partir des autres champs de la ligne, de sa géométrie et de quelques fonctions. Choisissez un champ existant ou **Nouveau champ…**, puis donnez-lui un nom et un type. Rien n'est exécuté comme du code : l'expression est lue par un petit analyseur doté d'une liste fixe de fonctions.

| Groupe | Mots |
|---|---|
| Nombres | `+ - * /`, parenthèses, `abs round(x, digits) floor ceil sqrt pow min max` |
| Texte | `upper lower trim len substr(text, from, count) left right replace concat` (le texte va entre 'apostrophes simples' ; un nom de champ comportant des espaces va entre "guillemets" ou [crochets]) |
| Choix | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Dates | `year month day` d'une valeur `YYYY-MM-DD` |
| Géométrie | `$area $perimeter $length $x $y $vertices`, dans les unités du projet |

Un résultat qui ne peut pas être stocké dans le type du champ (du texte dans un champ numérique) est laissé vide et compté dans le message. Une division par zéro donne une valeur vide. Par exemple, `round($area / 43560, 2)` écrit des acres à partir de pieds carrés.

## Exporter

{{ui:Export CSV}} enregistre les lignes que vous voyez (après le filtre et le tri) dans un fichier CSV en UTF-8, avec les noms de champs sur la première ligne. Un texte qui commence par `=`, `+`, `-` ou `@` reçoit une apostrophe en tête, pour qu'un tableur ne l'exécute pas comme une formule. Pour enregistrer la couche elle-même, utilisez [Exporter les données de récolement pour le SIG](topic:gis-export).

## Limites

La table présente la couche selon un seul ordre de tri et un seul filtre à la fois. Les lignes ne peuvent pas être ajoutées ni supprimées ici (créez plutôt une nouvelle couche à partir d'une sélection), la géométrie n'est pas modifiable, et le type d'un champ ne peut plus être changé une fois créé.
