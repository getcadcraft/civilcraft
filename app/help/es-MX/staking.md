---
title: Generar un informe de replanteo
summary: Liste estacas a lo largo de una alineación en estaciones y desfases, o los puntos topográficos cercanos, con estación, desfase, norte, este, cotas de diseño y del terreno, y corte o relleno, y guarde el informe como CSV o PDF.
keywords: replanteo, estaqueado, informe de estacas, hoja de corte, hoja de rasante, estación, desfase, corte, relleno, trazado, replanteo de obra, como construido
from: d8a4e9f1
---

Seleccione una alineación y pulse **Informe de replanteo** en sus **Propiedades**.

## Estacas en estaciones y desfases

1. **Desde** y **hasta**: las estaciones a replantear (1+50 o 150).
2. **cada**: el intervalo. Las estacas van en cada múltiplo, en ambos extremos y (con la casilla marcada) donde empiezan y terminan las curvas de la alineación.
3. **Desfases**: a la izquierda y a la derecha de la alineación, mirando en el sentido creciente de estaciones: `12 L, 0, 12 R`, `L12 CL R12` o `-12, 0, 12` (la izquierda es negativa). Una alineación con obra lineal empieza con las orillas de su pavimento y acotamientos.
4. **Numerar desde** y **con prefijo** nombran las estacas: 1, 2, 3, o S101, S102.

## Puntos topográficos cerca de la alineación

Elija **puntos topográficos cerca de la alineación** y qué tan cerca. A cada punto dentro de esa distancia se le asigna su estación y su desfase, el diseño en ese punto y su propia elevación como terreno: una verificación de los puntos replanteados o levantados como construidos.

## Qué dice el informe

| Columna | Qué es |
|---|---|
| Punto | El nombre de la estaca, o el número del punto topográfico |
| Estación, Desfase | Dónde está a lo largo de la alineación: L izquierda, R derecha |
| Norte, Este | Sus coordenadas |
| Cota de diseño | La superficie de la obra lineal diseñada en ese punto (de línea de cero a línea de cero), si no, el perfil de diseño sobre el eje |
| Cota del terreno | La superficie existente en ese punto, o la propia elevación del punto topográfico |
| Corte/relleno | C cuando el terreno está arriba del diseño (corte, se baja), F cuando está abajo (relleno, se sube), a la centésima |

Una estaca sin cota de diseño (fuera de la obra lineal, o en una alineación sin ella lejos del eje) no tiene corte ni relleno; el diálogo indica cuántas son.

## Guárdelo

- **CSV**: una línea de título, luego las columnas de arriba, más el corte o relleno como número con signo (terreno menos diseño), para hojas de cálculo y colectores de datos.
- **PDF**: páginas de tabla en el papel que elija, una estaca por fila, cortes en naranja y rellenos en verde, con la franja de título de las demás hojas.

:::note
Las estacas se calculan a partir del diseño del proyecto. Compárelas con los planos aprobados antes de construir cualquier cosa.
:::
