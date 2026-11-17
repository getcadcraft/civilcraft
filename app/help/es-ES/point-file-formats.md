---
title: Formatos de archivo de puntos
summary: Los órdenes de columnas que lee CivilCraft, cómo encuentra el separador y la fila de encabezado, qué nombres de encabezado reconoce y cómo se comprueban las filas.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, formato de archivo de puntos, columnas, encabezado, delimitador
from: 84fab42e
---

Un archivo de puntos es texto plano, con un punto por línea. CivilCraft lo lee en el navegador; no se sube nada.

## Órdenes de columnas

Las letras nombran las columnas de izquierda a derecha: **P** número o nombre de punto, **N** norte, **E** este, **Z** cota, **D** descripción.

| Orden | Columnas | Línea de ejemplo |
|---|---|---|
| PNEZD | punto, norte, este, cota, descripción | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | punto, este, norte, cota, descripción | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | punto, norte, este, cota | `101,2080000.00,6150000.00,250.00` |
| PENZ | punto, este, norte, cota | `101,6150000.00,2080000.00,250.00` |
| NEZD | norte, este, cota, descripción | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | este, norte, cota, descripción | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | norte, este, cota | `2080000.00 6150000.00 250.00` |
| ENZ | este, norte, cota | `6150000.00 2080000.00 250.00` |

Los órdenes sin P numeran los puntos 1, 2, 3 … en el orden del archivo. X es el este e Y es el norte.

## Separadores

CivilCraft mira las primeras 20 líneas y elige el primero de estos que aparezca en al menos el 60 % de ellas: coma, tabulador, punto y coma. Si ninguno cumple, separa por grupos de espacios.

- En archivos con coma, tabulador o punto y coma, un campo entre comillas dobles puede contener el separador (`"FL, NORTH"`), y `""` dentro de las comillas es un solo signo de comilla.
- En archivos separados por espacios, una descripción al final de la línea puede contener espacios: todo lo que sigue a la última columna de coordenadas es la descripción.
- Las líneas que empiezan por `#`, `;` o `//`, y las líneas en blanco, se omiten.
- La marca de orden de bytes al inicio del archivo se ignora.

## Fila de encabezado

La primera línea se trata como encabezado cuando menos de dos de sus campos son números. Si todos los campos del encabezado son nombres que CivilCraft reconoce, el orden de las columnas se toma de él ("de la fila de encabezado"). Los nombres se comparan sin distinguir mayúsculas, espacios, puntos, guiones bajos, guiones ni corchetes:

| Columna | Nombres reconocidos |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Si algún nombre del encabezado no se reconoce, o los nombres no forman uno de los ocho órdenes, el encabezado se omite y el orden se deduce del número de columnas.

:::warning
Un encabezado que nombra a la vez una columna de latitud (`lat`, `latitude`) y una de longitud (`lon`, `long`, `longitude`) se lee como grados, no como norte y este. En {{ui:Importar}} los puntos se convierten mediante el sistema de coordenadas del proyecto, y un proyecto que no tenga uno le pide que lo elija primero. Las filas fuera de ±90° de latitud o ±180° de longitud se rechazan. Véase [Importar datos GIS](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Deducción por el número de columnas

Sin un encabezado útil y con **Columnas** en {{ui:Detectar}}:

- 5 o más columnas: PNEZD.
- 4 columnas: PNEZ cuando la primera columna es un número entero en todas las líneas muestreadas y la cuarta es un número; si no, NEZD.
- 3 columnas: NEZ.

PNEZD y PENZD no se distinguen por los números. La deducción sigue **Filas de puntos** en [Configuración de CivilCraft](topic:settings): P, N, E, Z, D al inicio, o P, E, N, Z, D (entonces cuatro columnas se leen como PENZ y tres como ENZ). El cuadro de diálogo dice "deducido del número de columnas: compruebe que el norte y el este no están intercambiados". Elija el orden correcto en **Columnas** si la vista previa no es correcta.

## Cómo se comprueban las filas

- Una fila puede omitir la descripción.
- El norte y el este deben ser números. La cota puede estar vacía (el punto se conserva, pero no se usa en la superficie).
- El número de punto puede ser cualquier texto (también letras, como `CP1`), pero no puede estar vacío.
- Si un número de punto se repite, se conserva la primera fila y las demás se listan como no leídas.
- Las descripciones se conservan hasta 200 caracteres; los caracteres de control se convierten en espacios.
- Se conservan hasta 200 filas no leídas para el cuadro de diálogo (se muestran 25), y todas se cuentan.

## Grupos de puntos

El grupo de un punto es la primera palabra de su descripción en mayúsculas. "GRD", "grd shot" y "Grd" pertenecen todos al grupo GRD. Un punto sin descripción está en "(sin descripción)". Véase [Importar puntos topográficos](topic:import-points).

## Escribir puntos

CivilCraft todavía no exporta un archivo de texto de puntos. Los puntos se exportan en LandXML (como CgPoints), en el archivo del proyecto y mediante {{ui:Exportar}} de GIS como shapefile, GeoPackage o GeoJSON con los campos P, N, E, Z y D ([Exportar datos de obra ejecutada para GIS](topic:gis-export)). Véase [Todavía no disponible](topic:not-built-yet).
