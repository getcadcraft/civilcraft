---
title: Eksportér 3D-stedet som USD
summary: Skriv 3D-visningen af stedet (overflader, linjer, tracéer, rør og punkter) som USD i rigtig skala og med rigtige koordinater.
keywords: usd, usda, usdc, usdz, openusd, eksport, 3d, sted, overflade, tracé, punkter, koordinater, scenesamling
from: e7be08ec
---

I 3D-visningen skriver {{ui:USD}} ved siden af {{ui:GLB}} og {{ui:OBJ}} det, visningen viser, som USD.

1. Åbn 3D-visningen, og vælg, hvad der skal vises.
2. Åbn {{ui:USD}}, og vælg {{ui:Tekst (.usda)}}, {{ui:Binær (.usdc)}} eller {{ui:Pakke (.usdz)}}.

Filen er i rigtig skala (den lodrette overhøjning fjernes igen), i meter med Z opad. Stedet ligger ved projektets øst- og nordkoordinater og koter og angiver sit koordinatsystem, når projektet har et. Overflader, rør og konstruktioner er net med deres farver; højdekurver, brudlinjer og korridorlinjer er linjer; hvert tracé er sin egen linje under sit navn; punkter beholder deres numre.
