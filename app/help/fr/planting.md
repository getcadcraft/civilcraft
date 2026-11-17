---
title: Plans de plantation et nomenclatures
summary: Placer des plantes isolées, des massifs remplis à l'espacement des plantes avec un mélange de plantes en pourcentage, et des haies ; les étiqueter ; les compter dans une nomenclature des plantes pour un tableur ou TakeoffCraft.
keywords: plan de plantation, nomenclature des plantes, massif de plantation, plantation en masse, haie, arbre, arbuste, couvre-sol, espacement, espacement triangulaire, nombre de plantes, quantités, étiquettes, couvert, symboles de plantes, ifc, métré
from: ab49eab5
---

## Placer des plantes

1. Choisissez une plante dans **Plantes**, à gauche.
2. Cliquez sur {{ui:Plante}}, puis cliquez sur le plan : chaque clic place une plante. Appuyez sur {{key:Esc}} pour arrêter.

Le symbole d'une plante est dessiné à son étalement à maturité ; Plus › {{ui:Afficher à la taille de plantation}} dessine chaque plante à la taille à laquelle elle est mise en place. Les arbres reposent sur le sol qui se trouve sous eux : lorsque vous modelez ensuite le site, ils suivent le terrain. Pour fixer une plante à une altitude, saisissez-la dans **Altitude** dans Propriétés.

## Massifs de plantation

1. Choisissez la plante principale, cliquez sur {{ui:Massif}} et cliquez sur les angles du massif. Appuyez sur {{key:Enter}} (ou cliquez de nouveau sur le premier angle) pour le fermer.
2. Le massif se remplit de cette plante à son espacement, selon un motif **triangulaire** (le plus courant : chaque plante est à égale distance de six autres), à un demi-espacement du bord.
3. Dans Propriétés, **Ajouter une plante** mélange la plante choisie à gauche. Réglez la **Part %** de chaque plante : le massif en prend exactement cette proportion, répartie dans toute sa surface. **Mélanger à nouveau** redistribue leur emplacement.

Un **Espacement** vide utilise l'espacement propre des plantes (pondéré par leurs parts) ; saisissez une valeur pour l'utiliser pour toutes les plantes. Le **Motif** peut être carré, et **Rangs à** fait pivoter les rangs.

## Haies

Choisissez la plante de haie, cliquez sur {{ui:Haie}}, cliquez le long de la haie et appuyez sur {{key:Enter}}. Les plantes se placent sur la ligne à leur espacement, centrées pour que les deux extrémités aient la même marge. Une haie peut être **sur deux rangs, en quinconce**, à une distance donnée.

## Étiquettes

Les plantes isolées reçoivent l'étiquette selon le réglage d'étiquette (`{name}` par défaut) ; saisissez votre propre étiquette pour une plante dans Propriétés. Les massifs sont étiquetés avec le nombre de chaque plante, les haies avec le leur. Plus › {{ui:Étiquettes des plantes}} active et désactive les étiquettes. Champs d'étiquette : `{name}`, `{botanical}`, `{size}` (le contenant), `{qty}`, `{height}`, `{spread}`, `{container}`.

## La nomenclature des plantes

Plus › {{ui:Nomenclature des plantes…}} compte chaque plante par espèce, des plantes isolées, massifs et haies réunis, avec sa taille de plantation. Enregistrez-la en **CSV** ou **XLSX**, ou **Envoyer vers TakeoffCraft** : un fichier de quantités que TakeoffCraft ouvre pour chiffrer les plantes (avec les quantités d'aménagements et d'arrosage à côté).

## IFC

Plus › {{ui:Exporter l'IFC du paysage}} enregistre le paysage sous forme de fichier IFC (IFC 4.3) qu'un modèle BIM peut contenir : chaque plante est un `IfcGeographicElement` de type VEGETATION, typé selon son espèce avec les propriétés de la plante (nom botanique, dimensions, rusticité, eau, lumière), et chaque massif et chaque haie est un seul élément avec ses comptages, sur le site. BimCraft l'ouvre à côté du bâtiment.
