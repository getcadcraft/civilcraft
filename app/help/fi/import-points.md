---
title: Tuo mittauspisteet
summary: Avaa CSV- tai tekstitiedosto pisteineen, tarkista sarakejärjestys Tuo pisteet -ikkunassa, korjaa rivit, joita ei voi lukea, ja lajittele pisteet ryhmiin.
keywords: tuo pisteet, csv, txt, pnezd, penzd, pistetiedosto, mittaus, cogo-pisteet, pisteryhmät, sarakkeet, pohjoinen, itä
from: ad33d88a
---

Pistetiedosto on tekstitiedosto, jossa on yksi piste riviä kohti: pisteen numero, pohjoinen, itä, korkeus ja kuvaus jossakin järjestyksessä, erotettuina pilkuilla, sarkainmerkeillä, puolipisteillä tai välilyönneillä. CivilCraft lukee sen selaimessa ja rakentaa siitä heti pinnan.

## Ennen aloitusta

- Tiedä tiedoston sarakejärjestys, jos mahdollista (PNEZD ja PENZD näyttävät tietokoneelle samoilta).
- Tiedä sen yksiköt. CivilCraft ei muunna: aseta **Yksiköt** vasemmassa paneelissa vastaamaan tiedostoa (katso [Yksiköt, paalut ja lukumuodot](topic:units-and-stations)).
- Koordinaatit voivat olla suuria (tasokoordinaatiston pohjois- ja itäkoordinaatit miljoonissa ovat hyväksyttäviä).

## Tuo tiedosto

1. Napsauta {{ui:Avaa}} työkalurivillä tai paina {{key:Mod+O}} ja valitse tiedosto. Voit myös vetää sen suunnitelmalle.
   **Tuo pisteet** -ikkuna aukeaa tiedoston nimellä, **Sarakkeet**-luettelolla asetettuna arvoon {{ui:Tunnista}}, yhteenvetorivillä ja kuudella ensimmäisellä pisteellä.
2. Lue yhteenvetorivi. Se kertoo, kuinka monta pistettä luettiin, missä sarakejärjestyksessä, miten järjestys löytyi ja mikä erottaa sarakkeet. Järjestys löytyy kolmella tavalla:
   - ”otsikkorivistä”: ensimmäinen rivi nimeää sarakkeensa (Piste, Pohjoinen, Itä, Korkeus, Kuvaus tai X, Y, Z …). Tämä on turvallisin.
   - ”valittu”: valitsit järjestyksen kohdassa **Sarakkeet**.
   - ”arvattu sarakemäärästä ja pisterivien asetuksesta (PNEZD), tarkista, ettei pohjoinen ja itä ole vaihtuneet”: käyttökelpoista otsikkoa ei ollut. Jos tiedostosi ovat yleensä itä ensin, aseta **Pisterivit** arvoon P, E, N, Z, D [CivilCraftin asetuksissa](topic:settings).
