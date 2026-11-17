---
title: Líneas de muestra y secciones transversales
summary: Cortar secciones perpendiculares a un trazado, ver el terreno, el diseño y el corte y terraplén en cada estación, y obtener volúmenes por áreas medias.
keywords: diagrama de masas, curva de masas, punto de equilibrio, contracción, expansión, distancia de acarreo, préstamo, desperdicio, hojas de secciones, hojas de secciones transversales, pdf de secciones, secciones, secciones transversales, líneas de muestra, vista de sección, corte, terraplén, áreas, volúmenes por área media, movimiento de suelos, estación, desplazamiento, csv
from: 5060173c
---

Una sección transversal muestra la ruta tal como se va a construir: a través del trazado en una estación, el terreno existente, el diseño (el corredor o la plataforma graduados) y el corte y el terraplén entre ellos.

## Agregar líneas de muestra

1. Seleccioná un trazado. En **Propiedades**, bajo **Líneas de muestra**, hacé clic en {{ui:Agregar líneas de muestra}}.
2. Fijá **Cada** (la separación: 50 ft o 20 m para empezar), **Ancho izquierdo** y **Ancho derecho** (cuánto se extiende cada sección desde el eje).
3. Para cortar una sección en una estación particular, escribila en **Agregar una estación** (por ejemplo `2+35`) y presioná {{key:Enter}}.

Las secciones se cortan en cada múltiplo exacto de la separación, en ambos extremos del trazado, al inicio y al final de cada curva (PC y PT), y en las estaciones que agregues. Las líneas de muestra se ven en el plano como líneas grises atravesando el trazado; también salen en DXF, DWG y PDF, en la capa C-ROAD-SCTN. Cada cambio es un paso: {{key:Mod+Z}} lo deshace.

## La vista de sección

Ábrela con {{ui:Vista de sección}} en las **Propiedades** del trazado, con {{ui:Secciones}} bajo **Superficie** › {{ui:Más}}, o con {{key:X}}. Ocupa el lugar de la vista de perfil debajo del plano.

- Recorré las secciones con las flechas de su barra, la lista de estaciones, o con {{key:Left}} y {{key:Right}} cuando la vista de sección tiene el foco ({{key:Home}} y {{key:End}} para la primera y la última).
- La línea gris es el terreno existente, la línea roja el diseño. El corte se sombrea en naranja, el terraplén en verde. Los puntos del corredor están marcados: CL (eje), EOP (borde de calzada), SH (berma) y DL (línea de terreno).
- El encabezado muestra la estación, las áreas de corte y terraplén de esta sección y la exageración vertical. **Ajustar** llena el panel; elegí 1× para ver la sección a escala real.
- La línea gruesa del plano muestra qué sección está en pantalla.

## Hojas de secciones

{{ui:Hojas de secciones (PDF)}} bajo **Líneas de muestra** pone cada sección en páginas PDF, en filas de izquierda a derecha y de arriba abajo en orden de estaciones. Elegí el **Papel**, la **Escala del plano** (la escala horizontal de las secciones) y la **Exageración del perfil** (1×, 2×, 5× o 10×); el diálogo dice cuántas secciones entran en una página y cuántas páginas resultan.

Cada sección muestra una cuadrícula con desplazamientos y cotas, el terreno (de trazos), el diseño, el corte y el terraplén sombreados (naranja y verde), los puntos del corredor, y debajo su estación y sus áreas de corte y terraplén. Todas las secciones de las hojas se dibujan del mismo tamaño, lo bastante altas para la más grande; cuando eso no entra en la página con tu exageración, CivilCraft usa la más grande que sí entra y lo dice. La franja del título nombra el trazado, las estaciones de esa página, las escalas y "Hoja 1 de 3".

## Volúmenes por áreas medias

Entre dos secciones vecinas, el volumen es el promedio de sus dos áreas por la distancia entre sus estaciones. La barra muestra los totales del trazado, y {{ui:CSV}} descarga las áreas y los volúmenes de cada sección con los totales acumulados (yardas cúbicas para proyectos en pies, metros cúbicos para los métricos).

**Propiedades** muestra los mismos totales junto a los volúmenes por el método de cuadrícula de [Volúmenes de movimiento de suelo](topic:volumes). Los dos son aproximaciones distintas: las secciones más cercanas los acercan, y en una ruta recta sobre terreno plano son iguales.

:::note
El corte y el terraplén se cuentan solo dentro de las áreas graduadas (las líneas de terreno de un corredor o una plataforma), como en el método de cuadrícula. Sin corredor ni plataforma el diseño es el terreno, así que una sección no muestra corte ni terraplén.
:::

## Diagrama de masas

**Diagrama de masas** bajo **Líneas de muestra** dibuja el diagrama de masas a partir de los mismos volúmenes por áreas medias: a lo largo de las estaciones, el total acumulado del corte menos el terraplén.

- **Contracción (−) o expansión (+) del corte** dice qué produce una yarda cúbica de corte una vez colocada como terraplén: −10 % (el valor de partida, un marcador de posición) significa que se contrae a 0,9; una roca que se expande podría ser +5 %. Usá la cifra de tu informe geotécnico.
- Donde la línea sube, la ruta está en corte; donde baja, en terraplén. Por encima de cero (sombreado naranja) la tierra se mueve hacia estaciones crecientes; por debajo de cero (verde), hacia estaciones decrecientes.
- Los **puntos de equilibrio** son donde la línea cruza cero: entre dos de ellos el corte y el terraplén se equilibran. La tabla lista cada tramo equilibrado, el volumen movido (su punto más alto o más bajo) y la distancia media de acarreo (el área sombreada dividida por ese volumen).
- Donde la línea termina fuera de cero, lo que sobra es **desperdicio** (arriba) o **préstamo** (abajo). En ese último tramo solo cuenta como movido el terreno más allá del nivel en que termina.

**CSV** guarda la ordenada de masa en cada sección, los tramos y el factor.
