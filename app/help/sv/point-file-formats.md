---
title: Punktfilsformat
summary: Kolumnordningarna CivilCraft läser, hur den hittar avskiljaren och rubrikraden, vilka rubriknamn den känner igen och hur raderna kontrolleras.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, punktfilsformat, kolumner, rubrik, avskiljare
from: 84fab42e
---

En punktfil är vanlig text, en punkt per rad. CivilCraft läser den i webbläsaren; inget laddas upp.

## Kolumnordningar

Bokstäverna anger kolumnerna från vänster till höger: **P** punktnummer eller namn, **N** nordvärde, **E** östvärde, **Z** höjd, **D** beskrivning.

| Ordning | Kolumner | Exempelrad |
|---|---|---|
| PNEZD | punkt, nordvärde, östvärde, höjd, beskrivning | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | punkt, östvärde, nordvärde, höjd, beskrivning | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | punkt, nordvärde, östvärde, höjd | `101,2080000.00,6150000.00,250.00` |
| PENZ | punkt, östvärde, nordvärde, höjd | `101,6150000.00,2080000.00,250.00` |
| NEZD | nordvärde, östvärde, höjd, beskrivning | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | östvärde, nordvärde, höjd, beskrivning | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | nordvärde, östvärde, höjd | `2080000.00 6150000.00 250.00` |
| ENZ | östvärde, nordvärde, höjd | `6150000.00 2080000.00 250.00` |

Ordningar utan P numrerar punkterna 1, 2, 3 … i filens ordning. X är östvärde och Y är nordvärde.

## Avskiljare

CivilCraft tittar på de första 20 raderna och väljer den första av dessa som förekommer på minst 60 % av dem: komma, tabb, semikolon. Annars delar den på följder av mellanslag.

- I filer med komma, tabb och semikolon kan ett fält inom dubbla citattecken innehålla avskiljaren (`"FL, NORTH"`), och `""` inom citattecken är ett citattecken.
- I filer med mellanslag som avskiljare kan en beskrivning i slutet av raden innehålla mellanslag: allt efter den sista koordinatkolumnen är beskrivningen.
- Rader som börjar med `#`, `;` eller `//`, och tomma rader, hoppas över.
- En byteordningsmarkering (BOM) i början av filen ignoreras.

## Rubrikrad

Första raden behandlas som rubrik när färre än två av dess fält är tal. Om varje fält i rubriken är ett namn som CivilCraft känner igen kommer kolumnordningen från den (”från rubrikraden”). Namnen matchas utan hänsyn till versaler, mellanslag, punkter, understreck, bindestreck och hakparenteser:

| Kolumn | Igenkända namn |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Om något rubriknamn inte känns igen, eller om namnen inte bildar någon av de åtta ordningarna, hoppas rubriken över och ordningen gissas utifrån antalet kolumner.

:::warning
En rubrik som anger både en latitudkolumn (`lat`, `latitude`) och en longitudkolumn (`lon`, `long`, `longitude`) läses som grader, inte som nordvärde och östvärde. Vid {{ui:Importera}} omvandlas punkterna via projektets koordinatsystem, och ett projekt utan ett sådant ber dig först välja det. Rader utanför ±90° latitud eller ±180° longitud avvisas. Se [Importera GIS-data](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Gissning utifrån antalet kolumner

När det inte finns någon användbar rubrik och **Kolumner** står kvar på {{ui:Identifiera}}:

- 5 eller fler kolumner: PNEZD.
- 4 kolumner: PNEZ när första kolumnen är ett heltal på varje kontrollerad rad och den fjärde är ett tal; annars NEZD.
- 3 kolumner: NEZ.

PNEZD och PENZD går inte att skilja åt med hjälp av talen. Gissningen följer **Punktrader** i [CivilCraft-inställningar](topic:settings): P, N, E, Z, D i början, eller P, E, N, Z, D (då läses fyra kolumner som PENZ och tre som ENZ). Dialogrutan säger ”gissat utifrån antalet kolumner – kontrollera att nordvärde och östvärde inte har bytts”. Välj rätt ordning i **Kolumner** om förhandsvisningen ser fel ut.

## Så kontrolleras raderna

- En rad får utelämna beskrivningen.
- Nordvärde och östvärde måste vara tal. Höjden får vara tom (punkten behålls men används inte i ytan).
- Punktnumret får vara vilken text som helst (även bokstäver, till exempel `CP1`), men inte tomt.
- Om ett punktnummer upprepas behålls den första raden och de övriga listas som inte lästa.
- Beskrivningar behålls upp till 200 tecken; styrtecken blir mellanslag.
- Upp till 200 olästa rader sparas för dialogrutan (25 visas), och alla räknas.

## Punktgrupper

En punkts grupp är det första ordet i dess beskrivning med versaler. ”GRD”, ”grd shot” och ”Grd” tillhör alla gruppen GRD. En punkt utan beskrivning hamnar i ”(no description)”. Se [Importera mätpunkter](topic:import-points).

## Skriva punkter

CivilCraft exporterar ännu inte en punkttextfil. Punkter går ut i LandXML (som CgPoints), i projektfilen och via {{ui:Exportera}} till GIS som shapefil, GeoPackage eller GeoJSON med fälten P, N, E, Z och D ([Exportera utförandedata för GIS](topic:gis-export)). Se [Finns inte ännu](topic:not-built-yet).
