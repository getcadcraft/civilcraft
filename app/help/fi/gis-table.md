---
title: Työskentele tason attribuuttitaulukon kanssa
summary: Näe GIS-tason jokainen kohde taulukkona, lajittele ja suodata sitä, valitse rivejä ja kohteita yhdessä, korjaa arvoja, lisää kenttiä, laske uusia arvoja ja tallenna taulukko CSV-tiedostona.
keywords: attribuuttitaulukko, taulukko, kentät, sarakkeet, rivit, lajittelu, suodatus, lauseke, valinta, muokkaus, kenttälaskuri, laske, lisää kenttä, nimeä kenttä uudelleen, poista kenttä, csv, vienti, gis, shapefile, geopackage, symbologia
from: fd9d6c11
---

Avaa tason taulukko sen **kolmen pisteen** valikosta GIS-tasojen luettelossa ({{ui:Attribuuttitaulukko…}}), kohdasta Maasto › {{ui:Lisää}} › {{ui:Attribuuttitaulukko}}, tai kirjoittamalla `ATTRIBUTES`, `ATTTABLE` tai `TABLE`. Taulukko avautuu piirustuksen viereen ja pysyy auki työn ajan. Vain näkyvät rivit piirretään, joten tuhansia kohteita sisältävä taso avautuu ja vierii nopeasti.

## Lajittele, suodata ja valitse

- **Lajittelu:** napsauta sarakkeen otsikkoa. Toinen napsautus kääntää järjestyksen, kolmas palauttaa tiedoston alkuperäisen järjestyksen. Tyhjät arvot jäävät aina alareunaan. Lajittelu muuttaa vain näkymää, ei koskaan tasoa.
- **Suodatus:** kirjoita suodatuskenttään. Lauseke, kuten `AREA > 500 and USE = 'Res'`, pitää rivit, joilla se on tosi (samat sanat kuin [Analysoi GIS-tasot](topic:gis-analysis)-kohdan Valinta-välilehdellä: `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Mikä tahansa, joka ei ole lauseke, kuten `oak maple`, etsii noita sanoja jokaisesta sarakkeesta.
- **Rivien valinta:** napsauta riviä. Ctrl+napsautus lisää tai poistaa yhden, Shift+napsautus valitsee jakson, ja {{ui:Valitse näkyvät rivit}} ottaa kaikki suodattimen läpäisevät rivit. Valitut kohteet piirtyvät suunnitelmaan, ja suunnitelman kohteen napsautus valitsee sen rivin täällä.
- Kun rivejä on valittu, voit {{ui:Zoomaa}} niihin, tehdä niistä **tason valinnasta** ja lukea kokonaispinta-alan tai pituuden tilarivillä.

## Korjaa arvoja

Kaksoisnapsauta solua (tai siirry siihen nuolinäppäimillä ja paina Enter), kirjoita uusi arvo ja paina Enter. Esc jättää sen ennalleen. Arvon on sovittava sarakkeeseen: luvut lukuina, päivämäärät muodossa `YYYY-MM-DD`, kyllä/ei kuten yes, no, true tai false. Arvo, joka ei sovi, hylätään lauseella eikä mitään muutu. Tyhjä ruutu tekee arvosta tyhjän. Jokainen muokkaus on yksi kumoamisvaihe: {{ui:Kumoa}} ja {{ui:Tee uudelleen}} ovat taulukon alareunassa, ja Ctrl+Z toimii suunnitelmassa.

## Kentät

Kohdassa **Kentät** voit lisätä kentän (teksti, numero, päivämäärä tai kyllä/ei), nimetä sen uudelleen tai poistaa sen. Uusi kenttä alkaa tyhjänä. Uudelleennimeäminen seuraa mukana: tason nimiökenttä ja [attribuutin mukainen tyyli](topic:gis-symbology) siirtyvät uuteen nimeen, ja kentän poistaminen poistaa sitä käyttävän nimiön ja tyylin. Jokainen on yksi kumoamisvaihe, joka palauttaa kaiken.

## Kenttälaskuri

Kirjoittaa arvon jokaiselle riville (tai vain valituille riveille) rivin muiden kenttien, geometrian ja muutaman funktion perusteella. Valitse olemassa oleva kenttä tai **Uusi kenttä…** ja anna sille nimi ja tyyppi. Mitään ei suoriteta koodina: lauseke luetaan pienellä jäsentimellä, jossa on kiinteä funktiolista.

| Ryhmä | Sanat |
|---|---|
| Luvut | `+ - * /`, sulkeet, `abs round(x, digits) floor ceil sqrt pow min max` |
| Teksti | `upper lower trim len substr(text, from, count) left right replace concat` (teksti kirjoitetaan 'yksinkertaisiin lainausmerkkeihin'; kenttänimi, jossa on välilyöntejä, kirjoitetaan "kaksinkertaisiin lainausmerkkeihin" tai [hakasulkeisiin]) |
| Valinta | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Päivämäärät | `year month day` arvosta muodossa `YYYY-MM-DD` |
| Geometria | `$area $perimeter $length $x $y $vertices`, projektin yksiköissä |

Tulos, jota ei voi tallentaa kentän tyyppiin (teksti numerokentässä), jää tyhjäksi ja lasketaan viestissä. Nollalla jakaminen antaa tyhjän arvon. Esimerkiksi `round($area / 43560, 2)` kirjoittaa neliöjaloista eekkerit.

## Vienti

{{ui:Vie CSV}} tallentaa näkemäsi rivit (suodatuksen ja lajittelun jälkeen) UTF-8-CSV-tiedostona, jonka ensimmäisellä rivillä ovat kenttänimet. Teksti, joka alkaa merkillä `=`, `+`, `-` tai `@`, saa johtavan heittomerkin, jotta taulukkolaskenta ei suorita sitä kaavana. Tason itsensä tallentamiseen käytä [Vie as-built-tiedot GIS-käyttöön](topic:gis-export).

## Rajoitukset

Taulukko näyttää tason yhdessä lajittelujärjestyksessä ja yhdellä suodattimella kerrallaan. Rivejä ei voi lisätä eikä poistaa täällä (tee sen sijaan uusi taso valinnasta), geometriaa ei muokata, eikä kentän tyyppiä voi vaihtaa sen luomisen jälkeen.
