---
title: Capas del plano
summary: Los nombres de capa fijos, los colores y los grosores de línea que CivilCraft usa en pantalla, en DXF y en PDF, y qué ajuste de visualización controla cada uno.
keywords: capas, nombres de capa, ncs, colores, aci, grosores de línea, capas dxf, pdf, ajustes de visualización, trazado de líneas
from: c2aa8475
---

Todo lo que hay en el plano pertenece a una capa. Los nombres siguen el patrón habitual de capas de civil (disciplina, grupo principal, grupo secundario). Las capas son fijas en esta versión: no puede renombrarlas, cambiar sus colores ni añadir las suyas. En DXF, cada capa tiene el número de color indicado; en PDF con {{ui:Colores de capa}}, se usan los mismos colores, y con {{ui:Negro}} todo se imprime en negro.

| Capa | Contiene | Color (número DXF) | Se muestra cuando |
|---|---|---|---|
| C-TOPO-MINR | Curvas de nivel secundarias | Gris (8) | {{ui:Curvas de nivel}} |
| C-TOPO-MAJR | Curvas de nivel directoras | Blanco o negro (7) | {{ui:Curvas de nivel}} |
| C-TOPO-TEXT | Etiquetas de curvas de nivel | Blanco o negro (7) | {{ui:Curvas de nivel}} y {{ui:Etiquetas de curvas de nivel}} |
| C-TOPO-TINN | Aristas de triángulos | Gris (8) | {{ui:Triángulos}} |
| C-TOPO-BRKL | Líneas de ruptura y el contorno | Naranja (30) | {{ui:Líneas de ruptura}} |
| C-TOPO-BNDY | Borde de superficie | Blanco o negro (7) | {{ui:Borde de superficie}} |
| C-TOPO-SLOP | Flechas de pendiente | Cian (4) | {{ui:Flechas de pendiente}} |
| V-NODE | Puntos topográficos | Verde (3) | {{ui:Puntos}} |
| V-NODE-TEXT | Etiquetas de puntos: número, cota, descripción | Verde (3) | {{ui:Puntos}} y {{ui:Etiquetas de puntos}} |
| V-NODE-LINE | Líneas de los códigos de línea (grupos que no son líneas de ruptura) | Verde (3) | {{ui:Puntos}} |
| C-ROAD-CNTR | Ejes de trazado | Rojo (1) | Siempre |
| C-ROAD-STAN | Marcas de P.K. y etiquetas, PC y PT | Rojo (1) | Siempre |
| C-ROAD-CORR | Bordes de corredor | Amarillo (2) | Siempre |
| C-ROAD-SCTN | Líneas de muestreo (donde se cortan las secciones) | Gris (8) | Cuando el trazado tiene líneas de muestreo |
| C-GRAD-PADS | Contornos de plataformas | Azul (5) | Siempre |
| C-GRAD-DAYL | Líneas de talud | Magenta (6) | Siempre |
| C-GRAD-SLOP | Líneas de pendiente de explanación | Magenta (6) | Siempre |
| C-GRAD-FEAT | Líneas características (3D) | Verde (3) | Siempre |
| C-ROAD-SWPT | Trayectorias de giro: contorno, trayectorias exteriores de las ruedas, nombre | Naranja (30) | Siempre |
| C-STRM-PIPE | Tuberías | Azul (5) | {{ui:Tuberías}} |
| C-STRM-STRC | Estructuras | Azul (5) | {{ui:Tuberías}} |
| C-STRM-TEXT | Etiquetas de tuberías y estructuras | Azul (5) | {{ui:Tuberías}} |
| C-STRM-PROB | Tuberías y estructuras con problemas | Rojo (1) | {{ui:Tuberías}} |

Las líneas de ruptura solo se dibujan mientras **Superficie**, en **Visualización**, sea {{ui:Terreno natural}}; el contorno se dibuja con cualquiera de las dos superficies.

## Grosores de línea en PDF

| Grosor | Capas |
|---|---|
| 0.50 mm | Ejes de trazado, plataformas, tuberías, tuberías con problemas |
| 0.35 mm | Curvas de nivel directoras, líneas de talud, estructuras |
| 0.25 mm | Líneas de ruptura |
| 0.13 mm | Curvas de nivel secundarias |
| 0.09 mm | Aristas de triángulos, líneas de pendiente de explanación |
| 0.18 mm | Todo lo demás |

Los archivos DXF no incluyen grosores de línea; asígnelos por capa en su programa CAD.

## Tamaños de etiqueta

Las etiquetas se dimensionan sobre papel: las de curvas de nivel 2.0 mm, las de P.K. 1.8 mm, las de PC y PT y las de tuberías y estructuras 1.6 mm, y las de puntos 1.5 mm. Las etiquetas de tuberías indican el nombre, el diámetro y la pendiente; las de estructuras, el nombre y la cota del brocal. En pantalla conservan el mismo tamaño al hacer zoom. En DXF se escalan a la escala indicada en el mensaje de exportación; véase [Exportar el plano a DXF](topic:dxf-export).

## No mostrado en ninguna capa

Las bandas de cota se dibujan bajo las líneas solo en pantalla. La vista de perfil no forma parte del plano.
