---
title: Formati datotek s točkami
summary: Vrstni red stolpcev, ki jih CivilCraft bere, kako najde ločilo in vrstico z glavo, katera imena glave prepozna in kako se vrstice preverijo.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, format datoteke s točkami, stolpci, glava, ločilo
from: 84fab42e
---

Datoteka s točkami je navadno besedilo, ena točka na vrstico. CivilCraft jo bere v brskalniku; nič se ne naloži.

## Vrstni red stolpcev

Črke od leve proti desni poimenujejo stolpce: **P** številka ali ime točke, **N** severna koordinata, **E** vzhodna koordinata, **Z** višina, **D** opis.

| Vrstni red | Stolpci | Primer vrstice |
|---|---|---|
| PNEZD | točka, severna, vzhodna, višina, opis | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | točka, vzhodna, severna, višina, opis | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | točka, severna, vzhodna, višina | `101,2080000.00,6150000.00,250.00` |
| PENZ | točka, vzhodna, severna, višina | `101,6150000.00,2080000.00,250.00` |
| NEZD | severna, vzhodna, višina, opis | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | vzhodna, severna, višina, opis | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | severna, vzhodna, višina | `2080000.00 6150000.00 250.00` |
| ENZ | vzhodna, severna, višina | `6150000.00 2080000.00 250.00` |

Vrstni redi brez P oštevilčijo točke 1, 2, 3 … po vrstnem redu v datoteki. X je vzhodna koordinata, Y pa severna.

## Ločila

CivilCraft pogleda prvih 20 vrstic in izbere prvo od teh, ki se pojavi vsaj v 60 % vrstic: vejica, tabulator, podpičje. Sicer razdeli po nizih presledkov.

- V datotekah z vejico, tabulatorjem in podpičjem lahko polje v dvojnih narekovajih vsebuje ločilo (`"FL, NORTH"`), `""` znotraj narekovajev pa je en narekovaj.
- V datotekah s presledki lahko opis na koncu vrstice vsebuje presledke: vse za zadnjim stolpcem koordinate je opis.
- Vrstice, ki se začnejo s `#`, `;` ali `//`, in prazne vrstice se preskočijo.
- Oznaka vrstnega reda bajtov na začetku datoteke se prezre.

## Vrstica z glavo

Prva vrstica se obravnava kot glava, če sta manj kot dve njeni polji števili. Če je vsako polje glave ime, ki ga CivilCraft prepozna, vrstni red stolpcev prevzame iz nje („iz vrstice z glavo“). Imena se ujemajo ne glede na velike in male črke, presledke, pike, podčrtaje, vezaje in oklepaje:

| Stolpec | Prepoznana imena |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Če katero koli ime v glavi ni prepoznano ali imena ne tvorijo enega od osmih vrstnih redov, se glava preskoči in vrstni red se ugotovi po številu stolpcev.

:::warning
Glava, ki navaja stolpec zemljepisne širine (`lat`, `latitude`) in stolpec zemljepisne dolžine (`lon`, `long`, `longitude`), se bere kot stopinje, ne kot severna in vzhodna koordinata. Pri {{ui:Uvozi}} se točke pretvorijo prek koordinatnega sistema projekta, projekt brez njega pa vas najprej vpraša, da ga izberete. Vrstice zunaj ±90° zemljepisne širine ali ±180° zemljepisne dolžine so zavrnjene. Glejte [Uvoz podatkov GIS](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Ugibanje po številu stolpcev

Brez uporabne glave in ko je **Stolpci** pri {{ui:Zaznaj}} pustite:

- 5 ali več stolpcev: PNEZD.
- 4 stolpci: PNEZ, če je prvi stolpec celo število v vsaki pregledani vrstici in je četrti število; sicer NEZD.
- 3 stolpci: NEZ.

PNEZD in PENZD iz števil ni mogoče ločiti. Ugibanje sledi **Vrstice točk** v [nastavitvah CivilCraft](topic:settings): P, N, E, Z, D na začetku ali P, E, N, Z, D (potem se štirje stolpci preberejo kot PENZ, trije pa kot ENZ). Pogovorno okno pravi „ugibanje po številu stolpcev – preverite, ali severna in vzhodna koordinata nista zamenjani“. Če je predogled napačen, izberite pravi vrstni red v **Stolpci**.

## Kako se preverjajo vrstice

- Vrstica lahko izpusti opis.
- Severna in vzhodna koordinata morata biti števili. Višina je lahko prazna (točka se ohrani, vendar se ne uporabi v površju).
- Številka točke je lahko poljubno besedilo (tudi črke, na primer `CP1`), vendar ne sme biti prazna.
- Če se številka točke ponovi, se ohrani prva vrstica, ostale pa so navedene kot nebrane.
- Opisi se ohranijo do 200 znakov; kontrolni znaki postanejo presledki.
- Do 200 nebranih vrstic se ohrani za pogovorno okno (prikazanih je 25), vse pa se prešteje.

## Skupine točk

Skupina točke je prva beseda njenega opisa, zapisana z velikimi črkami. „GRD“, „grd shot“ in „Grd“ so vse v skupini GRD. Točka brez opisa je v skupini „(brez opisa)“. Glejte [Uvoz geodetskih točk](topic:import-points).

## Zapisovanje točk

CivilCraft še ne izvozi besedilne datoteke s točkami. Točke se izvozijo v LandXML (kot CgPoints), v datoteko projekta in prek GIS {{ui:Izvoz}} kot shapefile, GeoPackage ali GeoJSON s polji P, N, E, Z in D ([Izvoz podatkov dejanskega stanja za GIS](topic:gis-export)). Glejte [Še ni izdelano](topic:not-built-yet).
