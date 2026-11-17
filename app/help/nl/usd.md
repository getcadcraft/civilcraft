---
title: Het 3D-terrein exporteren als USD
summary: Schrijf de 3D-terreinweergave (terreinen, lijnen, tracés, leidingen en meetpunten) als USD op ware schaal en met ware coördinaten.
keywords: usd, usda, usdc, usdz, openusd, exporteren, 3d, terrein, oppervlak, tracé, punten, coördinaten, scènesamenstelling
from: e7be08ec
---

In de 3D-weergave schrijft {{ui:USD}} naast {{ui:GLB}} en {{ui:OBJ}} wat de weergave toont als USD.

1. Open de 3D-weergave en kies wat u wilt tonen.
2. Open {{ui:USD}} en kies {{ui:Tekst (.usda)}}, {{ui:Binair (.usdc)}} of {{ui:Pakket (.usdz)}}.

Het bestand is op ware schaal (de verticale overhoging wordt eruit gehaald), in meter met Z omhoog. Het terrein ligt op zijn projectcoördinaten Easting, Northing en hoogten, en noemt zijn coördinatenstelsel wanneer het project er een heeft. Terreinen, leidingen en kunstwerken zijn meshes met hun kleuren; hoogtelijnen, breeklijnen en corridorlijnen zijn lijnen; elk tracé is een eigen lijn onder zijn naam; meetpunten behouden hun nummers.
