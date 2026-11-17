---
title: Havainnot ja BCF
summary: Kiinnitä ongelma pohjakuvaan, linjauksen paaluun, maastopisteeseen tai putkeen, anna sille tila ja kommentit ja vaihda havainnot BCF 2.1 -tiedostoina LandXML-tiedoston rinnalla.
keywords: havainto, havainnot, bcf, kommentti, merkintä, puute, vika, työmaa, kiinnityspiste, tila, avoin, aktiivinen, ratkaistu, suljettu, BIM-yhteistyömuoto, landxml, ongelmat
from: e44153b1
---

Havainto on huomautus, joka on kiinnitetty CivilCraft-piirustuksesi kohtaan ja jossa on otsikko, tila ja kommentit. Käytä sitä ilmoittamaan työmaan henkilöille tai toiselle ohjelmalle, mitä on tarkistettava, ja lukemaan takaisin heidän vastauksensa.

## Lisää havainto

1. Avaa **Maastomalli, Muut, Havainnot (BCF)...**
2. Kirjoita otsikko ja kuvaus siitä, mikä on vialla.
3. Valitse, mihin havainto kiinnitetään: suunnitelmanäkymän keskipiste, keskellä oleva maastopiste, valitun linjauksen paalu (kirjoita paalu ja poikkeama, oikea on positiivinen) tai valittu putki, kaivo tai ominaisuuslinja.
4. Paina **Lisää havainto**. Kiinnityspiste näkyy pohjakuvassa pienenä vinoneliönä, jossa on sen numero.

Napsauta havainnon otsikkoa, niin näkymä zoomautuu siihen. Voit vaihtaa tilan luettelossa (Avoin, Aktiivinen, Ratkaistu, Suljettu) ja lisätä kommentteja. Jokainen muutos on yksi kumoamisvaihe, ja havainnot tallennetaan projektitiedostoon.

## Vaihda ne BCF-muodossa

- **Vie BCF** kirjoittaa BCF 2.1 -tiedoston, jossa on yksi aihe per havainto: otsikko, tila, kommentit ja yksi näkymä, jossa on ortogonaalinen pohjakuvakamera ja kiinnityspiste.
- **Tuo BCF** lukee BCF-tiedoston (2.0- ja 3.0-tiedostot luetaan siltä osin kuin ne vastaavat 2.1:tä). Aihe, jonka guid on jo olemassa, päivittää olemassa olevan havainnon (tila, uudet kommentit) eikä lisää toista.
- **Ongelmista** tekee havainnon jokaisesta avoimesta Ongelmat-paneelin merkinnästä, joka kertoo sijainnin.

BCF-tiedostossa koordinaatit ovat tämän projektin omissa koordinaateissa metreinä ilman siirtoa. Toisen ohjelman on oltava samassa koordinaatistossa kuin LandXML-tiedostosi, jotta kiinnityspisteet osuvat oikeaan kohtaan. Elementti, johon kiinnityspiste osoittaa (linjaus, paalu, poikkeama, putki), kulkee nimillä, jotka alkavat ”cc:”, ja CivilCraft lukee ne takaisin.

## Mitä ei ole tarkistettu

Kiinnityspisteitä ja näkymiä on testattu vain kirjoittamalla tiedosto ja lukemalla se takaisin CivilCraft-ohjelmalla. Mikään muu BIM-ohjelma ei ole vielä avannut niitä. Se, tarkoittaako BCF:n ”view to world scale” näkymän koko vai puolet korkeudesta, vaihtelee ohjelmien välillä: CivilCraft kirjoittaa koko korkeuden.
