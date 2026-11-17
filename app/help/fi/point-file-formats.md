---
title: Pistetiedostojen muodot
summary: Sarakejärjestykset, jotka CivilCraft lukee, miten se löytää erottimen ja otsikkorivin, mitkä otsikkonimet se tunnistaa ja miten rivit tarkistetaan.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, pistetiedoston muoto, sarakkeet, otsikko, erotin
from: 84fab42e
---

Pistetiedosto on tavallista tekstiä, yksi piste riviä kohti. CivilCraft lukee sen selaimessa; mitään ei lähetetä.

## Sarakejärjestykset

Kirjaimet nimeävät sarakkeet vasemmalta oikealle: **P** pistenumero tai -nimi, **N** pohjoiskoordinaatti, **E** itäkoordinaatti, **Z** korkeus, **D** kuvaus.

| Järjestys | Sarakkeet | Esimerkkirivi |
|---|---|---|
| PNEZD | piste, pohjoinen, itä, korkeus, kuvaus | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | piste, itä, pohjoinen, korkeus, kuvaus | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | piste, pohjoinen, itä, korkeus | `101,2080000.00,6150000.00,250.00` |
| PENZ | piste, itä, pohjoinen, korkeus | `101,6150000.00,2080000.00,250.00` |
| NEZD | pohjoinen, itä, korkeus, kuvaus | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | itä, pohjoinen, korkeus, kuvaus | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | pohjoinen, itä, korkeus | `2080000.00 6150000.00 250.00` |
| ENZ | itä, pohjoinen, korkeus | `6150000.00 2080000.00 250.00` |

Järjestyksissä ilman P:tä pisteet numeroidaan 1, 2, 3 … tiedoston järjestyksessä. X on itä ja Y on pohjoinen.

## Erottimet

CivilCraft tarkastelee ensimmäisiä 20 riviä ja valitsee ensimmäisen seuraavista, joka esiintyy vähintään 60 %:ssa niistä: pilkku, sarkain, puolipiste. Muuten jaetaan välilyöntien mukaan.

- Pilkku-, sarkain- ja puolipistetiedostoissa kaksoislainausmerkeissä oleva kenttä voi sisältää erottimen (`"FL, NORTH"`), ja `""` lainausmerkkien sisällä on yksi lainausmerkki.
- Välilyönnillä erotetuissa tiedostoissa rivin lopussa oleva kuvaus voi sisältää välilyöntejä: kaikki viimeisen koordinaattisarakkeen jälkeen on kuvausta.
- Rivit, jotka alkavat merkeillä `#`, `;` tai `//`, sekä tyhjät rivit ohitetaan.
- Tiedoston alussa oleva tavujärjestysmerkki (BOM) ohitetaan.

## Otsikkorivi

Ensimmäinen rivi käsitellään otsikkona, kun vähemmän kuin kaksi sen kentistä on lukuja. Jos jokainen otsikon kenttä on nimi, jonka CivilCraft tunnistaa, sarakejärjestys saadaan siitä (”otsikkorivistä”). Nimet tunnistetaan riippumatta kirjainkoosta, välilyönneistä, pisteistä, alaviivoista, yhdysmerkeistä ja hakasulkeista:

| Sarake | Tunnistetut nimet |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Jos jokin otsikon nimi ei ole tunnistettu tai nimet eivät muodosta yhtä kahdeksasta järjestyksestä, otsikko ohitetaan ja järjestys arvioidaan sarakkeiden määrästä.

:::warning
Otsikko, joka nimeää sekä leveyspiirisarakkeen (`lat`, `latitude`) että pituuspiirisarakkeen (`lon`, `long`, `longitude`), luetaan asteina eikä pohjoisena ja itänä. Kohdassa {{ui:Tuo}} pisteet muunnetaan projektin koordinaatistojärjestelmän kautta, ja projekti ilman sitä pyytää ensin valitsemaan sen. Rivit leveyspiirin ±90° tai pituuspiirin ±180° ulkopuolella hylätään. Katso [Tuo GIS-tiedot](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Arviointi sarakkeiden määrästä

Kun käytettävissä ei ole otsikkoa ja **Sarakkeet** on jätetty kohtaan {{ui:Tunnista}}:

- 5 saraketta tai enemmän: PNEZD.
- 4 saraketta: PNEZ, kun ensimmäinen sarake on kokonaisluku jokaisella näytteenotetulla rivillä ja neljäs on luku; muuten NEZD.
- 3 saraketta: NEZ.

PNEZD- ja PENZD-järjestyksiä ei voi erottaa luvuista. Arvaus noudattaa asetusta **Pisterivit** kohdassa [CivilCraft-asetukset](topic:settings): P, N, E, Z, D alussa tai P, E, N, Z, D (jolloin neljä saraketta luetaan PENZ:ksi ja kolme ENZ:ksi). Valintaikkuna sanoo ”arvioitu sarakkeiden määrästä – tarkista, ettei pohjoista ja itää ole vaihdettu keskenään”. Valitse oikea järjestys kohdasta **Sarakkeet**, jos esikatselu näyttää väärältä.

## Rivien tarkistus

- Rivi voi jättää kuvauksen pois.
- Pohjoisen ja idän on oltava lukuja. Korkeus voi olla tyhjä (piste säilytetään, mutta sitä ei käytetä pinnassa).
- Pistenumero voi olla mitä tahansa tekstiä (myös kirjaimia, kuten `CP1`), mutta ei tyhjä.
- Jos pistenumero toistuu, ensimmäinen rivi säilytetään ja muut luetellaan lukemattomina.
- Kuvaukset säilytetään enintään 200 merkkiä; ohjausmerkit muuttuvat välilyönneiksi.
- Enintään 200 lukematonta riviä säilytetään valintaikkunaa varten (näytetään 25), ja kaikki ne lasketaan.

## Pisteryhmät

Pisteen ryhmä on kuvauksen ensimmäinen sana isoilla kirjaimilla. ”GRD”, ”grd shot” ja ”Grd” ovat kaikki ryhmässä GRD. Piste ilman kuvausta on ryhmässä ”(ei kuvausta)”. Katso [Tuo mittauspisteet](topic:import-points).

## Pisteiden kirjoittaminen

CivilCraft ei vielä vie pistetekstitiedostoa. Pisteet viedään LandXML-muodossa (CgPoints-pisteinä) ja projektitiedostoon. Lisäksi {{ui:Vie}}-toiminnolla ne voi viedä GIS-tiedostona shapefile-, GeoPackage- tai GeoJSON-muodossa, kentillä P, N, E, Z ja D ([Vie toteutuneet tiedot GIS:lle](topic:gis-export)). Katso [Ei vielä toteutettu](topic:not-built-yet).
