---
title: Exporter le site 3D en USD
summary: Écrire la vue 3D du site (surfaces, lignes, tracés, canalisations et points topographiques) en USD, à l'échelle réelle et aux coordonnées réelles.
keywords: usd, usda, usdc, usdz, openusd, exportation, 3d, site, surface, tracé, points topographiques, coordonnées, assemblage de scène
from: e7be08ec
---

Dans la vue 3D, {{ui:USD}} à côté de {{ui:GLB}} et {{ui:OBJ}} écrit ce que la vue affiche en USD.

1. Ouvrez la vue 3D et choisissez ce qu'il faut afficher.
2. Ouvrez {{ui:USD}} et choisissez {{ui:Texte (.usda)}}, {{ui:Binaire (.usdc)}} ou {{ui:Paquet (.usdz)}}.

Le fichier est à l'échelle réelle (l'exagération verticale est retirée), en mètres avec Z vers le haut. Le site est placé à ses coordonnées Est, Nord et altitudes du projet, et nomme son système de coordonnées lorsque le projet en possède un. Les surfaces, canalisations et ouvrages sont des maillages avec leurs couleurs ; les {{ui:Courbes de niveau}}, lignes de rupture et lignes de corridor sont des lignes ; chaque tracé est une ligne distincte portant son nom ; les points topographiques conservent leurs numéros.
