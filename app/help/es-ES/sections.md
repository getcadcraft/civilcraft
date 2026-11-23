---
title: Líneas de muestreo y secciones transversales
summary: Corte secciones perpendiculares a un trazado, vea el terreno, el proyecto y el desmonte y terraplén en cada P.K., y obtenga volúmenes por el método de áreas medias de extremos.
keywords: diagrama de masas, punto de equilibrio, contracción, esponjamiento, distancia de acarreo, préstamo, vertedero, hojas de secciones, hojas de secciones transversales, pdf de secciones, secciones, secciones transversales, líneas de muestreo, vista de sección, desmonte, terraplén, áreas, área media de extremos, volúmenes por áreas de extremos, movimiento de tierras, P.K., desplazamiento, CSV
from: 09639ce2
---

Una sección transversal muestra la carretera tal como se construirá: a través del trazado en un P.K., el terreno existente, el proyecto (el corredor o la plataforma ajustados) y el desmonte y terraplén entre ellos.

## Añadir líneas de muestreo

1. Seleccione un trazado. En **Propiedades**, en **Líneas de muestreo**, haga clic en {{ui:Añadir líneas de muestreo}}.
2. Fije **Cada** (la separación: 50 ft o 20 m al inicio), **Ancho izquierdo** y **Ancho derecho** (hasta dónde llega cada sección desde el eje).
3. Para cortar una sección en un P.K. concreto, escríbalo en **Añadir un P.K.** (por ejemplo `2+35`) y pulse {{key:Enter}}.

Las secciones se cortan en cada múltiplo entero de la separación, en ambos extremos del trazado, en el inicio y el final de cada curva (PC y PT), y en los P.K. que añada. Las líneas de muestreo se muestran en la planta como líneas grises que cruzan el trazado; también salen en DXF, DWG y PDF en la capa C-ROAD-SCTN. Cada cambio es un paso: {{key:Mod+Z}} lo deshace.

## La vista de sección

Ábrala con {{ui:Vista de sección}} en las **Propiedades** del trazado, {{ui:Secciones}} en **Superficie** › {{ui:Más}}, o con {{key:X}}. Ocupa el lugar de la vista de perfil bajo la planta.

- Recorra las secciones con las flechas de su barra, la lista de P.K., o con {{key:Left}} y {{key:Right}} con la vista de sección enfocada ({{key:Home}} y {{key:End}} para la primera y la última).
- La línea gris es el terreno existente, la roja el proyecto. El desmonte se sombrea en naranja, el terraplén en verde. Los puntos del corredor están marcados: CL (eje), EOP (borde de calzada), SH (arcén) y DL (encuentro con el terreno).
- La cabecera indica el P.K., las superficies de desmonte y terraplén de esta sección y la exageración vertical. **Ajustar** llena el panel; elija 1× para ver la sección a escala real.
- La línea gruesa en la planta indica qué sección está en pantalla.
- **Ampliar y desplazar:** la rueda amplía alrededor del puntero, y arrastrar mueve la vista. {{ui:Ajustar}} (o {{key:F}}, o un doble clic) vuelve a ajustar toda la sección.

## Medir en una sección

1. Haga clic en {{ui:Medir}} en la barra de sección, o pulse {{key:M}}. La pista dice «Haga clic en el primer punto y luego en el segundo».
2. Haga clic en dos puntos. Cada uno se ajusta al extremo de una línea o a un punto del corredor (CL, EOP, SH, DL); mantenga pulsado {{key:Alt}} para un punto libre.
3. La lectura da la distancia horizontal (ΔH), la distancia vertical (ΔV), la pendiente en porcentaje con su relación y la longitud recta, en las unidades del proyecto.

Haga clic de nuevo para empezar una medición nueva. {{key:Esc}} la borra, y {{key:M}} desactiva Medir.

## Hojas de secciones

