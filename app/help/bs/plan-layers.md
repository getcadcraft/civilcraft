---
title: Slojevi plana
summary: Fiksni nazivi slojeva, boje i debljine linija koje CivilCraft koristi na ekranu, u DXF-u i u PDF-u, te koja postavka prikaza upravlja svakim.
keywords: slojevi, nazivi slojeva, ncs, boje, aci, debljine linija, slojevi dxf, pdf, postavke prikaza, linije crtanja
from: c2aa8475
---

Sve na planu pripada nekom sloju. Nazivi prate uobičajen obrazac građevinskih slojeva (disciplina, glavna grupa, sporedna grupa). Slojevi su u ovoj verziji fiksni: ne možete ih preimenovati, mijenjati im boje niti dodavati vlastite. U DXF-u svaki sloj ima prikazani broj boje; u PDF-u uz {{ui:Layer colors}} koriste se iste boje, a uz {{ui:Black}} sve se štampa crno.

| Sloj | Sadrži | Boja (DXF broj) | Prikazan kad |
|---|---|---|---|
| C-TOPO-MINR | Sporedne izohipse | Siva (8) | {{ui:Contours}} |
| C-TOPO-MAJR | Glavne izohipse | Bijela ili crna (7) | {{ui:Contours}} |
| C-TOPO-TEXT | Oznake izohipsi | Bijela ili crna (7) | {{ui:Contours}} i {{ui:Contour labels}} |
| C-TOPO-TINN | Ivice trouglova | Siva (8) | {{ui:Triangles}} |
| C-TOPO-BRKL | Linije prijeloma i granica | Narandžasta (30) | {{ui:Breaklines}} |
| C-TOPO-BNDY | Rub površine | Bijela ili crna (7) | {{ui:Surface edge}} |
| C-TOPO-SLOP | Strelice nagiba | Cijan (4) | {{ui:Slope arrows}} |
| V-NODE | Geodetske tačke | Zelena (3) | {{ui:Points}} |
| V-NODE-TEXT | Oznake tačaka: broj, kota, opis | Zelena (3) | {{ui:Points}} i {{ui:Point labels}} |
| V-NODE-LINE | Linije iz kodova linija (grupe koje nisu linije prijeloma) | Zelena (3) | {{ui:Points}} |
| C-ROAD-CNTR | Osovine trase | Crvena (1) | Uvijek |
| C-ROAD-STAN | Oznake stacionaža, PC i PT | Crvena (1) | Uvijek |
| C-ROAD-CORR | Ivice koridora | Žuta (2) | Uvijek |
| C-ROAD-SCTN | Linije uzoraka (gdje se presjeci režu) | Siva (8) | Kad trasa ima linije uzoraka |
| C-GRAD-PADS | Obrisi platoa | Plava (5) | Uvijek |
| C-GRAD-DAYL | Linije iskopa i nasipa | Magenta (6) | Uvijek |
| C-GRAD-SLOP | Linije nagiba nivelacije | Magenta (6) | Uvijek |
| C-GRAD-FEAT | Karakteristične linije (3D) | Zelena (3) | Uvijek |
| C-ROAD-SWPT | Putanje vožnje: obris, vanjske putanje točkova, naziv | Narandžasta (30) | Uvijek |
| C-STRM-PIPE | Cijevi | Plava (5) | {{ui:Pipes}} |
| C-STRM-STRC | Građevine (šahte, slivnici) | Plava (5) | {{ui:Pipes}} |
| C-STRM-TEXT | Oznake cijevi i građevina | Plava (5) | {{ui:Pipes}} |
| C-STRM-PROB | Cijevi i građevine s problemima | Crvena (1) | {{ui:Pipes}} |

Linije prijeloma crtaju se samo dok je **Površ** pod **Prikaz** postavljena na {{ui:Existing ground}}; granica se crta uz bilo koju površ.

## Debljine linija u PDF-u

| Debljina | Slojevi |
|---|---|
| 0.50 mm | Osovine trase, platoi, cijevi, cijevi s problemima |
| 0.35 mm | Glavne izohipse, linije iskopa i nasipa, građevine |
| 0.25 mm | Linije prijeloma |
| 0.13 mm | Sporedne izohipse |
| 0.09 mm | Ivice trouglova, linije nagiba nivelacije |
| 0.18 mm | Sve ostalo |

Datoteke DXF ne sadrže debljine linija; postavite ih po sloju u svom CAD programu.

## Veličine oznaka

Oznake su dimenzionirane na papiru: oznake izohipsi 2.0 mm, oznake stacionaža 1.8 mm, oznake PC i PT te oznake cijevi i građevina 1.6 mm, oznake tačaka 1.5 mm. Oznake cijevi daju naziv, prečnik i nagib; oznake građevina daju naziv i kotu oboda. Na ekranu ostaju iste veličine pri zumiranju. U DXF-u se skaliraju za razmjeru navedenu u poruci o izvozu; vidi [Izvoz plana u DXF](topic:dxf-export).

## Nije prikazano ni na jednom sloju

Pojasi kota crtaju se ispod linija samo na ekranu. Prikaz profila nije dio plana.
