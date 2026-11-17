---
title: Valeurs de départ et valeurs provisoires
summary: Chaque valeur avec laquelle CivilCraft démarre (nouveaux projets, affichage, tracés, plateformes, corridors, réseaux de canalisations, volumes et tracés), et lesquelles sont provisoires et à remplacer.
keywords: valeurs par défaut, réglages, valeurs de départ, valeurs provisoires, critères de conception, normes, règles, hypothèses
from: fbfc7432
---

CivilCraft n'a ni boîte de paramètres ni gabarit. Voici les valeurs avec lesquelles les éléments démarrent. Les valeurs marquées **provisoire** ne sont tirées d'aucune norme : remplacez-les par les critères de votre projet avant de vous fier à une vérification ou à une quantité.

## Nouveau projet

| Réglage | Valeur |
|---|---|
| Nom | Site sans titre (le nom du premier fichier de points le remplace) |
| Unités | Pieds US |
| Nom de la surface | {{ui:Terrain existant}} |
| Groupes de points | Chaque groupe démarre en {{ui:Points}} |
| Plus long bord extérieur | 0 (conserver chaque triangle) |
| Étapes d'annulation conservées | 200 |

## Affichage

| Réglage | Valeur |
|---|---|
| Surface | {{ui:Terrain existant}} |
| Courbes tous les | 1 (ft ou m) |
| Maîtresses tous les | 5e courbe |
| Tranches | 8 |
| Activés | Courbes, {{ui:Cotes des courbes de niveau}}, points, lignes de rupture, bord de la surface, canalisations |
| Désactivés | Triangles, tranches d'altitude, flèches de pente, libellés de points |

## Tracés en plan et profils

| Réglage | Valeur |
|---|---|
| Nom | Tracé 1, Tracé 2 … |
| PK de départ | 0+00 |
| Rayon de courbe à chaque PI intermédiaire | 100 ft ou 30 m, plus petit si cela ne tient pas dans la moitié de chaque tangente |
| Profil en long de projet | Aucun tant que vous n'en créez pas ; {{ui:Commencer depuis le terrain}} place un PVI sur le terrain à chaque extrémité |
| Longueur de courbe verticale | 0 (pas de courbe) tant que vous n'en saisissez pas |

## Plateformes

| Réglage | Valeur |
|---|---|
| Nom | Plateforme 1, Plateforme 2 … |
| Altitude | Le terrain au centre de la plateforme, arrondi à 0.1 (0 si le centre est hors de la surface) |
| Pente de déblai | 2 : 1 (provisoire) |
| Pente de remblai | 3 : 1 (provisoire) |

## Profil type du corridor (provisoire)

| Réglage | Pieds US | Mètres |
|---|---|---|
| Largeur de voie | 12 ft | 3.6 m |
| Pente de voie | 2% | 2% |
| Largeur d'accotement | 4 ft | 1.2 m |
| Pente d'accotement | 4% | 4% |
| Pente de déblai | 2 : 1 | 2 : 1 |
| Pente de remblai | 3 : 1 | 3 : 1 |
| Profil en travers tous les | 10 ft | 5 m |

## Réseau de canalisations

| Réglage | Pieds US | Mètres |
|---|---|---|
| Nom et type | Pluvial, pluvial | Pluvial, pluvial |
| Pente minimale (provisoire) | 0.50% | 0.50% |
| Recouvrement minimal (provisoire) | 2 ft | 0.6 m |
| Chute dans les regards (provisoire) | 0.10 ft | 0.03 m |
| Diamètre des nouveaux regards | 48 in | 1200 mm |
| Diamètre des nouvelles canalisations | 12 in | 300 mm |
| Profondeur de cuvette | 0 | 0 |
| Tampon | Depuis la surface | Depuis la surface |

Un réseau de canalisations ouvert depuis LandXML suit aussi ces règles, car LandXML ne les contient pas.

## Volumes

| Réglage | Valeur |
|---|---|
| Méthode | Grille, échantillonnée au centre des cellules à l'intérieur des lignes de raccordement |
| Taille de cellule | Choisie pour que le rectangle englobant de la zone terrassée contienne environ 250 000 cellules (1, 2 ou 5 fois une puissance de dix) |
| Foisonnement et retrait | Aucun |

## Tracé

| Réglage | Valeur |
|---|---|
| Zone | {{ui:Tout}} |
| Format papier | Tabloid 11 × 17 in (projets en pieds), ISO A3 (projets en mètres) ; toujours en paysage |
| Échelle | La plus grande échelle proposée qui convient |
| Encre | {{ui:Couleurs des calques}} |

Les libellés DXF sont dimensionnés pour l'échelle à laquelle tout tient sur Tabloid (pieds) ou sur A3 (mètres).
