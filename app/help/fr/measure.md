---
title: Mesurer des distances, des surfaces et des pentes
summary: Mesurez sur le plan en cliquant des points : longueur et gisement de chaque côté, total cumulé, longueur le long du terrain, pente, surface et périmètre d'une forme fermée, et entre deux points du profil d'une ligne électrique.
keywords: mesurer, mesure, distance, longueur, surface, périmètre, gisement, pente, déclivité, règle, mètre ruban, le long du terrain, profil, différence de hauteur
from: d614eb25
---

{{ui:Surface}} › {{ui:Plus}} › {{ui:Mesurer}} (aussi dans le menu {{ui:Plus}} de l'espace Lignes électriques, ou appuyez sur {{key:M}}) mesure sans rien ajouter au projet.

## Sur le plan

1. Choisissez {{ui:Mesurer}}, puis cliquez des points. Un clic près d'un point topographique prend sa place et son altitude.
2. La ligne d'état indique le nombre de points et la longueur totale, la longueur du dernier côté et son gisement, sa pente lorsque le terrain est connu aux deux extrémités, et la longueur le long du terrain. À côté du pointeur, le côté en cours de tracé et le total cumulé.
3. Recliquez sur le premier point pour fermer la forme : la ligne d'état ajoute sa **surface** et son **périmètre**. Le clic suivant commence une nouvelle mesure.
4. {{key:Enter}} termine la mesure et conserve ses valeurs dans la ligne d'état ; {{key:Backspace}} retire le dernier point ; {{key:Esc}} l'efface, et {{key:Esc}} une nouvelle fois revient à {{ui:Sélectionner}}.

Les longueurs sont exprimées dans l'unité du projet, et les surfaces dans son unité carrée. La pente et la longueur le long du terrain utilisent la surface projetée lorsqu'elle existe, sinon le terrain existant ; hors surface, elles sont omises.

## Sur le profil d'une ligne électrique

Dans le [profil de la ligne](topic:overhead-line#the-line-profile), {{ui:Mesurer}} dans la barre du profil demande deux clics et donne la distance horizontale, la différence de hauteur, la distance droite et la pente entre les deux points. Un clic près du terrain, du conducteur ou du sommet d'un support s'y accroche. Recliquez sur {{ui:Mesurer}} pour arrêter.
