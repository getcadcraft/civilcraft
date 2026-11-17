---
title: Introducir una poligonal y ajustarla por la regla de la brújula
summary: Escriba los ángulos o rumbos y las distancias, compruebe el error angular y lineal de cierre y la precisión, ajústela por la regla de la brújula y añada las estaciones como puntos de levantamiento o el lazo como parcela.
keywords: poligonal, poligonal cerrada, lazo, ángulos a la derecha, visual atrás, rumbos, distancias, cierre, error de cierre, precisión, regla de la brújula, bowditch, compensación, levantamiento
from: 56ce5a8c
---

Una poligonal es una sucesión de tramos medidos: en cada estación, un ángulo (o un rumbo) y una distancia hasta la siguiente. Haga clic en **Introducir una poligonal**, bajo **Poligonal** en el panel derecho, cuando no haya nada seleccionado.

## Dónde empieza y dónde termina

1. **Inicio en punto de levantamiento**: su número. O escriba una coordenada norte y una coordenada este.
2. **Tramos como**: **Ángulos a la derecha y distancias**, o **Rumbos y distancias**.
3. Con ángulos, indique desde dónde se miden: un **Punto de levantamiento de visual atrás**, o **su acimut** (desde la primera estación hacia la visual atrás, en sentido horario desde el norte).
4. **Fin**: **de vuelta al inicio (un lazo)**, o **en punto de levantamiento** y su número (una poligonal abierta entre puntos conocidos).

## Escriba los tramos

Un tramo por línea: primero el ángulo o el rumbo, después la distancia y, si lo desea, un nombre para la estación a la que llega:

- Ángulos a la derecha, girados en sentido horario en la estación de la que sale el tramo, desde la estación anterior hasta la siguiente: `270°00'10" 125.50 B`. `270-00-10`, `270 00 10` y `270.0028` también valen.
- Rumbos: `N 45°30'15" E 125.50 B`, o un acimut en una sola palabra: `AZ 45-30-15 125.50 B`.
- En un lazo con ángulos, termine con `close` y de nuevo el ángulo del inicio, girado desde la última estación hacia la segunda: `close 270°00'05"`. Así se comprueban los ángulos.

Las líneas que no se pueden leer aparecen listadas con sus números de línea. La palabra "feet", las comas y las líneas de comentario con `#` no dan problemas.

## Lea el cierre

Mientras escribe, el cuadro muestra:

- **Error angular de cierre**: cuánto se alejan los ángulos de cerrar, y la parte que corresponde a cada ángulo. Sin ángulo de cierre, los ángulos no se comprueban, y cualquier error en ellos aparece en el error lineal de cierre.
- **Error lineal de cierre**: cuánto se aleja el final de la poligonal del punto donde debería terminar, y en qué dirección.
- **Precisión**: la longitud de la poligonal dividida por el error lineal de cierre: 1 : 10,000 significa 1 ft en 10,000 ft.
- Las estaciones tras el ajuste, y cuánto se ha desplazado cada una.

## El ajuste

Primero, el error angular de cierre se reparte por igual entre los ángulos. Después, el error lineal de cierre se reparte entre los tramos por la regla de la brújula (Bowditch): cada estación se desplaza en sentido contrario al error en proporción a la longitud recorrida hasta llegar a ella, de modo que la poligonal termina exactamente donde debe.

:::note
La regla de la brújula es un ajuste estándar, no de mínimos cuadrados, y no pondera ángulos frente a distancias. Si la precisión es suficiente, lo deciden sus propias normas y las de su jurisdicción.
:::

## Use el resultado

- **Añadir como puntos de levantamiento**: las estaciones ajustadas pasan a ser puntos de levantamiento con los nombres que indicó (si no, los números libres siguientes), con descripción `TRAV` y sin cota. La última estación de un lazo es su inicio, así que no se añade dos veces. Se deshace en un solo paso con {{key:Mod+Z}}.
- **Añadir como parcela** (lazos): las estaciones ajustadas pasan a ser una [parcela](topic:parcels), con sus etiquetas y su descripción legal.
- **Informe (CSV)**: las líneas de cierre y, para cada estación, su dirección, su distancia, sus coordenadas sin ajustar y ajustadas, y sus correcciones.
