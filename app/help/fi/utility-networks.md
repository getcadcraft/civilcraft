---
title: Johtoverkostot ja OpenStreetMap
summary: Vesi-, viemäri-, hulevesi-, kaasu-, sähkö- ja tietoliikennejohtojen osuudet materiaalin, koon, peitesyvyyden ja omistajan kanssa; OpenStreetMap-tiedot Overpass JSON -tiedostosta; risteykset, kaivantopoikkileikkaukset ja tilavuudet; palvelutasot DWG-, DXF- ja PDF-muodoissa; IFC-putkiosuudet ja kaapeliosuudet.
keywords: johto, johdot, verkosto, osm, openstreetmap, overpass, putki, kaapeli, kaasu, viemäri, hulevesi, tietoliikenne, sähkö, vesi, paloposti, kaivo, kaivanto, risteys, selkeys, peitesyvyys, syvyys, dwg, ifc, georeferoitu, tasot
from: 8a85dace
---

Piirrä alueen maanalaiset palvelut yksi verkko kutakin palvelua kohti, tarkista missä ne risteävät ja vie ne piirustustasoina ja IFC-muodossa.

## Tee osuuksia

Avaa **Maastomalli, Lisää, Johtoverkostot...**

- **Tee osuus valinnasta** muuttaa valitun linjauksen, piirrelinjan tai putken valitsemasi palvelun osuudeksi. Täytä sen jälkeen taulukkoon materiaali, koko (mm), peitesyvyys (putken tai kaapelin yläpinnan syvyys) ja omistaja.
- **Lue OpenStreetMap-tiedot** lukee tallentamasi Overpass JSON -tiedoston (kysely, jossa on `out geom;`). Projektissa on ensin oltava koordinaattijärjestelmä, koska OpenStreetMap-sijainnit ovat leveys- ja pituuspiirejä. Luetaan putkistot (aineen mukaan), maanalaiset sähkö- ja tietoliikennekaapelit, paloposti, kaivot ja hulevesiviemärit. Muu aineisto lasketaan pois jätetyksi, ja siitä kerrotaan viestissä. Ilmajohtoja ei oteta mukaan.
- **Lisää OpenStreetMap-kartta** lisää OpenStreetMap-kartan suunnitelman alle. Se piirtyy vain, jos internetin karttatasot ovat päällä asetuksissa.

## Tarkistukset ja tulosteet

- **Risteykset**: eri palveluiden osuudet, jotka risteävät pohjakuvassa, luetellaan selkeyden kanssa niiden välillä, kun maanpinta on olemassa. Vähimmäisarvo on paikanpitäjä, jonka asetat itse; se ei ole standardin arvo.
- **Kaivanto**: jokaiselle osuudelle tulee kaivanto (putken koko ja selkeys kummallakin puolella, sivuluiska, alusrakenne) ja tilavuus. Yhteensä näkyy ikkunassa ja CSV-tiedostossa.
- **Piirustus**: osuudet ja pisteet ovat palvelutasoilla (esimerkiksi U-WATR-RUN, U-POWR-RUN), joten ne siirtyvät PDF-, DXF- ja DWG-muotoihin.
- **IFC**: osuudet viedään IFC-vientiin putkiosuuksina ja kaapeliosuuksina, mukana paloposti, venttiilit ja kaivot, yksi järjestelmä kutakin palvelua kohti projektin koordinaattijärjestelmässä.

## OpenStreetMap-tiedot

OpenStreetMap-tietojen tekijänoikeus kuuluu OpenStreetMapin osallistujille, ja ne on lisensoitu ODbL-lisenssillä. Lähdemerkintä lisätään piirustukseen, CSV-tiedostoon ja IFC-tiedostoon. Jos jaat tiedoston, joka sisältää OpenStreetMap-tietoja, säilytä lähdemerkintä ja noudata lisenssin jakamisehtoja.

## Mitä ei ole vielä toteutettu

Osuuksia ei vielä piirretä kartalle pisteittäin työkalulla, eikä risteyksiä vielä piirretä pituusleikkausnäkymään (laskenta on valmis). Syvyydet, koot ja selkeydet ovat alustavia paikanpitäjiä: käytä omien standardiesi arvoja.
