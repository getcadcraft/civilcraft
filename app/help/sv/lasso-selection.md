---
title: Lassomarkering av mätpunkter
summary: Håll ned Shift och dra en frihandskontur runt mätpunkter för att markera dem, som ett fönster, ett korsande eller ett staket; byt med Space medan du drar. En rak dragning ritar fortfarande en ruta.
keywords: lasso, frihand, markera punkter, markering, fönster, korsande, staket, space, polygon, rutmarkering, shift-dra
from: 3dd4fcaa
---

## Vad du lär dig

Hur du markerar mätpunkter genom att rita runt dem, när en ruta skulle ta med punkter du inte vill ha.

## Rita ett lasso

1. Klicka på {{ui:Markera}} (eller tryck {{key:V}}).
2. Håll ned {{key:Shift}}, tryck på planen och dra **runt** de punkter du vill ha, och rör dig först åt **höger**.
3. Släpp.

Punkterna inuti konturen läggs till markeringen. En dragning som håller sig nära en rak linje ritar en ruta, som förut; så snart den böjer sig bort från linjen (mer än cirka 12 pixlar) blir den ett lasso.

## Fönster, korsande och staket

| Du drar | Lasso | Markerar |
|---|---|---|
| Åt höger först | Fönster (heldragen kontur) | Punkterna inuti den |
| Åt vänster först | Korsande (streckad, grön) | Punkterna inuti den, och punkterna som konturen berör |
| Tryck {{key:Space}} medan du drar | Fönster, sedan korsande, sedan staket | Staket (en streckad orange bana, inte stängd): punkterna som banan passerar över |

Statusraden anger lassot medan du drar. {{key:Esc}} medan du drar avbryter det och markerar ingenting.

:::tip
Ett staket är det snabba sättet att välja mätpunkterna längs en kantsten eller en diklinje: dra längs dem och släpp.
:::

## Se även

- [Markera, kopiera och klistra in mätpunkter](topic:copy-paste-points)
- [Tangenter och mus](topic:keyboard)
