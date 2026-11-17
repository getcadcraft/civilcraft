---
title: Cuadrículas de elevación y LiDAR
summary: Cree el terreno existente a partir de un DEM (GeoTIFF o cuadrícula ASCII) o de puntos LiDAR (LAS, LAZ); elija el área, reduzca los datos, elija clases y verifique las unidades de elevación, y devuelva una superficie como cuadrícula de elevación GeoTIFF.
keywords: dem, dtm, cuadrícula de elevación, geotiff, tif, cuadrícula ascii, asc, lidar, las, laz, nube de puntos, clases, terreno, reducción de densidad, nodata, ráster, exportar geotiff, gis
from: c8b2d18a
---

Hay dos formas de obtener datos públicos de elevación: **cuadrículas de elevación** (un DEM: una elevación por celda cuadrada, normalmente un GeoTIFF `.tif` o una cuadrícula ASCII `.asc`) y **puntos LiDAR** (millones de retornos láser en un archivo `.las`, o `.laz` si está comprimido). CivilCraft convierte cualquiera de los dos en puntos topográficos o en una superficie, dentro del navegador: no se sube nada a ningún servidor.

## Abrir el archivo

1. Haga clic en {{ui:Abrir}} (o en {{ui:Importar}} del grupo GIS) y elija el archivo, o arrástrelo a la planta. Para una cuadrícula ASCII, elija también su archivo `.prj`, para que CivilCraft conozca su sistema de coordenadas.
2. El cuadro de diálogo de importación muestra lo que el archivo dice de sí mismo: su tamaño, celdas o puntos, su sistema de coordenadas, su ubicación en latitud y longitud, y su rango de elevación. En LiDAR primero se lee cada punto una vez para contar las **clases** (una barra de progreso muestra el avance; {{ui:Cancelar}} lo detiene).

Una GeoTIFF de tres o cuatro bandas (rojo, verde, azul) es una imagen, no elevaciones: va a las capas de mapa.

## Elija qué importar

- **Área**: {{ui:La extensión del proyecto y un margen}} (escriba el margen), {{ui:Lo que muestra la planta ahora}} o {{ui:Todo el archivo}}. Solo se lee esa parte del archivo.
- **Reducir a**: la separación entre los puntos que obtiene, en las unidades del proyecto. La línea bajo la configuración indica cuántos puntos resultan mientras escribe. En una cuadrícula, CivilCraft conserva cada segunda, tercera… celda, para que las elevaciones sigan siendo exactamente las del archivo; nunca promedia celdas. En LiDAR, el área se divide en cuadros de ese tamaño y se conserva un punto por cuadro: {{ui:El punto más cercano al centro de cada celda}} (el predeterminado), {{ui:El punto más bajo de cada celda}} (útil cuando el archivo no tiene clase de terreno: el terreno queda bajo los árboles) o {{ui:El promedio de los puntos de cada celda}}.
- **Clases** (LiDAR): el terreno (clase 2) se marca cuando el archivo la tiene; edificios, árboles y ruido se dejan fuera. Cuando no hay clase de terreno, se marcan todas las clases y el cuadro de diálogo lo indica.
- **Terreno** (LiDAR, 0.8): una nube de un dron no tiene clase de terreno. Cuando el archivo no tiene ninguna, el cuadro de diálogo comienza en {{ui:Encontrar el suelo yo mismo (nubes de dron, sin clase de suelo)}}: se leen todas las clases excepto el ruido, se conserva el punto más bajo de cada celda y luego CivilCraft quita edificios, árboles y puntos bajos aislados con un filtro morfológico progresivo (Zhang y otros, 2003) que usted puede ajustar: **Objeto más grande a quitar** (el ancho del edificio más grande; las ventanas crecen hasta cubrirlo; 0 significa 20 celdas) y **Pendiente máxima del terreno**. El trabajo se hace sobre la cuadrícula de puntos más bajos, así que una nube de decenas de millones de puntos cuesta no más que su número de celdas (la reducción es una sola pasada en flujo). La separación es la celda: una más gruesa es más rápida y pierde menos objetos pequeños de lo que se podría pensar; una más fina conserva más detalle del terreno. El informe indica cuántos puntos se conservaron como terreno, cuántas celdas se quitaron como objetos y cuántos puntos bajos aislados se descartaron. En un levantamiento simulado de dron de 300 m, con cinco edificios, 70 árboles y 200 valores atípicos bajos, los puntos conservados estuvieron a 3 cm del terreno real y no se conservó ningún techo ni copa.
- **Elevaciones del archivo**: metros, pies o pies de agrimensura de EE. UU. Cuando el archivo lo indica, su unidad ya está elegida. Cuando no, debe elegirla: el cuadro de diálogo muestra el rango de elevación en ambas unidades para que pueda ver cuál tiene sentido para el sitio.
- **Importar como** (solo cuadrículas): {{ui:Puntos topográficos (descripción DEM)}} o {{ui:La superficie misma (una retícula de triángulos)}}.

