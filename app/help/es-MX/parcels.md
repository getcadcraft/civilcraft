---
title: Dibuje parcelas y redacte sus descripciones legales
summary: Dibuje una parcela por sus esquinas o ingrese los rumbos de una escritura o plano, revise qué tan bien cierran los rumbos, rotule los rumbos y distancias en el plano, convierta cualquier tramo en curva y copie un borrador de descripción legal.
keywords: parcelas, lotes, líneas de propiedad, linderos, escritura, plano, rumbos y distancias, rumbo, distancia, cierre, error de cierre, precisión, descripción legal, punto de inicio, curva, radio, área, acres
from: 6793d6ce
---

Las parcelas aparecen en el plano con el rumbo y la distancia a lo largo de cada tramo recto (una curva muestra su radio, longitud y ángulo central), y con su nombre y área en el centro. Pasan al trazado PDF y a las exportaciones DWG y DXF, en las capas `V-PROP` (líneas) y `V-PROP-TEXT` (rótulos). Todo está en **Parcelas**, en el panel derecho, cuando no hay nada seleccionado.

## Dibujar una parcela

1. Haga clic en **Dibujar una parcela**.
2. Haga clic en las esquinas, empezando por el punto de inicio. Un clic cerca de un punto de levantamiento toma la posición exacta de ese punto.
3. Haga clic de nuevo en la primera esquina, o pulse {{key:Enter}}, para terminar. {{key:Backspace}} quita la última esquina; {{key:Esc}} descarta las esquinas hasta ese momento; vuelva a pulsar {{key:Esc}} para salir de la herramienta.

## Ingresar los rumbos de una escritura

1. Haga clic en **Ingresar rumbos de escritura**.
2. Indique dónde empiezan los rumbos: el número de un punto de levantamiento, o una coordenada norte y este.
3. Escriba o pegue los rumbos, uno por línea:
   - un tramo: un rumbo y una distancia, como `N 45°30'15" E 125.50`. `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` y acimutes (`AZ 45°30'15"`) también funcionan, y "thence", las comas y "feet" se ignoran.
   - una curva: `C R 300 L 52.36 right` (radio y longitud de arco), o `C R 300 D 10°00'00" left` (radio y ángulo central). Una curva continúa el tramo anterior; cuando no lo hace, agregue su rumbo de cuerda: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` inicia una línea de comentario.
4. Mientras escribe, el cuadro de diálogo muestra la longitud de los rumbos, el **error de cierre** (qué tan lejos del inicio terminan, y en qué dirección), la **precisión** (la longitud dividida entre el error de cierre: 1 : 10,000 y así sucesivamente) y el área. Las líneas que no puede leer se listan con sus números de línea.
5. **Agregar la parcela**. Cuando los rumbos no cierran, la parcela se cierra con un tramo recto sobre la brecha: revise los rumbos contra la escritura. Para repartir el error de una poligonal de campo entre sus tramos, ajústela antes.

## Curvas

En las **Propiedades** de una parcela, cada tramo tiene un **Radio**. Escriba uno para convertir ese tramo en una curva entre las mismas dos esquinas (un radio menor que la mitad de la distancia entre las esquinas no puede alcanzarse, así que se rechaza), y elija **Derecha** o **Izquierda** en **Curvas**: una curva a la derecha tiene su centro a la derecha de la dirección de avance, como en una escritura. Borre el radio para volverla recta. Cada cambio es un paso: {{key:Mod+Z}} lo deshace.

## La descripción legal

Las **Propiedades** de una parcela terminan con su descripción legal, redactada a partir del dibujo:

- "Comienza en" el **Punto de inicio** que escriba (por ejemplo, "la esquina noreste del Lote 4"); si no escribe ninguno, se usa la coordenada norte y este de la primera esquina, o el punto de levantamiento desde el que empezaron los rumbos.
- "luego" cada tramo: un rumbo y una distancia, o una curva con su radio, longitud de arco, ángulo central, y rumbo y distancia de cuerda.
- "Contiene" su área en pies cuadrados y acres (metros cuadrados y hectáreas en un proyecto en metros).

**Copiar** la pone en el portapapeles; **Descargar como texto** la guarda como archivo `.txt`.

:::warning
La descripción legal es un borrador a partir del dibujo, no un levantamiento. Un topógrafo con licencia debe revisarla contra el registro y firmarla antes de que alguien dependa de ella.
:::

Haga clic dentro de una parcela en el plano para seleccionarla; {{key:Delete}} la elimina. Las parcelas se guardan en el archivo de proyecto.
