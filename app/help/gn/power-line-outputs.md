---
title: Tablas, cantidades, hojas y SIG de líneas eléctricas
summary: Tablas de tendido y de soportes, cantidades de materiales para una planilla o TakeoffCraft, hojas de plano y perfil con un informe de estudio en un solo PDF, y capas SIG con los datos de cada activo.
keywords: tabla de tendido, tabla de soportes, cantidades, lista de materiales, takeoffcraft, hojas, informe, pdf, hoja de perfil, sig, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Todo esto está bajo {{ui:Más}} en el grupo Líneas eléctricas.

| Salida | Qué obtienes |
|---|---|
| {{ui:Tablas de tendido…}} | Por sección, la tensión horizontal y la flecha de cada tramo a cada temperatura; guardar como CSV. {{ui:Guardar la tabla de soportes (CSV)}}: el rol de cada soporte, elemento, terreno, fijación, carga mayor, nominal, OK, sugerencia, cimiento, balanceo, levantamiento |
| {{ui:Cantidades…}} | Conductor (longitudes de catenaria × conductores × circuitos + 2 % para puentes y fines de línea), soportes y equipos por elemento de biblioteca, cable, zanja, excavación, ductos, empalmes. CSV, Excel, o un archivo de cantidades de TakeoffCraft |
| {{ui:Hojas e informe…}} | Un PDF: el plano; una hoja de perfil para cada línea con el conductor en las hipótesis de carga que elijas y una franja de longitudes de tramo, flechas y despejes mínimos; y un informe de estudio (conjunto de reglas, secciones, tablas de tendido, soportes, cada verificación) |
| {{ui:Exportar a SIG…}} | Soportes, tramos, rutas de cable, equipos y obstáculos como capas con sus datos (alturas, cargas, flechas, despejes, qué falla), como GeoPackage, shapefiles, GeoJSON, KML o KMZ |

GeoJSON y KML necesitan el sistema de coordenadas del proyecto ([Sistemas de coordenadas](topic:coordinate-systems)); sin él, GeoPackage y shapefiles llevan los números propios del proyecto.
