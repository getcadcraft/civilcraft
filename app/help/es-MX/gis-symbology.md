---
title: Dar estilo a una capa por un atributo
summary: Coloree las entidades de una capa SIG según los valores de un campo (un color por valor, o por rangos numéricos), dimensione los puntos según un número, tiña los polígonos y muestre una leyenda en la planta.
keywords: simbología, estilo, color, por categorías, graduado, valores únicos, intervalo igual, cuantil, cortes naturales, jenks, rampa, daltonismo, leyenda, tamaño, puntos, coropleta, clases, sig
from: a3a69add
---

Abra el menú de **tres puntos** de una capa en la lista de capas SIG y elija {{ui:Estilo por atributo…}}.

## Tres estilos

- **Símbolo único:** el color de la capa, como antes.
- **Por categorías:** un color por cada valor distinto de cualquier campo. Hasta ocho valores reciben los ocho colores Okabe-Ito (elegidos para mantenerse distintos en los tipos comunes de daltonismo); con más valores, los siete más comunes reciben un color cada uno, y el resto comparte una clase gris **Otros**. Las entidades sin valor son grises.
- **Graduado:** un campo numérico se divide en 2 a 9 rangos, cada uno con un color de una rampa. Un valor sobre un corte entra en el rango inferior.

## Cómo se cortan los rangos

| Método | Cortes |
|---|---|
| Intervalo igual | El rango desde el valor más pequeño hasta el más grande se divide en anchos iguales. Valores de 0 a 30 en tres rangos: 0, 10, 20, 30. |
| Cuantil | Aproximadamente el mismo número de entidades en cada rango. Los cortes se leen de los valores ordenados con la interpolación lineal habitual: para 1 a 10 en dos rangos, el corte es 5.5. |
| Cortes naturales (Jenks) | Los cortes que dejan la menor dispersión dentro de cada rango, de modo que los grupos de valores parecidos quedan juntos. Con más de 1,500 valores trabaja sobre 1,500 espaciados uniformemente, y lo indica. |

## Colores

Viridis y Cividis van de oscuro a claro con un cambio constante de luminosidad, así que el orden de los rangos se puede leer incluso en gris o con daltonismo. Blues va de claro a oscuro. Rojo a azul es una rampa de dos sentidos para valores alrededor de un punto medio. **Invertir los colores** invierte cualquiera de ellas. El cuadro de diálogo enumera los rangos y el número de entidades en cada uno antes de aplicarlo.

## Tamaño, relleno y leyenda

- **Tamaño de punto según** un campo numérico hace más grande el cuadrado de cada punto cuanto mayor sea el valor, entre los dos tamaños que indique (la mitad del lado, en milímetros sobre papel).
- **Tintar el interior de los polígonos** rellena cada polígono con el color de su clase (los huecos quedan vacíos). El tinte está en pantalla; los trazados y los archivos DXF/DWG muestran los contornos coloreados.
- **Mostrar una leyenda en la planta** dibuja las clases, sus conteos y el rango de tamaños en la parte inferior izquierda de la planta. La leyenda está en pantalla; no aparece en un trazado.
- Para etiquetar entidades con un campo, use **Etiquetar con** en el mismo menú.

El estilo se guarda en el archivo del proyecto. Una versión que no conozca los estilos abre el archivo con el color de la capa. Los trazados, DXF y DWG llevan las clases como capas separadas, con el nombre de la capa y de la clase, en el más cercano de los nueve colores básicos de CAD. Una capa de más de 200,000 entidades se dibuja en un solo color.
