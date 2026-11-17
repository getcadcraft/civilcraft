---
title: Kontroleer die IFC-uitvoer teen 'n kliënt se IDS
summary: Laai die .ids-lêer wat 'n kliënt of padowerheid aan jou gegee het, en sien elke uitgevoerde element wat nie daaraan voldoen nie, in Probleme.
keywords: ids, inligtingsleweringsspesifikasie, buildingsmart, vereistes, aflewering, kontrole, validasie, qa, ifc-uitvoer, ifc 4.3, belyning, pad, openbare aanbesteding
from: 183d9a0e
---

## Wat jy sal doen

'n IDS (Information Delivery Specification, 'n buildingSMART-standaard) is die lys van wat 'n IFC moet bevat. Openbare aanbesteding stuur dikwels een saam met die werk. CivilCraft kontroleer die IFC wat hierdie projek uitvoer, in die IFC-weergawe wat jy vir die uitvoer gekies het, daarteen, en lys elke element wat tekortkom.

## Stappe

1. Open jou projek.
2. Klik {{ui:IFC}} in die Uitvoer-groep van die nutsbalk. Kies in die dialoog die IFC-weergawe wat jy gaan lewer.
3. Klik {{ui:Kontroleer teen IDS…}}.
4. Klik {{ui:Laai 'n .ids-lêer…}} en kies die lêer. Niks word opgelaai nie.
5. Lees die resultaat: elke spesifikasie met {{ui:Slaag}} of {{ui:Faal}} en hoeveel elemente dit geld.
6. Maak Probleme oop ({{key:Ctrl+Shift+M}}) en klik 'n mislukking om die belyning, plataform, pyp, struktuur of gebouemassa waarvandaan dit kom te kies.

## Wat jy moet sien

- Een waarskuwing per uitgevoerde element en vereiste wat dit mis, met die spesifikasie se naam, wat die IDS vra en wat die uitvoer het.
- Die kontroleverslag (in Probleme) begin met die IDS: sy titel, weergawe, outeur en elke spesifikasie se tellings.

## Goed om te weet

- Die IDS word in die projeklêer gestoor, dus word dit weer nagegaan wanneer jy die projek oopmaak. Laai of vergeet dit is een stap wat jy kan ontdoen.
- Elke verandering word 'n oomblik later weer nagegaan. Groot oppervlaktes neem langer om te skryf, so die kontrole wag dan 'n bietjie langer tussen lopies.
- Die kontrole gebruik dieselfde lêer wat die {{ui:IFC}}-uitvoer skryf, in die weergawe wat laas daar gekies is (IFC 4.3 wanneer jy nie een gekies het nie).
- Getalle word in SI-eenhede vergelyk: 'n projek in voet word eers na meter omgeskakel.

- Patrone in die IDS word as die hele waarde gelees. 'n `^` aan die begin en 'n `$` aan die einde word ook as "die hele waarde" geneem, soos die meeste IDS-lêers dit bedoel.

## Volgende

- [Voer IFC uit](topic:ifc)
