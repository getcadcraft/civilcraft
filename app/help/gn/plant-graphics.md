---
title: Gráficos de plantas según escala, símbolos propios y plantas en 3D
summary: Cómo se dibujan las plantas en planta a cada escala de dibujo y nivel de detalle, y cómo un registro de planta recibe su propio símbolo (SVG, o un bloque DXF/DWG) y su propio modelo 3D (OBJ, STL o GLB).
keywords: gráficos de plantas, símbolo de planta, símbolo según escala, nivel de detalle, nivel de detalle, círculo simple, contorno, símbolo detallado, símbolo propio, bloque, svg, dxf, dwg, planta 3d, modelo 3d propio, obj, stl, glb, gltf, modelo de árbol, plantas en 3d
from: 875837d9
---

## Símbolos en planta según escala

Paisajismo › {{ui:More}} › {{ui:Plant graphics}} define cómo se dibujan las plantas en planta. **Automático, por escala** elige uno de tres niveles según la escala de dibujo:

- **Círculo simple** (más grueso que 1:500): un círculo del diámetro de copa de la planta.
- **Contorno con centro** (de 1:500 a 1:200): el círculo y una pequeña cruz en el centro.
- **Símbolo detallado** (más fino que 1:200): el símbolo propio del registro si lo tiene, si no el símbolo incorporado.

Cambie las dos escalas con **Simple desde 1:** y **Contorno desde 1:**, o elija un solo nivel para todas las escalas. Cada juego de hojas del diálogo Hojas tiene su propio **Detalle de planta en plano**, así que un plano de sitio 1:500 y un plano de plantación 1:100 pueden ser distintos. La configuración se guarda con el proyecto.

## Su propio símbolo

Seleccione una planta en la sección Plantas y presione {{ui:Own symbol…}}. Lee un SVG, o un bloque de un dibujo DXF o DWG (si el dibujo tiene varios bloques, usted elige uno). El símbolo se ajusta al diámetro de copa de la planta y se dibuja en el nivel detallado. Queda guardado en el proyecto, así que el archivo viaja con él.

- Del SVG se leen las líneas, polilíneas, polígonos, rectángulos, círculos, elipses y trazados. Scripts, estilos, enlaces e imágenes no se leen nunca. Las transformaciones no se aplican: se le avisa cuando el archivo las tiene, así que conviene aplanarlas antes en su programa de dibujo.
- Límites: 512 KB de SVG y 2000 formas. Un archivo mayor se rechaza indicando el motivo.

## Su propia planta en 3D

{{ui:Own 3D model…}} en el mismo registro lee un archivo **OBJ**, **STL** o **GLB**. Después, en Gráficos de plantas, configure **Plantas en 3D** en **Modelo propio de cada registro**: cada planta de ese registro muestra su modelo, escalado a su altura y diámetro de copa. Los registros sin modelo propio mantienen las formas incorporadas. Elija **Masas simples** para vistas rápidas de sitios grandes.

Un GLB se lee solo por su forma:

- Todo lo que el modelo necesita debe estar dentro del archivo .glb. Un modelo que apunta a otros archivos (un .bin aparte, o imágenes por dirección) se rechaza: no se descarga nada.
- La geometría comprimida o empaquetada (Draco, meshopt, posiciones cuantizadas) no se lee. Exporte sin compresión.
- Las texturas y colores del archivo no se usan: el modelo se dibuja con el color propio de la planta. Las texturas igual se revisan, y una textura de más de 4096 píxeles por lado se rechaza.
- Límites: un archivo de 32 MB, 50 000 triángulos (contando cada copia de una pieza colocada más de una vez), 64 imágenes y 16 MB de imágenes.

Cada límite rechaza el archivo indicando el motivo; no se conserva nada leído a medias. Un paso de deshacer quita al registro su símbolo o modelo, y {{ui:Remove own symbol}} o {{ui:Remove own 3D model}} lo quitan de nuevo.

Ver [Registros de plantas](topic:plant-records) para el registro en sí, y [Ver el sitio en 3D](topic:site-3d).
