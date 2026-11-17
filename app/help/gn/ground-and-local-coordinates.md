---
title: Coordenadas de suelo y locales
summary: Trabajar en coordenadas de suelo (superficie) escaladas desde la cuadrícula con un factor de escala combinado que escribís o calculás en un punto, o en una cuadrícula de sitio supuesta vinculada al sistema por dos puntos de control.
keywords: coordenadas de suelo, coordenadas de superficie, cuadrícula a suelo, factor de escala combinado, csf, factor combinado, factor de cuadrícula, factor de elevación, factor del nivel del mar, convergencia, ángulo de mapeo, factor de escala, coordenadas supuestas, coordenadas locales, cuadrícula de sitio, 5000 5000, puntos de control, localización, calibración, dos puntos, cierre
from: 3d7453de
---

Las coordenadas de sistema plano y UTM son coordenadas de **cuadrícula**: una proyección cartográfica estira o encoge un poco las distancias (decenas de partes por millón), y cuanto más alto está el sitio, más difiere una distancia medida en el terreno de la distancia en cuadrícula. Por eso muchos relevamientos entregan coordenadas de **suelo**, escaladas para que las distancias del plano sean iguales a las medidas en el terreno, o una cuadrícula de sitio **supuesta** (5000, 5000 en un punto de control). CivilCraft conserva tus números tal cual y registra cómo se relacionan con la cuadrícula, de modo que la latitud y longitud, los archivos GIS y las capas de mapa caigan en el lugar correcto.

Abrí {{ui:Coordenadas}} en el grupo {{ui:GIS}}, elegí (o mantené) el sistema, y después elegí bajo **Cuadrícula, suelo o coordenadas locales**:

| Opción | Tus coordenadas son | Cómo se relacionan con la cuadrícula |
|---|---|---|
| {{ui:Cuadrícula}} | Las propias del sistema (el inicio) | Los mismos números |
| {{ui:Suelo}} | Escaladas a distancias de terreno | cuadrícula = base + factor combinado × (suelo − base) |
| {{ui:Local}} | Una cuadrícula de sitio supuesta | Desplazada, girada y escalada sobre la cuadrícula por dos puntos de control |

Lo que elijas se guarda con el proyecto y es un paso de deshacer; nada se mueve.

## Coordenadas de suelo

1. Elegí {{ui:Suelo}}.
2. Escribí el **Factor de escala combinado** del relevamiento (por ejemplo `0.99987`), o calculalo:
   1. Bajo **Calcular el factor en un punto**, el punto empieza en el centro del proyecto. Elegí {{ui:Elegir un punto en el plano}} y hacé clic en el lugar (un clic cerca de un punto de relevamiento toma ese punto), o escribí E y N.
   2. La cota sale de la superficie en ese lugar; escribí otra si la necesitás.
   3. Elegí {{ui:Calcular}}. CivilCraft muestra:
      - **Factor de escala de cuadrícula k**: cuánto estira la proyección cartográfica las distancias allí.
      - **Factor de elevación**: cuánto más cortas son las distancias en el elipsoide que a esa altura.
      - **Factor combinado** = k × factor de elevación: distancia en cuadrícula = distancia de terreno × este valor.
      - **Convergencia**: el ángulo desde el norte de cuadrícula hasta el norte verdadero allí (azimut geodésico = azimut de cuadrícula + convergencia).
   4. Elegí el botón {{ui:Uso}} bajo los números para poner el factor combinado en la casilla.
3. Fijá el **Punto base**, donde las coordenadas de suelo y de cuadrícula son iguales. Empieza en 0, 0: la mayoría de las jurisdicciones que publican coordenadas de suelo escalan respecto del origen, así que las coordenadas de suelo quedan reconociblemente cerca de las de cuadrícula. Algunos relevamientos escalan respecto del punto de control del proyecto: usá lo que indique el relevamiento.
4. Elegí {{ui:Aplicar}}.

:::warning
La elevación se toma como altura sobre el elipsoide. CivilCraft no tiene modelo de geoide, así que donde el geoide está 30 m (100 ft) por debajo o por encima del elipsoide, el factor de elevación queda desfasado unas 5 ppm. Cuando el relevamiento indica su factor combinado, escribí ese.
:::

## Coordenadas locales (supuestas)

1. Elegí {{ui:Local}}.
2. En **Punto de control 1**, escribí el número del punto del relevamiento (o elegí {{ui:Elegir}} y hacé clic en el punto del plano). Sus coordenadas locales aparecen al lado.
3. Escribí su E y N de **cuadrícula**, o su latitud y longitud en la tercera casilla (por ejemplo `30.2672, -97.7431`).
4. Hacé lo mismo con el **Punto de control 2**, lo más lejos del primero que puedas.
5. CivilCraft muestra la **Escala** y la **Rotación** encontradas, y recuerda: **Dos puntos siempre encajan exactamente: verificá un tercero.**
6. Dale un **Punto de verificación** de la misma manera. CivilCraft muestra a qué distancia lo deja el ajuste de las coordenadas de cuadrícula que escribiste (su cierre, en unidades del proyecto y en partes por millón). Un cierre grande indica un punto equivocado, un error de tipeo, o coordenadas en otra unidad.
7. Elegí {{ui:Aplicar}}.

Una escala lejos de 1 (más allá de 0,5 a 2) se rechaza: verificá los puntos y sus unidades.

## Qué se verificó

- El factor de escala y la convergencia coinciden con PROJ (pyproj 3.7.1 con PROJ 9.5.1), la biblioteca de coordenadas que usan la mayoría de los programas GIS, dentro de 1 parte en mil millones en más de 300 sistemas con proyecciones conformes (sistema plano, UTM, Mercator transversal, cónica conforme de Lambert), y en el navegador en un punto elegido en el plano.
- Los pasos de suelo y locales se convierten de ida y vuelta con una precisión de 1 parte en mil millones; dos puntos de control devuelven la escala y la rotación con que se hicieron; un punto de verificación 0,05 ft desviado muestra un cierre de 0,05 ft.
