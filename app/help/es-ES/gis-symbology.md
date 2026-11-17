---
title: Dar estilo a una capa por un atributo
summary: Colorear los elementos de una capa SIG según los valores de un campo (un color por valor o por rangos numéricos), dimensionar los puntos por un número, tintar los polígonos y mostrar una leyenda en la planta.
keywords: simbología, estilo, color, colorear, categorizado, graduado, valores únicos, intervalo igual, cuantil, cortes naturales, jenks, rampa, daltonismo, leyenda, tamaño, puntos, coropletas, clases, sig
from: a3a69add
---

Abra el menú de **tres puntos** de una capa en la lista de capas SIG y elija {{ui:Estilo por atributo…}}.

## Tres estilos

- **Símbolo único:** el color de la capa, como antes.
- **Categorizado:** un color por cada valor distinto de cualquier campo. Hasta ocho valores reciben los ocho colores de Okabe-Ito (elegidos para distinguirse en los tipos habituales de daltonismo); con más valores, los siete más frecuentes reciben un color cada uno y el resto comparte una clase gris **Otros**. Los elementos sin valor son grises.
- **Graduado:** un campo numérico se divide en 2 a 9 rangos, cada uno con un color de una rampa. Un valor situado en un corte entra en el rango inferior.

## Cómo se cortan los rangos

| Método | Cortes |
|---|---|
| Intervalo igual | El rango desde el valor más pequeño hasta el más grande, dividido en anchos iguales. Valores de 0 a 30 en tres rangos: 0, 10, 20, 30. |
| Cuantil | Aproximadamente el mismo número de elementos en cada rango. Los cortes se leen de los valores ordenados con la interpolación lineal habitual: para 1 a 10 en dos rangos, el corte es 5.5. |
| Cortes naturales (Jenks) | Los cortes que dejan menos dispersión dentro de cada rango, de modo que los grupos de valores parecidos se mantienen juntos. Con más de 1,500 valores trabaja sobre 1,500 valores espaciados uniformemente, y lo indica. |

## Colores

Viridis y Cividis van de oscuro a claro con un cambio constante de luminosidad, así que el orden de los rangos puede leerse incluso en gris o con daltonismo. Blues va de claro a oscuro. Rojo a azul es una rampa bidireccional para valores alrededor de un punto medio. **Invertir los colores** invierte cualquiera de ellas. El cuadro enumera los rangos y el número de elementos de cada uno antes de aplicarlo.

## Tamaño, relleno y leyenda

- **Tamaño del punto según** un campo numérico hace mayor el cuadrado de cada punto cuanto mayor sea el valor, entre los dos tamaños que indique (la mitad del lado, en milímetros sobre papel).
- **Tintar el interior de los polígonos** rellena cada polígono con el color de su clase (los huecos quedan vacíos). El tinte es solo en pantalla; las impresiones y los DXF/DWG muestran los contornos coloreados.
- **Mostrar una leyenda en la planta** dibuja las clases, sus recuentos y el rango de tamaños en la parte inferior izquierda de la planta. La leyenda es solo de pantalla; no aparece en una impresión.
- Para etiquetar elementos con un campo, use **Etiquetar con** en el mismo menú.

El estilo se guarda en el archivo del proyecto. Una versión que no conoce los estilos abre el archivo con el color de la capa. Las impresiones, DXF y DWG llevan las clases como capas separadas con el nombre de la capa y de la clase, en el más cercano de los nueve colores CAD básicos. Una capa de más de 200,000 elementos se dibuja en un solo color.
