---
title: Format ng point file
summary: Ang mga column order na binabasa ng CivilCraft, kung paano nito hinahanap ang separator at ang header row, aling mga pangalan ng header ang nakikilala nito, at kung paano sinusuri ang mga row.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, point file format, columns, header, delimiter
from: 84fab42e
---

Ang point file ay plain text, isang point bawat linya. Binabasa ito ng CivilCraft sa browser; walangina-upload.

## Column order

Pinangangalanan ng mga letra ang mga column mula kaliwa pakanan: **P** point number o pangalan, **N** northing, **E** easting, **Z** elevation, **D** description.

| Order | Columns | Halimbawang linya |
|---|---|---|
| PNEZD | point, northing, easting, elevation, description | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | point, easting, northing, elevation, description | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | point, northing, easting, elevation | `101,2080000.00,6150000.00,250.00` |
| PENZ | point, easting, northing, elevation | `101,6150000.00,2080000.00,250.00` |
| NEZD | northing, easting, elevation, description | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | easting, northing, elevation, description | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | northing, easting, elevation | `2080000.00 6150000.00 250.00` |
| ENZ | easting, northing, elevation | `6150000.00 2080000.00 250.00` |

Ang mga order na walang P ay nagbibilang ng mga point bilang 1, 2, 3 … ayon sa pagkakasunod sa file. Ang X ay easting at ang Y ay northing.

## Separator

Tinitingnan ng CivilCraft ang unang 20 linya at pinipili ang una sa mga ito na lumilitaw sa kahit 60% ng mga ito: comma, tab, semicolon. Kung wala, hahatiin ito sa mga pangkat ng space.

- Sa comma, tab at semicolon na file, ang field na nasa double quotes ay maaaring maglaman ng separator (`"FL, NORTH"`), at ang `""` sa loob ng quotes ay isang quote mark.
- Sa space-separated na file, maaaring maglaman ng space ang description sa dulo ng linya: ang lahat ng nasa likod ng huling coordinate column ay description.
- Nilalaktawan ang mga linyang nagsisimula sa `#`, `;` o `//`, at ang mga blankong linya.
- Hindi pinapansin ang byte-order mark sa simula ng file.

## Header row

Itinuturing na header ang unang linya kapag wala pang dalawang field nito ang numero. Kung bawat field ng header ay pangalang nakikilala ng CivilCraft, ang column order ay kukunin mula rito ("from the header row"). Itinutugma ang mga pangalan anuman ang malaki o maliit na letra, space, tuldok, underscore, gitling at bracket:

| Column | Mga pangalang nakikilala |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Kapag may hindi nakikilalang pangalan sa header, o kapag hindi nabubuo ng mga pangalan ang isa sa walong order, lalaktawan ang header at huhulaan ang order mula sa bilang ng column.

:::warning
Ang header na may pangalan ng column na latitude (`lat`, `latitude`) at column na longitude (`lon`, `long`, `longitude`) ay binabasa bilang degrees, hindi bilang northing at easting. Sa {{ui:Import}}, kino-convert ang mga point sa pamamagitan ng coordinate system ng project, at ang project na walang coordinate system ay magtatanong muna kung alin ang pipiliin mo. Tinatanggihan ang mga row na nasa labas ng ±90° latitude o ±180° longitude. Tingnan ang [Mag-import ng GIS data](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Paghula mula sa bilang ng column

Kapag walang magagamit na header at nakatakda pa sa {{ui:Detect}} ang **Columns**:

- 5 o higit pang column: PNEZD.
- 4 na column: PNEZ kapag ang unang column ay buong numero sa bawat sinusuring linya at ang ikaapat ay numero; kung hindi, NEZD.
- 3 column: NEZ.

Hindi matukoy ang pagkakaiba ng PNEZD at PENZD mula sa mga numero. Sinusunod ng hula ang **Point rows** sa [mga setting ng CivilCraft](topic:settings): P, N, E, Z, D sa simula, o P, E, N, Z, D (kung gayon, ang apat na column ay binabasa bilang PENZ at ang tatlo bilang ENZ). Sinasabi ng dialog na "guessed from the column count — check that northing and easting are not swapped". Piliin ang tamang order sa **Columns** kung mali ang preview.

## Paano sinusuri ang mga row

- Maaaring walang description ang isang row.
- Dapat numero ang northing at easting. Maaaring walang laman ang elevation (itinatago ang point pero hindi ginagamit sa surface).
- Maaaring anumang teksto ang point number (may letra rin, gaya ng `CP1`), pero hindi ito dapat walang laman.
- Kapag inulit ang point number, itinatago ang unang row at nakalista ang iba bilang hindi nabasa.
- Itinatago ang mga description hanggang 200 character; nagiging space ang mga control character.
- Hanggang 200 hindi nabasang row ang itinatago para sa dialog (25 ang ipinapakita), at lahat ng ito ay binibilang.

## Mga point group

Ang group ng point ay ang unang salita ng description nito na nakasulat sa malalaking titik. Ang "GRD", "grd shot" at "Grd" ay pawang group GRD. Ang point na walang description ay nasa "(no description)". Tingnan ang [Mag-import ng survey points](topic:import-points).

## Pagsulat ng mga point

Hindi pa nag-e-export ng point text file ang CivilCraft. Lumalabas ang mga point sa LandXML (bilang CgPoints), sa project file, at sa pamamagitan ng GIS {{ui:Export}} bilang shapefile, GeoPackage o GeoJSON na may P, N, E, Z at D fields ([Mag-export ng as-built data para sa GIS](topic:gis-export)). Tingnan ang [Hindi pa nagagawa](topic:not-built-yet).
