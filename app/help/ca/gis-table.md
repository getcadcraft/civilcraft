---
title: Treballa amb la taula d'atributs d'una capa
summary: Mira cada element d'una capa SIG com a taula, ordena'l i filtra'l, selecciona files i elements alhora, corregeix valors, afegeix camps, calcula valors nous i desa la taula com a CSV.
keywords: taula d'atributs, taula, camps, columnes, files, ordena, filtra, expressió, selecciona, edita, calculadora de camps, calcula, afegeix camp, reanomena camp, elimina camp, csv, exporta, sig, shapefile, geopackage, simbologia
from: fd9d6c11
---

Obriu la taula d'una capa des del menú de **tres punts** de la llista de capes SIG ({{ui:Taula d'atributs…}}), des de Superfície › Més › {{ui:Taula d'atributs}}, o escrivint `ATTRIBUTES`, `ATTTABLE` o `TABLE`. La taula s'obre al costat del plànol i es queda oberta mentre treballeu. Només es dibuixen les files que es veuen, de manera que una capa amb milers d'elements s'obre i es desplaça ràpidament.

## Ordena, filtra i selecciona

- **Ordena:** feu clic al títol d'una columna. Un segon clic l'inverteix, i un tercer torna a posar l'ordre del fitxer. Els valors buits sempre es queden al final. Ordenar només canvia el que veieu, mai la capa.
- **Filtra:** escriviu al quadre de filtre. Una expressió com `AREA > 500 and USE = 'Res'` manté les files on és certa (les mateixes paraules que la pestanya Selecciona de [Analitza les capes SIG](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Qualsevol cosa que no sigui una expressió, com `oak maple`, busca aquestes paraules en totes les columnes.
- **Selecciona files:** feu clic a una fila. Ctrl+clic n'afegeix o en treu una, Shift+clic selecciona un bloc, i {{ui:Selecciona les files mostrades}} agafa totes les files que passen el filtre. Els elements seleccionats es dibuixen al plànol, i un clic a un element del plànol selecciona la seva fila aquí.
- Amb files seleccionades podeu fer {{ui:Zoom}} fins a elles, fer una **capa des de la selecció**, i llegir l'àrea o la longitud totals a la línia d'estat.

## Corregeix valors

Feu doble clic a una cel·la (o mogueu-vos-hi amb les tecles de fletxa i premeu {{key:Enter}}), escriviu el valor nou i premeu {{key:Enter}}. {{key:Esc}} el deixa com estava. Un valor ha de cabre a la columna: els números com a números, les dates com `YYYY-MM-DD`, i sí/no com a `yes`, `no`, `true` o `false`. Un valor que no hi cap es refusa amb una frase i no canvia res. Una casella buida deixa el valor buit. Cada edició és un pas de desfer: {{ui:Desfés}} i {{ui:Refés}} són a la part inferior de la taula, i Ctrl+Z funciona al plànol.

## Camps

Sota **Camps** podeu afegir un camp (text, número, data o sí/no), reanomenar-lo o eliminar-lo. Un camp nou comença buit. El canvi de nom es propaga: el camp d'etiqueta i l'[estil per atribut](topic:gis-symbology) de la capa es mouen al nou nom, i eliminar un camp elimina l'etiqueta i l'estil que l'usaven. Cada acció és un pas de desfer que ho torna tot a com estava.

## Calculadora de camps

Escriu un valor a cada fila (o només a les files seleccionades) a partir dels altres camps de la fila, de la seva geometria i d'algunes funcions. Trieu un camp existent o **Un camp nou…** i doneu-li un nom i un tipus. No s'executa res com a codi: l'expressió la llegeix un petit analitzador amb una llista fixa de funcions.

| Grup | Paraules |
|---|---|
| Nombres | `+ - * /`, parèntesis, `abs round(x, digits) floor ceil sqrt pow min max` |
| Text | `upper lower trim len substr(text, from, count) left right replace concat` (el text va entre 'cometes simples'; un nom de camp amb espais va entre "cometes dobles" o [claudàtors]) |
| Condicionals | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Dates | `year month day` d'un valor `YYYY-MM-DD` |
| Geometria | `$area $perimeter $length $x $y $vertices`, en les unitats del projecte |

Un resultat que no es pot desar en el tipus del camp (text en un camp numèric) es deixa buit i es compta al missatge. Dividir per zero dona un valor buit. Per exemple, `round($area / 43560, 2)` escriu acres a partir de peus quadrats.

## Exporta

{{ui:Exporta a CSV}} desa les files que veieu (després del filtre i de l'ordenació) com a fitxer CSV en UTF-8, amb els noms dels camps a la primera línia. Un text que comença per `=`, `+`, `-` o `@` rep un apòstrof inicial perquè un full de càlcul no l'executi com a fórmula. Per desar la capa mateixa, useu [Exporta les dades as-built per al SIG](topic:gis-export).

## Límits

La taula mostra la capa amb un sol ordre d'ordenació i un filtre cada vegada. Aquí no es poden afegir ni eliminar files (feu una capa nova a partir d'una selecció), la geometria no s'edita, i el tipus d'un camp no es pot canviar un cop creat.
