---
title: Valitse, kopioi ja liitä mittauspisteitä
summary: Valitse mittauspisteitä napsautuksella, Shift-näppäimellä ja laatikolla tai kaikki kerralla; kopioi, leikkaa, liitä, liitä samaan paikkaan, monista ja poista niitä uusilla pistenumeroilla, jotka eivät koskaan mene päällekkäin; liitä pisterivejä taulukkolaskentaan ja sieltä pois.
keywords: kopioi, liitä, leikkaa, monista, poista pisteitä, valitse pisteitä, valitse kaikki, laatikkovalinta, ikkuna, leikepöytä, taulukkolaskenta, csv, uudelleennumerointi, pistenumerot, liitä samaan paikkaan, kloonaa, maastoon merkintä
from: 78a6aea7
---

Mittauspisteitä voi kopioida ja liittää projektin sisällä, projektien välillä kahdessa selainvälilehdessä sekä taulukkolaskentaan ja sieltä pois. Jokainen muutos on yksi kumoamisvaihe, ja maastomalli rakentuu heti uudelleen uusista pisteistä.

## Valitse pisteitä

Kun {{ui:Valitse}} ({{key:V}}) on valittuna:

- **Napsauta** pistettä valitaksesi sen (vain sen). Sen numerot näkyvät kohdassa **Ominaisuudet**.
- {{key:Shift}} ja **napsautus** lisää pisteen valintaan tai poistaa sen valinnasta.
- {{key:Shift}} ja **vetäminen** piirtää laatikon: sen sisällä olevat pisteet lisätään valintaan. Jos vedät pisteiden ympäri, siitä tulee lasso; katso [Mittauspisteiden lassovalinta](topic:lasso-selection). Vetäminen ilman {{key:Shift}}-näppäintä panoroi kuten aina.
- {{key:Mod+A}} (tai {{ui:Lisää}} › {{ui:Valitse kaikki pisteet}}) valitsee kaikki pisteet.
- {{key:Esc}} (tai {{ui:Lisää}} › {{ui:Poista valinta}}) tyhjentää valinnan.

Valituilla pisteillä on rengas. Kun valittuna on useampi kuin yksi, **Ominaisuudet** näyttää niiden määrän, numerot, korkeusalueen ja ryhmät.

## Kopioi, leikkaa ja poista

- {{ui:Kopioi}} tai {{key:Mod+C}} kopioi valitut pisteet. CivilCraft säilyttää kopion ja asettaa sen myös järjestelmän leikepöydälle pisterivien muodossa, joten voit liittää sen suoraan taulukkolaskentaan tai tekstitiedostoon.
- {{ui:Lisää}} › {{ui:Leikkaa}} tai {{key:Mod+X}} kopioi ne ja poistaa ne yhdellä vaiheella.
- {{ui:Lisää}} › {{ui:Poista}} tai {{key:Delete}} poistaa ne. {{key:Mod+Z}} palauttaa ne.

Rivit ovat: piste, pohjoinen, itä, korkeus, kuvaus (P,N,E,Z,D), pilkuilla erotettuina, kolmella desimaalilla. Jos haluat itä ennen pohjoista, aseta **Pisterivit** kohdassa [CivilCraft-asetukset](topic:settings). Kuvaus, jonka taulukkolaskenta tulkitsisi kaavaksi (alkaa merkeillä =, +, - tai @), saa eteensä heittomerkin, jotta se pysyy tekstinä.

## Liitä

1. Paina {{key:Mod+V}} tai napsauta {{ui:Liitä}}. Pisteet seuraavat osoitinta pieninä ristiinä, ja niistä lähtee pisteviiva takaisin alkuperäiseen paikkaan.
2. Napsauta kohtaa, johon ne menevät. Kopioitujen pisteiden keskikohta osuu napsautukseen.
3. Tai paina {{key:Enter}}, jolloin ne sijoittuvat omiin koordinaatteihinsa, tai {{key:Esc}} peruuttaaksesi.

{{ui:Lisää}} › {{ui:Liitä samaan paikkaan}} tai {{key:Mod+Shift+V}} liittää pisteet heti niiden omiin koordinaatteihin. Liitetyt pisteet valitaan sen jälkeen, joten voit kopioida, siirtää tai poistaa ne uudelleen.

