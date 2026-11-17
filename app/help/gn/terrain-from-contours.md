---
title: Terreno curvas de nivel gui
summary: Ojapo superficie terreno mapa curvas rehe: eheja capas línea, emoĩ mboyve cada línea altura ojuhu, revisa cruces ha duplicados, ha ojapo. Curvas oñemoĩ líneas de quiebre, planas triángulos crestas ha valles-pe oñemoambue. Mapa dibujado imagen térã PDF gui oñeajusta escala ha ubicación dos punto conocido rupi.
keywords: curvas, curvas de nivel, terreno desde curvas, superficie desde curvas, mapa topográfico, mapa de relevamiento, sin coordenadas, líneas de quiebre, triángulos planos, cresta, valle, cumbre, curvas que se cruzan, curvas duplicadas, intervalo de curvas, escalar mapa, dos puntos, ubicar mapa, DXF, DWG, shapefile
from: e6161653
---

Relevamiento tecnico mapa curvas envía: altura líneas, punto ndaipóri. CivilCraft ojapo terreno existente upe líneas gui.

## Curvas importación

Mapa oñeʼẽ líneas, DXF térã DWG dibujo, shapefile térã GeoJSON (**GIS** › {{ui:Import}}, térã archivo plano-pe omombyry). Líneas oñemoĩ **capas mapa**-pe. **Superficie** › {{ui:More}}-pe eheja {{ui:Terrain from contours}}.

## Mba'éichapa altura oñeʼẽ

Eheja curvas capas, upe rire **Altura desde**:

- {{ui:The lines' own elevations}}: línea peteĩ altura mismo vértice (polilínea 3D térã altura polilínea). Línea 0 plano dibujo ha'e, altura ndaipóri.
- Capa **campo número** (ejemplo ELEV), mapa oguerekóramo.
- {{ui:A start and an interval, in the order the lines are listed}}: línea altura ndaipóriva. Lista primera línea ome'ẽ **Altura primera línea**, próxima ojeikeʼỹ **Intervalo de curvas**, ha upéicha. Línea lista hasy'ỹ-gui ojejoaju (térã capa-pe ojejoaju).

## Revisión, upe rire ojapo

{{ui:Check}} ohechauka mba'e ojeikeʼỹ, palabra-pe, ndojejoavýi:

- línea **altura ndaipóri** térã dos punto mboyve;
- línea **duplicada** (forma mismo, jey mbytépe jave);
- dos línea **cruzan**, altura ojeikeʼỹ térã mismo, (línea ijeheguínte cruzan jave), lugar ohechauka;
- altura **ndaiporiva intervalo** (ejemplo 105.5 mapa 1 m-pe, error escritura).

Eapreta {{ui:Leave out lines that cross another}} omboguejy línea hetave cruza (upe rire próxima, nahániri cruza): línea omboguejýva ha'e pe ohejaitéva curvas, ndaha'éi curvas. **Simplify lines within** vértice pequeño hasy'ỹ ojeikéva ombohasy.

{{ui:Build the ground}} línea oñemoĩ terreno existente-pe líneas de quiebre (peteĩ paso undo), upéicha superficie pasa peteĩteĩ curva exacta. {{ui:Fix flat triangles on ridges, valleys and hilltops}} eheja ha intervalo emoĩ jave, CivilCraft ojapo punto peteĩteĩ triángulo plano (esquinas mismo curva-pe) ryepýpe, altura ohupytýva pendiente próximo-pe, curva gui medio intervalo mboyve ndaipóri. Upéicha crestas, valles ha cumbres ndojeikeʼỹ placas planas. Ensayo cerro-pe error verdadero superficie gui ojejoaju cuarta parte; cresta-pe 40 %.

## Mapa sin coordenadas

Mapa curvas dibujado imagen térã PDF gui, eheja **Escalar y ubicar las capas por dos puntos conocidos**. Emoĩ dos punto mapa-pe ha mba'éichapa oĩ tuichaitépe; eheja capas oñemboty, oñemboguata, oñemoĩ ojeupe (peteĩ paso undo; altura ndojemoambuéi). Dos punto mismo escala (mensaje-pe ohechauka) ha rotación ome'ẽ.

Superficie mapa ojeporeka: curvas ryepýpe plano, upévare terreno real ndojekuaái. Ohechakuaa resultado cota puntuales ndive jepe'a mboyve.
