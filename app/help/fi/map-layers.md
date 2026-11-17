---
title: Karttatasot suunnitelman alla
summary: Georeferoitu kuva, karttalaatat, WMS- tai WMTS-palvelin tai karttapalvelu suunnitelman alle kohdealueen taustaksi, internet-asetus, läpinäkyvyys, järjestys ja lähdemerkintä.
keywords: karttatasot, taustakartta, pohjakartta, taustakuva, ilmakuva, ortokuva, kuvamateriaali, satelliitti, rasteri, maailmatiedosto, pgw, jgw, tfw, wld, geotiff, georeferoitu kuva, xyz, laatat, wms, wmts, getcapabilities, karttapalvelu, rest, mapserver, imageserver, usgs, national map, lähdemerkintä, läpinäkyvyys
from: 32d7718e
---

Karttatasot ovat kuvia, jotka piirretään suunnittelun alle: ilmakuva maailmatiedostoineen tai internetin palvelimien karttoja. Ne ovat kohdealueen taustaa vain näytöllä. Ne eivät kuulu PDF-tulosteisiin, DXF- tai DWG-vientiin eikä 3D-näkymään.

Valitse {{ui:Kartta}} ryhmästä {{ui:GIS}}. **Karttatasot**-valintaikkuna listaa projektin tasot ja lisää uusia. Karttatasot tarvitsevat projektin koordinaattijärjestelmän ([Aseta projektin koordinaattijärjestelmä](topic:coordinate-systems)), paitsi kuva, jonka maailmatiedosto käyttää projektin omia koordinaatteja.

## Internet-asetus

CivilCraft ei pyydä karttapalvelimilta mitään ennen kuin sallit sen: {{ui:Asetukset}}, {{ui:CivilCraft}}, **Karttatasot internetistä**: **Pois** (oletus) tai **Päällä**.

:::note
Kun asetus on päällä, CivilCraft pyytää lisäämiltäsi karttapalvelimilta kuvia näytöllä olevasta alueesta. Piirustuksesi pysyy tällä tietokoneella. Palvelin näkee alueen ja internet-osoitteesi.
:::

Kun asetus on pois päältä, internet-tasot luetellaan valintaikkunassa harmaana syineen, eikä mitään piirretä eikä pyydetä. Projektin avaaminen, jossa on nimettyjä karttapalvelimia, ei myöskään ota niihin yhteyttä. Tiedostosta tuleva kuva toimii kummin päin tahansa. Valintaikkunan painike {{ui:Avaa Asetukset}} vie sinut asetuksiin.

## Georeferoitu kuva (toimii offline-tilassa)

1. Kohdassa **Lisää taso** säilytä **Georeferoitu kuva** ja valitse tiedostot: kuva (PNG tai JPEG) **yhdessä** sen maailmatiedoston kanssa (`.pgw` PNG:lle, `.jgw` JPEG:lle tai `.wld`) ja, jos sellainen on, sen `.prj`. Voit myös pudottaa ne suunnitelmalle yhdessä.
2. Ilman `.prj`-tiedostoa CivilCraft kysyy, mitä järjestelmää maailmatiedosto käyttää: {{ui:Projektin järjestelmä}} (yleisin), {{ui:Valitse järjestelmä…}} tai projektissa ilman järjestelmää **Projektin koordinaatit**.
3. Kuva näkyy suunnitelman alla, ja {{ui:Sovita}} sisällyttää sen.

RGB GeoTIFF (ilmakuva tallennettuna GeoTIFF-muotoon) kantaa mukanaan oman sijoituksensa ja järjestelmänsä: avaa se omana tiedostonaan. Kuva tallennetaan **projektitiedoston sisään** (enintään 25 MB). Suurempi hylätään kokonsa kanssa, joten tallenna pienempi kopio (vähemmän pikseleitä tai JPEG).

## Laatat, WMS, WMTS ja karttapalvelut

Ota ensin käyttöön **Karttatasot internetistä**. Sitten kohdassa **Lisää taso**:

| Mistä | Mitä liittää | Mitä CivilCraft tekee |
|---|---|---|
| Laatta-URL | Malli, jossa on `{z}`, `{x}` ja `{y}` (tai `{-y}`) sekä `{s}` palvelimen kirjaimelle, esimerkiksi `https://tile.example.org/{z}/{x}/{y}.png`. Anna sille nimi ja lähdemerkintä. | Laatat web Mercator -projektiossa alueelle ja näytön zoomille. |
| WMS-palvelin | Palvelimen osoite tai sen GetCapabilities-linkki. Valitse {{ui:Hae tasot}} ja sitten taso. | Yksi kuva näytöllä olevasta alueesta, pyydettynä projektin EPSG-koodilla, kun palvelin sen tarjoaa, muuten web Mercatorissa tai WGS 84:ssä. |
| WMTS-palvelin | Palvelimen osoite tai sen `WMTSCapabilities.xml`. Valitse {{ui:Hae tasot}} ja sitten taso ja laattamatriisijoukko. | Laatat joukosta projektin järjestelmässä, kun sellainen on, muuten web Mercatorissa. |
| ArcGIS-karttapalvelu (REST) | Osoite, joka päättyy `/MapServer` tai `/ImageServer`. Valitse {{ui:Lue palvelu}}. | Välimuistitetut web Mercator -palvelut piirretään laatoistaan. Muut pyydetään yhtenä kuvana näytöllä olevasta alueesta. |

