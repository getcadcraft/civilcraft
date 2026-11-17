---
title: Aseta projektin koordinaattijärjestelmä
summary: Kerro, missä koordinaattijärjestelmässä mittaus on, jotta CivilCraft näyttää leveys- ja pituusasteet, sijoittaa GIS-tiedostot ja karttatasot sekä kirjoittaa .prj-tiedostot. Valitse koodin, nimen, koordinaattien itsensä tai .prj-tiedoston perusteella.
keywords: koordinaattijärjestelmä, crs, epsg, srid, state plane, spcs, utm, nad83, wgs 84, projektio, prj, wkt, datum, leveysaste, pituusaste, lat long, maantieteellinen, ruudukko, georeferointi, georeferoida, koordinaattijärjestelmän asettaminen
from: 964250e2
---

Projektin koordinaatit ovat pelkkiä lukuja, kunnes kerrot, mitä ne tarkoittavat. Koordinaattijärjestelmän asettaminen **ei siirrä mitään**: se kertoo CivilCraftille, että esimerkiksi E 6,150,000 N 2,080,000 ovat Kalifornian vyöhykkeen 6 state plane -koordinaatteja US survey feet -yksiköissä. Kun CivilCraft tietää tämän:

- tilarivi näyttää osoittimen leveys- ja pituusasteen,
- muihin järjestelmiin kuuluvat GIS-tiedostot (shapefile, GeoJSON, GeoPackage, korkeusruudukot, LiDAR) muunnetaan projektiin avattaessa,
- karttatasoja voidaan piirtää suunnitelman alle ([Näytä karttatasot suunnitelman alla](topic:map-layers)),
- GIS-muotoihin tehtävät viennit sisältävät järjestelmän (shapefile-tiedostolle `.prj`, GeoPackagelle ja GeoTIFFille EPSG-koodi).

## Valitse järjestelmä

1. Valitse työkalurivin ryhmästä {{ui:GIS}} kohta {{ui:Koordinaatit}}. Avautuu valintaikkuna **Koordinaattijärjestelmä**. Sen yläosassa kerrotaan, missä järjestelmässä projekti on nyt, tai **Ei mitään — koordinaatit ovat pelkkiä lukuja**.
2. Etsi järjestelmä jollakin seuraavista tavoista:
   - **Haku**: kirjoita EPSG-koodi (`2277`, `EPSG:2277`) tai sanoja järjestelmän nimestä (`texas central`, `utm 14n`, `lambert-93`). Koodihaku listaa kirjoittamasi koodin alkaen; sanahaku listaa järjestelmät, joiden nimessä esiintyvät kaikki sanat.
   - {{ui:Järjestelmät, joihin nämä koordinaatit sopivat}} (kun projektissa on pisteitä tai maastomalli): CivilCraft lukee projektisi keskikohdan jokaisesta projektin yksikköperheen järjestelmästä ja listaa ne, joiden käyttöalue sisältää sen. State plane -koordinaatit sopivat yleensä vain muutamaan vyöhykkeeseen: Texasissa oleva projekti kohdassa E 3,115,000 N 10,070,000 US survey feet sopii neljään Texas Central -muunnelmaan (NAD83, NAD83(2011), HARN, NSRS2007). Jokainen merkintä näyttää, mihin projektisi keskikohta osuisi.
   - **Lähellä (leveys, pituus)** ja {{ui:Ehdota}}: kirjoita, missä kohde sijaitsee, esimerkiksi `30.27, -97.74` tai `30°16′N 97°44′W`, ja CivilCraft listaa tasoprojektiot, joiden alue sisältää sen. Valtakunnalliset ja osavaltioiden ruudukot tulevat ensin.
   - {{ui:Lue .prj-tiedosto…}}: avaa shapefile-tiedoston tai piirustuksen mukana tullut `.prj`. CivilCraft vertaa sitä listaansa projektiolaskennan perusteella (joten `.prj`, joka nimeää datumin toisin, löytää silti oikean järjestelmän) ja kertoo, mikä järjestelmä se on. Jos mikään ei täsmää tarkasti, käytetään tiedoston omaa kuvausta. Voit myös pudottaa `.prj`-tiedoston valintaikkunaan tai avata tai pudottaa sellaisen suunnitelmalle yksinään.
