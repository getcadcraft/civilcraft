---
title: Riippuma ja jännitys
summary: Kuormitustapauksesi (lämpötila, tuuli, jää) ja jännitysrajat, miten CivilCraft laskee kunkin osuuden jännityksen sekä vetotaulukot.
keywords: riippuma, jännitys, kuormitustapaus, lämpötila, tuuli, jää, epäsymmetrinen jää, ohjaava jänneväli, vastaava jänneväli, tilanmuutos, ketjukäyrä, vetotaulukko, murtolujuus, käyttöjännitys
from: f8876c35
---

## Kuormitustapaukset ja rajat

{{ui:Lisää}} › {{ui:Kuormitustapaukset ja rajat…}} muokkaa sääntöjä, joita jokainen linja projektissa noudattaa.

- **Kuormitustapaukset**: lämpötila, johtimeen kohdistuva tuulenpaine (Pa) ja säteittäinen jää (mm, tiheyden kanssa). Ensimmäinen tapaus on vertailukohta.
- **Jännitysrajat**: osuus johtimen murtolujuudesta, vaakajännityksen tai suurimman tuen jännityksen mukaan, yhdessä kuormitustapauksessa. Tai anna vaakajännitys itse.
- **Vapaaetäisyydet**: etäisyys, jonka johdin pitää maanpinnasta, tiestä, rakennuksesta ja muusta. Lisää, nimeä uudelleen ja poista niitä: ne ovat sinun. Niiden alapuolella valitse säännöt kohdille **Maisemakasvit linjan alla**, **Maisemamuurit linjan alla** ja **Maanalaiset risteykset**.
- **Tapaukset, joita tarkistukset käyttävät**: mikä tapaus antaa suurimman riippuman (kuuma), eristimen heilahduksen (tuuli), jään sekä jään yhdellä puolella tukea.
- **Kertoimet**: vaihevälikerroin k, suurin eristimen heilahdus, kerroin tuki- ja liitoskuormille, kulmat, jotka tekevät kulma- ja päätetuet, pienin peitesyvyys maakaapeleille sekä suurin jännitehäviö.

## Paketit: säännöt ja kirjasto maalle

CivilCraftiin ei ole sisäänrakennettu minkään maan sääntöjä. **Paketti** pitää sääntöjoukon ja kirjaston yhdessä tiedostossa (`.cclinepack.json`), maalle, verkkoyhtiölle tai yritykselle:

- **Tallenna pakettina…** kohdassa {{ui:Kuormitustapaukset ja rajat…}} kirjoittaa näkyvän sääntöjoukon ja kirjastosi (tai, kun kirjastossasi ei vielä ole mitään, tässä projektissa käytetyt kohteet). Kirjoita ensin **Maa tai alue**.
- **Avaa sääntöjoukko tai paketti…** lukee paketin, sääntötiedoston tai kirjastotiedoston. Paketin säännöt näkyvät ikkunassa (napsauta **Käytä**, jotta ne otetaan käyttöön), ja sen kohteet menevät kirjastoosi.
- Muiden jakamat paketit näkyvät lisäosasivulla kohdassa **Voimajohtopaketit**. Kaksi esimerkkipakettia näyttää muodon; ne eivät ole minkään maan sääntöjä.

Jokainen paketti tarkistetaan avattaessa, kuten mikä tahansa tiedosto. Tarkista jokainen arvo voimassa olevaan standardiin ennen kuin mitään rakennetaan.

Kaksi esimerkkisääntöjoukkoa on valmiina aloitettavaksi: **Esimerkki: kylmä ilmasto** ja **Esimerkki: lauhkea ilmasto**. Niiden luvut eivät tule mistään standardista: aseta arvot, jotka oma standardisi antaa. {{ui:Tallenna säännöt}} ja {{ui:Avaa säännöt…}} jakavat sääntöjoukon tiedostona.

## Miten jännitys lasketaan

Jokaiselle osuudelle päätetukien välillä:

1. **Ohjaava jänneväli** on √(ΣL³ ÷ ΣL) sen jänneväleistä.
2. Jokainen raja muutetaan vaakajännitykseksi vertailutapauksessa **tilanmuutosyhtälön** kautta ohjaavalla jännevälillä: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. Rajoittavin asettaa jännityksen.
3. Jokaisen kuormitustapauksen jännitys seuraa tästä, ja kunkin jännevälin muoto on tarkka **ketjukäyrä** sen kahden kiinnityspisteen kautta (myös rinteillä olevat jänneväli mukaan lukien): riippuma jänteestä, pituus ja jännitys kummassakin päässä.

Kuormitus metriä kohden tapauksessa: paino plus jää (jään pinta-ala × tiheys × g) pystysuunnassa; tuulenpaine × jäisen halkaisija vaakasuunnassa.

## Vetotaulukot

{{ui:Lisää}} › {{ui:Vetotaulukot…}} listaa jokaisen osuuden vaakajännityksen ja jokaisen jännevälin riippuman jokaisessa säännöjoukon lämpötilassa (aluksi −5 °C … 40 °C, 5 °C välein), tyynessä säässä. Tallenna ne sekä tukitaulukko CSV-muodossa.

Ei lasketa mukaan: johtimen virumista vuosien kuluessa eikä uuden johtimen venymää. Lisää ne lämpötiloihin, joissa vedät johtimen.
