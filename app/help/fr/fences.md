---
title: Clôtures
summary: Une clôture le long d'une ligne, d'une parcelle ou d'une plateforme, avec poteaux, lisses, panneaux ou piquets, portails, en pente ou en escalier sur le terrain, une nomenclature, des symboles de plan et des éléments IFC. Accessible aussi à un assistant.
keywords: clôture, poteaux, lisses, panneaux, piquets, portail, en pente, en escalier, terrain, nomenclature, ifc, garde-corps, limite
from: c0e7b84a
---

Créez une clôture le long d'une ligne caractéristique, d'un tracé en plan, d'une parcelle ou d'une plateforme, avec ses poteaux et ses portails placés automatiquement.

## Créer une clôture

1. Sélectionnez une ligne, une parcelle ou une plateforme.
2. Ouvrez **Surface, Plus, Clôtures…**
3. Choisissez le style (panneaux, lisses ou piquets), en pente ou en escalier, la hauteur, l'espacement des poteaux et la largeur du portail, puis **Clôture le long de la sélection**, ou **Avec un portail** pour placer un portail au milieu de la plus longue section droite.

Les poteaux sont placés aux extrémités, à chaque angle (un sommet qui tourne d'au moins 20 degrés), aux deux bords de chaque portail, et à travées égales entre eux, sans qu'aucune travée ne dépasse l'espacement. Les panneaux **en pente** suivent le terrain entre leurs poteaux. Les panneaux **en escalier** restent horizontaux et s'échelonnent aux poteaux ; l'espace sous un panneau est le plus grand au poteau situé en aval, et la fenêtre signale lorsque cet espace dépasse la limite, ou lorsque le terrain remonte à travers un panneau. Les portails de 6 pieds (1.8 m) et plus ont deux vantaux ; le plan montre les vantaux ouverts avec leur débattement.

## Nomenclature et sorties

Chaque clôture affiche sa longueur, ses poteaux par type, ses panneaux, ses portails et ses marches, avec une nomenclature **CSV** des poteaux, panneaux, lisses, piquets et portails. Le plan comporte des calques de clôture (C-FENC, C-FENC-POST, C-FENC-GATE) pour le PDF, le DXF et le DWG. L'export IFC contient les poteaux (IfcMember, post), les panneaux (IfcRailing, user defined fence panel), les lisses (IfcMember) et les portails (IfcDoor, gate), avec un système par clôture.

## Depuis un assistant

`fence_build` crée une clôture (à partir de points, ou d'une ligne, parcelle ou plateforme nommée, avec des portails placés par PK) et `fence_list` liste les clôtures avec leur nomenclature.

## Ce qui n'est pas encore disponible

Les dimensions de départ sont des valeurs courantes, pas une norme. Les types issus de la Bibliothèque ne sont conservés que sous forme de nom. Les portails doivent se trouver dans une seule section droite. BimCraft ne dispose pas encore de cet outil.
