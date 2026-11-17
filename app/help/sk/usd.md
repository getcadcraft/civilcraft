---
title: Export 3D lokality do USD
summary: Zapíšte 3D pohľad na lokalitu (povrchy, čiary, osi trás, potrubia a body) ako USD v skutočnej mierke a so skutočnými súradnicami.
keywords: usd, usda, usdc, usdz, openusd, export, 3d, lokalita, povrch, os trasy, body, súradnice, zostavenie scény
from: e7be08ec
---

V 3D pohľade {{ui:USD}} vedľa {{ui:GLB}} a {{ui:OBJ}} zapíše to, čo pohľad zobrazuje, ako USD.

1. Otvorte 3D pohľad a zvoľte, čo zobraziť.
2. Otvorte {{ui:USD}} a vyberte {{ui:Text (.usda)}}, {{ui:Binárny (.usdc)}} alebo {{ui:Balík (.usdz)}}.

Súbor je v skutočnej mierke (zvislé zveličenie sa odstráni), v metroch so Z smerom nahor. Lokalita stojí na svojich súradniciach X, Y a výškach projektu a uvedie svoj súradnicový systém, ak ho projekt má. Povrchy, potrubia a šachty sú siete (meshe) s ich farbami; vrstevnice, hrany zlomu a čiary koridorov sú čiary; každá os trasy je vlastnou čiarou pod svojím názvom; body si zachovajú svoje čísla.
