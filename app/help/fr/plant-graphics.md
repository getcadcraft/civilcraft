---
title: Représentation des plantes selon l'échelle, vos propres symboles et plantes en 3D
summary: Comment les plantes sont dessinées en plan à chaque échelle de dessin et niveau de détail, et comment une fiche de plante reçoit votre propre symbole (SVG, ou bloc DXF/DWG) et votre propre modèle 3D (OBJ, STL ou GLB).
keywords: représentation des plantes, symbole de plante, symbole selon l'échelle, niveau de détail, cercle simple, contour, symbole détaillé, symbole propre, bloc, svg, dxf, dwg, plante 3D, modèle 3D propre, obj, stl, glb, gltf, modèle d'arbre, plantes en 3D
from: 875837d9
---

## Symboles en plan selon l'échelle

Paysage › {{ui:Plus}} › {{ui:Représentation des plantes}} définit la façon dont les plantes sont dessinées en plan. **Automatique, selon l'échelle** choisit l'un de trois niveaux à partir de l'échelle de dessin :

- **Cercle simple** (plus grossier que 1:500) : un cercle à l'étalement de la plante.
- **Contour avec centre** (de 1:500 à 1:200) : le cercle et une petite croix au centre.
- **Symbole détaillé** (plus fin que 1:200) : le symbole propre de la fiche s'il en a un, sinon le symbole intégré.

Modifiez les deux échelles avec **Simple à partir de 1:** et **Contour à partir de 1:**, ou choisissez un seul niveau pour toutes les échelles. Chaque jeu de feuilles de la boîte de dialogue Feuilles a son propre **Détail des plantes en plan**, si bien qu'un plan de site au 1:500 et un plan de plantation au 1:100 peuvent différer. Les réglages sont enregistrés avec le projet.

## Votre propre symbole

Choisissez une plante dans la section Plantes et appuyez sur {{ui:Symbole propre…}}. Il lit un SVG, ou un bloc d'un dessin DXF ou DWG (si le dessin contient plusieurs blocs, vous en choisissez un). Le symbole est ajusté à l'étalement de la plante et dessiné au niveau détaillé. Il est conservé dans le projet, si bien que le fichier le suit.

- Un SVG est lu pour ses lignes, polylignes, polygones, rectangles, cercles, ellipses et tracés. Les scripts, styles, liens et images qu'il contient ne sont jamais examinés. Les transformations ne sont pas appliquées : vous êtes averti lorsque le fichier en contient, donc aplatissez-les d'abord dans votre logiciel de dessin.
- Limites : 512 KB de SVG et 2000 formes. Un fichier plus gros est refusé, avec la raison.

## Votre propre plante 3D

{{ui:Modèle 3D propre…}} sur la même fiche lit un fichier **OBJ**, **STL** ou **GLB**. Ensuite, dans Représentation des plantes, réglez **Plantes en 3D** sur **Modèle propre de chaque fiche** : chaque plante de cette fiche affiche votre modèle, mis à l'échelle de sa hauteur et de son étalement. Les fiches sans modèle propre gardent les formes intégrées. Choisissez **Masses simples** pour des vues rapides de grands sites.

Un GLB est lu pour sa forme uniquement :

- Tout ce dont le modèle a besoin doit se trouver dans le fichier .glb. Un modèle qui pointe vers d'autres fichiers (un .bin séparé, ou des images par adresse) est refusé : rien n'est téléchargé.
- La géométrie compressée ou empaquetée (Draco, meshopt, positions quantifiées) n'est pas lue. Exportez sans compression.
- Les textures et couleurs du fichier ne sont pas utilisées : le modèle est dessiné dans la couleur propre de la plante. Les textures sont tout de même vérifiées, et une texture de plus de 4096 pixels de côté est refusée.
- Limites : fichier de 32 MB, 50 000 triangles (en comptant chaque copie d'une pièce placée plusieurs fois), 64 images et 16 MB d'images.

Chaque limite refuse le fichier avec la raison ; rien de partiellement lu n'est conservé. Une seule étape d'annulation donne à la fiche son symbole ou son modèle, et {{ui:Retirer le symbole propre}} ou {{ui:Retirer le modèle 3D propre}} les retire.

Voir [Fiches de plantes](topic:plant-records) pour la fiche elle-même, et [Afficher le site en 3D](topic:site-3d).
