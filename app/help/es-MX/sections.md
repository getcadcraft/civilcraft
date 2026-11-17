---
title: Líneas de muestreo y secciones transversales
summary: Corte secciones perpendiculares a una alineación, vea el terreno, el proyecto y el corte y terraplén en cada estación, y obtenga volúmenes por el método de áreas medias extremas.
keywords: diagrama de masas, punto de equilibrio, contracción, esponjamiento, distancia de acarreo, préstamo, desperdicio, hojas de secciones, hojas de secciones transversales, secciones pdf, secciones, secciones transversales, líneas de muestreo, vista de sección, corte, terraplén, áreas, áreas medias extremas, volúmenes de áreas extremas, movimiento de tierras, estación, desfase, csv
from: 5060173c
---

Una sección transversal muestra la carretera tal como se construirá: transversal a la alineación en una estación, el terreno existente, el proyecto (la obra lineal o la plataforma ya niveladas) y el corte y terraplén entre ellos.

## Agregar líneas de muestreo

1. Seleccione una alineación. En **Propiedades**, bajo **Líneas de muestreo**, haga clic en {{ui:Agregar líneas de muestreo}}.
2. Defina **Cada** (el espaciado: 50 ft o 20 m para empezar), el **Ancho izquierdo** y el **Ancho derecho** (hasta dónde llega cada sección desde el eje).
3. Para cortar una sección en una estación concreta, escríbala en **Agregar una estación** (por ejemplo `2+35`) y pulse {{key:Enter}}.

Las secciones se cortan en cada múltiplo exacto del espaciado, en ambos extremos de la alineación, al inicio y al final de cada curva (PC y PT), y en las estaciones que agregue. Las líneas de muestreo se ven en la planta como líneas grises que cruzan la alineación; también salen en DXF, DWG y PDF en la capa C-ROAD-SCTN. Cada cambio es un paso: {{key:Mod+Z}} lo deshace.

## La vista de sección

Ábrala con {{ui:Vista de sección}} en las **Propiedades** de la alineación, con {{ui:Secciones}} en **Superficie** › {{ui:Más}}, o con {{key:X}}. Ocupa el lugar de la vista de perfil bajo la planta.

- Recorra las secciones con las flechas de su barra, la lista de estaciones, o con {{key:Left}} y {{key:Right}} con la vista de sección activa ({{key:Home}} y {{key:End}} para la primera y la última).
- La línea gris es el terreno existente, la roja el proyecto. El corte se sombrea en naranja y el terraplén en verde. Los puntos de la obra lineal se marcan: CL (eje), EOP (borde de pavimento), SH (acotamiento) y DL (línea de liberación).
- El encabezado muestra la estación, las áreas de corte y terraplén de esta sección y la exageración vertical. **Ajustar** llena el panel; elija 1× para ver la sección a escala real.
- La línea gruesa en la planta muestra qué sección está en pantalla.

## Hojas de secciones

{{ui:Hojas de secciones (PDF)}} en **Líneas de muestreo** coloca cada sección en páginas PDF, en filas de izquierda a derecha y de arriba abajo en orden de estación. Elija el **Papel**, la **Escala en planta** (la escala horizontal de las secciones) y la **Exageración del perfil** (1×, 2×, 5× o 10×); el cuadro indica cuántas secciones caben en una página y cuántas páginas resultan.

Cada sección muestra una cuadrícula con desfases y elevaciones, el terreno (discontinuo), el proyecto, el corte y el terraplén sombreados (naranja y verde), los puntos de la obra lineal, y debajo su estación y sus áreas de corte y terraplén. Todas las secciones de las hojas se dibujan del mismo tamaño, lo bastante altas para la mayor; cuando eso no cabe en la página con su exageración, CivilCraft usa la mayor que sí cabe y lo indica. La franja del título indica la alineación, las estaciones de esa página, las escalas y "Hoja 1 de 3".

## Volúmenes por áreas medias extremas

Entre dos secciones vecinas, el volumen es el promedio de sus dos áreas por la distancia entre sus estaciones. La barra muestra los totales de la alineación, y {{ui:CSV}} descarga las áreas y los volúmenes de cada sección con los totales acumulados (yardas cúbicas en proyectos en pies, metros cúbicos en proyectos métricos).

Las **Propiedades** muestran los mismos totales junto a los volúmenes por método de cuadrícula de [Volúmenes de movimiento de tierras](topic:volumes). Ambos son aproximaciones distintas: secciones más cercanas los acercan, y en una carretera recta sobre terreno plano son iguales.

:::note
El corte y el terraplén se cuentan solo dentro de las áreas proyectadas (las líneas de liberación de una obra lineal o de una plataforma), como lo hace el método de cuadrícula. Sin obra lineal ni plataforma, el proyecto es el terreno, así que una sección no muestra corte ni terraplén.
:::

## Acarreo masivo

**Acarreo masivo** en **Líneas de muestreo** dibuja el diagrama de acarreo masivo a partir de los mismos volúmenes de áreas extremas: a lo largo de las estaciones, el total acumulado de corte menos terraplén.

- **Contracción (−) o esponjamiento (+) del corte** indica lo que rinde una yarda cúbica de corte una vez colocada como terraplén: −10 % (valor inicial, de referencia) significa que se contrae a 0.9; una roca que esponja podría ser +5 %. Use la cifra de su estudio geotécnico.
- Donde la línea sube, la carretera está en corte; donde baja, en terraplén. Por encima de cero (sombreado naranja) la tierra se mueve hacia estaciones mayores; por debajo de cero (verde), hacia estaciones menores.
- Los **puntos de equilibrio** son donde la línea cruza cero: entre dos de ellos el corte y el terraplén se equilibran. La tabla enumera cada tramo equilibrado, el volumen movido (su punto más alto o más bajo) y la distancia media de acarreo (el área sombreada dividida entre ese volumen).
- Donde la línea termina fuera de cero, lo sobrante es **desperdicio** (arriba) o **préstamo** (abajo). En ese último tramo solo cuenta como movida la tierra más allá del nivel en que termina.

**CSV** guarda la ordenada de masa en cada sección, los tramos y el factor.
