---
title: Køretøjers kørespor
summary: Kør et køretøj med op til tre anhængere langs en feature-linje eller et tracé, fremad eller bakkende, og se det areal, det fejer, dets hjulspor, dets styring og hvor det knækker.
keywords: kørespor, drejespor, køretøjssporing, drejeskabelon, dimensionerende køretøj, lastbil, bus, anhænger, sættevogn, bakning, knækning, led, styrelås, udsving, hjulspor, læssekaj, drejeradius
from: 8caafb8a
---

Et kørespor kører et køretøj langs en linje og viser det terræn, dets karrosseri passerer over. Brug det til at kontrollere, at en lastbil kan tage et hjørne, nå en læssekaj eller bakke en anhænger på plads uden at forlade belægningen.

## Kør et køretøj langs en linje

1. Tegn linjen, køretøjet følger, i kørselsretningen: en feature-linje (buer er fine: tryk på {{key:C}} mens du tegner den, se [Feature-linjer](topic:feature-lines)) eller et tracé.
2. Vælg den, og klik på {{ui:Kørespor…}} i dens **Egenskaber**.
3. Under **Start fra** vælger du et køretøj og angiver derefter dets mål ud fra dit eget dimensionerende køretøj: bredde, overhæng foran, akselafstand, overhæng bagpå, sporvidde og **Styrelås**. Tilføj op til tre anhængere, hver med hvor den er koblet på, dens længde fra koblingen til dens aksel, dens overhæng og dens **Største ledvinkel**.
4. Vælg **Kørsel**: fremad eller bakning. Klik på {{ui:Kør det}}.

:::warning
Køretøjerne, der skal startes fra, er pladsholdere, ikke en standard. Angiv målene ud fra det dimensionerende køretøj, dit projekt bruger.
:::

## Fremad og bakning

| Kørsel | Hvad der følger linjen | Hvad CivilCraft beregner |
|---|---|---|
| **Fremad** | Forakslens centrum | Hvor bagakslen og hver anhænger kommer, styrevinklen og ledvinklen |
| **Bakning** | Den sidste akses centrum (bagenden af anhængeren) | Hvor hver enhed foran kommer, og den styring førerhuset skal bruge for at sætte anhængeren dér |

Bakning er den måde, en bakkebevægelse kontrolleres på: sig, hvor anhængeren skal hen, og CivilCraft siger, om førerhuset kan klare det.

## Læs resultatet

Køresporet tegnes på planen i orange: dets kontur og, stiplet, de yderste hjuls spor. Vælg det (klik inde i det) for at se i **Egenskaber**:

- **Kørt længde**, den største **Styrevinkel** og **Ledvinkel** i forhold til deres grænser, og det **Fejede areal**.
- Ethvert problem langs linjen med dens afstand: styringen forbi låsen, eller en anhænger, der drejer ud over sin ledvinkelgrænse (den knækker).
- **Køretøjet langs linjen**: flyt skyderen for at se køretøjet ethvert sted, med dets styring og ledvinkel der.

Ændr linjen, og køresporet følger med. {{ui:Rediger køretøjet…}} ændrer målene; **Kørsel** skifter mellem fremad og bakning. Hver ændring er ét trin: {{key:Mod+Z}} fortryder den. {{key:Delete}} sletter det valgte kørespor (linjen bliver).

Konturen og hjulsporene går med til PDF, DXF og DWG på laget C-ROAD-SWPT.

## Sådan beregnes det

Hver enhed drejer om linjen for sin bageste aksel og trækkes af punktet foran den (forakslen eller koblingen), den lavhastigheds-, glidefri model som kørespors-kontroller bruger. Det fejede areal er alle positioners karrosserikonturer lagt sammen. Det modellerer ikke hastighed, dækglidning, den tid styringen tager at dreje, styrede anhængere eller frihøjden under karrosseriet.
