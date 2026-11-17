---
title: Formatos de archivo de puntos
summary: Los órdenes de columnas que lee CivilCraft, cómo encuentra el separador y la fila de encabezado, qué nombres de encabezado reconoce y cómo se verifican las filas.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, formato de archivo de puntos, columnas, encabezado, separador
from: 84fab42e
---

Peteĩ archivo de puntos ha'e texto simple, peteĩ punto peteĩ línea. CivilCraft ojelee navegadór rupi; ndaipórivi ojeinvia.

## Órdenes de columnas

Letra ohechauka columna izquierda guive derecha: **P** número o nombre de punto, **N** norte, **E** este, **Z** cota, **D** descripción.

| Orden | Columnas | Línea ejemplo |
|---|---|---|
| PNEZD | punto, norte, este, cota, descripción | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | punto, este, norte, cota, descripción | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | punto, norte, este, cota | `101,2080000.00,6150000.00,250.00` |
| PENZ | punto, este, norte, cota | `101,6150000.00,2080000.00,250.00` |
| NEZD | norte, este, cota, descripción | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | este, norte, cota, descripción | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | norte, este, cota | `2080000.00 6150000.00 250.00` |
| ENZ | este, norte, cota | `6150000.00 2080000.00 250.00` |

Órdenes sin P numera punto 1, 2, 3 … archivo orden-pe. X ha'e este ha Y ha'e norte.

## Separadores

CivilCraft ohecha umi 20 línea primero ha oiporavo mboyve ojeporúva ojehechaukáva peteĩ 60 % línea-pe: coma, tabulación, punto y coma. Ndaipóri ramo, oñemboyta espacio ndive.

- Coma, tabulación ha punto y coma archivo-pe, comillas dobles ndive campo ikatu oguereko separador (`"FL, NORTH"`), ha `""` comillas ndive oguereko peteĩ comilla.
- Espacio ndive archivo-pe, línea finalpe descripción ikatu oguereko espacio: todo lo que sigue a la última columna de coordenadas es la descripción.
- Línea oñepyrũva `#`, `;` térã `//` ha línea hũvo omboykéva.
- Archivo comienzo byte-order mark ndojeporúi.

## Fila de encabezado

Línea primera oikuaa encabezado umi campo mboyve ndaha'éi número-pe mboyve: ha'e dos. Encabezado campo tuichave nombre CivilCraft oikuaa, ha ohechaukáva ndive orden de columnas oñemoĩ ("de la fila de encabezado"). Nombres oñemoñeʼẽ mayúscula, espacio, punto, guion bajo, guion y corchete ndojepe:

| Columna | Nombres reconocidos |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Encabezado nombre peteĩ ndoikuaáiva térã nombres ndoikóiva ocho órdenes peteĩgui, encabezado omboykéva ha orden oñemoĩ columnas cantidad-gui.

:::warning
Encabezado oñemboja latitud (`lat`, `latitude`) ha longitud (`lon`, `long`, `longitude`) oñemoĩ grados-pe, ndaha'éi norte ha este. {{ui:Importar}} punto oñemoambue proyecto sistema de coordenadas rupive, ha proyecto ndoguerekóiva peteĩ ojeporandu ojeporavo primero. Latitud ±90° térã longitud ±180° ndoguereko ojerechaza. Ver [Importar datos SIG](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Adivinar por cantidad de columnas

Encabezado ndaipóri ojeporúvo ha **Columnas** oĩ {{ui:Detectar}}-pe:

- 5 térã más columnas: PNEZD.
- 4 columnas: PNEZ oĩ peteĩ número primera columna todas línea-pe ha cuarta número; ndaha'éi NEZD.
- 3 columnas: NEZ.

PNEZD ha PENZD ndojeikuaái números rupi. Adivinanza oiporavo **Filas de puntos** [Configuración de CivilCraft](topic:settings) rupi: P, N, E, Z, D comienzo-pe, térã P, E, N, Z, D (upérõ cuatro columna PENZ ha tres ENZ). Diálogo oñe'ẽ "adivinado a partir del número de columnas: verificá que norte y este no estén invertidos". Vista previa ndoporãi, eiporavo orden correcto **Columnas**-pe.

## Cómo se verifican las filas

- Fila ikatu ndoguereko descripción.
- Norte ha este número rejoko. Cota ikatu ndoguereko nada (punto oñeguarda ha superficie-pe ndoiporavóiva).
- Número de punto ikatu oguereko texto (letra avei, ejemplo `CP1`), ha ndaha'éi vacío.
- Número de punto oñepyta mokõi jey, primera fila oñeguarda ha ambue oñe'ẽ ndoleídoiva.
- Descripción oñeguarda 200 caracteres peve; caracter de control oñemoĩ espacio-pe.
- 200 fila ndoleídoiva peve oñeguarda diálogo-pe (25 ohechaukáva), ha opaite oñemboja.

## Grupos de puntos

Punto grupo ha'e primera palabra de su descripción mayúscula-pe. "GRD", "grd shot" ha "Grd" opaite ha'e grupo GRD. Punto ndoguerekóiva descripción ha'e "(sin descripción)". Ver [Importar puntos de relevamiento](topic:import-points).

## Escritura de puntos

CivilCraft todavía ndoexportái archivo de texto de puntos. Puntos oiko LandXML-pe (CgPoints rehegua), proyecto archivo-pe, ha GIS {{ui:Exportar}} rupi shapefile, GeoPackage térã GeoJSON-pe P, N, E, Z ha D campo ndive ([Exportar datos as-built a SIG](topic:gis-export)). Ver [Todavía no disponible](topic:not-built-yet).
