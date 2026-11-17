---
title: Redes de servicios y OpenStreetMap
summary: Recorridos de agua, cloaca, pluvial, gas, energía y telecomunicaciones con material, tamaño, recubrimiento y responsable; datos de OpenStreetMap desde un archivo JSON de Overpass; cruces, secciones de zanja y volúmenes; capas de servicio en DWG, DXF y PDF; segmentos de caño y de cable en IFC.
keywords: servicio, servicios, red, osm, openstreetmap, overpass, caño, cable, gas, cloaca, pluvial, telecomunicaciones, energía, agua, hidrante, cámara, zanja, cruce, separación, recubrimiento, profundidad, dwg, ifc, georreferenciado, capas
from: 8a85dace
---

Dibujá los servicios subterráneos de un predio como una red por cada servicio, revisá dónde se cruzan y enviá las redes como capas de plano y como IFC.

## Hacer recorridos

Abrí **Terreno, Más, Redes de servicios...**

- **Hacer un recorrido desde la selección** convierte la alineación, la línea de perfil o el caño seleccionado en un recorrido del servicio que elegiste. Después completá el material, el tamaño (mm), el recubrimiento (la profundidad hasta la parte superior del caño o del cable) y el responsable en la tabla.
- **Leer datos de OpenStreetMap** lee un archivo JSON de Overpass que guardaste (una consulta con `out geom;`). El proyecto necesita primero un sistema de coordenadas, porque las posiciones de OpenStreetMap son latitud y longitud. Se leen las cañerías (según la sustancia), los cables subterráneos de energía y telecomunicaciones, los hidrantes, las cámaras y los desagües pluviales; todo lo demás se cuenta como omitido y se indica en el mensaje. Las líneas aéreas se omiten.
- **Agregar el mapa de OpenStreetMap** agrega el mapa de OpenStreetMap debajo del plano. Se dibuja solo cuando las capas de mapa de internet están activadas en Configuración.

## Controles y salidas

- **Cruces**: los recorridos de servicios distintos que se cruzan en planta se listan con la altura libre entre ellos cuando hay una superficie de terreno; el mínimo es un valor provisorio que vos definís, no el número de una norma.
- **Zanja**: cada recorrido tiene una zanja (tamaño del caño más separación a cada lado, pendiente lateral, cama) con un volumen. El total se muestra en la ventana y en el CSV.
- **Plano**: los recorridos y los puntos están en capas de servicio (por ejemplo U-WATR-RUN, U-POWR-RUN), así llegan a PDF, DXF y DWG.
- **IFC**: los recorridos entran en la exportación IFC como segmentos de caño y segmentos de cable, con hidrantes, válvulas y cámaras, un sistema por servicio, en el sistema de coordenadas del proyecto.

## Datos de OpenStreetMap

Los datos de OpenStreetMap tienen derechos de autor de los colaboradores de OpenStreetMap y están licenciados bajo ODbL. La atribución se agrega al plano, al CSV y al IFC. Si compartís un archivo que contiene datos de OpenStreetMap, conservá la atribución y leé las condiciones de compartir igual de la licencia.

## Lo que no está hecho

Todavía no se dibujan los recorridos punto por punto en el plano con una herramienta, y los cruces todavía no se dibujan en la vista de perfil (el cálculo está hecho). Las profundidades, los tamaños y las separaciones empiezan como valores provisorios: usá los números de tu propia norma.
