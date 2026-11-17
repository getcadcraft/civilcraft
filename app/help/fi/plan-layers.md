---
title: Tasot
summary: Kiinteät tasonimet, värit ja viivanpaksuudet, joita CivilCraft käyttää näytöllä, DXF-tiedostossa ja PDF-tiedostossa, sekä se, mikä näyttöasetus ohjaa kutakin.
keywords: tasot, tasonimet, ncs, värit, aci, viivanpaksuudet, dxf-tasot, pdf, näyttöasetukset, viivat
from: c2aa8475
---

Kaikki suunnitelman kohteet kuuluvat johonkin tasoon. Nimet noudattavat yleistä siviilitekniikan tasonimirakennetta (ala, pääryhmä, aliryhmä). Tasot ovat tässä versiossa kiinteitä: niitä ei voi nimetä uudelleen, muuttaa niiden värejä tai lisätä omia. DXF-tiedostossa kullakin tasolla on alla näkyvä värinumero. PDF-tiedostossa, kun {{ui:Tasojen värit}} on valittuna, käytetään samoja värejä, ja kun {{ui:Musta}} on valittuna, kaikki tulostuu mustana.

| Taso | Sisältää | Väri (DXF-numero) | Näkyy kun |
|---|---|---|---|
| C-TOPO-MINR | Ohuet korkeuskäyrät | Harmaa (8) | {{ui:Korkeuskäyrät}} |
| C-TOPO-MAJR | Pääkorkeuskäyrät | Valkoinen tai musta (7) | {{ui:Korkeuskäyrät}} |
| C-TOPO-TEXT | Korkeuskäyrien tunnisteet | Valkoinen tai musta (7) | {{ui:Korkeuskäyrät}} ja {{ui:Korkeuskäyrien tunnisteet}} |
| C-TOPO-TINN | Kolmioiden reunat | Harmaa (8) | {{ui:Kolmiot}} |
| C-TOPO-BRKL | Taitelinjat ja reuna | Oranssi (30) | {{ui:Taitelinjat}} |
| C-TOPO-BNDY | Maastomallin reuna | Valkoinen tai musta (7) | {{ui:Maastomallin reuna}} |
| C-TOPO-SLOP | Kaltevuusnuolet | Syaani (4) | {{ui:Kaltevuusnuolet}} |
| V-NODE | Mittauspisteet | Vihreä (3) | {{ui:Pisteet}} |
| V-NODE-TEXT | Pistetunnisteet: numero, korkeus, kuvaus | Vihreä (3) | {{ui:Pisteet}} ja {{ui:Pistetunnisteet}} |
| V-NODE-LINE | Viivat linjakoodeista (ryhmät, jotka eivät ole taitelinjoja) | Vihreä (3) | {{ui:Pisteet}} |
| C-ROAD-CNTR | Linjauksen keskiviivat | Punainen (1) | Aina |
| C-ROAD-STAN | Paalumerkit ja tunnisteet, PC ja PT | Punainen (1) | Aina |
| C-ROAD-CORR | Käytävän reunat | Keltainen (2) | Aina |
| C-ROAD-SCTN | Poikkileikkauslinjat (missä leikkaukset tehdään) | Harmaa (8) | Kun linjauksessa on poikkileikkauslinjat |
| C-GRAD-PADS | Tasanteiden ääriviivat | Sininen (5) | Aina |
| C-GRAD-DAYL | Maanpinnan rajaviivat | Magenta (6) | Aina |
| C-GRAD-SLOP | Tasauksen luiskaviivat | Magenta (6) | Aina |
| C-GRAD-FEAT | Taitelinjat (3D) | Vihreä (3) | Aina |
| C-ROAD-SWPT | Pyyhkäisyradat: ääriviiva, uloimmat pyörien radat, nimi | Oranssi (30) | Aina |
| C-STRM-PIPE | Putket | Sininen (5) | {{ui:Putket}} |
| C-STRM-STRC | Rakenteet | Sininen (5) | {{ui:Putket}} |
| C-STRM-TEXT | Putkien ja rakenteiden tunnisteet | Sininen (5) | {{ui:Putket}} |
| C-STRM-PROB | Ongelmalliset putket ja rakenteet | Punainen (1) | {{ui:Putket}} |

Taitelinjat piirretään vain, kun **Maastomalli** kohdassa **Näyttö** on {{ui:Nykyinen maanpinta}}. Reuna piirretään kummalla tahansa maastomallilla.

## Viivanpaksuudet PDF-tiedostossa

| Paksuus | Tasot |
|---|---|
| 0.50 mm | Linjauksen keskiviivat, tasanteet, putket, ongelmalliset putket |
| 0.35 mm | Pääkorkeuskäyrät, maanpinnan rajaviivat, rakenteet |
| 0.25 mm | Taitelinjat |
| 0.13 mm | Ohuet korkeuskäyrät |
| 0.09 mm | Kolmioiden reunat, tasauksen luiskaviivat |
| 0.18 mm | Kaikki muu |

DXF-tiedostoissa ei ole viivanpaksuuksia. Aseta ne tasoittain CAD-ohjelmassa.

## Tunnisteiden koot

Tunnisteet mitoitetaan paperille: korkeuskäyrien tunnisteet 2.0 mm, paalutunnisteet 1.8 mm, PC- ja PT-tunnisteet sekä putki- ja rakennetunnisteet 1.6 mm, pistetunnisteet 1.5 mm. Putkitunnisteissa on nimi, halkaisija ja kaltevuus. Rakennetunnisteissa on nimi ja kannen korkeus. Näytöllä ne pysyvät samankokoisina, kun zoomaat. DXF-tiedostossa ne skaalataan viennin ilmoituksessa mainitun mittakaavan mukaan. Katso [Vie piirros DXF-muotoon](topic:dxf-export).

## Ei näy millään tasolla

Korkeusvyöhykkeet piirretään viivojen alle vain näytölle. Pituusleikkausnäkymä ei kuulu suunnitelmaan.
