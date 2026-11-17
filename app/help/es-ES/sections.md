---
title: Líneas de muestreo y secciones transversales
summary: Corte secciones perpendiculares a una alineación, vea el terreno, el proyecto y el desmonte y terraplén en cada estación, y obtenga volúmenes por áreas medias.
keywords: diagrama de masas, punto de paso, esponjamiento, contracción, distancia de transporte, préstamo, excedente, hojas de secciones, hojas de secciones transversales, PDF de secciones, secciones, secciones transversales, líneas de muestreo, vista de sección, desmonte, terraplén, áreas, volúmenes por áreas medias, movimiento de tierras, estación, desplazamiento, csv
from: 5060173c
---

Una sección transversal muestra la carretera tal como se construirá: perpendicular a la alineación en una estación, el terreno existente, el proyecto (el corredor o la plataforma escalonada) y el desmonte y terraplén entre ambos.

## Añadir líneas de muestreo

1. Seleccione una alineación. En **Propiedades**, bajo **Líneas de muestreo**, haga clic en {{ui:Add sample lines}}.
2. Establezca **Cada** (la separación: 50 ft o 20 m para empezar), **Anchura izquierda** y **Anchura derecha** (hasta dónde llega cada sección desde el eje).
3. Para cortar una sección en una estación concreta, escríbala en **Añadir una estación** (por ejemplo `2+35`) y pulse {{key:Enter}}.

Las secciones se cortan en cada múltiplo exacto de la separación, en ambos extremos de la alineación, en el inicio y el final de cada curva (PC y PT), y en las estaciones que añada. Las líneas de muestreo se ven en la planta como líneas grises que cruzan la alineación; también salen en DXF, DWG y PDF en la capa C-ROAD-SCTN. Cada cambio es un paso: {{key:Mod+Z}} lo deshace.

## La vista de sección

Ábrala con {{ui:Section view}} en las **Propiedades** de la alineación, con {{ui:Sections}} bajo **Superficie** › {{ui:More}}, o con {{key:X}}. Ocupa el lugar de la vista de perfil bajo la planta.

- Recorra las secciones con las flechas de su barra, con la lista de estaciones, o con {{key:Left}} y {{key:Right}} cuando la vista de sección tiene el foco ({{key:Home}} y {{key:End}} para la primera y la última).
- La línea gris es el terreno existente, y la línea roja, el proyecto. El desmonte se sombrea en naranja y el terraplén en verde. Los puntos del corredor se marcan: CL (eje), EOP (borde de calzada), SH (arcén) y DL (línea de talud).
- La cabecera indica la estación, las áreas de desmonte y terraplén de esta sección y la exageración vertical. **Ajustar** llena el panel; elija 1× para ver la sección a escala real.
- La línea gruesa en la planta muestra qué sección está en pantalla.

## Hojas de secciones

{{ui:Section sheets (PDF)}} bajo **Líneas de muestreo** coloca cada sección en páginas PDF, en filas de izquierda a derecha y de arriba abajo, en orden de estaciones. Elija el **Papel**, la **Escala en planta** (la escala horizontal de las secciones) y la **Exageración del perfil** (1×, 2×, 5× o 10×); el cuadro de diálogo indica cuántas secciones caben en una página y cuántas páginas resultan.

Cada sección muestra una cuadrícula con desplazamientos y cotas, el terreno (discontinuo), el proyecto, el desmonte y el terraplén sombreados (naranja y verde), los puntos del corredor y, debajo, su estación y sus áreas de desmonte y terraplén. Todas las secciones de las hojas se dibujan del mismo tamaño, lo bastante altas para la mayor; cuando no cabe en la página con su exageración, CivilCraft usa la mayor que sí cabe y lo indica. La franja del título indica la alineación, las estaciones de esa página, las escalas y «Hoja 1 de 3».

## Volúmenes por áreas medias

Entre dos secciones vecinas, el volumen es la media de sus dos áreas por la distancia entre sus estaciones. La barra muestra los totales de la alineación, y {{ui:CSV}} descarga las áreas y los volúmenes de cada sección con sus totales acumulados (yardas cúbicas en proyectos en pies, metros cúbicos en los métricos).

**Propiedades** muestra los mismos totales junto a los volúmenes por el método de cuadrícula de [Volúmenes de movimiento de tierras](topic:volumes). Los dos son aproximaciones distintas: secciones más próximas los acercan, y en una carretera recta sobre terreno llano coinciden.

:::note
El desmonte y el terraplén se cuentan solo dentro de las zonas perfiladas (las líneas de talud de un corredor o de una plataforma), igual que en el método de cuadrícula. Sin corredor ni plataforma, el proyecto es el terreno, así que una sección no muestra desmonte ni terraplén.
:::

## Diagrama de masas

**Diagrama de masas** bajo **Líneas de muestreo** dibuja el diagrama de masas a partir de los mismos volúmenes por áreas medias: a lo largo de las estaciones, el total acumulado de desmonte menos terraplén.

- **Contracción (−) o esponjamiento (+) del desmonte** indica lo que ocupa una yarda cúbica de desmonte una vez colocada como terraplén: −10 % (el valor inicial, provisional) significa que se reduce a 0.9; una roca que esponja podría ser +5 %. Use la cifra de su informe geotécnico.
- Donde la línea sube, la carretera está en desmonte; donde baja, en terraplén. Por encima de cero (sombreado en naranja) la tierra se mueve aguas arriba; por debajo de cero (verde), aguas abajo.
- Los **puntos de paso** son donde la línea cruza el cero: entre dos de ellos, el desmonte y el terraplén se equilibran. La tabla enumera cada tramo equilibrado, el volumen movido (su punto más alto o más bajo) y la distancia media de transporte (el área sombreada dividida por ese volumen).
- Donde la línea termina fuera de cero, lo que sobra es **excedente** (por encima) o **préstamo** (por debajo). En ese último tramo solo cuenta como movida la tierra más allá del nivel en que termina.

**CSV** guarda la ordenada de masa en cada sección, los tramos y el factor de contracción.
