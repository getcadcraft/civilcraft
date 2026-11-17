---
title: Redes de servicios y OpenStreetMap
summary: Tramos de agua, saneamiento, pluviales, gas, electricidad y telecomunicaciones con material, diámetro, recubrimiento y propietario; datos de OpenStreetMap desde un archivo JSON de Overpass; cruces, secciones de zanja y volúmenes; capas de servicio en DWG, DXF y PDF; segmentos de tubería y de cable en IFC.
keywords: servicio, servicios, red, redes, osm, openstreetmap, overpass, tubería, cable, gas, saneamiento, pluviales, telecomunicaciones, electricidad, agua, hidrante, pozo, zanja, cruce, holgura, recubrimiento, profundidad, dwg, ifc, georreferenciado, capas
from: 8a85dace
---

Dibuje los servicios enterrados de una obra como una red por cada servicio, compruebe dónde se cruzan y expórtelos como capas de dibujo y como IFC.

## Crear tramos

Abra **Superficie, Más, Redes de servicios...**

- **Crear un tramo a partir de la selección** convierte la alineación, la línea de elemento o la tubería seleccionadas en un tramo del servicio que elija. A continuación, rellene en la tabla el material, el diámetro (mm), el recubrimiento (la profundidad hasta la parte superior de la tubería o del cable) y el propietario.
- **Leer datos de OpenStreetMap** lee un archivo JSON de Overpass que haya guardado (una consulta con `out geom;`). Primero el proyecto necesita un sistema de coordenadas, porque las posiciones de OpenStreetMap son de latitud y longitud. Se leen las conducciones (según la sustancia), los cables eléctricos y de telecomunicaciones subterráneos, los hidrantes, los pozos de registro y los colectores pluviales; cualquier otro elemento se cuenta como omitido y se indica en el mensaje. Las líneas aéreas se omiten.
- **Añadir el mapa de OpenStreetMap** añade el mapa de OpenStreetMap bajo el plano. Solo se dibuja si las capas de mapa de internet están activadas en Configuración.

## Comprobaciones y resultados

- **Cruces**: se enumeran los tramos de servicios distintos que se cruzan en planta, con la altura libre entre ellos cuando existe una superficie del terreno; el mínimo es un valor provisional que usted establece, no el número de una norma.
- **Zanja**: cada tramo tiene una zanja (diámetro de la tubería más holgura a cada lado, talud lateral, lecho de apoyo) con un volumen. El total se muestra en la ventana y en el CSV.
- **Dibujo**: los tramos y los puntos están en capas de servicio (por ejemplo, U-WATR-RUN, U-POWR-RUN), de modo que pasan a PDF, DXF y DWG.
- **IFC**: los tramos se incluyen en la exportación IFC como segmentos de tubería y segmentos de cable, con hidrantes, válvulas y arquetas, un sistema por servicio, en el sistema de coordenadas del proyecto.

## Datos de OpenStreetMap

Los datos de OpenStreetMap son propiedad de sus colaboradores (© OpenStreetMap) y se distribuyen con licencia ODbL. La atribución se añade al dibujo, al CSV y al IFC. Si comparte un archivo que contiene datos de OpenStreetMap, mantenga la atribución y lea las condiciones de compartir igual de la licencia.

## Lo que no está hecho

Todavía no se dibujan los tramos punto por punto en el plano con una herramienta, y los cruces todavía no se dibujan en la vista de perfil (el cálculo está construido). Las profundidades, los diámetros y las holguras empiezan como valores provisionales: use los valores de su propia norma.
