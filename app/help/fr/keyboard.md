---
title: Clavier et souris
summary: Chaque raccourci clavier et chaque action de souris, pavé tactile et écran tactile dans CivilCraft, regroupés, avec les différences de navigateur et de plateforme.
keywords: clavier, raccourcis, touches de raccourci, touches, souris, pavé tactile, tactile, panoramique, zoom, pincement, molette, clic droit, mac, touche command
from: a9756f46
---

Les touches d'une seule lettre fonctionnent lorsque vous ne saisissez pas dans une zone de texte. Les raccourcis avec {{key:Mod}} utilisent Commande sur Mac et Ctrl ailleurs. Voir aussi [Touches dans le navigateur](common:keys).

## Fichiers et édition

| Touche | Action |
|---|---|
| {{key:Mod+O}} | Ouvrir un fichier de points, LandXML ou projet |
| {{key:Mod+S}} | Enregistrer le projet (télécharge un fichier `.civilcraft.json`) |
| {{key:Mod+P}} | Tracer le plan en PDF (ouvre la boîte de dialogue de tracé, et non l'impression du navigateur) |
| {{key:Mod+Z}} | Annuler |
| {{key:Mod+Y}} | Rétablir |
| {{key:Delete}} | Supprimer les points topographiques, le tracé, la plateforme, le regard, la canalisation ou le PIV sélectionné |
| {{key:Mod+C}} | Copier les points topographiques sélectionnés (aussi sous forme de lignes de points pour un tableur) |
| {{key:Mod+X}} | Couper les points topographiques sélectionnés |
| {{key:Mod+V}} | Coller des points : ils suivent le pointeur, cliquez là où ils doivent aller |
| {{key:Mod+Shift+V}} | Coller à la même position : aux coordonnées propres des points |
| {{key:Mod+D}} | Dupliquer les points sélectionnés : une copie suit le pointeur |
| {{key:Mod+A}} | Sélectionner tous les points topographiques |
| {{key:Esc}} | Désélectionner tout (et annuler un collage) |

{{key:Mod+S}}, {{key:Mod+O}} et {{key:Mod+P}} fonctionnent même lorsque vous saisissez dans une zone. {{key:Mod+Z}} et {{key:Mod+Y}} dans une zone de texte annulent ou rétablissent votre saisie, comme d'habitude, et il en va de même pour {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}} et {{key:Mod+A}} : dans une zone, ils copient, coupent, collent et sélectionnent son texte. Lorsqu'un texte est sélectionné sur la page (dans un panneau), {{key:Mod+C}} copie ce texte. {{key:Mod+Shift+Z}} n'a aucun effet dans CivilCraft : utilisez {{key:Mod+Y}} ou le bouton {{ui:Rétablir}}.

:::mac
La touche Mac intitulée **delete** correspond à {{key:Backspace}} pour le navigateur. Pour supprimer une sélection, appuyez sur {{key:Delete}} (Fn et delete), ou choisissez {{ui:Supprimer}} dans le menu {{ui:Plus}} de la barre d'outils.
:::

## Outils

| Touche | Outil |
|---|---|
| {{key:V}} | {{ui:Sélectionner}} |
| {{key:M}} | {{ui:Mesurer}} : distances, surfaces et pentes sur le plan ([Mesurer](topic:measure)) |
| {{key:A}} | {{ui:Tracé en plan}} |
| {{key:G}} | {{ui:Plateforme}} |
| {{key:P}} | {{ui:Canalisations}} |
| {{key:B}} | {{ui:Ligne de rupture}} |
| {{key:O}} | {{ui:Contour}} |
| {{key:R}} | Afficher ou masquer la vue de profil |
| {{key:I}} | Activer ou désactiver {{ui:Ajouter des PIV}} (ouvre la vue de profil si elle est fermée) |
| {{key:F}} | {{ui:Ajuster}} : tout afficher |
| {{key:D}} | {{ui:3D}} : afficher le site en 3D, ou revenir au plan |
| {{key:E}} | Afficher ou masquer les pentes et cotes de niveau le long de chaque ligne caractéristique (à l'écran uniquement) |

Appuyer de nouveau sur la touche de l'outil actif revient à {{ui:Sélectionner}}. Les lettres combinées à {{key:Shift}} ne font rien.

## Pendant le dessin

| Touche | Action |
|---|---|
| {{key:Enter}} | Terminer le tracé, la plateforme, le tronçon de canalisation, la ligne de rupture ou le contour |
| {{key:Backspace}} | Supprimer le dernier point cliqué |
| {{key:C}} | Ligne caractéristique : activer ou désactiver les arcs (après un sommet, cliquez un point de la courbe, puis son extrémité) |
| {{key:Esc}} | Annuler le dessin (ou le collage) ; appuyée de nouveau (ou sans rien de dessiné), revient à {{ui:Sélectionner}} et désélectionne |

## Vue en plan

| Touche ou action | Résultat |
|---|---|
| Molette | Zoom avant ou arrière au niveau du pointeur |
| Glisser sur un espace vide | Panoramique (dans tout outil ; un clic bref clique toujours ; avec {{key:Shift}} maintenu, trace un rectangle de sélection) |
| Glisser avec le bouton central | Panoramique |
| Glisser avec le bouton droit | Panoramique (aucun menu ne s'ouvre) |
| {{key:Space}} et glisser | Panoramique |
| Clic | Sélectionner (avec {{ui:Sélectionner}}), ou placer un point (avec un outil de dessin) |
| {{key:Shift}} et clic | Ajouter un point topographique à la sélection, ou le retirer |
| {{key:Shift}} et glisser | Tracer un rectangle : les points topographiques à l'intérieur sont ajoutés à la sélection. Glissez autour d'eux pour un [lasso](topic:lasso-selection) |
| {{key:Space}} pendant le tracé d'un lasso | Fenêtre, puis capture, puis clôture |
| Clic pendant le collage | Place les points collés à cet endroit ({{key:Enter}} les place à leurs propres coordonnées) |
| Glisser une poignée | Déplacer un PI, un angle de plateforme ou un regard (une seule étape d'annulation) |
| {{key:Up}} {{key:Down}} {{key:Left}} {{key:Right}} | Panoramique, lorsque le plan a le focus (cliquez-le d'abord) |
| {{key:Plus}} et {{key:Minus}} | Zoom avant et arrière au centre, lorsque le plan a le focus |

La touche = fait un zoom avant comme {{key:Plus}}, inutile donc d'appuyer sur {{key:Shift}}.

## Vue de profil

| Action | Résultat |
|---|---|
| Clic avec {{ui:Ajouter des PIV}} activé | Ajoute un PIV à cet endroit |
| Clic sur un PIV | Le sélectionne |
| Glisser un PIV | Le déplace (une seule étape d'annulation) |
| {{key:Delete}} ou {{key:Backspace}} | Supprime le PIV sélectionné ({{key:Backspace}} seulement lorsque la vue de profil a le focus) |

La vue de profil ne fait ni zoom ni panoramique.

## Écran et aide

| Touche | Action |
|---|---|
| {{key:F1}} | Ouvrir ou fermer cette aide (le panneau latéral) ; {{ui:Aide}} dans la barre de l'application fait de même |
| {{key:Esc}} | Fermer le panneau d'aide lorsqu'il est ouvert |
| {{key:Ctrl+Shift+F}} | Parcourir les modes d'écran : plein écran, plein écran avec les barres masquées, normal |
| {{key:Esc}} | Quitter le plein écran (touche propre au navigateur) |

{{key:F1}} atteint l'aide avant que CivilCraft ne le voie, de sorte qu'elle fonctionne dans tout outil. Sur la plupart des claviers Mac, appuyez sur fn avec F1, ou cliquez {{ui:Aide}}. {{key:Ctrl+Shift+F}} utilise la touche Ctrl sur toutes les plateformes, y compris Mac. Voir [Utiliser l'aide](common:help) pour savoir comment chercher dans cette aide.

## Souris, pavé tactile et écran tactile

:::mouse
- La molette fait un zoom au niveau du pointeur. Une souris à molette libre zoome vite : donnez-lui de courtes rotations.
- Panoramique avec n'importe quel glissement sur un espace vide, le bouton central, le bouton droit, ou {{key:Space}} et glisser.
:::

:::mac
Sur le pavé tactile d'un Mac :

- Le défilement à deux doigts **zoome** (il ne fait pas de panoramique), et le pincement zoome aussi.
- Pour faire un panoramique, appuyez et glissez sur un espace vide avec un doigt, ou maintenez {{key:Space}} et glissez.
- Un clic à deux doigts (clic droit) n'ouvre aucun menu et ne fait rien en soi.
:::

:::touch
Sur un écran tactile :

- Le premier contact rend les boutons et lignes de menu à la taille du doigt.
- Appuyez pour sélectionner ou placer un point ; un doigt glissé sur un espace vide fait un panoramique. Un appui peut légèrement osciller : le panoramique ne démarre qu'après un déplacement d'environ 10 pixels du doigt.
- Deux doigts pincent pour zoomer et se déplacent ensemble pour faire un panoramique.
- Glissez une poignée ou un PIV avec un doigt. Les poignées réservent la largeur d'un doigt autour d'elles.
- Pendant le tracé d'un tracé, d'une plateforme, d'une ligne de rupture, d'un contour, d'un tronçon de canalisation, d'une ligne caractéristique ou d'une parcelle, une barre au-dessus du plan propose {{ui:Terminer}} ({{key:Enter}}), {{ui:Annuler le point}} ({{key:Backspace}}) et {{ui:Annuler}} ({{key:Esc}}). Un appui long (une demi-seconde sans bouger) termine aussi.
- En {{ui:Sélectionner}}, un appui long sur un point topographique l'ajoute à la sélection, ou le retire, comme {{key:Shift}}+clic.
- Dans la vue 3D, un doigt fait tourner, deux doigts pincent et déplacent, et un appui sélectionne.
- Il n'y a pas de survol sur tactile : les indications de la barre d'état ne se mettent à jour que lorsqu'un doigt est posé.
:::

## Touches du navigateur prioritaires

Certaines touches appartiennent au navigateur et n'atteignent jamais CivilCraft, par exemple {{key:Mod+W}} (fermer l'onglet), {{key:Mod+T}} (nouvel onglet), {{key:Mod+N}} (nouvelle fenêtre) et {{key:F11}} (plein écran dans les navigateurs Windows et Linux). CivilCraft ne les utilise pas. Si un raccourci ouvre quelque chose dans le navigateur à la place, cliquez une fois sur le plan pour que la page ait le focus, puis réessayez.

## Où se trouve Déplacer

Il n'existe pas de commande Déplacer : choisissez {{ui:Sélectionner}} et glissez un point ou un sommet, ou modifiez ses coordonnées dans {{ui:Propriétés}}. Voir [Modifier les points](topic:edit-points).
