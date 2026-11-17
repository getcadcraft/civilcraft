---
title: Istutussuunnitelmat ja luettelot
summary: Sijoita yksittäisiä kasveja, istutusalueita, joita täytetään kasvien välin mukaan prosenttiosuuksin sekoitetuilla kasveilla, ja pensasaitoja. Nimeä ne ja laske ne kasviluetteloon taulukkolaskentaa tai TakeoffCraftia varten.
keywords: istutussuunnitelma, kasviluettelo, istutusalue, massaistutus, pensasaita, puu, pensas, maanpeitekasvi, väli, kolmiomainen väli, kasvimäärä, määrät, tunnisteet, latvus, kasvisymbolit, ifc, määrälaskenta
from: ab49eab5
---

## Sijoita kasveja

1. Valitse kasvi **Kasvit**-kohdasta vasemmalla.
2. Klikkaa {{ui:Kasvi}} ja klikkaa suunnitelmalla. Jokainen napsautus sijoittaa yhden kasvin. Lopeta painamalla {{key:Esc}}.

Kasvin symboli piirretään sen leviämän kokoisena aikuisena. Lisää › {{ui:Näytä istutuskoossa}} piirtää jokaisen kasvin sen istutuskokoisena. Puut seisovat maassa niiden alla: kun myöhemmin muokkaat maanpintaa, ne seuraavat sitä. Jos haluat kiinnittää kasvin tiettyyn korkeuteen, kirjoita se **Korkeustaso**-kenttään Ominaisuudet-kohdassa.

## Istutusalueet

1. Valitse pääkasvi, klikkaa {{ui:Istutusalue}} ja klikkaa alueen kulmat. Paina {{key:Enter}} (tai klikkaa ensimmäistä kulmaa uudelleen) sulkeaksesi sen.
2. Alue täyttyy tällä kasvilla sen välin mukaan **kolmiomaisessa** kuviossa (tavallinen: jokainen kasvi on yhtä kaukana kuudesta muusta), puolen välin päässä reunasta.
3. Ominaisuudet-kohdassa **Lisää kasvi** sekoittaa vasemmalla valitun kasvin mukaan. Aseta kunkin kasvin **Osuus %**: alue ottaa tarkalleen sen verran kutakin, levitettynä koko alueelle. **Sekoita uudelleen** arpoo, minne ne menevät.

**Väli** tyhjänä käyttää kasvien omaa väliä (painotettuna osuuksilla). Kirjoita yksi arvo, jos haluat käyttää sitä jokaiselle kasville. **Kuvio** voi olla neliö, ja **Rivisuunta** kääntää rivit.

## Pensasaidat

Valitse pensasaidan kasvi, klikkaa {{ui:Pensasaita}}, klikkaa pensasaidan varrella ja paina {{key:Enter}}. Kasvit sijoittuvat linjalle niiden välillä, keskitettynä niin, että molemmissa päissä on sama marginaali. Pensasaita voi olla **kaksi riviä vuorottain**, tietyn välimatkan päässä toisistaan.

## Tunnisteet

Yksittäiset kasvit saavat tunnisteen tunnisteasetuksella (oletuksena `{name}`). Kirjoita oma tunniste yhdelle kasville Ominaisuudet-kohdassa. Istutusalueiden tunnisteessa on kunkin kasvin määrä ja pensasaidoissa niiden määrä. Lisää › {{ui:Kasvitunnisteet}} kytkee tunnisteet päälle ja pois. Tunnistekentät: `{name}`, `{botanical}`, `{size}` (astia), `{qty}`, `{height}`, `{spread}`, `{container}`.

## Kasviluettelo

Lisää › {{ui:Kasviluettelo…}} laskee jokaisen kasvin lajin mukaan yksittäisistä kasveista, istutusalueista ja pensasaidoista yhdessä, istutuskoon kanssa. Tallenna se **CSV**-tiedostona tai **XLSX**-tiedostona, tai **Lähetä TakeoffCraftiin**: määräluettelotiedosto, jonka TakeoffCraft avaa kasvien hinnoittelua varten (kovien pintojen ja kastelun määrät vieressä).

## IFC

Lisää › {{ui:Vie maisema-IFC}} tallentaa maiseman IFC-tiedostona (IFC 4.3), jonka BIM-malli voi sisältää. Jokainen kasvi on `IfcGeographicElement`-elementti tyyppiä VEGETATION, tyypitetty lajinsa mukaan kasvin ominaisuuksineen (kasvitieteellinen nimi, koot, kestävyys, vesi, valo). Jokainen istutusalue ja pensasaita on yksi elementti omine määrineen tontilla. BimCraft avaa sen rakennuksen viereen.
