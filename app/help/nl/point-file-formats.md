---
title: Puntbestandsformaten
summary: De kolomvolgorden die CivilCraft leest, hoe het het scheidingsteken en de kopregel vindt, welke kopnamen het herkent, en hoe rijen worden gecontroleerd.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, puntbestandsformaat, kolommen, kopregel, scheidingsteken
from: 84fab42e
---

Een puntbestand is platte tekst, één punt per regel. CivilCraft leest het in de browser; er wordt niets geüpload.

## Kolomvolgorden

De letters benoemen de kolommen van links naar rechts: **P** puntnummer of -naam, **N** Northing, **E** Easting, **Z** hoogte, **D** beschrijving.

| Volgorde | Kolommen | Voorbeeldregel |
|---|---|---|
| PNEZD | punt, Northing, Easting, hoogte, beschrijving | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | punt, Easting, Northing, hoogte, beschrijving | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | punt, Northing, Easting, hoogte | `101,2080000.00,6150000.00,250.00` |
| PENZ | punt, Easting, Northing, hoogte | `101,6150000.00,2080000.00,250.00` |
| NEZD | Northing, Easting, hoogte, beschrijving | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | Easting, Northing, hoogte, beschrijving | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | Northing, Easting, hoogte | `2080000.00 6150000.00 250.00` |
| ENZ | Easting, Northing, hoogte | `6150000.00 2080000.00 250.00` |

Volgordes zonder P nummeren de punten 1, 2, 3 … in bestandsvolgorde. X is Easting en Y is Northing.

## Scheidingstekens

CivilCraft kijkt naar de eerste 20 regels en kiest de eerste van deze die op minstens 60% ervan voorkomt: komma, tab, puntkomma. Anders splitst het op reeksen spaties.

- In komma-, tab- en puntkommabestanden kan een veld tussen dubbele aanhalingstekens het scheidingsteken bevatten (`"FL, NORTH"`), en `""` binnen aanhalingstekens is één aanhalingsteken.
- In bestanden met spaties als scheidingsteken mag een beschrijving aan het eind van de regel spaties bevatten: alles na de laatste coördinaatkolom is de beschrijving.
- Regels die beginnen met `#`, `;` of `//`, en lege regels, worden overgeslagen.
- Een byte-order mark aan het begin van het bestand wordt genegeerd.

## Kopregel

De eerste regel wordt als kop gezien wanneer minder dan twee van zijn velden getallen zijn. Als elk veld van de kop een naam is die CivilCraft herkent, komt de kolomvolgorde daaruit ("uit de kopregel"). Namen worden vergeleken zonder onderscheid van hoofdletters, spaties, punten, underscores, koppeltekens en haakjes.

| Kolom | Herkende namen |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Is een kopnaam niet herkend, of vormen de namen geen van de acht volgordes, dan wordt de kop overgeslagen en de volgorde geraden uit het aantal kolommen.

:::warning
Een kop die zowel een breedtegraadkolom (`lat`, `latitude`) als een lengtegraadkolom (`lon`, `long`, `longitude`) noemt, wordt als graden gelezen, niet als Northing en Easting. Bij {{ui:Importeren}} worden de punten omgerekend via het coördinatenstelsel van het project, en een project zonder stelsel vraagt u eerst het te kiezen. Rijen buiten ±90° breedtegraad of ±180° lengtegraad worden geweigerd. Zie [GIS-gegevens importeren](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Raden op basis van het aantal kolommen

Zonder bruikbare kop en met **Kolommen** op {{ui:Herkennen}}:

- 5 of meer kolommen: PNEZD.
- 4 kolommen: PNEZ wanneer de eerste kolom op elke bemonsterde regel een geheel getal is en de vierde een getal; anders NEZD.
- 3 kolommen: NEZ.

PNEZD en PENZD kunnen aan de getallen niet van elkaar worden onderscheiden. Het raden volgt **Puntrijen** in [CivilCraft-instellingen](topic:settings): P, N, E, Z, D aan het begin, of P, E, N, Z, D (dan worden vier kolommen als PENZ gelezen en drie als ENZ). Het dialoogvenster zegt "geraden op basis van het aantal kolommen — controleer of Northing en Easting niet zijn omgewisseld". Kies de juiste volgorde bij **Kolommen** als het voorbeeld er verkeerd uitziet.

## Hoe rijen worden gecontroleerd

- Een rij mag de beschrijving weglaten.
- Northing en Easting moeten getallen zijn. De hoogte mag leeg zijn (het punt blijft behouden maar wordt niet in het oppervlak gebruikt).
- Het puntnummer mag elke tekst zijn (ook letters, zoals `CP1`), maar niet leeg.
- Als een puntnummer zich herhaalt, blijft de eerste rij behouden en worden de andere als niet gelezen vermeld.
- Beschrijvingen worden tot 200 tekens bewaard; besturingstekens worden spaties.
- Tot 200 niet-gelezen rijen worden bewaard voor het dialoogvenster (25 getoond), en allemaal geteld.

## Puntengroepen

De groep van een punt is het eerste woord van zijn beschrijving in hoofdletters. "GRD", "grd shot" en "Grd" zijn allemaal groep GRD. Een punt zonder beschrijving staat in "(geen beschrijving)". Zie [Opmetingspunten importeren](topic:import-points).

## Punten wegschrijven

CivilCraft exporteert nog geen puntentekstbestand. Punten gaan naar LandXML (als CgPoints), in het projectbestand, en via GIS-{{ui:Exporteren}} als shapefile, GeoPackage of GeoJSON met de velden P, N, E, Z en D ([Gegevens als gebouwd exporteren voor GIS](topic:gis-export)). Zie [Nog niet beschikbaar](topic:not-built-yet).
