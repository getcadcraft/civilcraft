---
title: Ingresar una poligonal y ajustarla por la regla de la brújula
summary: Escribí ángulos de campo o rumbos y distancias, revisá el cierre angular y lineal y la precisión, ajustá por la regla de la brújula y agregá las estaciones como puntos de relevamiento o el circuito como parcela.
keywords: poligonal, poligonal cerrada, circuito, ángulos a la derecha, vista atrás, rumbos, distancias, cierre, error de cierre, precisión, regla de la brújula, bowditch, ajuste, relevamiento
from: 56ce5a8c
---

Poligonal ha'e peteĩ serie de tramos medidos: estación peteĩ-peteĩ pe ángulo (térã rumbo) ha peteĩ distancia peve ojeho hasta la próxima. Ejecutá **Ingresar una poligonal** bajo **Poligonal** en el panel derecho cuando nada esté seleccionado.

## Dónde empieza y dónde termina

1. **Comenzar en punto de relevamiento**: su número. Térã ingresá un norte y un este.
2. **Tramos como**: **Ángulos a la derecha y distancias**, o **Rumbos y distancias**.
3. Con ángulos, indicá desde dónde se miden: un **Punto de relevamiento de vista atrás**, o **su acimut** (desde la primera estación hacia la vista atrás, en sentido horario desde el norte).
4. **Fin**: **de vuelta al inicio (un circuito)**, o **en punto de relevamiento** y su número (una poligonal abierta entre puntos conocidos).

## Escribí los tramos

Peteĩ tramo por línea, después la distancia, y después un nombre para la estación a la que llega, si querés:

- Ángulos a la derecha, medidos en sentido horario en la estación de donde sale el tramo, desde la estación de atrás hacia la siguiente: `270°00'10" 125.50 B`. `270-00-10`, `270 00 10` y `270.0028` también sirven.
- Rumbos: `N 45°30'15" E 125.50 B`, o un acimut como una sola palabra: `AZ 45-30-15 125.50 B`.
- En un circuito con ángulos, terminá con `close` y el ángulo del inicio otra vez, medido desde la última estación hacia la segunda: `close 270°00'05"`. Eso es lo que verifica los ángulos.

Las líneas que no se pueden leer se listan con sus números de línea. "feet", las comas y las líneas de comentario con `#` están bien.

## Leé el cierre

Mientras escribís, el diálogo muestra:

- **Error de cierre angular**: cuánto les falta a los ángulos para cerrar, y la parte que le toca a cada ángulo. Sin ángulo de cierre, los ángulos no se verifican, y cualquier error en ellos aparece en el error de cierre lineal.
- **Error de cierre lineal**: cuánto se aleja el final de la poligonal del punto donde debería terminar, y en qué dirección.
- **Precisión**: la longitud de la poligonal dividida por el error de cierre lineal: 1 : 10,000 significa 1 ft en 10,000 ft.
- Las estaciones después del ajuste, y cuánto se movió cada una.

## El ajuste

Primero el error de cierre angular se reparte por igual entre los ángulos. Después el error de cierre lineal se reparte entre los tramos por la regla de la brújula (Bowditch): cada estación se corre en contra del error en proporción a la longitud recorrida para llegar a ella, de modo que la poligonal termina exactamente donde debe.

:::note
La regla de la brújula es un ajuste estándar, no de mínimos cuadrados, y no pondera ángulos contra distancias. Si la precisión es suficiente lo deciden tus propias normas y las de tu jurisdicción.
:::

## Usá el resultado

- **Agregar como puntos de relevamiento**: las estaciones ajustadas pasan a ser puntos de relevamiento con los nombres que les diste (si no, los próximos números libres), descripción `TRAV`, sin cota. La última estación de un circuito es su inicio, así que no se agrega dos veces. Un paso: {{key:Mod+Z}} lo deshace.
- **Agregar como parcela** (circuitos): las estaciones ajustadas pasan a ser una [parcela](topic:parcels), con sus rótulos y su descripción legal.
- **Informe (CSV)**: primero las líneas de cierre, y después el rumbo, la distancia, las coordenadas sin ajustar y ajustadas, y las correcciones de cada estación.
