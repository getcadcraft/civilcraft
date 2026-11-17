---
title: Lue korkeuskäyrät, korkeudet ja kaltevuudet
summary: Aseta korkeuskäyrien väli ja pääkäyrät, näytä korkeusvyöhykkeet, kaltevuusnuolet ja kolmiot sekä lue maanpinnan korkeudet osoittimen kohdalta.
keywords: korkeuskäyrät, korkeuskäyrien väli, pääkäyrät, tunnisteet, korkeusvyöhykkeet, kaltevuusnuolet, kolmiot, pistekorkeus, maastomallianalyysi, korkeusanalyysi, kaltevuusanalyysi
from: 585e500a
---

Maastomalli näytetään korkeuskäyrillä heti, kun se on olemassa. Kaikki tässä aiheessa käsiteltävät asetukset tehdään vasemman paneelin kohdassa **Näyttö**. Näyttöasetukset muuttavat vain sitä, mitä näet (ja mitä viet ulos); ne eivät ole kumottavia vaiheita.

## Aseta korkeuskäyrien väli

1. Valitse kohdassa **Näyttö** arvo kohdasta **Korkeuskäyrät välein**.
   - Jaloissa: 0.25, 0.5, 1, 2, 5, 10 tai 20 ft.
   - Metreissä: 0.1, 0.25, 0.5, 1, 2, 5 tai 10 m.
2. Valitse **Pääkäyrät välein**: joka 2., 4., 5. tai 10. käyrä.
   Pääkäyrät piirretään paksummalla viivalla, ja niihin merkitään korkeus. Ne osuvat pääkäyrävälin kokonaisille monikerroille (kun käyrät ovat 1 ft välein ja joka 5. on pääkäyrä: 245, 250, 255 …).
3. Kytke {{ui:Korkeuskäyrien tunnisteet}} pois päältä, jos tunnisteet ovat liian tiheässä pienessä piirroksessa.

Uusi projekti alkaa 1 yksikön välillä, ja joka 5. käyrä on pääkäyrä. Korkeuskäyrät taittuvat taitelinjoissa. Jos ne leikkaavat suoraan juoksuviivan tai harjanteen yli, kyseinen viiva ei ole vielä taitelinja (katso [Rakenna ja tarkenna maastomalli](topic:build-surface)).

:::note
Korkeuskäyriä piirretään vain, jos alimman ja korkeimman pisteen välillä on enintään 2 000 tasoa. Alueella, jolla on paljon korkeuseroja ja hyvin pieni väli, suunnitelmassa ei näy lainkaan korkeuskäyriä: valitse suurempi väli.
:::

## Pehmennä korkeuskäyrät

Korkeuskäyrät piirretään suorina osina, yksi kunkin maastomallin kolmion läpi, joten ne kääntyvät pienen kulman jokaisen kolmion reunalla. **Korkeuskäyrien pehmennys** kohdassa **Näyttö** pyöristää nämä kulmat:

- **Ei mitään (suorat osat)**: piirretyt viivat sellaisinaan. Näin uusi tai vanhempi piirustus näkyy.
- **Kevyt**: kulmat pyöristyvät hieman. Viiva ei siirry koskaan enempää kuin 10 % matkasta kohti seuraavaa käyrää, eikä koskaan kauemmas suorasta osastaan kuin yhden kuudesosan sen pituudesta.
- **Voimakas**: sujuva kaari. Viiva ei siirry koskaan enempää kuin 25 % matkasta kohti seuraavaa käyrää, eikä koskaan kauemmas suorasta osastaan kuin yhden kolmasosan sen pituudesta.

Kummallakin valinnalla pehmennetty korkeuskäyrä leikkaa silti jokaisen kolmion reunan samassa pisteessä kuin piirretty käyrä, pysyy sen kolmion sisällä, jonka läpi kukin osa kulkee, eikä siksi koskaan leikkaa tai koske toista korkeuskäyrää. Kohdassa, jossa korkeuskäyrä leikkaa taitelinjan tai rajan, se säilyttää terävän taitteensa. Pehmennetyt viivat ovat ne, jotka piirretään ja viedään ulos (DXF, DWG, PDF, GIS ja 3D), ja niissä on enemmän kärkipisteitä kuin piirretyissä viivoissa.

Pehmennys muuttaa vain piirrettyjä viivoja. Korkeudet, tilavuudet, pituusleikkaukset ja poikkileikkaukset luetaan edelleen itse maastomallista. Käyrä, joka kulkee tarkalleen mittauspisteiden kautta (piste 250.00 käyrällä 250), säilyttää pienen kulman jokaisessa tällaisessa pisteessä.

## Miten korkeuskäyrien taustalla oleva maastomalli muodostetaan

