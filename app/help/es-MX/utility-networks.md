---
title: Redes de servicios y OpenStreetMap
summary: Tramos de agua, drenaje sanitario, pluvial, gas, electricidad y telecomunicaciones con material, diámetro, recubrimiento y propietario; datos de OpenStreetMap desde un archivo JSON de Overpass; cruces, secciones de zanja y volúmenes; capas de servicios en DWG, DXF y PDF; segmentos de tubería y cable en IFC.
keywords: servicios, redes, red, osm, openstreetmap, overpass, tubería, cable, gas, drenaje, pluvial, telecomunicaciones, electricidad, agua, hidrante, pozo de visita, zanja, cruce, separación, recubrimiento, profundidad, dwg, ifc, georreferenciado, capas
from: 8a85dace
---

Dibuje los servicios enterrados de un sitio como una red por servicio, revise dónde se cruzan y expórtelos como capas de dibujo y como IFC.

## Crear tramos

Abra **Superficie, Más, Redes de servicios...**

- **Crear un tramo desde la selección** convierte la alineación, la línea de perfil o la tubería seleccionada en un tramo del servicio que elija. Después complete el material, el diámetro (mm), el recubrimiento (la profundidad hasta la parte superior de la tubería o del cable) y el propietario en la tabla.
- **Leer datos de OpenStreetMap** lee un archivo JSON de Overpass que haya guardado (una consulta con `out geom;`). El proyecto necesita primero un sistema de coordenadas, porque las posiciones de OpenStreetMap son latitud y longitud. Se leen los oleoductos y gasoductos (según la sustancia), los cables subterráneos de electricidad y telecomunicaciones, los hidrantes, los pozos de visita y los drenajes pluviales; cualquier otro elemento se cuenta como omitido y se indica en el mensaje. Las líneas aéreas se omiten.
- **Agregar el mapa de OpenStreetMap** agrega el mapa de OpenStreetMap debajo del plano. Solo se dibuja si las capas de mapas de internet están activadas en la configuración.

## Revisiones y resultados

- **Cruces**: los tramos de servicios distintos que se cruzan en planta se listan con la altura libre entre ellos cuando hay una superficie del terreno; el valor mínimo es un valor provisional que usted define, no el número de una norma.
- **Zanja**: cada tramo tiene una zanja (diámetro de la tubería más la separación a cada lado, pendiente lateral y cama) con un volumen. El total aparece en la ventana y en el CSV.
- **Dibujo**: los tramos y los puntos están en capas de servicios (por ejemplo, U-WATR-RUN, U-POWR-RUN), así que llegan a PDF, DXF y DWG.
- **IFC**: los tramos se incluyen en la exportación IFC como segmentos de tubería y segmentos de cable, con hidrantes, válvulas y cámaras, un sistema por servicio, en el sistema de coordenadas del proyecto.

## Datos de OpenStreetMap

Los datos de OpenStreetMap son propiedad de sus colaboradores y están bajo licencia ODbL. La atribución se agrega al dibujo, al CSV y al IFC. Si comparte un archivo que contiene datos de OpenStreetMap, conserve la atribución y lea las condiciones de compartir igual de la licencia.

## Lo que no está hecho

Todavía no se dibujan los tramos punto por punto en el plano con una herramienta, y los cruces todavía no se dibujan en la vista de perfil (el cálculo ya está creado). Las profundidades, los diámetros y las separaciones empiezan como valores provisionales: use los números de su propia norma.
