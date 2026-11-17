---
title: Exportar datos como construidos para GIS
summary: Entregar puntos de relevamiento, curvas de nivel, trazados, plataformas, caños y estructuras a un departamento GIS municipal o departamental como shapefiles, GeoPackage, GeoJSON o KML, en coordenadas de cuadrícula del sistema de coordenadas del proyecto.
keywords: gis, exportar, kml, kmz, google earth, como construido, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, caños, estructuras, servicios, municipio, departamento, cuadrícula, suelo, epsg, prj
from: bba4fea5
---

Muchas municipalidades y departamentos piden datos como construidos en formato GIS al cerrar un proyecto: dónde fueron los caños y las estructuras, las pendientes finales, el eje de la calle. **GIS › Exportar** escribe lo que CivilCraft tiene como capas GIS, una por tipo de objeto.

## Antes de exportar

1. Definí el sistema de coordenadas del proyecto en {{ui:Coordenadas}}. El departamento GIS necesita saber dónde están los números; sin sistema, los archivos llevan los números propios del proyecto y no nombran ninguno.
2. Revisá la superficie, los trazados, las plataformas y la red de caños como querés entregarlos.
3. Preguntá al departamento qué formato y qué sistema de coordenadas quieren. Muchos todavía piden shapefiles en la zona plana local; los sistemas nuevos aceptan GeoPackage.

## Exportar

1. Hacé clic en {{ui:Exportar}} en el grupo **GIS**.
2. En **Qué**, marcá los tipos a enviar. Cada uno muestra cuántos elementos tiene; los tipos sin nada están en gris.
3. En **Como**, elegí el formato.
4. Leé las notas sobre coordenadas y unidades, y después hacé clic en el botón de descarga. La línea de estado dice qué se incluyó y qué nombres de campo se acortaron.

El cuadro también tiene la exportación de la grilla de cotas ({{ui:Superficie como grilla de cotas GeoTIFF}}); ver [Grillas de cotas y LiDAR](topic:elevation-grids-and-lidar).

## Qué tiene cada tipo

| Tipo | Forma | Campos |
|---|---|---|
| Puntos de relevamiento | Puntos con cota | `P` número de punto, `N` norte, `E` este, `Z` cota, `D` descripción |
| Curvas de nivel del terreno existente y de la superficie proyectada | Líneas a su cota | `ELEV` |
| Líneas de quiebre | Líneas con cotas | `NAME` |
| Límite de la superficie | Polígono (el límite dibujado, si no el borde de la superficie) | `NAME` |
| Trazados | Ejes | `NAME`, `LENGTH`, `STA_START`, `STA_END` (estacas como números simples) |
| Plataformas | Polígonos a la cota de la plataforma | `NAME`, `ELEV`, `AREA` |
| Líneas de empalme | Líneas con cotas (plataformas y corredores) | `NAME` |
| Líneas de elementos del corredor | Líneas con cotas: eje, bordes de calzada, banquinas | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Caños | Líneas desde la cota de intradós superior a la inferior | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (porcentaje), `LENGTH`, `NETWORK` |
| Estructuras | Puntos en el borde superior | `NAME`, `RIM`, `INVERT` (la cota de intradós más baja ahí), `SUMP`, `DIA`, `DIA_UNIT` |
| Cada capa GIS | Como fue importada | Sus propios campos |

Longitudes, estacas y cotas están en las unidades del proyecto (pies de EE. UU. o metros). Los diámetros de caños y estructuras están en pulgadas para proyectos en pies y en milímetros para proyectos en metros; `DIA_UNIT` indica cuál.

## Los formatos

- **Shapefile**: un `.zip` con un shapefile por tipo (`.shp`, `.shx`, `.dbf`), un `.cpg` que indica que el texto es UTF-8, y un `.prj` que nombra el sistema de coordenadas. Las formas con cotas se escriben como tipos Z del shapefile. Los nombres de campo de más de 10 caracteres se acortan, como exige el formato, y la línea de estado los lista.
- **GeoPackage**: un archivo `.gpkg` con una tabla por tipo, el sistema de coordenadas guardado con su código EPSG. Un solo archivo en lugar de muchos, con nombres de campo largos conservados.
- **KML** o **KMZ** (KML comprimido): un archivo de latitud y longitud para Google Earth y mapas web, una carpeta por tipo, cada elemento como marcador con el nombre del campo NAME y todos los campos como datos extendidos; alturas en metros (modo de altitud absoluta). Como GeoJSON, necesita el sistema de coordenadas del proyecto.
- **GeoJSON**: un archivo de latitud y longitud (el estándar GeoJSON no admite otra cosa) con cada elemento que lleva una propiedad `kind` (`pipes`, `structures`, …) para que el receptor los separe. Las alturas se convierten a metros, como pide el estándar; siguen en el datum vertical de tu proyecto (CivilCraft no tiene modelo de geoide). Un proyecto sin sistema de coordenadas no puede exportar GeoJSON, y el cuadro indica por qué.

## Cuadrícula, no suelo

Los departamentos GIS guardan sus datos en coordenadas de **cuadrícula** de un sistema de coordenadas. Si tu proyecto usa coordenadas de suelo o locales (definidas en {{ui:Coordenadas}}), cada coordenada se convierte de vuelta a cuadrícula al salir: los números de los archivos difieren de los del plano por tu factor de escala (y por la rotación, en un sistema local). Los campos de punto `N` y `E` también llevan los valores de cuadrícula. El cuadro lo recuerda.

:::tip
Enviá una nota corta con los archivos: el sistema de coordenadas y su código EPSG, el datum vertical de tus cotas, las unidades y qué es cada archivo.
:::

## Qué se verificó

- Cada archivo escrito se volvió a leer con GDAL, la biblioteca que usan la mayoría de los programas GIS: cada forma, cota y atributo, las cantidades de elementos, y el sistema de coordenadas como código EPSG (`.prj` y GeoPackage). Nuestros propios lectores los leen igual.
- Los archivos GeoJSON siguen RFC 7946: longitud antes que latitud, sin miembro `crs`, anillos exteriores antihorarios y huecos horarios; las posiciones coincidieron con PROJ dentro de 2 mm.
- Se exportó un proyecto de coordenadas de suelo y se comprobó cada punto contra sus coordenadas de cuadrícula.
- Nada de esto se abrió todavía en otros programas GIS. Verificá la primera entrega con el departamento antes de confiar en ella.
