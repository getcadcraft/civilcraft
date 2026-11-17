---
title: Výběr zaměřovacích bodů lasem
summary: Podržte Shift a táhněte volný obrys kolem zaměřovacích bodů, abyste je vybrali jako okno, křížení nebo plot; přepínejte mezerníkem během tažení. Přímé tažení stále nakreslí obdélník.
keywords: lasso, volný tvar, výběr bodů, výběr, okno, křížení, plot, mezerník, mnohoúhelník, výběr obdélníkem, shift tažení
from: 3dd4fcaa
---

## Co se naučíte

Jak vybrat zaměřovací body kreslením kolem nich, když by obdélník vzal body, které nechcete.

## Nakreslení lasa

1. Klikněte na {{ui:Výběr}} (nebo stiskněte {{key:V}}).
2. Podržte {{key:Shift}}, stiskněte na půdorysu a táhněte **kolem** bodů, které chcete, nejdříve **doprava**.
3. Pusťte.

Body uvnitř obrysu se přidají k výběru. Tah, který zůstane blízko přímky, nakreslí jako dříve obdélník výběru; jakmile se od této přímky odchýlí (víc než asi 12 pixelů), stane se lasem.

## Okno, křížení a plot

| Táhnete | Lasem je | Vybere |
|---|---|---|
| Nejdřív doprava | Okno (plná čára) | Body uvnitř něj |
| Nejdřív doleva | Křížení (čárkovaně, zeleně) | Body uvnitř něj a body, kterých se obrys dotýká |
| Stiskněte {{key:Space}} během tažení | Okno, pak křížení, pak plot | Plot (čárkovaná oranžová cesta, nezavřená): body, přes které cesta prochází |

Stavový řádek pojmenuje lasso, zatímco táhnete. {{key:Esc}} během tažení lasso zruší a nic nevybere.

:::tip
Plot je rychlá volba pro výběr bodů podél obrubníku nebo příkopu: táhněte podél nich a pusťte.
:::

## Viz také

- [Výběr, kopírování a vkládání zaměřovacích bodů](topic:copy-paste-points)
- [Klávesy a myš](topic:keyboard)
