---
title: Implanter des champs photovoltaïques au sol
summary: Placez des tables solaires au sol dans une parcelle ou une plateforme, avec des rangées espacées selon le terrain réel sous chacune, laissez vide le terrain en forte pente, calculez l'énergie de l'année et affichez les tables sur le plan et en 3D.
keywords: solaire, photovoltaïque, pv, champ, montage au sol, tables, rangées, espacement des rangées, ombre, terrain, pente, pieux, rendement, kWp, énergie, horizon
from: 95593fd6
---

## Ce que vous allez apprendre

Comment implanter un champ de tables solaires sur un site qui n'est pas plat, et ce que signifient les chiffres. Ouvrez-le depuis Surface › Plus › Champs photovoltaïques.

## Implanter les tables

1. Choisissez **Emplacement** : une parcelle ou une plateforme du projet, ou saisissez les angles d'une zone. Cochez les plateformes ou parcelles qui doivent rester **vides** (un bâtiment, un bassin).
2. Saisissez la **latitude et la longitude** du site. Le soleil en dépend ; rien n'est deviné. Si le projet a un système de coordonnées, **Placer à partir du système de coordonnées** les remplit.
3. Réglez l'inclinaison, l'orientation (vide = vers l'équateur), le nombre de modules par table, ainsi que la puissance et la taille du module. Les valeurs de module sont au départ génériques et sont signalées comme telles ; saisissez les vôtres.
4. Appuyez sur **Implanter les tables**. La fenêtre donne le nombre de tables et de modules, la taille en kWp et la distance d'une rangée à la suivante.

Chaque table est une colonne dans la zone, posée depuis l'avant et reculée pas à pas. Une table n'est placée que là où le sol qui se trouve dessous respecte la limite de pente, à l'intérieur de la zone et du retrait, et où les pieux qu'elle nécessite ne dépassent pas la limite que vous avez fixée. Les emplacements refusés restent vides, et la fenêtre indique combien et pourquoi.

## Les rangées sont espacées selon le terrain

Sur sol plat, les rangées sont séparées selon la règle habituelle d'absence d'ombre : l'ombre d'une rangée à midi au solstice d'hiver ne doit pas atteindre le bord bas de la rangée suivante. Sur une pente, CivilCraft applique la même règle au sol sur lequel se trouve réellement la rangée suivante. Là où le terrain monte derrière une table, les rangées peuvent être plus rapprochées ; là où il descend, elles sont plus écartées. La fenêtre affiche l'espacement le plus faible, le plus grand et le moyen à côté de l'espacement sur sol plat, pour que vous voyiez l'effet du terrain.

Le plan d'une table est relevé sur des pieux jusqu'à ce que chaque point d'échantillonnage situé dessous dégage le sol de la garde que vous avez fixée. Le pieu le plus haut apparaît dans le résultat.

## L'énergie de l'année

**Énergie annuelle** calcule l'éclairement du plan incliné pour une journée représentative de chaque mois, la température des cellules, les pertes saisies, l'ombre que les tables se portent entre elles et les collines à l'horizon qui prennent le soleil qu'elles cachent. Le ciel est un ciel clair : le résultat est donc une limite haute, la météo réelle donne moins. C'est une estimation d'avant-projet, pas un rapport de rendement.

## Conserver

**Enregistrer dans le projet** garde les données et les chiffres dans le fichier du projet ; les tables sont recalculées à partir du terrain à l'ouverture du fichier, donc une surface modifiée les déplace. Elles s'affichent sur le plan et en 3D (Afficher › Champs photovoltaïques). La liste des tables se télécharge en CSV. Une étape d'annulation supprime ou restaure un champ.

## Pas encore disponible

Les données météo à la place du ciel clair, les tables qui suivent le terrain dans le sens est-ouest, les trackers, et la conception électrique (chaînes, câbles, onduleurs) dans CivilCraft. Le volet Solar PV de BimCraft comporte les chaînes et le schéma unifilaire pour les toitures.
