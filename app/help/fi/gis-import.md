---
title: Tuo GIS-tiedot
summary: Tuo shapefile-, GeoJSON- ja GeoPackage-tiedostot projektiin GIS-tasoina, sijoita ne oikean koordinaattijärjestelmän kautta, tarkastele niiden attribuutteja ja käytä niitä maastomallissa.
keywords: gis, nimiöt, nimiö kohteille, attribuutit suunnitelmassa, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, tuonti, tasot, attribuutit, koordinaattijärjestelmä, epsg, leveysaste, pituusaste, korkeuskäyrät, tontit, taitelinjat, raja
from: f6b235cc
---

Kaupunkien ja kuntien GIS-osastot luovuttavat paikkatietoa GIS-tiedostoina: tontteja, servituutteja, korkeuskäyriä, verkostoja ja mittausverkkoja. CivilCraft avaa niistä kolmea tyyppiä **GIS-tasoina**, jotka sijaitsevat suunnitelmassa suunnittelusi alla.

| Tiedosto | Mitä avata |
|---|---|
| Shapefile | `.shp` yhdessä `.shx`, `.dbf`, `.prj` ja `.cpg` kanssa (valitse ne kaikki) tai niitä sisältävä `.zip`. Zip, jossa on useita shapefileja, antaa useita tasoja. |
| GeoJSON | `.geojson`-tiedosto (myös `.json`-tiedosto, jonka ensimmäisillä riveillä on `FeatureCollection` tai `Feature`, käy). |
| GeoPackage | `.gpkg`-tiedosto. Kaikki siinä olevat kohdetaulut luetellaan. |
| KML tai KMZ | `.kml`-tiedosto (Google Earthista tai verkkokartalta) tai pakattu `.kmz`. Jokainen kansio muuttuu tasoksi (jaetaan pisteisiin, viivoihin ja monikulmioihin, jos siinä on useita tyyppejä). Kohteen nimi, kuvaus ja laajennetut tiedot tulevat sen attribuuteiksi. Korkeudet ovat metreinä, ja sijainnit leveys- ja pituusasteina kuten GeoJSONissa. |

Pisteet, monipisteet, viivat, reiälliset monikulmiot ja moniosaiset muodot luetaan, ja niiden korkeudet (z) mukana, jos tiedostossa on niitä. Mittausarvot (M) jätetään pois. Korkeusruudukot ja LiDAR avautuvat samalla tavalla: ks. [Korkeusruudukot ja LiDAR](topic:elevation-grids-and-lidar).

## Avaa tiedostot

1. Napsauta **GIS**-ryhmän {{ui:Tuo}}-painiketta (tai {{ui:Avaa}}), valitse tiedostot tai pudota ne suunnitelmaan. Tiedostot luetaan tällä tietokoneella; mitään ei lähetetä.
2. Valintaikkuna **Tuo GIS-tiedot** luettelee kaikki löydetyt tasot: tyypin, kohteiden määrän (ja kuinka monella niistä ei ole geometriaa), attribuuttikenttien määrän ja koordinaattijärjestelmän, jonka tiedosto nimeää. Poista valinta tasoista, joita et halua.
3. Lue osa **Koordinaattijärjestelmä** (alla) ja rivi **Mitä tapahtuu**, ja napsauta sitten {{ui:Tuo}}.
4. Tasot ilmestyvät suunnitelmaan ja kohtaan **GIS-tasot** vasemmalla olevassa paneelissa. Tuonti on yksi vaihe: {{key:Mod+Z}} kumoaa sen.

Suuri tiedosto näyttää edistymisrivin suunnitelman päällä ja {{ui:Peruuta}}-painikkeen.

## Koordinaattijärjestelmä

GIS-tiedostot kertovat sijaintinsa koordinaattijärjestelmän kautta (shapefilen `.prj`, GeoPackagen spatial reference -taulu; GeoJSON on aina leveys- ja pituusasteina). CivilCraft muuntaa jokaisen tason sen omasta järjestelmästä projektin järjestelmään. Se ei koskaan arvaa:

