---
title: Exportar datos según lo construido para SIG
summary: Entregue puntos de levantamiento, curvas de nivel, alineaciones, plataformas, tuberías y estructuras a un departamento municipal o de condado de SIG como shapefiles, GeoPackage, GeoJSON o KML, en coordenadas de rejilla del sistema de coordenadas del proyecto.
keywords: sig, exportar, kml, kmz, google earth, según lo construido, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, tuberías, estructuras, servicios, municipio, condado, rejilla, terreno, epsg, prj
from: bba4fea5
---

Muchas ciudades y condados piden datos según lo construido en un formato SIG al cerrar un proyecto: dónde quedaron las tuberías y las estructuras, las rasantes finales, el eje de la vialidad. **SIG › Exportar** escribe lo que CivilCraft tiene como capas SIG, una por cada tipo de objeto.

## Antes de exportar

1. Defina el sistema de coordenadas del proyecto en {{ui:Coordenadas}}. El departamento de SIG necesita saber dónde están los números; sin un sistema, los archivos llevan los números propios del proyecto y no nombran ninguno.
2. Revise la superficie, las alineaciones, las plataformas y la red de tuberías tal como quiere entregarlas.
3. Pregunte al departamento qué formato y qué sistema de coordenadas quiere. Muchos todavía piden shapefiles en la zona state plane local; los sistemas más recientes aceptan GeoPackage.

## Exportar

1. Haga clic en {{ui:Exportar}} en el grupo **SIG**.
2. En **Contenido**, marque los tipos a enviar. Cada uno muestra cuántas entidades tiene; los tipos sin nada todavía aparecen en gris.
3. En **Formato**, elija el formato.
4. Lea las notas sobre coordenadas y unidades, y luego haga clic en el botón de descarga. La línea de estado indica qué se incluyó y cualquier nombre de campo que se acortó.

El cuadro de diálogo también incluye la exportación de la cuadrícula de elevaciones ({{ui:Superficie como rejilla de elevaciones GeoTIFF}}); vea [Cuadrículas de elevación y LiDAR](topic:elevation-grids-and-lidar).

## Qué contiene cada tipo

| Tipo | Forma | Campos |
|---|---|---|
| Puntos de levantamiento | Puntos con elevación | `P` número de punto, `N` norte, `E` este, `Z` elevación, `D` descripción |
| Curvas de nivel del terreno existente, de la superficie de proyecto | Líneas a su elevación | `ELEV` |
| Líneas de quiebre | Líneas con elevaciones | `NAME` |
| Límite de la superficie | Polígono (el límite dibujado, o si no el borde de la superficie) | `NAME` |
| Alineaciones | Ejes | `NAME`, `LENGTH`, `STA_START`, `STA_END` (estaciones como números simples) |
| Plataformas | Polígonos a la elevación de la plataforma | `NAME`, `ELEV`, `AREA` |
| Líneas de empate | Líneas con elevaciones (plataformas y obras lineales) | `NAME` |
| Líneas de elementos de obra lineal | Líneas con elevaciones: eje, bordes de pavimento, acotamientos | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Tuberías | Líneas de la plantilla superior a la plantilla inferior | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (porcentaje), `LENGTH`, `NETWORK` |
| Estructuras | Puntos en el brocal | `NAME`, `RIM`, `INVERT` (la plantilla más baja de tubería en ese punto), `SUMP`, `DIA`, `DIA_UNIT` |
| Cada capa SIG | Como se importó | Sus propios campos |

Las longitudes, las estaciones y las elevaciones están en las unidades del proyecto (pies de agrimensura de EE. UU. o metros). Los diámetros de tuberías y estructuras van en pulgadas para proyectos en pies, y en milímetros para proyectos en metros; `DIA_UNIT` indica cuál.

## Los formatos

- **Shapefile**: un `.zip` con un shapefile por tipo (`.shp`, `.shx`, `.dbf`), un `.cpg` que indica que el texto es UTF-8, y un `.prj` que nombra el sistema de coordenadas. Las formas con elevaciones se escriben como los tipos Z del shapefile. Los nombres de campo de más de 10 caracteres se acortan, como exige el formato, y la línea de estado los enumera.
- **GeoPackage**: un archivo `.gpkg` con una tabla por tipo, y el sistema de coordenadas guardado con su código EPSG. Un solo archivo en lugar de varios, con los nombres de campo largos conservados.
- **KML** o **KMZ** (KML comprimido): un archivo de latitud y longitud para Google Earth y mapas web, con una carpeta por tipo y cada entidad como marca nombrada a partir de su campo NAME, con todos los campos como datos extendidos; alturas en metros (modo de altitud absoluta). Como GeoJSON, necesita el sistema de coordenadas del proyecto.
- **GeoJSON**: un archivo de latitud y longitud (el estándar GeoJSON no permite otra cosa), con cada entidad con una propiedad `kind` (`pipes`, `structures`, …) para que el receptor las separe. Las alturas se convierten a metros, como pide el estándar; siguen en el datum vertical de su proyecto (CivilCraft no tiene modelo de geoide). Un proyecto sin sistema de coordenadas no puede exportar GeoJSON, y el cuadro de diálogo lo explica.

## Rejilla, no terreno

Los departamentos de SIG guardan sus datos en coordenadas de **rejilla** de un sistema de coordenadas. Si su proyecto usa coordenadas de terreno o locales (definidas en {{ui:Coordenadas}}), cada coordenada se convierte de vuelta a rejilla al salir: los números de los archivos difieren de los de la planta por su factor de escala (y por la rotación, en un sistema local). Los campos de punto `N` y `E` también contienen los valores de rejilla. El cuadro de diálogo se lo recuerda.

:::tip
Envíe una nota corta con los archivos: el sistema de coordenadas y su código EPSG, el datum vertical de sus elevaciones, las unidades y qué es cada archivo.
:::

## Lo que se verificó

- Cada archivo escrito se leyó de nuevo con GDAL, la biblioteca que usan la mayoría de los programas SIG para leer estos archivos: cada forma, elevación y atributo, los conteos de entidades, y el sistema de coordenadas como su código EPSG (`.prj` y GeoPackage). Nuestros propios lectores los leen de la misma manera.
- Los archivos GeoJSON siguen RFC 7946: primero la longitud y luego la latitud, sin miembro `crs`, anillos exteriores en sentido antihorario y huecos en sentido horario; las posiciones coinciden con PROJ a 2 mm.
- Se exportó un proyecto con coordenadas de terreno y cada punto se verificó contra sus coordenadas de rejilla.
- Nada de esto se ha abierto todavía en otros programas SIG. Revise la primera entrega con el departamento antes de confiar en ella.
