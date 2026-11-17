---
title: Aménagement d'un parking
summary: Implantez des places, allées, places accessibles et places pour fourgon, ainsi que des îlots, à l'intérieur d'un contour ; modelez le terrain avec des pentes vers les drains par rapport au terrain naturel, puis revêtez et plantez. Aussi accessible à un assistant.
keywords: parking, stationnement, place, allée, accessible, ada, fourgon, îlot, drain, pente, terrassement, déblai, remblai, revêtement, pavés, plantation, arbres, terrain, nuage de points, mcp, assistant
from: 06c14da9
---

Implantez un parking dans une parcelle, une plateforme ou une ligne caractéristique fermée, et obtenez en une seule étape les comptages, le terrassement et le revêtement.

## Implanter le parking

1. Sélectionnez sur le plan une parcelle, une plateforme ou une ligne caractéristique fermée.
2. Ouvrez **Surface, Plus, Parking…**
3. Choisissez les règles, l'angle des places (90, 75, 60, 45, 30 degrés ou parallèle) et des allées à sens unique ou à double sens. Les dimensions des places, des allées et des îlots partent du tableau, et chacune peut être remplacée par une saisie.
4. Choisissez **Implanter**.

Les rangées suivent le bord du contour qui donne le plus de places (ou l'angle que vous saisissez). Une place n'est comptée que si elle se trouve entièrement à l'intérieur du contour. Lorsqu'il reste assez de place pour une rangée et une allée, une bande à rangée simple est ajoutée. La fenêtre liste les places, les places accessibles et pour fourgon, les îlots, les drains et la surface par place, et le plan montre les places, les places accessibles avec leurs allées d'accès hachurées, les îlots, les axes des allées et les drains sur leurs propres calques (C-PARK-...), afin qu'ils passent dans le PDF, le DXF et le DWG.

## Places accessibles

Avec les règles des États-Unis, le nombre suit le tableau 208.2 des 2010 ADA Standards pour les places prévues (une sur six, arrondie au supérieur, est une place pour fourgon), placées au plus près du premier coin du contour (l'entrée), chacune avec une allée d'accès ; deux places peuvent en partager une. Une place plus étroite que la largeur accessible, ou une pente supérieure à 1:48 sur les places accessibles, est signalée comme un problème. **Ces valeurs ont été saisies à partir de la norme de mémoire et n'ont pas été vérifiées par rapport à la norme imprimée.** Les dimensions types des places et des allées proviennent de guides de conception de parkings, et ne sont pas non plus vérifiées. Contrôlez les deux, ainsi que la réglementation locale, avant de vous y fier. Choisissez **Personnalisé** pour saisir votre propre nombre de places accessibles.

## Pentes vers les drains, déblai et remblai

Sauf si vous le désactivez, le parking devient une zone de terrassement dans l'espace de travail Paysage. Des drains sont placés sur les axes des allées environ tous les 100 pieds (30 m) ; la surface remonte depuis chaque drain selon la pente que vous indiquez (1.5 pour cent au départ), de sorte que chaque point descend vers le drain le plus proche. Le niveau est choisi pour que le déblai et le remblai du parking s'équilibrent sur le terrain naturel. Le terrain naturel est la surface existante du projet, qui peut provenir de points topographiques, d'un fichier LandXML, d'un nuage de points lidar ou scanné transformé en surface, ou de courbes de niveau. La fenêtre affiche l'estimation des déblais et remblais ; les volumes propres au projet donnent ensuite le chiffre exact. La zone de terrassement conserve son bord sur le terrain naturel : là où la nouvelle surface diffère du terrain au bord, vous obtenez une marche, et la fenêtre indique sa hauteur.

## Revêtement et plantations

Tout le contour reçoit un revêtement en pavés (un appareil en panneresse que vous pouvez modifier sous Paysage, Aménagement dur), et chaque îlot reçoit un massif d'arbustes et, s'il est assez large, un arbre tiré de la liste des végétaux. Ensuite, tout devient un objet Paysage ordinaire : modifiez-le, ou choisissez **Refaire l'aménagement** pour remplacer ce que le parking a créé. Supprimer le parking supprime ce qu'il a créé.

## Depuis un assistant

Le même parking peut être demandé via MCP : `parking_layout` prévisualise, `parking_build` écrit, `parking_remove` supprime un parking. Demandez-le par nom de parcelle ou envoyez le contour.

## Ce qui n'est pas encore disponible

Le fait que les allées rejoignent une rue n'est pas vérifié. Le revêtement couvre tout le contour, de sorte que sa surface comprend les îlots. Les choix de matériaux de revêtement issus de la Bibliothèque et un type de Bibliothèque pour les places ne sont pas disponibles ; le motif de revêtement est celui d'Aménagement dur. Les règles d'aucun autre pays ne sont disponibles.
