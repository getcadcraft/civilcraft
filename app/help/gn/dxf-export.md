---
title: Exportar el plano a DXF
summary: Oñeguarda línea del plano R12 DXF-pe, capas ndive, curvas de nivel elevación-pe ha breaklines 3D-pe, cualquier programa CAD hag̃ua.
keywords: dxf, dwg, cad, exportación, líneas, r12, 2000, 2004, 2007, 2010, 2013, 2018, capas, curvas de nivel, intercambio de dibujo, mapa base, fondo
from: f2d8ede9
---

{{ui:DXF}} oguarda upe ohechaukáva plano-pe DXF archivo R12 formato-pe, upe versión opáva CAD programa opete. Si rembipota AutoCAD térã Civil 3D, ojepe'a térã ojeike DXF archivo-icha ojapo haguéicha.

## Exportar

1. Emoĩ plano upéicha rembipota dibujo-pe: **Visualización** rupi, eleguá superficie (existente térã propuesta), curvas de nivel intervalo ha mbovy oĩva (curvas de nivel, etiquetas, puntos, etiquetas de puntos, triángulos, {{ui:Línea de quiebre}}, borde de superficie, caños, flechas de pendiente).
2. Ejepe'a {{ui:DWG/DXF}} **Exportar** grupo-pe ha eleguá {{ui:DXF (R12, texto) — el archivo de intercambio simple}}, upéi {{ui:Descargar}}.
3. Nave'ẽ ojejapo `<name>.dxf`. Barra de estado ohechauka, por ejemplo, "Exportado R12 DXF: 2,140 objetos; etiquetas dimensionadas para 1" = 40'. Bandas ndojeporúi."

Coordenadas oñemoĩ proyecto unidades-pe, valor real-pe (coordenadas state plane upéicha oĩ). Nada ndojeprocesáí ni ojejoaporãi.

## Qué hay en el archivo

| Elemento | Entidad DXF | Capa |
|---|---|---|
| Curvas de nivel menores y mayores | Polilíneas 2D a su elevación | C-TOPO-MINR, C-TOPO-MAJR |
| Etiquetas de curvas de nivel | Texto | C-TOPO-TEXT |
| Triángulos | Polilíneas | C-TOPO-TINN |
| Líneas de quiebre y límite | Polilíneas 3D | C-TOPO-BRKL |
| Borde de la superficie | Polilíneas | C-TOPO-BNDY |
| Flechas de pendiente | Polilíneas | C-TOPO-SLOP |
| Puntos de relevamiento y sus etiquetas | Puntos (con elevación), texto | V-NODE, V-NODE-TEXT |
| Líneas de códigos de línea | Polilíneas 3D | V-NODE-LINE |
| Ejes de trazado | Líneas y arcos | C-ROAD-CNTR |
| Marcas de estacionado y etiquetas | Polilíneas, texto | C-ROAD-STAN |
| Bordes de corredor | Polilíneas | C-ROAD-CORR |
| Líneas de muestra | Polilíneas | C-ROAD-SCTN |
| Plataformas, líneas de corte y líneas de pendiente | Polilíneas | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Líneas de rasgo | Polilíneas 3D (arcos en piezas dentro de 0.01; ver [Líneas de rasgo](topic:feature-lines)) | C-GRAD-FEAT |
| Trayectorias de giro | Polilíneas, texto | C-ROAD-SWPT |
| Caños, estructuras, etiquetas | Polilíneas, texto | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Caños y estructuras con problemas | Polilíneas | C-STRM-PROB |

Cada capa oĩ color. Lista completa oĩ [Capas del plano](topic:plan-layers) rupi.

## Tamaño de etiqueta

Texto oñeikotevẽ tamaño unidades de dibujo-pe. CivilCraft oñemboguejy etiquetas tamaño escala-pe, upe escala-pe plano entero oike hoja Tabloid (pies) térã hoja A3 (metros)-pe, ha ohechauka mba'e escala barra de estado-pe. Si CAD programa-pe ambue escala-pe ojehai, texto upépe emboguejy.

## Qué no se exporta

- Bandas de elevación (pantalla-pe anane).
- Vista de perfil. Perfiles oguahẽ LandXML-pe, ndaha'éi dibujo-pe.
- Superficie propiamente dicha como objeto 3D. Eleguá LandXML TIN-pe, térã eiporu {{ui:Triángulos}} ha'e bordes línea-pe.
- Mba'e ejapykue **Visualización** rupi.

## DWG

{{ui:DWG/DXF}} oguarda línea upe DWG dibujo-pe avei. Diálogo ohepyxaraha formato: DXF, térã DWG 2000, 2004, 2007, 2010, 2013 térã 2018. 2000 oike opa CAD programa-pe, viejo ha pyahu; eleguá pyahúvéva dibujo oguahẽva oipota-pe. Ndeporu oñemboguejy ko nave'ẽ-pe.

1. Ejepe'a {{ui:DWG}} **Exportar** grupo-pe.
2. Eleguá **Formato** ha ejepe'a **Descargar DWG**.
3. Nave'ẽ ojejapo `<name>.dwg`. Barra de estado ohechauka mba'e oike, por ejemplo "Exportado DWG (formato 2018): 12 polilíneas, 40 etiquetas 9 capa-pe".

DWG-pe oĩ capas, colores, curvas de nivel (polilíneas elevación-pe), breaklines 3D, etiquetas ha puntos upe DXF-ichaicha, coordenadas mboyve. DWG ndoikóiva capa-kuéra téra oñembyai, ha barra de estado ohechauka. CivilCraft oguarda DWG-pe ipropio kódigo rupi, upévare mba'e ndohói ndeprograma-gui.

### Capas de mapa en el DWG

DWG dibujo-pe ndoikóiva imagen ijyvývape: CAD programa-kuéra ohechauka imagen oĩva dibujo-pe ykére. Capas de mapa oĩmbaite, diálogo ohechauka **Capas de mapa como imagen al lado del dibujo**. Ojepe'a upe, descarga ha `.zip` ojejapo, oguahẽ `<name>.dwg`, `<name>-map.png` (capas de mapa dibujo entero, 4,096 píxel ykére peve) ha `<name>-map.pgw` (mundo archivo, GIS programa-kuéra hag̃ua). Dibujo ohechauka imagen G-MAP-IMAG capa-pe, upe lugar-pe. Eikeha archivo-kuéra carpeta peteĩ-pe ha eguarda umi ojupe.
