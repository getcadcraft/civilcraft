---
title: Unités, stations et formats de nombres
summary: Projets en pieds et en mètres, écriture et saisie des stations, pentes, talus, gisements, surfaces, volumes et diamètres de canalisation, et effet d'un changement d'unités.
keywords: saisir une longueur, arithmétique, calculatrice, somme, fraction, pieds et pouces, 4+7/16, unités, pieds, pieds US d'arpentage, mètres, métrique, impérial, format des stations, numérotation des stations, pente, pourcentage, talus, h:v, gisement, verges cubes, diamètre
from: 0b9b5b6b
---

## Unités du projet

Un projet est en **pieds US** ou en **mètres** (**Unités** dans le panneau de gauche). Toutes les coordonnées, altitudes, longueurs et stations du projet sont dans cette unité.

:::warning
Modifier les **Unités** change les libellés, le format des stations, les valeurs par défaut et la manière dont les fichiers sont écrits. Cela ne convertit **aucun** nombre. Un site levé en pieds et passé en mètres garde les mêmes nombres, désormais lus comme des mètres. La barre d'état indique « Unités désormais en mètres. Les coordonnées n'ont pas été converties. » Réglez les unités pour qu'elles correspondent à vos données avant de concevoir.
:::

Ce qui dépend des unités :

| | Pieds US | Mètres |
|---|---|---|
| Format des stations | `12+34.56` (stations de 100 ft) | `1+234.567` (stations de 1000 m) |
| Équidistances proposées | 0.25 à 20 ft | 0.1 à 10 m |
| Surface | sq ft | sq m |
| Volume | cu yd | cu m |
| Diamètre des canalisations et ouvrages | pouces | millimètres |
| Rayon de courbe par défaut | 100 ft | 30 m |
| Graduations de stationnement sur le plan | tous les 50 ft, libellés tous les 100 ft | tous les 20 m, libellés tous les 100 m |
| Échelles de tracé | 1" = 5' à 1" = 1000' | 1:50 à 1:10000 |
| Unité linéaire LandXML | USSurveyFoot | meter |

Un nouveau projet démarre en pieds, ou en mètres si l'unité de longueur marquée d'une étoile dans {{ui:Paramètres}} › {{ui:Général}} › {{ui:Unités}} est métrique. La liste **Unités** affiche les unités activées là-bas, et toujours celle du projet. Si une unité de surface ou de volume est marquée d'une étoile (acres, hectares, acre-feet …), les surfaces et volumes sont exprimés dans cette unité au lieu de la colonne ci-dessus. Voir [Unités, valeurs saisies et listes d'unités](common:unit-lists).

À l'ouverture d'un LandXML, le projet prend les unités du fichier. Un fichier en pieds internationaux s'ouvre comme un projet en pieds ; les nombres ne sont pas modifiés.

## Saisir des longueurs et des sommes

Tout champ qui accepte une longueur ou une altitude lit plus qu'un simple nombre : appuyez sur {{key:Enter}} et le champ affiche le résultat dans les unités du projet.

| Vous saisissez | Dans un projet en pieds | Dans un projet en mètres |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | les mêmes longueurs en mètres |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | en pieds | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, et les autres en pieds US d'arpentage | les mêmes longueurs en mètres |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | la somme, en pieds | la somme, en mètres |

Toute marque de longueur de la table commune des unités fonctionne, avec sa taille exacte : les pieds d'un projet sont des pieds US d'arpentage, donc `10 US ft` vaut 10 et `3 ch` (la chaîne en pied international) vaut 197.9996. Utilisez `+ - * /` et les parenthèses, ainsi que `abs`, `round`, `ceil` et `floor`. Un tiret écrit dans une longueur en fait partie (`24'-6"`, `6-1/2`) ; avec des espaces autour, il soustrait (`24' - 6"` = 23.5 ft). Un nombre seul multiplie ou divise une longueur, et devient une longueur dans les unités du projet lorsqu'il est additionné à une longueur. Si CivilCraft ne peut pas lire ce que vous avez saisi, le champ est signalé et la barre d'état indique où.

Les stations ne sont pas des sommes : `10+00` dans un champ station désigne la station 10+00. Les pentes en pourcentage, les numéros de points et les descriptions sont lus tels quels.

## Stations

Une station est une distance le long d'un tracé, écrite avec un signe plus :

- Pieds : la partie avant le plus indique des centaines de pieds. `12+34.56` vaut 1,234.56 ft.
- Mètres : la partie avant le plus indique des milliers de mètres. `1+234.567` vaut 1,234.567 m.
- Les stations négatives gardent le signe devant : `-0+50.00`.

Partout où vous saisissez une station (**Station de départ**, **Station** d'un PIV), vous pouvez la saisir avec le plus (`12+34.56`) ou comme nombre simple (`1234.56`). Les espaces sont ignorés.

## Pentes et talus

- Les **pentes** (profils, canalisations, pentes de voie et d'accotement) sont en pourcentage : `+1.25%` monte dans le sens des stations, `-0.50%` descend.
- Les **talus** (déblai et remblai de plateforme, déblai et remblai de corridor) sont exprimés horizontal sur vertical : `3` signifie 3 : 1, trois en horizontal pour un en montée ou descente.
- **K** pour une courbe verticale est sa longueur divisée par la variation de pente en pourcentage.

## Gisements et angles

Les gisements sont des gisements en quadrants, en degrés, minutes et secondes : `N 63°12'05" E`. Les déviations de courbe (Δ) utilisent les mêmes degrés, minutes et secondes, avec « gauche » ou « droite ».

## Décalages

Les décalages par rapport à un tracé sont des distances perpendiculaires à celui-ci, marquées **L** (gauche) ou **R** (droite) en regardant dans le sens des stations.

## Affichage des nombres

- Les coordonnées et altitudes affichent 2 décimales dans les panneaux et la barre d'état (3 pour un point topographique sélectionné).
- Les surfaces et volumes sont regroupés par milliers : `128,250 sq ft`, `454.9 cu yd`.
- Les coordonnées ne sont jamais regroupées, afin de pouvoir être copiées telles quelles.

## Coordonnées

CivilCraft travaille dans un plan plat : l'est vers la droite, le nord vers le haut. Le travail de conception se fait toujours en coordonnées projetées (state plane, UTM ou quadrillage local). Vous pouvez indiquer à CivilCraft le système de coordonnées utilisé, et s'il s'agit de coordonnées en projection, terrain ou locales ; il affiche alors la latitude et la longitude et place les fichiers SIG et les couches cartographiques, mais il ne modifie jamais les unités ni ne déplace vos coordonnées de lui-même. Voir [Définir le système de coordonnées du projet](topic:coordinate-systems) et [Coordonnées terrain et locales](topic:ground-and-local-coordinates). Les grandes valeurs en state plane (millions de pieds) sont acceptées ; CivilCraft travaille en interne par rapport au site pour conserver la précision.
