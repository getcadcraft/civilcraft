---
title: Työkalurivin ohje
summary: Jokainen CivilCraftin työkalurivin painike, mitä se tekee, sen pikanäppäin ja milloin se on harmaana tai kieltäytyy toimimasta.
keywords: työkalurivi, painikkeet, komennot, työkalut, tiedosto, vienti, maastomalli, suunnittelu, muokkaus, näkymä, valikko
from: 4c4352bc
---

Työkalurivi kulkee sovelluksen yläreunassa seitsemänä ryhmänä. Jokainen painike näyttää vihjeensä ja pikanäppäimensä, kun osoitat sitä.

## Tiedosto

| Painike | Pikanäppäin | Mitä se tekee |
|---|---|---|
| {{ui:Uusi}} | ei | Aloittaa tyhjän projektin. Kysyy ensin, jos tallentamattomia muutoksia on. |
| {{ui:Avaa}} | {{key:Mod+O}} | Avaa pistetiedoston (CSV, TXT), LandXML:n tai CivilCraft-projektin. |
| {{ui:Tallenna}} | {{key:Mod+S}} | Lataa projektin tiedostona `<name>.civilcraft.json`. |

## Vienti

| Painike | Pikanäppäin | Mitä se tekee |
|---|---|---|
| {{ui:LandXML}} | ei | Lataa `<name>.xml`: pisteet, pinnat, linjaukset, profiilit ja putkiverkon LandXML 1.2 -muodossa. ”Ei vietävää vielä.” kun projekti on tyhjä. |
| {{ui:DXF}} | ei | Lataa `<name>.dxf`: suunnitelman viivageometria R12 DXF:nä. |
| {{ui:PDF}} | {{key:Mod+P}} | Avaa ikkunan **Plottaa suunnitelma PDF:ksi**. ”Plotattavaa ei ole vielä.” kun projekti on tyhjä. |

## Maastomalli

| Painike | Pikanäppäin | Mitä se tekee |
|---|---|---|
| {{ui:Taitelinja}} | {{key:B}} | Napsauta pisteitä järjestyksessä, {{key:Enter}} päättää. Taitelinja saa pisteiden korkeudet. |
| {{ui:Raja}} | {{key:O}} | Napsauta ulkoisen rajan kulmat, {{key:Enter}} päättää. Korvaa minkä tahansa rajan. |

Molemmat sanovat ”Pintaa ei ole vielä: avaa ensin pisteet.” kun maastomallia ei ole.

## Suunnittelu

| Painike | Pikanäppäin | Mitä se tekee |
|---|---|---|
| {{ui:Linjaus}} | {{key:A}} | Napsauta PI:t järjestyksessä, {{key:Enter}} päättää. |
| {{ui:Alusta}} | {{key:G}} | Napsauta alustan kulmat, {{key:Enter}} päättää. Kuten maastotyökalut, varoittaa, jos pintaa ei ole; alusta tasataan vain pinnalle. |
| {{ui:Putket}} | {{key:P}} | Napsauta kaivoja ylävirrasta alas (napsauta olemassa olevaa liittääksesi sen), {{key:Enter}} päättää. |
| {{ui:Pituusleikkaus}} | {{key:R}} | Näyttää tai piilottaa pituusleikkausnäkymän suunnitelman alla. |

## Muokkaa

| Painike | Pikanäppäin | Mitä se tekee |
|---|---|---|
| {{ui:Kumoa}} | {{key:Mod+Z}} | Kumoaa viimeisen muutoksen (enintään 200). Harmaana, kun kumottavaa ei ole. |
| {{ui:Tee uudelleen}} | {{key:Mod+Y}} | Tekee uudelleen sen, mikä kumottiin. Harmaana, kun uudelleen tehtävää ei ole. |
| {{ui:Kopioi}} | {{key:Mod+C}} | Kopioi valitut pisteet ja asettaa ne leikepöydälle pisterivinä, joita taulukkolaskenta ottaa vastaan. Harmaana, kunnes pisteitä on valittu. |
| {{ui:Liitä}} | {{key:Mod+V}} | Liittää pisteitä: ne seuraavat osoitinta, ja napsautus asettaa ne paikalleen numeroilla, joita muilla pisteillä ei ole. Taulukkolaskennasta kopioidut pisterivit liittyvät myös. |
| {{ui:Lisää}} | ei | Avaa alla olevan valikon. |

{{ui:Lisää}}-valikko:

| Kohta | Pikanäppäin | Mitä se tekee |
|---|---|---|
| {{ui:Leikkaa}} | {{key:Mod+X}} | Kopioi valitut pisteet ja poistaa ne (yksi kumoamisaskel). |
| {{ui:Kopioi}} | {{key:Mod+C}} | Kuten {{ui:Kopioi}}-painike. |
| {{ui:Liitä}} | {{key:Mod+V}} | Kuten {{ui:Liitä}}-painike. |
| {{ui:Liitä samaan paikkaan}} | {{key:Mod+Shift+V}} | Liittää pisteet niiden omiin koordinaatteihin, numeroilla joita muilla pisteillä ei ole. |
| {{ui:Monista}} | {{key:Mod+D}} | Valittujen pisteiden kopio seuraa osoitinta; napsauta, mihin se menee. Leikepöytä jätetään rauhaan. |
| {{ui:Poista}} | {{key:Delete}} | Poistaa valitut pisteet tai valitun linjauksen, alustan, kaivon (putkineen), putken tai PVI:n. |
| {{ui:Valitse kaikki pisteet}} | {{key:Mod+A}} | Valitsee kaikki pisteet. |
| {{ui:Poista valinta}} | {{key:Esc}} | Tyhjentää valinnan. |

