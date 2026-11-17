---
title: Tableaux, quantités, feuilles et SIG des lignes électriques
summary: Tableaux de pose et des appuis, quantités de matériaux pour un tableur ou TakeoffCraft, feuilles de plan et de profil avec un rapport d'étude dans un seul PDF, et couches SIG contenant les données de chaque élément.
keywords: tableau de pose, tableau des appuis, quantités, bordereau de matériaux, takeoffcraft, feuilles, rapport, pdf, feuille de profil, sig, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Tout ceci se trouve sous {{ui:Plus}} dans le groupe Lignes électriques.

| Sortie | Ce que vous obtenez |
|---|---|
| {{ui:Tableaux de pose…}} | Par section, la tension horizontale et la flèche de chaque portée à chaque température ; enregistrement en CSV. {{ui:Enregistrer le tableau des supports (CSV)}} : le rôle de chaque appui, son élément, le terrain, le point d'attache, la charge maximale, la charge nominale, OK, la suggestion, la fondation, le débattement et le soulèvement |
| {{ui:Quantités…}} | Conducteurs (longueurs de chaînette × conducteurs × circuits + 2 % pour les dérivations et les arrêts), appuis et équipements par élément de bibliothèque, câble, tranchée, fouille, fourreaux, jonctions. CSV, Excel, ou un fichier de quantités TakeoffCraft |
| {{ui:Feuilles et rapport…}} | Un seul PDF : le plan ; une feuille de profil pour chaque ligne, avec le conducteur aux cas de charge choisis et une bande présentant les longueurs de portée, les flèches et les dégagements minimaux ; et un rapport d'étude (jeu de règles, sections, tableaux de pose, appuis, chaque contrôle) |
| {{ui:Exporter vers un SIG…}} | Appuis, portées, tracés de câbles, équipements et obstacles sous forme de couches avec leurs données (hauteurs, charges, flèches, dégagements, éléments en échec), au format GeoPackage, shapefiles, GeoJSON, KML ou KMZ |

Le GeoJSON et le KML nécessitent le système de coordonnées du projet ([Systèmes de coordonnées](topic:coordinate-systems)) ; sans lui, le GeoPackage et les shapefiles conservent les valeurs propres au projet.
