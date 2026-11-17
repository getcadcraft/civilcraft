---
title: Slojevi tlocrta
summary: Fiksni nazivi slojeva, boje i debljine linija koje CivilCraft koristi na zaslonu, u DXF-u i u PDF-u te koja postavka prikaza upravlja svakim.
keywords: slojevi, nazivi slojeva, ncs, boje, aci, debljine linija, dxf slojevi, pdf, postavke prikaza, linije crteža
from: c2aa8475
---

Sve na tlocrtu pripada nekom sloju. Nazivi slijede uobičajeni građevinski obrazac za slojeve (disciplina, glavna skupina, podskupina). Slojevi su u ovoj verziji fiksni: ne možete ih preimenovati, mijenjati im boje niti dodavati vlastite. U DXF-u svaki sloj ima prikazani broj boje; u PDF-u s {{ui:Boje slojeva}} koriste se iste boje, a uz {{ui:Crno}} sve se ispisuje crno.

| Sloj | Sadrži | Boja (DXF broj) | Prikazuje se kad |
|---|---|---|---|
| C-TOPO-MINR | Sporedne izohipse | Siva (8) | {{ui:Izohipse}} |
| C-TOPO-MAJR | Glavne izohipse | Bijela ili crna (7) | {{ui:Izohipse}} |
| C-TOPO-TEXT | Oznake izohipsa | Bijela ili crna (7) | {{ui:Izohipse}} i {{ui:Oznake izohipsa}} |
| C-TOPO-TINN | Rubovi trokuta | Siva (8) | {{ui:Trokuti}} |
| C-TOPO-BRKL | Prijelomnice i granica | Narančasta (30) | {{ui:Prijelomnice}} |
| C-TOPO-BNDY | Rub terena | Bijela ili crna (7) | {{ui:Rub terena}} |
| C-TOPO-SLOP | Strelice nagiba | Cijan (4) | {{ui:Strelice nagiba}} |
| V-NODE | Geodetske točke | Zelena (3) | {{ui:Točke}} |
| V-NODE-TEXT | Oznake točaka: broj, kota, opis | Zelena (3) | {{ui:Točke}} i {{ui:Oznake točaka}} |
| V-NODE-LINE | Linije iz kodova linija (skupine koje nisu prijelomnice) | Zelena (3) | {{ui:Točke}} |
| C-ROAD-CNTR | Središnje linije osi trase | Crvena (1) | Uvijek |
| C-ROAD-STAN | Oznake stacionaža i oznake, PC i PT | Crvena (1) | Uvijek |
| C-ROAD-CORR | Rubovi koridora | Žuta (2) | Uvijek |
| C-ROAD-SCTN | Linije uzorkovanja (gdje se izvode presjeci) | Siva (8) | Kad os trase ima linije uzorkovanja |
| C-GRAD-PADS | Obrisi platoa | Plava (5) | Uvijek |
| C-GRAD-DAYL | Linije nožice pokosa | Magenta (6) | Uvijek |
| C-GRAD-SLOP | Linije nagiba planiranja | Magenta (6) | Uvijek |
| C-GRAD-FEAT | Značajne linije (3D) | Zelena (3) | Uvijek |
| C-ROAD-SWPT | Putanje vožnje: obris, vanjske putanje kotača, naziv | Narančasta (30) | Uvijek |
| C-STRM-PIPE | Cijevi | Plava (5) | {{ui:Cijevi}} |
| C-STRM-STRC | Građevine | Plava (5) | {{ui:Cijevi}} |
| C-STRM-TEXT | Oznake cijevi i građevina | Plava (5) | {{ui:Cijevi}} |
| C-STRM-PROB | Cijevi i građevine s problemima | Crvena (1) | {{ui:Cijevi}} |

Prijelomnice se crtaju samo dok je **Teren** u odjeljku **Prikaz** postavljen na {{ui:Postojeći teren}}; granica se crta s bilo kojim terenom.

## Debljine linija u PDF-u

| Debljina | Slojevi |
|---|---|
| 0.50 mm | Središnje linije osi trase, platoi, cijevi, cijevi s problemima |
| 0.35 mm | Glavne izohipse, linije nožice pokosa, građevine |
| 0.25 mm | Prijelomnice |
| 0.13 mm | Sporedne izohipse |
| 0.09 mm | Rubovi trokuta, linije nagiba planiranja |
| 0.18 mm | Sve ostalo |

DXF datoteke ne nose debljine linija; postavite ih po sloju u svom programu za crtanje.

## Veličine oznaka

Oznake su na papiru određene veličine: oznake izohipsa 2.0 mm, oznake stacionaža 1.8 mm, oznake PC i PT te oznake cijevi i građevina 1.6 mm, oznake točaka 1.5 mm. Oznake cijevi navode naziv, promjer i nagib; oznake građevina navode naziv i rub poklopca. Na zaslonu ostaju iste veličine pri zumiranju. U DXF-u su prilagođene mjerilu navedenom u poruci o izvozu; vidi [Izvoz tlocrta u DXF](topic:dxf-export).

## Nije prikazano ni na jednom sloju

Pojasi kota crtaju se ispod linija samo na zaslonu. Prikaz profila nije dio tlocrta.
