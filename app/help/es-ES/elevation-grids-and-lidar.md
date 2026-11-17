---
title: Mallas de cotas y LiDAR
summary: Cree el terreno existente a partir de un DEM (GeoTIFF o malla ASCII) o de puntos LiDAR (LAS, LAZ): elija la zona, reduzca los datos, elija las clases y compruebe las unidades de cota, y devuelva una superficie como malla de cotas GeoTIFF.
keywords: dem, dtm, malla de cotas, geotiff, tif, malla ascii, asc, lidar, las, laz, nube de puntos, clases, terreno, reducción, sin datos, ráster, exportar geotiff, gis
from: c8b2d18a
---

Los datos públicos de elevación llegan de dos formas: **mallas de cotas** (un DEM: una cota por celda cuadrada, normalmente un GeoTIFF `.tif` o una malla ASCII `.asc`) y **puntos LiDAR** (millones de retornos láser en un archivo `.las`, o `.laz` si está comprimido). CivilCraft convierte cualquiera de ellos en puntos topográficos o en una superficie, dentro del navegador: no se sube nada.

## Abrir el archivo

1. Haga clic en {{ui:Abrir}} (o en {{ui:Importar}} del grupo GIS) y elija el archivo, o arrástrelo a la planta. Para una malla ASCII, elija también su archivo `.prj`, para que CivilCraft conozca su sistema de coordenadas.
2. El diálogo de importación muestra lo que el archivo indica sobre sí mismo: su tamaño, celdas o puntos, su sistema de coordenadas, dónde está en latitud y longitud, y su rango de cotas. En LiDAR, primero lee cada punto una vez para contar las **clases** (una barra de progreso indica el avance; {{ui:Cancelar}} lo detiene).

Un GeoTIFF con tres o cuatro bandas (rojo, verde, azul) es una imagen, no cotas: va a las capas de mapa.

## Elegir qué se importa

- **Zona**: {{ui:La extensión del proyecto y un margen}} (escriba el margen), {{ui:Lo que muestra la planta ahora}} o {{ui:Todo el archivo}}. Solo se lee esa parte del archivo.
- **Reducir a**: la separación entre los puntos que obtendrá, en las unidades del proyecto. La línea bajo la configuración indica cuántos puntos resultan al escribir. En una malla, CivilCraft conserva cada segunda, tercera… celda, de modo que las cotas siguen siendo exactamente las del archivo; nunca promedia celdas entre sí. En LiDAR, la zona se divide en cuadrados de ese tamaño y se conserva un punto por cuadrado: {{ui:El punto más cercano al centro de cada celda}} (el predeterminado), {{ui:El punto más bajo de cada celda}} (útil cuando el archivo no tiene clase de terreno: el suelo está bajo los árboles) o {{ui:El promedio de los puntos de cada celda}}.
- **Clases** (LiDAR): la clase de terreno (clase 2) se marca cuando el archivo la tiene; edificios, árboles y ruido se excluyen. Cuando no hay clase de terreno, se marcan todas las clases, y el diálogo lo indica.
- **Terreno** (LiDAR, 0.8): una nube de dron no tiene clase de terreno. Cuando el archivo no la tiene, el diálogo empieza en {{ui:Encontrar yo mismo el terreno (nubes de dron, sin clase de terreno)}}: se leen todas las clases salvo el ruido, se conserva el punto más bajo de cada celda y, después, CivilCraft quita edificios, árboles y puntos bajos aislados con un filtro morfológico progresivo (Zhang y otros, 2003) que usted puede ajustar: **Objeto más grande a eliminar** (el ancho del edificio más grande; las ventanas crecen hasta cubrirlo; 0 significa 20 celdas) y **Pendiente máxima del terreno**. El trabajo se hace sobre la malla de puntos más bajos, de modo que una nube de decenas de millones de puntos no cuesta más que su número de celdas (la reducción es una sola pasada en flujo continuo). La separación es la celda: una más gruesa es más rápida y pierde objetos pequeños menos de lo que cabría esperar; una más fina conserva más detalle del terreno. El informe indica cuántos puntos se conservaron como terreno, cuántas celdas se eliminaron como objetos y cuántos puntos bajos aislados se descartaron. En un vuelo de dron simulado de 300 m con cinco edificios, 70 árboles y 200 valores atípicos bajos, los puntos conservados estuvieron a 3 cm del terreno real y no se conservó ningún tejado ni copa.
- **Unidades de cota en el archivo**: metros, pies o pies topográficos de EE. UU. Cuando el archivo lo indica, su unidad ya está elegida. Cuando no lo indica, debe elegirla: el diálogo muestra el rango de cotas en ambas unidades para que pueda ver cuál tiene sentido para el emplazamiento.
- **Importar como** (solo mallas): {{ui:Puntos topográficos (descripción DEM)}} o {{ui:La superficie misma (una retícula de triángulos)}}.

