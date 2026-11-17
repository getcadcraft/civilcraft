---
title: Terreno a partir de curvas de nivel
summary: Construir la superficie del terreno a partir de un mapa de curvas de nivel: elija las capas de líneas, indique de dónde procede la cota de cada línea, compruebe cruces y duplicados, y construya. Las curvas pasan a ser líneas de ruptura, y se corrigen los triángulos planos en crestas y vaguadas. Un mapa calcado de una imagen o de un PDF puede escalarse y colocarse con dos puntos conocidos.
keywords: curvas de nivel, curvas, terreno a partir de curvas de nivel, superficie a partir de curvas de nivel, mapa topográfico, mapa de levantamiento, sin coordenadas, líneas de ruptura, triángulos planos, cresta, vaguada, cima, curvas que se cruzan, curvas duplicadas, equidistancia, escalar un mapa, dos puntos, colocar un mapa, DXF, DWG, shapefile
from: e6161653
---

Un topógrafo a veces envía un mapa de curvas de nivel: líneas con cotas, pero sin puntos. CivilCraft construye el terreno existente a partir de esas líneas.

## Importar las curvas

Abra el mapa como geometría lineal: un plano DXF o DWG, un shapefile o un GeoJSON (**SIG** › {{ui:Importar}}, o arrastre el archivo al plano). Las líneas se importan como **capas de mapa**. En **Superficie** › {{ui:Más}}, elija {{ui:Terreno a partir de curvas de nivel}}.

## Indicar de dónde procede cada cota

Marque las capas que contienen curvas y después elija **Cota desde**:

- {{ui:Las cotas propias de las líneas}}: una línea cuyos vértices tienen todos la misma cota (una polilínea 3D, o una polilínea con cota). Una línea a 0 es geometría de planta y no tiene cota.
- Un **campo numérico** de la capa (por ejemplo ELEV), cuando el mapa lo incluye.
- {{ui:Un inicio y un intervalo, en el orden en que se listan las líneas}}: para líneas sin ninguna cota. La primera línea de la lista recibe la **Cota de la primera línea**, la siguiente esa cota más la **Equidistancia**, y así sucesivamente. Liste las líneas de la más baja a la más alta (o reordénelas en la capa).

## Comprobar y construir

{{ui:Comprobar}} enumera, con palabras, lo que está mal antes de cambiar nada:

- una línea **sin cota** o con menos de dos puntos;
- una línea **duplicada** (la misma forma dos veces, incluso dibujada en sentido contrario);
- dos líneas que se **cruzan**, a cotas distintas o a la misma (también una línea que se corta a sí misma), indicando el lugar;
- una cota que **no cae en la equidistancia** (un error de escritura, como 105.5 en un mapa de 1 m).

Marque {{ui:Dejar fuera las líneas que cruzan otra}} para descartar la línea que cruza más otras (y luego la siguiente, hasta que ninguna se cruce): la línea errónea que corta todas las curvas es la que se elimina, no las curvas. **Simplificar líneas dentro de** elimina los vértices que están más cerca de un tramo recto que esa distancia.

{{ui:Construir el terreno}} añade las líneas al terreno existente como líneas de ruptura (un paso de deshacer), de modo que la superficie pasa exactamente por cada curva. Con {{ui:Corregir triángulos planos en cresterías, vaguadas y cimas}} marcado y una equidistancia indicada, CivilCraft también añade un punto dentro de cada triángulo plano (un triángulo cuyos vértices están todos en una misma curva) a la altura que continúa la pendiente vecina, nunca a más de media equidistancia de la curva. Sin ello, las cimas de las crestas, los fondos de las vaguadas y las cimas de colinas salen como placas planas. En una colina de prueba, el error frente a la superficie real bajó una cuarta parte; en una cresta, un 40 %.

## Un mapa sin coordenadas

Para un mapa de curvas calcado de una imagen o de un PDF, abra **Escalar y colocar las capas por dos puntos conocidos**. Indique dos puntos del mapa y el lugar real donde están; las capas marcadas se escalan, giran y desplazan para ajustarse (un paso de deshacer; las alturas no cambian). Los mismos dos puntos dan la escala (mostrada en el mensaje) y la rotación.

La superficie es tan buena como el mapa: entre dos curvas es un plano, así que el terreno real entre ellas no se conoce. Compare el resultado con cotas puntuales antes de fiarse de él.
