---
title: Vie 3D-kohde USD-muodossa
summary: Kirjoita 3D-kohdenäkymä (pinnat, viivat, linjaukset, putket ja pisteet) USD-muodossa oikeassa mittakaavassa ja oikeilla koordinaateilla.
keywords: usd, usda, usdc, usdz, openusd, vienti, 3d, kohde, pinta, linjaus, pisteet, koordinaatit, kohtauksen kokoaminen
from: e7be08ec
---

3D-näkymässä {{ui:USD}} on {{ui:GLB}}- ja {{ui:OBJ}}-painikkeiden vieressä, ja se kirjoittaa näkymän sisällön USD-muodossa.

1. Avaa 3D-näkymä ja valitse, mitä näytetään.
2. Avaa {{ui:USD}} ja valitse {{ui:Teksti (.usda)}}, {{ui:Binääri (.usdc)}} tai {{ui:Paketti (.usdz)}}.

Tiedosto on todellisessa mittakaavassa (pystysuuntainen liioittelu on poistettu), metreinä ja Z ylöspäin. Kohde sijaitsee projektinsa itä- ja pohjoiskoordinaateissa ja korkeuksissa ja nimeää koordinaattijärjestelmänsä, kun projektilla on sellainen. Pinnat, putket ja rakenteet ovat verkkoja väreineen; korkeuskäyrät, taitelinjat ja käytäväviivat ovat viivoja; jokainen linjaus on oma viivansa nimensä alla; pisteet säilyttävät numeronsa.
