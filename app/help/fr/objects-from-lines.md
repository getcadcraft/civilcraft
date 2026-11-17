---
title: Objets issus de linéaires, avec lien conservé
summary: Créez un pavage, une zone plantée, un massif, une haie, un chemin, un mur, une bordure, des marches, une rampe, une plateforme, une noue ou une ligne caractéristique à partir d'une ligne ; l'objet suit la ligne lorsqu'elle bouge, jusqu'à ce que vous rompiez le lien.
keywords: à partir d'une ligne, linéaires, DWG, DXF, lien, lié, suivre, régénérer, rompre le lien, ligne caractéristique, ligne caractéristique issue des linéaires, calque importé, contour, supercad studio, ligne de dessin
from: eb67a0c6
---

{{ui:Depuis une ligne}} (Aménagement paysager › {{ui:Plus}}) : cliquez une ligne caractéristique, ou une ligne ou un contour d'un calque DWG/DXF importé. Une ligne fermée peut créer un pavage, une pelouse, un massif planté, une prairie, un couvre-sol, un massif ou une plateforme ; une ligne ouverte peut créer un chemin, un mur, une bordure, des marches (son premier et son dernier point), une rampe, une haie ou une noue. L'un ou l'autre type peut aussi créer une **ligne caractéristique**, sauf une ligne caractéristique elle-même.

## Une ligne caractéristique à partir d'une ligne

Une ligne caractéristique créée à partir d'une ligne reprend ses points, fermée si la ligne l'était. Ses niveaux sont posés sur le terrain existant (0 là où il n'y en a pas encore), et son usage est **Désactivé** : elle ne façonne aucun terrain tant que vous ne choisissez pas un usage et ne réglez pas ses niveaux dans ses propriétés. Lorsque la ligne bouge, une ligne caractéristique qui a le même nombre de points conserve chaque niveau que vous avez réglé ; lorsque la ligne gagne ou perd des points, les niveaux sont à nouveau posés sur le terrain. Voir [Lignes caractéristiques](topic:feature-lines).

L'objet nouveau garde un **lien** vers sa ligne. Lorsque la ligne bouge (vous faites glisser ses points, ou le dessin est déplacé ou relu), l'objet prend la nouvelle forme dans la même étape d'annulation, et le terrain projeté suit à travers les modificateurs de terrain. Les propriétés indiquent à quoi il est lié ; {{ui:Rompre le lien}} le rend indépendant.

Les lignes sont d'abord contrôlées : une ligne doit avoir au moins 2 points (3 pour un contour), au plus 5000, et des nombres réels ; un contour doit être fermé et ne pas se croiser lui-même. Une ligne qui échoue n'est pas utilisée : l'objet reste tel quel, et le panneau Problèmes indique pourquoi. Si la ligne est supprimée, l'objet reste et le panneau Problèmes le signale.

## Dans SuperCad Studio

Ouvrez le site et le dessin 2D dans le même projet. Choisissez une ligne ou une polyligne du dessin 2D, appuyez sur Ctrl+K et lancez {{ui:Objet d'aménagement depuis la ligne choisie du dessin}} : CivilCraft demande ce qu'il faut créer, comme ci-dessus, et l'objet reste lié à cette ligne du dessin. Après avoir modifié des lignes dans le dessin, Ctrl+K {{ui:Mettre à jour l'aménagement depuis le dessin}} fait suivre les objets, avec une étape d'annulation par ligne. Le fichier de liens du projet enregistre quel objet suit quelle ligne. L'aide de SuperCad Studio contient une rubrique Aménagement paysager.
