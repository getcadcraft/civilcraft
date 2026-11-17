---
title: Yksiköt, paalut ja lukumuodot
summary: Jalka- ja metriprojektit sekä se, miten paalut, kaltevuudet, luiskat, suuntakulmat, pinta-alat, tilavuudet ja putkikoot kirjoitetaan ja syötetään, sekä mitä yksikön vaihtaminen tekee.
keywords: pituuden kirjoittaminen, laskenta, laskin, summa, murtoluku, jalat ja tuumat, 4+7/16, yksiköt, jalat, US survey -jalat, metrit, metrinen, imperiaalinen, paalumuoto, paalutus, kaltevuus, prosentti, luiska, h:v, suuntakulma, kuutiojardit, halkaisija
from: 0b9b5b6b
---

## Projektin yksiköt

Projekti on yksikössä **US feet** tai **metri** (**Yksiköt** vasemmassa paneelissa). Kaikki projektin koordinaatit, korkeudet, pituudet ja paalut ovat tässä yksikössä.

:::warning
**Yksiköiden** (**Yksiköt**) vaihtaminen muuttaa tunnisteet, paalumuodon, oletukset ja tiedostojen kirjoitustavan. Se **ei** muunna yhtään lukua. Jaloissa mitattu kohde, joka vaihdetaan metreiksi, säilyttää samat luvut, mutta niitä luetaan nyt metreinä. Tilarivi sanoo: ”Yksiköt ovat nyt metrit. Koordinaatteja ei muunnettu.” Aseta yksiköt vastaamaan aineistoasi ennen suunnittelua.
:::

Mihin yksiköt vaikuttavat:

| | US feet | Metrit |
|---|---|---|
| Paalumuoto | `12+34.56` (100 ft:n paalut) | `1+234.567` (1000 m:n paalut) |
| Tarjotut korkeuskäyrävälit | 0.25–20 ft | 0.1–10 m |
| Pinta-ala | sq ft | sq m |
| Tilavuus | cu yd | cu m |
| Putken ja rakenteen halkaisija | inches | millimetrit |
| Oletuskaarteen säde | 100 ft | 30 m |
| Paaluviivat suunnitelmalla | joka 50 ft, tunnisteet joka 100 ft | joka 20 m, tunnisteet joka 100 m |
| Plottauksen mittakaavat | 1" = 5' – 1" = 1000' | 1:50 – 1:10000 |
| LandXML:n pituusyksikkö | USSurveyFoot | meter |

Uusi projekti alkaa jaloissa tai metreissä, jos pituusyksikkö, joka on merkitty tähdellä kohdassa {{ui:Asetukset}} › {{ui:Yleiset}} › {{ui:Yksiköt}}, on metrinen. **Yksiköt**-luettelo näyttää siellä käytössä olevat yksiköt ja aina projektin omat. Jos siellä on merkitty pinta-ala- tai tilavuusyksikkö (acres, hectares, acre-feet …), pinta-alat ja tilavuudet raportoidaan siinä edellisen taulukon sijaan. Katso [Yksiköt, kirjoitetut arvot ja yksikköluettelot](common:unit-lists).

Kun avaat LandXML-tiedoston, projekti ottaa tiedoston yksiköt. Kansainvälisissä jaloissa oleva tiedosto avautuu jalkaprojektina; lukuja ei muuteta.

## Pituuksien ja summien kirjoittaminen

Mikä tahansa kenttä, johon syötetään pituus tai korkeus, lukee muutakin kuin pelkän luvun: paina {{key:Enter}}, ja kenttä näyttää tuloksen projektin yksiköissä.

| Kirjoitat | Jaloissa olevassa projektissa | Metrisessä projektissa |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | samat pituudet metreinä |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | jalkoina | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, muut US survey feet -jaloissa | samat pituudet metreinä |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | summa jalkoina | summa metreinä |

