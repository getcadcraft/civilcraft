---
title: Kjøretøyets svepebaner
summary: Kjør et kjøretøy med opptil tre tilhengere langs en formlinje eller en veglinje, forlengs eller bakover, og se området det sveiper over, hjulbanene, styringen og hvor det knekker.
keywords: svepebane, svingbane, kjøretøysporing, svingmal, dimensjonerende kjøretøy, lastebil, buss, tilhenger, semitrailer, rygging, bakking, knekking, ledd, styrebegrensning, hjulbane, lasteplass, svingradius, utsving
from: 8caafb8a
---

En svepebane kjører et kjøretøy langs en linje og viser grunnen kjøretøyets kropp passerer over. Bruk den til å kontrollere at en lastebil kan ta et hjørne, nå en lasteplass eller rygge en tilhenger på plass uten å forlate belegget.

## Kjør et kjøretøy langs en linje

1. Tegn linjen kjøretøyet følger, i kjøreretningen: en formlinje (buer går fint: trykk {{key:C}} mens du tegner den, se [Formlinjer](topic:feature-lines)) eller en veglinje.
2. Velg den og klikk {{ui:Svepebane…}} i **Egenskaper**.
3. Under **Start fra** velger du et kjøretøy, og setter størrelsene fra ditt eget dimensjonerende kjøretøy: bredde, forhengsoverheng, akselavstand, bakhengsoverheng, sporvidde og **Styrebegrensning**. Legg til opptil tre tilhengere, hver med hvor den er koblet på, lengden fra koblingen til akselen, sine overheng og sin **Største leddvinkel**.
4. Velg **Kjøring**: forlengs eller bakover. Klikk {{ui:Kjør den}}.

:::warning
Kjøretøyene å starte fra er plassholdere, ikke en standard. Sett størrelsene fra det dimensjonerende kjøretøyet prosjektet ditt bruker.
:::

## Forlengs og bakover

| Kjøring | Hva som følger linjen | Hva CivilCraft beregner |
|---|---|---|
| **Forlengs** | Midten av forakselen | Hvor bakakselen og hver tilhenger havner, styrevinkelen og leddvinkelen |
| **Bakover** | Midten av siste aksel (baksiden av tilhengeren) | Hvor hver enhet foran havner, og styringen førerhuset trenger for å plassere tilhengeren der |

Bakking kontrolleres slik: si hvor tilhengeren skal, og CivilCraft sier om førerhuset kan klare det.

## Les resultatet

Svepebanen tegnes i planen i oransje: omrisset og, stiplet, banene til de ytterste hjulene. Velg den (klikk inne i den) for å se i **Egenskaper**:

- **Kjørt lengde**, største **Styrevinkel** og **Leddvinkel** mot grensene deres, og **Svepeareal**.
- Eventuelle problemer langs linjen, med avstand: styringen forbi begrensningen, eller en tilhenger som dreier forbi grensen for leddvinkelen (den knekker).
- **Kjøretøyet langs linjen**: flytt glidebryteren for å se kjøretøyet hvor som helst, med styring og leddvinkel der.

Endrer du linjen, følger svepebanen med. {{ui:Rediger kjøretøyet…}} endrer størrelsene; **Kjøring** bytter mellom forlengs og bakover. Hver endring er ett steg: {{key:Mod+Z}} angrer den. {{key:Delete}} sletter den valgte svepebanen (linjen blir stående).

Omrisset og hjulbanene går til PDF, DXF og DWG på laget C-ROAD-SWPT.

## Slik beregnes det

Hver enhet svinger om linjen til bakakselen og dras av punktet foran den (forakselen, eller koblingen), den lavhastighets- og uten-glidning-modellen svepebaneberegninger bruker. Svepearealet er alle posisjonenes kroppsomriss satt sammen. Modellen tar ikke hensyn til fart, dekkglidning, tiden styringen bruker på å snu, styrte tilhengere eller klaringen under karosseriet.
