---
title: Tablas, cantidades, hojas y GIS de líneas eléctricas
summary: Tablas de tendido y de apoyos, cantidades de material para una hoja de cálculo o TakeoffCraft, hojas de planta y de perfil con un reporte de estudio en un solo PDF, y capas GIS con los datos de cada activo.
keywords: tabla de tendido, tabla de apoyos, cantidades, lista de materiales, takeoffcraft, hojas, reporte, pdf, hoja de perfil, gis, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Todo esto está en {{ui:Más}}, dentro del grupo Líneas eléctricas.

| Salida | Qué obtiene |
|---|---|
| {{ui:Tablas de tendido…}} | Por sección, la tensión horizontal y la flecha de cada vano a cada temperatura; se guarda como CSV. {{ui:Guardar la tabla de apoyos (CSV)}}: la función de cada apoyo, su elemento, terreno, sujeción, mayor carga, nominal, OK, sugerencia, cimentación, oscilación y levantamiento |
| {{ui:Cantidades…}} | Conductor (longitudes de catenaria × conductores × circuitos + 2 % para puentes y anclajes terminales), apoyos y equipos por elemento de biblioteca, cable, zanja, excavación, ductos y juntas. CSV, Excel o un archivo de cantidades de TakeoffCraft |
| {{ui:Hojas y reporte…}} | Un PDF: la planta; una hoja de perfil para cada línea, con el conductor en los casos de carga que usted elija y una franja con longitudes de vano, flechas y libranzas mínimas; y un reporte de estudio (conjunto de reglas, secciones, tablas de tendido, apoyos y cada verificación) |
| {{ui:Exportar a SIG…}} | Apoyos, vanos, rutas de cable, equipos y obstáculos como capas con sus datos (alturas, cargas, flechas, libranzas, lo que falla), como GeoPackage, shapefiles, GeoJSON, KML o KMZ |

GeoJSON y KML necesitan el sistema de coordenadas del proyecto ([Sistemas de coordenadas](topic:coordinate-systems)); sin uno, GeoPackage y shapefiles llevan los números propios del proyecto.
