---
title: Problèmes et BCF
summary: Épinglez un problème sur le plan, un point kilométrique d'un tracé en plan, un point de surface ou une canalisation, attribuez-lui un statut et des commentaires, et échangez les problèmes sous forme de fichiers BCF 2.1 à côté du fichier LandXML.
keywords: problème, problèmes, bcf, commentaire, annotation, réserve, défaut, chantier, épingle, statut, ouvert, résolu, fermé, format de collaboration BIM, landxml, problèmes
from: e44153b1
---

Un problème est une remarque épinglée à un endroit de votre dessin CivilCraft, avec un titre, un statut et des commentaires. Utilisez-le pour indiquer au personnel de chantier ou à un autre programme ce qu'il faut examiner, et pour relire leurs réponses.

## Ajouter un problème

1. Ouvrez **Surface, Plus, Problèmes (BCF)…**
2. Saisissez un titre et la description du problème.
3. Choisissez où l'épingler : le centre de la vue en plan, le point de surface au centre, un point kilométrique du tracé sélectionné (saisissez le PK et un décalage ; à droite, la valeur est positive), ou la canalisation, le regard ou la ligne caractéristique sélectionné.
4. Cliquez sur **Ajouter un problème**. L'épingle apparaît sur le plan sous forme de petit losange avec son numéro.

Cliquez sur le titre d'un problème pour zoomer dessus, modifiez son statut dans la liste (Ouvert, Actif, Résolu, Fermé) et ajoutez des commentaires. Chaque modification correspond à une étape d'annulation, et les problèmes sont enregistrés dans le fichier de projet.

## Les échanger au format BCF

- **Exporter en BCF** écrit un fichier BCF 2.1 avec un sujet par problème : titre, statut, commentaires, et un point de vue avec une caméra orthogonale en plan et l'épingle.
- **Importer un BCF** lit un fichier BCF (les fichiers 2.0 et 3.0 sont lus dans la mesure où ils correspondent à la 2.1). Un sujet dont le GUID existe déjà met à jour ce problème (statut, nouveaux commentaires) au lieu d'en ajouter un second.
- **Depuis Problèmes** crée un problème à partir de chaque entrée ouverte du panneau Problèmes qui indique son emplacement.

Le BCF transporte des mètres dans les coordonnées propres à ce projet, sans décalage. L'autre programme doit utiliser le même système de coordonnées que votre fichier LandXML pour que les épingles tombent au bon endroit. L'élément visé par une épingle (tracé en plan, point kilométrique, décalage, canalisation) est transmis sous forme d'étiquettes commençant par « `cc:` », que CivilCraft relit.

## Ce qui n'est pas vérifié

Les épingles et les points de vue n'ont été testés qu'en écrivant un fichier puis en le relisant dans CivilCraft. Aucun autre programme BIM ne les a encore ouverts. La question de savoir si `view to world scale` correspond à la hauteur totale ou à la demi-hauteur de la vue varie d'un programme à l'autre : CivilCraft écrit la hauteur totale.