Kohta, joka ei voi toimia juuri nyt, on harmaana, ja sen vihje kertoo syyn. Lisätietoja: [Valitse, kopioi ja liitä pisteitä](topic:copy-paste-points).

Kumoaminen kattaa suunnitelman, maastoasetusten ja pisteiden muokkaukset (liittäminen, leikkaus, monistaminen, poisto). Se ei kata näyttöasetuksia, eikä minkä tahansa tiedoston avaaminen tai tuominen tyhjennä sitä.

## GIS

| Painike | Pikanäppäin | Mitä se tekee |
|---|---|---|
| {{ui:Koordinaatit}} | ei | Avaa ikkunan **Koordinaattijärjestelmä**: kerro, missä järjestelmässä projekti on, tai käytä maan- tai paikallisia koordinaatteja. Katso [Aseta projektin koordinaattijärjestelmä](topic:coordinate-systems) ja [Maan- ja paikalliset koordinaatit](topic:ground-and-local-coordinates). |
| {{ui:Tuo}} | ei | Tuo GIS-aineistoa: shapefile-tiedostot, GeoJSON, GeoPackage, korkeusruudukot ja LiDAR. Katso [Tuo GIS-aineistoa](topic:gis-import). |
| {{ui:Vie}} | ei | Vie toteutuneet tiedot GIS-osastolle. Katso [Vie toteutuneet tiedot GIS:lle](topic:gis-export). |
| {{ui:Analysoi}} | ei | Avaa GIS-analyysipaneelin: puskuri, päällekkäisyys, paikkaliitos, valinta attribuutin mukaan ja mittaus. Katso [Analysoi GIS-tasoja](topic:gis-analysis). |
| {{ui:Attribuuttitaulukko}} | ei | Kohdassa Maastomalli › Lisää. Avaa GIS-tason attribuuttitaulukon: lajittelu, suodatus, valinta, muokkaus, kenttien lisääminen, laskenta ja tallennus CSV:nä. Katso [Työskentele tason attribuuttitaulukon kanssa](topic:gis-table). |
| {{ui:Kartta}} | ei | Avaa ikkunan **Karttatasot**: georeferoidun kuvan tai lisäämäsi karttapalvelimet, jotka piirtyvät suunnitelman alle. Katso [Näytä karttatasot suunnitelman alla](topic:map-layers). |

GIS-työkalut latautuvat ensimmäisen kerran, kun käytät jotakin näistä painikkeista, avaat GIS-tiedoston tai avaat projektin, jolla on koordinaattijärjestelmä tai GIS-tasoja.

## Näkymä

| Painike | Pikanäppäin | Mitä se tekee |
|---|---|---|
| {{ui:Valitse}} | {{key:V}} tai {{key:Esc}} | Napsauta valitaksesi linjauksia, alustoja, kaivoja, putkia ja pisteitä ({{key:Shift}} ja napsautus tai veto lisää pisteitä). Vedä otteita siirtääksesi PI:t, alustan kulmat ja kaivot. |
| {{ui:Sovita}} | {{key:F}} | Zoomaa suunnitelman näyttämään pinnan, pisteet, linjaukset ja alustat (3D-näkymässä: näyttää kaiken). |
| {{ui:3D}} | {{key:D}} | Näyttää kohteen 3D:nä suunnitelman päällä tai palaa suunnitelmaan. Palkki 3D-näkymän yllä asettaa näkymän, liioittelun, värityksen ja sen, mitä näytetään, ja vie GLB- tai OBJ-tiedostoksi. Katso [Tarkastele kohdetta 3D:nä](topic:site-3d). |

## Painikkeet paneeleissa

| Painike | Missä | Mitä se tekee |
|---|---|---|
| Avaa esimerkkikohde | Laatikko tyhjällä suunnitelmalla | Lataa esimerkkimittauksen (vaatii yhteyden, ellei CivilCraftia ole tallennettu käytettäväksi offline-tilassa) |
| {{ui:Poista raja}} | Vasen paneeli, Maastomalli | Poistaa ulkoisen rajan |
| {{ui:Poista piirretyt taitelinjat}} | Vasen paneeli, Maastomalli | Poistaa kaikki työkalulla piirretyt taitelinjat (ei taitelinjaryhmiä) |
| {{ui:Rakenna maastomalli uudelleen pisteistä}} | Vasen paneeli, Maastomalli (vain LandXML-pinta) | Pudottaa LandXML-TIN:n ja rakentaa pisteistä; ei voi kumota |
| {{ui:Aloita maanpinnasta}} | Oikea paneeli, Linjaus | Aloittaa suunnittelun pituusleikkauksen, jossa on PVI maanpinnalla kummassakin päässä |
| {{ui:Pituusleikkausnäkymä}} | Oikea paneeli, Linjaus | Avaa tämän linjauksen pituusleikkausnäkymän |
| {{ui:Lisää PVI:t}} | Profiilipalkki | Kun painike on painettuna, napsautus profiilissa lisää PVI:n |
| {{ui:Aseta kaikki pohjan korot säännöistä}} | Oikea paneeli, Putkiverkko | Asettaa kaikkien putkien pohjan korot säännöistä |
| {{ui:Aseta sen pohjan korot säännöistä}} | Oikea paneeli, Putki | Asettaa tämän putken pohjan korot säännöistä |