:::note
Kun napsautat työkalurivin {{ui:Liitä}}-painiketta, se lukee järjestelmän leikepöydän. Ensimmäisellä kerralla selain voi kysyä, saako CivilCraft nähdä leikepöydän. Jos kieltäydyt, työkalurivin painike liittää vain CivilCraftin oman kopion; {{key:Mod+V}} liittää silti taulukkolaskennan rivit kysymättä.
:::

## Pistenumerot eivät koskaan mene päällekkäin

Kaksi pistettä ei koskaan jaa numeroa. Kun liität:

- Liitetty piste säilyttää numeronsa, jos mikään projektin piste ei käytä sitä. Joten **Leikkaamisen** jälkeen pisteet liittyvät takaisin omilla numeroillaan, ja toisesta projektista kopioidut pisteet säilyttävät numeronsa, jos ne ovat vapaita.
- Liitetty piste, jonka numero on varattu, saa uuden kokonaisluvun: yhden enemmän kuin käytössä oleva suurin numero, laskien ylöspäin.
- Tilarivi kertoo, mitä tapahtui, esimerkiksi ”1 kept its number; 9 got new numbers: 10–18 became 277–285”.

[CivilCraft-asetuksissa](topic:settings) voit valita **Aina uudet numerot** sekä numeron, josta uudet numerot alkavat, esimerkiksi 5000 suunnittelupisteille.

:::warning
Pisteryhmät, jotka rakentavat maastomallin **taitelinjana**, yhdistävät pisteensä numerojärjestyksessä. Taitelinjapisteiden liitetyt kopiot (esimerkiksi FL-mittaukset) saavat uudet, suuremmat numerot ja liittyvät kyseisen taitelinjan loppuun, mahdollisesti pitkän hypyn kautta. Tarkista suunnitelma tällaisten pisteiden liittämisen jälkeen tai aseta niiden ryhmä kohtaan {{ui:Pisteet}}.
:::

## Monista

{{ui:Lisää}} › {{ui:Monista}} tai {{key:Mod+D}} tekee valittujen pisteiden kopion, joka seuraa osoitinta: napsauta kohtaa, johon se menee. Kopiot saavat aina uudet numerot, ja CivilCraftin leikepöytä jätetään ennalleen.

## Taulukkolaskennasta tai tekstitiedostosta

Valitse taulukkolaskennasta pisterivejä (piste, pohjoinen, itä, korkeus, kuvaus) ja kopioi ne. Paina CivilCraftissa {{key:Mod+V}} ja napsauta kohtaa, johon ne menevät, tai paina {{key:Mod+Shift+V}} sijoittaaksesi ne omiin koordinaatteihinsa, mikä on yleensä se, mitä haluat oikeaan mittausdataan.

Rivit luetaan täsmälleen kuten [pistetiedosto](topic:point-file-formats): pilkut, sarkaimet tai välilyönnit, otsikkorivi, jos sellainen on. Ilman otsikkoriviä sarakejärjestys tulee kohdasta **Pisterivit** [CivilCraft-asetuksissa](topic:settings).

Kun molemmat ovat tarjolla, CivilCraft päättää sen mukaan, mikä on uudempaa: järjestelmän leikepöydän rivit, jotka eroavat CivilCraftin viimeisimmästä kopiosta, on kopioitu myöhemmin, joten ne liitetään. Teksti, jossa ei ole pisteitä, jätetään huomiotta, ja sen sijaan liitetään CivilCraftin oma kopio.

## Projektien ja välilehtien välillä

Kopio säilytetään tässä selaimessa, joten CivilCraftin toinen välilehti voi liittää sen, vaikka ensimmäinen välilehti suljettaisiin. Metriprojektissa kopioidut pisteet, jotka liitetään jalkaprojektiin, säilyttävät numeronsa sellaisinaan: mitään ei muunneta, ja tilarivi kertoo sen.

## Mitä ei kopioida

Tässä vaiheessa kopioidaan vain mittauspisteitä. Linjauksia, alustoja, putkiverkkoja, taitelinjoja ja rajoja ei voi vielä kopioida tai liittää. Liittäminen ei voi siirtää olemassa olevia pisteitä: käytä {{ui:Leikkaa}}-toimintoa ja liitä, tai siirrä yksi piste kerrallaan ([Muokkaa mittauspistettä](topic:edit-points)).
