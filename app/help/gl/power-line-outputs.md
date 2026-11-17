---
title: Táboas, cantidades, follas e GIS das liñas eléctricas
summary: Táboas de tendido e de apoios, cantidades de materiais para unha folla de cálculo ou TakeoffCraft, follas de planta e perfil cun informe de estudo nun único PDF, e capas GIS con todos os datos de cada elemento.
keywords: táboa de tendido, táboa de apoios, cantidades, lista de materiais, takeoffcraft, follas, informe, pdf, folla de perfil, gis, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Todo isto está baixo {{ui:Máis}} no grupo Liñas eléctricas.

| Saída | O que obtén |
|---|---|
| {{ui:Táboas de tendido…}} | Por sección, a tensión horizontal e a frecha de cada vano a cada temperatura; gardar como CSV. {{ui:Gardar a táboa de apoios (CSV)}}: a función de cada apoio, o elemento, o terreo, a suxeición, a carga máxima, a nominal, OK, a suxestión, a cimentación, a oscilación e a elevación |
| {{ui:Cantidades…}} | Condutor (lonxitudes en catenaria × condutores × circuítos + 2 % para puentes e finais de liña), apoios e equipos por elemento de biblioteca, cable, zanxa, escavación, condutos e xuntas. CSV, Excel ou un ficheiro de cantidades de TakeoffCraft |
| {{ui:Follas e informe…}} | Un PDF: o plano; unha folla de perfil para cada liña, co condutor nas hipóteses de carga que escolla e unha franxa de lonxitudes de vano, frechas e franquías mínimas; e un informe de estudo (regra, seccións, táboas de tendido, apoios e cada comprobación) |
| {{ui:Exportar a GIS…}} | Apoios, vanos, rutas de cables, equipos e obstáculos como capas cos seus datos (alturas, cargas, frechas, franquías, o que falla), como GeoPackage, shapefiles, GeoJSON, KML ou KMZ |

GeoJSON e KML precisan o sistema de coordenadas do proxecto ([Sistemas de coordenadas](topic:coordinate-systems)); sen el, GeoPackage e shapefiles levan os números propios do proxecto.
