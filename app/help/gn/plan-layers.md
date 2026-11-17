---
title: Capas del plano
summary: Los nombres fijos de capa, colores y grosores de línea que CivilCraft usa en pantalla, en DXF y en PDF, y qué configuración de visualización controla cada uno.
keywords: capas, nombres de capa, ncs, colores, aci, grosores de línea, capas dxf, pdf, configuración de visualización, trazos
from: c2aa8475
---

Opa mba'e plano-pe oñeikotevẽ peteĩ capa-pe. Umi nombre oñemboguata ko "common civil layer pattern" rehe (disciplina, grupo mayor, grupo menor). Ko versión-pe umi capa oñemopyenda fijo: ndaikatúi reñemoĩ otro nombre, reñemoambue hoʼa térã reñemoaʼe hetaiterei. DXF-pe, capa-pe oguereko número de color ohechaukava; PDF-pe {{ui:Layer colors}} reipuru jave, umi mismo colores oñeipuru, ha {{ui:Black}} reipuru jave, opa mba'e ojeprinta negro.

| Capa | Ohasa | Color (número DXF) | Ohechauka jave |
|---|---|---|---|
| C-TOPO-MINR | Curvas de nivel menores | Gris (8) | {{ui:Contours}} |
| C-TOPO-MAJR | Curvas de nivel mayores | Blanco o negro (7) | {{ui:Contours}} |
| C-TOPO-TEXT | Rótulos de curvas de nivel | Blanco o negro (7) | {{ui:Contours}} ha {{ui:Contour labels}} |
| C-TOPO-TINN | Bordes de triángulos | Gris (8) | {{ui:Triangles}} |
| C-TOPO-BRKL | Líneas de quiebre ha límite | Naranja (30) | {{ui:Breaklines}} |
| C-TOPO-BNDY | Borde de la superficie | Blanco o negro (7) | {{ui:Surface edge}} |
| C-TOPO-SLOP | Flechas de pendiente | Cian (4) | {{ui:Slope arrows}} |
| V-NODE | Puntos de relevamiento | Verde (3) | {{ui:Points}} |
| V-NODE-TEXT | Rótulos de puntos: número, elevación, descripción | Verde (3) | {{ui:Points}} ha {{ui:Point labels}} |
| V-NODE-LINE | Líneas de códigos de línea (grupos que no son líneas de quiebre) | Verde (3) | {{ui:Points}} |
| C-ROAD-CNTR | Ejes de trazado | Rojo (1) | Opa mo'ã |
| C-ROAD-STAN | Marcas de estación y rótulos, PC y PT | Rojo (1) | Opa mo'ã |
| C-ROAD-CORR | Bordes de corredor | Amarillo (2) | Opa mo'ã |
| C-ROAD-SCTN | Líneas de muestra (donde se cortan las secciones) | Gris (8) | Trazado-pe oguereko líneas de muestra jave |
| C-GRAD-PADS | Contornos de plataformas | Azul (5) | Opa mo'ã |
| C-GRAD-DAYL | Líneas de corte (daylight) | Magenta (6) | Opa mo'ã |
| C-GRAD-SLOP | Líneas de pendiente de movimiento de suelo | Magenta (6) | Opa mo'ã |
| C-GRAD-FEAT | Líneas de rasgo (3D) | Verde (3) | Opa mo'ã |
| C-ROAD-SWPT | Trayectorias de giro: contorno, huellas exteriores de rueda, nombre | Naranja (30) | Opa mo'ã |
| C-STRM-PIPE | Caños | Azul (5) | {{ui:Pipes}} |
| C-STRM-STRC | Estructuras | Azul (5) | {{ui:Pipes}} |
| C-STRM-TEXT | Rótulos de caños y estructuras | Azul (5) | {{ui:Pipes}} |
| C-STRM-PROB | Caños y estructuras con problemas | Rojo (1) | {{ui:Pipes}} |

Las líneas de quiebre se dibujan solo mientras **Superficie** en **Visualización** esté en {{ui:Existing ground}}; el límite se dibuja con cualquiera de las dos superficies.

## Grosores de línea en PDF

| Grosor | Capas |
|---|---|
| 0.50 mm | Ejes de trazado, plataformas, caños, caños con problemas |
| 0.35 mm | Curvas de nivel mayores, líneas de corte, estructuras |
| 0.25 mm | Líneas de quiebre |
| 0.13 mm | Curvas de nivel menores |
| 0.09 mm | Bordes de triángulos, líneas de pendiente de movimiento de suelo |
| 0.18 mm | Todo lo demás |

Los archivos DXF no llevan grosores de línea; configúrelos por capa en su programa CAD.

## Tamaños de etiqueta

Las etiquetas tienen tamaño sobre papel: rótulos de curvas de nivel 2.0 mm, rótulos de estación 1.8 mm, rótulos de PC y PT y de caños y estructuras 1.6 mm, rótulos de puntos 1.5 mm. Los rótulos de caño muestran nombre, diámetro y pendiente; los de estructura, nombre y borde superior. En pantalla mantienen el mismo tamaño al hacer zoom. En DXF se escalan a la escala indicada en el mensaje de exportación; ver [Exportar el plano a DXF](topic:dxf-export).

## No se muestra en ninguna capa

Las bandas de elevación se dibujan debajo de las líneas solo en pantalla. La vista de perfil no forma parte del plano.
