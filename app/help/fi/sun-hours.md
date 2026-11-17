---
title: Laske auringonpaistetunnit kohteessa
summary: Valitse päivä (tai vuodenaika) ja aikavyöhyke ja katso suoran auringon tunnit jokaisen rakennusmassan jokaisella seinällä ja niiden ympärillä olevassa maassa. Maa piirtyy suunnitelmaan ja luvut CSV-tiedostoina.
keywords: aurinko, auringonpaisteen tunnit, varjo, varjostus, aurinkoisuus, päivänvalotunnit, julkisivu, seinä, vuodenaika, kesäpäivän seisaus, päiväntasaus, aikavyöhyke, kesäaika, leveyspiiri, pituuspiiri, CSV, raster
from: 4e32a314
---

**Auringonpaistetunnit** laskee suoran auringon tunnit, jotka osuvat kunkin rakennusmassan jokaiseen seinään ja niiden ympärillä olevaan maahan, valitsemanasi päivänä tai vuodenajan keskiarvona. Massat ja maa itse heittävät varjoa, mikään muu ei (ei puita eikä naapureita, joita et ole piirtänyt). Taivaan valoa, joka ei ole suoraa aurinkoa, ei lasketa.

## Ennen aloittamista

Auringon paikka tulee kohteen leveyspiiristä ja pituuspiiristä, jotka tulevat projektin **koordinaattijärjestelmästä**. Projekti ilman sitä hylätään viestillä: aseta se ensin (**Koordinaatit** GIS-ryhmässä). Käsin kirjoitettu leveys- ja pituuspiiri olisi arvaus, joten niille ei ole kenttää.

## Laske se

Kohdassa **Ominaisuudet**, osiossa **Rakennusmassat**, **Auringonpaistetunnit**:

1. Valitse **Päivä**. Se alkaa päivästä, jolloin aurinko on matalimmillaan siellä, missä olet (21. joulukuuta, tai 21. kesäkuuta eteläisellä pallonpuoliskolla). Vuodenajalle rastita **Vuodenajan yli**, valitse **Viimeinen päivä** ja montako päivää välein näytteet otetaan.
2. Kirjoita **Aikavyöhyke**: nimi, kuten `America/Mexico_City`, tai ero UTC:stä, kuten `-6`. Nimi seuraa kyseisen vyöhykkeen kesäajan sääntöjä kyseiselle päivälle. Kirjoittamasi ero käytetään sellaisenaan, joten käytä sitä, joka on voimassa kyseisenä päivänä. Laatikon alla oleva rivi kertoo, minkä eron se löysi.
3. Valitse, kuinka usein aurinko sijoitetaan (5, 10, 15 tai 30 minuutin välein), ja paina sitten **Laske auringonpaistetunnit**. Vuodenaika ajetaan taustatyönä; **Pysäytä** peruuttaa sen.

## Mitä saat

- Taulukko massoittain: **huonoin seinä**, **keskiarvo** ja **paras seinä** tunteina päivässä, sekä taulukko jokaisesta seinästä sen suuntauksen ja tuntimäärien kanssa kerroksittain.
- Massojen ympärillä oleva maa piirtyy suunnitelmaan tummasta (ei aurinkoa) keltaiseen (eniten, mitä mikään solu saa), selitteen kanssa. Massojen alla olevat solut jätetään tyhjiksi. **Näytä maa suunnitelmassa** kytkee sen pois.
- **Seinät CSV:nä** ja **Maa CSV:nä** tallentavat luvut.

Vuodenajalla luvut ovat päiväkohtainen keskiarvo näytettyjen päivien yli. Projektiin ei tallenneta mitään: tulos on tarkasteltavaksi, ja sen uudelleen ajaminen laskee sen uudelleen.

## Hyvä tietää

- Seinä lasketaan aurinkoiseksi hetkeksi vain, kun se on auringon suuntaan eikä mikään ole tiellä. Poispäin oleva seinä ei saa mitään.
- Maa näytteistetään ruudukolla, joka riippuu kohteen koosta, ja auringon paikka lasketaan kunkin aika-askeleen keskellä. Tunnit ovat siksi oikein likimain valitsemasi askeleen tarkkuudella.
- Auringon paikka on julkaistu tähtitieteellinen kaava, tarkka noin yhden kaariminuutin verran.
