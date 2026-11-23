---
title: Líneas de muestra y secciones transversales
summary: Cortá secciones en escuadra con un trazado, mirá el terreno, el diseño y el corte y relleno en cada estación, y obtené volúmenes por el método de áreas extremas promedio.
keywords: diagrama de masas, diagrama de masa, punto de equilibrio, contracción, esponjamiento, distancia de acarreo, préstamo, escombrera, hojas de secciones, hojas de secciones transversales, secciones pdf, secciones, secciones transversales, líneas de muestra, vista de sección, corte, relleno, áreas, área extrema promedio, volúmenes de área extrema, movimiento de suelo, estación, desplazamiento, csv
from: 09639ce2
---

Una sección transversal muestra el camino tal como se va a construir: a través del trazado en una estación, el terreno existente, el diseño (el corredor o el pad nivelado) y el corte y relleno entre ambos.

## Agregar líneas de muestra

1. Seleccioná un trazado. En **Propiedades**, bajo **Líneas de muestra**, hacé clic en {{ui:Agregar líneas de muestra}}.
2. Fijá **Cada** (el espaciado: 50 ft o 20 m al inicio), **Ancho izquierdo** y **Ancho derecho** (hasta dónde llega cada sección desde el eje).
3. Para cortar una sección en una estación particular, escribila en **Agregar una estación** (por ejemplo `2+35`) y presioná {{key:Enter}}.

Las secciones se cortan en cada múltiplo entero del espaciado, en ambos extremos del trazado, en el inicio y el final de cada curva (PC y PT), y en las estaciones que agregues. Las líneas de muestra se ven en el plano como líneas grises que cruzan el trazado; también salen en DXF, DWG y PDF en la capa C-ROAD-SCTN. Cada cambio es un paso: {{key:Mod+Z}} lo deshace.

## La vista de sección

Abrila con {{ui:Vista de corte}} en las **Propiedades** del trazado, con {{ui:Cortes}} bajo **Superficie** › {{ui:Más}}, o con {{key:X}}. Ocupa el lugar de la vista de perfil debajo del plano.

- Recorré las secciones con las flechas de su barra, la lista de estaciones, o {{key:Left}} y {{key:Right}} con la vista de sección enfocada ({{key:Home}} y {{key:End}} para la primera y la última).
- La línea gris es el terreno existente, la línea roja el diseño. El corte se sombrea en naranja, el relleno en verde. Los puntos del corredor están marcados: CL (eje), EOP (borde del pavimento), SH (berma) y DL (línea de corte).
- El encabezado da la estación, las áreas de corte y relleno de esta sección y la exageración vertical. **Ajustar** llena el panel; elegí 1× para ver la sección a escala real.
- La línea gruesa en el plano muestra qué sección está en pantalla.
- **Zoom y desplazamiento:** la rueda hace zoom alrededor del puntero, y arrastrar mueve la vista. {{ui:Ajustar}} (o {{key:F}}, o un doble clic) vuelve a ajustar la sección completa.

## Medir en una sección

1. Hacé clic en {{ui:Medir}} en la barra de la sección, o presioná {{key:M}}. La pista dice "Hacé clic en el primer punto, luego en el segundo".
2. Hacé clic en dos puntos. Cada uno se ajusta al extremo de una línea o a un punto del corredor (CL, EOP, SH, DL); mantené {{key:Alt}} para un punto libre.
3. La lectura da la distancia horizontal (ΔH), la distancia vertical (ΔV), la pendiente en porcentaje con su relación y la longitud recta, en las unidades del proyecto.

Hacé clic otra vez para empezar una nueva medición. {{key:Esc}} la borra, y {{key:M}} apaga Medir.

## Hojas de secciones

{{ui:Hojas de secciones (PDF)}} bajo **Líneas de muestra** pone cada sección en páginas PDF, en filas de izquierda a derecha y de arriba hacia abajo, en orden de estación. Elegí el **Papel**, la **Escala del plano** (la escala horizontal de las secciones) y la **Exageración del perfil** (1×, 2×, 5× o 10×); el diálogo dice cuántas secciones entran en una página y cuántas páginas resultan.

Cada sección muestra una cuadrícula con desplazamientos y cotas, el terreno (en trazos), el diseño, el corte y el relleno sombreados (naranja y verde), los puntos del corredor, y debajo su estación y sus áreas de corte y relleno. Todas las secciones de las hojas se dibujan del mismo tamaño, lo bastante altas para la más grande; cuando eso no entra en la página con tu exageración, CivilCraft usa la más grande que entra y lo indica. La franja del título nombra el trazado, las estaciones de esa página, las escalas y "Hoja 1 de 3".

## A qué se miden el corte y el relleno

Un corredor puede tener capas bajo el pavimento: capas de pavimento, componentes de plantilla, pista. El **Volúmenes medidos hasta** de la barra de la sección elige hasta qué llegan el corte y el relleno:

- **Superficie inferior** (el inicio): hasta la base de esos componentes, de modo que el corte incluye el espesor de la estructura del pavimento.
- **Superficie superior**: solo hasta la parte superior del diseño, como antes de que se contaran los componentes.

Las áreas del encabezado, los volúmenes de abajo, el CSV y el diagrama de masas siguen esta elección, y se guarda con el proyecto.

## Volúmenes por áreas extremas promedio

Entre dos secciones vecinas, el volumen es el promedio de sus dos áreas multiplicado por la distancia entre sus estaciones. La barra muestra los totales del trazado, y {{ui:CSV}} descarga las áreas y volúmenes de cada sección con los totales acumulados (yardas cúbicas para proyectos en pies, metros cúbicos para los métricos).

**Propiedades** muestra los mismos totales junto a los volúmenes del método de cuadrícula de [Volúmenes de movimiento de suelo](topic:volumes). Los dos son aproximaciones distintas: secciones más cercanas los acercan, y en un camino recto sobre terreno plano son iguales.

:::note
El corte y el relleno se cuentan solo dentro de las áreas niveladas (las líneas de corte de un corredor o de un pad), como lo hace el método de cuadrícula. Sin corredor ni pad el diseño es el terreno, de modo que una sección no muestra corte ni relleno.
:::

## Diagrama de masas

**Diagrama de masas** bajo **Líneas de muestra** dibuja el diagrama de masas a partir de los mismos volúmenes de áreas extremas: a lo largo de las estaciones, el total acumulado de corte menos relleno.

- **Contracción (−) o esponjamiento (+) del corte** dice cuánto produce un yarda cúbica de corte cuando se coloca como relleno: −10 % (el valor inicial, provisorio) significa que se contrae a 0.9; una roca que esponja podría ser +5 %. Usá la cifra de tu informe geotécnico.
- Donde la línea sube, el camino está en corte; donde baja, en relleno. Por encima de cero (sombreado en naranja), la tierra se mueve hacia estaciones crecientes; por debajo de cero (verde), hacia estaciones decrecientes.
- **Puntos de equilibrio** son donde la línea cruza cero: entre dos de ellos el corte y el relleno se equilibran. La tabla lista cada tramo equilibrado, el volumen movido (su punto más alto o más bajo) y la distancia media de acarreo (el área sombreada dividida por ese volumen).
- Donde la línea termina fuera de cero, lo que sobra es **escombrera** (arriba) o **préstamo** (abajo). En ese último tramo solo cuenta como movida la tierra por encima del nivel en que termina.

**CSV** guarda la ordenada de masa en cada sección, los tramos y el factor.

