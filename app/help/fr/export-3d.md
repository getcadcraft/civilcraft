---
title: Exporter le site en 3D
summary: Enregistrer ce qu'affiche la vue 3D dans un fichier GLB ou OBJ pour d'autres logiciels 3D, en mètres avec Y vers le haut, autour d'une origine locale que le fichier mentionne.
keywords: glb, gltf, obj, export 3d, exporter en 3d, export de modèle, moteur de jeu, visualisation, visionneuse 3D, mètres, y vers le haut, origine, origine locale, state plane
from: 07d23992
---

La vue 3D exporte ce qu'elle affiche sous forme de modèle 3D qu'un autre logiciel peut ouvrir : une visionneuse 3D, un logiciel de modélisation, un moteur de jeu ou un outil de visualisation.

## Exporter

1. Ouvrez la vue 3D ({{key:D}}) et choisissez ce qui s'affiche avec {{ui:Afficher}}. Ce qui est masqué n'est pas exporté.
2. Cliquez sur {{ui:GLB}} ou {{ui:OBJ}} dans la barre.
   Le fichier est téléchargé sous le nom « *nom du projet*-3d.glb » ou « -3d.obj », et la barre d'état indique l'origine.

## Contenu des fichiers

| | GLB | OBJ |
|---|---|---|
| Surfaces | Maillages avec normales et les couleurs des bandes ou des surfaces | Maillages avec normales (sans couleurs) |
| Canalisations et regards | Maillages ronds, ceux qui posent problème en rouge | Maillages ronds |
| Courbes de niveau, lignes de rupture, tracés, repères, lignes de corridor et de plateforme | Lignes, chaque ensemble dans sa couleur | Enregistrements de lignes (`l`) |
| Points topographiques | Points | Enregistrements de points (`p`) |

Chaque ensemble conserve son nom (« Terrain naturel », « Canalisations », « Courbes de niveau majeures », etc.), afin que vous puissiez le masquer ou le styliser dans l'autre logiciel.

## Unités, axes et origine

- **Mètres.** Un projet en pieds est converti depuis les pieds US survey (1 ft = 1200/3937 m).
- **Y vers le haut**, la convention usuelle pour ces formats : l'est devient +X, l'altitude +Y, et le nord −Z.
- **Échelle réelle.** L'exagération verticale de la vue n'est pas appliquée.
- **Une origine locale.** Les coordonnées State Plane se chiffrent en millions de pieds, trop grandes pour les nombres à simple précision que ces formats stockent. Le fichier est donc écrit par rapport à une origine proche : l'origine propre du terrain naturel pour l'est et le nord, et son altitude la plus basse, arrondie par défaut. L'origine, dans les unités du projet, est consignée dans le fichier : dans un GLB sous forme de `extras` sur la scène et son nœud supérieur, dans un OBJ sous forme de ligne de commentaire près du début (`# origin easting … northing … elevation …`). Pour replacer le modèle dans les coordonnées du projet, ajoutez l'origine (après avoir reconverti les mètres en pieds sur un projet en pieds).

## Pas encore disponible

- Export de la vue exagérée, ou export en unités du projet au lieu des mètres.
- Textures, fichier de matériaux pour OBJ (.mtl) et propriétés par objet (les noms des canalisations et des regards n'existent que dans CivilCraft).
- Export du corridor en solides séparés, ou de la vue de profil en 3D.
