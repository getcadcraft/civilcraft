---
title: "Zones plantées : pelouses, massifs, prairies, couvre-sols"
summary: Zones plantées sous forme d'objets avec une composition (terre végétale, paillis, membrane, bordure), un mélange de plantes et un niveau fini facultatif ; elles se découpent automatiquement autour des revêtements, murs et marches, et donnent la surface nette, les volumes, la longueur de bordure et le nombre de plantes.
keywords: zone plantée, pelouse, gazon, massif, bordure, prairie, couvre-sol, terre végétale, paillis, membrane, toile anti-mauvaises herbes, bordure, niveau fini, quantités, aire nette, découpe
from: 2617ec0e
---

{{ui:Zones}} du groupe Paysage dessine une **pelouse**, un **massif planté**, une **prairie** ou un **couvre-sol** : cliquez sur ses angles, puis appuyez sur {{key:Enter}}. Un massif ou un couvre-sol commence rempli avec la plante choisie dans la section Plantes ; une pelouse ne contient aucune plante.

## Ce qu'elle contient

- **Composition** : épaisseur de terre végétale, épaisseur de paillis, une membrane anti-mauvaises herbes, et une bordure (acier, bois, brique, béton, plastique ou aucune). Les épaisseurs courantes sont préremplies ; réglez les vôtres.
- **Mélange** : espèces (avec cultivar et calibre) et parts, remplies comme un massif à l'espacement ou à la densité.
- **Niveau fini** : laissez-le vide et la zone suit le terrain ; indiquez un niveau et la zone devient un modificateur de terrain (voir [Modificateurs de terrain et niveaux](topic:ground-modifiers)).
- **Découpe autour des revêtements, murs et marches** (activée par défaut) : là où un revêtement, un chemin, un mur, une bordure de trottoir, une rampe ou des marches chevauchent la zone, cette partie est retirée. Aucune plante n'est placée dessous ni à moins d'un demi-espacement de leur bord.

## Quantités

Le panneau Propriétés affiche l'**aire nette** (après découpe, mesurée exactement), le périmètre, la **longueur de bordure** (seulement le long du bord propre de la zone, pas là où les aménagements la coupent), les volumes de terre végétale et de paillis, l'aire de membrane et le nombre de plantes par ligne de mélange. La nomenclature des plantes compte les plantes de la zone ; le fichier de quantités pour TakeoffCraft reçoit l'aire, la terre végétale, le paillis, la membrane et la bordure ; l'IFC paysager écrit un IfcGeographicElement avec un ensemble de quantités.
