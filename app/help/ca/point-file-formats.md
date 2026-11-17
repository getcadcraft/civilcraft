---
title: Formats de fitxer de punts
summary: Els ordres de columnes que llegeix CivilCraft, com troba el separador i la fila de capçalera, quins noms de capçalera reconeix i com es comproven les files.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, format de fitxer de punts, columnes, capçalera, delimitador
from: 84fab42e
---

Un fitxer de punts és text pla, un punt per línia. CivilCraft el llegeix al navegador; no es puja res.

## Ordres de columnes

Les lletres designen les columnes d'esquerra a dreta: **P** número o nom del punt, **N** nord, **E** est, **Z** cota, **D** descripció.

| Ordre | Columnes | Exemple de línia |
|---|---|---|
| PNEZD | punt, nord, est, cota, descripció | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | punt, est, nord, cota, descripció | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | punt, nord, est, cota | `101,2080000.00,6150000.00,250.00` |
| PENZ | punt, est, nord, cota | `101,6150000.00,2080000.00,250.00` |
| NEZD | nord, est, cota, descripció | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | est, nord, cota, descripció | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | nord, est, cota | `2080000.00 6150000.00 250.00` |
| ENZ | est, nord, cota | `6150000.00 2080000.00 250.00` |

Les ordres sense P numeren els punts 1, 2, 3 … segons l'ordre del fitxer. X és l'est i Y és el nord.

## Separadors

CivilCraft mira les primeres 20 línies i tria el primer d'aquests que apareix en almenys el 60% d'elles: coma, tabulació, punt i coma. Si no, separa per grups d'espais.

- En fitxers amb coma, tabulació i punt i coma, un camp entre cometes dobles pot contenir el separador (`"FL, NORTH"`), i `""` dins de les cometes és un sol signe de cometa.
- En fitxers separats per espais, una descripció al final de la línia pot contenir espais: tot el que hi ha després de l'última columna de coordenades és la descripció.
- Les línies que comencen per `#`, `;` o `//`, i les línies en blanc, s'ometen.
- La marca d'ordre de bytes (BOM) al començament del fitxer s'ignora.

## Fila de capçalera

La primera línia es tracta com a capçalera quan menys de dos dels seus camps són números. Si tots els camps de la capçalera són noms que CivilCraft reconeix, l'ordre de les columnes s'obté d'ella ("des de la fila de capçalera"). Els noms es comparen sense tenir en compte majúscules, espais, punts, guions baixos, guions ni claudàtors:

| Columna | Noms reconeguts |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Si algun nom de capçalera no es reconeix, o els noms no formen cap de les vuit ordres, la capçalera s'omet i l'ordre es dedueix del nombre de columnes.

:::warning
Una capçalera que anomena alhora una columna de latitud (`lat`, `latitude`) i una columna de longitud (`lon`, `long`, `longitude`) es llegeix en graus, no com a nord i est. A {{ui:Importa}} els punts es converteixen mitjançant el sistema de coordenades del projecte, i un projecte que no en tingui demana que n'hi trieu un abans. Les files fora de ±90° de latitud o ±180° de longitud es rebutgen. Vegeu [Importa dades SIG](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Dedueix l'ordre pel nombre de columnes

Sense capçalera utilitzable i amb **Columnes** deixat a {{ui:Detecta}}:

- 5 columnes o més: PNEZD.
- 4 columnes: PNEZ quan la primera columna és un nombre enter en totes les línies de la mostra i la quarta és un número; si no, NEZD.
- 3 columnes: NEZ.

PNEZD i PENZD no es poden distingir pels números. La deducció segueix **Files de punts** a [Configuració de CivilCraft](topic:settings): P, N, E, Z, D al començament, o P, E, N, Z, D (llavors quatre columnes es llegeixen com a PENZ i tres com a ENZ). El diàleg diu "deduït del nombre de columnes — comproveu que el nord i l'est no estiguin intercanviats". Trieu l'ordre correcte a **Columnes** si la vista prèvia sembla incorrecta.

## Com es comproven les files

- Una fila pot no tenir descripció.
- El nord i l'est han de ser números. La cota pot estar buida (el punt es conserva però no s'usa a la superfície).
- El número de punt pot ser qualsevol text (també lletres, com `CP1`), però no pot estar buit.
- Si un número de punt es repeteix, es conserva la primera fila i les altres es llisten com a no llegides.
- Les descripcions es conserven fins a 200 caràcters; els caràcters de control es converteixen en espais.
- Es guarden fins a 200 files no llegides per al diàleg (es mostren 25), i totes es comptabilitzen.

## Grups de punts

El grup d'un punt és la primera paraula de la seva descripció en majúscules. "GRD", "grd shot" i "Grd" pertanyen tots al grup GRD. Un punt sense descripció pertany a "(sense descripció)". Vegeu [Importa punts topogràfics](topic:import-points).

## Escriure punts

CivilCraft encara no exporta un fitxer de text de punts. Els punts surten en LandXML (com a CgPoints), en el fitxer del projecte, i mitjançant {{ui:Exporta}} a SIG com a shapefile, GeoPackage o GeoJSON amb els camps P, N, E, Z i D ([Exporta dades tal com s'han construït per a SIG](topic:gis-export)). Vegeu [Encara no implementat](topic:not-built-yet).
