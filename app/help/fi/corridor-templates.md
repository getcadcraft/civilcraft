---
title: Käytäväpohjat ja maastomallipohjat
summary: Tee pieniä uudelleenkäytettäviä pohjia (reunakivi ja reunaoja, jalkakäytävä, seinä, oja), rakenna niistä käytävä paaluittain vasemmalle ja oikealle erikseen, jaa linjaus useaksi käytäväksi ja levitä kerrostetut materiaalit maastomallille.
keywords: mallipohja, mallipohjat, mallipohjakirjasto, mallipohjan luominen, tyyppipoikkileikkaus, kokoonpano, osakokoonpano, komponentit, pistekoodit, päätyehto, maanvaraus, oja, tukimuuri, reunakivi, reunaoja, jalkakäytävä, alueet, paaluväli, useita käytäviä, vasen ja oikea, maastomallipohja, pintamaa, päällyste, levittäminen, materiaalit, määrät
from: ce70e58b
---

**Mallipohja** on pieni poikkileikkaus, jonka piirrät kerran ja käytät uudelleen: pisteitä siirtymillä, luiskilla ja pistekoodeilla sekä komponentteja materiaaleineen. Käytävä voidaan rakentaa mallipohjista paaluittain, ja jokaisella sivulla on omat päällystepohjansa ja oma päätyehtonsa. Samat mallipohjat voidaan levittää myös maastomallille.

:::warning
Esimerkkipohjat ovat paikkamerkkejä, joista voi aloittaa. Niiden luvut eivät ole peräisin mistään standardista tai viranomaiselta. Insinöörin on tarkistettava jokainen pohja ja jokainen sille annettu arvo ennen kuin sitä käytetään suunnittelussa.
:::

## Avaa mallipohjat

Avaa {{ui:Maastomalli}} › {{ui:Lisää}} › {{ui:Käytäväpohjat…}} (tai kirjoita {{cmd:TEMPLATES}}). Ikkunassa on kolme luetteloa:

- **Tässä projektissa**: mallipohjat, joita tämän projektin käytävät ja maastomallipohjat käyttävät. Ne tallennetaan projektitiedostoon.
- **Oma kirjasto**: tässä selaimessa säilytettävät mallipohjat, jotka ovat tarjolla jokaisessa projektissa. Säilytä projektin mallipohja valitsemalla siitä {{ui:Tallenna Omaan kirjastoon}}.
- **Esimerkit**: kaksi kaistaa kerroksineen, reunakivi ja reunaoja, jalkakäytävä, maanvaraus, oja, tukimuuri, pintamaa maastomallin alapuolella sekä päällyste maastomallilla. Jokainen on merkitty ”For checking by an engineer”.

{{ui:Käytä tässä projektissa}} kopioi kirjaston tai esimerkin mallipohjan projektiin. {{ui:Vie tämän projektin mallipohjat}} tallentaa ne `.cctemplates.json`-tiedostoksi, ja {{ui:Tuo tiedosto}} lukee yhden projektiin ja Omaan kirjastoon. Käytä tiedostoa mallipohjien jakamiseen tai siirtämiseen toiselle tietokoneelle.

## Tee mallipohja

{{ui:Uusi mallipohja}} (tai projektin mallipohjan {{ui:Muokkaa}}) avaa mallipohjan muokkausnäkymän. Piirrä oikea puoli ulospäin mallipohjan pisteestä 0,0; vasen puoli käyttää samaa pohjaa ulospäin vasemmalle.

1. Anna sille nimi ja tyyppi: **Päällyste** (seuraava mallipohja liittyy sen päähän), **Päätyehto** (se kohtaa maanpinnan) tai **Maastomallipohja**.
2. Lisää **arvot**: nimettyjä lukuja, kuten leveys `w` tai luiska `s`. Mikä tahansa lukukenttä mallipohjassa ottaa luvun tai arvon nimen; `-t` on arvo `t` negatiivisena. Käytävä voi antaa mallipohjan jokaiselle käytölle omat arvonsa, joten yksi reunakivipohja palvelee jokaista reunakiven korkeutta.
3. Lisää **pisteet** järjestyksessä. Jokainen sijoitetaan aiemmasta pisteestä (tai pisteestä 0,0) sen rajoitteen mukaan:

| Rajoite | Sijoittaa pisteen |
|---|---|
| Siirtymä luiskalla | Siirtymä ulospäin ja luiska (nousu per vaaka; −0.02 laskee 2 %) |
| Siirtymä ja nousu | Siirtymä ja nousu |
| Suoraan ylös tai alas | Pelkkä nousu |
| Sivuluiska maanpintaan | Ulos pisteestään maanpintaan leikkaussuhteella, jossa maanpinta on yläpuolella, ja penkereen suhteella, jossa se on alapuolella |
| Maanpintaan | Siirtymä, sitten suoraan ylös tai alas maanpintaan |
| Tukimuuri | Seinä annetulla paksuudella: leikkauksessa sen yläreuna kohtaa maanpinnan tien pinnassa, penkereessä tie kulkee sen yli ja sen ulkopinta laskeutuu maanpintaan |

   Rastita **Yläpinta** niille pisteille, joiden kautta valmis pinta kulkee. Viimeinen yläpintapiste on kohta, josta seuraava mallipohja samalla puolella alkaa. **Kohde** antaa käytävän siirtää pistettä: sen siirtymä tai korkeus tulee viivalta.
4. Lisää **komponentit**: suljettuja muotoja pistekoodien kautta (`0` on piste 0,0), joilla kullakin on nimi, materiaali ja tyyppi. Niiden pinta-alat antavat tilavuudet.

