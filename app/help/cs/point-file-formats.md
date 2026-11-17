---
title: Formáty souborů s body
summary: Pořadí sloupců, které CivilCraft čte, způsob, jakým hledá oddělovač a řádek záhlaví, které názvy záhlaví rozpoznává, a jak se řádky kontrolují.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, formát souboru bodů, sloupce, záhlaví, oddělovač
from: 84fab42e
---

Soubor bodů je prostý text, jeden bod na řádek. CivilCraft ho čte v prohlížeči; nic se nenahrává.

## Pořadí sloupců

Písmena pojmenovávají sloupce zleva doprava: **P** číslo nebo název bodu, **N** Y (sever), **E** X (východ), **Z** výška, **D** popis.

| Pořadí | Sloupce | Příklad řádku |
|---|---|---|
| PNEZD | bod, Y, X, výška, popis | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | bod, X, Y, výška, popis | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | bod, Y, X, výška | `101,2080000.00,6150000.00,250.00` |
| PENZ | bod, X, Y, výška | `101,6150000.00,2080000.00,250.00` |
| NEZD | Y, X, výška, popis | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | X, Y, výška, popis | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | Y, X, výška | `2080000.00 6150000.00 250.00` |
| ENZ | X, Y, výška | `6150000.00 2080000.00 250.00` |

Pořadí bez P číslují body 1, 2, 3 … v pořadí souboru. X je východní souřadnice a Y je severní souřadnice.

## Oddělovače

CivilCraft se podívá na prvních 20 řádků a vybere první z těchto oddělovačů, který se objeví alespoň na 60 % z nich: čárka, tabulátor, středník. Jinak dělí podle souvislých mezer.

- V souborech s čárkou, tabulátorem a středníkem může pole v uvozovkách obsahovat oddělovač (`"FL, NORTH"`) a `""` uvnitř uvozovek je jeden uvozovací znak.
- V souborech oddělených mezerami může popis na konci řádku obsahovat mezery: vše za posledním sloupcem souřadnic je popis.
- Řádky začínající `#`, `;` nebo `//` a prázdné řádky se přeskakují.
- Značka pořadí bajtů (BOM) na začátku souboru se ignoruje.

## Řádek záhlaví

První řádek se bere jako záhlaví, když má méně než dvě pole, která jsou čísla. Pokud jsou všechna pole záhlaví názvy, které CivilCraft rozpoznává, pořadí sloupců se převezme z něj („z řádku záhlaví“). Názvy se porovnávají bez ohledu na velikost písmen, mezery, tečky, podtržítka, pomlčky a závorky:

| Sloupec | Rozpoznané názvy |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Pokud některý název v záhlaví není rozpoznán, nebo názvy netvoří jedno z osmi pořadí, záhlaví se přeskočí a pořadí se odhadne podle počtu sloupců.

:::warning
Záhlaví, které pojmenuje jak sloupec zeměpisné šířky (`lat`, `latitude`), tak sloupec zeměpisné délky (`lon`, `long`, `longitude`), se čte jako stupně, ne jako Y a X. Při {{ui:Importovat}} se body převedou přes souřadnicový systém projektu a projekt bez něj vás nejdřív požádá, abyste ho vybrali. Řádky mimo ±90° zeměpisné šířky nebo ±180° zeměpisné délky se odmítnou. Viz [Import dat GIS](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Odhad podle počtu sloupců

Bez použitelného záhlaví a při **Sloupce** ponechaných na {{ui:Zjistit}}:

- 5 a více sloupců: PNEZD.
- 4 sloupce: PNEZ, když je první sloupec celé číslo na každém vzorkovaném řádku a čtvrtý je číslo; jinak NEZD.
- 3 sloupce: NEZ.

PNEZD a PENZD se z čísel nedají rozlišit. Odhad se řídí **Řádky bodů** v [nastavení CivilCraft](topic:settings): P, N, E, Z, D na začátku, nebo P, E, N, Z, D (pak se čtyři sloupce čtou jako PENZ a tři jako ENZ). Dialog hlásí „odhadnuto podle počtu sloupců — zkontrolujte, zda nejsou zaměněny sever a východ“. Pokud náhled vypadá špatně, vyberte správné pořadí v **Sloupce**.

## Jak se řádky kontrolují

- Řádek může popis vynechat.
- Y a X musí být čísla. Výška může být prázdná (bod se zachová, ale do povrchu se nepoužije).
- Číslo bodu může být jakýkoli text (i písmena, například `CP1`), ale nesmí být prázdné.
- Pokud se číslo bodu opakuje, zachová se první řádek a ostatní se uvedou jako nepřečtené.
- Popisy se zachovají až do 200 znaků; řídicí znaky se změní na mezery.
- Až 200 nepřečtených řádků se uchová pro dialog (zobrazí se 25) a počítají se všechny.

## Skupiny bodů

Skupina bodu je první slovo jeho popisu psané velkými písmeny. „GRD“, „grd shot“ a „Grd“ patří všechny do skupiny GRD. Bod bez popisu je v „(bez popisu)“. Viz [Import geodetických bodů](topic:import-points).

## Zápis bodů

CivilCraft zatím neexportuje textový soubor bodů. Body se odesílají do LandXML (jako CgPoints), do souboru projektu a přes GIS {{ui:Export}} jako shapefile, GeoPackage nebo GeoJSON s poli P, N, E, Z a D ([Export skutečného provedení pro GIS](topic:gis-export)). Viz [Ještě není hotovo](topic:not-built-yet).
