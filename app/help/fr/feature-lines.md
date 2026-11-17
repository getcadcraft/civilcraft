---
title: Lignes caractéristiques
summary: Dessiner des lignes 3D dont vous réglez la pente sommet par sommet, en faire des décalages en gradins, et les utiliser comme lignes de rupture du terrain ou comme plateformes en pente dans le projet.
keywords: arc, courbe, rayon, arc 3D, hélice, bordure courbe, superposition de pente, superposition d'altitude, flèches de pente, ligne caractéristique, pente, altitude, décalage en gradins, décalage, ligne de rupture, bordure, fossé, banquette, plateforme en pente, raccordement au terrain, terrassement, polyligne 3D
from: d55b25fb
---

Une ligne caractéristique est une ligne avec une altitude à chaque sommet : une bordure, une ligne d'écoulement de fossé, le haut d'une banquette, le bord d'une plateforme en pente. Vous réglez ses altitudes par valeur ou par pente, vous la recopiez sur le côté avec un décalage vers le haut ou vers le bas, et vous choisissez ce que font les surfaces avec elle.

## Dessiner une ligne

1. Choisissez **Surface** › {{ui:Plus}} › {{ui:Ligne caractéristique}}, ou appuyez sur {{key:L}}.
2. Cliquez sur ses sommets sur le plan. Un clic sur un point topographique prend la place et l'altitude de ce point ; ailleurs, le sommet prend l'altitude du terrain naturel à cet endroit.
3. Appuyez sur {{key:Enter}} pour terminer une ligne ouverte, ou cliquez à nouveau sur le premier sommet pour la fermer.

La nouvelle ligne est sélectionnée et commence comme une ligne de rupture du terrain naturel, posée sur le sol.

## Arcs

Un segment peut être un arc en plan dont les extrémités sont à des altitudes différentes : un raccord de bordure, un fossé courbe, une rampe qui tourne. Sa pente se répartit régulièrement le long de l'arc, et sa longueur se mesure le long de la courbe.

- **Pendant le dessin :** appuyez sur {{key:C}} (sur un écran tactile, {{ui:Arc}} dans la barre au-dessus du plan) pour activer les arcs. Après un sommet, cliquez sur un point de la courbe, puis cliquez à l'endroit où l'arc se termine. Appuyez à nouveau sur {{key:C}} pour les segments droits. {{key:Backspace}} supprime d'abord le point sur la courbe.
- **Après coup :** dans **Propriétés**, saisissez un rayon et le sens de rotation dans la case **Arc** du sommet, par exemple `50 L` ou `50 R` (à gauche ou à droite lorsque vous parcourez la ligne), puis appuyez sur {{key:Enter}}. Videz la case pour rendre le segment droit à nouveau. Un rayon inférieur à la moitié du segment est refusé.

La ligne sélectionnée affiche le rayon de chaque arc à côté de sa pente. **Longueur** se mesure le long des arcs en plan ; **Longueur 3D** compte aussi la montée et la descente. Les décalages en gradins conservent les arcs : un arc à l'extérieur d'un virage s'allonge, un arc à l'intérieur se raccourcit, et un décalage qui dépasse le centre d'un arc est refusé.

