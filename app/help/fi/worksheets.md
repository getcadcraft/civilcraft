---
title: Laskentataulukot: kohteisiin liitetyt luettelot
summary: Tallennetut laskentataulukot, joiden rivit tulevat kasveista, istutetuista alueista, päällystyksestä, seinistä, portaista, maanpinnan muokkauksista tai kaikista määristä; omat sarakkeet ja kaavat, ryhmät ja summat; CSV, XLSX sekä taulukko arkeilla, aina ajan tasalla.
keywords: laskentataulukko, luettelo, kasviluettelo, kovien pintojen luettelo, määrät, sarakkeet, kaava, summa, yhteensä, lukumäärä, ryhmä, suodatin, csv, xlsx, taulukkolaskenta, taulukko arkilla
from: 11bc1bac
---

{{ui:Laskentataulukot}} (Maisema › Lisää) avaa tämän projektin laskentataulukot. Ensimmäisellä kerralla **kasviluettelo** ja **kovien pintojen ja alueiden luettelo** tehdään puolestasi. Laskentataulukko lasketaan kohteista joka kerta, kun se näytetään, kirjoitetaan tiedostoon tai laitetaan arkille: muuta istutusaluetta, ja sen määrät muuttuvat kaikkialla.

- **Rivit lähteestä**: kasvit (yksi rivi per laji, lajike ja koko), istutetut alueet, päällystys, seinät, portaat, maanpinnan muokkaukset (leikkaus ja täyttö) tai kaikki määrät.
- **Sarakkeet**: kenttä (`qty`, `area`, `botanical` tai nimi hakasulkeissa, kuten `[Net area]`) tai kaava: `+ - * / ^ %`, `&` tekstin yhdistämiseen, `= <> < <= > >=` sekä `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Kaava, jota ei voi laskea, näkyy solussaan muodossa `#ERR` (tai `#DIV/0`). CadCraftin oma jäsennin lukee kaavat; niistä mitään ei suoriteta koodina.
- **Yhteensä** per sarake (summa, lukumäärä, keskiarvo, pienin, suurin), **Ryhmittele** (väliyhteenvedot per ryhmä) ja **Vain rivit, joissa**.
- {{ui:Tallenna CSV:nä}}, {{ui:Tallenna XLSX:nä}} ja **Laita tämä laskentataulukko arkeille** (Arkit › Laskentataulukot piirtää sen taulukkona, yli niin monelle arkille kuin tarvitaan).

Kasvien ja alueiden tunnisteet käyttävät samoja kenttänimiä (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
