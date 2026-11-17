---
title: Maasto korkeuskäyristä
summary: Tee maanpinta korkeuskäyräkartasta. Valitse viivatasot, kerro, mistä kunkin viivan korkeus tulee, tarkista risteykset ja kaksoiskappaleet ja rakenna. Korkeuskäyristä tulee taitelinjoja, ja harjanteiden ja laaksojen tasaiset kolmiot korjataan. Kuvasta tai PDF:stä jäljitetty kartta voidaan skaalata ja sijoittaa kahdella tunnetulla pisteellä.
keywords: korkeuskäyrät, korkeuskäyräviivat, maasto korkeuskäyristä, pinta korkeuskäyristä, topografinen kartta, mittauskartta, ei koordinaatteja, taitelinjat, tasaiset kolmiot, harjanne, laakso, mäenhuippu, risteävät korkeuskäyrät, päällekkäiset korkeuskäyrät, korkeusväli, kartan skaalaus, kaksi pistettä, kartan sijoittaminen, DXF, DWG, shapefile
from: e6161653
---

Mittaaja lähettää joskus korkeuskäyräkartan: viivoja, joilla on korkeuksia, mutta ei pisteitä. CivilCraft rakentaa olemassa olevan maanpinnan näistä viivoista.

## Tuo korkeuskäyrät

Avaa kartta viivageometriana: DXF- tai DWG-piirros, shapefile tai GeoJSON (**GIS** › {{ui:Tuo}}, tai pudota tiedosto suunnitelmaan). Viivat tulevat **karttatasoina**. Kohdasta **Maastomalli** › {{ui:Lisää}} valitse {{ui:Maasto korkeuskäyristä}}.

## Kerro, mistä kunkin korkeus tulee

Rastita tasot, jotka sisältävät korkeuskäyriä, ja valitse **Korkeus lähteestä**:

- {{ui:Viivojen omat korot}}: viiva, jonka kaikilla kärkipisteillä on sama korkeus (3D-murtoviiva tai murtoviiva, jolla on korkeus). Viiva korkeudella 0 on suunnitelman viivageometriaa, eikä sillä ole korkeutta.
- Kerroksen **lukukenttä** (esimerkiksi ELEV), jos kartta tuli sen kanssa.
- {{ui:Alku ja väli viivojen luettelojärjestyksessä}}: viivoille, joilla ei ole lainkaan korkeutta. Ensimmäisellä luetellulla viivalla on **Ensimmäisen viivan korkeus**, seuraavalla tämä plus **Korkeuskäyrien väli**, ja niin edelleen. Luettele viivat alhaalta ylös (tai järjestä ne uudelleen kerroksessa).

## Tarkista, sitten rakenna

{{ui:Tarkista}} luettelee, mikä on vialla, sanoin, ennen kuin mikään muuttuu:

- viiva, jolla **ei ole korkeutta** tai jossa on alle kaksi pistettä;
- **päällekkäinen** viiva (sama muoto kahdesti, vaikka se on piirretty toisin päin);
- kaksi viivaa, jotka **risteävät**, eri korkeuksilla tai samalla korkeudella (myös viiva, joka risteää itsensä kanssa), paikka mukaan lukien;
- korkeus, joka **ei ole korkeusvälin mukainen** (kirjoitusvirhe, kuten 105.5 kartalla, jonka väli on 1 m).

Rastita {{ui:Jätä pois viivat, jotka leikkaavat toisen}} pudottaaksesi viivan, joka risteää eniten muita (sitten seuraavan, kunnes mikään ei risteä). Eksynyt viiva, joka leikkaa jokaisen korkeuskäyrän, on se, joka lähtee, eivät korkeuskäyrät. **Yksinkertaista viivat tällä etäisyydellä** harventaa kärkipisteitä, jotka ovat lähempänä suoraa osuutta kuin tämä etäisyys.

{{ui:Rakenna maanpinta}} lisää viivat olemassa olevaan maanpintaan taitelinjoina (yksi kumoamisaskel), joten pinta kulkee täsmälleen jokaisen korkeuskäyrän kautta. Kun {{ui:Korjaa tasaiset kolmiot harjanteilla, laaksoissa ja mäenhuipuilla}} on rastitettu ja korkeusväli annettu, CivilCraft lisää myös pisteen jokaisen tasaisen kolmion sisään (kolmion, jonka kaikki kulmat ovat yhdellä korkeuskäyrällä). Piste sijoitetaan korkeuteen, johon viereinen rinne jatkuu, enintään puolen korkeusvälin päähän korkeuskäyrästä. Ilman tätä harjanteiden huiput, laaksojen pohjat ja mäenhuiput tulevat tasaisina levyinä. Testikukkulalla virhe oikeaa pintaa vastaan laski neljänneksellä; harjanteella 40 %.

## Kartta ilman koordinaatteja

Kuvasta tai PDF:stä jäljitettyä korkeuskäyräkarttaa varten avaa **Skaalaa ja sijoita kerrokset kahden tunnetun pisteen avulla**. Anna kaksi pistettä kartalla ja niiden todelliset sijainnit. Rastitut tasot skaalataan, käännetään ja siirretään sopimaan (yksi kumoamisaskel; korkeuksia ei muuteta). Samat kaksi pistettä antavat mittakaavan (näkyy viestissä) ja kiertokulman.

Pinta on yhtä hyvä kuin kartta: kahden korkeuskäyrän välissä se on taso, joten todellista maastoa niiden välillä ei tunneta. Tarkista tulos pistekorkeuksia vasten ennen kuin luotat siihen.