Les surfaces, la vue 3D, le DXF et le DWG représentent chaque arc par de petits segments droits restant à 0.01 près de la courbe. Le LandXML le conserve comme arc (voir **Arcs dans d'autres fichiers** ci-dessous).

## Régler les altitudes et les pentes

**Propriétés** liste les sommets avec leur distance le long de la ligne, leur **Altitude** et la **Pente jusqu'au suivant** (en pour cent). Saisissez l'une ou l'autre et appuyez sur {{key:Enter}} :

- Une altitude ne déplace que ce sommet.
- Une pente fixe l'altitude à l'autre extrémité de son segment ; les sommets suivants restent en place, de sorte que la pente du segment suivant change.

Également dans **Propriétés** :

| Action | Effet |
|---|---|
| **Relever ou abaisser tout de** | Ajoute la hauteur saisie à chaque sommet. |
| {{ui:Altitudes du terrain}} | Remet chaque sommet sur le terrain naturel (les sommets hors surface gardent les leurs et sont listés). |
| {{ui:Une seule pente, du premier au dernier}} | Garde les altitudes du premier et du dernier sommet et place les sommets intermédiaires sur une pente régulière. |

La ligne sélectionnée affiche ses altitudes aux sommets et ses pentes le long des segments sur le plan. Faites glisser un sommet avec {{ui:Sélectionner}} pour le déplacer ; son altitude reste la même.

## Décalages en gradins

Sous **Décalage en gradins**, saisissez une **Distance** (positive à droite de la direction de la ligne, négative à gauche), puis une hauteur (monter ou descendre de) ou une pente en pour cent, et cliquez sur {{ui:Créer la ligne décalée}}. La copie est une nouvelle ligne caractéristique : par exemple l'arrière d'une bordure à 0.5 ft sur le côté et 0.5 ft plus haut, ou le bord d'un fossé à 6 ft à 2 %. Une distance qui replierait la copie sur elle-même dans un virage serré est refusée.

## Pentes et altitudes à l'écran

Appuyez sur {{key:E}}, ou cochez **Pentes et altitudes sur les lignes caractéristiques** sous **Affichage**, pour voir la pente de chaque ligne caractéristique le long de chaque segment (avec une petite flèche pointant vers le bas) et son altitude aux sommets. Elles ne s'affichent qu'à l'écran : rien n'est ajouté au dessin, et le PDF, le DXF et le DWG restent inchangés. Les segments courts et les sommets serrés restent sans étiquette jusqu'à ce que vous zoomiez. La ligne sélectionnée affiche toujours ses propres pentes et altitudes.

## Dans la vue de profil

Une ligne caractéristique qui croise un tracé s'affiche dans la vue de profil de ce tracé, avec son nom et son altitude au croisement ; les lignes qui longent le tracé peuvent aussi être affichées. Voir [Concevoir un profil en long](topic:profile).

## Ce que les surfaces en font

Choisissez **Utilisation** :

| Utilisation | Ce qui se passe |
|---|---|
| Ligne de rupture du terrain naturel | Le terrain naturel passe par la ligne à ses altitudes, comme une ligne de rupture dessinée. |
| Terrassée dans le projet | Une ligne **fermée** devient une plateforme en pente : la surface projet à l'intérieur est terrassée jusqu'à son bord. Activez **Raccordement au terrain** pour tracer des talus de déblai et de remblai (horizontal pour 1 vertical) depuis son bord jusqu'au terrain, comme le fait une plateforme ; chaque talus part de l'altitude propre du bord à cet endroit. |
| Seulement dessinée | Elle reste sur le plan et sort dans le DXF, le DWG et le PDF (calque C-GRAD-FEAT, polylignes 3D), mais les surfaces l'ignorent. |

Les volumes, les coupes et la vue 3D incluent les lignes caractéristiques terrassées dans le projet, comme les plateformes. Chaque modification constitue une étape : {{key:Mod+Z}} l'annule.

## Partager des lignes avec votre équipe

Dans un dessin ouvert depuis vos fichiers cloud dans CadCraft Studio, avec une offre d'équipe, les **Propriétés** du projet (rien de sélectionné) comportent une section **Équipe** avec {{ui:Lignes de l'équipe…}} : les lignes que votre équipe a partagées, chacune avec sa révision, sans avoir à sélectionner d'abord une ligne caractéristique. Sélectionnez une ligne pour la partager, publier une nouvelle révision, récupérer celle de l'équipe ou arrêter le partage. En dehors de ce cadre, la section indique ce qu'il faut.

## Arcs dans d'autres fichiers

| Fichier | Ce qui arrive à une ligne caractéristique avec des arcs |
|---|---|
| Projet CivilCraft | Conservée à l'identique. |
| LandXML | Écrite comme élément de plan de lignes et d'arcs avec leurs altitudes, et relue avec ses arcs. Une ligne caractéristique venant d'un autre logiciel arrive en **Seulement dessinée** : choisissez son **Utilisation** pour la mettre dans une surface. |
| DWG et DXF | Une polyligne 3D ne peut pas contenir d'arc, donc la ligne est écrite en petits segments restant à 0.01 près de chaque arc. CivilCraft note aussi dans le dessin quels segments étaient des arcs : lorsque vous ouvrez le dessin comme tracés, {{ui:Lignes caractéristiques}} rétablit les lignes en lignes caractéristiques avec leurs arcs. Les autres logiciels voient une polyligne 3D ordinaire. |
