---
title: Leer curvas de nivel, elevaciones y pendientes
summary: Defina la equidistancia de las curvas de nivel y las curvas maestras, muestre bandas de elevación, flechas de pendiente y triángulos, y lea las elevaciones del terreno bajo el cursor.
keywords: curvas de nivel, equidistancia de curvas de nivel, curvas maestras, etiquetas, bandas de elevación, flechas de pendiente, triángulos, cota puntual, análisis de superficie, análisis de elevación, análisis de pendiente
from: 585e500a
---

La superficie se muestra con curvas de nivel en cuanto existe. Todo lo de este tema se configura en **Visualización**, en el panel izquierdo. Los ajustes de visualización solo cambian lo que ve (y lo que exporta); no son pasos de deshacer.

## Defina la equidistancia de las curvas de nivel

1. En **Visualización**, elija un valor en **Curvas de nivel cada**.
   - En pies: 0.25, 0.5, 1, 2, 5, 10 o 20 ft.
   - En metros: 0.1, 0.25, 0.5, 1, 2, 5 o 10 m.
2. Elija **Curvas mayores cada**: la 2.ª, 4.ª, 5.ª o 10.ª curva.
   Las curvas mayores se dibujan más gruesas y se rotulan con su elevación. Caen en múltiplos exactos de la separación de las mayores (con curvas de 1 ft y cada 5.ª mayor: 245, 250, 255 …).
3. Desactive {{ui:Etiquetas de curvas de nivel}} si las etiquetas saturan un trazado pequeño.

Un proyecto nuevo empieza con 1 unidad y cada 5.ª curva como mayor. Las curvas se doblan en las líneas de ruptura; si cruzan en línea recta una línea de flujo o una cresta, esa línea todavía no es una línea de ruptura (vea [Construya y refine la superficie](topic:build-surface)).

:::note
Las curvas solo se dibujan cuando hay no más de 2,000 niveles entre el punto más bajo y el más alto. En un sitio con mucho relieve y una equidistancia muy pequeña, el plano no muestra ninguna curva: elija una equidistancia mayor.
:::

## Suavice las curvas de nivel

Las curvas se trazan como tramos rectos, uno por cada triángulo de la superficie, así que hacen una pequeña esquina en cada arista del triángulo. **Suavizado de curvas de nivel**, en **Visualización**, redondea esas esquinas:

- **Ninguno (tramos rectos)**: las líneas trazadas tal cual. Es lo que muestra un dibujo nuevo o anterior.
- **Ligero**: esquinas redondeadas un poco. Una línea nunca se desplaza más del 10 % del camino hacia la siguiente curva, y nunca se aleja de su tramo recto más de una sexta parte de la longitud de ese tramo.
- **Fuerte**: una curva fluida. Una línea nunca se desplaza más del 25 % del camino hacia la siguiente curva, y nunca se aleja de su tramo recto más de una tercera parte de la longitud de ese tramo.

Con cualquiera de las dos opciones, una curva suavizada sigue cruzando cada arista del triángulo en el mismo punto que la trazada, se mantiene dentro del triángulo que cruza cada tramo, y por eso nunca puede cruzar ni tocar otra curva. Donde una curva cruza una línea de ruptura o el límite, conserva su quiebre marcado. Las líneas suavizadas son las que se trazan y exportan (DXF, DWG, PDF, GIS y 3D), y tienen más vértices que las trazadas.

Suavizar solo cambia las líneas dibujadas. Las elevaciones, los volúmenes, los perfiles y las secciones se siguen leyendo de la propia superficie. Una curva que pasa exactamente por puntos topográficos (un punto a 250.00 sobre la curva 250) conserva una pequeña esquina en cada uno de esos puntos.

## Cómo se genera la superficie detrás de las curvas

Las curvas siguen a la superficie, y la superficie sigue el **Método de curvas de nivel**, en **Superficie** del panel izquierdo. El predeterminado, **Triangulación con interpolación lineal**, une sus puntos en triángulos y conserva exactamente cada punto y cada línea de ruptura. Los demás métodos ajustan primero una rejilla regular a los puntos (kriging, curvatura mínima, vecino natural, distancia inversa y otros), lo que da curvas más redondeadas entre puntos, pero no pasa exactamente por cada punto; el informe de superficie, en **Superficie**, indica qué tan lejos queda el resultado en sus puntos.

**ABOS (aproximación basada en suavizado)** es uno de los métodos de rejilla. Tiene dos ajustes propios: **Suavidad** (0.5 al inicio; cuanto menor, más suave) y **Precisión** (1 al inicio: la superficie se ajusta a menos del 1 % del intervalo de alturas del sitio en sus puntos; escriba un número menor para un ajuste más cercano). Si no puede alcanzar la precisión con la rejilla que tiene, el informe de superficie lo indica: escriba una **Separación de la rejilla** menor.

## Lea una elevación en cualquier lugar

Mueva el cursor sobre el plano. La barra de estado muestra:

- **E** y **N** bajo el cursor
- **Terreno** y la elevación del terreno natural ahí, interpolada en el triángulo bajo el cursor
- **Rasante** y la elevación proyectada, donde una plataforma o una obra lineal cambió el terreno
- "Fuera de la superficie" fuera de la superficie

Para leer exactamente un punto topográfico, elija {{ui:Seleccionar}} y haga clic en el punto: el panel derecho muestra su número, este, norte, elevación, descripción y grupo.

## Muestre bandas de elevación

1. Marque {{ui:Bandas de elevación}}.
   La superficie se rellena con color, de lo bajo (verde azulado) a lo alto (ocre café). Una leyenda bajo las casillas enumera el rango de elevación de cada banda.
2. Elija cuántas bandas en **Bandas**: 5, 8, 10 o 12. Las bandas dividen el rango, desde la elevación más baja hasta la más alta, en pasos iguales.

Las bandas son solo para visualizar. No se exportan a DXF ni se trazan en PDF.

## Muestre flechas de pendiente

Marque {{ui:Flechas de pendiente}}. Una flecha corta en cada triángulo lo bastante grande para contenerla apunta cuesta abajo. Los triángulos planos no tienen flecha. Las flechas sirven para revisar rápidamente la dirección del drenaje; el valor de la pendiente todavía no se rotula.

## Muestre triángulos, puntos y aristas

- {{ui:Triángulos}} dibuja las aristas del TIN. Actívelo para revisar cómo une la superficie los puntos, sobre todo a lo largo de las líneas de ruptura y en el exterior.
- {{ui:Puntos}} dibuja cada punto topográfico; {{ui:Etiquetas de puntos}} agrega su número, elevación y descripción (o menos: vea **Etiquetas de puntos** en [Configuración de CivilCraft](topic:settings)).
- {{ui:Líneas de ruptura}} dibuja las líneas de ruptura (y el límite) en naranja.
- {{ui:Borde de superficie}} dibuja el contorno de la superficie.

## Existente o proyectada

Cuando una plataforma o una obra lineal se rasante sin problemas, **Superficie** en **Visualización** ofrece {{ui:Proyecto (rasante)}}. Las curvas, las bandas y las flechas muestran entonces la superficie rasante, para que vea el terreno nuevo y el empate a su alrededor. Cambie de nuevo a {{ui:Terreno natural}} para ver el levantamiento.

## Qué se exporta

La salida DXF y PDF sigue estos ajustes: lo que desactivó no se escribe, y las curvas son las de la superficie mostrada. Las bandas de elevación nunca se exportan.
