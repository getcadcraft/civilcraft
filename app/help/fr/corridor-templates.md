---
title: Gabarits de corridor et gabarits de terrain
summary: Créer de petits gabarits réutilisables (bordure et caniveau, trottoir, mur, fossé), construire un corridor à partir de ces gabarits par PK avec gauche et droite séparées, diviser un tracé en plusieurs corridors, et plaquer des couches de matériaux sur un terrain.
keywords: gabarit, gabarits, bibliothèque de gabarits, création de gabarit, profil type, sous-profil, composants, codes de point, condition de fin, raccordement au terrain, fossé, mur de soutènement, bordure, caniveau, trottoir, régions, plage de PK, plusieurs corridors, gauche et droite, gabarit de terrain, terre végétale, chaussée, fondation, plaquer, matériaux, quantités
from: ce70e58b
---

Un **gabarit** est une petite section transversale que vous dessinez une fois et réutilisez : des points avec des décalages, des pentes et des codes de point, et des composants avec leurs matériaux. Un corridor peut être construit à partir de gabarits par PK, chaque côté ayant ses propres gabarits de chaussée et sa propre condition de fin, et les mêmes gabarits peuvent être plaqués sur un terrain.

:::warning
Les gabarits d'exemple sont des modèles de départ. Leurs valeurs ne sont tirées d'aucune norme ni d'aucun organisme. Un ingénieur doit vérifier chaque gabarit et chaque valeur saisie avant de l'utiliser pour un projet.
:::

## Ouvrir les gabarits

Ouvrez {{ui:Surface}} › {{ui:Plus}} › {{ui:Gabarits de corridor…}} (ou tapez {{cmd:TEMPLATES}}). La fenêtre comporte trois listes :

- **Dans ce projet** : les gabarits qu'utilisent les corridors et les gabarits de terrain de ce projet. Ils sont enregistrés dans le fichier du projet.
- **Ma bibliothèque** : gabarits conservés dans ce navigateur et proposés dans chaque projet. Utilisez {{ui:Enregistrer dans Ma bibliothèque}} sur un gabarit de projet pour le conserver.
- **Exemples** : deux voies avec couches, bordure et caniveau, trottoir, raccordement au terrain, fossé, mur de soutènement, terre végétale sous le terrain, et chaussée sur le terrain. Chacun est marqué « À vérifier par un ingénieur ».

{{ui:Utiliser dans ce projet}} copie un gabarit de la bibliothèque ou des exemples dans le projet. {{ui:Exporter les gabarits de ce projet}} les enregistre dans un fichier `.cctemplates.json`, et {{ui:Importer un fichier}} lit un tel fichier dans le projet et dans Ma bibliothèque. Utilisez ce fichier pour partager des gabarits ou les transférer sur un autre ordinateur.

## Créer un gabarit

{{ui:Nouveau gabarit}} (ou {{ui:Édition}} sur un gabarit de projet) ouvre l'éditeur de gabarit. Dessinez le côté droit, vers l'extérieur à partir du point 0,0 du gabarit ; le côté gauche utilise le même gabarit, vers l'extérieur et vers la gauche.

1. Donnez-lui un nom et un type : **Chaussée** (le gabarit suivant s'y raccorde en bout), **Condition de fin** (il rejoint le terrain) ou **Gabarit de terrain**.
2. Ajoutez des **valeurs** : des nombres nommés, comme une largeur `w` ou une pente `s`. Une case numérique, n'importe où dans le gabarit, accepte un nombre ou le nom d'une valeur ; `-t` est la valeur `t` rendue négative. Un corridor peut donner à chaque utilisation du gabarit ses propres valeurs, de sorte qu'un même gabarit de bordure serve à toutes les hauteurs de bordure.
3. Ajoutez des **points** dans l'ordre. Chacun est placé à partir d'un point antérieur (ou du point 0,0) selon sa contrainte :

| Contrainte | Place le point |
|---|---|
| Décalage à une pente | Un décalage vers l'extérieur et une pente (dénivelée par distance horizontale ; -0.02 descend de 2 %) |
| Décalage et dénivelée | Un décalage et une dénivelée |
| Verticalement vers le haut ou le bas | Une dénivelée seule |
| Talus jusqu'au terrain | Depuis son point, vers le terrain, au taux de déblai là où le terrain est au-dessus et au taux de remblai là où il est en dessous |
| Jusqu'au terrain | Un décalage, puis verticalement vers le haut ou le bas jusqu'au terrain |
| Mur de soutènement | Un mur de l'épaisseur que vous indiquez : en déblai, son sommet rejoint le terrain au niveau de la face de la route ; en remblai, la route passe par-dessus et sa face extérieure descend jusqu'au terrain |

   Cochez **Dessus** pour les points par lesquels passe la surface finie. Le dernier point « dessus » est l'endroit où commence le gabarit suivant de ce côté. Une **Cible** permet à un corridor de déplacer le point : son décalage ou son altitude provient d'une ligne.
4. Ajoutez des **composants** : des formes fermées définies par des codes de point (`0` est le point 0,0), chacune avec un nom, un matériau et un type. Leurs surfaces donnent les volumes.

Le dessin suit chaque modification à l'échelle réelle, et la liste en dessous indique ce qui ne va pas (un point qui rejoint le terrain avant la fin, une valeur que le gabarit n'a pas, un composant sans surface). {{ui:Ajouter à ce projet}} ou {{ui:Enregistrer}} le conserve, en une seule étape d'annulation.

