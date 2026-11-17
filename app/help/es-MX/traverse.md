---
title: Ingresar una poligonal y ajustarla por la regla de la brújula
summary: Escriba los ángulos de campo o los rumbos y las distancias, revise el error de cierre angular y lineal y la precisión, ajuste por la regla de la brújula y agregue las estaciones como puntos de levantamiento o el circuito como parcela.
keywords: poligonal, poligonal cerrada, circuito, ángulos a la derecha, referencia atrás, rumbos, distancias, cierre, error de cierre, precisión, regla de la brújula, bowditch, ajuste, levantamiento
from: 56ce5a8c
---

Una poligonal es una serie de tramos medidos: en cada estación, un ángulo (o un rumbo) y una distancia a la siguiente. Haga clic en **Ingresar una poligonal** bajo **Poligonal** en el panel derecho cuando no haya nada seleccionado.

## Dónde empieza y dónde termina

1. **Empezar en punto de levantamiento**: su número. O escriba una coordenada norte y este.
2. **Tramos como**: **Ángulos a la derecha y distancias**, o **Rumbos y distancias**.
3. Con ángulos, indique desde dónde se miden: un **Punto de levantamiento de referencia atrás**, o **su acimut** (desde la primera estación hacia la referencia atrás, en sentido horario desde el norte).
4. **Final**: **de regreso al inicio (un circuito)**, o **en punto de levantamiento** y su número (una poligonal abierta entre puntos conocidos).

## Escriba los tramos

Un tramo por línea: primero el ángulo o el rumbo, luego la distancia y, si lo desea, un nombre para la estación a la que llega:

- Ángulos a la derecha, medidos en sentido horario en la estación de la que sale el tramo, desde la estación de atrás hasta la siguiente: `270°00'10" 125.50 B`. `270-00-10`, `270 00 10` y `270.0028` también funcionan.
- Rumbos: `N 45°30'15" E 125.50 B`, o un acimut como una sola palabra: `AZ 45-30-15 125.50 B`.
- En un circuito con ángulos, termine con `close` y el ángulo del inicio otra vez, medido desde la última estación hacia la segunda: `close 270°00'05"`. Eso es lo que verifica los ángulos.

Las líneas que no se pueden leer se enumeran con sus números de línea. "feet", las comas y las líneas de comentario con `#` son válidas.

## Lea el cierre

Mientras escribe, el cuadro muestra:

- **Error de cierre angular**: qué tan lejos están los ángulos de cerrar, y la parte que corresponde a cada ángulo. Sin un ángulo de cierre no se verifican los ángulos, y cualquier error en ellos aparece en el error de cierre lineal.
- **Error de cierre lineal**: qué tan lejos queda el final de la poligonal del punto donde debería terminar, y en qué dirección.
- **Precisión**: la longitud de la poligonal dividida entre el error de cierre lineal: 1 : 10,000 significa 1 ft en 10,000 ft.
- Las estaciones después del ajuste, y cuánto se desplazó cada una.

## El ajuste

Primero, el error de cierre angular se reparte por igual entre los ángulos. Luego, el error de cierre lineal se reparte entre los tramos por la regla de la brújula (Bowditch): cada estación se desplaza en sentido contrario al error, en proporción a la longitud recorrida para llegar a ella, de modo que la poligonal termina exactamente donde debe.

:::note
La regla de la brújula es un ajuste estándar, no de mínimos cuadrados, y no pondera los ángulos frente a las distancias. Si la precisión es suficiente le corresponde decidirlo a sus propias normas y a las de su jurisdicción.
:::

## Use el resultado

- **Agregar como puntos de levantamiento**: las estaciones ajustadas se convierten en puntos de levantamiento con los nombres que dio (si no, los siguientes números libres), descripción `TRAV`, sin elevación. La última estación de un circuito es su inicio, así que no se agrega dos veces. Un solo paso: {{key:Mod+Z}} lo deshace.
- **Agregar como parcela** (circuitos): las estaciones ajustadas se convierten en una [parcela](topic:parcels), con sus etiquetas y su descripción legal.
- **Informe (CSV)**: las líneas de cierre y luego el rumbo, la distancia, las coordenadas sin ajustar y ajustadas, y las correcciones de cada estación.
