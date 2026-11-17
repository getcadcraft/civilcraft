---
title: Importar datos SIG
summary: Traer shapefiles, GeoJSON y GeoPackages a un proyecto como capas SIG, colocarlos mediante el sistema de coordenadas adecuado, ver sus atributos y usarlos para la superficie.
keywords: sig, etiquetas, etiquetar elementos, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, importar, capas, atributos, sistema de coordenadas, epsg, latitud, longitud, curvas de nivel, parcelas, líneas de rotura, límite
from: f6b235cc
---

Los departamentos de SIG de ayuntamientos y diputaciones entregan el contexto del emplazamiento en archivos SIG: parcelas, servidumbres, curvas de nivel, servicios, red de control topográfico. CivilCraft abre tres tipos de ellos como **capas SIG** que quedan debajo de su diseño en la planta.

| Archivo | Qué abrir |
|---|---|
| Shapefile | El `.shp` junto con su `.shx`, `.dbf`, `.prj` y `.cpg` (selecciónelos todos), o el `.zip` en que llegaron. Un zip con varios shapefiles da varias capas. |
| GeoJSON | El archivo `.geojson` (un `.json` cuyas primeras líneas digan `FeatureCollection` o `Feature` también sirve). |
| GeoPackage | El archivo `.gpkg`. Se listan todas las tablas de elementos que contiene. |
| KML o KMZ | El archivo `.kml` (de Google Earth o de un mapa web), o el `.kmz` comprimido. Cada carpeta se convierte en una capa (se divide en puntos, líneas y polígonos cuando contiene varios tipos); el nombre, la descripción y los datos extendidos de una marca se convierten en sus atributos. Las alturas están en metros y en latitud y longitud, como en GeoJSON. |

Se leen puntos, multipuntos, líneas, polígonos con huecos y formas de varias partes, con sus elevaciones (z) cuando el archivo las tiene. Los valores de medida (M) se omiten. Las retículas de elevación y el LiDAR se abren del mismo modo: vea [Retículas de elevación y LiDAR](topic:elevation-grids-and-lidar).

## Abrir los archivos

1. Pulse {{ui:Importar}} en el grupo **SIG** (o {{ui:Abrir}}), elija los archivos o suéltelos sobre la planta. Los archivos se leen en este equipo; no se suben a ningún sitio.
2. El cuadro **Importar datos SIG** enumera cada capa encontrada: su tipo, cuántos elementos tiene (y cuántos no tienen geometría), cuántos campos de atributo tiene y el sistema de coordenadas que indica el archivo. Desmarque las capas que no quiera.
3. Lea la parte **Sistema de coordenadas** (más abajo) y la línea **Qué pasará**, y después pulse {{ui:Importar}}.
4. Las capas aparecen en la planta y bajo **Capas SIG** en el panel izquierdo. La importación es un solo paso: {{key:Mod+Z}} la deshace.

Un archivo grande muestra una línea de progreso sobre la planta con un botón {{ui:Cancelar}}.

## El sistema de coordenadas

Los archivos SIG indican dónde están mediante un sistema de coordenadas (el `.prj` de un shapefile, o la tabla de referencia espacial de un GeoPackage; GeoJSON siempre usa latitud y longitud). CivilCraft convierte cada capa de su propio sistema al del proyecto. Nunca lo adivina:

- **El proyecto tiene sistema de coordenadas** (definido en {{ui:Coordenadas}}): cada capa con sistema propio se convierte a él, incluido un ajuste de terreno o local. Un archivo sin `.prj` tiene dos opciones: **Igual que el proyecto** (sus números se cargan tal cual) o **Elegir el sistema del archivo**.
- **El proyecto no tiene ninguno, y el archivo está en un sistema proyectado en las unidades del proyecto** (una zona State Plane en pies de topógrafo de EE. UU. para un proyecto en pies, por ejemplo): el cuadro ofrece **Usar ese sistema como sistema de coordenadas del proyecto**. Se define en el mismo paso de deshacer que la importación. Nada del proyecto se mueve; el sistema solo indica qué significan los números. Puede elegir otro sistema para el proyecto, y entonces las capas se convierten a él.
- **El proyecto no tiene ninguno, y el archivo está en latitud y longitud** (todo GeoJSON) **o en otras unidades**: {{ui:Importar}} aparece atenuado hasta que elija el sistema de coordenadas del proyecto. El selector empieza cerca de los datos.
- **Ni el proyecto ni los archivos indican un sistema**: los números se cargan tal cual, y el cuadro lo indica.

Las elevaciones también se convierten: las alturas de GeoJSON son metros (así lo indica el estándar GeoJSON); las alturas de los demás archivos se toman en la unidad de su propio sistema.

:::warning
Las posiciones de un archivo GeoJSON fuera de ±180° de longitud o ±90° de latitud no son latitud y longitud. Esos elementos se omiten y el cuadro indica cuántos son. Suele tratarse de un archivo proyectado guardado sin su sistema; pida de nuevo el archivo, o pida el shapefile con su `.prj`.
:::

