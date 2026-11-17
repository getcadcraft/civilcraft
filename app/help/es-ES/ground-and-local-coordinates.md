---
title: Coordenadas de terreno y locales
summary: Trabajar en coordenadas de terreno (superficie) escaladas desde la cuadrícula mediante un factor de escala combinado que se escribe o se calcula en un punto, o en una cuadrícula de obra supuesta anclada al sistema mediante dos puntos de control.
keywords: coordenadas de terreno, coordenadas de superficie, cuadrícula a terreno, factor de escala combinado, csf, factor combinado, factor de cuadrícula, factor de elevación, factor de nivel del mar, convergencia, ángulo de proyección, factor de escala, coordenadas supuestas, coordenadas locales, cuadrícula de obra, 5000 5000, puntos de control, localización, calibración, dos puntos, error de cierre
from: 3d7453de
---

Las coordenadas State Plane y UTM son coordenadas de **cuadrícula**: una proyección cartográfica estira o encoge un poco las distancias (decenas de partes por millón), y cuanto más alto está el emplazamiento, más difiere una distancia medida sobre el terreno de la de cuadrícula. Por eso muchos levantamientos entregan coordenadas de **terreno**, escaladas para que las distancias en planta sean iguales a las medidas sobre el terreno, o una cuadrícula de obra **supuesta** (5000, 5000 en un punto de control). CivilCraft conserva sus números tal como están y registra cómo se relacionan con la cuadrícula, de modo que las coordenadas de latitud y longitud, los archivos SIG y las capas de mapa siguen cayendo en el lugar correcto.

Abra {{ui:Coordenadas}} en el grupo {{ui:GIS}}, elija (o mantenga) el sistema y después seleccione bajo **Coordenadas de cuadrícula, de terreno o locales**:

| Opción | Sus coordenadas son | Cómo se relacionan con la cuadrícula |
|---|---|---|
| {{ui:Cuadrícula}} | Las propias del sistema (el punto de partida) | Los mismos números |
| {{ui:Terreno}} | Escaladas a distancias sobre el terreno | cuadrícula = base + factor combinado × (terreno − base) |
| {{ui:Local}} | Una cuadrícula de obra supuesta | Desplazada, girada y escalada sobre la cuadrícula mediante dos puntos de control |

Lo que elija se guarda con el proyecto y es un paso de deshacer; nada se mueve.

## Coordenadas de terreno

1. Elija {{ui:Terreno}}.
2. Escriba el **Factor de escala combinado** del levantamiento (por ejemplo `0.99987`), o calcúlelo:
   1. Bajo **Calcular el factor en un punto**, el punto empieza en el centro del proyecto. Elija {{ui:Elegir un punto en la planta}} y haga clic en el lugar (un clic cerca de un punto de topografía toma ese punto), o escriba E y N.
   2. La elevación viene de la superficie en ese lugar; escriba otra si la necesita.
   3. Elija {{ui:Calcular}}. CivilCraft muestra:
      - **Factor de escala de cuadrícula k**: cuánto estira la proyección cartográfica las distancias allí.
      - **Factor de elevación**: cuánto más cortas son las distancias en el elipsoide que a esa altura.
      - **Factor combinado** = k × factor de elevación: distancia de cuadrícula = distancia sobre el terreno × este factor.
      - **Convergencia**: el ángulo entre el norte de cuadrícula y el norte verdadero en ese lugar (acimut geodésico = acimut de cuadrícula + convergencia).
   4. Elija el botón {{ui:Uso}} bajo los números para poner el factor combinado en el cuadro.
3. Fije el **Punto base**, donde las coordenadas de terreno y de cuadrícula son iguales. Empieza en 0, 0: la mayoría de jurisdicciones que publican coordenadas de terreno escalan respecto al origen, así que las coordenadas de terreno siguen pareciéndose a las de cuadrícula. Algunos levantamientos escalan respecto al punto de control del proyecto: use lo que indique el levantamiento.
4. Elija {{ui:Aplicar}}.

:::warning
La elevación se toma como altura sobre el elipsoide. CivilCraft no tiene modelo de geoide, así que donde el geoide esté 30 m (100 ft) por debajo o por encima del elipsoide, el factor de elevación tiene un error de unas 5 ppm. Cuando el levantamiento indique su factor combinado, escriba ese.
:::

## Coordenadas locales (supuestas)

1. Elija {{ui:Local}}.
2. Para el **Punto de control 1**, escriba el número del punto de topografía (o elija {{ui:Elegir}} y haga clic en él en la planta). Sus coordenadas locales aparecen junto a él.
3. Escriba sus E y N de **cuadrícula**, o su latitud y longitud en el tercer cuadro (por ejemplo `30.2672, -97.7431`).
4. Haga lo mismo con el **Punto de control 2**, lo más lejos posible del primero.
5. CivilCraft muestra la **Escala** y la **Rotación** encontradas, y le recuerda: **Dos puntos siempre encajan exactamente: compruebe un tercero.**
6. Dé un **Punto de comprobación** de la misma forma. CivilCraft muestra cuánto lo aleja el ajuste de las coordenadas de cuadrícula que escribió (su error de cierre, en unidades del proyecto y en partes por millón). Un error grande indica un punto equivocado, un error de escritura o coordenadas en otra unidad.
7. Elija {{ui:Aplicar}}.

Una escala muy alejada de 1 (más allá de 0.5 a 2) se rechaza: compruebe los puntos y sus unidades.

## Qué se comprobó

- El factor de escala y la convergencia coinciden con PROJ (pyproj 3.7.1 con PROJ 9.5.1), la biblioteca de coordenadas que usan la mayoría de programas SIG, con una precisión de 1 parte en mil millones en más de 300 sistemas con proyecciones conformes (State Plane, UTM, Mercator transversa, cónica conforme de Lambert), y en el navegador en un punto elegido en la planta.
- Los pasos de terreno y locales se convierten de ida y vuelta con una precisión de 1 parte en mil millones; dos puntos de control devuelven la escala y la rotación con las que se hicieron; un punto de comprobación a 0.05 ft muestra un error de cierre de 0.05 ft.
