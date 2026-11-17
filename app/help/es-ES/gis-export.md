---
title: Exportar datos as-built para SIG
summary: Enviar puntos de topografía, curvas de nivel, alineaciones, plataformas, líneas de empalme, tuberías y estructuras a un departamento de SIG de un ayuntamiento o de una diputación, como shapefiles, GeoPackage, GeoJSON o KML, en coordenadas de cuadrícula del sistema de coordenadas del proyecto.
keywords: sig, exportar, kml, kmz, google earth, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, tuberías, estructuras, servicios, ayuntamiento, municipio, cuadrícula, terreno, epsg, prj
from: bba4fea5
---

Muchos ayuntamientos piden datos as-built en un formato SIG al cerrar un proyecto: dónde fueron las tuberías y las estructuras, las rasantes finales, el eje de la vía. **SIG › Exportar** escribe lo que CivilCraft tiene como capas SIG, una por cada tipo de objeto.

## Antes de exportar

1. Defina el sistema de coordenadas del proyecto en {{ui:Coordenadas}}. Un departamento de SIG necesita saber dónde están los números; sin un sistema, los archivos llevan los números propios del proyecto y no indican ninguno.
2. Revise la superficie, las alineaciones, las plataformas y la red de tuberías tal como quiere entregarlas.
3. Pregunte al departamento qué formato y qué sistema de coordenadas quiere. Muchos todavía piden shapefiles en la zona State Plane del estado; los sistemas más nuevos admiten GeoPackage.

## Exportar

1. Pulse {{ui:Exportar}} en el grupo **SIG**.
2. En **Qué**, marque los tipos que quiere enviar. Cada uno muestra cuántos elementos tiene; los tipos sin nada todavía aparecen atenuados.
3. En **Formato**, elija el formato.
4. Lea las notas sobre coordenadas y unidades, y pulse el botón de descargar. La línea de estado indica qué se incluyó y los nombres de campo que se acortaron.

El cuadro también incluye la exportación de la retícula de elevaciones ({{ui:Superficie como retícula de elevaciones GeoTIFF}}); vea [Retículas de elevación y LiDAR](topic:elevation-grids-and-lidar).

## Qué contiene cada tipo

| Tipo | Forma | Campos |
|---|---|---|
| Puntos de topografía | Puntos con elevación | `P` número de punto, `N` norte, `E` este, `Z` elevación, `D` descripción |
| Curvas de nivel del terreno existente, de la superficie proyectada | Líneas a su elevación | `ELEV` |
| Líneas de rotura | Líneas con elevaciones | `NAME` |
| Límite de la superficie | Polígono (el límite dibujado; si no, el borde de la superficie) | `NAME` |
| Alineaciones | Ejes | `NAME`, `LENGTH`, `STA_START`, `STA_END` (puntos kilométricos como números simples) |
| Plataformas | Polígonos a la elevación de la plataforma | `NAME`, `ELEV`, `AREA` |
| Líneas de empalme con el terreno | Líneas con elevaciones (plataformas y corredores) | `NAME` |
| Líneas característica de corredor: eje, bordes de calzada, arcenes | Líneas con elevaciones | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Tuberías | Líneas desde la cota de batea superior hasta la inferior | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (porcentaje), `LENGTH`, `NETWORK` |
| Estructuras | Puntos en el brocal | `NAME`, `RIM`, `INVERT` (la cota de batea más baja de tubería en ese punto), `SUMP`, `DIA`, `DIA_UNIT` |
| Cada capa SIG | Tal como se importó | Sus propios campos |

Las longitudes, las estaciones y las elevaciones están en las unidades del proyecto (pies de topógrafo de EE. UU. o metros). Los diámetros de tuberías y estructuras van en pulgadas en proyectos en pies y en milímetros en proyectos en metros; `DIA_UNIT` indica cuál.

## Los formatos

- **Shapefile**: un `.zip` con un shapefile por tipo (`.shp`, `.shx`, `.dbf`), un `.cpg` que indica que el texto es UTF-8, y un `.prj` que nombra el sistema de coordenadas. Las formas con elevaciones se escriben como tipos Z del shapefile. Los nombres de campo de más de 10 caracteres se acortan, como exige el formato, y la línea de estado los enumera.
- **GeoPackage**: un archivo `.gpkg` con una tabla por tipo, y el sistema de coordenadas guardado con su código EPSG. Un solo archivo en vez de muchos, con los nombres de campo largos conservados.
- **KML** o **KMZ** (KML comprimido): un archivo de latitud y longitud para Google Earth y mapas web, con una carpeta por tipo y cada elemento como marca de posición con el nombre de su campo NAME y todos sus campos como datos extendidos; alturas en metros (modo de altitud absoluta). Como GeoJSON, necesita el sistema de coordenadas del proyecto.
- **GeoJSON**: un archivo de latitud y longitud (el estándar GeoJSON no admite otra cosa), con cada elemento con una propiedad `kind` (`pipes`, `structures`, …) para que quien lo reciba pueda separarlos. Las alturas se convierten a metros, como exige el estándar; siguen en el datum vertical del proyecto (CivilCraft no tiene modelo de geoide). Un proyecto sin sistema de coordenadas no puede exportar GeoJSON, y el cuadro indica por qué.

## Cuadrícula, no terreno

Los departamentos de SIG guardan sus datos en coordenadas de **cuadrícula** de un sistema de coordenadas. Si su proyecto usa coordenadas de terreno o locales (definidas en {{ui:Coordenadas}}), cada coordenada se convierte de nuevo a cuadrícula al salir: los números de los archivos difieren de los de la planta según su factor de escala (y según la rotación, en un sistema local). Los campos de punto `N` y `E` también contienen los valores de cuadrícula. El cuadro se lo recuerda.

:::tip
Envíe una nota breve con los archivos: el sistema de coordenadas y su código EPSG, el datum vertical de sus elevaciones, las unidades y qué es cada archivo.
:::

## Qué se comprobó

- Cada archivo escrito se volvió a leer con GDAL, la biblioteca que usan la mayoría de programas SIG para leer estos archivos: cada forma, elevación y atributo, los recuentos de elementos, y el sistema de coordenadas como código EPSG (`.prj` y GeoPackage). Nuestros propios lectores los leen igual.
- Los archivos GeoJSON siguen RFC 7946: primero longitud y después latitud, sin miembro `crs`, anillos exteriores en sentido antihorario y agujeros en sentido horario; las posiciones coincidieron con PROJ a 2 mm.
- Se exportó un proyecto con coordenadas de terreno y se comprobó cada punto frente a sus coordenadas de cuadrícula.
- Todavía no se ha abierto nada de esto en otros programas SIG. Revise la primera entrega con el departamento antes de fiarse de ella.