3. Napsauta järjestelmää luettelossa. Kohdassa **Valittu** näkyvät nimi, EPSG-koodi, yksikkö, se, kuinka hyvin sen datum on sidottu WGS 84:ään, käyttöalue leveys- ja pituusasteina sekä se, mihin projektisi keskikohta siinä osuu.
4. Jätä **Ruudukko** valituksi (useimmissa projekteissa; muista katso [Maanpinta- ja paikalliset koordinaatit](topic:ground-and-local-coordinates)) ja valitse {{ui:Käytä}}.

Tilarivi näyttää nyt osoittimen leveys- ja pituusasteen E- ja N-arvojen vieressä. Järjestelmän asettaminen on yksi kumoamisvaihe: {{key:Mod+Z}} kumoaa sen.

:::note
Yksiköiden on täsmättävä: jalkoina mitattu projekti hyväksyy järjestelmiä US survey feet tai kansainvälisissä jaloissa, metreinä mitattu projekti järjestelmiä metreissä. CivilCraft selittää hylkäyksen (”The project is in feet but this system is in meters…”). Projekti jaloissa, jonka järjestelmä on US survey foot -järjestelmä, käyttää survey-jalkoja: projektin ”ft” tarkoittaa järjestelmän jalkaa. Maantieteellisiä järjestelmiä (leveys- ja pituusasteet, kuten WGS 84 itse) ei voi käyttää projektin järjestelmänä: piirustukset tarvitsevat itä- ja pohjoiskoordinaatit.
:::

## Vaihda tai poista järjestelmä

Avaa {{ui:Koordinaatit}} uudelleen, valitse toinen järjestelmä ja valitse {{ui:Käytä}}. Kun projektissa on pisteitä tai suunnitelma, CivilCraft kysyy **Ovatko koordinaatit jo järjestelmässä … ?**

- {{ui:Kyllä — mikään ei siirry}}: luvut pysyvät ennallaan ja vain niiden merkitys muuttuu. Käytä tätä, kun vanha järjestelmä valittiin vahingossa.
- {{ui:Ei — muunna ne}}: jokainen mittauspiste, taitelinja, raja, linjauksen PI, alustan kulma ja rakenne muunnetaan vanhasta järjestelmästä uuteen yhdellä kumoamisvaiheella. LandXML:stä kolmioina luettua maastomallia ei voi muuntaa; rakenna se ensin uudelleen pisteistä.

{{ui:Poista järjestelmä}} poistaa järjestelmän (mikään ei siirry). Projektissa jo olevat GIS-tasot pysyvät paikoillaan.

## Leveys- ja pituusaste tilarivillä

Kun projektilla on järjestelmä, tilarivi näyttää osoittimen leveys- ja pituusasteen WGS 84:ssä, esimerkiksi `30°18′00.00″ N  97°42′00.00″ W`. Valitse sen sijaan desimaaliasteet kohdasta {{ui:Asetukset}}, {{ui:CivilCraft}}, **Leveys- ja pituusaste** ([CivilCraft-asetukset](topic:settings)). Maanpinta- tai paikallisilla koordinaateilla lukema kulkee ensin tämän vaiheen kautta, joten se on oikein osoittimen alla olevalle pisteelle.

## Kuinka hyvä datumsiirto on

Leveys- ja pituusaste, GeoJSON ja karttatasot ovat kaikki WGS 84:ssä. Jokaisen järjestelmän sidonta WGS 84:ään näkyy valintaikkunassa:

