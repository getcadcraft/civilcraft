---
title: Selección de puntos del levantamiento con lazo
summary: Mantenga Shift y arrastre un contorno libre alrededor de los puntos del levantamiento para seleccionarlos, como ventana, cruce o valla; cambie con Space mientras arrastra. Un arrastre recto sigue dibujando un recuadro.
keywords: lazo, contorno libre, seleccionar puntos, selección, ventana, cruce, valla, espacio, polígono, selección por recuadro, arrastrar con Shift
from: 3dd4fcaa
---

## Lo que aprenderá

Cómo seleccionar puntos del levantamiento dibujando alrededor de ellos, cuando un recuadro se llevaría puntos que no quiere.

## Dibujar un lazo

1. Haga clic en {{ui:Select}} (o pulse {{key:V}}).
2. Mantenga pulsado {{key:Shift}}, pulse en la planta y arrastre **alrededor** de los puntos que quiera, moviéndose primero **hacia la derecha**.
3. Suelte.

Los puntos dentro del contorno se añaden a la selección. Un arrastre que se mantiene cerca de una línea recta dibuja un recuadro, como antes; en cuanto se aleja de esa línea (más de unos 12 píxeles), se convierte en lazo.

## Ventana, cruce y valla

| Arrastra | Lazo | Selecciona |
|---|---|---|
| Primero hacia la derecha | Ventana (contorno continuo) | Los puntos dentro |
| Primero hacia la izquierda | Cruce (discontinuo, verde) | Los puntos dentro, y los puntos que toca el contorno |
| Pulse {{key:Space}} mientras arrastra | Ventana, luego cruce, luego valla | Valla (trayectoria discontinua naranja, no cerrada): los puntos sobre los que pasa la trayectoria |

La línea de estado indica el lazo mientras arrastra. {{key:Esc}} mientras arrastra lo cancela y no selecciona nada.

:::tip
Una valla es la forma rápida de elegir los puntos de toma a lo largo de un bordillo o de una línea de cuneta: arrástrela sobre ellos y suelte.
:::

## Ver también

- [Seleccionar, copiar y pegar puntos del levantamiento](topic:copy-paste-points)
- [Teclas y ratón](topic:keyboard)
