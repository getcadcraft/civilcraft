---
title: Lassovalg av oppmålingspunkter
summary: Hold Shift og dra en frihåndslinje rundt oppmålingspunkter for å velge dem, som et vindu, en kryssing eller et gjerde; bytt med Space mens du drar. En rett dragning tegner fortsatt en boks.
keywords: lasso, frihånd, velg punkter, utvalg, vindu, kryssing, gjerde, space, polygon, boksvalg, shift-dra
from: 3dd4fcaa
---

## Hva du lærer

Hvordan du velger oppmålingspunkter ved å tegne rundt dem, når en boks ville tatt med punkter du ikke vil ha.

## Tegn et lasso

1. Klikk {{ui:Select}} (eller trykk {{key:V}}).
2. Hold {{key:Shift}}, trykk på planen og dra **rundt** punktene du vil ha, og beveg deg **til høyre** først.
3. Slipp.

Punktene inne i linjen legges til i utvalget. En dragning som holder seg nær en rett linje tegner en boks, som før. Så snart den svinger bort fra linjen (mer enn omtrent 12 piksler), blir den et lasso.

## Vindu, kryssing og gjerde

| Du drar | Lasso | Velger |
|---|---|---|
| Til høyre først | Vindu (heltrukket linje) | Punktene inne i det |
| Til venstre først | Kryssing (stiplet, grønn) | Punktene inne i det, og punktene linjen berører |
| Trykk {{key:Space}} mens du drar | Vindu, så kryssing, så gjerde | Gjerde (en stiplet oransje bane, ikke lukket): punktene banen passerer over |

Statuslinjen navngir lassoet mens du drar. {{key:Esc}} mens du drar avbryter det, og velger ingenting.

:::tip
Et gjerde er den raske måten å plukke målepunktene langs en kantstein eller en grøft: dra langs dem og slipp.
:::

## Se også

- [Velg, kopier og lim inn oppmålingspunkter](topic:copy-paste-points)
- [Taster og mus](topic:keyboard)
