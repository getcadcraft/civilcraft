---
title: Importar datos GIS
summary: Traer shapefiles, GeoJSON y GeoPackage a un proyecto como capas GIS, ubicarlos con el sistema de coordenadas correcto, ver sus atributos y usarlos para la superficie.
keywords: gis, etiquetas, etiquetar elementos, atributos en el plano, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, importar, capas, atributos, sistema de coordenadas, epsg, latitud, longitud, curvas de nivel, parcelas, líneas de quiebre, límite
from: f6b235cc
---

Los departamentos y municipios GIS entregan el contexto del sitio como archivos GIS: parcelas, servidumbres, curvas de nivel, servicios, control topográfico. CivilCraft abre tres tipos como **capas GIS** que quedan debajo de tu diseño en el plano.

| Archivo | Qué abrir |
|---|---|
| Shapefile | El `.shp` junto con su `.shx`, `.dbf`, `.prj` y `.cpg` (seleccionalos todos), o el `.zip` en que vinieron. Un zip con varios shapefiles da varias capas. |
| GeoJSON | El archivo `.geojson` (un `.json` cuyas primeras líneas dicen `FeatureCollection` o `Feature` también sirve). |
| GeoPackage | El archivo `.gpkg`. Se listan todas las tablas de elementos que contiene. |
| KML o KMZ | El archivo `.kml` (de Google Earth o de un mapa web), o el `.kmz` comprimido. Cada carpeta se vuelve una capa (se divide en puntos, líneas y polígonos si tiene varios tipos); el nombre, la descripción y los datos extendidos del marcador se vuelven sus atributos. Las alturas están en metros y en latitud y longitud, como en GeoJSON. |

Se leen puntos, multipuntos, líneas, polígonos con huecos y formas de varias partes, con sus cotas (z) cuando el archivo las tiene. Los valores de medida (M) se omiten. Las grillas de cotas y LiDAR se abren de la misma manera: ver [Grillas de cotas y LiDAR](topic:elevation-grids-and-lidar).

## Abrir los archivos

1. Hacé clic en {{ui:Importar}} en el grupo **GIS** (o en {{ui:Abrir}}), elegí los archivos, o arrastralos al plano. Los archivos se leen en esta computadora; nada se sube.
2. El cuadro **Importar datos GIS** lista cada capa encontrada: su tipo, cuántos elementos tiene (y cuántos no tienen geometría), cuántos campos de atributos tiene, y el sistema de coordenadas que nombra el archivo. Desmarcá las capas que no querés.
3. Leé la parte **Sistema de coordenadas** (abajo) y la línea **Qué va a pasar**, y después hacé clic en {{ui:Importar}}.
4. Las capas aparecen en el plano y bajo **Capas GIS** en el panel izquierdo. La importación es un solo paso: {{key:Mod+Z}} la deshace.

Un archivo grande muestra una línea de progreso sobre el plano con un botón {{ui:Cancelar}}.

## El sistema de coordenadas

Los archivos GIS indican dónde están mediante un sistema de coordenadas (el `.prj` de un shapefile, la tabla de referencia espacial de un GeoPackage; GeoJSON siempre es latitud y longitud). CivilCraft convierte cada capa de su propio sistema al del proyecto. Nunca adivina:

- **El proyecto tiene sistema de coordenadas** (definido en {{ui:Coordenadas}}): cada capa con sistema propio se convierte a él, incluido un ajuste de suelo o local. Un archivo sin `.prj` tiene dos opciones: **Igual que el proyecto** (sus números se cargan tal cual) o **Elegir el sistema del archivo**.
- **El proyecto no tiene, y el archivo está en un sistema proyectado con las unidades del proyecto** (por ejemplo, una zona plana en pies de EE. UU. para un proyecto en pies): el cuadro ofrece **Usar ese sistema como sistema de coordenadas del proyecto**. Se define en el mismo paso de deshacer que la importación. Nada del proyecto se mueve; el sistema solo indica qué significan los números. Podés elegir otro sistema para el proyecto, y las capas se convierten a él.
- **El proyecto no tiene, y el archivo está en latitud y longitud** (todo GeoJSON) **o en otras unidades**: {{ui:Importar}} queda en gris hasta que elijas el sistema de coordenadas del proyecto. El selector empieza cerca de los datos.
- **Ni el proyecto ni los archivos nombran un sistema**: los números se cargan tal cual, y el cuadro lo indica.

Las cotas también se convierten: las alturas de GeoJSON son metros (lo dice el estándar GeoJSON); las alturas de otros archivos se toman en la unidad de su propio sistema.

:::warning
Las posiciones de un archivo GeoJSON fuera de ±180° de longitud o ±90° de latitud no son latitud y longitud. Esos elementos se omiten y el cuadro indica cuántos. Suele ser un archivo proyectado guardado sin su sistema; pedilo de nuevo, o pedí el shapefile con su `.prj`.
:::

