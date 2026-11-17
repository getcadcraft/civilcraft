---
title: Brīvas formas objekti
summary: Ievietot šajā vietā formu, kas izveidota citā lietotnē (STL, OBJ vai bibliotēkas vienums); tā stāv uz zemes vai tiek iegriezta tajā, un tās tilpums, laukums un aizņemtā platība tiek skaitīti kā pārējie.
keywords: brīvā forma, pielāgots objekts, skulptūra, puķu kaste, sols, tīkls, stl, obj, bibliotēkas vienums, reljefu ievērojošs, seko zemei, iegriezts zemē, daudzumi, tilpums, ifc
from: ec835f33
---

Vienreizēju elementu (puķu kasti, sēdvietas sienu, skulptūru, spēļu uzkalnu) var izveidot ModelCraft vai PartCraft un ievietot šeit, lai tas atrastos tajā pašā modelī un sarakstos kā pārējie.

1. Ainava › Vairāk › {{ui:Brīvas formas objekts…}} un izvēlieties **STL** vai **OBJ** failu (projekta mērvienībās: pēdās pēdu projektā, metros metru projektā) vai CadCraft **bibliotēkas vienumu** (`.json`) ar tīkla korpusu.
2. Noklikšķiniet, kur tas jānovieto.

## Tā pamatne

- **Seko zemei**: tā zemākais punkts atrodas uz zemākās zemes zem tās pamatnes, tāpēc nekas nepeld. Rekvizīti aplēš, cik liela tā daļa ir zem zemes.
- **Iegriež zemi**: tā pamatne tiek iestatīta noteiktā augstumā, un zeme tās pamatnes iekšienē tiek izlīdzināta līdz tam ar dienasgaismas nogāzēm; tas tiek skaitīts sadaļā Zemes darbi kā platforma.

Pagrieziet to ar **Pagriezt**, velciet to plānā, lai pārvietotu.

## Skaitīts

Rekvizīti dod tā **tilpumu** (slēgtam ķermenim), **virsmas laukumu**, **aizņemto laukumu** un **augstumu**, mērītu pēc tīkla. IFC eksports to ieraksta ar jūsu izvēlēto **IFC klasi** un šiem daudzumiem.

:::note
Aizņemtais laukums ir kontūras izliektais apvalks: ieliekta forma (L formas puķu kaste) tiek izlīdzināta tā, it kā būtu aizpildīta.
:::
