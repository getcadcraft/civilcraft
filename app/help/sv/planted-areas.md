---
title: Planterade ytor: gräsmattor, bäddar, ängar, marktäckare
summary: Planterade ytor som objekt med uppbyggnad (matjord, täckmaterial, membran, kantning), växtblandning och valfri färdig nivå; de klipper sig själva runt beläggningar, murar och trappor, och ger nettoarea, volymer, kantlängd och växtantal.
keywords: planterad yta, gräsmatta, gräs, bädd, kant, äng, marktäckare, matjord, täckmaterial, membran, ogräsduk, kantning, färdig nivå, mängder, nettoarea, klipp
from: 2617ec0e
---

{{ui:Ytor}} i gruppen Landskap ritar en **gräsmatta**, **planterad bädd**, **äng** eller **marktäckare**: klicka på dess hörn och tryck på {{key:Enter}}. En bädd eller marktäckare startar fylld med växten som valts i avsnittet Växter; en gräsmatta har inga växter.

## Vad den innehåller

- **Uppbyggnad**: matjordsdjup, täckmaterialdjup, ett ogräsmembran och en kantning (stål, trä, tegel, betong, plast eller ingen). Typiska djup är ifyllda; ange egna.
- **Blandning**: arter (med sort och storlek) och andelar, fyllda som en bädd efter avstånd eller täthet.
- **Färdig nivå**: lämna tom så följer ytan marken; ange en nivå så blir ytan en markmodifierare (se [Markmodifierare och nivåer](topic:ground-modifiers)).
- **Klipp runt beläggningar, murar och trappor** (på som standard): där beläggning, en gångstig, en mur, en kantsten, en ramp eller trappor överlappar ytan utelämnas den delen. Ingen växt placeras under dem eller inom ett halvt avstånd från deras kant.

## Mängder

Egenskaper visar **nettoarean** (efter klippning, mätt exakt), omkretsen, **kantlängden** (bara längs områdets egen kant, inte där beläggningar skär den), volymer av matjord och täckmaterial, membranarea och växtantal per blandningsrad. Växtförteckningen räknar ytans växter; mängdfilen för TakeoffCraft får area, matjord, täckmaterial, membran och kant; landskaps-IFC skriver ett IfcGeographicElement med en mängduppsättning.
