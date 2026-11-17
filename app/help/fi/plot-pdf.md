---
title: Plottaa suunnitelma PDF-muotoon
summary: Plottaa kaikki tai nykyinen näkymä vektori-PDF-tiedostoksi standardikoossa insinööri- tai metrimittakaavassa, tason väreillä tai mustana.
keywords: plottaus, tulostus, pdf, arkki, mittakaava, paperikoko, suunnitelmaarkki, julkaisu, piirustusotsikko, pohjoisnuoli, mittakaavapalkki
from: 9af396ca
---

{{ui:PDF}} plottaa suunnitelman vektori-PDF-tiedostoksi yhdelle arkille, jossa on otsikkokaista, pohjoisnuoli ja mittakaavapalkki. PDF tehdään selaimessa ja ladataan. Se ei kulje selaimen tulostusikkunan kautta.

## Plottaa

1. Aseta suunnitelma kohdassa **Näyttö**: näytettävä maastomalli, korkeuskäyrien väli ja mitkä asiat ovat päällä. Plotti noudattaa näitä asetuksia.
2. Jos haluat vain osan kohteesta, zoomaa ja panoroi suunnitelma siihen.
3. Klikkaa {{ui:PDF}} **Vienti**-ryhmässä tai paina {{key:Mod+P}}. Avautuu **Plottaa suunnitelma PDF-muotoon** -valintaikkuna.
4. Valitse **Alue**: {{ui:Kaikki}} tai {{ui:Se, mikä on näytöllä}}.
5. Valitse **Paperi**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 tai A1. Jalkamitoin tehty projekti alkaa Tabloidilla, metrimitoin tehty A3:lla. Arkit ovat aina vaakasuunnassa.
6. Valitse **Mittakaava**. Luettelo merkitsee suurimman mittakaavan, joka mahtuu, merkinnällä "(mahtuu)" ja valitsee sen.
   - Jalat: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Metrit: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Valitse **Muste**: {{ui:Tasojen värit}} tai {{ui:Musta}}.
8. Lue valintojen alla oleva rivi. Se kertoo alueen koon paperilla ja arkin koon, esimerkiksi "Alue on 297 × 222 mm mittakaavassa 1" = 40' 432 × 279 mm:n arkilla (vaaka)."
9. Klikkaa {{ui:Lataa PDF}}.
   Selain lataa tiedoston `<name>.pdf`. Tilarivi kertoo "Plotattu <name>.pdf mittakaavassa 1" = 40'."

Jos alue on suurempi kuin arkki valitsemassasi mittakaavassa, plotti keskitetään ja reunat leikkautuvat pois. Valitse mittakaava, jonka kohdalla on merkintä "(mahtuu)", tai suurempi arkki.

## Mitä arkilla on

- Suunnitelma keskitettynä piirtoalueelle aitoina vektoreina: korkeuskäyrät, tunnisteet, linjaukset paaluvälityksineen, käytävät, tasanteet ja rajaviivat, putket, pisteet.
- Viivanpaksuudet tasoittain: linjaukset, tasanteet ja putket paksummin, kolmiot ja ohuet korkeuskäyrät ohuesti.
- Otsikkokaista alareunassa, jossa ovat projektin **Nimi**, mittakaava, merkintä korkeuskäyräväliltä ja se, mikä pinta on kyseessä (nykyinen vai suunniteltu), sekä oikealla päivämäärä ja koontiversio.
- Pohjoisnuoli oikeassa yläkulmassa (suunnitelman pohjoinen on ylhäällä) ja mittakaavapalkki otsikkokaistassa.
- Suunnitelman alla näkyvät karttatasot (kuva, karttalaatat tai karttapalvelu), kun **Karttatasot suunnitelman alla** on valittuna. Ne piirretään yhtenä kuvana koko piirtoalueesta 150 dpi:llä, viivojen alle, ja kartan lähdemerkintä menee otsikkokaistaan. CivilCraft odottaa enintään 8 sekuntia karttakuvia, jotka vielä saapuvat. Jos joitakin puuttuu, tilarivi kertoo siitä.

Teksti käyttää PDF:n sisäänrakennettua Helvetica-fonttia. Länsieurooppalaisen merkistön (Windows-1252) ulkopuoliset merkit tulostuvat "?"-merkkeinä, ja tilaviesti laskee ne.

## Mitä ei plotata

- Korkeusvyöhykkeet.
- Pituusleikkausnäkymä. Pituusleikkausten plottaus ei ole vielä saatavilla.
- Useampi kuin yksi arkki (linjaukselle käytä [pohjakuva- ja pituusleikkausarkkeja](topic:plan-profile-sheets)), näkymäruudut, mukautettu piirustusotsikko tai pystysuuntaiset arkit.

:::note
Valintaikkuna kertoo, että kaltevuusnuolet näkyvät vain näytöllä. Tässä versiossa **Näyttö**-kohdassa päälle kytketyt kaltevuusnuolet plotataan (ja viedään DXF-tiedostoon). Kytke ne pois ennen plottausta, jos et halua niitä.
:::

## Tulostus paperille

Avaa ladattu PDF millä tahansa PDF-katseluohjelmalla ja tulosta se 100 %:n (todellinen koko) kokoisena, jotta mittakaava pysyy oikeana. "Sovita sivulle" muuttaa mittakaavan.
