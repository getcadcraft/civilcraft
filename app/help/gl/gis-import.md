---
title: Importar datos GIS
summary: Traer shapefiles, GeoJSON e GeoPackages a un proxecto como capas GIS, colocalos co sistema de coordenadas correcto, revisar os seus atributos e usalos para a superficie.
keywords: gis, etiquetas, etiquetar elementos, atributos na planta, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, importar, capas, atributos, sistema de coordenadas, epsg, latitude, lonxitude, curvas de nivel, parcelas, liñas de quebra, límite
from: f6b235cc
---

Os departamentos de GIS municipais e comarcais entregan o contexto do terreo en ficheiros GIS: parcelas, servidumes, curvas de nivel, servizos, control topográfico. CivilCraft abre tres tipos deles como **capas GIS** que se sitúan baixo o seu deseño na planta.

| Ficheiro | Que abrir |
|---|---|
| Shapefile | O `.shp` xunto co seu `.shx`, `.dbf`, `.prj` e `.cpg` (selecciónos todos), ou o `.zip` no que chegaron. Un zip que contén varios shapefiles dá varias capas. |
| GeoJSON | O ficheiro `.geojson` (tamén vale un ficheiro `.json` cuxas primeiras liñas digan `FeatureCollection` ou `Feature`). |
| GeoPackage | O ficheiro `.gpkg`. Lístase cada táboa de elementos que contén. |
| KML ou KMZ | O ficheiro `.kml` (de Google Earth ou dun mapa web), ou o `.kmz` comprimido. Cada carpeta convértese nunha capa (divídese en puntos, liñas e polígonos cando contén varios tipos); o nome, a descrición e os datos estendidos dun marcador convértense en atributos. As alturas están en metros, e en latitude e lonxitude, como en GeoJSON. |

Lense puntos, multipuntos, liñas, polígonos con furados e formas de varias partes, con as súas cotas (z) cando o ficheiro as ten. Os valores de medida (M) omítense. As cuadrículas de altitudes e o LiDAR ábrense do mesmo xeito: vexa [Cuadrículas de altitudes e LiDAR](topic:elevation-grids-and-lidar).

## Abrir os ficheiros

1. Prema {{ui:Importar}} no grupo **GIS** (ou {{ui:Abrir}}), escolla os ficheiros, ou solteos na planta. Os ficheiros lense neste computador; non se envía nada.
2. O diálogo **Importar datos GIS** lista cada capa atopada: o seu tipo, cantos elementos ten (e cantos non teñen xeometría), cantos campos de atributos ten e o sistema de coordenadas que nomea o ficheiro. Desmarque as capas que non quere.
3. Lea a parte **Sistema de coordenadas** (máis abaixo) e a liña **Que pasará**, e despois prema {{ui:Importar}}.
4. As capas aparecen na planta e baixo **Capas GIS** no panel esquerdo. A importación é un só paso: {{key:Mod+Z}} a desfai.

Unha importación grande amosa unha liña de progreso sobre a planta cun botón {{ui:Cancelar}}.

## O sistema de coordenadas

Os ficheiros GIS indican onde están mediante un sistema de coordenadas (o `.prj` dun shapefile, a táboa de referencia espacial dun GeoPackage; GeoJSON é sempre latitude e lonxitude). CivilCraft converte cada capa desde o seu propio sistema ao do proxecto. Nunca adiviña:

- **O proxecto ten sistema de coordenadas** (fixado en {{ui:Coordenadas}}): cada capa cun sistema propio convértese a el, incluído un axuste de terreo ou local. Un ficheiro sen `.prj` ofrece dúas opcións: **O mesmo que o proxecto** (os seus números cárganse tal como están) ou **Escoller o sistema do ficheiro**.
- **O proxecto non ten ningún, e o ficheiro está nun sistema proxectado nas unidades do proxecto** (unha zona de plano estatal en pés de topografía dos EUA para un proxecto en pés, por exemplo): o diálogo ofrece **Usar ese sistema como sistema de coordenadas do proxecto**. Fíxase no mesmo paso de desfacer que a importación. Nada do proxecto se move; o sistema só indica o que significan os números. No seu lugar pode escoller outro sistema para o proxecto, e as capas convértense a el.
- **O proxecto non ten ningún, e o ficheiro está en latitude e lonxitude** (todo GeoJSON) **ou noutras unidades**: {{ui:Importar}} queda en gris ata que escolla o sistema de coordenadas do proxecto. O selector comeza preto dos datos.
- **Nin o proxecto nin os ficheiros nomean un sistema**: os números cárganse tal como están, e o diálogo indícao.

As cotas tamén se converten: as alturas de GeoJSON son metros (así o di o estándar GeoJSON); as alturas doutros ficheiros tómanse na unidade do seu propio sistema.

:::warning
As posicións dun ficheiro GeoJSON fóra de ±180° de lonxitude ou ±90° de latitude non son latitude e lonxitude. Eses elementos déixanse fóra e o diálogo indica cantos son. Adoitan ser un ficheiro proxectado gardado sen o seu sistema; pida de novo o ficheiro, ou o shapefile co seu `.prj`.
:::

