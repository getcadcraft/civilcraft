---
title: Formatos de ficheiros de puntos
summary: As ordes de columnas que lee CivilCraft, como detecta o separador e a fila de cabeceira, que nomes de cabeceira recoñece e como se comprobán as filas.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, formato de ficheiro de puntos, columnas, cabeceira, delimitador
from: 84fab42e
---

Un ficheiro de puntos é texto simple, cun punto por liña. CivilCraft lévao no navegador; non se envía nada.

## Ordes de columnas

As letras nomean as columnas de esquerda a dereita: **P** número ou nome do punto, **N** norte, **E** este, **Z** cota, **D** descrición.

| Orde | Columnas | Liña de exemplo |
|---|---|---|
| PNEZD | punto, norte, este, cota, descrición | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | punto, este, norte, cota, descrición | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | punto, norte, este, cota | `101,2080000.00,6150000.00,250.00` |
| PENZ | punto, este, norte, cota | `101,6150000.00,2080000.00,250.00` |
| NEZD | norte, este, cota, descrición | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | este, norte, cota, descrición | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | norte, este, cota | `2080000.00 6150000.00 250.00` |
| ENZ | este, norte, cota | `6150000.00 2080000.00 250.00` |

As ordes sen P numeran os puntos 1, 2, 3 … segundo a orde do ficheiro. X é o este e Y é o norte.

## Separadores

CivilCraft mira as primeiras 20 liñas e escolle o primeiro destes que aparece en polo menos o 60 % delas: coma, tabulador, punto e coma. Se non, separa por grupos de espazos.

- Nos ficheiros con coma, tabulador ou punto e coma, un campo entre comiñas pode conter o separador (`"FL, NORTH"`), e `""` dentro das comiñas é unha soa comiña.
- Nos ficheiros separados por espazos, unha descrición ao final da liña pode conter espazos: todo o que hai despois da última columna de coordenadas é a descrición.
- As liñas que comezan por `#`, `;` ou `//`, e as liñas baleiras, omítense.
- Unha marca de orde de bytes ao inicio do ficheiro ignórase.

## Fila de cabeceira

A primeira liña trátase como cabeceira cando menos de dous dos seus campos son números. Se todos os campos da cabeceira son nomes que CivilCraft recoñece, a orde das columnas sae dela («desde a fila de cabeceira»). Os nomes compáranse sen distinguir maiúsculas, espazos, puntos, guións baixos, guións e corchetes:

| Columna | Nomes recoñecidos |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Se algún nome da cabeceira non se recoñece, ou os nomes non forman unha das oito ordes, a cabeceira sáltase e a orde adiviñase polo número de columnas.

:::warning
Unha cabeceira que nomea tanto unha columna de latitude (`lat`, `latitude`) como unha de lonxitude (`lon`, `long`, `longitude`) lese en graos, non como norte e este. En {{ui:Importar}} os puntos convértense polo sistema de coordenadas do proxecto, e un proxecto sen ese sistema pide que o escolla primeiro. Rexéitanse as filas fóra de ±90° de latitude ou ±180° de lonxitude. Vexa [Importar datos GIS](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Adiviñar polo número de columnas

Sen cabeceira utilizable e con **Columnas** deixado en {{ui:Detectar}}:

- 5 ou máis columnas: PNEZD.
- 4 columnas: PNEZ cando a primeira columna é un número enteiro en todas as liñas revisadas e a cuarta é un número; NEZD no resto dos casos.
- 3 columnas: NEZ.

PNEZD e PENZD non se distinguen polos números. A adiviñación segue **Filas de puntos** en [Configuración de CivilCraft](topic:settings): P, N, E, Z, D ao inicio, ou P, E, N, Z, D (entón catro columnas se len como PENZ e tres como ENZ). O diálogo di «adiviñado polo número de columnas: comprobe que o norte e o este non están intercambiados». Escolla a orde correcta en **Columnas** se a vista previa non está ben.

## Como se comprobán as filas

- Unha fila pode omitir a descrición.
- O norte e o este deben ser números. A cota pode estar baleira (o punto consérvase pero non se usa na superficie).
- O número do punto pode ser calquera texto (tamén letras, como `CP1`), pero non pode estar baleiro.
- Se un número de punto se repite, consérvase a primeira fila e as demais listanse como non lidas.
- As descricións consérvanse ata 200 caracteres; os caracteres de control convértense en espazos.
- Consérvanse ata 200 filas non lidas para o diálogo (amósanse 25), e todas se contan.

## Grupos de puntos

O grupo dun punto é a primeira palabra da súa descrición en maiúsculas. «GRD», «grd shot» e «Grd» son todos o grupo GRD. Un punto sen descrición está en «(sen descrición)». Vexa [Importar puntos de levantamento](topic:import-points).

## Escribir puntos

CivilCraft aínda non exporta un ficheiro de texto de puntos. Os puntos saen en LandXML (como CgPoints), no ficheiro do proxecto, e mediante a {{ui:Exportar}} de GIS como shapefile, GeoPackage ou GeoJSON con campos P, N, E, Z e D ([Exportar datos como construídos para GIS](topic:gis-export)). Vexa [Aínda non dispoñible](topic:not-built-yet).
