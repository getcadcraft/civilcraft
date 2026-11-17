---
title: Vie as-built-tiedot GIS-käyttöön
summary: Luovuta mittauspisteet, korkeuskäyrät, linjaukset, alustat, putket ja rakenteet kaupungin tai kunnan GIS-osastolle shapefile-, GeoPackage-, GeoJSON- tai KML-muodossa projektin koordinaattijärjestelmän ruudukkokoordinaateissa.
keywords: gis, vienti, kml, kmz, google earth, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, putket, rakenteet, verkostot, kaupunki, kunta, ruudukko, maanpinta, epsg, prj
from: bba4fea5
---

Monet kaupungit ja kunnat pyytävät as-built-tietoja GIS-muodossa projektin päättyessä: missä putket ja rakenteet sijaitsevat, lopulliset tasaukset ja tien keskilinja. **GIS › Vie** kirjoittaa CivilCraftin tiedot GIS-tasoina, yksi kutakin kohdetyyppiä kohden.

## Ennen vientiä

1. Aseta projektin koordinaattijärjestelmä kohdassa {{ui:Koordinaatit}}. GIS-osasto tarvitsee tiedon siitä, missä luvut ovat; ilman järjestelmää tiedostot sisältävät projektin omat luvut, eivätkä ne nimeä mitään järjestelmää.
2. Tarkista maastomalli, linjaukset, alustat ja putkiverkko siinä muodossa, jossa haluat ne luovutettavan.
3. Kysy osastolta, mitä muotoa ja mitä koordinaattijärjestelmää he haluavat. Monet vaativat yhä shapefile-tiedostoja paikallisessa tasokoordinaattivyöhykkeessä; uudemmat järjestelmät ottavat GeoPackagen.

## Vienti

1. Napsauta **GIS**-ryhmän {{ui:Vie}}-painiketta.
2. Kohdassa **Mitä** valitse lähetettävät tyypit. Jokainen näyttää kohteidensa määrän; tyypit, joissa ei vielä ole mitään, ovat harmaina.
3. Kohdassa **Muodossa** valitse muoto.
4. Lue koordinaatteja ja yksiköitä koskevat huomautukset ja napsauta latauspainiketta. Tilarivi kertoo, mitä lähti mukaan ja mitkä kenttänimet lyhennettiin.

Valintaikkunassa on myös korkeusruudukon vienti ({{ui:Maastomalli GeoTIFF-korkeusruudukkona}}); ks. [Korkeusruudukot ja LiDAR](topic:elevation-grids-and-lidar).

## Mitä kukin tyyppi sisältää

| Tyyppi | Muoto | Kentät |
|---|---|---|
| Mittauspisteet | Pisteet korkeuden kanssa | `P` pistenumero, `N` pohjoinen, `E` itä, `Z` korkeus, `D` kuvaus |
| Nykyisen maanpinnan ja suunnitellun pinnan korkeuskäyrät | Viivat niiden korkeudella | `ELEV` |
| Taitelinjat | Viivat korkeuksilla | `NAME` |
| Pinnan reuna | Monikulmio (piirretty reuna, muuten pinnan reuna) | `NAME` |
| Linjaukset | Keskilinjat | `NAME`, `LENGTH`, `STA_START`, `STA_END` (paalut tavallisina lukuina) |
| Alustat | Monikulmiot alustan korkeudella | `NAME`, `ELEV`, `AREA` |
| Päivänvalolinjat | Viivat korkeuksilla (alustat ja käytävät) | `NAME` |
| Käytävän ominaisuuslinjat | Viivat korkeuksilla: keskilinja, päällysteen reunat, pientareet | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Putket | Viivat ylemmästä pohjan korosta alempaan | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (prosentteina), `LENGTH`, `NETWORK` |
| Rakenteet | Pisteet reunassa | `NAME`, `RIM`, `INVERT` (alin putken pohjan korko siinä), `SUMP`, `DIA`, `DIA_UNIT` |
| Kukin GIS-taso | Kuten tuotiin | Omat kentät |

