---
title: Eksporter 3D-området som USD
summary: Skriv 3D-områdevisningen (terrengmodeller, linjer, veglinjer, rør og oppmålingspunkter) som USD i riktig målestokk og med riktige koordinater.
keywords: usd, usda, usdc, usdz, openusd, eksport, 3d, område, terrengmodell, veglinje, oppmålingspunkter, koordinater, scenesammenstilling
from: e7be08ec
---

I 3D-visningen skriver {{ui:USD}} ved siden av {{ui:GLB}} og {{ui:OBJ}} det visningen viser som USD.

1. Åpne 3D-visningen og velg hva som skal vises.
2. Åpne {{ui:USD}} og velg {{ui:Tekst (.usda)}}, {{ui:Binær (.usdc)}} eller {{ui:Pakke (.usdz)}}.

Filen er i riktig målestokk (den vertikale overdrivelsen tas bort igjen), i meter med Z opp. Området ligger på sine prosjektøst-, nord- og kotekoordinater, og nevner koordinatsystemet når prosjektet har et. Terrengmodeller, rør og konstruksjoner er nett med sine farger; høydekurver, bruddlinjer og korridorlinjer er linjer; hver veglinje er en egen linje under sitt navn; oppmålingspunkter beholder sine numre.
