---
title: Estilo de capa por atributo
summary: Colorear los elementos de una capa GIS según los valores de un campo (un color por valor, o por rangos numéricos), dimensionar puntos por un número, teñir polígonos y mostrar una leyenda en el plano.
keywords: simbología, estilo, color, categorizado, graduado, valores únicos, intervalo igual, cuantil, cortes naturales, jenks, rampa, daltonismo, leyenda, tamaño, puntos, coroplético, clases, gis
from: a3a69add
---

Abrí el menú de **tres puntos** de una capa en la lista de capas GIS y elegí {{ui:Estilo por atributo…}}.

## Tres estilos

- **Símbolo único:** el color de la capa, como antes.
- **Categorizado:** un color por cada valor distinto de cualquier campo. Hasta ocho valores reciben los ocho colores Okabe-Ito (elegidos para seguir distinguibles en los tipos comunes de daltonismo); con más valores, los siete más comunes reciben un color cada uno y el resto comparte una clase gris **Otro**. Los elementos sin valor son grises.
- **Graduado:** un campo numérico se divide en 2 a 9 rangos, cada uno con un color de una rampa. Un valor justo en un corte entra en el rango inferior.

## Cómo se cortan los rangos

| Método | Cortes |
|---|---|
| Intervalo igual | El rango del valor más chico al más grande se divide en anchos iguales. Valores 0 a 30 en tres rangos: 0, 10, 20, 30. |
| Cuantil | Aproximadamente la misma cantidad de elementos en cada rango. Los cortes se leen de los valores ordenados con la interpolación lineal habitual: para 1 a 10 en dos rangos, el corte es 5,5. |
| Cortes naturales (Jenks) | Los cortes que dejan menos dispersión dentro de cada rango, de modo que los grupos de valores parecidos quedan juntos. Con más de 1.500 valores trabaja con 1.500 valores espaciados parejo, y lo indica. |

## Colores

Viridis y Cividis van de oscuro a claro con un cambio uniforme de luminosidad, así que el orden de los rangos se puede leer incluso en gris o con daltonismo. Blues va de claro a oscuro. Rojo a azul es una rampa de dos sentidos para valores alrededor de un medio. **Invertir los colores** da vuelta cualquiera de ellos. El cuadro lista los rangos y la cantidad de elementos de cada uno antes de aplicar.

## Tamaño, relleno y leyenda

- **Tamaño de punto por** un campo numérico hace que el cuadrado de cada punto sea más grande cuanto mayor es el valor, entre los dos tamaños que indiques (la mitad del lado, en milímetros sobre papel).
- **Teñir el interior de los polígonos** rellena cada polígono con el color de su clase (los huecos quedan vacíos). El tinte se ve en pantalla; los planos y DXF/DWG muestran los contornos coloreados.
- **Mostrar una leyenda en el plano** dibuja las clases, sus cantidades y el rango de tamaños en la parte inferior izquierda del plano. La leyenda se ve en pantalla; no entra en un plano impreso.
- Para etiquetar elementos con un campo, usá **Etiquetar con** en el mismo menú.

El estilo se guarda en el archivo del proyecto. Una versión que no conoce los estilos abre el archivo con el color de la capa. Los planos, DXF y DWG llevan las clases como capas separadas con el nombre de la capa y de la clase, en el más cercano de los nueve colores básicos de CAD. Una capa con más de 200.000 elementos se dibuja en un solo color.