- **Projektilla on koordinaattijärjestelmä** (asetettu kohdassa {{ui:Koordinaatit}}): jokainen taso, jolla on oma järjestelmä, muunnetaan siihen, myös maanpinta- tai paikallinen säätö mukaan lukien. Tiedosto ilman `.prj`-tiedostoa antaa kaksi vaihtoehtoa: **Sama kuin projektissa** (sen luvut ladataan sellaisinaan) tai **Valitse tiedoston järjestelmä**.
- **Projektilla ei ole järjestelmää, ja tiedosto on projisoidussa järjestelmässä projektisi yksiköissä** (esimerkiksi tasokoordinaattivyöhyke US survey feeteinä jalkaprojektille): valintaikkuna tarjoaa **Käytä tätä järjestelmää projektin koordinaattijärjestelmänä**. Se asetetaan samassa kumoamisvaiheessa kuin tuonti. Mikään projektissa ei siirry; järjestelmä kertoo vain, mitä luvut tarkoittavat. Voit valita projektille toisen järjestelmän, jolloin tasot muunnetaan siihen.
- **Projektilla ei ole järjestelmää, ja tiedosto on leveys- ja pituusasteina** (jokainen GeoJSON) **tai muissa yksiköissä**: {{ui:Tuo}} pysyy harmaana, kunnes valitset projektin koordinaattijärjestelmän. Valitsin alkaa lähellä dataa.
- **Ei projektilla eikä tiedostoilla ole järjestelmää**: luvut ladataan sellaisinaan, ja valintaikkuna kertoo sen.

Korkeudetkin muunnetaan: GeoJSON-korkeudet ovat metrejä (GeoJSON-standardi sanoo niin); muiden tiedostojen korkeudet otetaan oman järjestelmänsä yksikössä.

:::warning
GeoJSON-tiedoston sijainnit, jotka ovat pituusasteen ±180° tai leveysasteen ±90° ulkopuolella, eivät ole leveys- ja pituusasteita. Ne kohteet jätetään pois, ja valintaikkuna kertoo niiden määrän. Tällainen tiedosto on yleensä projisoitu tiedosto, joka on tallennettu ilman järjestelmäänsä; pyydä se uudelleen tai pyydä shapefile sen `.prj`-tiedoston kanssa.
:::

NAD83:a käsitellään samana kuin WGS 84:ää (järjestelmää, jota GeoJSON käyttää). Ne eroavat toisistaan Pohjois-Amerikassa muutamia metrejä, joten GeoJSON-data voi olla yhtä paljon pois. Jos paras siirto tarvitsee ruudukkotiedoston (esimerkiksi NADCON NAD27:lle), CivilCraft käyttää karkeampaa julkaistua siirtoa. Koordinaattijärjestelmän valintaikkuna näyttää, kuinka karkea se on (NAD27:lle noin 20 m), kunnes lisäät ruudukon: ks. [Ruudukkosiirtotiedostot](topic:coordinate-systems).

## GIS-tasot

Jokaisella rivillä kohdassa **GIS-tasot** on:

- valintaruutu tason näyttämiseen tai piilottamiseen (piilotettuja tasoja ei myöskään valita);
- sen väri, valittu luettelosta;
- valikko (kolme pistettä), jossa on {{ui:Zoomaa}}, {{ui:Käytä maastomallissa…}}, {{ui:Nimeä uudelleen…}} ja {{ui:Poista}}.

Näyttäminen, piilottaminen, värin vaihto, uudelleennimeäminen ja poistaminen ovat kumoamisvaiheita. GIS-tasot tallennetaan projektitiedostoon ja palaavat, kun avaat sen. Ne menevät myös suunnitelman PDF-tulostukseen sekä DXF- ja DWG-vientiin, kukin tasolle nimeltä `GIS-` ja sen numero.

## Nimiö attribuutista

Tason {{ui:Lisää}}-valikossa (kolme pistettä kohdassa **GIS-tasot**) valitse kenttä kohdasta **Nimiöi kentällä**: jokainen kohde näyttää arvonsa suunnitelmassa tason värillä. Pisteet nimetään pisteen viereen, viivat niiden pisimmän osan keskelle (käännettynä lukemaan vasemmalta oikealle) ja monikulmiot keskelle. Luvut näytetään enintään kolmella desimaalilla. Nimiöt ovat paperilla 1.8 mm korkeita kaikilla mittakaavoilla, ja ne menevät PDF-tulostukseen, DXF:ään ja DWG:hen. Valitse **Ei nimiöitä** poistaaksesi ne; jokainen muutos on yksi vaihe ({{key:Mod+Z}} kumoaa sen). Taso nimeää enintään 5,000 kohdetta.