Piirros seuraa jokaista muutosta todellisessa mittakaavassa, ja sen alla oleva luettelo kertoo, mikä on vialla (piste, joka kohtaa maanpinnan ennen päätä, arvo, jota mallipohjalla ei ole, komponentti ilman pinta-alaa). {{ui:Lisää tähän projektiin}} tai {{ui:Tallenna}} säilyttää sen yhtenä kumoamisvaiheena.

## Rakenna käytävä mallipohjista

Valitse linjaus, jolla on käytävä, ja kytke sen ominaisuuksissa päälle {{ui:Rakenna mallipohjista paaluittain}}. Käytävä alkaa kummallakin puolella kahden kaistan ja maanvarauksen esimerkeistä.

- **Alueet.** Jokainen alue alkaa paalusta ja jatkuu seuraavan alueen alkuun. {{ui:Lisää alue}} lisää yhden; muuta sen alkupaalu sen kentässä.
- **Vasen ja oikea erikseen.** Jokaisella alueen sivulla on oma **Päällyste**-luettelonsa keskiviivasta ulospäin ja oma **Päätyehto**: maanvaraus, oja, seinä tai mikä tahansa maanpintaan kohtaava mallipohja. Ilman päätyehtoa sivu päättyy maanvarauksessa käytävän leikkaus- ja penkereen luiskiin. {{ui:Kopioi vasemmalta oikealle}} kopioi sivun.
- **Arvot ja kohteet.** Jokaisen sivun mallipohjan alla on laatikko jokaiselle arvolle (tyhjä = mallipohjan oma arvo) ja, pisteelle, joka saa kohteen, taitelinja tai toisen käytävän viiva, joka sitä siirtää.
- **Alku ja loppu** rajaavat käytävän osaan linjausta.

Poikkileikkaukset, suunnitelman viivat jokaiselle pistekoodille, suunniteltu maastomalli, maastoon merkintä ja maansiirto seuraavat kaikki. Ominaisuudet luettelee kunkin komponentin tilavuuden sivuittain ja alueittain (keskiviivaa pitkin lasketut keskimääräiset päätepinta-alat). Kallistusta ja käytävän reunakohteita ei käytetä, kun käytävä rakennetaan mallipohjista.

## Useita käytäviä yhdellä linjauksella

Kohdassa **Tämän linjauksen käytävät** {{ui:Lisää käytävä}} lisää käytävän linjauksen loppuosalle: ensimmäiselle käytävälle annetaan loppupaalu keskikohdassa (tai se säilyttää oman), ja uusi alkaa siitä ensimmäisen käytävän viimeisen alueen mallipohjilla. Jokaisella käytävällä on oma nimi, paaluväli, mallipohjat ja maansiirto. Kytke yksi pois päältä sen {{ui:Päällä}}-ruudulla. Jos kaksi väliä menevät päällekkäin, myöhempi käytävä tasataan edellisen päälle.

## Maastomallipohjat

Maastomallipohja levittää mallipohjan kerrokset maastomallille pisteestä 0,0 alkaen: pisteen 0,0 alapuolella oleva kerros menee maahan (pintamaa poistettavaksi), sen yläpuolella oleva kerros istuu maan päällä (kantava kerros ja päällyste parkkipaikalla). Leveydet ja luiskat eivät ole merkityksellisiä; ratkaisee vain kunkin komponentin syvyys pisteen 0,0 yläpuolella tai alapuolella.

Avaa {{ui:Maastomalli}} › {{ui:Lisää}} › {{ui:Maastomallipohjat…}} (tai kirjoita {{cmd:TERRAINTEMPLATES}}); lohko on myös projektin ominaisuuksissa. {{ui:Lisää maastomallipohja}} lisää yhden pintamaaesimerkillä. Valitse kullekin:

- **pohja** (sen arvoja voi muuttaa tälle yhdelle),
- **maastomalli**: nykyinen maanpinta tai suunniteltu maastomalli,
- **muoto**, joka rajaa sen: koko maasto, tontti, alusta tai suljettu taitelinja. Useat maastomallipohjat voivat käyttää eri muotoja samalla maastomallilla.

Jokainen kerros luettelee paksuutensa, pohjapinta-alansa ja tilavuutensa. Tilavuus on pohjapinta-ala kerrottuna paksuudella, paksuus mitattuna suoraan alaspäin; pinta-ala mitataan ruudukolla, ja myös levitetty (kalteva) pinta-ala annetaan. Muodot piirretään suunnitelmalle tasolle C-TOPO-TMPL. Maastomallipohjat eivät muuta suunniteltua maastomallia.

## Materiaalit ja määrät

Projektin maansiirtolohko luettelee **Materiaalit mallipohjista**: jokaisen käytävän komponentin ja maastomallipohjan kerroksen tilavuuksineen. {{ui:Lähetä TakeoffCraftiin}} kirjoittaa ne määrätiedostoon leikkauksen ja penkereen jälkeen, yksi nimike kullekin, kuutiojaardeina (jalkaprojektit) tai kuutiometreinä.

## Tiedostot

Mallipohjat, alueet, lisäkäytävät ja maastomallipohjat tallennetaan projektitiedostoon. Projekti, joka ei käytä niitä, tallennetaan täsmälleen kuten ennen, ja vanhemmat CivilCraft-versiot avaavat projektin, joka niitä käyttää (ne jättävät mallipohjat huomiotta ja rakentavat käytävän oman tyyppipoikkileikkauksen).
