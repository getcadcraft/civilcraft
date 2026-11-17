---
title: Selección con lazo de puntos de relevamiento
summary: Mantené Shift y arrastrá un contorno a mano libre alrededor de los puntos de relevamiento para seleccionarlos, como ventana, cruce o cerca; cambiá con Space mientras arrastrás. Un arrastre recto sigue dibujando un recuadro.
keywords: lazo, mano libre, seleccionar puntos, selección, ventana, cruce, cerca, espacio, polígono, selección por recuadro, arrastre con shift
from: 3dd4fcaa
---

## Lo que vas a aprender

Cómo seleccionar puntos de relevamiento dibujando alrededor de ellos, cuando un recuadro tomaría puntos que no querés.

## Dibujar un lazo

1. Hacé clic en {{ui:Select}} (o presioná {{key:V}}).
2. Mantené {{key:Shift}}, presioná en el plano y arrastrá **alrededor** de los puntos que querés, moviéndote primero a la **derecha**.
3. Soltá.

Los puntos dentro del contorno se agregan a la selección. Un arrastre que queda cerca de una línea recta dibuja un recuadro, como antes; en cuanto se desvía de esa línea (más de unos 12 píxeles) se convierte en lazo.

## Ventana, cruce y cerca

| Arrastrás | Lazo | Selecciona |
|---|---|---|
| Primero hacia la derecha | Ventana (contorno continuo) | Los puntos dentro |
| Primero hacia la izquierda | Cruce (punteado, verde) | Los puntos dentro, y los puntos que toca el contorno |
| Presionar {{key:Space}} mientras arrastrás | Ventana, luego cruce, luego cerca | Cerca (un camino punteado naranja, no cerrado): los puntos por donde pasa el camino |

La línea de estado nombra el lazo mientras arrastrás. {{key:Esc}} mientras arrastrás cancela y no selecciona nada.

:::tip
Una cerca es la forma rápida de elegir los disparos a lo largo de un cordón o una línea de zanja: arrastrá por ellos y soltá.
:::

## Ver también

- [Seleccionar, copiar y pegar puntos de relevamiento](topic:copy-paste-points)
- [Teclas y mouse](topic:keyboard)
