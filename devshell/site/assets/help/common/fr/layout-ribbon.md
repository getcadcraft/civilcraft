---
title: Travailler avec la disposition ruban et explorateur de projet
summary: Passez l'application à un ruban d'onglets au-dessus du dessin, avec Propriétés et un explorateur de projet à gauche et un onglet pour chaque vue ouverte, puis revenez à la disposition classique quand vous le voulez.
keywords: disposition, espace de travail, ruban, onglets du ruban, explorateur de projet, explorateur, palettes, palette Propriétés, onglets de vues, barre d'état, accès rapide, réduire le ruban, réduire, fenêtre du ruban, disposition classique, changer de disposition, basculer de disposition, ancré
from: 93700102
---

**Ruban et explorateur de projet** est l'une des trois dispositions de l'application. Un ruban d'onglets court en haut, Propriétés et un explorateur de projet se partagent le panneau de gauche, chaque vue ouverte reçoit un onglet au-dessus du dessin, et une barre d'état se trouve en bas. Les outils sont ceux de l'application : tout ce que vous pouvez faire dans la disposition classique fonctionne aussi ici, et votre dessin, votre style de menu et vos raccourcis restent les mêmes.

## Le choisir

1. Ouvrez {{ui:Paramètres}} (l'engrenage, ou {{key:Mod+,}}).
2. Choisissez l'onglet {{ui:Général}}, puis allez dans {{ui:Disposition}} › {{ui:Espace de travail}}.
3. Choisissez {{ui:Ruban et explorateur de projet}}.

La disposition change aussitôt. Le choix vaut pour toutes les applications de ce navigateur : chacune s'ouvre dans cette disposition à partir de maintenant, et elle est en place avant l'affichage de la page, si bien que vous ne voyez jamais la disposition classique en premier.

## Ce qui se trouve où

- **Barre de titre :** le nom de l'application, les boutons d'accès rapide (ouvrir, enregistrer, annuler, rétablir), le nom du fichier ouvert, {{ui:Ce que fait chaque outil ici}} (une liste de tous les outils avec une zone de recherche, indiquant lesquels sont disponibles maintenant et pourquoi les autres ne le sont pas), plein écran, {{ui:Aide}} et {{ui:Paramètres}}. Dans cette disposition, la barre de titre remplace la barre d'application.
- **Ruban :** les outils de l'application en onglets, chaque onglet en groupes. {{ui:Fichier}} à gauche ouvre, enregistre et le reste. Certaines applications ajoutent un onglet à elles pendant que vous travaillez dans un mode ou un espace de travail particulier ; il est éclairé tant qu'il s'applique, puis disparaît.
- **Barre d'options :** sous le ruban, ce dont l'outil en cours a besoin de votre part, ou ce qui est sélectionné.
- **Panneau de gauche :** {{ui:Propriétés}} au-dessus, et en dessous les palettes (l'explorateur de projet et le contenu propre au panneau) sous forme d'onglets. Faites glisser la ligne entre elles pour partager l'espace.
- **Onglets de vues :** un onglet par vue ouverte (une feuille, un plan, une scène…). Fermez-en un avec son bouton de fermeture ; le fichier reste ouvert.
- **Barre de vue et barre d'état :** sous le dessin, les commandes propres à la vue (échelle, zoom) ; en bas, les messages de l'application.

Un outil qui ne peut pas fonctionner pour l'instant est grisé, et son info-bulle indique pourquoi (par exemple « Ouvrez d'abord un fichier », ou que l'application ne dispose pas encore de cet outil). Cliquez dessus, ou appuyez sur {{key:Enter}} quand il a le focus, pour lire la raison dans une boîte.

## Utiliser le ruban au clavier

Quand un onglet du ruban a le focus, {{key:Left}} et {{key:Right}} passent d'un onglet à l'autre, et {{key:Home}} et {{key:End}} vont au premier et au dernier. {{key:Esc}} arrête d'abord l'outil en cours, comme dans la disposition classique, et tous les raccourcis, ainsi que {{key:Ctrl+Shift+F}} (modes d'affichage), fonctionnent comme avant.

## Replier le ruban ou lui donner sa propre fenêtre

- Double-cliquez sur un onglet du ruban pour le replier sur ses onglets ; un clic sur un onglet affiche alors ses outils jusqu'à ce que vous passiez ailleurs. Double-cliquez de nouveau pour le garder ouvert. Le bouton {{ui:Déplacer le ruban}}, à l'extrémité droite du ruban, propose aussi {{ui:Réduire le ruban}} et {{ui:Garder le ruban ouvert}}. Chaque application s'en souvient.
- {{ui:Déplacer le ruban}} › {{ui:Déplacer dans une nouvelle fenêtre}} place le ruban dans une fenêtre à part, par exemple sur un second écran. Les touches appuyées là atteignent l'application. {{ui:Remettre le ruban en place}}, ou la fermeture de cette fenêtre, le ramène chez lui.

Les réglages de la barre d'outils s'appliquent au ruban : {{ui:Paramètres}} › {{ui:Général}} › {{ui:Barre d'outils}} › {{ui:Icônes et libellés}}, {{ui:Icônes seules}} (le ruban affiche alors deux lignes de petites icônes par groupe) ou {{ui:Libellés seuls}}, et {{ui:Afficher les noms de groupe (Fichier, Dessin, …)}}.

## Vos panneaux restent les vôtres

Les panneaux gauche et droit gardent tout ce qui est décrit dans [Disposer les panneaux](common:arrange-panels) : ancrage, flottement, épingle, masquage, onglets, {{ui:Déplacer dans une nouvelle fenêtre}} et {{ui:Réinitialiser la disposition}}.

## Revenir à la disposition classique

Ouvrez {{ui:Paramètres}} › {{ui:Général}} › {{ui:Disposition}} › {{ui:Espace de travail}} et choisissez {{ui:CadCraft classique}}. Chaque barre d'outils, chaque onglet et chaque panneau retourne à sa place d'origine.

:::note
Sur un téléphone, ou dans une fenêtre de 760 pixels de large ou moins, l'application utilise sa disposition pour téléphone quel que soit votre choix. Une fenêtre plus large rétablit votre disposition.
:::

Pour essayer une autre disposition, voir [la disposition boîte à outils et boîte d'informations](common:layout-toolbox).

Pour modifier ce que cette disposition affiche, voir [Modifier une disposition à l'écran](common:layout-edit) ; pour une disposition sombre avec barre de menus et ruban, voir [la disposition Dessin](common:layout-drafting).
