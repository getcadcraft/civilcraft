---
title: Terreno desde curvas de nivel
summary: Cree la superficie del terreno a partir de un mapa de curvas: elija las capas de líneas, indique de dónde sale la elevación de cada línea, revise cruces y duplicados y genere. Las curvas se vuelven líneas de quiebre y los triángulos planos de lomos y vaguadas se corrigen. Un mapa trazado desde una imagen o un PDF se escala y ubica con dos puntos conocidos.
keywords: curvas de nivel, terreno desde curvas, superficie desde curvas, mapa topográfico, levantamiento, sin coordenadas, líneas de quiebre, triángulos planos, lomo, vaguada, cima, curvas que se cruzan, curvas duplicadas, intervalo de curvas, escalar un mapa, dos puntos, ubicar un mapa, DXF, DWG, shapefile
from: e6161653
---

A veces un topógrafo envía un mapa de curvas: líneas con elevaciones, pero sin puntos. CivilCraft crea el terreno existente a partir de esas líneas.

## Traiga las curvas

Abra el mapa como líneas: un dibujo DXF o DWG, un shapefile o un GeoJSON (**GIS** › **Importar**, o suelte el archivo en el plano). Las líneas entran como **capas de mapa**. En **Superficie** › **Más**, elija **Terreno desde curvas**.

## Indique de dónde sale cada elevación

Marque las capas que tienen curvas y elija **Elevación desde**:

- **Las elevaciones propias de las líneas**: una línea cuyos vértices tienen todos la misma elevación (una polilínea 3D, o una polilínea con elevación). Una línea en 0 es dibujo en planta y no tiene nivel.
- Un **campo numérico** de la capa (por ejemplo ELEV), si el mapa lo trae.
- **Un inicio y un intervalo, en el orden en que están las líneas**: para líneas sin elevación alguna. La primera línea de la lista recibe la **Elevación de la primera línea**, la siguiente esa más el **Intervalo de curvas**, y así sucesivamente. Ponga las líneas de la más baja hacia arriba (o reordénelas en la capa).

## Revise y luego genere

**Revisar** enumera con palabras lo que está mal, antes de cambiar nada:

- una línea **sin elevación** o con menos de dos puntos;
- una línea **duplicada** (la misma forma dos veces, incluso dibujada al revés);
- dos líneas que **se cruzan**, a elevaciones distintas o a la misma (también una línea que se cruza a sí misma), con el lugar;
- una elevación que **no cae en el intervalo** (un error de dedo como 105.5 en un mapa de 1 m).

Marque **Omitir líneas que cruzan otra** para descartar la línea que cruza más líneas (luego la siguiente, hasta que ninguna cruce): se va la línea suelta que corta todas las curvas, no las curvas. **Simplificar líneas dentro de** quita vértices que están más cerca de un tramo recto que esa distancia.

**Generar el terreno** agrega las líneas al terreno existente como líneas de quiebre (un solo paso de deshacer), de modo que la superficie pasa exactamente por cada curva. Con **Corregir triángulos planos en lomos, vaguadas y cimas** marcado y un intervalo dado, CivilCraft agrega además un punto dentro de cada triángulo plano (uno cuyas esquinas están todas en una misma curva) a la altura a la que llega la pendiente vecina, nunca a más de medio intervalo de la curva. Sin eso, las cimas de los lomos, el fondo de las vaguadas y las cimas de los cerros quedan como placas planas. En un cerro de prueba el error frente a la superficie real bajó una cuarta parte; en un lomo, 40 %.

## Un mapa sin coordenadas

Para un mapa de curvas trazado desde una imagen o un PDF, abra **Escalar y ubicar las capas con dos puntos conocidos**. Dé dos puntos del mapa y dónde están realmente; las capas marcadas se escalan, giran y mueven para ajustarse (un solo paso de deshacer; las alturas no cambian). Los mismos dos puntos dan la escala (se muestra en el mensaje) y el giro.

La superficie vale lo que vale el mapa: entre dos curvas es un plano, así que el terreno real entre ellas no se conoce. Compare el resultado con cotas puntuales antes de confiar en él.
