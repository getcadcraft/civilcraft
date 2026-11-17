---
title: Uredi tačku snimanja
summary: Promijenite broj, koordinate, kotu ili opis jedne tačke, ili je prevucite na novo mjesto na planu.
keywords: uredi tačku, pomjeri tačku, promijeni kotu, promijeni broj, broj tačke, opis, prevuci, sjeverna koordinata, istočna koordinata, popravi tačku, pogrešan snimak
from: 375ae2e9
---

Pogrešno očitan snimak, pogrešna visina letve, pogrešno upisan opis: popravite jednu tačku, a površina se prilagođava.

## Promjena vrijednosti tačke

1. Uz {{ui:Odaberi}}, kliknite tačku na planu. **Svojstva** prikazuju njen broj, istočnu i sjevernu koordinatu, kotu i opis u poljima.
2. Upišite novu vrijednost i pritisnite {{key:Enter}} (ili kliknite van polja). Ostavite **Kota** praznu za tačku bez kote.
3. Površina, izohipse i sve što je na njima izgrađeno odmah se ažuriraju.

Svaka promjena je jedan korak: {{key:Mod+Z}} poništava, a {{key:Mod+Y}} ponavlja. Vrijednost koju CivilCraft ne može koristiti (broj koji već ima druga tačka, slova u koordinati) se odbija: polje dobija obrub, a statusna traka kaže zašto.

Novi kod opisa pravi novu grupu tačaka, kao i uvoz (vidi [Izgradnja površine](topic:build-surface)).

## Pomjeranje tačke na planu

1. Odaberite tačku (dobija prsten).
2. Prevucite prsten. Statusna traka pokazuje istočnu i sjevernu koordinatu na koju će tačka stići.
3. Pustite da je pomjerite; njena kota ostaje. Pritisnite {{key:Esc}} prije otpuštanja da je vratite.

## Prelomne linije prate tačku

Prelomna linija nacrtana alatom {{ui:Breakline}} kopira tačke kroz koje prolazi. Kad pomjerite tačku ili promijenite njenu kotu, uglovi prelomne linije na njoj se pomjeraju zajedno s njom, u istom koraku. Grupe prelomnih linija napravljene iz opisa uvijek se ponovo grade iz tačaka.

:::note
Površina pročitana iz LandXML datoteke zadržava svoje trouglove: izmjene tačaka je mijenjaju tek nakon {{ui:Rebuild the surface from the points}}.
:::
