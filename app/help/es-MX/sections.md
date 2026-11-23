---
title: Líneas de muestreo y secciones transversales
summary: Corte secciones en escuadra con una alineación, vea el terreno, el diseño y el corte y terraplén en cada estación, y obtenga volúmenes por áreas de extremo promedio.
keywords: diagrama de acarreo de masas, diagrama de masas, punto de equilibrio, contracción, expansión, distancia de acarreo, préstamo, desperdicio, hojas de secciones, hojas de secciones transversales, secciones PDF, secciones, secciones transversales, líneas de muestreo, vista de sección, corte, terraplén, áreas, área de extremo promedio, volúmenes por áreas de extremo, movimiento de tierras, estación, desfase, CSV
from: 09639ce2
---

Una sección transversal muestra la vía tal como se va a construir: a través de la alineación en una estación, el terreno existente, el diseño (la obra lineal o la plataforma ajustada) y el corte y terraplén entre ellos.

## Agregar líneas de muestreo

1. Seleccione una alineación. En **Propiedades**, bajo **Líneas de muestreo**, haga clic en {{ui:Agregar líneas de muestreo}}.
2. Defina **Cada** (el espaciamiento: 50 ft o 20 m al inicio), **Ancho izquierdo** y **Ancho derecho** (qué tanto se extiende cada sección desde el eje).
3. Para cortar una sección en una estación particular, escríbala en **Agregar una estación** (por ejemplo `2+35`) y pulse {{key:Enter}}.

Las secciones se cortan en cada múltiplo entero del espaciamiento, en ambos extremos de la alineación, al inicio y al final de cada curva (PC y PT), y en las estaciones que agregue. Las líneas de muestreo se ven en la planta como líneas grises que cruzan la alineación; también salen en DXF, DWG y PDF en la capa C-ROAD-SCTN. Cada cambio es un paso: {{key:Mod+Z}} lo deshace.

## La vista de sección

Ábrala con {{ui:Vista de sección}} en las **Propiedades** de la alineación, con {{ui:Secciones}} bajo **Superficie** › {{ui:Más}}, o con {{key:X}}. Ocupa el lugar de la vista de perfil bajo la planta.

- Recorra las secciones con las flechas de su barra, la lista de estaciones, o con {{key:Left}} y {{key:Right}} con la vista de sección activa ({{key:Home}} y {{key:End}} para la primera y la última).
- La línea gris es el terreno existente; la línea roja, el diseño. El corte se sombrea en naranja y el terraplén en verde. Los puntos de la obra lineal se marcan: CL (eje), EOP (borde de pavimento), SH (acotamiento) y DL (liga).
- El encabezado muestra la estación, las áreas de corte y terraplén de esta sección y la exageración vertical. **Ajustar** llena el panel; elija 1× para ver la sección a escala real.
- La línea gruesa en la planta muestra qué sección está en pantalla.
- **Acercar y desplazar:** la rueda acerca alrededor del puntero, y arrastrar mueve la vista. {{ui:Ajustar}} (o {{key:F}}, o un doble clic) ajusta otra vez toda la sección.

## Medir en una sección

1. Haga clic en {{ui:Medir}} en la barra de sección, o pulse {{key:M}}. La indicación dice "Haga clic en el primer punto y luego en el segundo".
2. Haga clic en dos puntos. Cada uno se ajusta al extremo de una línea o a un punto de la obra lineal (CL, EOP, SH, DL); mantenga {{key:Alt}} para un punto libre.
3. La lectura da la distancia horizontal (ΔH), la distancia vertical (ΔV), la pendiente en porcentaje con su relación, y la longitud recta, en las unidades del proyecto.

Haga clic otra vez para iniciar una nueva medición. {{key:Esc}} la borra, y {{key:M}} desactiva Medir.

## Hojas de secciones

{{ui:Hojas de secciones (PDF)}} bajo **Líneas de muestreo** coloca cada sección en páginas PDF, en filas de izquierda a derecha y de arriba abajo, en orden de estación. Elija el **Papel**, la **Escala en planta** (la escala horizontal de las secciones) y la **Exageración del perfil** (1×, 2×, 5× o 10×); el cuadro indica cuántas secciones caben en una página y cuántas páginas resultan.

Cada sección muestra una cuadrícula con desfases y elevaciones, el terreno (discontinuo), el diseño, el corte y el terraplén sombreados (naranja y verde), los puntos de la obra lineal, y debajo su estación y sus áreas de corte y terraplén. Todas las secciones de las hojas se dibujan del mismo tamaño, lo bastante altas para la más grande; cuando eso no cabe en la página con su exageración, CivilCraft usa la mayor que sí cabe y lo indica. La franja del título indica la alineación, las estaciones de esa página, las escalas y "Hoja 1 de 3".

## Hasta dónde se miden el corte y el terraplén

Una obra lineal puede tener capas bajo el pavimento: capas del pavimento, componentes de plantilla, camino de terracería. El selector **Volúmenes medidos hasta** en la barra de sección elige hasta dónde llegan el corte y el terraplén:

- **Superficie inferior** (la predeterminada): hasta la base de esos componentes, así que el corte incluye la profundidad de la estructura del pavimento.
- **Superficie superior**: solo hasta la parte superior del diseño, como antes de que se contaran los componentes.

Las áreas del encabezado, los volúmenes de abajo, el CSV y el acarreo de masas siguen esta elección, y se guarda con el proyecto.

## Volúmenes por áreas de extremo promedio

Entre dos secciones vecinas, el volumen es el promedio de sus dos áreas por la distancia entre sus estaciones. La barra muestra los totales de la alineación, y {{ui:CSV}} descarga las áreas y volúmenes de cada sección con totales acumulados (yardas cúbicas para proyectos en pies, metros cúbicos para los métricos).

**Propiedades** muestra los mismos totales junto a los volúmenes por método de malla de [Volúmenes de movimiento de tierras](topic:volumes). Los dos son aproximaciones distintas: secciones más cercanas los acercan, y en una vía recta sobre terreno plano son iguales.

:::note
El corte y el terraplén se cuentan solo dentro de las áreas niveladas (las líneas de liga de una obra lineal o de una plataforma), como lo hace el método de malla. Sin obra lineal ni plataforma, el diseño es el terreno, así que una sección no muestra corte ni terraplén.
:::

## Acarreo de masas

**Acarreo de masas** bajo **Líneas de muestreo** dibuja el diagrama de acarreo de masas a partir de los mismos volúmenes por áreas de extremo: a lo largo de las estaciones, el total acumulado de corte menos terraplén.

- **Contracción (−) o expansión (+) del corte** indica qué produce una yarda cúbica de corte una vez colocada como terraplén: −10 % (el valor inicial, provisional) significa que se contrae a 0.9; una roca que se expande podría ser +5 %. Use la cifra de su estudio geotécnico.
- Donde la línea sube, la vía está en corte; donde baja, en terraplén. Por encima de cero (sombreado naranja) la tierra se mueve hacia estaciones mayores; por debajo de cero (verde), hacia estaciones menores.
- Los **puntos de equilibrio** son donde la línea cruza cero: entre dos de ellos, el corte y el terraplén se equilibran. La tabla enumera cada tramo equilibrado, el volumen movido (su punto más alto o más bajo) y la distancia media de acarreo (el área sombreada dividida entre ese volumen).
- Donde la línea termina fuera de cero, lo que sobra es **desperdicio** (arriba) o **préstamo** (abajo). En ese último tramo solo cuenta como movida la tierra más allá del nivel en que termina.

**CSV** guarda la ordenada de masa en cada sección, los tramos y el factor.
