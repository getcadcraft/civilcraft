---
title: Tablas, mediciones, hojas y SIG de líneas eléctricas
summary: Tablas de tendido y de apoyos, mediciones de materiales para una hoja de cálculo o TakeoffCraft, hojas de planta y de perfil con un informe de estudio en un solo PDF, y capas GIS con los datos de cada elemento.
keywords: tabla de tendido, tabla de apoyos, mediciones, lista de materiales, takeoffcraft, hojas, informe, pdf, hoja de perfil, sig, gis, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Todo lo de aquí está en {{ui:Más}} dentro del grupo Líneas eléctricas.

| Salida | Lo que obtiene |
|---|---|
| {{ui:Tablas de tendido…}} | Por tramo, la tensión horizontal y la flecha de cada vano a cada temperatura; se guarda como CSV. {{ui:Guardar la tabla de apoyos (CSV)}}: la función de cada apoyo, el elemento, el terreno, la fijación, la carga mayor, la nominal, OK, la sugerencia, la cimentación, la oscilación y el arranque |
| {{ui:Mediciones…}} | Conductor (longitudes de catenaria × conductores × circuitos + 2 % para puentes y amarres), apoyos y equipos por elemento de la biblioteca, cable, zanja, excavación, conductos y empalmes. CSV, Excel o un archivo de mediciones de TakeoffCraft |
| {{ui:Hojas e informe…}} | Un PDF: el plano; una hoja de perfil para cada línea con el conductor en las hipótesis de carga que elija y una franja con las longitudes de vano, las flechas y las distancias libres mínimas; y un informe de estudio (juego de reglas, tramos, tablas de tendido, apoyos y todas las comprobaciones) |
| {{ui:Exportar a SIG…}} | Apoyos, vanos, trazados de cable, equipos y obstáculos como capas con sus datos (alturas, cargas, flechas, distancias libres, lo que falla), en GeoPackage, shapefiles, GeoJSON, KML o KMZ |

GeoJSON y KML necesitan el sistema de coordenadas del proyecto ([Sistemas de coordenadas](topic:coordinate-systems)); sin él, GeoPackage y shapefiles llevan los números propios del proyecto.