3. Tarkista esikatselutaulukko. Sen sarakkeet ovat aina **Piste**, **Pohjoinen**, **Itä**, **Korkeus** ja **Kuvaus** tiedoston järjestyksestä riippumatta. Todellisen kohteen pohjois- ja itäkoordinaatit ovat yleensä selvästi eri kokoisia: jos ne näyttävät vaihtuneilta, arvaus oli väärin.
4. Jos järjestys on väärä, valitse oikea **Sarakkeet**-luettelosta (esimerkiksi {{ui:PENZD — piste, itä, pohjoinen, korko, kuvaus}}). Yhteenveto ja esikatselu päivittyvät heti.
5. Katso esikatselun alta kohta **Rivejä, joita ei luettu**. Jokainen rivi nimeää tiedoston rivinumeron, syyn ja rivin alun. Katso [Rivit, joita ei lueta](topic:import-points#rows-that-are-not-read).
6. Napsauta {{ui:Tuo}}.
   Pisteet ilmestyvät suunnitelmalle, näkymä zoomaa niihin ja pinta rakentuu. Tilarivi kertoo esimerkiksi ”Tuotu 276 pistettä tiedostosta site.csv; pinta: 546 kolmiota.”

Jos projektilla ei vielä ole nimeä, se saa tiedoston nimen.

## Tarkista ryhmät

Jokainen piste kuuluu ryhmään, jonka nimi on **kuvauksen ensimmäinen sana** isoilla kirjaimilla: ”GRD”, ”FL 12” ja ”fl” ovat ryhmiä GRD, FL ja FL. Pisteet ilman kuvausta menevät ryhmään ”(ei kuvausta)”.

1. Katso **Pisteet**-otsikon alla vasemmassa paneelissa olevaa taulukkoa: ryhmä, pisteiden määrä ja **Pinta**-valinta.
2. Jokainen ryhmä alkaa arvolla {{ui:Pisteet}}. Vaihda virtausviivat, päällystysten reunat, luiskien yläreunat ja alareunat, harjanteet ja vastaavat koodatut viivat arvoon {{ui:Taitelinja}}. Aseta ryhmät, joiden ei pidä muovata maanpintaa (hallintapisteet, puiden latvat, sähköpylväät mitattuna latvasta), arvoon {{ui:Jätetty pois}}.
3. Napsauta pistettä suunnitelmalla ({{ui:Valitse}}-työkalulla), jolloin sen numero, koordinaatit, korkeus, kuvaus ja ryhmä näkyvät oikeassa paneelissa.

:::warning
Taitelinjaryhmä yhdistää **kaikki** pisteensä yhdeksi viivaksi pistenumerojärjestyksessä. Tämä toimii, kun jokainen koodattu viiva on mitattu järjestyksessä omalla koodillaan. Kaksi erillistä virtausviivaa, joilla molemmilla on koodi ”FL”, muodostavat yhden viivan, joka siksakkaa niiden välillä. Jos koodisi ovat yhteisiä, käytä työkalua {{ui:Taitelinja}} napsauttamaan kunkin viivan pisteet (katso [Rakenna ja hienosäädä pinta](topic:build-surface)).
:::

## Rivit, joita ei lueta

| Ilmoitettu syy | Mitä se tarkoittaa | Mitä tehdä |
|---|---|---|
| ”pohjoinen tai itä ei ole luku” | Koordinaattisarake sisältää tekstiä | Tarkista sarakejärjestys tai tiedoston keskellä oleva ylimääräinen tekstirivi |
| ”korkeus ei ole luku” | Korkeussarake sisältää tekstiä | Väärä sarakejärjestys tai kuvaus korkeussarakkeessa |
| ”ei pistenumeroa” | Pistesarake on tyhjä | Numeroi piste tai valitse järjestys ilman P:tä (NEZD, NEZ …): pisteet numeroidaan silloin 1, 2, 3 … |
| ”piste 12 esiintyy kahdesti (ensimmäinen säilytetään)” | Kaksi riviä jakaa numeron | Numeroi toinen uudelleen tiedostossa, jos molemmat ovat todellisia mittauksia |
| ”3 saraketta, odotettiin 5 (PNEZD)” | Rivi on lyhyt | Rikkinäinen rivi tai väärä sarakejärjestys |

Pisteet, joiden korkeus on tyhjä, säilytetään, mutta niitä ei käytetä pinnassa. **Pisteet**-tiedot kertovat, kuinka monella pisteellä on korkeus.

Rivit, jotka alkavat merkillä `#`, `;` tai `//`, ovat kommentteja ja ohitetaan. Tyhjät rivit ohitetaan.

## Korvaa tai lisää pisteitä

Tuonti uudelleen **korvaa** kaikki pisteet; se ei lisää niihin. Linjauksesi, alustasi, putkesi, piirretyt taitelinjasi ja rajasi säilyvät. Kumoushistoria tyhjennetään, joten tallenna projekti ensin, jos saatat haluta vanhat pisteet takaisin. Kahden tiedoston yhdistämiseksi liitä ne yhteen tekstieditorissa tai taulukkolaskennassa ennen tuontia (varo toistuvia pistenumeroita).

Pisteitä ei voi vielä siirtää, muokata tai poistaa CivilCraftin sisällä. Korjaa ne tiedostossa ja tuo uudelleen.

## Aiheeseen liittyvää

- [Pistetiedostomuodot](topic:point-file-formats): jokainen sarakejärjestys ja se, miten otsikot tunnistetaan.
- [Rakenna ja hienosäädä pinta](topic:build-surface).