Jokainen yhteisestä yksikkötaulukosta löytyvä pituusmerkki toimii tarkalla koollaan: projektin jalat ovat US survey feet -jalkoja, joten `10 US ft` on 10 ja `3 ch` (kansainvälisen jalan ketju) on 197.9996. Käytä `+ - * /` ja sulkeita sekä `abs`, `round`, `ceil` ja `floor`. Pituuteen kirjoitettu viiva kuuluu siihen (`24'-6"`, `6-1/2`); kun välilyönnit ympäröivät sen, se vähentää (`24' - 6"` = 23.5 ft). Pelkkä luku kertoo tai jakaa pituuden, ja se on pituus projektin yksiköissä, kun se lisätään pituuteen. Jos CivilCraft ei ymmärrä kirjoittamaasi, kenttä merkitään ja tilarivi kertoo, missä.

Paalut eivät ole summia: `10+00` paalukentässä on paalu 10+00. Prosentteina annetut kaltevuudet, pistenumerot ja kuvaukset luetaan sellaisinaan.

## Paalut

Paalu on etäisyys linjauksen varrella, kirjoitettuna plusmerkillä:

- Jalat: plusmerkkiä edeltävä osa on satoja jalkoja. `12+34.56` on 1,234.56 ft.
- Metrit: plusmerkkiä edeltävä osa on tuhansia metrejä. `1+234.567` on 1,234.567 m.
- Negatiiviset paalut säilyttävät merkin edessä: `-0+50.00`.

Missä tahansa paalua kirjoitat (**Aloituspaalu**, PVI:n **Paalu**), voit kirjoittaa sen plusmerkillä (`12+34.56`) tai pelkkänä lukuna (`1234.56`). Välilyönnit jätetään huomiotta.

## Kaltevuudet ja luiskat

- **Kaltevuudet** (profiilit, putket, ajoradan ja piennarten kaltevuudet) ilmaistaan prosentteina: `+1.25%` nousee paalun kasvusuuntaan, `-0.50%` laskee.
- **Sivuluiskat** (tasanteen leikkaus ja täyttö, käytävän leikkaus ja täyttö) ilmaistaan vaakasuoraan pystysuoraan: `3` tarkoittaa 3 : 1, eli kolme vaakasuoraan yksi ylös tai alas.
- Pystykaaren **K** on sen pituus jaettuna kaltevuuden muutoksella prosentteina.

## Suuntakulmat ja kulmat

Suuntakulmat ovat neljännesuuntakulmia asteina, minuutteina ja sekunteina: `N 63°12'05" E`. Kaarien kääntökulmat (Δ) käyttävät samoja asteita, minuutteja ja sekunteja, sanoilla ”vasen” tai ”oikea”.

## Siirtymät

Siirtymät linjauksesta ovat sen suorassa kulmassa olevia etäisyyksiä, merkittyinä **L** (vasen) tai **R** (oikea) katsottaessa paalun kasvusuuntaan.

## Lukujen näyttö

- Koordinaatit ja korkeudet näkyvät kahdella desimaalilla paneeleissa ja tilarivillä (valitulle pisteelle kolme).
- Pinta-alat ja tilavuudet ryhmitellään tuhansittain: `128,250 sq ft`, `454.9 cu yd`.
- Koordinaatteja ei ryhmitellä koskaan, joten ne voi kopioida sellaisinaan.

## Koordinaatit

CivilCraft toimii tasaisessa tasossa: itä oikealle, pohjoinen ylös. Suunnittelu tehdään aina projisoiduissa koordinaateissa (valtiotaso, UTM tai paikallinen ruudukko). Voit kertoa CivilCraftille, missä koordinaattijärjestelmässä ne ovat, ja onko kyse ruudukko-, maanpinta- vai paikallisista koordinaateista; sen jälkeen se näyttää leveys- ja pituuspiirin ja sijoittaa GIS-tiedostot ja karttatasot, mutta se ei koskaan muuta yksiköitä eikä siirrä koordinaattejasi itse. Katso [Aseta projektin koordinaattijärjestelmä](topic:coordinate-systems) ja [Maanpinta- ja paikalliset koordinaatit](topic:ground-and-local-coordinates). Suuret valtiotason koordinaattiarvot (miljoonia jalkoja) käyvät; CivilCraft työskentelee sisäisesti kohteen suhteen tarkkuuden säilyttämiseksi.