| Valintaikkunan teksti | Mitä se tarkoittaa |
|---|---|
| WGS 84 itself | Ei siirtoa lainkaan. |
| NAD83 is taken as WGS 84 | Kaksi eroaa useimmilla Pohjois-Amerikan alueilla metrin tai kaksi, enintään muutama metri. Hyvä karttatasoihin ja kohteen ympäristöön; ei mittausverkon ohjauspisteisiin. |
| Known to about *n* m (EPSG's figure) | Julkaistu siirto; karttatasot ja GeoJSON voivat olla pois noin tämän verran. |
| Not known for this datum | Ilman ruudukkotiedostoa ei ole julkaistua siirtoa: karttatasot ja GeoJSON voivat olla pois satoja metrejä. |
| From the grid shift file … | Siirtotiedosto on käytössä (alla): noin 10 cm:n tarkkuudella NAD83:een ruudukon sisällä. |

Projektisi omat koordinaatit eivät koskaan kulje datumsiirron kautta; siirron läpi kulkee vain se, mikä muunnetaan leveys- ja pituusasteeksi tai sieltä pois. Pystydatumeja ja geoidimalleja ei käsitellä (korkeuksia ei muunneta koskaan). Jos paras siirto vaatii ruudukkotiedoston, luettelo sisältää karkeamman julkaistun siirron, ja valintaikkuna näyttää sen tarkkuuden (esimerkiksi NAD27-järjestelmät noin 20 m), kunnes lisäät ruudukon.

## Ruudukon siirtotiedostot

NAD27-järjestelmälle koordinaattijärjestelmän valintaikkunan **Ruudukon siirtotiedosto** tuo leveys- ja pituusasteet, GIS-tiedostot ja karttatasot noin 10 cm:n tarkkuudelle NAD83:een noin 20 m:n sijaan:

- **Lataa** järjestelmän alueelle ehdotettu ruudukko (NADCON5 Yhdysvaltojen mantereelle, NADCON Alaskalle, NTv2 Kanadalle) palvelimelta cdn.proj.org, PROJ:n julkiselta ruudukkopalvelimelta. Lähetetään vain ruudukkotiedoston nimi.
- Tai **Lisää ruudukkotiedosto…**, jos sinulla on jo sellainen: NTv2 (`.gsb`) tai PROJ GeoTIFF -ruudukko (`.tif`), enintään 20 Mt.

Ruudukko tallennetaan projektitiedostoon, joten se kulkee projektin mukana. Osio kertoo, onko projektin keskikohta ruudukon sisällä: sen ulkopuolella siirtoa ei sovelleta lainkaan, joten käytä ruudukkoa, joka kattaa kohteen. **Lopeta ruudukon käyttö** palaa karkeaan siirtoon. Jokainen muutos on yksi vaihe: {{key:Mod+Z}} kumoaa sen.

Projektissa jo olevat GIS-tasot pysyvät paikoillaan, kun ruudukko vaihtuu; tuo ne uudelleen, jotta ne sijoittuvat ruudukon kautta. Projektin omat koordinaatit eivät siirry koskaan.

## Mitä on tarkistettu

- Jokaista muunnosta verrattiin PROJ-kirjastoon (pyproj 3.7.1 ja PROJ 9.5.1), koordinaattikirjastoon, jota useimmat GIS-ohjelmat käyttävät, yli 330 järjestelmässä: state plane US survey feet- ja feet-yksiköissä, UTM pohjoinen ja etelä, Lambert-93, British National Grid, GDA2020 MGA, New Zealand Transverse Mercator ja web-Mercator muiden joukossa. Itä- ja pohjoiskoordinaatit täsmäävät 1 cm:n tarkkuudella samalla datumsiirrolla (useimmat alle 1 mm:n tarkkuudella), ja projektiolaskenta täsmää PROJ:n omien määritelmien kanssa 1 cm:n tarkkuudella.
- PROJ:n kirjoittamat `.prj`-tiedostot molemmissa yleisissä muodoissa (ESRI ja OGC) luettiin takaisin 105 järjestelmälle: 208 kahdestä 210:stä vastasi tarkalleen omaa EPSG-koodiaan ja kaksi muuta samaa projektiolaskentaa samalla ellipsoidilla käyttävää järjestelmää. CivilCraftin kirjoittamat `.prj`-tiedostot PROJ lukee samaksi järjestelmäksi. ESRI-muotoisia `.prj`-tiedostoja napaisille stereografisille järjestelmille (UPS, Alaskan napa) ei voi lukea; valitse nämä järjestelmät koodilla.
- Tilarivin leveys- ja pituusaste täsmäsi PROJ:n kanssa 0.01″:n tarkkuudella selaimessa.
