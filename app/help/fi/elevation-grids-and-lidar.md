---
title: Korkeusruudukot ja LiDAR
summary: Rakenna nykyinen maanpinta DEM-aineistosta (GeoTIFF tai ASCII-ruudukko) tai LiDAR-pisteistä (LAS, LAZ) — valitse alue, harvenna data, valitse luokat ja tarkista korkeusyksiköt — ja palauta maastomalli GeoTIFF-korkeusruudukkona.
keywords: dem, dtm, korkeusruudukko, geotiff, tif, ascii-ruudukko, asc, lidar, las, laz, pistepilvi, luokat, maanpinta, harvennus, nodata, rasteri, vie geotiff, gis
from: c8b2d18a
---

Julkiset korkeusaineistot tulevat kahdella tavalla: **korkeusruudukot** (DEM: yksi korkeusarvo neliöruutua kohden, yleensä GeoTIFF-tiedosto `.tif` tai ASCII-ruudukko `.asc`) ja **LiDAR-pisteet** (miljoonia laserheijastuksia `.las`-tiedostossa tai `.laz`-tiedostossa, kun se on pakattu). CivilCraft muuntaa kumman tahansa mittauspisteiksi tai maastomalliksi selaimessa: mitään ei lähetetä mihinkään.

## Avaa tiedosto

1. Napsauta {{ui:Avaa}}-painiketta (tai GIS-ryhmän {{ui:Tuo}}-painiketta) ja valitse tiedosto, tai vedä se pohjakuvaan. ASCII-ruudukolle valitse myös sen `.prj`-tiedosto, jotta CivilCraft tietää koordinaattijärjestelmän.
2. Tuontivalintaikkuna näyttää, mitä tiedosto kertoo itsestään: koon, ruudut tai pisteet, koordinaattijärjestelmän, sijainnin leveys- ja pituuspiirin mukaan sekä korkeusvälin. LiDAR-aineistolle se lukee ensin jokaisen pisteen kerran laskeakseen **luokat** (edistymispalkki näyttää, missä mennään; {{ui:Peruuta}} pysäyttää sen).

GeoTIFF, jossa on kolme tai neljä kaistaa (punainen, vihreä, sininen), on kuva eikä korkeusaineisto: se menee karttatasoille.

## Valitse, mitä tuodaan