NAD83 se trata como igual que WGS 84 (el sistema que usa GeoJSON); los dos difieren en unos pocos metros en Norteamérica, así que los datos GeoJSON pueden estar desplazados esa cantidad. Cuando el mejor desplazamiento necesita un archivo de cuadrícula (NADCON para NAD27, por ejemplo), CivilCraft usa un desplazamiento publicado más aproximado, y el cuadro del sistema de coordenadas muestra cuánto (para NAD27, unos 20 m), hasta que añada el archivo de cuadrícula: vea [Archivos de desplazamiento de cuadrícula](topic:coordinate-systems).

## Capas SIG

Cada fila bajo **Capas SIG** tiene:

- una casilla para mostrar u ocultar la capa (las capas ocultas tampoco se seleccionan);
- su color, elegido de la lista;
- un menú (los tres puntos) con {{ui:Hacer zoom a}}, {{ui:Usar para la superficie…}}, {{ui:Cambiar nombre…}} y {{ui:Quitar}}.

Mostrar, ocultar, cambiar el color, renombrar y quitar son pasos de deshacer. Las capas SIG se guardan en el archivo del proyecto y vuelven al abrirlo. También salen con la impresión PDF de la planta y con sus exportaciones DXF y DWG, cada una en una capa llamada `GIS-` y su número.

## Etiquetar elementos con un atributo

En el menú {{ui:Más}} de la capa (los tres puntos en **Capas SIG**), elija un campo en **Etiquetar con**: cada elemento muestra su valor en la planta, con el color de la capa. Los puntos se etiquetan junto al punto, las líneas a lo largo de la mitad de su parte más larga (giradas para leerse de izquierda a derecha), y los polígonos en su centro. Los números muestran hasta tres decimales. Las etiquetas miden 1.8 mm de altura en papel a cualquier escala, y pasan a la impresión PDF, DXF y DWG. Elija **Sin etiquetas** para quitarlas; cada cambio es un paso ({{key:Mod+Z}} lo deshace). Una capa etiqueta como máximo 5,000 elementos.

## Ver un elemento

Con {{ui:Seleccionar}} activado, haga clic en un elemento. **Propiedades** muestra su capa, qué elemento es, su forma (partes, huecos, vértices), sus elevaciones, el archivo del que procede y el sistema de coordenadas de ese archivo, y después cada atributo en una tabla. Los atributos son de solo lectura: CivilCraft muestra los datos SIG tal como llegaron, no los edita.

Si bajo el puntero hay a la vez un punto y una línea, gana el punto; dentro de un polígono se elige el polígono más pequeño.

## Usar para la superficie

Abra el menú de una capa y elija {{ui:Usar para la superficie…}} (o el botón de **Propiedades**). Lo que se ofrece depende de la capa:

| Capa | Puede convertirse en |
|---|---|
| Líneas con elevaciones (líneas 3D) | Líneas de rotura a sus propias elevaciones |
| Líneas sin elevaciones pero con un campo numérico (curvas de nivel) | Líneas de rotura a la elevación del campo que elija |
| Polígonos | El límite de la superficie (el polígono seleccionado, o si no el mayor), o líneas de rotura a lo largo de sus bordes |
| Puntos con elevaciones, o con un campo de elevación | Puntos de topografía, descritos con el nombre de la capa para que formen un grupo de puntos |

Cada uso es un paso de deshacer que copia la geometría al proyecto; la capa en sí queda como estaba. Las elevaciones se toman en las unidades del proyecto.

## Archivos de puntos con latitud y longitud

Un archivo de puntos cuya cabecera nombra columnas de **latitud** y **longitud** (`lat`, `latitude`, `lon`, `long`, `longitude`) se lee como grados, no como norte y este. El cuadro de importación lo indica. Al pulsar {{ui:Importar}}, los puntos se convierten al sistema de coordenadas del proyecto; un proyecto sin uno le pide que lo elija primero. Los grados nunca se cargan como pies. Las filas fuera de ±90° de latitud o ±180° de longitud se rechazan indicando el motivo. La columna de elevación se toma tal cual, en las unidades del proyecto.

## Archivos LandXML que nombran un sistema de coordenadas

Cuando un archivo LandXML que abre tiene un elemento `CoordinateSystem` (un código EPSG, una descripción WKT o un nombre de sistema), CivilCraft lo ofrece como sistema de coordenadas del proyecto. Si lo acepta, nada se mueve; el sistema solo indica qué significan los números.

## Qué se comprobó

- Cada lector se comparó con GDAL, la biblioteca que usan la mayoría de programas SIG para leer estos archivos, con archivos que GDAL escribió: shapefiles de todos los tipos, con y sin elevaciones, líneas de varias partes, polígonos con huecos, geometrías vacías, atributos de texto, número, fecha y verdadero/falso, texto UTF-8 y Windows-1252 con y sin `.cpg`, un zip de varios shapefiles, GeoJSON con todos los tipos de geometría, y un GeoPackage con cuatro tablas. Cada geometría, elevación y atributo coincidió.
- Las posiciones convertidas desde latitud y longitud, y desde UTM, coincidieron con PROJ (la biblioteca de proyecciones que está detrás de GDAL) a 3 mm.
- Los archivos dañados (cortados, con tamaños falsos, zips o GeoPackages defectuosos) dan un único mensaje sencillo; nada se queda colgado.
- Todavía no se ha abierto nada de esto en otros programas SIG, y las geodatabases de archivo, KML y KMZ todavía no se leen (vea [Todavía no está hecho](topic:not-built-yet)).
