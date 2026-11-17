---
title: Lasso-valg af opmålingspunkter
summary: Hold Shift nede og træk en frihåndskontur rundt om opmålingspunkterne for at vælge dem som et vindue, et kryds eller et hegn; skift med Space, mens du trækker. Et lige træk tegner stadig en boks.
keywords: lasso, frihånd, vælg punkter, valg, vindue, kryds, hegn, space, polygon, boksvalg, shift-træk
from: 3dd4fcaa
---

## Hvad du lærer

Hvordan du vælger opmålingspunkter ved at tegne rundt om dem, når en boks ville tage punkter, du ikke vil have.

## Tegn en lasso

1. Klik på {{ui:Vælg}} (eller tryk {{key:V}}).
2. Hold {{key:Shift}} nede, tryk på planen, og træk **rundt om** de punkter, du vil have, med **mod højre** først.
3. Slip.

Punkterne inden i konturen føjes til valget. Et træk, der holder sig tæt på en lige linje, tegner en boks, som før; så snart det bøjer væk fra linjen (mere end cirka 12 pixels), bliver det til en lasso.

## Vindue, kryds og hegn

| Du trækker | Lasso | Vælger |
|---|---|---|
| **Mod højre** først | Vindue (fast kontur) | Punkterne inden i den |
| **Mod venstre** først | Kryds (stiplet, grøn) | Punkterne inden i den, og punkterne konturen rører |
| Tryk {{key:Space}} mens du trækker | Vindue, derefter kryds, derefter hegn | Hegn (en stiplet orange sti, ikke lukket): punkterne stien passerer over |

Statuslinjen angiver lassoen, mens du trækker. Mens du trækker, annullerer {{key:Esc}} den og vælger intet.

:::tip
Et hegn er den hurtige måde at vælge målepunkterne langs en kant eller en grøftelinje: træk langs dem og slip.
:::

## Se også

- [Vælg, kopiér og indsæt opmålingspunkter](topic:copy-paste-points)
- [Taster og mus](topic:keyboard)