- **Alue**: {{ui:Projektin laajuus ja marginaali}} (kirjoita marginaali), {{ui:Se, mitä pohjakuva nyt näyttää}} tai {{ui:Koko tiedosto}}. Vain tämä osa tiedostosta luetaan.
- **Harvenna väliin**: pisteiden väli projektin yksiköissä. Asetusten alla oleva rivi näyttää, kuinka monta pistettä siitä tulee, kun kirjoitat. Ruudukolle CivilCraft pitää joka toisen, kolmannen … solun, joten korkeudet pysyvät tiedoston arvoina; solut eivät koskaan keskiarvoistu. LiDAR-aineistolle alue jaetaan tuon kokoisiin neliöihin, ja kustakin neliöstä säilytetään yksi piste: {{ui:Kunkin ruudun keskipistettä lähin piste}} (oletus), {{ui:Kunkin ruudun matalin piste}} (hyvä, kun tiedostossa ei ole maanpintaluokkaa: maanpinta on puiden alla) tai {{ui:Kunkin ruudun pisteiden keskiarvo}}.
- **Luokat** (LiDAR): maanpinta (luokka 2) on valittuna, kun tiedostossa se on; rakennukset, puut ja kohina jätetään pois. Kun maanpintaluokkaa ei ole, kaikki luokat ovat valittuina ja valintaikkuna kertoo sen.
- **Maanpinta** (LiDAR, 0.8): droonipilvessä ei ole maanpintaluokkaa. Kun tiedostossa sitä ei ole, valintaikkuna aloittaa valinnasta {{ui:Etsi maanpinta itse (droonipilvet, ei maanpintaluokkaa)}}: luetaan kaikki luokat paitsi kohina, kustakin ruudusta säilytetään matalin piste, ja sitten CivilCraft poistaa rakennukset, puut ja satunnaiset matalat pisteet progressiivisella morfologisella suodatuksella (Zhang ym., 2003), jota voit ohjata: **Poistettava suurin kohde** (suurimman rakennuksen leveys; ikkunat kasvavat, kunnes peittävät sen; 0 tarkoittaa 20 solua) ja **Jyrkin maanpinnan kaltevuus**. Työ tehdään matalimpien pisteiden ruudukolla, joten kymmenien miljoonien pisteiden pilvi ei maksa enempää kuin sen solumäärä (harvennus on yksi virtaava läpikäynti). Väli on solu: karkeampi on nopeampi, eikä se jätä pieniä kohteita huomaamatta niin paljon kuin voisi luulla; hienompi säilyttää enemmän maanpintayksityiskohtia. Raportti kertoo, kuinka monta pistettä säilytettiin maanpintana, kuinka monta solua poistettiin kohteina ja kuinka monta satunnaista matalaa pistettä pudotettiin. Kuvitellulla 300 m:n droonimittauksella, jossa oli viisi rakennusta, 70 puuta ja 200 matalaa poikkeamaa, säilytetyt pisteet olivat 3 cm:n sisällä todellisesta maastosta, eikä yhtään kattoa tai latvustoa säilytetty.
- **Korkeudet tiedostossa**: metreinä, jalkoina tai US survey -jalkoina. Kun tiedosto sen kertoo, yksikkö on jo valittu. Kun ei kerro, sinun on valittava: valintaikkuna näyttää korkeusvälin molemmilla tavoilla, jotta näet, kumpi sopii kohteeseen.
- **Tuo muodossa** (vain ruudukot): {{ui:Mittauspisteet (kuvaus DEM)}} tai {{ui:Itse maastomalli (kolmioiden ruudukko)}}.

Yksi tuonti ottaa enintään 500 000 pistettä. Kun valinta antaisi enemmän, valintaikkuna kertoo kuinka paljon ja mikä väli sopisi, ja {{ui:Tuo}} pysyy pois käytöstä.

Napsauta {{ui:Tuo}}. Edistymispalkki näyttää lukemisen; {{ui:Peruuta}} pysäyttää sen, eikä mikään muutu.

:::warning
Pystysuuntaiset yksiköt ovat yleinen ansa. Monien valtiotason tasokoordinaattien DEM-aineistojen itä- ja pohjoiskoordinaatit ovat jaloissa, mutta korkeudet metreissä. Vertaa valintaikkunan näyttämää aluetta siihen, mitä tiedät kohteesta.
:::

## Mitä saat

- **Mittauspisteet**: numeroidaan korkeimman pistenumerosi jälkeen, kuvauksena `DEM` (ruudukot) tai `LIDAR`, joten ne muodostavat yhden pisteryhmän kohdassa **Pisteet** ja rakentavat maastomallin kuten muut pisteet. Tuonti on yksi vaihe: {{key:Mod+Z}} poistaa ne taas.
- **Itse maastomalli**: ruudukon TIN, kaksi kolmiota solua kohden, jaettuna lounaasta koilliseen lävistäjää pitkin. Kolmio, jonka kulmassa ei ole dataa, jätetään pois, joten datan aukot pysyvät aukkoina. Maastomalli on yhtä suuri kuin ruudukko jokaisessa ruudukkopisteessä ja tasainen taso kunkin kolmion sisällä. Se korvaa projektin maastomallin (valintaikkuna kysyy ensin); {{key:Mod+Z}} palauttaa edellisen maastomallin. Vasemman paneelin otsikko on **Maastomalli (korkeusruudukosta)**.

## Koordinaattijärjestelmät