Pituudet, paalut ja korkeudet ovat projektin yksiköissä (US survey feet tai metriä). Putkien ja rakenteiden halkaisijat ovat tuumina jalkaprojekteissa ja millimetreinä metriprojekteissa; `DIA_UNIT` kertoo, kumpi.

## Muodot

- **Shapefile**: yksi `.zip`, jossa on shapefile kutakin tyyppiä kohden (`.shp`, `.shx`, `.dbf`), `.cpg`, joka kertoo tekstin olevan UTF-8-muotoista, ja `.prj`, joka nimeää koordinaattijärjestelmän. Korkeuksilliset muodot kirjoitetaan shapefilen Z-tyyppeinä. Yli 10 merkin pituiset kenttänimet lyhennetään, kuten muoto vaatii, ja tilarivi luettelee ne.
- **GeoPackage**: yksi `.gpkg`-tiedosto, jossa on taulu kutakin tyyppiä kohden, ja koordinaattijärjestelmä tallennettuna EPSG-koodillaan. Yksi tiedosto useiden sijaan, pitkät kenttänimet säilyvät.
- **KML** tai **KMZ** (KML pakattuna): yksi tiedosto leveys- ja pituusasteina Google Earthille ja verkkokartoille, kansio kutakin tyyppiä kohden, jokainen kohde merkki (placemark), joka on nimetty NAME-kentästä ja jolla on kaikki kentät laajennettuina tietoina. Korkeudet ovat metreinä (korkeustila absoluuttinen). Kuten GeoJSON, tämä vaatii projektin koordinaattijärjestelmän.
- **GeoJSON**: yksi tiedosto leveys- ja pituusasteina (GeoJSON-standardi ei salli muuta), ja jokaisella kohteella on `kind`-ominaisuus (`pipes`, `structures`, …), jotta vastaanottaja voi jakaa ne. Korkeudet muunnetaan metreiksi, kuten standardi vaatii; ne pysyvät projektin pystysuuntaisessa vertausjärjestelmässä (CivilCraftissa ei ole geoidimallia). Projekti ilman koordinaattijärjestelmää ei voi viedä GeoJSONia, ja valintaikkuna kertoo syyn.

## Ruudukko, ei maanpinta

GIS-osastot pitävät tietonsa koordinaattijärjestelmän **ruudukko**koordinaateissa. Jos projektisi käyttää maanpinta- tai paikallisia koordinaatteja (asetettu kohdassa {{ui:Koordinaatit}}), jokainen koordinaatti muunnetaan takaisin ruudukkoon lähtiessään: tiedostojen luvut eroavat suunnitelman luvuista mittakaavakertoimellasi (ja kiertokulmalla paikallisessa järjestelmässä). Pistekentät `N` ja `E` sisältävät myös ruudukkoarvot. Valintaikkuna muistuttaa tästä.

:::tip
Lähetä tiedostojen mukana lyhyt saate: koordinaattijärjestelmä ja sen EPSG-koodi, korkeuksiesi pystysuuntainen vertausjärjestelmä, yksiköt ja mikä tiedosto on mistäkin.
:::

## Mitä tarkistettiin

- Jokainen kirjoitettu tiedosto luettiin takaisin GDAL:lla, kirjastolla, jota useimmat GIS-ohjelmat käyttävät: jokainen muoto, korkeus ja attribuutti, kohdemäärät sekä koordinaattijärjestelmä EPSG-koodina (`.prj` ja GeoPackage). Omat lukijamme lukivat ne takaisin samalla tavalla.
- GeoJSON-tiedostot noudattavat RFC 7946:ta: pituusaste ennen leveysastetta, ei `crs`-jäsentä, ulkorenkaat vastapäivään ja reiät myötäpäivään. Sijainnit täsmäsivät PROJ:iin 2 mm:n tarkkuudella.
- Maanpintakoordinaattiprojekti vietiin, ja jokainen piste tarkistettiin sen ruudukkokoordinaatteja vasten.
- Mitään tästä ei ole vielä avattu muissa GIS-ohjelmissa. Tarkista ensimmäinen toimitus osaston kanssa ennen kuin luotat siihen.
