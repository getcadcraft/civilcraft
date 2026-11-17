---
title: Gráficos de plantas por escala, símbolos propios y plantas en 3D
summary: Cómo se dibujan las plantas en planta a cada escala de dibujo y nivel de detalle, y cómo un registro de planta recibe su propio símbolo (SVG, o un bloque DXF/DWG) y su propio modelo 3D (OBJ, STL o GLB).
keywords: gráficos de plantas, símbolo de planta, símbolo por escala, nivel de detalle, círculo simple, contorno, símbolo detallado, símbolo propio, bloque, svg, dxf, dwg, planta en 3D, modelo 3D propio, obj, stl, glb, gltf, modelo de árbol, plantas en 3D
from: 875837d9
---

## Símbolos en planta por escala

Paisajismo › {{ui:Más}} › {{ui:Gráficos de plantas}} define cómo se dibujan las plantas en planta. **Automático, por escala** elige uno de tres niveles según la escala del dibujo:

- **Círculo simple** (más grueso que 1:500): un círculo con la extensión de la planta.
- **Contorno con centro** (de 1:500 a 1:200): el círculo y una pequeña cruz central.
- **Símbolo detallado** (más fino que 1:200): el símbolo propio del registro si lo tiene; si no, el símbolo integrado.

Cambie las dos escalas con **Simple desde 1:** y **Contorno desde 1:**, o elija un solo nivel para todas las escalas. Cada juego de hojas del cuadro Hojas tiene su propio **Detalle de plantas en planta**, así que un plano de sitio a 1:500 y un plano de plantación a 1:100 pueden diferir. La configuración se guarda con el proyecto.

## Su propio símbolo

Elija una planta en la sección Plantas y pulse {{ui:Símbolo propio…}}. Lee un SVG, o un bloque de un dibujo DXF o DWG (si el dibujo tiene varios bloques, usted elige uno). El símbolo se ajusta a la extensión de la planta y se dibuja en el nivel detallado. Se guarda en el proyecto, así que el archivo viaja con él.

- Un SVG se lee por sus líneas, polilíneas, polígonos, rectángulos, círculos, elipses y trayectorias. Los scripts, estilos, enlaces e imágenes que contenga nunca se revisan. No se aplican transformaciones: se le avisa cuando el archivo las tiene, así que conviértalas antes en su programa de dibujo.
- Límites: 512 KB de SVG y 2000 formas. Un archivo mayor se rechaza y se indica el motivo.

## Su propia planta en 3D

{{ui:Modelo 3D propio…}} en el mismo registro lee un archivo **OBJ**, **STL** o **GLB**. Luego, en Gráficos de plantas, configure **Plantas en 3D** en **Modelo propio de cada registro**: cada planta de ese registro muestra su modelo, escalado a su altura y extensión. Los registros sin modelo propio conservan las formas integradas. Elija **Masas simples** para vistas rápidas de sitios grandes.

Un GLB se lee solo por su forma:

- Todo lo que necesita el modelo debe estar dentro del archivo .glb. Un modelo que apunte a otros archivos (un .bin separado, o imágenes por dirección) se rechaza: no se descarga nada.
- La geometría comprimida o empaquetada (Draco, meshopt, posiciones cuantizadas) no se lee. Exporte sin compresión.
- Las texturas y los colores del archivo no se usan: el modelo se dibuja con el color propio de la planta. Las texturas igual se revisan, y una textura de más de 4096 píxeles por lado se rechaza.
- Límites: un archivo de 32 MB, 50 000 triángulos (contando cada copia de una pieza colocada más de una vez), 64 imágenes y 16 MB de imágenes.

Cada límite rechaza el archivo con el motivo; no se conserva nada leído a medias. Un paso de deshacer asigna al registro su símbolo o modelo, y {{ui:Quitar símbolo propio}} o {{ui:Quitar modelo 3D propio}} lo elimina de nuevo.

Consulte [Registros de plantas](topic:plant-records) para el registro en sí, y [Ver el sitio en 3D](topic:site-3d).
