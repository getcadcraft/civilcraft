---
title: Formats de fichiers de points
summary: Les ordres de colonnes lus par CivilCraft, la façon dont il trouve le séparateur et la ligne d'en-tête, les noms d'en-tête qu'il reconnaît et la manière dont les lignes sont vérifiées.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, format de fichier de points, colonnes, en-tête, séparateur
from: 84fab42e
---

Un fichier de points est un texte brut, un point par ligne. CivilCraft le lit dans le navigateur ; rien n'est téléversé.

## Ordres de colonnes

Les lettres désignent les colonnes de gauche à droite : **P** numéro ou nom du point, **N** nord, **E** est, **Z** altitude, **D** description.

| Ordre | Colonnes | Exemple de ligne |
|---|---|---|
| PNEZD | point, nord, est, altitude, description | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | point, est, nord, altitude, description | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | point, nord, est, altitude | `101,2080000.00,6150000.00,250.00` |
| PENZ | point, est, nord, altitude | `101,6150000.00,2080000.00,250.00` |
| NEZD | nord, est, altitude, description | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | est, nord, altitude, description | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | nord, est, altitude | `2080000.00 6150000.00 250.00` |
| ENZ | est, nord, altitude | `6150000.00 2080000.00 250.00` |

Les ordres sans P numérotent les points 1, 2, 3 … dans l'ordre du fichier. X est l'est et Y est le nord.

## Séparateurs

CivilCraft examine les 20 premières lignes et retient le premier de ces séparateurs qui figure dans au moins 60 % d'entre elles : virgule, tabulation, point-virgule. Sinon, il découpe sur les suites d'espaces.

- Dans les fichiers à virgules, tabulations et points-virgules, un champ entre guillemets peut contenir le séparateur (`"FL, NORTH"`), et `""` à l'intérieur des guillemets représente un seul guillemet.
- Dans les fichiers séparés par des espaces, une description en fin de ligne peut contenir des espaces : tout ce qui suit la dernière colonne de coordonnées est la description.
- Les lignes commençant par `#`, `;` ou `//`, ainsi que les lignes vides, sont ignorées.
- Une marque d'ordre des octets en début de fichier est ignorée.

## Ligne d'en-tête

La première ligne est considérée comme un en-tête lorsque moins de deux de ses champs sont des nombres. Si chaque champ de l'en-tête est un nom reconnu par CivilCraft, l'ordre des colonnes en découle (« d'après la ligne d'en-tête »). Les noms sont comparés sans tenir compte de la casse, des espaces, des points, des tirets bas, des traits d'union ni des crochets :

| Colonne | Noms reconnus |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Si un nom d'en-tête n'est pas reconnu, ou si les noms ne forment pas l'un des huit ordres, l'en-tête est ignoré et l'ordre est deviné à partir du nombre de colonnes.

:::warning
Un en-tête qui désigne à la fois une colonne de latitude (`lat`, `latitude`) et une colonne de longitude (`lon`, `long`, `longitude`) est lu en degrés, et non en nord et en est. Avec {{ui:Importer}}, les points sont convertis par le système de coordonnées du projet ; un projet qui n'en a pas vous demande d'abord de le choisir. Les lignes hors de ±90° de latitude ou de ±180° de longitude sont refusées. Voir [Importer des données SIG](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Deviner à partir du nombre de colonnes

Sans en-tête utilisable et avec **Colonnes** laissé sur {{ui:Détecter}} :

- 5 colonnes ou plus : PNEZD.
- 4 colonnes : PNEZ lorsque la première colonne est un entier sur chaque ligne échantillonnée et que la quatrième est un nombre ; NEZD sinon.
- 3 colonnes : NEZ.

PNEZD et PENZD ne se distinguent pas à partir des nombres. La déduction suit **Lignes de points** dans [Paramètres de CivilCraft](topic:settings) : P, N, E, Z, D en début, ou P, E, N, Z, D (alors quatre colonnes sont lues en PENZ et trois en ENZ). La boîte de dialogue indique « déduit à partir du nombre de colonnes — vérifiez que le nord et l'est ne sont pas inversés ». Choisissez le bon ordre dans **Colonnes** si l'aperçu semble faux.

## Vérification des lignes

- Une ligne peut omettre la description.
- Le nord et l'est doivent être des nombres. L'altitude peut être vide (le point est conservé mais n'est pas utilisé dans la surface).
- Le numéro de point peut être n'importe quel texte (avec des lettres, comme `CP1`), mais il ne doit pas être vide.
- Si un numéro de point se répète, la première ligne est conservée et les autres sont listées comme non lues.
- Les descriptions sont conservées jusqu'à 200 caractères ; les caractères de contrôle deviennent des espaces.
- Jusqu'à 200 lignes non lues sont conservées pour la boîte de dialogue (25 affichées), et toutes sont comptées.

## Groupes de points

Le groupe d'un point est le premier mot de sa description en majuscules. « GRD », « grd shot » et « Grd » appartiennent tous au groupe GRD. Un point sans description se trouve dans « (sans description) ». Voir [Importer des points topographiques](topic:import-points).

## Écriture des points

CivilCraft n'exporte pas encore de fichier texte de points. Les points sortent en LandXML (en tant que CgPoints), dans le fichier de projet, et par {{ui:Exporter}} SIG en shapefile, GeoPackage ou GeoJSON avec les champs P, N, E, Z et D ([Exporter les données de récolement pour le SIG](topic:gis-export)). Voir [Pas encore disponible](topic:not-built-yet).
