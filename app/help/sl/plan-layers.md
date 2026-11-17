---
title: Sloji tlorisa
summary: Fiksna imena slojev, barve in debeline črt, ki jih CivilCraft uporablja na zaslonu, v DXF in v PDF, ter nastavitev prikaza, ki vsako upravlja.
keywords: sloji, imena slojev, ncs, barve, aci, debeline črt, sloji dxf, pdf, nastavitve prikaza, črtna risba
from: c2aa8475
---

Vse na tlorisu pripada sloju. Imena sledijo običajnemu vzorcu gradbenih slojev (disciplina, glavna skupina, podskupina). Sloji so v tej različici fiksni: ne morete jih preimenovati, spremeniti njihovih barv ali dodati lastnih. V DXF ima vsak sloj prikazano številko barve; v PDF z {{ui:Layer colors}} se uporabljajo enake barve, z {{ui:Black}} pa se vse izpiše črno.

| Sloj | Vsebuje | Barva (številka DXF) | Prikazano, ko |
|---|---|---|---|
| C-TOPO-MINR | Manjše plastnice | Siva (8) | {{ui:Contours}} |
| C-TOPO-MAJR | Glavne plastnice | Bela ali črna (7) | {{ui:Contours}} |
| C-TOPO-TEXT | Oznake plastnic | Bela ali črna (7) | {{ui:Contours}} in {{ui:Contour labels}} |
| C-TOPO-TINN | Robovi trikotnikov | Siva (8) | {{ui:Triangles}} |
| C-TOPO-BRKL | Prelomnice in meja | Oranžna (30) | {{ui:Breaklines}} |
| C-TOPO-BNDY | Rob površja | Bela ali črna (7) | {{ui:Surface edge}} |
| C-TOPO-SLOP | Puščice naklona | Turkizna (4) | {{ui:Slope arrows}} |
| V-NODE | Geodetske točke | Zelena (3) | {{ui:Points}} |
| V-NODE-TEXT | Oznake točk: številka, višina, opis | Zelena (3) | {{ui:Points}} in {{ui:Point labels}} |
| V-NODE-LINE | Črte iz kod črt (skupine, ki niso prelomnice) | Zelena (3) | {{ui:Points}} |
| C-ROAD-CNTR | Osi trase | Rdeča (1) | Vedno |
| C-ROAD-STAN | Oznake stacionaže, PC in PT | Rdeča (1) | Vedno |
| C-ROAD-CORR | Robovi koridorja | Rumena (2) | Vedno |
| C-ROAD-SCTN | Prečne linije (kjer se režejo preseki) | Siva (8) | Kadar ima trasa prečne linije |
| C-GRAD-PADS | Obrisi ploščadi | Modra (5) | Vedno |
| C-GRAD-DAYL | Linije preseka s terenom | Magenta (6) | Vedno |
| C-GRAD-SLOP | Črte naklona zemljišča | Magenta (6) | Vedno |
| C-GRAD-FEAT | Karakteristične črte (3D) | Zelena (3) | Vedno |
| C-ROAD-SWPT | Vozne poti: obris, skrajne sledi koles, ime | Oranžna (30) | Vedno |
| C-STRM-PIPE | Cevi | Modra (5) | {{ui:Pipes}} |
| C-STRM-STRC | Objekti | Modra (5) | {{ui:Pipes}} |
| C-STRM-TEXT | Oznake cevi in objektov | Modra (5) | {{ui:Pipes}} |
| C-STRM-PROB | Cevi in objekti s težavami | Rdeča (1) | {{ui:Pipes}} |

Prelomnice se rišejo samo, medtem ko je **Površje** pod **Prikaz** nastavljeno na {{ui:Existing ground}}; meja se riše pri katerem koli površju.

## Debeline črt v PDF

| Debelina | Sloji |
|---|---|
| 0.50 mm | Osi trase, ploščadi, cevi, problematične cevi |
| 0.35 mm | Glavne plastnice, linije preseka s terenom, objekti |
| 0.25 mm | Prelomnice |
| 0.13 mm | Manjše plastnice |
| 0.09 mm | Robovi trikotnikov, črte naklona zemljišča |
| 0.18 mm | Vse drugo |

Datoteke DXF ne vsebujejo debelin črt; nastavite jih po slojih v svojem CAD-programu.

## Velikosti oznak

Oznake so določene glede na papir: oznake plastnic 2.0 mm, oznake stacionaže 1.8 mm, oznake PC in PT ter oznake cevi in objektov 1.6 mm, oznake točk 1.5 mm. Oznake cevi navajajo ime, premer in naklon; oznake objektov navajajo ime in koto pokrova. Na zaslonu ostanejo enako velike, ko povečujete. V DXF so prilagojene merilu, navedenemu v sporočilu o izvozu; glejte [Izvoz tlorisa v DXF](topic:dxf-export).

## Ni prikazano na nobenem sloju

Višinski pasovi so na zaslonu narisani pod črtno risbo, samo na zaslonu. Pogled profila ni del tlorisa.
