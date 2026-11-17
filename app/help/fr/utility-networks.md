---
title: Réseaux de services et OpenStreetMap
summary: Tronçons d'eau, d'assainissement, d'eaux pluviales, de gaz, d'électricité et de télécommunications avec matériau, diamètre, recouvrement et propriétaire ; données OpenStreetMap issues d'un fichier JSON Overpass ; croisements, coupes de tranchée et volumes ; calques de service en DWG, DXF et PDF ; segments de canalisation et de câble en IFC.
keywords: réseau, réseaux, service, services, osm, openstreetmap, overpass, canalisation, câble, gaz, égout, eaux pluviales, télécom, électricité, eau, bouche d'incendie, regard, tranchée, croisement, dégagement, recouvrement, profondeur, dwg, ifc, géoréférencé, calques
from: 8a85dace
---

Dessinez les réseaux enterrés d'un site, un réseau par service, vérifiez leurs croisements, puis exportez-les en calques de dessin et en IFC.

## Créer des tronçons

Ouvrez **Surface, Plus, Réseaux de services…**

- **Créer un tronçon à partir de la sélection** transforme l'axe, la ligne d'élément ou la canalisation sélectionné en tronçon du service que vous avez choisi. Renseignez ensuite le matériau, le diamètre (mm), le recouvrement (la profondeur jusqu'au dessus de la canalisation ou du câble) et le propriétaire dans le tableau.
- **Lire les données OpenStreetMap** lit un fichier JSON Overpass que vous avez enregistré (une requête avec `out geom;`). Le projet doit d'abord avoir un système de coordonnées, car les positions OpenStreetMap sont exprimées en latitude et longitude. Les canalisations (par nature de fluide), les câbles électriques et de télécommunications enterrés, les bouches d'incendie, les regards et les collecteurs d'eaux pluviales sont lus ; tout le reste est compté comme exclu et indiqué dans le message. Les lignes aériennes sont exclues.
- **Ajouter la carte OpenStreetMap** ajoute la carte OpenStreetMap sous le plan. Elle ne s'affiche que si les couches cartographiques en ligne sont activées dans Paramètres.

## Contrôles et sorties

- **Croisements** : les tronçons de services différents qui se croisent en plan sont listés avec la hauteur libre entre eux lorsqu'une surface de terrain existe ; le minimum est une valeur provisoire que vous définissez, et non le chiffre d'une norme.
- **Tranchée** : chaque tronçon reçoit une tranchée (diamètre de la canalisation plus dégagement de chaque côté, pente des talus, lit de pose) avec un volume. Le total s'affiche dans la fenêtre et dans le CSV.
- **Dessin** : les tronçons et les points sont placés sur des calques de service (par exemple U-WATR-RUN, U-POWR-RUN), afin d'être repris en PDF, DXF et DWG.
- **IFC** : les tronçons sont exportés dans l'IFC comme segments de canalisation et segments de câble, avec les bouches d'incendie, les vannes et les regards, un système par service, dans le système de coordonnées du projet.

## Données OpenStreetMap

Les données OpenStreetMap sont protégées par le droit d'auteur des contributeurs OpenStreetMap et distribuées sous licence ODbL. La mention d'attribution est ajoutée au dessin, au CSV et à l'IFC. Si vous partagez un fichier contenant des données OpenStreetMap, conservez la mention d'attribution et respectez la clause de partage dans les mêmes conditions de la licence.

## Ce qui n'est pas encore fait

Les tronçons ne se dessinent pas encore point par point sur le plan avec un outil, et les croisements ne sont pas encore représentés dans la vue de profil (le calcul est en place). Les profondeurs, les diamètres et les dégagements sont des valeurs provisoires : utilisez les valeurs de votre propre norme.
