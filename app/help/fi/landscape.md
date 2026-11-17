---
title: Maisematyötila
summary: Istutussuunnitelmat, tasaus, päällysteet, muurit, portaat, kastelu ja maisema-arkit samalla kohteella, samoilla pinnoilla ja samassa tiedostossa kuin siviilityö.
keywords: maisema, maisema-arkkitehtuuri, puutarha, istutus, kasvit, puut, tasaus, kovat pinnat, päällyste, kastelu, suihkuttimet, työtila, kohdesuunnittelu, maisemasuunnitelma
from: eea929d1
---

Maisematyötila tuo maisemasuunnittelun työkalut CivilCraft-kohteeseen, joka sinulla jo on: samat mittauspisteet, sama nykyinen maanpinta, sama suunniteltu pinta ja sama projektitiedosto.

## Avaa se

Valitse {{ui:Maastomalli}} › {{ui:Lisää}} › {{ui:Maisematyötila}}. Työkalurivillä näkyvät sitten **Työtila**-valinta ja **Maisema**-ryhmä, ja Maastomalli-, Suunnittelu- ja GIS-ryhmät siirtyvät syrjään tilan tekemiseksi. Valitse **Siviili** kohdasta Työtila palataksesi takaisin. CivilCraft muistaa tällä tietokoneella viimeksi käyttämäsi työtilan.

Vasemman paneelin yläosaan tulee kolme uutta osiota:

- **Kasvit**: kasviluettelo, josta etsit ja valitset sijoitettavat kasvit. Katso [Kasvilista](topic:plant-list).
- **Tasaustarkistukset**: luiskaanalyysi, virtausnuolet ja veden kertyminen. Katso [Tasaus](topic:landscape-grading).
- **Kastelu**: seuraavaksi sijoitettavat suuttimet ja putket sekä vesijohdon asetukset. Katso [Kastelu](topic:irrigation).

## Maisema-ryhmässä

| Työkalu | Mitä se tekee | Aihe |
|---|---|---|
| **Kasvi**, **Istutusalue**, **Pensasaita** | Yksittäiset kasvit, istutusalueet täytettynä kasvien välin mukaan, pensasaidat viivan varrella | [Istutus](topic:planting) |
| **Tasaa** | Tasanteet, maavallit, laskuojat ja tasausalueet korkeuspisteineen ja korkeuskäyrineen, luiska- ja virtaustarkistukset | [Tasaus](topic:landscape-grading) |
| **Kovat pinnat** | Päällysteet, polut, muurit, reunakivet, rampit ja portaat, jotka seuraavat maanpintaa | [Kovat pinnat](topic:hardscape) |
| **Alueet** | Istutetut alueet: nurmikot, istutusalueet, niityt ja maanpeitekasvit rakenteineen, leikattuna kovien pintojen ympäriltä | [Istutusalueet](topic:planted-areas) |
| **Korkeudet** | Maanpinnan muokkaajat järjestyksessä leikkauksineen ja täytöineen, korkeuspisteet, kaltevuusnuolet, leikkaussuorat | [Maanpinnan muokkaajat](topic:ground-modifiers), [Leikkaukset](topic:landscape-sections) |
| **Kastelu** | Suuttimet, putket, venttiilit, tippaletkut, syöttö, kattavuus ja hydraulinen tarkistus | [Kastelu](topic:irrigation) |
| **Lisää** | Viivasta (kohteet pysyvät linkitettyinä viivageometriaan), kasviluettelo, kasvitaulukko, laskentataulukot, kasvien grafiikka, vapaamuotoiset kohteet, maisema-arkit ja julkaisusarja, IFC-vienti sekä kasvikoko ja tunnisteet | [Viivageometriasta tehdyt kohteet](topic:objects-from-lines), [Kasvitietueet](topic:plant-records), [Laskentataulukot](topic:worksheets), [Maisema-arkit](topic:landscape-sheets), [Vapaamuotoiset kohteet](topic:freeform-objects) |

Kaikki lisäämäsi on yksi kumoamisvaihe, se tallentuu projektitiedostoon ja piirtyy suunnitelmalle tasoille nimillä `L-PLNT-…`, `L-GRAD-…`, `L-HARD-…` ja `L-IRRG-…`. Siksi myös DXF-, DWG- ja PDF-viennit sisältävät sen.

## Yksi pinta kaikelle

Tasanteet, maavallit, laskuojat, tasausalueet, päällysteet ja polut tasataan **suunniteltuun pintaan**, samaan, jota käytävät ja alustat käyttävät. **Nykyinen maanpinta** ei muutu koskaan. Kasvit sijaitsevat sen maanpinnan päällä, joka niiden alla on, joten ne siirtyvät, kun tasaus muuttuu. Maisematasaus lasketaan mukaan kaikkeen muuhun maansiirtoon.

:::tip
Uusi tässä? [Puutarhan suunnittelu alusta loppuun](topic:landscape-walkthrough) käy koko työtilan läpi esimerkkikohteella.
:::
