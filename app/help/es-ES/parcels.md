---
title: Dibujar parcelas y redactar sus descripciones legales
summary: Dibuje una parcela por sus esquinas o introduzca los tramos de una escritura o de un plano de parcelación, compruebe lo bien que cierran los tramos, rotule los rumbos y distancias en el plano, convierta cualquier tramo en curva y copie un borrador de la descripción legal.
keywords: parcelas, lotes, linderos, perímetro, escritura, plano de parcelación, medidas y linderos, rumbo, distancia, cierre, error de cierre, precisión, descripción legal, punto de inicio, curva, radio, superficie, acres
from: 6793d6ce
---

Las parcelas se sitúan en el plano con el rumbo y la distancia de cada tramo recto (una curva muestra su radio, su longitud y su ángulo central), y su nombre y su superficie en el centro. Se incluyen en el trazado PDF y en las exportaciones DWG y DXF, en las capas `V-PROP` (líneas) y `V-PROP-TEXT` (rótulos). Todo está bajo **Parcelas** en el panel derecho cuando no hay nada seleccionado.

## Dibujar una parcela

1. Pulse **Dibujar una parcela**.
2. Haga clic en las esquinas, empezando por el punto de inicio. Un clic cerca de un punto topográfico toma la posición exacta de ese punto.
3. Haga clic de nuevo en la primera esquina, o pulse {{key:Enter}}, para terminar. {{key:Backspace}} deshace la última esquina; {{key:Esc}} descarta las esquinas hechas hasta ese momento; púlselo otra vez para salir de la herramienta.

## Introducir los tramos de una escritura

1. Pulse **Introducir tramos de escritura**.
2. Indique dónde empiezan los tramos: el número de un punto topográfico, o una coordenada norte y este.
3. Escriba o pegue los tramos, uno por línea:
   - una línea: un rumbo y una distancia, como `N 45°30'15" E 125.50`. También funcionan `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` y los acimutes (`AZ 45°30'15"`), y se ignoran «thence», las comas y «feet».
   - una curva: `C R 300 L 52.36 right` (radio y longitud de arco) o `C R 300 D 10°00'00" left` (radio y ángulo central). Una curva continúa el tramo anterior; cuando no es así, añada su rumbo de cuerda: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` inicia una línea de comentario.
4. Mientras escribe, el cuadro de diálogo muestra la longitud de los tramos, el **error de cierre** (a qué distancia del inicio terminan y en qué dirección), la **precisión** (la longitud dividida por el error de cierre, 1 : 10.000 y así sucesivamente) y la superficie. Las líneas que no puede leer se enumeran con su número de línea.
5. Pulse **Añadir la parcela**. Cuando los tramos no cierran, la parcela se cierra con un tramo recto que cubre la diferencia: compruebe los tramos con la escritura. Para repartir el error de una poligonal de campo entre sus tramos, ajústela antes.

## Curvas

En las **Propiedades** de una parcela, cada tramo tiene un **Radio**. Escriba uno para convertir ese tramo en una curva entre las mismas dos esquinas (un radio menor que la mitad de la distancia entre las esquinas no puede alcanzarlas, así que se rechaza), y elija **Derecha** o **Izquierda** en **Curvas**: una curva a la derecha tiene su centro a la derecha del sentido de recorrido, como en una escritura. Borre el radio para que vuelva a ser recta. Cada cambio es un paso: {{key:Mod+Z}} lo deshace.

## La descripción legal

Las Propiedades de una parcela terminan con su descripción legal, redactada a partir del dibujo:

- «Beginning at» el **Punto de inicio** que escriba (por ejemplo «the northeast corner of Lot 4»); si no, la coordenada norte y este de la primera esquina, o el punto topográfico desde el que empezaron los tramos.
- «thence» cada tramo: un rumbo y una distancia, o una curva con su radio, longitud de arco, ángulo central, y rumbo y distancia de cuerda.
- «Containing» su superficie en square feet y acres (metros cuadrados y hectáreas en un proyecto en metros).

**Copiar** la lleva al portapapeles; **Descargar como texto** la guarda como archivo `.txt`.

:::warning
La descripción legal es un borrador a partir del dibujo, no un levantamiento. Un topógrafo habilitado debe comprobarla con el registro y firmarla antes de que nadie confíe en ella.
:::

Haga clic dentro de una parcela en el plano para seleccionarla; {{key:Delete}} la elimina. Las parcelas se guardan en el archivo de proyecto.
