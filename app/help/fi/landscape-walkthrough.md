---
title: Puutarhan suunnittelu alusta loppuun
summary: Maisema-arkkitehdin kymmenen vaihetta mittauksesta julkaisusarjaan sekä se, mitä Maisematyötila tekee kussakin vaiheessa tänään ja mitä se ei vielä tee.
keywords: opastus, läpikäynti, ohje, puutarhasuunnittelu, maisemasuunnittelu, aloittaminen, esimerkki, mallikohde, vaihe vaiheelta, mittaus, viivageometria, maasto, istutus, luettelo, arkit, julkaise, yksi projekti
from: 87900bf5
---

Maisemasuunnittelu on kiertävä prosessi: mittaus, luonnos, viivageometria, maanpinta, alueet, korkeudet, istutus, luettelot, arkit ja takaisin alkuun. Nämä ovat kymmenen vaihetta ja se, mitä kullekin on olemassa. Jos vaiheessa on aukko, se mainitaan lopussa kohdassa **Ei vielä toteutettu** eikä piiloteta vaiheen sisään.

Voit seurata mukana mallikohteessa tai omalla mittauspiirustuksellasi. Omalla piirustuksella aloita vaiheesta 1.

## 1. Tuo mittaus

{{ui:Maastomalli}} › {{ui:Viivageometria piirustuksesta…}}, valitse mittauspiirustus (DWG 2000–2018 tai DXF). Tarkista yksiköt, ota korkeuskäyrät, 3D-polylinjat ja rajat maastomallia varten sekä pistelohkot mittauspisteiksi. **Mittauksen korkeudet ja tarkistus** -osio lukee tekstinä tai attribuuttina kirjoitetut korkeudet ja luettelee, mikä näyttää väärältä (yksiköt, koordinaattijärjestelmä, etäisyys nollapisteestä, tasaiset korkeuskäyrät, outot korkeudet, kaksinkertaiset pisteet), ennen kuin lisäät mitään. Katso [Tarkista mittauspiirustus tuonnin yhteydessä](topic:survey-check) ja [Avaa DWG tai DXF viivageometriana](topic:open-dwg-dxf). Aseta koordinaattijärjestelmä kohdasta {{ui:Koordinaattijärjestelmä…}}.

## 2. Käsinpiirretyt luonnokset

Paperilla oleva arkki, kuten vanha mittaus tai merkitty tulostus, tuodaan kohdasta {{ui:Skannaa…}} (Aloita skannauksesta). Se sijoitetaan mittakaavaan tai tunnettuihin koordinaatteihin suunnitelman alle, ja sen voi jäljittää viivageometriaksi. ModelCraft lukee käsinpiirretyn luonnoksen valokuvan (Tiedosto › Tuo luonnoksen valokuva…). CivilCraftissa itsessään ei ole työkalua käsinpiirretylle luonnokselle: aseta arkki suunnitelman alle ja piirrä sen päälle.

## 3. Luonnoksesta viivageometriaksi

Piirrä ominaisuusviivat ja reunaviivat mittauksen päälle CivilCraftissa tai piirrä ne 2D-piirustukseen. Maisema › Lisää › {{ui:Viivasta}} muuttaa viivan päällysteeksi, istutusalueeksi, muuriksi, portaiksi, ominaisuusviivaksi ja muuksi kohteeksi. Kohteet pysyvät linkitettyinä: siirrä viivaa, ja kohde seuraa. Katso [Viivageometriasta tehdyt kohteet](topic:objects-from-lines). SuperCad Studiossa avaat kohteen, piirustuksen ja rakennusmallin yhdessä projektissa. **Maisematyötilassa** on kaikkien työkalut, ja 2D-piirustuksesta valittu viiva voi tulla maisemakohteeksi, joka seuraa sitä (Ctrl+K, {{ui:Maisemakohde valitusta piirustusviivasta}}).

## 4. Suunniteltu maanpinta

Avaa {{ui:Maastomalli}} › {{ui:Lisää}} › {{ui:Maisematyötila}}. Rakenna suunniteltu maanpinta {{ui:Tasanne}}-, {{ui:Maavalli}}- ja {{ui:Laskuoja}}-kohteilla sekä tasausalueilla, joilla on korkeuspisteitä ja korkeuskäyriä. Lisäämäsi päällysteet, polut, muurit, rampit ja portaat tasataan samaan suunniteltuun pintaan. Nykyinen maanpinta ei muutu koskaan. {{ui:Korkeudet}} › {{ui:Maanpinnan muokkaajat…}} luettelee kaiken, mikä muotoilee maanpintaa, yhdessä järjestyksessä, ja kunkin leikkauksen ja täytön. Katso [Tasaus](topic:landscape-grading) ja [Maanpinnan muokkaajat ja elävät korkeudet](topic:ground-modifiers).

## 5. Päällysteet ja istutusalueet

{{ui:Kovat pinnat}} › {{ui:Päällyste}}, {{ui:Polku}}, {{ui:Muuri}}, {{ui:Reunakivi}}, {{ui:Ramppi}} ja {{ui:Portaat}}. {{ui:Alueet}} piirtää nurmikon, istutusalueen, niityn tai maanpeitekasvillisuuden rakenteineen. Se leikkaa itsensä päällysteen, muurien ja portaiden ympäriltä. {{ui:Istutusalue}} täyttää alueen kasvien välin mukaisesti kasviseoksesta. Katso [Kovat pinnat](topic:hardscape), [Istutusalueet](topic:planted-areas) ja [Istutus](topic:planting).

## 6. Korkeudet, luiskat ja liitokset

