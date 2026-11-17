---
title: Exportera 3D-platsen som USD
summary: Skriv 3D-platsvyn (ytor, linjer, linjeföringar, ledningar och mätpunkter) som USD i sann skala och med sanna koordinater.
keywords: usd, usda, usdc, usdz, openusd, export, 3d, plats, yta, linjeföring, punkter, koordinater, scensammansättning
from: e7be08ec
---

I 3D-vyn skriver {{ui:USD}}, bredvid {{ui:GLB}} och {{ui:OBJ}}, ut det vyn visar som USD.

1. Öppna 3D-vyn och välj vad som ska visas.
2. Öppna {{ui:USD}} och välj {{ui:Text (.usda)}}, {{ui:Binärt (.usdc)}} eller {{ui:Paket (.usdz)}}.

Filen är i sann skala (den vertikala överdrivningen tas bort igen), i meter med Z uppåt. Platsen ligger på sina projektets östvärden, nordvärden och höjder, och anger sitt koordinatsystem när projektet har ett. Ytor, ledningar och konstruktioner är nät med sina färger; höjdkurvor, brytlinjer och korridorlinjer är linjer; varje linjeföring är en egen linje under sitt namn; mätpunkter behåller sina nummer.
