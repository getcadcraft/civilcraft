---
title: Adresse vers le site
summary: Transformer une adresse en ce qu'un site doit savoir : la parcelle, les bâtiments voisins, le zonage, le sol et la zone inondable, à partir de données ouvertes que vous demandez par bouton ou apportez sous forme de fichiers, et les transmettre à BimCraft comme suggestions.
keywords: adresse, géocodage, site, parcelle, bâtiments, zonage, sol, inondation, données ouvertes, openstreetmap, fema, ssurgo, usgs, contexte, ccsite, bimcraft
from: 125d848a
---

## Ce que cela fait

Surface › Plus › Adresse vers le site répond, pour un point : dans quelle parcelle il se trouve, les bâtiments autour de lui, le zonage, le sol et la zone inondable. Les données sont ouvertes : des fichiers que vous ajoutez (GeoJSON, shapefile, KML, GeoPackage) et, lorsque vous activez les modules complémentaires, des boutons qui interrogent chacun un service ouvert.

## Utilisation

1. Saisissez une adresse puis appuyez sur le bouton de recherche d'adresse (le module complémentaire « Recherche d'adresse »), ou saisissez la latitude et la longitude.
2. Ajoutez des couches : fichiers avec « Ajouter des fichiers », ou les autres boutons de source (zone inondable, bâtiments, sol, altitude du terrain, parcelles du comté). Un service n'est interrogé que lorsque vous appuyez sur son bouton ; rien n'est récupéré au démarrage.
3. Appuyez sur le bouton d'exécution pour obtenir la réponse en mots, avec un CSV.
4. « Enregistrer le site dans un fichier » ou « Envoyer à BimCraft comme suggestions » transmet les contours à BimCraft ou ModelCraft ; ceux-ci les listent et n'ajoutent que ce que vous cochez.

## À savoir

- La recherche d'adresse passe par getcadcraft.com, qui interroge pour vous Nominatim d'OpenStreetMap (une requête par seconde au maximum ; réponses conservées 90 jours, afin que la même adresse ne soit jamais demandée deux fois ; seul un hachage de l'adresse est stocké, jamais l'auteur de la demande). Les autres boutons vont directement de votre navigateur vers leur service.
- Chaque source a sa propre licence (OpenStreetMap est sous ODbL : conservez la ligne de mention).
- Les couches valent les données ouvertes de votre région. Vérifiez les points importants par rapport à un levé.
