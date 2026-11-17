---
title: Formáty súborov bodov
summary: Poradie stĺpcov, ktoré CivilCraft číta, ako nájde oddeľovač a riadok hlavičky, ktoré názvy hlavičky rozpoznáva a ako sa kontrolujú riadky.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, formát súboru bodov, stĺpce, hlavička, oddeľovač
from: 84fab42e
---

Súbor bodov je čistý text, jeden bod na riadok. CivilCraft ho číta v prehliadači; nič sa nenahráva.

## Poradie stĺpcov

Písmená označujú stĺpce zľava doprava: **P** číslo alebo názov bodu, **N** severná súradnica, **E** východná súradnica, **Z** výška, **D** popis.

| Poradie | Stĺpce | Príklad riadku |
|---|---|---|
| PNEZD | bod, sever, východ, výška, popis | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | bod, východ, sever, výška, popis | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | bod, sever, východ, výška | `101,2080000.00,6150000.00,250.00` |
| PENZ | bod, východ, sever, výška | `101,6150000.00,2080000.00,250.00` |
| NEZD | sever, východ, výška, popis | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | východ, sever, výška, popis | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | sever, východ, výška | `2080000.00 6150000.00 250.00` |
| ENZ | východ, sever, výška | `6150000.00 2080000.00 250.00` |

Poradia bez P očíslujú body 1, 2, 3 … v poradí v súbore. X je východ a Y je sever.

## Oddeľovače

CivilCraft prezrie prvých 20 riadkov a vyberie prvý z týchto oddeľovačov, ktorý sa objaví aspoň na 60 % z nich: čiarka, tabulátor, bodkočiarka. Inak rozdeľuje podľa súvislých medzier.

- V súboroch s čiarkou, tabulátorom a bodkočiarkou môže pole v dvojitých úvodzovkách obsahovať oddeľovač (`"FL, NORTH"`) a `""` vnútri úvodzoviek je jedna úvodzovka.
- V súboroch oddelených medzerami môže popis na konci riadku obsahovať medzery: všetko za posledným stĺpcom súradnice je popis.
- Riadky začínajúce na `#`, `;` alebo `//` a prázdne riadky sa preskočia.
- Značka poradia bajtov na začiatku súboru sa ignoruje.

## Riadok hlavičky

Prvý riadok sa považuje za hlavičku, ak sú menej ako dve jeho polia čísla. Ak je každé pole hlavičky názov, ktorý CivilCraft rozpozná, poradie stĺpcov sa z neho prevezme ("z riadku hlavičky"). Názvy sa porovnávajú bez ohľadu na veľkosť písmen, medzery, bodky, podčiarkovníky, spojovníky a zátvorky:

| Stĺpec | Rozpoznané názvy |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Ak niektorý názov v hlavičke nie je rozpoznaný alebo názvy netvoria jedno z ôsmich poradí, hlavička sa preskočí a poradie sa odhadne podľa počtu stĺpcov.

:::warning
Hlavička, ktorá uvádza súčasne stĺpec zemepisnej šírky (`lat`, `latitude`) a stĺpec zemepisnej dĺžky (`lon`, `long`, `longitude`), sa číta ako stupne, nie ako sever a východ. Pri {{ui:Importovať}} sa body prevedú cez súradnicový systém projektu a projekt bez neho vás najprv požiada, aby ste ho zvolili. Riadky mimo ±90° zemepisnej šírky alebo ±180° zemepisnej dĺžky sa odmietnu. Pozrite [Importovať dáta GIS](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Odhad podľa počtu stĺpcov

Ak nie je použiteľná hlavička a **Stĺpce** zostávajú na {{ui:Zistiť}}:

- 5 alebo viac stĺpcov: PNEZD.
- 4 stĺpce: PNEZ, keď je prvý stĺpec celé číslo na každom kontrolovanom riadku a štvrtý je číslo; inak NEZD.
- 3 stĺpce: NEZ.

PNEZD a PENZD sa podľa čísel nedajú rozlíšiť. Odhad sa riadi podľa **Riadky bodov** v [nastaveniach CivilCraft](topic:settings): P, N, E, Z, D na začiatku, alebo P, E, N, Z, D (potom sa štyri stĺpce čítajú ako PENZ a tri ako ENZ). Dialóg hovorí "odhadnuté podľa počtu stĺpcov — skontrolujte, či nie sú sever a východ zamenené". Ak náhľad vyzerá zle, vyberte správne poradie v **Stĺpce**.

## Ako sa kontrolujú riadky

- Riadok môže popis vynechať.
- Sever a východ musia byť čísla. Výška môže byť prázdna (bod sa zachová, ale nepoužije sa v povrchu).
- Číslo bodu môže byť ľubovoľný text (aj s písmenami, napríklad `CP1`), ale nesmie byť prázdne.
- Ak sa číslo bodu opakuje, zachová sa prvý riadok a ostatné sa uvedú ako nenačítané.
- Popisy sa zachovajú až do 200 znakov; riadiace znaky sa zmenia na medzery.
- Až 200 nenačítaných riadkov sa uchová pre dialóg (zobrazí sa 25) a všetky sa spočítajú.

## Skupiny bodov

Skupina bodu je prvé slovo jeho popisu veľkými písmenami. "GRD", "grd shot" a "Grd" patria všetky do skupiny GRD. Bod bez popisu je v skupine "(bez popisu)". Pozrite [Import bodov prieskumu](topic:import-points).

## Zápis bodov

CivilCraft zatiaľ neexportuje textový súbor bodov. Body sa vyvážajú vo formáte LandXML (ako CgPoints), v súbore projektu a cez GIS {{ui:Export}} ako shapefile, GeoPackage alebo GeoJSON s poliami P, N, E, Z a D ([Export skutočného zamerania pre GIS](topic:gis-export)). Pozrite [Ešte nie je hotové](topic:not-built-yet).