**Tasaustarkistuksissa** rastita **Luiskaanalyysi** ja **Virtausnuolet ja veden kertyminen**. Jos vesi kertyy terassin viereen, lisää {{ui:Laskuoja}} sen ympärille. Ominaisuudet kertovat, montako nousua portaat tarvitsevat ja sopivatko ne, sekä missä polku on jyrkempi kuin sen raja. **Ongelmat**-paneeli luettelee, missä kohteet kohtaavat huonosti: muuri ylittää korkeutensa, istutusalue on päällysteen yläpuolella, portaat eivät osu välitasolleen. {{ui:Korkeuspiste}} ja {{ui:Kaltevuusnuoli}} merkitsevät maanpinnan ja päivittyvät itse.

## 7. Istutus

Kohdassa **Kasvit** etsi kasvilistaa (muutama sata lajia tai oma luettelosi), valitse yksi ja käytä työkalua {{ui:Kasvi}}, {{ui:Istutusalue}} tai {{ui:Pensasaita}}. Aseta kasvin koko ja tunnisteet kohdasta Lisää. Lisää › {{ui:Kasvitaulukko}} muokkaa omia tietueitasi: lajikkeet, toimitettavat koot, tiheys ja määrittelymuistiinpanot. Jokainen tietue voi sisältää oman merkin ja 3D-mallin (OBJ, STL tai GLB). Lisää › {{ui:Kasvien grafiikka}} piirtää kasvit yksinkertaisemmin karkeammissa mittakaavoissa. Katso [Kasvilista](topic:plant-list), [Kasvitietueet](topic:plant-records) ja [Kasvien grafiikka](topic:plant-graphics).

## 8. Määrät ja luettelot

Lisää › {{ui:Laskentataulukot}}: kasvi- ja kovien pintojen luettelot sekä omasi pysyvät kohteisiin linkitettyinä. Tallenna ne CSV- tai XLSX-muodossa tai laita arkeille (katso [Laskentataulukot](topic:worksheets)). Lisää › {{ui:Kasviluettelo…}} lähettää lukumäärät TakeoffCraftille. Kovien pintojen määrät ovat päällysteen, muurin ja portaiden Ominaisuuksissa. Kastelulla on oma osaluettelo: {{ui:Kastelu}} › **Tarkista järjestelmä…**. Katso [Kastelu](topic:irrigation).

## 9. Piirustukset ja arkit

Lisää › {{ui:Maisema-arkit…}}: istutus-, tasaus- ja kastelusuunnitelmat detaljeineen. {{ui:Korkeudet}} › {{ui:Leikkaussuora}} piirtää leikkaukset maanpinnan, muurien, rakenteiden, portaiden ja kasvien läpi. Katso [Maisema-arkit](topic:landscape-sheets) ja [Maisemaleikkaukset ja julkaisusarja](topic:landscape-sections).

## 10. Julkaise

{{ui:Julkaisusarja (.zip)}} arkit-valintaikkunassa tekee yhden PDF-tiedoston, jossa on arkkiluettelo, ja DWG jokaista arkkia kohti. Lisää › {{ui:Vie maisema-IFC}} antaa BimCraftille kasvit ja kovat pinnat. Tallenna projekti: kaikki on yhdessä tiedostossa.

## Muuta yhtä asiaa: portaikko

Kaiken pitäminen yhdessä projektissa tarkoittaa, että muutos kulkee läpi. Kokeile sitä portaikolla kahden terassin välillä:

1. Piirrä portaikon viiva ominaisuusviivana (tai piirustuksen viivana) ja valitse Maisema › Lisää › {{ui:Viivasta}} › {{ui:Portaat}}. Portaiden Ominaisuuksissa rastita **Muotoilee maanpintaa** ja aseta alin ja ylin korkeus kahteen terassiin.
2. Piirrä {{ui:Alueet}}-työkalulla istutusalue portaikon viereen ja alle sekä päällyste terasseille. Istutusalue leikkaa itsensä portaiden ja päällysteen ympäriltä, ja kasviluettelo laskee vain istutetut kasvit.
3. Nosta portaikon ylintä korkeutta Ominaisuuksissa. Suunniteltu maanpinta, korkeuspisteet, kaltevuusnuolet sekä leikkaus ja täyttö muuttuvat heti. Jos portaikko ei enää osu ylempään terassiin, Ongelmat-paneeli kertoo, kuinka paljon.
4. Siirrä portaikon viivaa. Portaat seuraavat viivaansa samassa kumoamisvaiheessa. Istutusalue leikataan uudelleen ja lasketaan uudelleen, ja laskentataulukot ja luettelot näyttävät uudet luvut.
5. Paina Ctrl+Z kerran: viiva, portaat, maanpinta ja istutusalue palautuvat yhdessä.

Katso [Maanpinnan muokkaajat ja elävät korkeudet](topic:ground-modifiers), [Istutusalueet](topic:planted-areas) ja [Laskentataulukot](topic:worksheets).

## Ei vielä toteutettu

Nämä on pyydetty, mutta niitä ei ole tässä versiossa:

- Muurit, jotka muotoilevat maanpintaa (ne ilmoittavat, missä ne kohtaavat sen, ja niiden yläreuna voi seurata sitä).
- Oman Kirjaston kasvilistan muokkaaminen sovelluksessa (muokkaa projektin luetteloa ja tallenna se kasvitiedostona).
- Oman GLB-kasvimallisi tekstuurit ja värit (muoto luetaan, ja käytetään kasvin väriä).

Kaikki työkalut ovat kohdassa [Maisematyötila](topic:landscape).
