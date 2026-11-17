---
title: Selección con lazo de puntos de levantamiento
summary: Mantenga presionado Shift y arrastre un contorno a mano alzada alrededor de los puntos de levantamiento para seleccionarlos, como ventana, captura o borde; cambie con Space mientras arrastra. Un arrastre recto todavía dibuja un recuadro.
keywords: lazo, a mano alzada, seleccionar puntos, selección, ventana, captura, borde, espacio, polígono, selección por recuadro, arrastre con Shift
from: 3dd4fcaa
---

## Lo que aprenderá

Cómo seleccionar puntos de levantamiento dibujando alrededor de ellos, cuando un recuadro tomaría puntos que no quiere.

## Dibuje un lazo

1. Haga clic en {{ui:Seleccionar}} (o presione {{key:V}}).
2. Mantenga presionada {{key:Shift}}, presione sobre el plano y arrastre **alrededor** de los puntos que quiere, moviéndose **primero hacia la derecha**.
3. Suelte.

Los puntos dentro del contorno se agregan a la selección. Un arrastre que se mantiene cerca de una línea recta dibuja un recuadro, como antes; en cuanto se aleja de esa línea (más de unos 12 píxeles) se convierte en lazo.

## Ventana, captura y borde

| Si arrastra | Lazo | Selecciona |
|---|---|---|
| **Primero hacia la derecha** | Ventana (contorno continuo) | Los puntos dentro de ella |
| **Primero hacia la izquierda** | Captura (discontinuo, verde) | Los puntos dentro de ella, y los puntos que toca el contorno |
| Presione {{key:Space}} mientras arrastra | Ventana, luego captura, luego borde | Borde (una trayectoria discontinua naranja, no cerrada): los puntos sobre los que pasa la trayectoria |

La barra de estado nombra el lazo mientras arrastra. {{key:Esc}} mientras arrastra cancela y no selecciona nada.

:::tip
Un borde es la forma rápida de elegir los puntos a lo largo de una guarnición o de una línea de zanja: arrastre sobre ellos y suelte.
:::

## Vea también

- [Seleccionar, copiar y pegar puntos de levantamiento](topic:copy-paste-points)
- [Teclas y ratón](topic:keyboard)
