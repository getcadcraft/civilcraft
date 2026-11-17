---
title: Kasviluettelo
summary: Noin 420 yleistä lauhkean ja Välimeren alueen kasvia kokoineen, kestävyyksineen sekä valo- ja vesitarpeineen, haettavissa millä tahansa kielellä, plus oma luettelo, joka tallennetaan projektin mukana.
keywords: kasviluettelo, kasvitietokanta, laji, kasvitieteellinen nimi, yleisnimi, kasvipaletti, taimitarhaluettelo, kestävyysvyöhyke, csv, kasvien tuonti, kasvien vienti, omat kasvit, puuluettelo, pensasluettelo, kasvit, kasvikirjasto
from: 7ed09e7e
---

**Kasvit**-osio vasemmassa paneelissa luettelee kaikki kasvit, jotka voit sijoittaa. Klikkaa yhtä nähdäksesi sen koot ja tehdäksesi siitä kasvin, jota {{ui:Kasvi}}, {{ui:Istutusalue}} ja {{ui:Pensasaita}} käyttävät.

## Haku ja suodatus

Kirjoita kenttään **Haku** mikä tahansa sana kasvin nimessä millä tahansa kielellä (englanti, espanja, portugali), sen kasvitieteellinen nimi, sen tyyppi tai sana sen muistiinpanoissa. Jokaisen kirjoittamasi sanan on täsmättävä, joten `quercus evergreen` löytää ikivihreät tammet. Tarkkeet eivät vaikuta hakuun.

Rajaa luetteloa kentillä **Tyyppi**, **Valo**, **Vesi** ja **Kestävyysvyöhyke** (USDA-vyöhyke, jolla kohteesi sijaitsee: kasvi näkyy, kun vyöhyke on sen alueella).

## Mitä kasvilla on

| Kenttä | Merkitys |
|---|---|
| Tyyppi | Puu, pensas, pensasaita, ruoho (nurmikot mukaan lukien), monivuotinen, maanpeitekasvi tai kiipijä |
| Aikuisena | Korkeus ja leviämä kasvettuna puutarhassa tai kadulla, metreinä |
| Istutettaessa | Koko, jolla se istutetaan, ja sen astia |
| Väli | Keskeltä keskelle istutusalueella tai pensasaidan varrella |
| Kestävyysvyöhyke | USDA-vyöhykkeet, joilla se yleensä kestää |
| Valo, vesi, maa | Mitä se tarvitsee |
| Muistiinpanot | Käyttö ja varoitukset, kuten myrkylliset osat tai leviävä kasvi |

:::note
Sisäänrakennettu luettelo on kirjoitettu CadCraftille yleisen puutarhatietämyksen pohjalta: tyypilliset koot, pyöristettyinä. Se ei ole minkään taimitarhan luettelo. Tarkista koot ja kestävyys paikallisesta taimitarhasta. Iberian ja suuren osan lauhkean vyöhykkeen tunnetuimmat vieraslajit on jätetty pois tarkoituksella, ja muutama, joka on leviävä jossain muualla, on merkitty muistiinpanolla.
:::

## Omat kasvit

- **Lisää tämän projektin luetteloon** kopioi kasvin projektin omaan luetteloon, jossa se tallennetaan projektin mukana. Luettelossasi oleva kasvi korvaa sisäänrakennetun kasvin samalla avaimella, joten voit muuttaa sen kokoja omalle alueellesi.
- **Tuo kasviluettelo…** lukee CSV-tiedoston (tai kasvitiedoston). Se tarvitsee sarakkeen kasvitieteelliselle nimelle ja mielellään tyypin, korkeuden ja leviämän. Sarakkeiden nimet omin sanoin kelpaavat (esim. Latin, Common name, Height, Spread, Width, Zone). Pilkut, puolipisteet tai Tab-merkit sekä desimaalipilkut luetaan. Tyhjät istutuskoot, välit ja astiat saavat tyypin mukaiset oletukset.
- **Vie CSV-muodossa** tallentaa luettelosi (tai ilman sitä hakutuloksen kasvit), jotta sen voi avata taulukkolaskennassa.

Kasviluettelo luetaan kuten mikä tahansa ulkopuolinen tiedosto: kaikki, mitä se ei voi käyttää, jätetään pois ja lasketaan.

## Kasvit muissa sovelluksissa

Kasviluettelo on yksi kirjasto kaikille CadCraft-sovelluksille: BimCraft ja ModelCraft käyttävät samaa luetteloa, mutta niiden oma Lisää kirjastosta -toiminto ei vielä tarjoa kasveja. Tällä hetkellä kasvit päätyvät BIM-malliin CivilCraftin maisema-IFC:n kautta (jokainen kasvi `IfcGeographicElement`-elementtinä). Katso [Istutussuunnitelmat](topic:planting#ifc).
