---
title: Capas del plano
summary: Los nombres de capa, colores y grosores de línea fijos que CivilCraft usa en pantalla, en DXF y en PDF, y qué configuración de visualización controla cada uno.
keywords: capas, nombres de capa, ncs, colores, aci, grosores de línea, capas dxf, pdf, configuración de visualización, trazos
from: c2aa8475
---

Todo lo que contiene el plano pertenece a una capa. Los nombres siguen el patrón habitual de capas civiles (disciplina, grupo principal, grupo secundario). Las capas son fijas en esta versión: no puede cambiarles el nombre, cambiar sus colores ni agregar capas propias. En DXF, cada capa tiene el número de color que se muestra; en PDF con {{ui:Colores de capa}}, se usan los mismos colores, y con {{ui:Negro}} todo se imprime en negro.

| Capa | Contiene | Color (número DXF) | Se muestra cuando |
|---|---|---|---|
| C-TOPO-MINR | Curvas de nivel secundarias | Gris (8) | {{ui:Curvas de nivel}} |
| C-TOPO-MAJR | Curvas de nivel principales | Blanco o negro (7) | {{ui:Curvas de nivel}} |
| C-TOPO-TEXT | Etiquetas de curvas de nivel | Blanco o negro (7) | {{ui:Curvas de nivel}} y {{ui:Etiquetas de curvas de nivel}} |
| C-TOPO-TINN | Aristas de triángulos | Gris (8) | {{ui:Triángulos}} |
| C-TOPO-BRKL | Líneas de ruptura y el límite | Naranja (30) | {{ui:Líneas de ruptura}} |
| C-TOPO-BNDY | Borde de superficie | Blanco o negro (7) | {{ui:Borde de superficie}} |
| C-TOPO-SLOP | Flechas de pendiente | Cian (4) | {{ui:Flechas de pendiente}} |
| V-NODE | Puntos topográficos | Verde (3) | {{ui:Puntos}} |
| V-NODE-TEXT | Etiquetas de puntos: número, elevación, descripción | Verde (3) | {{ui:Puntos}} y {{ui:Etiquetas de puntos}} |
| V-NODE-LINE | Líneas de códigos de línea (grupos que no son líneas de ruptura) | Verde (3) | {{ui:Puntos}} |
| C-ROAD-CNTR | Ejes de alineación | Rojo (1) | Siempre |
| C-ROAD-STAN | Marcas y etiquetas de estación, PC y PT | Rojo (1) | Siempre |
| C-ROAD-CORR | Bordes de obra lineal | Amarillo (2) | Siempre |
| C-ROAD-SCTN | Líneas de muestreo (donde se cortan las secciones) | Gris (8) | Cuando la alineación tiene líneas de muestreo |
| C-GRAD-PADS | Contornos de plataforma | Azul (5) | Siempre |
| C-GRAD-DAYL | Líneas de talud | Magenta (6) | Siempre |
| C-GRAD-SLOP | Líneas de pendiente de nivelación | Magenta (6) | Siempre |
| C-GRAD-FEAT | Líneas características (3D) | Verde (3) | Siempre |
| C-ROAD-SWPT | Trayectorias de giro: contorno, trayectorias de las ruedas exteriores, nombre | Naranja (30) | Siempre |
| C-STRM-PIPE | Tuberías | Azul (5) | {{ui:Tuberías}} |
| C-STRM-STRC | Estructuras | Azul (5) | {{ui:Tuberías}} |
| C-STRM-TEXT | Etiquetas de tuberías y estructuras | Azul (5) | {{ui:Tuberías}} |
| C-STRM-PROB | Tuberías y estructuras con problemas | Rojo (1) | {{ui:Tuberías}} |

Las líneas de ruptura solo se dibujan mientras **Superficie** en **Visualización** esté en {{ui:Terreno natural}}; el límite se dibuja con cualquiera de las dos superficies.

## Grosores de línea en PDF

| Grosor | Capas |
|---|---|
| 0.50 mm | Ejes de alineación, plataformas, tuberías, tuberías con problemas |
| 0.35 mm | Curvas de nivel principales, líneas de talud, estructuras |
| 0.25 mm | Líneas de ruptura |
| 0.13 mm | Curvas de nivel secundarias |
| 0.09 mm | Aristas de triángulos, líneas de pendiente de nivelación |
| 0.18 mm | Todo lo demás |

Los archivos DXF no contienen grosores de línea; asígnelos por capa en su programa CAD.

## Tamaños de etiqueta

Las etiquetas se dimensionan en papel: las etiquetas de curvas de nivel miden 2.0 mm, las de estación 1.8 mm, las de PC y PT y las de tuberías y estructuras 1.6 mm, y las de puntos 1.5 mm. Las etiquetas de tubería muestran el nombre, el diámetro y la pendiente; las de estructura, el nombre y el brocal. En pantalla mantienen el mismo tamaño al hacer zoom. En DXF se escalan para la escala indicada en el mensaje de exportación; consulte [Exportar el plano a DXF](topic:dxf-export).

## No mostrado en ninguna capa

Las bandas de elevación se dibujan debajo de las líneas solo en pantalla. La vista de perfil no forma parte del plano.
