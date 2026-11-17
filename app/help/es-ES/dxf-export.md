---
title: Exportar la planta a DXF
summary: Escribe el trazado de la planta como DXF R12 en capas con nombre, con curvas de nivel a sus cotas y líneas de ruptura en 3D, para cualquier programa CAD.
keywords: dxf, dwg, cad, exportar, trazado, r12, 2000, 2004, 2007, 2010, 2013, 2018, capas, curvas de nivel, intercambio de dibujos, mapa base, fondo
from: f2d8ede9
---

{{ui:DXF}} escribe lo que muestra la planta como un archivo DXF en formato R12, la versión que abre cualquier programa CAD. Si ha usado AutoCAD o Civil 3D, ábralo o insértelo como haría con cualquier DXF.

## Exportar

1. Prepare la planta como desee el dibujo: en **Visualización**, elija la superficie (existente o propuesta), el intervalo de curvas de nivel y qué elementos están activos (curvas de nivel, etiquetas, puntos, etiquetas de puntos, triángulos, líneas de ruptura, borde de superficie, tuberías, flechas de pendiente).
2. Haga clic en {{ui:DWG/DXF}} del grupo **Exportar**, elija {{ui:DXF (R12, texto) — el archivo de intercambio sencillo}} y después {{ui:Descargar}}.
3. El navegador descarga `<nombre>.dxf`. La barra de estado indica, por ejemplo, "Exportado DXF R12: 2,140 objetos; etiquetas dimensionadas para 1" = 40'. Las bandas no se exportan."

Las coordenadas se escriben en las unidades del proyecto, con sus valores reales (las coordenadas State Plane se mantienen tal cual). No se escala ni se mueve nada.

## Contenido del archivo

| Elemento | Entidad DXF | Capa |
|---|---|---|
| Curvas de nivel menores y mayores | Polilíneas 2D a su cota | C-TOPO-MINR, C-TOPO-MAJR |
| Etiquetas de curvas de nivel | Texto | C-TOPO-TEXT |
| Triángulos | Polilíneas | C-TOPO-TINN |
| Líneas de ruptura y límite | Polilíneas 3D | C-TOPO-BRKL |
| Borde de superficie | Polilíneas | C-TOPO-BNDY |
| Flechas de pendiente | Polilíneas | C-TOPO-SLOP |
| Puntos topográficos y sus etiquetas | Puntos (con cota), texto | V-NODE, V-NODE-TEXT |
| Líneas de códigos de línea | Polilíneas 3D | V-NODE-LINE |
| Ejes de trazado | Líneas y arcos | C-ROAD-CNTR |
| Marcas de P.K. y etiquetas | Polilíneas, texto | C-ROAD-STAN |
| Bordes de corredor | Polilíneas | C-ROAD-CORR |
| Líneas de sección | Polilíneas | C-ROAD-SCTN |
| Plataformas, líneas de talud y líneas de pendiente | Polilíneas | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Líneas características | Polilíneas 3D (los arcos en tramos dentro de 0.01; véase [Líneas características](topic:feature-lines)) | C-GRAD-FEAT |
| Trayectorias de giro | Polilíneas, texto | C-ROAD-SWPT |
| Tuberías, estructuras y etiquetas | Polilíneas, texto | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Tuberías y estructuras con problemas | Polilíneas | C-STRM-PROB |

Cada capa tiene un color. La lista completa está en [Capas de la planta](topic:plan-layers).

## Tamaño de las etiquetas

El texto necesita un tamaño en unidades de dibujo. CivilCraft dimensiona las etiquetas a la escala a la que toda la planta cabe en una hoja Tabloid (pies) o en una hoja A3 (metros), e indica en el mensaje de estado qué escala se ha usado. Si imprime a otra escala en su programa CAD, escale el texto allí.

## Lo que no se exporta

- Bandas de cotas (solo en pantalla).
- La vista de perfil. Los perfiles se exportan como LandXML, no como dibujo.
- La superficie en sí como objeto 3D. Utilice LandXML para la TIN, o active {{ui:Triangles}} para obtener sus aristas como trazado.
- Cualquier elemento que haya desactivado en **Visualización**.

## DWG

{{ui:DWG/DXF}} escribe el mismo trazado también como dibujo DWG. Su diálogo pide el formato: DXF, o un DWG de 2000, 2004, 2007, 2010, 2013 o 2018. 2000 se abre en casi todos los programas CAD, antiguos y nuevos; elija uno más reciente cuando lo pida quien reciba el dibujo. Su elección se recuerda en este navegador.

1. Haga clic en {{ui:DWG}} del grupo **Exportar**.
2. Elija el **Formato** y haga clic en **Descargar DWG**.
3. El navegador descarga `<nombre>.dwg`. La barra de estado indica lo que se incluyó, por ejemplo "Exportado DWG (formato 2018): 12 polilíneas, 40 etiquetas en 9 capas".

El DWG tiene las mismas capas, colores, curvas de nivel (como polilíneas a su cota), líneas de ruptura 3D, etiquetas y puntos que el DXF, en las mismas coordenadas. Los nombres de capa que un DWG no admite se cambian, y el mensaje de estado lo indica. CivilCraft escribe el DWG con su propio código, así que nada sale de su equipo.

### Capas de mapa en el DWG

Un dibujo DWG no puede contener una imagen dentro de sí: los programas CAD muestran una imagen que queda junto al dibujo. Cuando las capas de mapa están visibles, el diálogo ofrece **Capas de mapa como imagen junto al dibujo**. Con esa casilla marcada, la descarga es un `.zip` que contiene `<nombre>.dwg`, `<nombre>-map.png` (las capas de mapa sobre todo el dibujo, hasta 4,096 píxeles de ancho) y `<nombre>-map.pgw` (su archivo de mundo, para programas GIS). El dibujo muestra la imagen como una imagen en la capa G-MAP-IMAG, en su sitio. Descomprima los archivos en una sola carpeta y manténgalos juntos.
