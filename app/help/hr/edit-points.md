---
title: Uredi geodetsku točku
summary: Promijenite broj, koordinate, visinu ili opis jedne točke, ili je povucite na novo mjesto na tlocrtu.
keywords: uredi točku, pomakni točku, promijeni visinu, promijeni broj, broj točke, opis, povuci, sjever, istok, učvrsti točku, pogrešno mjerenje
from: 375ae2e9
---

Pogrešno mjerenje, kriva visina letve, pogrešno upisan opis: popravite jednu točku, a teren se prilagođava.

## Promjena vrijednosti točke

1. Uz {{ui:Odaberi}} kliknite točku na tlocrtu. **Svojstva** prikazuju njezin broj, istok, sjever, visinu i opis u poljima.
2. Upišite novu vrijednost i pritisnite {{key:Enter}} (ili kliknite izvan polja). Ostavite **Visina** praznom za točku bez visine.
3. Teren, izohipse i sve što je izrađeno na njima odmah se ažuriraju.

Svaka promjena je jedan korak: {{key:Mod+Z}} je poništava, a {{key:Mod+Y}} ponavlja je. Vrijednost koju CivilCraft ne može upotrijebiti (broj koji već ima druga točka, slova u koordinati) se odbija: okvir se označava, a statusna traka navodi razlog.

Novi kod opisa stvara novu skupinu točaka, kao i uvoz (vidi [Izrada terena](topic:build-surface)).

## Pomicanje točke na tlocrtu

1. Odaberite točku (dobiva prsten).
2. Povucite prsten. Statusna traka pokazuje istok i sjever na koje će točka otići.
3. Otpustite za pomicanje; njezina visina ostaje. Pritisnite {{key:Esc}} prije otpuštanja da je vratite.

## Prijelomnice slijede točku

Prijelomnica nacrtana alatom {{ui:Prijelomnica}} kopira točke kroz koje prolazi. Kada pomaknete točku ili promijenite njezinu visinu, kutovi prijelomnice na njoj pomiču se zajedno s njom, u istom koraku. Skupine prijelomnica izrađene iz opisa uvijek se ponovno izrađuju iz točaka.

:::note
Teren učitan iz LandXML datoteke zadržava svoje trokute: promjene točaka mijenjaju ga tek nakon {{ui:Ponovno izradi teren iz točaka}}.
:::
