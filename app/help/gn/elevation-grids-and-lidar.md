---
title: Grillas de elevación y LiDAR
summary: Ojapo terreno existente DEM (GeoTIFF térã ASCII grilla) térã LiDAR puntos (LAS, LAZ) gui — eleguá área, eikyhy datos, eleguá clases ha eikuaa elevación unidades — ha eguahẽ superficie GeoTIFF elevación grilla-pe.
keywords: dem, dtm, grilla de elevación, geotiff, tif, ascii grid, asc, lidar, las, laz, nube de puntos, clases, terreno, adelgazamiento, nodata, raster, exportar geotiff, gis
from: c8b2d18a
---

Datos públicos de elevación oguahẽ mokõi tape-pe: **grillas de elevación** (DEM: peteĩ elevación celda cuadrada-pe, ordinariamente GeoTIFF `.tif` térã ASCII grilla `.asc`) ha **puntos LiDAR** (millónes de retornos láser `.las` archivo-pe, térã `.laz` ojehai-pe). CivilCraft ombojoaju upéva puntos de relevamiento térã superficie-pe, navegador-pe: ndaha'éi nada ojeupi.

## Abrir el archivo

1. Ejepe'a {{ui:Abrir}} (térã {{ui:Importar}} GIS grupo-pe) ha eleguá archivo, térã emyasa plano-pe. ASCII grilla-pe, eleguá `.prj` archivo avei, CivilCraft oikuaa koordenada sistema.
2. Importación diálogo ohechauka archivo mba'e oñeñe'ẽ: tamaño, celdas térã puntos, koordenada sistema, latitud ha longitud ndive, elevación rango. LiDAR-pe peteĩ jey ohecha punto entero **clases** ojekuaa (progreso barra ohechauka mba'e jave; {{ui:Cancelar}} oñemboty).

GeoTIFF mbohapy térã irundy banda-pe (rojo, verde, azul) ha'e imagen, ndaha'éi elevación: mapa capas-pe oguahẽ.

## Elegir qué traer

- **Área**: {{ui:La extensión del proyecto y un margen}} (escribí margen), {{ui:Lo que muestra ahora el plano}} térã {{ui:Todo el archivo}}. Archivo-pe upe parte ojelee.
- **Adelgazar a**: puntos oguahẽvape espaciado, proyecto unidades-pe. Diálogo linea-pe ohechauka punto mboyve típear jave. Grilla-pe CivilCraft ohupyty cada segundo, tercero… celda, upévare elevación archivo-pe ohechaukámeme; celdas ndojehaiporu. LiDAR-pe área oñemboguejy tamaño cuadrado-pe, ha peteĩ punto oikeha cuadrado peteĩ-pe: {{ui:El punto más cercano al centro de cada celda}} (ñemoĩhápe), {{ui:El punto más bajo de cada celda}} (porã archivo clase terreno ndaipóiramo: terreno ykére árbol-kuéra) térã {{ui:El promedio de los puntos de cada celda}}.
- **Clases** (LiDAR): terreno (clase 2) oñemarca archivo-pe oĩramo; edificio, árbol ha ruido ndojeporúi. Terreno clase ndaipóiramo, clase entera oñemarca ha diálogo ohechauka upéva.
- **Terreno** (LiDAR, 0.8): dron nube-pe ndaipóri clase terreno. Archivo-pe ndaipóiramo diálogo oñepyrũ {{ui:Encontrar el terreno yo mismo (nubes de dron, sin clase de terreno)}}-pe: ruido ndohechái ambue clase ojekuaa, celda-pe punto más bajo oikeha, upéi CivilCraft ohechakuaa edificio, árbol ha ñemboaty punto bajos progresivo morfológico filtro-gui (Zhang ha ambue, 2003) ojeguerekóva: **Objeto más grande para quitar** (edificio más tuichaiterei ancho; ventanas oñemoaranduhai hasta oipyrúva; 0 jeporu 20 celda) ha **Pendiente máxima del terreno**. Trabajo oñemboguejy punto bajo grilla-pe, upévare millones de puntos nube-pe ndojapói mboyve celda cantidad rupi (adelgazamiento peteĩ pasada). Espaciado celda: mboyve ojapo ligero ha ohecha pequeño objeto-kuéra ndaipórã; mboyve pyahu ojeguereko terreno detalle. Informe ohechauka cuántos punto terreno-pe oikeha, cuántas celda objeto-pe oñemboty, ha cuántos punto bajo ojepe'a. Simulado 300 m dron relevamiento-pe, 5 edificio, 70 árbol ha 200 bajo punto-pe, oikeha punto terreno real 3 cm ryepýpe, techo térã copa ndojeguerekói.
- **Elevaciones en el archivo**: metros, pies térã pies de relevamiento EE.UU. Archivo oñeñe'ẽ jave unidad ojeporu. Ndaiporãi jave eleguá: diálogo elevación rango ambue mo'ãmby ohechauka, upéicha ehechakuaa mbaʼe porã lugar-pe.
- **Importar como** (grilla anive): {{ui:Puntos de relevamiento (DEM de descripción)}}, térã {{ui:La superficie misma (una grilla de triángulos)}}.

Peteĩ importación oikeva 500,000 punto-gui peve. Elección ojeguerekóramo mboyve, diálogo ohechauka cuánto ha mbaʼépa tamaño oikeha, ha {{ui:Importar}} ndojekuaái.

Ejepe'a {{ui:Importar}}. Progreso barra ohechauka lectura; {{ui:Cancelar}} oñemboty ha ndaipóri oñemoambue.

:::warning
Unidades verticales ojehai’ỹ mbaʼe. Mbovy estado plano DEM-kuéra-pe este ha norte pie-pe, elevación metro-pe. Rango diálogo-pe ohechaukáva ehechakuaa lugar-pe ojekuaáva.
:::

## Lo que obtenés

- **Puntos de relevamiento**: numerados proyecto punto más alto número rire, descripción `DEM` (grillas) térã `LIDAR`, peteĩ punto grupo **Puntos** ruguére, superficie oñemboguejy ambue punto-kuéra haguéicha. Importación peteĩ paso: {{key:Mod+Z}} oheja hikuái.
- **La superficie misma**: grilla TIN, mokõi triángulo celda-pe, sudoeste-noreste diagonal-pe. Triángulo esquina dato ndoguerekóva ndojehai; datos ndaipórã ndaiporúi. Superficie grilla punto-kuéra-pe iguala, ha triángulo ryepýpe plano. Proyecto superficie ojepyrũ (diálogo ohepyxaraha umi); {{key:Mod+Z}} omboguejy ymaguare superficie. Izquierda panel título ohechauka **Superficie (desde una grilla de elevación)**.

## Sistemas de coordenadas

- Proyecto sistema coordenadas oguereko ha archivo ambue ohechauka, punto-kuéra ojepe'a proyecto sistema-pe (ha terreno térã local koordenadas oguereko jave).
- Proyecto ndoguerekói ha archivo sistema proyecto unidades-pe (pies térã metros), diálogo ohepyxaraha sistema proyecto-pe, mismo deshacer paso-pe puntos-kuéra.
- Archivo latitud ha longitud-pe térã metros pies proyecto-pe, diálogo ohepyxaraha eleguá proyecto koordenada sistema.
- Archivo ndoipe'ái, numero-kuéra proyecto koordenadas-pe oñemoĩ. Ejeporu avei archivo sistema.

## Exportar una superficie como GeoTIFF

1. Ejepe'a {{ui:Exportar}} GIS grupo-pe.
2. GeoTIFF parte-pe eleguá superficie (terreno existente térã superficie proyectada) ha celda tamaño. Predeterminado oñemoĩ superficie triángulo borde promedio-gui. Diálogo ohechauka grilla tamaño ojapóva.
3. Ejepe'a {{ui:Descargar GeoTIFF}}.

Archivo peteĩ banda 32-bit punto flotante elevaciones proyecto unidades-pe, superficie extensión-pe; celdas superficie ndaipýpe "sin dato" (−3.4028235e38). Celda valor superficie elevación celda centro-pe. Koordenadas **grilla**: terreno térã local proyecto grilla-pe oñemboguejy. Archivo proyecto sistema EPSG kódigo-pe oñemoñe'ẽ; EPSG kódigo ndoguerekóiva sistema ndoguarda, diálogo ohendu GIS departamento-pe mba'eichaite sistema.

## Lo que se revisó

- GeoTIFF ha ASCII grilla lectores revisados GDAL (rasterio rupi), bibliteca GIS programa-kuéra oiporúva: 32-bit flotante ha 16-bit entero grillas, en mosaico ha tira, DEFLATE ha LZW, nodata, escala ha desplazamiento, pixel-is-point, UTM grilla, state plane grilla EE.UU. pies de relevamiento-pe ha latitud/longitud grilla — valor iguales.
- LAS ha LAZ lectores revisados laspy-gui: LAS 1.2 ha 1.4, punto formatos 0, 1, 3, 6, 7 ha 8, koordenada sistema ndive ha ndaipórire, ha LAZ LASzip-compatible backend-gui — punto iguales.
- Koordenadas convertidas revisadas PROJ-gui 1 mm peve.
- Exportados GeoTIFF GDAL-gui revisados: koordenada sistema, celda posiciones, nodata, unidades, ha valores superficie-pe 0.0001 peve.
- Ndojeporúi ambue GIS ni CAD programa-kuéra-pe.

## Todavía no construido

- Cambios vertical datum (geoide modelos): elevaciones archivo-pe ojeporúva oĩ haguéicha.
- Datos de forma de onda, LiDAR retornos clase ndoporúi, colores ha intensidades.
- Varias bandas, overviews, térã archivo 200 MB-gui mboyve.
- LAS térã LAZ oguarda superficie-gui térã ko herramienta-gui ([Nubes de puntos](topic:point-clouds) complemento-pe LAS 1.4 térã LAZ-pe oguarda nube limpia).
