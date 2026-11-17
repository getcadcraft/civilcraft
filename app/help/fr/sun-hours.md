---
title: Calculer les heures d'ensoleillement d'un site
summary: Choisissez un jour (ou une saison) et un fuseau horaire, et voyez les heures de soleil direct sur chaque mur de chaque volume bâti et sur le terrain autour, avec le terrain dessiné sur le plan et les chiffres en CSV.
keywords: soleil, heures d'ensoleillement, ombre, ombrage, accès au soleil, heures de jour, façade, mur, saison, solstice, équinoxe, fuseau horaire, heure d'été, latitude, longitude, CSV, raster
from: 4e32a314
---

**Heures d'ensoleillement** compte les heures de soleil direct qui atteignent chaque mur de chaque volume bâti et le terrain autour, un jour que vous choisissez ou en moyenne sur une saison. Les volumes et le terrain lui-même projettent de l'ombre ; rien d'autre n'en projette (pas d'arbres, ni de voisins que vous n'avez pas dessinés). La lumière du ciel qui n'est pas du soleil direct n'est pas comptée.

## Avant de commencer

La position du soleil vient de la latitude et de la longitude du site, qui proviennent du **système de coordonnées** du projet. Un projet sans système est refusé avec un message : définissez-le d'abord (**Coordonnées** dans le groupe SIG). Une latitude et une longitude saisies à la main seraient une estimation, c'est pourquoi il n'y a pas de champ pour elles.

## Calculer

Dans **Propriétés**, sous **Volumes bâtis**, **Heures d'ensoleillement** :

1. Choisissez le **Jour**. Il commence au jour où le soleil est le plus bas à votre endroit (21 décembre, ou 21 juin dans l'hémisphère sud). Pour une saison, cochez **Sur une saison**, choisissez le **Dernier jour** et l'écart en jours entre les échantillons.
2. Saisissez le **Fuseau horaire** : un nom comme `America/Mexico_City`, ou un décalage par rapport à UTC comme `-6`. Un nom suit les règles d'heure d'été de ce fuseau pour le jour ; un décalage saisi est utilisé tel quel, donc utilisez celui en vigueur ce jour-là. La ligne sous le champ indique le décalage trouvé.
3. Choisissez la fréquence de positionnement du soleil (toutes les 5, 10, 15 ou 30 minutes), puis cliquez sur **Calculer les heures d'ensoleillement**. Une saison tourne en tâche de fond ; **Arrêter** l'annule.

## Ce que vous obtenez

- Un tableau par volume : le **pire mur**, la **moyenne** et le **meilleur mur**, en heures par jour, et un tableau de chaque mur avec son orientation et ses heures étage par étage.
- Le terrain autour des volumes, dessiné sur le plan du plus sombre (aucun soleil) au jaune (le maximum atteint par une cellule), avec une légende. Les cellules sous un volume sont laissées vides. **Afficher le terrain sur le plan** le désactive.
- **Murs en CSV** et **Terrain en CSV** enregistrent les chiffres.

Pour une saison, les valeurs sont la moyenne par jour sur les jours échantillonnés. Rien n'est enregistré dans le projet : le résultat sert à être consulté, et le relancer le recalcule.

## À savoir

- Un mur ne compte un instant comme ensoleillé que s'il fait face au soleil et que rien ne le gêne. Un mur tourné à l'opposé ne reçoit rien.
- Le terrain est échantillonné sur une grille qui dépend de la taille du site, et la position du soleil est prise au milieu de chaque pas de temps ; les heures sont donc justes à près du pas choisi.
- La position du soleil provient d'une formule astronomique publiée, précise à environ une minute d'arc.
