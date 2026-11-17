---
title: Export 3D lokality do USD
summary: Zapište 3D pohled na lokalitu (povrchy, čáry, osy, potrubí a body zaměření) jako USD ve skutečném měřítku a se skutečnými souřadnicemi.
keywords: usd, usda, usdc, usdz, openusd, export, 3D, lokalita, povrch, osa, body zaměření, souřadnice, sestavení scény
from: e7be08ec
---

Ve 3D pohledu zapíše {{ui:USD}} vedle {{ui:GLB}} a {{ui:OBJ}} to, co pohled ukazuje, jako USD.

1. Otevřete 3D pohled a vyberte, co se má zobrazit.
2. Otevřete {{ui:USD}} a vyberte {{ui:Text (.usda)}}, {{ui:Binární (.usdc)}} nebo {{ui:Balíček (.usdz)}}.

Soubor je ve skutečném měřítku (svislé zveličení je odebráno zpět), v metrech, se svislou osou Z nahoru. Lokalita leží ve svých projektových souřadnicích východu, severu a výšek a pojmenovává svůj souřadnicový systém, pokud jej projekt má. Povrchy, potrubí a objekty jsou sítě se svými barvami; vrstevnice, lomové hrany a čáry koridoru jsou čáry; každá osa je samostatnou čárou pod svým názvem; body zaměření si zachovají svá čísla.