O NAD83 trátase como igual ao WGS 84 (o sistema que usa GeoJSON); os dous difiren uns poucos metros en Norteamérica, así que os datos GeoJSON poden estar desviados eses metros. Cando o mellor desprazamento precisa dun ficheiro de cuadrícula (NADCON para NAD27, por exemplo), CivilCraft usa un desprazamento máis grosso publicado, e o diálogo do sistema de coordenadas indica o grosso que é (para NAD27, uns 20 m), ata que engada a cuadrícula: vexa [Ficheiros de desprazamento de cuadrícula](topic:coordinate-systems).

## Capas GIS

Cada fila baixo **Capas GIS** ten:

- unha caixa para amosar ou ocultar a capa (as capas ocultas tampouco se escollen);
- a súa cor, escollida da lista;
- un menú (os tres puntos) con {{ui:Ampliar até}}, {{ui:Usar para a superficie…}}, {{ui:Renomear…}} e {{ui:Eliminar}}.

Amosar, ocultar, cambiar a cor, renomear e eliminar son pasos de desfacer. As capas GIS gárdanse no ficheiro do proxecto e volven ao abrilo. Tamén saen coa impresión PDF da planta e coas súas exportacións DXF e DWG, cada unha nunha capa chamada `GIS-` e o seu número.

## Etiquetar elementos cun atributo

No menú {{ui:Máis}} da capa (os tres puntos en **Capas GIS**), escolla un campo en **Etiquetar con**: cada elemento amosa o seu valor na planta, na cor da capa. Os puntos etiquétanse ao lado do punto, as liñas ao longo do centro da súa parte máis longa (xiradas para se ler de esquerda a dereita), e os polígonos no seu centro. Os números amosan ata tres decimais. As etiquetas miden 1,8 mm de alto no papel a calquera escala, e pásanse á impresión PDF, DXF e DWG. Escolla **Sen etiquetas** para quitalas; cada cambio é un paso ({{key:Mod+Z}} o desfai). Unha capa etiqueta como máximo 5.000 elementos.

## Ver un elemento

Con {{ui:Seleccionar}} activo, prema un elemento. **Propiedades** amosa a súa capa, de que elemento se trata, a súa forma (partes, furados, vértices), as súas cotas, o ficheiro de orixe e o sistema de coordenadas dese ficheiro, e despois cada atributo nunha táboa. Os atributos son só de lectura: CivilCraft amosa os datos GIS tal como chegaron, non os edita.

Os puntos gañan ás liñas cando ambos están baixo o punteiro; dentro dun polígono, escóllese o polígono máis pequeno.

## Usar para a superficie

Abra o menú dunha capa e escolla {{ui:Usar para a superficie…}} (ou o botón en **Propiedades**). O que se ofrece depende da capa:

| Capa | Pode converterse en |
|---|---|
| Liñas con cotas (liñas 3D) | Liñas de quebra ás súas propias cotas |
| Liñas sen cotas pero cun campo numérico (curvas de nivel) | Liñas de quebra á cota do campo que escolla |
| Polígonos | O límite da superficie (o polígono seleccionado, se non, o maior), ou liñas de quebra ao longo dos seus bordos |
| Puntos con cotas, ou cun campo de cota | Puntos de levantamento, descritos co nome da capa para que formen un grupo de puntos |

Cada uso é un paso de desfacer que copia a xeometría ao proxecto; a propia capa queda igual. As cotas tómanse nas unidades do proxecto.

## Ficheiros de puntos con latitude e lonxitude

Un ficheiro de puntos cuxa cabeceira nomea as columnas **latitude** e **lonxitude** (`lat`, `latitude`, `lon`, `long`, `longitude`) lese en graos, non como norte e este. O diálogo de importación así o indica. Ao {{ui:Importar}}, os puntos convértense ao sistema de coordenadas do proxecto; un proxecto sen ningún pide que o escolla primeiro. Os graos nunca se cargan como pés. As filas fóra de ±90° de latitude ou ±180° de lonxitude recházanse co motivo. A columna de cota tómase tal como está, nas unidades do proxecto.

## Ficheiros LandXML que nomean un sistema de coordenadas

Cando un ficheiro LandXML que abre ten un elemento `CoordinateSystem` (un código EPSG, unha descrición WKT ou un nome de sistema), CivilCraft ofréceo como sistema de coordenadas do proxecto. Se o acepta, nada se move; o sistema só indica o que significan os números.

## Que se comprobou

- Cada lector se comparou con GDAL, a biblioteca que usan a maioría dos programas de GIS para ler estes ficheiros, con ficheiros que GDAL escribiu: shapefiles de cada tipo con e sen cotas, liñas de varias partes, polígonos con furados, xeometrías baleiras, atributos de texto, número, data e verdadeiro/falso, texto UTF-8 e Windows-1252 con e sen `.cpg`, un zip de varios shapefiles, GeoJSON con cada tipo de xeometría, e un GeoPackage con catro táboas. Coincidiron todas as xeometrías, cotas e atributos.
- As posicións convertidas desde latitude e lonxitude, e desde UTM, coincidiron con PROJ (a biblioteca de proxección tras GDAL) ata 3 mm.
- Os ficheiros danados (cortados, con tamaños falsos, zips ou GeoPackages defectuosos) dan unha mensaxe clara; nada se queda colgado.
- Aínda non se abriu nada disto noutros programas de GIS, e as xeodatabases de ficheiros, KML e KMZ aínda non se len (vexa [Aínda non implementado](topic:not-built-yet)).
