---
title: Exportar la planta a DXF
summary: Escribe las líneas de la planta como DXF R12 en capas con nombre, con las curvas de nivel a sus elevaciones y las líneas de ruptura en 3D, para cualquier programa CAD.
keywords: dxf, dwg, cad, exportar, líneas de dibujo, r12, 2000, 2004, 2007, 2010, 2013, 2018, capas, curvas de nivel, intercambio de dibujos, mapa base, fondo
from: f2d8ede9
---

{{ui:DXF}} escribe lo que muestra la planta como un archivo DXF en formato R12, la versión que abre cualquier programa CAD. Si ha usado AutoCAD o Civil 3D, ábralo o insértelo igual que cualquier otro DXF.

## Exportar

1. Configure la planta como quiere el dibujo: en **Visualización**, elija la superficie (existente o propuesta), el intervalo de curvas de nivel y qué elementos están activados (curvas de nivel, etiquetas, puntos, etiquetas de puntos, triángulos, líneas de ruptura, borde de la superficie, tuberías, flechas de pendiente).
2. Haga clic en {{ui:DWG/DXF}} en el grupo **Exportar**, elija {{ui:DXF (R12, texto): el archivo de intercambio sencillo}} y después en {{ui:Descargar}}.
3. El navegador descarga `<name>.dxf`. La barra de estado indica, por ejemplo, "Exportado R12 DXF: 2,140 objetos; etiquetas dimensionadas para 1" = 40'. Las bandas no se exportan."

Las coordenadas se escriben en las unidades de su proyecto, con sus valores reales (las coordenadas State Plane se mantienen tal cual). No se escala ni se mueve nada.

## Qué contiene el archivo

| Elemento | Entidad DXF | Capa |
|---|---|---|
| Curvas de nivel menores y mayores | Polilíneas 2D a su elevación | C-TOPO-MINR, C-TOPO-MAJR |
| Etiquetas de curvas de nivel | Texto | C-TOPO-TEXT |
| Triángulos | Polilíneas | C-TOPO-TINN |
| Líneas de ruptura y límite | Polilíneas 3D | C-TOPO-BRKL |
| Borde de la superficie | Polilíneas | C-TOPO-BNDY |
| Flechas de pendiente | Polilíneas | C-TOPO-SLOP |
| Puntos topográficos y sus etiquetas | Puntos (con elevación), texto | V-NODE, V-NODE-TEXT |
| Líneas de códigos de línea | Polilíneas 3D | V-NODE-LINE |
| Ejes de alineación | Líneas y arcos | C-ROAD-CNTR |
| Marcas y etiquetas de cadenamiento | Polilíneas, texto | C-ROAD-STAN |
| Bordes de obra lineal | Polilíneas | C-ROAD-CORR |
| Líneas de muestra | Polilíneas | C-ROAD-SCTN |
| Plataformas, líneas de liga y líneas de pendiente | Polilíneas | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Líneas características | Polilíneas 3D (arcos en tramos dentro de 0.01; vea [Líneas características](topic:feature-lines)) | C-GRAD-FEAT |
| Trayectorias de barrido | Polilíneas, texto | C-ROAD-SWPT |
| Tuberías, estructuras y etiquetas | Polilíneas, texto | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Tuberías y estructuras con problemas | Polilíneas | C-STRM-PROB |

Cada capa tiene un color. La lista completa está en [Capas de la planta](topic:plan-layers).

## Tamaño de las etiquetas

El texto debe tener un tamaño en unidades de dibujo. CivilCraft dimensiona las etiquetas para la escala a la que toda la planta cabe en una hoja Tabloid (pies) o en una hoja A3 (metros), e indica la escala en el mensaje de estado. Si traza a otra escala en su programa CAD, escale el texto allí.

## Lo que no se exporta

- Bandas de elevación (solo en pantalla).
- La vista de perfil. Los perfiles se exportan como LandXML, no como dibujo.
- La superficie misma como objeto 3D. Use LandXML para la TIN, o active {{ui:Triangles}} para obtener sus aristas como líneas.
- Todo lo que desactivó en **Visualización**.

## DWG

{{ui:DWG/DXF}} escribe también las mismas líneas como dibujo DWG. Su cuadro de diálogo pide el formato: DXF, o un DWG de 2000, 2004, 2007, 2010, 2013 o 2018. El formato 2000 abre en casi todos los programas CAD, antiguos y nuevos; elija uno más reciente cuando quien reciba el dibujo se lo pida. Su elección se recuerda en este navegador.

1. Haga clic en {{ui:DWG}} en el grupo **Exportar**.
2. Elija el **Formato** y haga clic en **Descargar DWG**.
3. El navegador descarga `<name>.dwg`. La barra de estado indica lo que se incluyó, por ejemplo "Exportado DWG (formato 2018): 12 polilíneas, 40 etiquetas en 9 capas".

El DWG tiene las mismas capas, colores, curvas de nivel (como polilíneas a su elevación), líneas de ruptura 3D, etiquetas y puntos que el DXF, en las mismas coordenadas. Los nombres de capa que un DWG no admite se cambian, y el mensaje de estado lo indica. CivilCraft escribe el DWG con su propio código, así que nada sale de su computadora.

### Capas de mapa en el DWG

Un DWG no puede contener una imagen dentro de sí: los programas CAD muestran una imagen que queda junto al dibujo. Cuando las capas de mapa están visibles, el cuadro de diálogo ofrece **Capas de mapa como imagen junto al dibujo**. Con esa casilla marcada, la descarga es un `.zip` que contiene `<name>.dwg`, `<name>-map.png` (las capas de mapa sobre todo el dibujo, de hasta 4,096 píxeles de ancho) y `<name>-map.pgw` (su archivo de georreferencia, para programas GIS). El dibujo muestra la imagen como una imagen en la capa G-MAP-IMAG, en su lugar. Descomprima los archivos en una misma carpeta y manténgalos juntos.
