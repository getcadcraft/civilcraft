---
title: Izmena tačke snimanja
summary: Promenite broj, koordinate, kotu ili opis jedne tačke, ili je prevucite na novo mesto na planu.
keywords: izmena tačke, pomeranje tačke, promena kote, preimenovanje, broj tačke, opis, prevlačenje, severna koordinata, istočna koordinata, popravka tačke, loš snimak
from: 375ae2e9
---

Loš snimak, pogrešna visina letve, pogrešno ukucan opis: popravite jednu tačku, a površ se prilagodi.

## Promena vrednosti tačke

1. Sa {{ui:Izaberi}} kliknite tačku na planu. **Svojstva** prikazuju njen broj, istočnu i severnu koordinatu, kotu i opis u poljima.
2. Upišite novu vrednost i pritisnite {{key:Enter}} (ili kliknite van polja). Ostavite **Kota** praznim za tačku bez kote.
3. Površ, izohipse i sve što je na njima izgrađeno odmah se ažuriraju.

Svaka promena je jedan korak: {{key:Mod+Z}} opoziva, a {{key:Mod+Y}} ponavlja. Vrednost koju CivilCraft ne može da koristi (broj koji već ima druga tačka, slova u koordinati) se odbija: polje dobija okvir, a statusna traka kaže zašto.

Nova šifra opisa pravi novu grupu tačaka, kao i uvoz (videti [Izgradnja površi](topic:build-surface)).

## Pomeranje tačke na planu

1. Izaberite tačku (dobija prsten).
2. Prevucite prsten. Statusna traka pokazuje istočnu i severnu koordinatu na koju ide.
3. Pustite da je pomerite; njena kota ostaje ista. Pre nego što pustite, pritisnite {{key:Esc}} da je vratite.

## Linije loma prate tačku

Linija loma nacrtana alatom {{ui:Linija loma}} kopira tačke kroz koje prolazi. Kada pomerite tačku ili promenite njenu kotu, uglovi linije loma na njoj se pomeraju zajedno sa njom, u istom koraku. Grupe linija loma napravljene iz opisa uvek se ponovo grade iz tačaka.

:::note
Površ učitana iz LandXML datoteke zadržava sopstvene trouglove: izmene tačaka menjaju je tek posle {{ui:Ponovo izgradi površinu iz tačaka}}.
:::
