---
title: Importer des points topographiques
summary: Ouvrir un fichier de points CSV ou texte, vérifier l'ordre des colonnes dans la boîte de dialogue Importer des points, corriger les lignes illisibles et répartir les points en groupes.
keywords: importer des points, csv, txt, pnezd, penzd, fichier de points, topographie, points cogo, groupes de points, colonnes, nord est
from: ad33d88a
---

Un fichier de points est un fichier texte avec un point par ligne : numéro du point, nord, est, cote et description, dans un ordre variable, séparés par des virgules, des tabulations, des points-virgules ou des espaces. CivilCraft le lit dans le navigateur et construit aussitôt une surface à partir de lui.

## Avant de commencer

- Connaissez l'ordre des colonnes du fichier si possible (PNEZD et PENZD se ressemblent pour un ordinateur).
- Connaissez ses unités. CivilCraft ne convertit rien : réglez **Unités** dans le panneau de gauche pour qu'elles correspondent au fichier (voir [Unités, stations et formats de nombres](topic:units-and-stations)).
- Les coordonnées peuvent être grandes (des nord et est de systèmes de projection en millions sont acceptés).

## Importer le fichier

1. Cliquez sur {{ui:Ouvrir}} dans la barre d'outils, ou appuyez sur {{key:Mod+O}}, puis choisissez le fichier. Vous pouvez aussi le faire glisser sur le plan.
   La boîte de dialogue **Importer des points** s'ouvre avec le nom du fichier, une liste **Colonnes** réglée sur {{ui:Détecter}}, une ligne de synthèse et les six premiers points.
2. Lisez la ligne de synthèse. Elle indique combien de points ont été lus, dans quel ordre de colonnes, comment cet ordre a été trouvé et ce qui sépare les colonnes. Les trois façons de trouver l'ordre :
   - « depuis la ligne d'en-tête » : la première ligne nomme ses colonnes (Point, Nord, Est, Cote, Description, ou X, Y, Z …). C'est la méthode la plus sûre.
   - « selon votre choix » : vous avez choisi un ordre dans **Colonnes**.
   - « deviné d'après le nombre de colonnes et le réglage des lignes de points (PNEZD) — vérifiez que le nord et l'est ne sont pas inversés » : il n'y avait pas d'en-tête exploitable. Si vos fichiers commencent en général par l'est, réglez **Lignes de points** sur P, E, N, Z, D dans les [paramètres de CivilCraft](topic:settings).
3. Vérifiez le tableau d'aperçu. Ses colonnes sont toujours **Point**, **Nord**, **Est**, **Cote**, **Description**, quel que soit l'ordre du fichier. Les nord et est d'un site réel ont en général des grandeurs nettement différentes : s'ils semblent inversés, la supposition était fausse.
4. Si l'ordre est faux, choisissez le bon dans **Colonnes** (par exemple {{ui:PENZD — point, est, nord, cote, description}}). La synthèse et l'aperçu se mettent à jour aussitôt.
5. Sous l'aperçu, regardez **Lignes non lues**. Chaque ligne indique le numéro de ligne du fichier, la raison et le début de la ligne. Voir [Lignes non lues](topic:import-points#rows-that-are-not-read).
6. Cliquez sur {{ui:Importer}}.
   Les points apparaissent sur le plan, la vue se cadre sur eux et la surface est construite. La barre d'état indique par exemple « 276 points importés depuis site.csv ; surface : 546 triangles. »

Si le projet n'avait pas encore de nom, il prend celui du fichier.

## Vérifier les groupes

Chaque point appartient à un groupe nommé d'après le **premier mot de sa description**, en majuscules : « GRD », « FL 12 » et « fl » sont les groupes GRD, FL et FL. Les points sans description vont dans « (sans description) ».

1. Regardez le tableau sous **Points** dans le panneau de gauche : groupe, nombre de points et un choix de **Surface**.
2. Chaque groupe commence en {{ui:Points}}. Passez en {{ui:Ligne de rupture}} les lignes de talweg, les bords de chaussée, les têtes et pieds de talus, les lignes de crête et les lignes codées similaires. Réglez sur {{ui:Écarté}} les groupes qui ne doivent pas façonner le terrain (points de contrôle, cimes d'arbres, poteaux de réseaux relevés au sommet).
3. Cliquez un point sur le plan (avec {{ui:Sélectionner}}) pour voir son numéro, ses coordonnées, sa cote, sa description et son groupe dans le panneau de droite.

:::warning
Un groupe de rupture relie **tous** ses points en **une seule** ligne, dans l'ordre des numéros de points. Cela fonctionne lorsque chaque ligne codée a été relevée dans l'ordre avec son propre code. Deux lignes de talweg distinctes codées « FL » deviennent une seule ligne en zigzag entre elles. Si vos codes sont partagés, utilisez l'outil {{ui:Ligne de rupture}} pour cliquer les points de chaque ligne (voir [Construire et affiner la surface](topic:build-surface)).
:::

## Lignes non lues

| Raison affichée | Ce que cela signifie | Que faire |
|---|---|---|
| « le nord ou l'est n'est pas un nombre » | Une colonne de coordonnées contient du texte | Vérifiez l'ordre des colonnes, ou une ligne de texte égarée au milieu du fichier |
| « la cote n'est pas un nombre » | La colonne de cote contient du texte | Mauvais ordre de colonnes, ou une description dans la colonne de cote |
| « pas de numéro de point » | La colonne des points est vide | Numérotez le point, ou choisissez un ordre sans P (NEZD, NEZ …) : les points sont alors numérotés 1, 2, 3 … |
| « le point 12 apparaît deux fois (le premier est conservé) » | Deux lignes partagent un numéro | Renumérotez l'une d'elles dans le fichier si les deux sont de vrais relevés |
| « 3 colonnes, 5 attendues (PNEZD) » | La ligne est trop courte | Une ligne cassée, ou le mauvais ordre de colonnes |

Un point dont la cote est vide est conservé, mais n'est pas utilisé dans la surface. Les faits **Points** indiquent combien de points ont une cote.

Les lignes commençant par `#`, `;` ou `//` sont des commentaires et sont ignorées. Les lignes vides sont ignorées.

## Remplacer ou ajouter des points

Réimporter **remplace** tous les points ; il n'en ajoute pas. Vos tracés, plateformes, canalisations, lignes de rupture dessinées et contour restent. L'historique d'annulation est effacé : enregistrez donc le projet d'abord si vous voulez peut-être retrouver les anciens points. Pour combiner deux fichiers, joignez-les dans un éditeur de texte ou un tableur avant l'import (attention aux numéros de points en double).

Les points ne peuvent pas encore être déplacés, modifiés ni supprimés dans CivilCraft. Corrigez-les dans le fichier et réimportez.

## Voir aussi

- [Formats de fichiers de points](topic:point-file-formats) : chaque ordre de colonnes et la façon dont les en-têtes sont reconnus.
- [Construire et affiner la surface](topic:build-surface).
