---
title: Maakaapelit
summary: Kaapelireitit ojissa tukien ja laitteiden välillä, peitesyvyys ja risteykset, jatkokset kelan pituuden mukaan sekä oja- ja kaapelimäärät.
keywords: maakaapeli, kaapelireitti, oja, putki, peitesyvyys, risteys, putkiristeys, jatkos, kela, kaappi, muuntaja, lähde, jännitehäviö
from: adfd2717
---

## Piirrä kaapelireitti

1. Sijoita laitteet ensin, jos kaapeli päättyy kaappiin, muuntajaan tai jatkokseen: {{ui:Laitteet}}, sitten napsauta.
2. Napsauta {{ui:Kaapeli}} ja napsauta reitti; aloita ja lopeta tuella tai laitteella, jotta se yhdistyy siihen. {{key:Enter}} lopettaa.

Ominaisuuksissa valitse **kaapeli**, **ojatyyppi**, montako **kaapelia vierekkäin** ja **löysyys** (%). Reitti näyttää pituutensa, mistä se alkaa ja päättyy sekä siinä kulkevan virran.

## Mitä tarkistetaan

- **Peitesyvyys**: kaapelin yläosa maanpinnan alapuolella koko reitin matkalla, verrattuna ojatyypin peitesyvyyteen (tai säännöstön pienimpään peitesyvyyteen).
- **Risteykset**: kohdassa, jossa reitti risteää CivilCraft-putken tai toisen kaapelin kanssa, niiden välinen rako verrataan etäisyyssääntöön: reitin oma **Risteysetäisyys** (sen ominaisuuksissa), kun valitset sellaisen, muuten säännöstön **Underground crossings** -sääntö (esimerkkisäännöstöt käyttävät *Underground crossing*, 0.3 m), muuten ojatyypin rako muihin palveluihin. Kaksi risteävää kaapelia noudattavat niistä suurempaa. Ylitetty ilmajohto luetellaan tiedoksi, ja kaapeli näkyy sen linjan profiilissa.
- **Jatkokset**: yksi kaapelin kelan pituuden välein (löysyys mukaan lukien), kun kaapelikohde antaa kelan pituuden.

## Laitteet

Laitteella on kirjastokohde, **kuorma** (kW) ja sen **tehokerroin**, ja se voi olla **lähde**: verkko syötetään sieltä. Lähteen jännite tulee sen kirjastokohteesta, tai muuten siitä linjasta tai kaapelista, jota se syöttää.

## Määrät

{{ui:Lisää}} › {{ui:Määrät…}} laskee kaapelin (reitin pituus × (1 + löysyys) × vierekkäiset kaapelit + nousu kummassakin päässä), ojan tyypin mukaan kaivun, pohjahiekan ja takaisintäytön tilavuudet, suojaputket ja jatkokset sekä ilmajohtojen johtimet, tuet ja laitteet.