{{ui:Hojas de secciones (PDF)}} en **Líneas de muestreo** coloca cada sección en páginas PDF, en filas de izquierda a derecha y de arriba abajo en orden de P.K. Elija el **Papel**, la **Escala en planta** (la escala horizontal de las secciones) y la **Exageración del perfil** (1×, 2×, 5× o 10×); el cuadro de diálogo indica cuántas secciones caben en una página y cuántas páginas resultan.

Cada sección muestra una cuadrícula con desplazamientos y cotas, el terreno (discontinuo), el proyecto, el desmonte y el terraplén sombreados (naranja y verde), los puntos del corredor, y debajo su P.K. y sus superficies de desmonte y terraplén. Todas las secciones de las hojas se dibujan del mismo tamaño, lo bastante altas para la más grande; cuando eso no cabe en la página con su exageración, CivilCraft usa la mayor que sí cabe y lo indica. La franja de título indica el trazado, los P.K. de esa página, las escalas y «Hoja 1 de 3».

## Hasta dónde se miden el desmonte y el terraplén

Un corredor puede tener capas bajo el pavimento: capas del firme, componentes de plantilla, pistas. El selector **Volúmenes medidos hasta**, en la barra de sección, elige hasta dónde llegan el desmonte y el terraplén:

- **Superficie inferior** (la opción inicial): hasta la base de esos componentes, de modo que el desmonte incluye el espesor del paquete del firme.
- **Superficie superior**: solo hasta la parte superior del proyecto, como antes de contar los componentes.

Las superficies de la cabecera, los volúmenes de abajo, el CSV y el diagrama de masas siguen todos esta elección, y se guarda con el proyecto.

## Volúmenes por áreas medias de extremos

Entre dos secciones vecinas, el volumen es la media de sus dos áreas por la distancia entre sus P.K. La barra muestra los totales del trazado, y {{ui:CSV}} descarga las áreas y los volúmenes de cada sección con totales acumulados (yardas cúbicas en proyectos en pies, metros cúbicos en los métricos).

**Propiedades** muestra los mismos totales junto a los volúmenes por el método de malla de [Volúmenes de movimiento de tierras](topic:volumes). Son aproximaciones distintas: las secciones más juntas las acercan, y en una carretera recta sobre terreno llano son iguales.

:::note
El desmonte y el terraplén solo se cuentan dentro de las áreas ajustadas (las líneas de encuentro con el terreno de un corredor o de una plataforma), como hace el método de malla. Sin corredor ni plataforma, el proyecto es el terreno, así que una sección no muestra desmonte ni terraplén.
:::

## Diagrama de masas

**Diagrama de masas** en **Líneas de muestreo** dibuja el diagrama de masas a partir de los mismos volúmenes de áreas de extremos: a lo largo de los P.K., el total acumulado de desmonte menos terraplén.

- **Contracción (−) o esponjamiento (+) del desmonte** indica qué produce una yarda cúbica de desmonte una vez colocada como terraplén: −10 % (el valor inicial, provisional) significa que se contrae a 0.9; una roca que esponja podría ser +5 %. Use la cifra de su informe geotécnico.
- Donde la línea sube, la carretera está en desmonte; donde baja, en terraplén. Por encima de cero (sombreado naranja) la tierra se mueve hacia arriba de P.K.; por debajo de cero (verde), hacia abajo de P.K.
- Los **puntos de equilibrio** son donde la línea cruza el cero: entre dos de ellos, el desmonte y el terraplén se equilibran. La tabla enumera cada tramo equilibrado, el volumen movido (su punto más alto o más bajo) y la distancia media de acarreo (el área sombreada dividida entre ese volumen).
- Donde la línea termina fuera de cero, lo que sobra es **excedente** (por encima) o **préstamo** (por debajo). En ese último tramo solo cuenta como movida la tierra que queda más allá del nivel en que termina.

**CSV** guarda la ordenada de masas en cada sección, los tramos y el factor.
