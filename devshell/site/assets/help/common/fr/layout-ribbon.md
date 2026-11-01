---
title: Travailler avec la disposition ruban et explorateur de projet
summary: Faire passer l'application à un ruban d'onglets au-dessus du dessin, avec Propriétés et un explorateur de projet à gauche et un onglet pour chaque vue ouverte, et revenir à la disposition classique quand vous voulez.
keywords: disposition, espace de travail, ruban, onglets du ruban, explorateur de projet, explorateur, palettes, palette des propriétés, onglets de vue, barre d'état, accès rapide, réduire le ruban, minimiser le ruban, fenêtre du ruban, disposition classique, changer de disposition, basculer de disposition, ancré
from: c1a6eccc
---

**Ruban et explorateur de projet** est l'une des trois dispositions de l'espace de travail de l'application. Un ruban d'onglets s'étend en haut, Propriétés et un explorateur de projet se partagent le panneau de gauche, chaque vue que vous ouvrez a un onglet au-dessus du dessin, et une barre d'état se trouve en bas. Les outils sont ceux de l'application : tout ce que vous pouvez faire dans la disposition classique fonctionne aussi ici, et votre dessin, votre style de menu et vos touches restent comme ils sont.

## La choisir

1. Ouvrez {{ui:Paramètres}} (l'engrenage, ou {{key:Mod+,}}).
2. Choisissez l'onglet {{ui:Général}}, puis allez à {{ui:Disposition}} › {{ui:Espace de travail}}.
3. Choisissez {{ui:Ruban et explorateur de projet}}.

La disposition change aussitôt. Le choix est le même pour toutes les applications de ce navigateur : chaque application s'ouvre ensuite avec cette disposition, qui est en place avant l'affichage de la page, de sorte que vous ne voyez jamais d'abord la disposition classique.

## Ce qui se trouve où

- **Barre de titre :** le nom de l'application, les boutons d'accès rapide (ouvrir, enregistrer, annuler, rétablir), le nom du fichier ouvert, {{ui:Ce que fait chaque outil ici}} (une liste de tous les outils avec une zone de recherche, indiquant lesquels sont prêts maintenant et pourquoi les autres ne le sont pas), le plein écran, {{ui:Aide}} et {{ui:Paramètres}}. Dans cette disposition, la barre de titre remplace la barre de l'application.
- **Ruban :** les outils de l'application dans des onglets, chaque onglet en groupes. {{ui:Fichier}} à gauche permet d'ouvrir, d'enregistrer et le reste. Certaines applications ajoutent un onglet à elles pendant que vous travaillez dans un mode ou un espace de travail particulier ; il est allumé tant qu'il s'applique et disparaît ensuite.
- **Barre d'options :** sous le ruban, ce que l'outil en cours attend de vous, ou ce qui est sélectionné.
- **Panneau de gauche :** {{ui:Propriétés}} au-dessus, et en dessous les palettes (l'explorateur de projet et le contenu propre au panneau) sous forme d'onglets. Faites glisser la ligne entre elles pour répartir l'espace.
- **Onglets de vue :** un onglet par vue ouverte (une feuille, un plan, une scène…). Fermez-en un avec son bouton de fermeture ; le fichier reste ouvert.
- **Barre de vue et barre d'état :** sous le dessin, les commandes propres à la vue (échelle, zoom) ; en bas, les messages de l'application.

Un outil qui ne peut pas s'exécuter pour le moment est grisé, et son info-bulle dit pourquoi (par exemple « Ouvrez d'abord un fichier », ou que l'application n'a pas encore cet outil). Cliquez dessus, ou appuyez sur {{key:Enter}} dessus, pour lire la raison dans une zone.

## Utiliser le ruban au clavier

Avec un onglet du ruban sélectionné, {{key:Left}} et {{key:Right}} passent d'un onglet à l'autre, et {{key:Home}} et {{key:End}} vont au premier et au dernier. {{key:Esc}} termine d'abord l'outil en cours, comme dans la disposition classique, et tous les raccourcis ainsi que {{key:Ctrl+Shift+F}} (modes d'écran) fonctionnent comme avant.

## Replier le ruban ou lui donner sa propre fenêtre

- Double-cliquez sur un onglet du ruban pour replier le ruban sur ses onglets ; un clic sur un onglet affiche alors ses outils jusqu'à ce que vous passiez à autre chose. Double-cliquez de nouveau pour le garder ouvert. Le bouton {{ui:Déplacer le ruban}} à l'extrémité droite du ruban propose aussi {{ui:Réduire le ruban}} et {{ui:Garder le ruban ouvert}}. Chaque application s'en souvient.
- {{ui:Déplacer le ruban}} › {{ui:Déplacer dans une nouvelle fenêtre}} place le ruban dans une fenêtre à part, par exemple sur un second écran. Les touches appuyées là atteignent l'application. {{ui:Remettre le ruban en place}}, ou la fermeture de cette fenêtre, le ramène.

Les paramètres de la barre d'outils s'appliquent au ruban : {{ui:Paramètres}} › {{ui:Général}} › {{ui:Barre d'outils}} › {{ui:Icônes et libellés}}, {{ui:Icônes seules}} (le ruban montre alors deux rangées de petites icônes par groupe) ou {{ui:Libellés seuls}}, et {{ui:Afficher les noms de groupe (Fichier, Dessin, …)}}.

## Vos panneaux restent les vôtres

Les panneaux de gauche et de droite conservent tout ce qui est décrit dans [Organiser les panneaux](common:arrange-panels) : ancrer, faire flotter, épingler, masquer, onglets, {{ui:Déplacer dans une nouvelle fenêtre}} et {{ui:Réinitialiser la disposition}}.

## Revenir à la disposition classique

Ouvrez {{ui:Paramètres}} › {{ui:Général}} › {{ui:Disposition}} › {{ui:Espace de travail}} et choisissez {{ui:CadCraft classique}}. Chaque barre d'outils, onglet et panneau revient où il était.

:::note
Sur un téléphone, ou dans une fenêtre de 760 pixels de large ou moins, l'application utilise sa disposition pour téléphone quel que soit votre choix. Une fenêtre plus large rétablit votre disposition.
:::

Pour essayer un autre agencement, voir [la disposition boîte à outils et boîte d'informations](common:layout-toolbox).
