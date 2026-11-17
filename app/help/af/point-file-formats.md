---
title: Puntlêerformate
summary: Die kolomvolgordes wat CivilCraft lees, hoe dit die skeier en die opskrifreël vind, watter opskriftname dit herken, en hoe rye nagegaan word.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, puntlêerformaat, kolomme, opskrif, skeier
from: 84fab42e
---

'n Puntlêer is gewone teks, een punt per reël. CivilCraft lees dit in die blaaier; niks word opgelaai nie.

## Kolomvolgordes

Die letters noem die kolomme van links na regs: **P** puntnommer of -naam, **N** noordelike koördinaat, **E** oostelike koördinaat, **Z** hoogte, **D** beskrywing.

| Volgorde | Kolomme | Voorbeeldreël |
|---|---|---|
| PNEZD | punt, noord, oos, hoogte, beskrywing | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | punt, oos, noord, hoogte, beskrywing | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | punt, noord, oos, hoogte | `101,2080000.00,6150000.00,250.00` |
| PENZ | punt, oos, noord, hoogte | `101,6150000.00,2080000.00,250.00` |
| NEZD | noord, oos, hoogte, beskrywing | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | oos, noord, hoogte, beskrywing | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | noord, oos, hoogte | `2080000.00 6150000.00 250.00` |
| ENZ | oos, noord, hoogte | `6150000.00 2080000.00 250.00` |

Volgordes sonder P nommer die punte 1, 2, 3 … in lêervolgorde. X is oos en Y is noord.

## Skeiers

CivilCraft kyk na die eerste 20 reëls en kies die eerste van hierdie wat op minstens 60% daarvan voorkom: komma, tab, kommapunt. Anders splits dit op reekse spasies.

- In komma-, tab- en kommapunt-lêers kan 'n veld tussen dubbele aanhalingstekens die skeier bevat (`"FL, NORTH"`), en `""` binne aanhalingstekens is een aanhalingsteken.
- In spasie-geskeide lêers mag 'n beskrywing aan die einde van die reël spasies bevat: alles ná die laaste koördinaatkolom is die beskrywing.
- Reëls wat met `#`, `;` of `//` begin, en leë reëls, word oorgeslaan.
- 'n Greep-volgordemerk (byte-order mark) aan die begin van die lêer word geïgnoreer.

## Opskrifreël

Die eerste reël word as opskrif behandel wanneer minder as twee van sy velde getalle is. As elke veld van die opskrif 'n naam is wat CivilCraft herken, kom die kolomvolgorde daaruit ("uit die opskrifreël"). Name word ongeag hoofletters, spasies, punte, underscores, koppeltekens en hakies gepas:

| Kolom | Herkende name |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

As enige opskriftnaam nie herken word nie, of die name nie een van die agt volgordes vorm nie, word die opskrif oorgeslaan en die volgorde word uit die kolomtelling geraai.

:::warning
'n Opskrif wat beide 'n breedtegraadkolom (`lat`, `latitude`) en 'n lengtegraadkolom (`lon`, `long`, `longitude`) noem, word as grade gelees, nie as noord en oos nie. By {{ui:Voer in}} word die punte deur die projek se koördinaatstelsel omgeskakel, en 'n projek sonder een vra jou om dit eers te kies. Rye buite ±90° breedtegraad of ±180° lengtegraad word geweier. Sien [Voer GIS-data in](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Raai uit die kolomtelling

Met geen bruikbare opskrif nie en **Kolomme** op {{ui:Herken}}:

- 5 of meer kolomme: PNEZD.
- 4 kolomme: PNEZ wanneer die eerste kolom 'n heelgetal op elke gemonsterde reël is en die vierde 'n getal is; anders NEZD.
- 3 kolomme: NEZ.

PNEZD en PENZD kan nie uit die getalle onderskei word nie. Die raaiwerk volg **Puntrye** in [CivilCraft-instellings](topic:settings): P, N, E, Z, D aan die begin, of P, E, N, Z, D (dan word vier kolomme as PENZ gelees en drie as ENZ). Die dialoog waarsku dat die volgorde uit die kolomtelling geraai is, en vra jou om na te gaan dat noord en oos nie omgeruil is nie. Kies die regte volgorde in **Kolomme** as die voorskou verkeerd lyk.

## Hoe rye nagegaan word

- 'n Reël kan die beskrywing weglaat.
- Noord en oos moet getalle wees. Hoogte mag leeg wees (die punt word behou maar nie in die oppervlak gebruik nie).
- Die puntnommer mag enige teks wees (ook letters, soos `CP1`), maar nie leeg nie.
- As 'n puntnommer herhaal, word die eerste reël behou en die ander word as nie gelees gelys nie.
- Beskrywings word tot 200 karakters behou; beheerkarakters word spasies.
- Tot 200 ongelese rye word vir die dialoog behou (25 getoon), en almal word getel.

## Puntgroepe

'n Punt se groep is die eerste woord van sy beskrywing in hoofletters. "GRD", "grd shot" en "Grd" is almal groep GRD. 'n Punt sonder beskrywing is in "(geen beskrywing)". Sien [Voer opmetingspunte in](topic:import-points).

## Punte skryf

CivilCraft voer nog nie 'n puntteksbestand uit nie. Punte gaan uit in LandXML (as CgPoints), in die projeklêer, en deur GIS-{{ui:Uitvoer}} as 'n shapefile, GeoPackage of GeoJSON met P-, N-, E-, Z- en D-velde ([Voer as-gebou-data uit vir GIS](topic:gis-export)). Sien [Nog nie gebou nie](topic:not-built-yet).
