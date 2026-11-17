---
title: CivilCraftin asetukset
summary: Valitse kopioitujen ja liitettyjen pisterivien sarakejärjestys sekä tiedoston sarakkeiden arvaus, miten liitetyt pisteet numeroidaan, mitä pistetunnisteet näyttävät, kulmanäyttö, 3D:n pystysuuntainen liioittelu, miten leveys- ja pituuspiiri näkyvät sekä ladataanko karttatasot internetistä.
keywords: asetukset, mieltymykset, PNEZD, PENZD, sarakejärjestys, pisterivit, uudelleennumerointi, pistenumerot, aloitusnumero, pistetunnisteet, tunnisteet, kuvaus, korkeus, näkymäkuutio, akselikuvake, kulmanäyttö, kompassi, pystysuuntainen liioittelu, 3D, leveyspiiri, pituuspiiri, DMS, desimaaliasteet, karttatasot, internet, yksityisyys
from: 64b9cb92
---

Avaa {{ui:Asetukset}} sovelluspalkin rattaasta tai {{key:Mod+,}}. Ensimmäisessä välilehdessä, {{ui:CivilCraft}}, ovat tälle sovellukselle kuuluvat asetukset; {{ui:Yleiset}} sisältää ne, jotka jakavat kaikki CadCraft-sovellukset (teema, työkalurivi, paneelit). CivilCraftin asetukset ovat vain tässä sovelluksessa: muutat ne täällä, ja tämä selain muistaa ne. {{ui:Palauta CivilCraft-asetukset}} palauttaa jokaisen asetuksen lähtöarvoonsa.

## Pisterivit

**P, N, E, Z, D** (lähtökohta) tai **P, E, N, Z, D**: piste, pohjoinen, itä, korkeus, kuvaus tai itä ennen pohjoista. Sitä käytetään kolmessa kohdassa:

- **Kopioi**: rivit, jotka CivilCraft asettaa järjestelmän leikepöydälle taulukkolaskentaa varten.
- **Liitä**: taulukkolaskennasta tai tekstitiedostosta liitetyt rivit, joissa ei ole otsikkoriviä.
- **Tuo**: arvaus **Tuo pisteet** -ikkunassa, kun tiedostossa ei ole otsikkoriviä (nelisarakkeinen tiedosto luetaan PENZ:nä, kolmisarakkeinen ENZ:nä). Katso [Pistetiedostomuodot](topic:point-file-formats).

Otsikkorivi, joka nimeää sarakkeet, voittaa aina, ja niin voittaa myös valinta tuontiikkunan **Sarakkeet**-luettelossa.

## Liitettyjen pisteiden numerot

- **Säilytä vapaat numerot** (lähtökohta): liitetty piste säilyttää numeronsa, kun mikään piste ei käytä sitä; vain päällekkäiset pisteet saavat uuden numeron.
- **Anna aina uudet numerot**: jokainen liitetty piste saa uuden numeron, vaikka sen oma numero olisi vapaa.

**Uudet numerot alkavat**: jätä tyhjäksi, niin laskenta jatkuu yhdellä suuremmasta numerosta, joka on käytössä olevista korkein. Kirjoita numero, esimerkiksi 5000, niin uudet pisteet saavat numerot 5000 alkaen; jo käytössä olevat numerot ohitetaan. Kaksi pistettä ei jaa koskaan samaa numeroa kumpaankaan tapaan. Katso [Mittauspisteiden valinta, kopiointi ja liittäminen](topic:copy-paste-points#point-numbers-never-clash).

## Pistetunnisteet

Mitä pistetunniste näyttää, kun {{ui:Pistetunnisteet}} on päällä kohdassa **Näytä**: **Numero**, **Numero ja korkeus** tai **Numero, korkeus ja kuvaus** (lähtökohta). DXF-, DWG- ja PDF-viennit näyttävät samat tunnisteet kuin näyttö.

## Kulmanäyttö

Mikä on pohjakuvan ja 3D-näkymän kulmassa: **Näkymäkuutio** (lähtökohta), **Akselikuvake** tai **Ei mitään**.

- **Näkymäkuutio** (oikea yläkulma). Pohjakuvassa se näyttää päällyksen kompassirenkaan kanssa: N on ruudukon pohjoinen (ylös pohjakuvassa). Napsauta mitä tahansa muuta kuution sivua, reunaa tai kulmaa tai vedä sitä, niin [3D-näkymä](topic:site-3d) avautuu katsomaan sieltä. {{ui:Aloitus}} pohjakuvan kuution päällä sovittaa pohjakuvan.
- 3D-näkymässä kuutio kääntyy näkymän mukana: napsauta sivua, reunaa tai kulmaa katsoaksesi sieltä, vedä kuutiota kiertääksesi, vedä kompassirengasta kääntääksesi pystyakselin ympäri, napsauta kirjainta katsoaksesi sieltä puolelta ja käytä {{ui:Aloitus}}-painiketta koko kohteen iso-näkymään. Kun katsot suoraan sivua kohti, pienet nuolet siirtyvät seuraavalle sivulle ja kaarevat nuolet kääntävät näkymää neljänneskierroksen.
- **Akselikuvake** (vasen alakulma): pieni X (itä) ja Y (pohjoinen) merkki pohjakuvassa, X, Y ja Z (ylös) 3D:ssä.

## 3D:n pystysuuntainen liioittelu

Kuinka paljon 3D-näkymä venyttää korkeuksia: **1×**, **2×** (lähtökohta), **3×**, **5×** tai **10×**. 3D-näkymän palkin luettelo on sama asetus, joten kumpikin muutos muuttaa molempia. Tilavuudet, pituusleikkaukset ja 3D-viennit pysyvät todellisessa mittakaavassa.

## Leveys- ja pituuspiiri

Miten tilarivi näyttää osoittimen leveys- ja pituuspiirin, kun projektilla on koordinaattijärjestelmä: **asteet, minuutit ja sekunnit** (lähtökohta, esimerkiksi `30°18′00.00″ N`) tai **desimaaliasteet** (`30.300000° N`). Katso [Projektin koordinaattijärjestelmän asettaminen](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Karttatasot internetistä

**Pois** (lähtökohta) tai **Päällä**. Kun se on päällä, CivilCraft pyytää lisäämiltäsi karttapalvelimilta kuvia näytöllä olevasta alueesta. Piirustuksesi pysyy tässä tietokoneessa; palvelin näkee alueen ja internet-osoitteesi. Kun se on pois, mitään karttapalvelinta ei pyydetä mistään, vaikka avaamasi projekti nimeäisi sellaisen; tiedostosta ladattu georeferoitu kuva toimii kummin tahansa. Katso [Näytä karttatasot pohjakuvan alla](topic:map-layers).

## Tekoälyavustajat

**Anna tekoälyavustajien ja skriptien käyttää CivilCraftia** (aluksi pois) antaa tietokoneesi avustajalle pääsyn avoimeen kohteeseen CadCraft Studion kautta: **Lue** kuvaa kohteen ja antaa pisteet, pinnan korkeudet, paalut, profiilit, tilavuudet ja tontit; **Muokkaa** antaa sen valita ja lisätä mittauspisteitä; **Tallenna** ja **Vie** antavat sen tallentaa projektin tai kirjoittaa LandXML- tai DWG-tiedoston. **Kansiot, joita se saa käyttää** (Studiossa) ovat kansioita, joihin se saa tallentaa ja viedä. **Toiminta** listaa sen kutsut. Katso [Anna tekoälyavustajan työskennellä kohteesi kanssa](topic:assistants).
