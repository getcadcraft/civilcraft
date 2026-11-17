---
title: Coordenadas de terreno y locales
summary: Trabaje en coordenadas de terreno (superficie) escaladas desde la rejilla con un factor de escala combinado que escriba o calcule en un punto, o en una rejilla de sitio supuesta vinculada al sistema por dos puntos de control.
keywords: coordenadas de terreno, coordenadas de superficie, rejilla a terreno, factor de escala combinado, csf, factor combinado, factor de rejilla, factor de elevación, factor de nivel del mar, convergencia, ángulo de mapeo, factor de escala, coordenadas supuestas, coordenadas locales, rejilla de sitio, 5000 5000, puntos de control, localización, calibración, dos puntos, error de cierre
from: 3d7453de
---

Las coordenadas state plane y UTM son coordenadas de **rejilla**: una proyección cartográfica estira o encoge las distancias un poco (decenas de partes por millón), y cuanto más alto está el sitio, más difiere una distancia medida en el terreno de la distancia de rejilla. Por eso muchos levantamientos entregan coordenadas de **terreno**, escaladas para que las distancias en planta sean iguales a las medidas en el terreno, o una rejilla de sitio **supuesta** (5000, 5000 en un punto de control). CivilCraft conserva sus números tal como son y registra cómo se relacionan con la rejilla, de modo que la latitud y longitud, los archivos SIG y las capas de mapa siguen cayendo en el lugar correcto.

Abra {{ui:Coordenadas}} en el grupo {{ui:SIG}}, elija (o conserve) el sistema y luego elija bajo **Coordenadas de rejilla, terreno o locales**:

| Opción | Sus coordenadas son | Cómo se relacionan con la rejilla |
|---|---|---|
| {{ui:Cuadrícula}} | Las del sistema (el inicio) | Los mismos números |
| {{ui:Terreno}} | Escaladas a distancias de terreno | rejilla = base + factor combinado × (terreno − base) |
| {{ui:Local}} | Una rejilla de sitio supuesta | Desplazada, girada y escalada hacia la rejilla mediante dos puntos de control |

Lo que elija se guarda con el proyecto y es un paso de deshacer; nada se mueve.

## Coordenadas de terreno

1. Elija {{ui:Terreno}}.
2. Escriba el **Factor de escala combinado** del levantamiento (por ejemplo `0.99987`), o calcúlelo:
   1. Bajo **Calcular el factor en un punto**, el punto empieza en el centro del proyecto. Elija {{ui:Elegir un punto en la planta}} y haga clic en el lugar (un clic cerca de un punto de levantamiento toma ese punto), o escriba E y N.
   2. La elevación viene de la superficie en ese lugar; escriba otra si la necesita.
   3. Elija {{ui:Calcular}}. CivilCraft muestra:
      - **Factor de escala de rejilla k**: cuánto estira la proyección cartográfica las distancias allí.
      - **Factor de elevación**: cuánto más cortas son las distancias en el elipsoide que a esa altura.
      - **Factor combinado** = k × factor de elevación: distancia de rejilla = distancia de terreno × este valor.
      - **Convergencia**: el ángulo entre el norte de rejilla y el norte verdadero allí (azimut geodésico = azimut de rejilla + convergencia).
   4. Elija el botón {{ui:Uso}} bajo los números para poner el factor combinado en el cuadro.
3. Defina el **Punto base**, donde las coordenadas de terreno y de rejilla son iguales. Empieza en 0, 0: la mayoría de las jurisdicciones que publican coordenadas de terreno escalan respecto al origen, así que las coordenadas de terreno siguen pareciéndose a las de rejilla. Algunos levantamientos escalan respecto al punto de control del proyecto: use lo que indique el levantamiento.
4. Elija {{ui:Aplicar}}.

:::warning
La elevación se toma como altura sobre el elipsoide. CivilCraft no tiene modelo de geoide, así que donde el geoide esté 30 m (100 ft) por debajo o por encima del elipsoide, el factor de elevación tiene un error de unos 5 ppm. Cuando el levantamiento indique su factor combinado, escriba ese.
:::

## Coordenadas locales (supuestas)

1. Elija {{ui:Local}}.
2. Para **Punto de control 1**, escriba el número del punto del levantamiento (o elija {{ui:Elegir}} y haga clic en él en la planta). Sus coordenadas locales aparecen a su lado.
3. Escriba sus E y N de **rejilla**, o su latitud y longitud en el tercer cuadro (por ejemplo `30.2672, -97.7431`).
4. Haga lo mismo para el **Punto de control 2**, lo más lejos posible del primero.
5. CivilCraft muestra la **Escala** y la **Rotación** encontradas, y le recuerda: **Dos puntos siempre encajan exactamente: verifique un tercero.**
6. Dé un **Punto de verificación** de la misma manera. CivilCraft muestra qué tan lejos lo pone el ajuste de las coordenadas de rejilla que escribió (su error de cierre, en unidades del proyecto y en partes por millón). Un error de cierre grande indica un punto equivocado, un error de escritura o coordenadas en otra unidad.
7. Elija {{ui:Aplicar}}.

Una escala muy alejada de 1 (más allá de 0.5 a 2) se rechaza: revise los puntos y sus unidades.

## Lo que se verificó

- El factor de escala y la convergencia coinciden con PROJ (pyproj 3.7.1 con PROJ 9.5.1), la biblioteca de coordenadas que usan la mayoría de los programas SIG, a 1 parte en mil millones en más de 300 sistemas con proyecciones conformes (state plane, UTM, Mercator transversal, cónica conforme de Lambert), y en el navegador en un punto elegido en la planta.
- Los pasos de terreno y locales se convierten de ida y vuelta a 1 parte en mil millones; dos puntos de control devuelven la escala y la rotación con que se hicieron; un punto de verificación 0.05 ft fuera muestra un error de cierre de 0.05 ft.