Korkeuskäyrät seuraavat maastomallia, ja maastomalli seuraa vasemman paneelin kohdan **Maastomalli** kohtaa **Korkeuskäyrien menetelmä**. Oletus, **Kolmiointi lineaarisella interpolaatiolla**, yhdistää pisteesi kolmioiksi ja säilyttää jokaisen pisteen ja taitelinjan tarkasti. Muut menetelmät sovittavat ensin säännöllisen ruudukon pisteisiin (kriging, minimikaarevuus, luonnollinen naapuri, käänteinen etäisyys ja muut). Ne antavat pyöreämmät käyrät pisteiden välillä, mutta eivät kulje tarkalleen jokaisen pisteen kautta. Kohdan **Maastomalli** alla oleva maastomallin raportti kertoo, kuinka paljon tulos poikkeaa pisteissäsi.

**ABOS (approximation based on smoothing)** on yksi ruudukkomenetelmistä. Sillä on kaksi omaa asetusta: **Sileys** (alkuarvo 0.5; pienempi arvo on tasaisempi) ja **Tarkkuus** (alkuarvo 1: maastomalli tuodaan 1 %:n tarkkuuteen kohteen korkeusalueesta pisteissäsi; kirjoita pienempi luku tarkempaa sovitusta varten). Jos se ei pääse tarkkuuteen käytettävässä ruudukossa, maastomallin raportti kertoo siitä: kirjoita pienempi **Ruudukkoväli**.

## Lue korkeus mistä tahansa kohdasta

Siirrä osoitin suunnitelman päälle. Tilarivi näyttää:

- **E** ja **N** osoittimen kohdalla
- **Maanpinta** ja nykyisen maanpinnan korkeus siinä, interpoloituna osoittimen alla olevalle kolmiolle
- **Tasattu** ja suunniteltu korkeus kohdassa, jossa alusta tai käytävä on muuttanut maanpintaa
- ”Maastomallin ulkopuolella” maastomallin ulkopuolella

Lukeaksesi mittauspisteen tarkasti valitse {{ui:Valitse}} ja napsauta pistettä: oikea paneeli näyttää sen numeron, itä, pohjoisen, korkeuden, kuvauksen ja ryhmän.

## Näytä korkeusvyöhykkeet

1. Rastita {{ui:Korkeusvyöhykkeet}}.
   Maastomalli täytetään väreillä matalasta (sinivihreä) korkeaan (okraruskea). Valintaruutujen alla oleva selite luettelee kunkin vyöhykkeen korkeusalueen.
2. Valitse kohdasta **Vyöhykkeitä** määrä: 5, 8, 10 tai 12. Vyöhykkeet jakavat alimman ja korkeimman korkeuden välisen alueen yhtäsuuriin askeleisiin.

Vyöhykkeet ovat vain katseltavaksi. Niitä ei viedä DXF-tiedostoon eikä piirretä PDF-tiedostoon.

## Näytä kaltevuusnuolet

Rastita {{ui:Kaltevuusnuolet}}. Jokaiseen riittävän suureen kolmioon piirretään lyhyt nuoli, joka osoittaa alamäkeen. Tasaisiin kolmioihin ei piirretä nuolta. Nuolet ovat nopea tarkistus valutussuunnalle; itse kaltevuusarvoa ei vielä merkitä.

## Näytä kolmiot, pisteet ja reunat

- {{ui:Kolmiot}} piirtää TIN-kolmioverkon reunat. Kytke se päälle tarkistaaksesi, miten maastomalli yhdistää pisteet, erityisesti taitelinjojen varrella ja ulkoreunalla.
- {{ui:Pisteet}} piirtää jokaisen mittauspisteen; {{ui:Pistetunnisteet}} lisää sen numeron, korkeuden ja kuvauksen (tai vähemmän: katso kohta **Pistetunnisteet** aiheessa [CivilCraft-asetukset](topic:settings)).
- {{ui:Taitelinjat}} piirtää taitelinjat (ja rajan) oranssina.
- {{ui:Maastomallin reuna}} piirtää maastomallin ulkoviivan.

## Nykyinen tai suunniteltu

Kun alusta tai käytävä tasataan ongelmitta, kohta **Maastomalli** kohdassa **Näyttö** tarjoaa vaihtoehdon {{ui:Suunniteltu (tasattu)}}. Korkeuskäyrät, vyöhykkeet ja nuolet näyttävät silloin tasatun maastomallin, jolloin näet uuden maanpinnan ja sen ympärillä olevan maanvarauksen. Palaa valitsemalla {{ui:Nykyinen maanpinta}}, jotta näet mittauksen.

## Mitä viedään ulos

DXF- ja PDF-tulosteet noudattavat näitä asetuksia: pois kytkettyjä asioita ei kirjoiteta, ja korkeuskäyrät ovat näytetyn maastomallin käyriä. Korkeusvyöhykkeitä ei viedä koskaan.