## Tarkastele kohdetta

Kun {{ui:Valitse}} on päällä, napsauta kohdetta. **Ominaisuudet** näyttää sen tason, kohteen tunnuksen, sen muodon (osat, reiät, kärkipisteet), sen korkeudet, tiedoston, josta se tuli, ja tiedoston koordinaattijärjestelmän, sitten kaikki attribuutit taulukossa. Attribuutit ovat vain luettavissa: CivilCraft näyttää GIS-tiedot sellaisina kuin ne tulivat, eikä muokkaa niitä.

Kun osoitin on sekä pisteen että viivan päällä, piste voittaa viivan; monikulmion sisällä valitaan pienin monikulmio.

## Käytä maastomallissa

Avaa tason valikko ja valitse {{ui:Käytä maastomallissa…}} (tai painike kohdassa **Ominaisuudet**). Tarjottu vaihtoehto riippuu tasosta:

| Taso | Voi muuttua |
|---|---|
| Viivat, joilla on korkeudet (3D-viivat) | Taitelinjat niiden omilla korkeuksilla |
| Viivat ilman korkeuksia, mutta numerokentällä (korkeuskäyrät) | Taitelinjat kentän korkeudella, jonka valitset |
| Monikulmiot | Maastomallin reuna (valittu monikulmio, muuten suurin), tai taitelinjat niiden reunoja pitkin |
| Pisteet, joilla on korkeudet tai korkeuskenttä | Mittauspisteet, kuvattuna tason nimellä, jotta ne muodostavat pisteryhmän |

Jokainen käyttö on yksi kumoamisvaihe, joka kopioi geometrian projektiin; taso itse pysyy ennallaan. Korkeudet otetaan projektin yksiköissä.

## Pistetiedostot leveys- ja pituusasteina

Pistetiedosto, jonka otsikkorivissä on leveys- ja pituussarakkeet (`lat`, `latitude`, `lon`, `long`, `longitude`), luetaan asteina, ei pohjois- ja itäkoordinaatteina. Tuontivalintaikkuna kertoo tämän. Kohdassa {{ui:Tuo}} pisteet muunnetaan projektin koordinaattijärjestelmään; projekti ilman sitä pyytää valitsemaan sen ensin. Asteita ei koskaan ladata jalkoina. Rivit, jotka ovat leveysasteen ±90° tai pituusasteen ±180° ulkopuolella, hylätään perusteluineen. Korkeussarake otetaan sellaisenaan, projektin yksiköissä.

## LandXML-tiedostot, joissa on koordinaattijärjestelmä

Kun avaamassasi LandXML-tiedostossa on `CoordinateSystem`-elementti (EPSG-koodi, WKT-kuvaus tai järjestelmän nimi), CivilCraft tarjoaa sitä projektin koordinaattijärjestelmäksi. Mikään ei siirry, jos hyväksyt; järjestelmä kertoo vain, mitä luvut tarkoittavat.

## Mitä tarkistettiin

- Jokaista lukijaa verrattiin GDAL:iin, kirjastoon, jota useimmat GIS-ohjelmat käyttävät, tiedostoilla, jotka GDAL kirjoitti: shapefileja kaikentyyppisinä, korkeuksilla ja ilman, monen osan viivoja, reiällisiä monikulmioita, tyhjiä geometrioita, teksti-, numero-, päivämäärä- ja tosi/epätosi-attribuutteja, UTF-8- ja Windows-1252-tekstiä `.cpg`-tiedoston kanssa ja ilman, zip, jossa on useita shapefileja, GeoJSON jokaisella geometriatyypillä sekä GeoPackage, jossa on neljä taulua. Jokainen geometria, korkeus ja attribuutti täsmäsi.
- Leveys- ja pituusasteista sekä UTM:stä muunnetut sijainnit täsmäsivät PROJ:iin (GDAL:n taustalla olevaan projektiokirjastoon) 3 mm:n tarkkuudella.
- Vahingoittuneet tiedostot (katkenneet, väärät kokoilmoitukset, rikkinäiset zipit, rikkinäiset GeoPackaget) antavat yhden selkeän viestin; mikään ei jää jumiin.
- Mitään tästä ei ole vielä avattu muissa GIS-ohjelmissa. Tiedostogeodatabaseja, KML:ää ja KMZ:tä ei vielä lueta (ks. [Ei vielä toteutettu](topic:not-built-yet)).