Palvelimia ei ole valmiiksi asetettu. Julkisia esimerkkejä, kaikki USGS National Map -palvelusta (julkinen alue):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Karttapalvelu: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (ilmakuville myös `USGSImageryOnly`)

Monet kaupunkien ja kuntien GIS-yksiköt julkaisevat omia WMS- tai karttapalveluitaan. Niiden GIS-sivut kertovat osoitteen. Palvelin, joka pyytää kirjautumista tai avainta, ei toimi: CivilCraft ei lähetä käyttäjätunnuksia, salasanoja eikä avaimia.

## Miten tasot piirretään

- Kuvat toisessa järjestelmässä kuin projektin järjestelmässä muunnetaan siihen: kuva leikataan paloiksi, ja jokainen sijoitetaan niin, että se on neljänneksen näyttöpikselin sisällä siitä, minne tarkka muunnos sen sijoittaisi.
- Laatat valitaan näytöllä olevalle alueelle ja zoomille: enintään 64 yhdelle näkymälle, 6 kerrallaan. Kun siirryt tai zoomaat, vanhan näkymän pyynnöt perutaan. Noin 200 laattaa pidetään muistissa. Mitään ei tallenneta levylle.
- WMS- tai karttapalvelukuva pyydetään, kun näkymä on lakannut liikkumasta. Siihen asti viimeisin kuva pysyy paikallaan.
- Kunkin tason lähdemerkintä näkyy pienenä suunnitelman oikeassa alareunassa.

## Muuta, järjestä ja poista tasoja

Valintaikkunassa jokaisella tasolla on valintaruutu näyttämistä tai piilottamista varten, **Läpinäkyvyys**-liukusäädin, nuolet piirtämiseen aiemmin (alemmas) tai myöhemmin (päälle), zoomauspainike (kuvat) ja poistopainike. Luettelon ensimmäinen taso piirretään alimmaksi. Jokainen muutos on yksi kumoamisvaihe.

## Kun taso ei näytä mitään

Syy näkyy kerran tilarivillä ja jää tason nimen alle valintaikkunassa:

| Viesti | Mitä tehdä |
|---|---|
| Pois: karttatasot internetistä ovat pois päältä asetuksissa. | Ota **Karttatasot internetistä** päälle. |
| Vaatii projektin koordinaattijärjestelmän | Aseta se kohdasta {{ui:Koordinaatit}}. |
| Palvelin ei sallinut tämän sivun käyttää sen kuvia (CORS), tai siihen ei saatu yhteyttä. | Palvelin ei anna verkkosivujen käyttää kuviaan, tai se on alhaalla. Neljän hylkäyksen jälkeen CivilCraft lopettaa pyytämisen. Piilota ja näytä taso yrittääksesi uudelleen. |
| Palvelin vastasi 404 … / Palvelin lähetti text/xml:n, ei kuvaa: … | Osoite, taso tai tyyli on väärin, tai palvelimen viesti kertoo, mitä se haluaa. |
| Tätä tasoa ei tarjota projektin järjestelmässä, web Mercatorissa eikä WGS 84:ssä | Palvelin ei voi piirtää sinne, minne CivilCraft voi sijoittaa sen. |

## Mitä tarkistettiin

- Laattanumerot tarkistettiin vakiomuotoisen web Mercator -laatoituksen mukaan. WMS 1.1.1 ja 1.3.0, WMTS ja karttapalvelun vastaukset luettiin käsin kirjoitetuista tiedostoista sekä USGS National Map -palvelun ja terrestris OpenStreetMap -palvelimien tallennetuista oikeista vastauksista. WMS 1.3.0 -pyynnöt asettavat leveyspiirin ensin EPSG:4326:lle, kuten standardi sanoo.
- Muunnosta verrattiin tarkkaan pikselikohtaiseen muunnokseen PROJin lukuarvoilla: 0,13 px sisällä laatoille, WMS-kuville ja kuntakokoiselle kuvalle, kohdemittakaavassa ja loitonnettuna.
- Maailmatiedostolla varustettu kuva ja GDALin (rasterion kautta) kirjoittama RGB GeoTIFF piirrettiin sinne, minne niiden sijoitus osoittaa. Tarkistettiin pikseli pikseliltä selaimessa.
- Selaimessa testikoneella olevaa vastinepalvelinta vastaan: laatat osuivat laattaan, jonne PROJ sijoittaa kunkin pisteen. WMS-kuva osui 2 px:n sisään. Enintään 6 pyyntöä kulki kerrallaan. Kun asetus oli pois, mikään pyyntö ei lähtenyt sivulta. USGS National Map -karttapalvelu luettiin ja piirrettiin kerran live selaimessa (laatat saapuivat ja piirtyivät, ja sen tekijänoikeusteksti näkyi). Muut julkiset palvelimet luettiin vain tallennetuista vastauksista.