Una importación admite como máximo 500,000 puntos. Cuando una elección daría más, el cuadro de diálogo indica en cuánto y qué separación cabría, y {{ui:Importar}} queda desactivado.

Haga clic en {{ui:Importar}}. Una barra de progreso muestra la lectura; {{ui:Cancelar}} la detiene y nada cambia.

:::warning
Las unidades verticales son una trampa común. Muchos DEM de State Plane tienen las coordenadas este y norte en pies, pero las elevaciones en metros. Compare el rango que muestra el cuadro de diálogo con lo que sabe del sitio.
:::

## Lo que obtiene

- **Puntos topográficos**: numerados a partir de su número de punto más alto, con la descripción `DEM` (cuadrículas) o `LIDAR`, de modo que forman un solo grupo de puntos bajo **Puntos** y construyen la superficie como cualquier otro punto. Importarlos es un solo paso: {{key:Mod+Z}} los quita de nuevo.
- **La superficie misma**: una TIN de cuadrícula, con dos triángulos por celda, dividida por la diagonal suroeste-noreste. Un triángulo con una esquina sin datos se omite, así que los huecos en los datos siguen siendo huecos. La superficie coincide con la cuadrícula en cada punto de la cuadrícula y es un plano dentro de cada triángulo entre ellos. Reemplaza la superficie del proyecto (el cuadro de diálogo pregunta antes); {{key:Mod+Z}} devuelve la superficie anterior. El encabezado del panel izquierdo dirá **Superficie (desde una cuadrícula de elevación)**.

## Sistemas de coordenadas

- Si el proyecto tiene sistema de coordenadas y el archivo nombra otro, cada punto se convierte al sistema del proyecto (y a sus coordenadas de terreno o locales cuando las tenga).
- Si el proyecto no tiene ninguno y el sistema del archivo está en las unidades del proyecto (pies o metros), el cuadro de diálogo ofrece hacerlo el sistema de coordenadas del proyecto, en el mismo paso de deshacer que los puntos.
- Si el archivo está en latitud y longitud, o en metros para un proyecto en pies, el cuadro de diálogo le pide elegir primero el sistema de coordenadas del proyecto.
- Si el archivo no lo indica, sus números se toman como coordenadas del proyecto. Puede elegir el sistema del archivo en su lugar.

## Exportar una superficie como GeoTIFF

1. Haga clic en {{ui:Exportar}} en el grupo GIS.
2. En la parte GeoTIFF, elija la superficie (terreno existente o la superficie de diseño) y el tamaño de celda. El predeterminado proviene de la arista promedio de triángulos de la superficie. El cuadro de diálogo muestra el tamaño de la cuadrícula que va a escribir.
3. Haga clic en {{ui:Descargar GeoTIFF}}.

El archivo es una banda de elevaciones de punto flotante de 32 bits en las unidades del proyecto, sobre el alcance de la superficie; las celdas fuera de la superficie son "sin datos" (−3.4028235e38). El valor de cada celda es la elevación de la superficie en el centro de la celda. Las coordenadas son de **cuadrícula**: un proyecto en coordenadas de terreno o locales se convierte de nuevo a la cuadrícula. El archivo indica el sistema de coordenadas del proyecto por su código EPSG; un sistema sin código EPSG no se escribe, y el cuadro de diálogo le advierte que avise al departamento de GIS cuál es ese sistema.

## Lo que se verificó

- Los lectores de GeoTIFF y de cuadrícula ASCII se verificaron contra GDAL (a través de rasterio), la biblioteca que usan la mayoría de los programas GIS para leer estos archivos: cuadrículas de punto flotante de 32 bits y de enteros de 16 bits, en mosaico y por bandas, DEFLATE y LZW, nodata, escala y desplazamiento, pixel-is-point, una cuadrícula UTM, una cuadrícula State Plane en pies de agrimensura de EE. UU. y una cuadrícula de latitud y longitud: cada valor igual.
- Los lectores de LAS y LAZ se verificaron contra laspy: LAS 1.2 y 1.4, formatos de punto 0, 1, 3, 6, 7 y 8, con y sin sistema de coordenadas, y LAZ escrito por su backend compatible con LASzip: cada punto igual.
- Las coordenadas convertidas se verificaron contra PROJ con 1 mm de precisión.
- Los GeoTIFF exportados se leyeron de nuevo con GDAL: sistema de coordenadas, posiciones de celda, nodata, unidades, y valores iguales a la superficie con una tolerancia de 0.0001.
- Nada de esto se ha abierto en otros programas GIS o CAD.

## Aún no implementado

- Cambios de datum vertical (modelos geoide): las elevaciones se usan tal como vienen en el archivo.
- Datos de forma de onda, retornos LiDAR distintos de la clase, colores e intensidades.
- Varias bandas, vistas generales (overviews) o archivos de más de 200 MB.
- Escribir LAS o LAZ desde una superficie o desde esta herramienta (el complemento [Nubes de puntos](topic:point-clouds) escribe una nube limpia como LAS 1.4 o LAZ).