## Construire un corridor à partir de gabarits

Sélectionnez un tracé en plan doté d'un corridor et, dans ses Propriétés, activez {{ui:Construire à partir de gabarits par PK}}. Le corridor démarre avec les exemples de deux voies et de raccordement sur les deux côtés.

- **Régions.** Chaque région commence à un PK et va jusqu'à celui de la région suivante. {{ui:Ajouter une région}} en ajoute une ; modifiez son PK de départ dans sa case.
- **Gauche et droite séparées.** Chaque côté de chaque région a sa propre liste de **Chaussée**, du plan d'axe vers l'extérieur, et sa propre **Condition de fin** : raccordement au terrain, fossé, mur, ou tout gabarit qui rejoint le terrain. Sans condition de fin, le côté se raccorde au terrain aux pentes de déblai et de remblai du corridor. {{ui:Copier de gauche à droite}} copie un côté.
- **Valeurs et cibles.** Sous chaque gabarit d'un côté, une case par valeur (vide = la valeur propre au gabarit) et, pour un point qui accepte une cible, la ligne caractéristique ou la ligne d'un autre corridor qui le déplace.
- **Du PK et Au PK** limitent le corridor à une partie du tracé.

Les profils en travers, les lignes en plan de chaque code de point, la surface projetée, l'implantation et les terrassements suivent. Les Propriétés listent le volume de chaque composant par côté et par région (méthode des aires moyennes le long de l'axe). Le dévers et les cibles de bord du corridor ne sont pas utilisés lorsque le corridor est construit à partir de gabarits.

## Plusieurs corridors sur un même tracé

Sous **Corridors sur ce tracé en plan**, {{ui:Ajouter un corridor}} ajoute un corridor sur le reste du tracé : le premier corridor reçoit un PK de fin au milieu (ou conserve le sien), et le nouveau commence là avec la dernière région de gabarits du premier. Chaque corridor a son propre nom, sa plage de PK, ses gabarits et ses terrassements. Désactivez-en un avec sa case {{ui:Activé}}. Lorsque deux plages se chevauchent, le corridor le plus récent se raccorde sur le précédent.

## Gabarits de terrain

Un gabarit de terrain plaque les couches d'un gabarit sur un terrain à partir de son point 0,0 : une couche située sous le point 0,0 pénètre dans le sol (la terre végétale à décaper), et une couche située au-dessus repose sur le sol (fondation et chaussée sur un parking). Les largeurs et les pentes n'ont pas d'importance : seule compte la profondeur de chaque composant au-dessus ou au-dessous du point 0,0.

Ouvrez {{ui:Surface}} › {{ui:Plus}} › {{ui:Gabarits de terrain…}} (ou tapez {{cmd:TERRAINTEMPLATES}}) ; le bloc figure aussi dans les Propriétés du projet. {{ui:Ajouter un gabarit de terrain}} en ajoute un avec l'exemple de terre végétale. Pour chacun, choisissez :

- le **gabarit** (ses valeurs peuvent être modifiées pour celui-ci),
- le **terrain** : le terrain existant ou la surface projetée,
- la **forme** qui le découpe : le terrain entier, une parcelle, une plateforme ou une ligne caractéristique fermée. Plusieurs gabarits de terrain peuvent utiliser des formes différentes sur le même terrain.

Chaque couche indique son épaisseur, sa surface en plan et son volume. Le volume est la surface en plan multipliée par l'épaisseur, celle-ci étant mesurée verticalement ; la surface est mesurée sur une grille, et la surface plaquée (inclinée) est également donnée. Les formes sont dessinées sur le plan, sur le calque C-TOPO-TMPL. Les gabarits de terrain ne modifient pas la surface projetée.

## Matériaux et quantités

Le bloc Terrassements du projet liste les **Matériaux des gabarits** : chaque composant de corridor et chaque couche de gabarit de terrain avec son volume. {{ui:Envoyer à TakeoffCraft}} les écrit dans le fichier de quantités après le déblai et le remblai, un poste par élément, en cu yd (projets en pieds) ou en mètres cubes.

## Fichiers

Les gabarits, les régions, les corridors supplémentaires et les gabarits de terrain sont enregistrés dans le fichier du projet. Un projet qui n'en utilise aucun est enregistré exactement comme avant, et les anciennes versions de CivilCraft ouvrent un projet qui les utilise (elles ignorent les gabarits et construisent le profil type propre au corridor).
