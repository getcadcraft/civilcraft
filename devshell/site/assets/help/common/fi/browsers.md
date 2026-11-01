---
title: Selaimet ja tietokoneet
summary: Missä selaimissa sovellukset toimivat, mikä niissä eroaa ja mitä tietokoneesi tarvitsee.
keywords: chrome, edge, firefox, safari, brave, selain, selaimet, mac, windows, linux, ipad, tablet, tabletti, webgl, vaatimukset, muisti
from: a11b09b1
---

Sovellukset toimivat verkkoselaimessa. Ne tekevät työn omalla tietokoneellasi: tiedostosi avataan siellä, eikä niitä koskaan lähetetä meille (katso [Minne tiedostosi päätyvät](common:your-files)).

## Mikä selain

Käytä jotakin näistä ajan tasalla olevana versiona:

| Selain | Moottori | Huomautuksia |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | Täydellisin: kansion valinta, tallennus offline-käyttöön, tiedostojen käsittely. |
| Firefox | Gecko | Toimii. Kokonaisen kansion avaaminen käyttää yksinkertaisempaa valitsinta. Offline-tallennus ei välttämättä toimi yksityisissä ikkunoissa. |
| Safari | WebKit | Toimii Macilla ja iPadilla. Kokonaisen kansion avaaminen käyttää yksinkertaisempaa valitsinta. Safari voi poistaa offline-kopion, jota et ole käyttänyt muutamaan viikkoon. |

Kaikki kolme moottoria sopivat arkityöhön. Jos sovellus toimii jossakin niistä eri tavalla, sen ohje näyttää vaiheet sinun selaimellesi.

## Mikä selaimissa eroaa

- **Kansion avaaminen.** Chromium-selaimet näyttävät oikean kansiovalitsimen ja voivat lukea kansion suoraan. Firefox ja Safari pyytävät valitsemaan kansion ja lukevat sitten jokaisen sen tiedoston, mikä kestää kauemmin suurissa projektikansioissa; kansion vetäminen sovellukseen toimii kaikissa kolmessa.
- **Tallennus.** Sovellukset tallentavat lataamalla tiedoston. Selain päättää, minne lataukset menevät ja kysyykö se ensin.

:::chromium
Chromessa tai Edgessä voit valita kansion joka kerta ottamalla käyttöön vaihtoehdon ”Kysy aina, minne tiedostot tallennetaan, ennen lataamista” (kohdassa Asetukset, Lataukset).
:::

:::firefox
Firefoxissa avaa Asetukset, sitten Yleiset, sitten Tiedostot ja sovellukset, ja valitse ”Kysy aina, minne tiedostot tallennetaan”, jos haluat valita kansion joka kerta.
:::

:::safari
Safarissa avaa Asetukset, sitten Yleiset, ja aseta ”Tiedostojen latauspaikka” arvoon ”Kysy jokaisella latauksella”, jos haluat valita kansion joka kerta.
:::

## Mac, Windows ja Linux

Sovellukset ovat samanlaisia kaikilla tietokoneilla. Näppäimistö on se, mikä muuttuu: pikanäppäimet kirjoitetaan automaattisesti sinun tietokoneellesi. Katso [Näppäimet, hiiret ja ohjauslevyt](common:keys).

## Tabletit ja kosketusnäytöt

Jotkin sovellukset hyväksyvät kosketuksen (yksi sormi piirtää tai valitsee, kaksi sormea nipistää zoomaamaan ja panoroimaan). Kunkin sovelluksen ohje kertoo, tekeekö se niin. iPadilla käytä Safaria tai Chromea. Näppäimistö auttaa sovelluksissa, jotka käyttävät kirjoitettuja komentoja.

## Vanhin selain ja järjestelmä

Olemme lukeneet nämä 0.7-sovellusten koodista, emme arvanneet: jokainen tiedosto jäsennettiin ja jokainen sen käyttämä kieliominaisuus haettiin selainten julkaisemista yhteensopivuustiedoista. Näitä versioita vanhemmilla sovellukset eivät edes käynnisty, koska selain ei ymmärrä koodia.

| | Vanhin versio, jolla sovellukset voivat käynnistyä |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS ja iOS 16.4) |

CadCraft Studio sisältää Windowsissa oman verkkomoottorinsa, joten se vaatii Windows 10:n tai 11:n; Macilla se käyttää järjestelmän moottoria, joten se vaatii macOS 13.3:n tai uudemman. Studion kohta Asetukset › Päivitykset näyttää, minkä päällä oma kopiosi toimii.

Tämä on vanhin versio, joka *käynnistyy*, luettuna koodista. Se ei ole luettelo vanhoista selaimista, joilla olisimme ajaneet sovelluksia, joten vanhempikin selain, joka käynnistyy, voi silti puuttua jostakin ominaisuudesta.

## Mitä tietokoneesi tarvitsee

Nämä ovat sovellusten suunniteltuja vähimmäisvaatimuksia, eivät mitattuja vaatimuksia:

- 8 Gt muistia (16 Gt suositellaan suurille yhdistetyille malleille).
- Näytönohjain, jossa on WebGL 2, 3D-sovelluksia varten. Jos 3D-näkymä pysyy tyhjänä, tarkista, että laitteistokiihdytys on päällä selaimesi asetuksissa.
- Vähintään 1280 kuvapisteen levyinen näyttö täysille työkaluriveille; pienemmillä näytöillä ne rivittyvät.

Hyvin suuret tiedostot (suuret piirustussarjat, suuret mallit) käyttävät selainvälilehdessä paljon muistia. Sulje muut raskaat välilehdet, jos sovellus hidastuu.
