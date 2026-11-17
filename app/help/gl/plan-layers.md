---
title: Capas da planta
summary: Os nomes fixos das capas, as cores e os grosores de liña que CivilCraft usa na pantalla, no DXF e no PDF, e a configuración de visualización que controla cada unha.
keywords: capas, nomes de capas, ncs, cores, aci, grosores de liña, capas dxf, pdf, configuración de visualización, liñas
from: c2aa8475
---

Todo o que hai na planta pertence a unha capa. Os nomes seguen o patrón habitual das capas civís (disciplina, grupo principal, grupo secundario). As capas son fixas nesta versión: non se poden renomear, cambiar as cores nin engadir capas propias. En DXF, cada capa ten o número de cor indicado; en PDF con {{ui:Layer colors}}, úsanse as mesmas cores, e con {{ui:Black}} todo se imprime en negro.

| Capa | Contén | Cor (número DXF) | Móstrase cando |
|---|---|---|---|
| C-TOPO-MINR | Curvas de nivel secundarias | Gris (8) | {{ui:Contours}} |
| C-TOPO-MAJR | Curvas de nivel principais | Branco ou negro (7) | {{ui:Contours}} |
| C-TOPO-TEXT | Etiquetas de curvas de nivel | Branco ou negro (7) | {{ui:Contours}} e {{ui:Contour labels}} |
| C-TOPO-TINN | Arestas dos triángulos | Gris (8) | {{ui:Triangles}} |
| C-TOPO-BRKL | Liñas de quebra e o límite | Laranxa (30) | {{ui:Breaklines}} |
| C-TOPO-BNDY | Bordo da superficie | Branco ou negro (7) | {{ui:Surface edge}} |
| C-TOPO-SLOP | Frechas de pendente | Ciano (4) | {{ui:Slope arrows}} |
| V-NODE | Puntos de levantamento | Verde (3) | {{ui:Points}} |
| V-NODE-TEXT | Etiquetas de puntos: número, cota, descrición | Verde (3) | {{ui:Points}} e {{ui:Point labels}} |
| V-NODE-LINE | Liñas dos códigos de liña (grupos que non son liñas de quebra) | Verde (3) | {{ui:Points}} |
| C-ROAD-CNTR | Eixos do trazado | Vermello (1) | Sempre |
| C-ROAD-STAN | Marcas e etiquetas de estacións, PC e PT | Vermello (1) | Sempre |
| C-ROAD-CORR | Bordos de corredores | Amarelo (2) | Sempre |
| C-ROAD-SCTN | Liñas de mostraxe (onde se cortan as seccións) | Gris (8) | Cando o trazado ten liñas de mostraxe |
| C-GRAD-PADS | Contornos de plataformas | Azul (5) | Sempre |
| C-GRAD-DAYL | Liñas de cerre | Maxenta (6) | Sempre |
| C-GRAD-SLOP | Liñas de pendente do movemento de terras | Maxenta (6) | Sempre |
| C-GRAD-FEAT | Liñas características (3D) | Verde (3) | Sempre |
| C-ROAD-SWPT | Percorridos de xiro: contorno, rodas exteriores e nome | Laranxa (30) | Sempre |
| C-STRM-PIPE | Tubaxes | Azul (5) | {{ui:Pipes}} |
| C-STRM-STRC | Estruturas | Azul (5) | {{ui:Pipes}} |
| C-STRM-TEXT | Etiquetas de tubaxes e estruturas | Azul (5) | {{ui:Pipes}} |
| C-STRM-PROB | Tubaxes e estruturas con problemas | Vermello (1) | {{ui:Pipes}} |

As liñas de quebra só se debuxan mentres **Superficie** en **Visualización** estea en {{ui:Existing ground}}; o límite debúxase con calquera das dúas superficies.

## Grosores de liña en PDF

| Grosor | Capas |
|---|---|
| 0.50 mm | Eixos do trazado, plataformas, tubaxes, tubaxes con problemas |
| 0.35 mm | Curvas de nivel principais, liñas de cerre, estruturas |
| 0.25 mm | Liñas de quebra |
| 0.13 mm | Curvas de nivel secundarias |
| 0.09 mm | Arestas dos triángulos, liñas de pendente do movemento de terras |
| 0.18 mm | Todo o demais |

Os ficheiros DXF non levan grosores de liña; defínaos por capa no programa CAD.

## Tamaños das etiquetas

As etiquetas dimensiónanse no papel: etiquetas de curvas de nivel 2.0 mm, etiquetas de estacións 1.8 mm, etiquetas de PC e PT e de tubaxes e estruturas 1.6 mm, etiquetas de puntos 1.5 mm. As etiquetas de tubaxes indican o nome, o diámetro e a pendente; as de estruturas, o nome e a cota do bordo. Na pantalla mantéñen o mesmo tamaño ao facer zoom. En DXF escálanse para a escala indicada na mensaxe de exportación; ver [Exportar a planta a DXF](topic:dxf-export).

## Non se mostra en ningunha capa

As bandas de elevación debúxanse baixo as liñas só na pantalla. A vista de perfil non forma parte da planta.