Una importación admite como máximo 500,000 puntos. Cuando una elección daría más, el diálogo indica en cuánto y qué separación cabría, y {{ui:Importar}} queda desactivado.

Haga clic en {{ui:Importar}}. Una barra de progreso muestra la lectura; {{ui:Cancelar}} la detiene y nada cambia.

:::warning
Las unidades verticales son una trampa habitual. Muchos DEM en sistema State Plane tienen las coordenadas este y norte en pies, pero las cotas en metros. Compare el rango que muestra el diálogo con lo que conoce del emplazamiento.
:::

## Qué obtiene

- **Puntos topográficos**: numerados a partir de su número de punto más alto, con la descripción `DEM` (mallas) o `LIDAR`, de modo que forman un solo grupo de puntos en **Puntos** y construyen la superficie como cualquier otro punto. Importarlos es un solo paso: {{key:Mod+Z}} los quita de nuevo.
- **La superficie misma**: una TIN de malla, dos triángulos por celda, dividida por la diagonal suroeste-noreste. Un triángulo con un vértice sin datos se omite, de modo que los huecos de los datos siguen siendo huecos. La superficie coincide con la malla en cada punto de la malla y es un plano liso dentro de cada triángulo entre ellos. Reemplaza la superficie del proyecto (el diálogo lo pregunta antes); {{key:Mod+Z}} restaura la superficie anterior. El encabezado del panel izquierdo indica **Superficie (a partir de una malla de cotas)**.

## Sistemas de coordenadas

- Si el proyecto tiene sistema de coordenadas y el archivo indica otro, cada punto se convierte al sistema del proyecto (y a sus coordenadas de terreno o locales, cuando las tenga).
- Si el proyecto no tiene ninguno y el sistema del archivo está en las unidades del proyecto (pies o metros), el diálogo ofrece convertirlo en el sistema de coordenadas del proyecto, en el mismo paso de deshacer que los puntos.
- Si el archivo está en latitud y longitud, o en metros para un proyecto en pies, el diálogo le pide que primero elija el sistema de coordenadas del proyecto.
- Si el archivo no lo indica, sus números se toman como coordenadas del proyecto. Puede elegir en su lugar el sistema del archivo.

## Exportar una superficie como GeoTIFF

1. Haga clic en {{ui:Exportar}} del grupo GIS.
2. En la parte GeoTIFF, elija la superficie (terreno existente o superficie de diseño) y el tamaño de celda. El valor predeterminado sale de la arista media de los triángulos de la superficie. El diálogo muestra el tamaño de la malla que escribirá.
3. Haga clic en {{ui:Descargar GeoTIFF}}.

El archivo es una banda de cotas en coma flotante de 32 bits, en las unidades del proyecto, sobre la extensión de la superficie; las celdas fuera de la superficie son "sin datos" (−3.4028235e38). El valor de cada celda es la cota de la superficie en el centro de la celda. Las coordenadas son **de malla**: un proyecto en coordenadas de terreno o locales se convierte de nuevo a malla. El archivo indica el sistema de coordenadas del proyecto mediante su código EPSG; un sistema sin código EPSG no se escribe, y el diálogo le advierte que informe al departamento GIS de qué sistema se trata.

## Qué se ha comprobado

- Los lectores de GeoTIFF y de malla ASCII se comprobaron con GDAL (a través de rasterio), la biblioteca que usan la mayoría de programas GIS para leer estos archivos: mallas de 32 bits en coma flotante y de 16 bits enteras, en mosaico y en tiras, DEFLATE y LZW, sin datos, escala y desplazamiento, píxel como punto, una malla UTM, una malla State Plane en pies topográficos de EE. UU. y una malla de latitud y longitud: todos los valores coinciden.
- Los lectores LAS y LAZ se comprobaron con laspy: LAS 1.2 y 1.4, formatos de punto 0, 1, 3, 6, 7 y 8, con y sin sistema de coordenadas, y LAZ escrito por su backend compatible con LASzip: todos los puntos coinciden.
- Las coordenadas convertidas se comprobaron con PROJ con una precisión de 1 mm.
- Los GeoTIFF exportados se leyeron de nuevo con GDAL: sistema de coordenadas, posiciones de celda, sin datos, unidades, y valores iguales a la superficie con una precisión de 0.0001.
- Nada de esto se ha abierto en otros programas GIS o CAD.

## Pendiente de desarrollo

- Cambios de datum vertical (modelos de geoide): las cotas se usan tal como las tiene el archivo.
- Datos de forma de onda, retornos LiDAR distintos de la clase, colores e intensidades.
- Varias bandas, pirámides de visualización o archivos de más de 200 MB.
- Escribir LAS o LAZ desde una superficie o desde esta herramienta (el complemento [Nubes de puntos](topic:point-clouds) escribe una nube limpia como LAS 1.4 o LAZ).
