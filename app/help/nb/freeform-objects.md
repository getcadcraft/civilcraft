---
title: Frie objekter
summary: Ta en form laget i et annet program (STL, OBJ eller et bibliotekselement) inn på området; den står på terrenget eller er skåret inn i det, og volumet, arealet og fotavtrykket telles som resten.
keywords: fritt objekt, egendefinert objekt, skulptur, plantekasse, benk, mesh, stl, obj, bibliotekselement, terrengbevisst, følg terrenget, skjær inn i terrenget, mengder, volum, ifc
from: ec835f33
---

En engangsfunksjon (en plantekasse, en sittevegg, en skulptur, en lekehaug) kan lages i ModelCraft eller PartCraft og plasseres her, slik at den står i samme modell og i samme tabeller som alt annet.

1. Landskap › Mer › {{ui:Fritt objekt…}} og velg en **STL**- eller **OBJ**-fil (i prosjektets enheter: fot i et prosjekt i fot, meter i et prosjekt i meter) eller et CadCraft-**bibliotekselement** (`.json`) med et nettlegeme.
2. Klikk der det skal være.

## Underlaget

- **Følger terrenget**: laveste punkt står på det laveste terrenget under fotavtrykket, så ingenting svever. Egenskaper estimerer hvor mye av det som er under terrenget.
- **Skjærer inn i terrenget**: underlaget settes i en høyde, og terrenget innenfor fotavtrykket formes til den med skråninger til dagslinjen, og telles i Jordarbeid som en plattform.

Roter den med feltet **Rotert**, og dra den i planen for å flytte den.

## Mengder

Egenskaper gir dens **volum** (for et lukket legeme), **overflateareal**, **fotavtrykk** og **høyde**, målt fra nettet. IFC-eksporten skriver det med den IFC-klassen som velges, og disse mengdene.

:::note
Fotavtrykket er den konvekse omhyllingen av omrisset: en konkav form (en L-formet plantekasse) formes som om den var fylt ut.
:::
