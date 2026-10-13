---
title: Point file formats
summary: The column orders CivilCraft reads, how it finds the separator and the header row, which header names it recognizes, and how rows are checked.
section: reference
order: 30
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, point file format, columns, header, delimiter
---

A point file is plain text, one point per line. CivilCraft reads it in the browser; nothing is uploaded.

## Column orders

The letters name the columns from left to right: **P** point number or name, **N** northing, **E** easting, **Z** elevation, **D** description.

| Order | Columns | Example line |
|---|---|---|
| PNEZD | point, northing, easting, elevation, description | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | point, easting, northing, elevation, description | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | point, northing, easting, elevation | `101,2080000.00,6150000.00,250.00` |
| PENZ | point, easting, northing, elevation | `101,6150000.00,2080000.00,250.00` |
| NEZD | northing, easting, elevation, description | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | easting, northing, elevation, description | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | northing, easting, elevation | `2080000.00 6150000.00 250.00` |
| ENZ | easting, northing, elevation | `6150000.00 2080000.00 250.00` |

Orders without P number the points 1, 2, 3 … in file order. X is easting and Y is northing.

## Separators

CivilCraft looks at the first 20 lines and picks the first of these that appears on at least 60% of them: comma, tab, semicolon. Otherwise it splits on runs of spaces.

- In comma, tab and semicolon files, a field in double quotes can hold the separator (`"FL, NORTH"`), and `""` inside quotes is one quote mark.
- In space-separated files, a description at the end of the line may contain spaces: everything after the last coordinate column is the description.
- Lines starting with `#`, `;` or `//`, and blank lines, are skipped.
- A byte-order mark at the start of the file is ignored.

## Header row

The first line is treated as a header when fewer than two of its fields are numbers. If every field of the header is a name CivilCraft recognizes, the column order comes from it ("from the header row"). Names are matched without regard to case, spaces, dots, underscores, hyphens and brackets:

| Column | Recognized names |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

If any header name is not recognized, or the names do not make one of the eight orders, the header is skipped and the order is guessed from the column count.

:::warning
A header that names both a latitude column (`lat`, `latitude`) and a longitude column (`lon`, `long`, `longitude`) is read as degrees, not as northing and easting. On {{ui:Import}} the points are converted through the project's coordinate system, and a project without one asks you to choose it first. Rows outside ±90° latitude or ±180° longitude are refused. See [Import GIS data](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Guessing from the column count

With no usable header and **Columns** left on {{ui:Detect}}:

- 5 or more columns: PNEZD.
- 4 columns: PNEZ when the first column is a whole number on every sampled line and the fourth is a number; NEZD otherwise.
- 3 columns: NEZ.

PNEZD and PENZD cannot be told apart from the numbers. The guess follows **Point rows** in [CivilCraft settings](topic:settings): P, N, E, Z, D at the start, or P, E, N, Z, D (then four columns read as PENZ and three as ENZ). The dialog says "guessed from the column count — check that northing and easting are not swapped". Pick the right order in **Columns** if the preview looks wrong.

## How rows are checked

- A row may leave out the description.
- Northing and easting must be numbers. Elevation may be empty (the point is kept but not used in the surface).
- The point number may be any text (letters too, such as `CP1`), but not empty.
- If a point number repeats, the first row is kept and the others are listed as not read.
- Descriptions are kept up to 200 characters; control characters become spaces.
- Up to 200 unread rows are kept for the dialog (25 shown), and all of them are counted.

## Point groups

A point's group is the first word of its description in capitals. "GRD", "grd shot" and "Grd" are all group GRD. A point without a description is in "(no description)". See [Import survey points](topic:import-points).

## Writing points

CivilCraft does not export a point text file yet. Points go out in LandXML (as CgPoints), in the project file, and through GIS {{ui:Export}} as a shapefile, GeoPackage or GeoJSON with P, N, E, Z and D fields ([Export as-built data for GIS](topic:gis-export)). See [Not built yet](topic:not-built-yet).
