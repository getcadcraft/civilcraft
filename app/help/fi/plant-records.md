---
title: Kasvitietueet, lajikkeet ja toimitettavat koot
summary: Projektisi oma kasviluettelo taulukkona: lajikkeet, toimitettavat koot (astia, juuripaakku, rungon ympärysmitta, vapaa runko), tiheys, eritelmämuistiinpanot, CSV sisään ja ulos. Jokainen sijoitettu kasvi nimeää kokonsa. Kasvisymbolit mittakaavan mukaan sekä omat symbolit ja 3D-mallit.
keywords: kasvitaulukko, kasvitietokanta, lajike, muunnos, toimitettava koko, astia, juuripaakku, paljasjuurinen, rungon ympärysmitta, vapaa runko, tiheys, neliömetriä kohden, eritelmä, eritelmämuistiinpanot, kasvisymboli, lohko, oma symboli, 3D-kasvi, yksityiskohtataso, mittakaava
from: 12251beb
---

Avaa {{ui:Kasvitaulukko}} Maisema-ryhmän {{ui:Lisää}}-valikosta tai Kasvit-osiosta. Jokainen rivi on tietue tämän projektin omassa luettelossa (kasviluettelon tietue kopioituu, kun lisäät sen). Jokainen muokkaus tarkistetaan kuten tuotu tiedosto, ja se on yksi kumoamisvaihe.

## Sarakkeet

- **Kasvitieteellinen nimi**, **Yleisnimi**, **Tyyppi**, **Korkeus** ja **Leviämä** aikuisena (metreinä).
- **Väli** (keskeltä keskelle) tai **Tiheys** (kasvia / m²). Istutusalue, jonka tietueella on tiheys mutta ei väliä, täytetään tällä tiheydellä omalla kuviollaan (kolmio- tai neliökuvio).
- **Toimitettavat koot**: yksi merkintä kokoa kohden, erotettuna `;`-merkillä. Jokainen merkintä on tunniste, tyyppi (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) ja jokin seuraavista: tilavuus `10L`, korkeus `h0.6`, leviämä `s0.4`, rungon ympärysmitta `g14-16` (cm), vapaa runko `st1.8`. Esimerkki: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Lajikkeet**: nimet erotettuna `;`-merkillä. Lajike säilyttää omat kokonsa ja muistiinpanonsa, jos tuomassasi tiedostossa ne olivat.
- **Eritelmämuistiinpanot**.

{{ui:Monista}} kopioi rivin uudella avaimella. {{ui:Tallenna CSV:nä}} ja {{ui:Tallenna kasvitiedostona}} kirjoittavat luettelon ulos (CSV-rivit lajikkeille ovat lajinsa alla, `cultivar_of`-sarakkeella). CSV- tai kasvitiedoston tuonti yhdistää sen luetteloon.

## Oma Kirjaston kasviluettelo

Kirjaudu CadCraft-tilillesi (Asetukset, Omat lisäosat, Kirjaudu sisään). Silloin kasvitaulukko voi käyttää kirjastoon tallentamaasi luetteloa:

- {{ui:Kirjastoluettelostani}} tuo omat kasvikohteesi (myös ne, jotka odottavat vielä tarkastusta). Täällä jo oleva kasvi päivitetään kirjastosta, ja tähän lisäämäsi lajikkeet, toimitettavat koot, tiheys ja eritelmä säilyvät.
- {{ui:Tallenna kasviluetteloksi}} tallentaa jokaisen rivin omaksi kasvikohteeksesi kirjastossa, yksi kohde lajia kohden: uusi kasvi on uusi kohde, muuttunut kasvi on uusi versio ja muuttumaton jätetään rauhaan. Rastita ensin ruutu: tallentaminen antaa kasvit julkisiksi CC0-lisenssillä. Ensimmäisen julkisen lähetyksen henkilöltä, jota ei vielä luoteta, tarkistaa ihminen ennen kuin se näkyy, kuten jokainen lähetys.

Kirjasto säilyttää perustietueen. Lajikkeet, toimitettavat koot, tiheys ja eritelmämuistiinpanot pysyvät projektissa ja kasvitiedostossa ({{ui:Tallenna kasvitiedostona}}). Valintaikkuna kertoo joka kerta, kuinka monta riviä tämä koskee.

## Sijoitetun kasvin koko

Valitse kasvi, pensasaita tai istutusalueen tai istutetun alueen sekoitusrivi. Kun tietueella on lajikkeita tai toimitettavia kokoja, {{ui:Lajike ja koko}} valitsee yhden. Kasviluettelo laskee silloin lajin, lajikkeen ja koon mukaan, ja tunniste voi näyttää ne: `{botanical} '{cultivar}' {size}` tai `{full}`.

## Kasvisymbolit mittakaavan mukaan

{{ui:Kasvien grafiikka}} (Maisema › Lisää) määrittää, miten kasvit piirretään pohjakuvassa: **automaattinen** (karkeampi kuin 1:500 ympyrä leviämän kokoisena, välillä 1:200–1:500 ääriviiva keskipisteellä, tarkemmin yksityiskohtainen symboli; molempia mittakaavoja voi muuttaa) tai yksi taso kaikille mittakaaville. Arkkisarjat-valintaikkunalla on oma **Kasvien yksityiskohtaisuus pohjakuvassa** tälle sarjalle.

Kasvit-osiossa tietueen kohdalla {{ui:Oma symboli…}} lukee SVG-tiedoston tai DXF/DWG-piirroksen lohkon ja piirtää sen kasvin leviämään yksityiskohtaisella tasolla. {{ui:Oma 3D-malli…}} lukee OBJ-, STL- tai GLB-tiedoston. Kasvien grafiikka -kohdassa valitse **Tietueen oma malli** nähdäksesi sen 3D:nä. Tiedostot ovat rajoitettuja (512 KB SVG, 2000 muotoa, 50 000 kolmiota) ja säilytetään projektissa. SVG-muunnoksia ei sovelleta, ja sinulle kerrotaan, jos tiedostossa on niitä. Katso [Kasvien grafiikka, omat symbolit ja 3D-kasvit](topic:plant-graphics) tasoista, rajoista ja siitä, mitä GLB-tiedosto saa sisältää.