NAD83 se trata igual que WGS 84 (el sistema que usa GeoJSON); las dos difieren por unos pocos metros en América del Norte, así que los datos GeoJSON pueden estar desfasados esa cantidad. Cuando el mejor desplazamiento necesita un archivo de grilla (NADCON para NAD27, por ejemplo), CivilCraft usa un desplazamiento publicado más aproximado, y el cuadro de sistema de coordenadas muestra qué tan aproximado es (para NAD27, unos 20 m), hasta que agregues la grilla: ver [Archivos de desplazamiento de grilla](topic:coordinate-systems).

## Capas GIS

Cada fila bajo **Capas GIS** tiene:

- una casilla para mostrar u ocultar la capa (las capas ocultas tampoco se seleccionan);
- su color, elegido de la lista;
- un menú (los tres puntos) con {{ui:Hacer zoom a}}, {{ui:Usar para la superficie…}}, {{ui:Renombrar…}} y {{ui:Eliminar}}.

Mostrar, ocultar, cambiar color, renombrar y quitar son pasos de deshacer. Las capas GIS se guardan en el archivo del proyecto y vuelven al abrirlo. También salen con el PDF del plano y sus exportaciones DXF y DWG, cada una en una capa llamada `GIS-` y su número.

## Etiquetar elementos con un atributo

En el menú {{ui:Más}} de la capa (los tres puntos en **Capas GIS**), elegí un campo bajo **Etiquetar con**: cada elemento muestra su valor en el plano, en el color de la capa. Los puntos se etiquetan junto al punto, las líneas a lo largo de su parte más larga (girado para leerse de izquierda a derecha), los polígonos en su centro. Los números muestran hasta tres decimales. Las etiquetas miden 1,8 mm de alto en papel a cualquier escala, y pasan al PDF, DXF y DWG. Elegí **Sin etiquetas** para quitarlas; cada cambio es un paso ({{key:Mod+Z}} lo deshace). Una capa etiqueta como máximo 5.000 elementos.

## Ver un elemento

Con {{ui:Seleccionar}} activado, hacé clic en un elemento. **Propiedades** muestra su capa, qué elemento es, su forma (partes, huecos, vértices), sus cotas, el archivo de origen y el sistema de coordenadas de ese archivo, y después cada atributo en una tabla. Los atributos son de solo lectura: CivilCraft muestra los datos GIS tal como llegaron, no los edita.

Cuando el puntero está sobre varios, los puntos ganan a las líneas; dentro de un polígono se elige el polígono más pequeño.

## Usar para la superficie

Abrí el menú de una capa y elegí {{ui:Usar para la superficie…}} (o el botón en **Propiedades**). Lo que se ofrece depende de la capa:

| Capa | Puede convertirse en |
|---|---|
| Líneas con cotas (líneas 3D) | Líneas de quiebre a sus propias cotas |
| Líneas sin cotas pero con un campo numérico (curvas de nivel) | Líneas de quiebre a la cota del campo que elijas |
| Polígonos | El límite de la superficie (el polígono seleccionado, si no el más grande), o líneas de quiebre a lo largo de sus bordes |
| Puntos con cotas, o con un campo de cota | Puntos de relevamiento, descritos con el nombre de la capa para formar un grupo de puntos |

Cada uso es un paso de deshacer que copia la geometría al proyecto; la capa en sí queda como está. Las cotas se toman en las unidades del proyecto.

## Archivos de puntos con latitud y longitud

Un archivo de puntos cuyo encabezado nombra columnas **latitude** y **longitude** (`lat`, `latitude`, `lon`, `long`, `longitude`) se lee como grados, no como norte y este. El cuadro de importación lo indica. Al hacer clic en {{ui:Importar}}, los puntos se convierten al sistema de coordenadas del proyecto; un proyecto sin uno pide que lo elijas primero. Los grados nunca se cargan como pies. Las filas fuera de ±90° de latitud o ±180° de longitud se rechazan, con el motivo. La columna de cota se toma tal cual, en unidades del proyecto.

## Archivos LandXML que nombran un sistema de coordenadas

Cuando un archivo LandXML que abrís tiene un elemento `CoordinateSystem` (un código EPSG, una descripción WKT o un nombre de sistema), CivilCraft lo ofrece como sistema de coordenadas del proyecto. Si lo aceptás, nada se mueve; el sistema solo indica qué significan los números.

## Qué se verificó

- Cada lector se comparó con GDAL, la biblioteca que usan la mayoría de los programas GIS, con archivos que GDAL escribió: shapefiles de todos los tipos con y sin cotas, líneas de varias partes, polígonos con huecos, geometrías vacías, atributos de texto, número, fecha y verdadero/falso, texto UTF-8 y Windows-1252 con y sin `.cpg`, un zip de varios shapefiles, GeoJSON con todos los tipos de geometría, y un GeoPackage con cuatro tablas. Coincidieron todas las geometrías, cotas y atributos.
- Las posiciones convertidas desde latitud y longitud, y desde UTM, coincidieron con PROJ (la biblioteca de proyecciones detrás de GDAL) dentro de 3 mm.
- Los archivos dañados (cortados, con tamaños falsos, zips rotos, GeoPackage rotos) dan un mensaje simple; nada se cuelga.
- Nada de esto se abrió todavía en otros programas GIS, y las geodatabases de archivo, KML y KMZ todavía no se leen (ver [Todavía no construido](topic:not-built-yet)).
