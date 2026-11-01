---
title: Travailler avec la disposition boîte à outils et boîte d'informations
summary: Faire passer l'application à une colonne d'outils à gauche avec des emplacements pour les vôtres, une boîte d'informations en haut qui suit l'outil en cours ou ce que vous avez sélectionné, un navigateur à droite, un onglet par vue, des options rapides et une palette de modification, et revenir à la disposition classique quand vous voulez.
keywords: disposition, espace de travail, boîte à outils, colonne d'outils, boîte d'informations, barre d'informations, navigateur, plan du projet, barre rapide, options rapides, palette de modification, palette contextuelle, mes outils, outils favoris, onglets de vue, fenêtre de la boîte à outils, disposition classique, changer de disposition, basculer de disposition
from: 2f807c9c
---

**Boîte à outils et boîte d'informations** est l'une des trois dispositions de l'espace de travail de l'application. Les outils de dessin se trouvent dans une colonne à gauche, une boîte d'informations en haut montre ce dont l'outil en cours a besoin ou ce que vous avez sélectionné, chaque vue a un onglet, et une barre rapide sous le dessin regroupe quelques options de tous les jours. Les outils sont ceux de l'application : tout ce que vous pouvez faire dans la disposition classique fonctionne aussi ici, et votre dessin, votre style de menu et vos touches restent comme ils sont.

## La choisir

1. Ouvrez {{ui:Paramètres}} (l'engrenage, ou {{key:Mod+,}}).
2. Choisissez l'onglet {{ui:Général}}, puis allez à {{ui:Disposition}} › {{ui:Espace de travail}}.
3. Choisissez {{ui:Boîte à outils et boîte d'informations}}.

La disposition change aussitôt. Le choix est le même pour toutes les applications de ce navigateur : chaque application s'ouvre ensuite avec cette disposition, qui est en place avant l'affichage de la page, de sorte que vous ne voyez jamais d'abord la disposition classique.

## Ce qui se trouve où

- **Barre d'outils :** la barre d'outils de l'application reste en haut de la zone de dessin, avec ses menus.
- **Boîte d'informations :** sous la barre d'outils. Pendant qu'un outil s'exécute, elle montre l'outil et ce qu'il demande. Lorsque vous sélectionnez quelque chose, elle montre ses principaux paramètres (pour un mur : son type, son épaisseur, sa longueur, sa ligne de référence et sa hauteur), et vous pouvez les modifier directement : une modification ici équivaut à la même dans Propriétés, et {{key:Mod+Z}} l'annule. Sans sélection, elle indique « Rien n'est sélectionné ». Chaque application y ajoute ses propres zones, comme le calque ou le niveau courant, ou le document ouvert.
- **Boîte à outils :** la colonne de gauche, avec les outils de l'application en groupes. Cliquez sur le nom d'un groupe pour le replier ou le rouvrir. L'outil en cours est allumé.
- **Mes outils :** le premier groupe de la boîte à outils, huit emplacements vides pour les outils que vous utilisez le plus. Cliquez sur un emplacement vide pour choisir n'importe quel outil ou commande de l'application ; ou faites un clic droit sur un outil de la boîte à outils et choisissez {{ui:Ajouter à Mes outils}} ; ou faites glisser un outil sur un emplacement. Faites un clic droit sur un emplacement pour le changer ou le vider. Vos emplacements sont conservés pour chaque application dans ce navigateur.
- **Navigateur :** le panneau de droite. Le navigateur de projet de l'application est en haut (plans, coupes, façades, vues 3D, nomenclatures, feuilles, selon ce que l'application propose) : cliquez sur l'un d'eux pour l'ouvrir. Dessous, {{ui:Propriétés}} et un onglet avec les autres contenus du panneau de droite.
- **Onglets de vue :** un onglet pour chaque vue du fichier ouvert (une feuille, un plan, une scène…), au-dessus du dessin.
- **Barre rapide :** sous le dessin, les réglages de vue et les options courantes de l'application, comme l'échelle, le niveau de détail, la plage de vue, l'ajustement, le plan, la division ou la 3D, les accrochages et les unités.
- **Palette de modification :** cliquez sur un élément du dessin et une petite palette apparaît près du pointeur avec les commandes de modification de l'application pour cet élément, comme déplacer, copier, pivoter, symétrie, dupliquer ou supprimer, et {{ui:Propriétés}}. {{key:Esc}}, la molette, un autre clic ou son bouton de fermeture la rangent.

Un outil qui ne peut pas s'exécuter pour le moment est grisé, et son info-bulle dit pourquoi. Cliquez dessus, ou appuyez sur {{key:Enter}} dessus, pour lire la raison dans une zone.

{{key:Esc}} termine d'abord l'outil en cours, comme dans la disposition classique, et tous les raccourcis ainsi que {{key:Ctrl+Shift+F}} (modes d'écran) fonctionnent comme avant.

## Donner sa propre fenêtre à la boîte à outils

Le bouton {{ui:Déplacer la boîte à outils}} en haut de la boîte à outils propose {{ui:Déplacer dans une nouvelle fenêtre}} : la boîte à outils s'ouvre dans une fenêtre étroite à part que vous pouvez placer à côté de l'application ou sur un second écran. Les touches appuyées là atteignent l'application. {{ui:Remettre la boîte à outils en place}}, ou la fermeture de cette fenêtre, la ramène.

Les paramètres de la barre d'outils s'appliquent aussi à la boîte à outils : {{ui:Paramètres}} › {{ui:Général}} › {{ui:Barre d'outils}} › {{ui:Icônes et libellés}}, {{ui:Icônes seules}} ou {{ui:Libellés seuls}}, et {{ui:Afficher les noms de groupe (Fichier, Dessin, …)}}.

## Vos panneaux restent les vôtres

Les panneaux de gauche et de droite conservent tout ce qui est décrit dans [Organiser les panneaux](common:arrange-panels) : ancrer, faire flotter, épingler, masquer, onglets, {{ui:Déplacer dans une nouvelle fenêtre}} et {{ui:Réinitialiser la disposition}}.

## Revenir à la disposition classique

Ouvrez {{ui:Paramètres}} › {{ui:Général}} › {{ui:Disposition}} › {{ui:Espace de travail}} et choisissez {{ui:CadCraft classique}}. Chaque barre d'outils, onglet et panneau revient où il était.

:::note
Sur un téléphone, ou dans une fenêtre de 760 pixels de large ou moins, l'application utilise sa disposition pour téléphone quel que soit votre choix. Une fenêtre plus large rétablit votre disposition.
:::

Pour essayer un autre agencement, voir [la disposition ruban et explorateur de projet](common:layout-ribbon).