- Jos projektilla on koordinaattijärjestelmä ja tiedosto nimeää toisen, jokainen piste muunnetaan projektin järjestelmään (ja sen maanpinta- tai paikallikoordinaatteihin, jos niitä on).
- Jos projektilla ei ole järjestelmää ja tiedoston järjestelmä on projektin yksiköissä (jalat tai metrit), valintaikkuna tarjoaa tekemään siitä projektin koordinaattijärjestelmän samassa kumoamisvaiheessa kuin pisteet.
- Jos tiedosto on leveys- ja pituuspiirissä tai metreissä jalkaprojektille, valintaikkuna pyytää valitsemaan ensin projektin koordinaattijärjestelmän.
- Jos tiedosto ei kerro järjestelmää, sen luvut otetaan projektin koordinaateiksi. Voit valita tiedoston järjestelmän sen sijaan.

## Vie maastomalli GeoTIFF-tiedostona

1. Napsauta GIS-ryhmän {{ui:Vie}}-painiketta.
2. Valitse GeoTIFF-osassa maastomalli (nykyinen maanpinta tai tasoitettu pinta) ja solun koko. Oletus tulee maastomallin kolmioiden keskimääräisestä särmästä. Valintaikkuna näyttää kirjoitettavan ruudukon koon.
3. Napsauta {{ui:Lataa GeoTIFF}}.

Tiedosto on yksi kaista 32-bittisiä liukuluku-korkeuksia projektin yksiköissä, maastomallin laajuudella; maastomallin ulkopuoliset solut ovat ”ei dataa” (−3.4028235e38). Kunkin solun arvo on maastomallin korkeus solun keskipisteessä. Koordinaatit ovat **ruudukkokoordinaatteja**: maanpinta- tai paikallikoordinaateissa oleva projekti muunnetaan takaisin ruudukkoon. Tiedosto nimeää projektin koordinaattijärjestelmän sen EPSG-koodilla; järjestelmää ilman EPSG-koodia ei kirjoiteta, ja valintaikkuna varoittaa kertomaan GIS-osastolle, mikä järjestelmä on kyseessä.

## Mitä on tarkistettu

- GeoTIFF- ja ASCII-ruudukkolukijat tarkistettiin GDAL:ia vastaan (rasterion kautta), kirjastoa jota useimmat GIS-ohjelmat käyttävät näiden tiedostojen lukemiseen: 32-bittiset liukuluku- ja 16-bittiset kokonaislukuruudukot, laatoitetut ja raidalliset, DEFLATE ja LZW, nodata, skaala ja offset, pixel-is-point, UTM-ruudukko, US survey -jalkojen tasokoordinaattiruudukko ja leveys- ja pituuspiiriruudukko — jokainen arvo yhtä suuri.
- LAS- ja LAZ-lukijat tarkistettiin laspyä vastaan: LAS 1.2 ja 1.4, pistemuodot 0, 1, 3, 6, 7 ja 8, koordinaattijärjestelmän kanssa ja ilman, sekä LASzip-yhteensopivalla taustaohjelmalla kirjoitettu LAZ — jokainen piste yhtä suuri.
- Muunnetut koordinaatit tarkistettiin PROJ:ia vastaan 1 mm:n tarkkuudella.
- Viedyt GeoTIFF-tiedostot luettiin takaisin GDAL:illa: koordinaattijärjestelmä, solujen sijainnit, nodata, yksiköt ja arvot yhtä suuret kuin maastomalli 0.0001:n tarkkuudella.
- Tätä ei ole avattu muissa GIS- tai CAD-ohjelmissa.

## Ei vielä toteutettu

- Pystysuuntaiset datum-muutokset (geoidimallit): korkeudet käytetään niin kuin tiedosto ne antaa.
- Aaltomuotodata, LiDAR-heijastukset muuten kuin luokittain, värit ja intensiteetit.
- Useat kaistat, yleiskatsaukset tai yli 200 MB:n tiedostot.
- LAS- tai LAZ-tiedoston kirjoittaminen maastomallista tai tästä työkalusta ([Pistepilvet](topic:point-clouds) -lisäosa kirjoittaa siivotun pilven LAS 1.4- tai LAZ-muodossa).
