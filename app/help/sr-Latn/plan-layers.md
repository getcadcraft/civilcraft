---
title: Slojevi plana
summary: Fiksni nazivi slojeva, boje i debljine linija koje CivilCraft koristi na ekranu, u DXF-u i u PDF-u, i koje podešavanje prikaza upravlja svakim.
keywords: slojevi, nazivi slojeva, ncs, boje, aci, debljine linija, dxf slojevi, pdf, podešavanja prikaza, linije crteža
from: c2aa8475
---

Sve na planu pripada nekom sloju. Nazivi prate uobičajeni građevinski obrazac sloja (disciplina, glavna grupa, podgrupa). Slojevi su u ovoj verziji fiksni: ne možete ih preimenovati, menjati im boje niti dodavati sopstvene. U DXF-u svaki sloj ima prikazani broj boje; u PDF-u sa {{ui:Boje slojeva}} koriste se iste boje, a sa {{ui:Crno}} sve se štampa crno.

| Sloj | Sadrži | Boja (DXF broj) | Prikazuje se kada |
|---|---|---|---|
| C-TOPO-MINR | Sporedne izohipse | Siva (8) | {{ui:Izohipse}} |
| C-TOPO-MAJR | Glavne izohipse | Bela ili crna (7) | {{ui:Izohipse}} |
| C-TOPO-TEXT | Oznake izohipsi | Bela ili crna (7) | {{ui:Izohipse}} i {{ui:Oznake izohipsi}} |
| C-TOPO-TINN | Ivice trouglova | Siva (8) | {{ui:Trouglovi}} |
| C-TOPO-BRKL | Linije loma i granica | Narandžasta (30) | {{ui:Linije loma}} |
| C-TOPO-BNDY | Ivica površine | Bela ili crna (7) | {{ui:Ivica površine}} |
| C-TOPO-SLOP | Strelice nagiba | Cijan (4) | {{ui:Strelice nagiba}} |
| V-NODE | Geodetske tačke | Zelena (3) | {{ui:Tačke}} |
| V-NODE-TEXT | Oznake tačaka: broj, kota, opis | Zelena (3) | {{ui:Tačke}} i {{ui:Oznake tačaka}} |
| V-NODE-LINE | Linije iz kodova linija (grupe koje nisu linije loma) | Zelena (3) | {{ui:Tačke}} |
| C-ROAD-CNTR | Osovine trase | Crvena (1) | Uvek |
| C-ROAD-STAN | Oznake stacionaže, PC i PT | Crvena (1) | Uvek |
| C-ROAD-CORR | Ivice koridora | Žuta (2) | Uvek |
| C-ROAD-SCTN | Linije uzoraka (mesta gde se seku preseci) | Siva (8) | Kada trasa ima linije uzoraka |
| C-GRAD-PADS | Konture platoa | Plava (5) | Uvek |
| C-GRAD-DAYL | Linije preseka sa terenom | Magenta (6) | Uvek |
| C-GRAD-SLOP | Linije nagiba nivelacije | Magenta (6) | Uvek |
| C-GRAD-FEAT | Karakteristične linije (3D) | Zelena (3) | Uvek |
| C-ROAD-SWPT | Putanje zaokretanja: obris, spoljašnje putanje točkova, naziv | Narandžasta (30) | Uvek |
| C-STRM-PIPE | Cevi | Plava (5) | {{ui:Cevi}} |
| C-STRM-STRC | Objekti | Plava (5) | {{ui:Cevi}} |
| C-STRM-TEXT | Oznake cevi i objekata | Plava (5) | {{ui:Cevi}} |
| C-STRM-PROB | Cevi i objekti sa problemom | Crvena (1) | {{ui:Cevi}} |

Linije loma crtaju se samo dok je **Površ** pod **Prikaz** postavljena na {{ui:Postojeći teren}}; granica se crta uz bilo koju površ.

## Debljine linija u PDF-u

| Debljina | Slojevi |
|---|---|
| 0.50 mm | Osovine trase, platoi, cevi, cevi sa problemom |
| 0.35 mm | Glavne izohipse, linije preseka sa terenom, objekti |
| 0.25 mm | Linije loma |
| 0.13 mm | Sporedne izohipse |
| 0.09 mm | Ivice trouglova, linije nagiba nivelacije |
| 0.18 mm | Sve ostalo |

DXF datoteke ne nose debljine linija; podesite ih po sloju u svom CAD programu.

## Veličine oznaka

Oznake se dimenzionišu na papiru: oznake izohipsi 2.0 mm, oznake stacionaže 1.8 mm, oznake PC i PT te oznake cevi i objekata 1.6 mm, oznake tačaka 1.5 mm. Oznake cevi daju naziv, prečnik i nagib; oznake objekata daju naziv i kotu oboda. Na ekranu ostaju iste veličine pri zumiranju. U DXF-u se skaliraju za razmeru navedenu u poruci o izvozu; pogledajte [Izvoz plana u DXF](topic:dxf-export).

## Nije prikazano ni na jednom sloju

Pojasi visinskih kota crtaju se ispod linija samo na ekranu. Prikaz profila nije deo plana.
