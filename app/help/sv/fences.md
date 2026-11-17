---
title: Staket
summary: Ett staket längs en linje, fastighet eller byggplatta: stolpar, regler, paneler eller spjälor, grindar, terrängföljande eller trappat längs marken, en förteckning, plansymboler och IFC-element. Finns även tillgängligt för en assistent.
keywords: staket, stolpar, regler, paneler, spjälor, grind, terrängföljande, trappat, terräng, förteckning, ifc, räcke, gräns
from: c0e7b84a
---

Gör ett staket längs en funktionslinje, en linjeföring, en fastighet eller en byggplatta, med dess stolpar och grindar placerade åt dig.

## Gör ett staket

1. Markera en linje, en fastighet eller en byggplatta.
2. Öppna **Terrängmodell, Mer, Staket...**
3. Välj stil (paneler, regler eller spjälor), terrängföljande eller trappat, höjden, stolpavståndet och grindbredden, och klicka sedan på **Staket längs markering**, eller **Med grind** för att placera en grind mitt i den längsta raka sträckan.

Stolpar sätts i ändarna, vid varje hörn (en vertex som svänger med 20 grader eller mer), vid båda kanterna av varje grind och med jämna fack mellan dem, ingen längre än avståndet. **Terrängföljande** paneler följer marken mellan sina stolpar. **Trappade** paneler står plant och trappas vid stolparna; glappet under en panel är störst vid dess nedförsbacksstolpe, och fönstret varnar när glappet överstiger gränsen, eller när marken stiger genom en panel. Grindar på 6 feet (1.8 m) och bredare får två grindblad; planen visar bladen öppna med deras öppningsriktning.

## Förteckning och utdata

Varje staket visar sin längd, stolpar per typ, paneler, grindar och steg, med en **CSV**-förteckning över stolpar, paneler, regler, spjälor och grindar. Planen har staketlager (C-FENC, C-FENC-POST, C-FENC-GATE) för PDF, DXF och DWG. IFC-exporten innehåller stolparna (IfcMember, post), panelerna (IfcRailing, user defined fence panel), reglerna (IfcMember) och grindarna (IfcDoor, gate), ett system per staket.

## Från en assistent

`fence_build` gör ett staket (punkter eller en namngiven linje, fastighet eller byggplatta, grindar efter station) och `fence_list` listar staketen med deras förteckning.

## Vad som inte är gjort

Startstorlekarna är vanliga val, inte en norm. Typer från biblioteket förs bara över som ett namn. Grindar måste ligga i en rak sträcka. BimCraft har inte det här verktyget ännu.
