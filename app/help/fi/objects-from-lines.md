---
title: Kohteet viivoista, linkitettyinä
summary: Tee päällyste, istutettu alue, kasvualue, pensasaita, polku, seinä, reunakivi, portaat, luiska, alusta, painanne tai muotoviiva viivasta; se seuraa viivan siirtymistä, kunnes katkaiset linkin.
keywords: viivasta, viivageometria, DWG, DXF, linkki, linkitetty, seuraa, uudelleenluonti, katkaise linkki, muotoviiva, tuotu taso, ääriviiva, supercad studio, piirustusviiva
from: eb67a0c6
---

{{ui:Viivasta}} (Maisema › {{ui:Lisää}}): napsauta muotoviivaa tai tuodun DWG/DXF-tason viivaa tai ääriviivaa. Suljettu viiva voi tehdä päällysteen, nurmikon, istutetun alueen, niityn, maanpeitekasvit, kasvualueen tai alustan; avoin viiva polun, seinän, reunakiven, portaat (sen ensimmäinen ja viimeinen piste), luiskan, pensasaidan tai painanteen. Kumpikin voi tehdä **muotoviivan**, paitsi muotoviiva itse.

## Viivasta tehty muotoviiva

Viivasta tehty muotoviiva saa viivan pisteet, ja se on suljettu, jos viiva oli suljettu. Sen korkeudet asetetaan olemassa olevalle maanpinnalle (0, jos sitä ei vielä ole), ja sen käyttö on **Pois**: se ei muovaa maata, ennen kuin valitset käytön ja asetat sen korkeudet Ominaisuuksissaan. Kun viiva siirtyy, muotoviiva, jolla on sama pistemäärä, säilyttää jokaisen asettamasi korkeuden; kun viiva saa tai menettää pisteitä, korkeudet asetetaan maanpinnalle uudelleen. Katso [Muotoviivat](topic:feature-lines).

Uusi kohde säilyttää **linkin** viivaansa. Kun viiva siirtyy (vedät sen pisteitä, tai piirustus siirretään tai luetaan uudelleen), kohde saa uuden muodon samassa kumoamisvaiheessa, ja suunniteltu maanpinta seuraa maanmuokkaimien kautta. Ominaisuudet kertoo, mihin se on linkitetty; {{ui:Katkaise liitos}} tekee siitä vapaan.

Viivat tarkistetaan ensin: viivassa on oltava vähintään 2 pistettä (ääriviivassa 3), enintään 5000, todellisia lukuja, ja ääriviivan on oltava suljettu eikä se saa leikata itseään. Viiva, joka ei täytä ehtoja, ei ole käytössä: kohde pysyy ennallaan ja Ongelmat-paneeli kertoo syyn. Jos viiva poistetaan, kohde jää paikalleen ja Ongelmat-paneeli huomauttaa siitä.

## SuperCad Studiossa

Avaa työmaa ja 2D-piirustus samassa projektissa. Valitse yksi viiva tai murtoviiva 2D-piirustuksesta, paina Ctrl+K ja suorita {{ui:Maisemakohde valitusta piirustusviivasta}}: CivilCraft kysyy, mitä tehdä, kuten edellä, ja kohde jää linkitettynä tuohon piirustuksen viivaan. Kun muutat viivoja piirustuksessa, Ctrl+K {{ui:Päivitä maisema piirustuksesta}} saa kohteet seuraamaan, yksi kumoamisvaihe kullekin viivalle. Projektin linkkitiedosto kirjaa, mikä kohde seuraa mitäkin viivaa. SuperCad Studion omassa ohjeessa on Maisema-aihe.
