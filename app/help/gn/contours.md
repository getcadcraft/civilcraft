---
title: Leer curvas de nivel, cotas y pendientes
summary: Fijar el intervalo de curvas y las curvas maestras, mostrar bandas de cota, flechas de pendiente y triángulos, y leer las cotas del terreno bajo el puntero.
keywords: curvas de nivel, intervalo de curvas, curvas maestras, rótulos, bandas de cota, flechas de pendiente, triángulos, cota puntual, análisis de superficie, análisis de cotas, análisis de pendiente
from: 585e500a
---

La superficie se muestra con curvas de nivel en cuanto existe. Todo lo de este tema se configura en **Visualización** en el panel izquierdo. Los ajustes de visualización cambian solo lo que ves (y lo que se exporta); no son pasos de deshacer.

## Fijar el intervalo de curvas

1. Bajo **Visualización**, elegí un valor en **Curvas cada**.
   - En pies: 0.25, 0.5, 1, 2, 5, 10 térã 20 ft.
   - En metros: 0.1, 0.25, 0.5, 1, 2, 5 térã 10 m.
2. Elegí **Maestras cada**: la curva 2.ª, 4.ª, 5.ª térã 10.ª.
   Las curvas maestras se dibujan más gruesas y se rotulan con su cota. Caen en múltiplos enteros del espaciado maestro (con curvas de 1 ft y cada 5.ª maestra: 245, 250, 255 …).
3. Apagá {{ui:Rótulos de curvas de nivel}} si los rótulos se amontonan en un plano chico.

Un proyecto nuevo empieza con 1 unidad y cada 5.ª curva maestra. Las curvas se doblan en las líneas de quiebre; si cortan en línea recta una línea de flujo o una cresta, esa línea todavía no es una línea de quiebre (ver [Construir y refinar la superficie](topic:build-surface)).

:::note
Las curvas se dibujan solo cuando hay no más de 2 000 niveles entre el punto más bajo y el más alto. En un sitio con mucho relieve y un intervalo muy chico, el plano no muestra ninguna curva: elegí un intervalo mayor.
:::

## Suavizar las curvas

Las curvas se trazan como segmentos rectos, uno por cada triángulo de la superficie, así que doblan un pequeño ángulo en cada borde de triángulo. **Suavizado de curvas** bajo **Visualización** redondea esos ángulos:

- **Ninguno (segmentos rectos)**: las líneas trazadas tal como son. Es lo que muestra un dibujo nuevo o anterior.
- **Liviano**: ángulos apenas redondeados. Una línea nunca se mueve más del 10 % del camino hacia la siguiente curva, y nunca se aleja de su segmento recto más de un sexto de la longitud de ese segmento.
- **Fuerte**: una curva fluida. Una línea nunca se mueve más del 25 % del camino hacia la siguiente curva, y nunca se aleja de su segmento recto más de un tercio de la longitud de ese segmento.

Con cualquiera de las dos opciones, una curva suavizada sigue cruzando cada borde de triángulo en el mismo punto que la trazada, se mantiene dentro del triángulo que cruza cada tramo, y así nunca puede cruzar ni tocar otra curva. Donde una curva cruza una línea de quiebre o el límite, conserva su quiebre marcado. Las líneas suavizadas son las que se dibujan y exportan (DXF, DWG, PDF, GIS y 3D), con más vértices que las trazadas.

El suavizado cambia solo las líneas dibujadas. Las cotas, volúmenes, perfiles y cortes se siguen leyendo de la propia superficie. Una curva que pasa exactamente por puntos de relevamiento (un punto de 250.00 en la curva 250) conserva un pequeño ángulo en cada uno de esos puntos.

## Cómo se hace la superficie detrás de las curvas

Las curvas siguen a la superficie, y la superficie sigue al **Método de curvas** bajo **Superficie** en el panel izquierdo. El predeterminado, **Triangulación con interpolación lineal**, une tus puntos en triángulos y conserva exactamente cada punto y cada línea de quiebre. Los otros métodos ajustan primero una grilla regular a los puntos (kriging, curvatura mínima, vecino natural, distancia inversa y otros), lo que da curvas más redondeadas entre puntos pero no pasa exactamente por cada punto; el informe de superficie bajo **Superficie** indica cuánto se desvía el resultado en tus puntos.

**ABOS (aproximación basada en suavizado)** es uno de los métodos de grilla. Tiene dos ajustes propios: **Suavidad** (0.5 para empezar; cuanto menor, más suave) y **Precisión** (1 para empezar: la superficie se lleva a menos del 1 % del rango de alturas del sitio en tus puntos; escribí un número menor para un ajuste más cercano). Si no puede alcanzar la precisión con la grilla que tiene, el informe de superficie lo indica: escribí una **Separación de la grilla** menor.

## Leer una cota en cualquier lugar

Pasá el puntero sobre el plano. La barra de estado muestra:

- **E** y **N** bajo el puntero
- **Terreno** y la cota del terreno existente allí, interpolada en el triángulo bajo el puntero
- **Con pendientes** y la cota propuesta, donde una plataforma o un corredor cambió el terreno
- "Fuera de la superficie" fuera de la superficie

Para leer un punto de relevamiento con exactitud, elegí {{ui:Seleccionar}} y hacé clic en el punto: el panel derecho muestra su número, este, norte, cota, descripción y grupo.

## Ehechauka bandas de cota

1. Marcá {{ui:Bandas de cota}}.
   La superficie se rellena con color desde lo bajo (verde azulado) hasta lo alto (ocre marrón). Una leyenda bajo las casillas lista el rango de cota de cada banda.
2. Elegí cuántas bandas en **Bandas**: 5, 8, 10 térã 12. Las bandas dividen el rango desde la cota más baja hasta la más alta en pasos iguales.

Las bandas son solo para mirar. No se exportan a DXF ni se imprimen en PDF.

## Ehechauka flechas de pendiente

Marcá {{ui:Flechas de pendiente}}. Una flecha corta en cada triángulo lo bastante grande para contener una indica cuesta abajo. Los triángulos planos no tienen flecha. Las flechas sirven para una verificación rápida de la dirección del drenaje; el valor de la pendiente todavía no se rotula.

## Ehechauka triángulos, puntos y bordes

- {{ui:Triángulos}} dibuja los bordes del TIN. Activalo para revisar cómo la superficie une los puntos, sobre todo a lo largo de las líneas de quiebre y en el exterior.
- {{ui:Puntos}} dibuja cada punto de relevamiento; {{ui:Rótulos de puntos}} agrega su número, cota y descripción (o menos: ver **Rótulos de puntos** en [Configuración de CivilCraft](topic:settings)).
- {{ui:Líneas de quiebre}} dibuja las líneas de quiebre (y el límite) en naranja.
- {{ui:Borde de la superficie}} dibuja el contorno de la superficie.

## Existente o propuesto

Una vez que una plataforma o un corredor nivela sin problemas, **Superficie** bajo **Visualización** ofrece {{ui:Propuesto (con pendientes)}}. Entonces las curvas, bandas y flechas muestran la superficie nivelada, para que veas el terreno nuevo y la línea de empate alrededor. Volvé a {{ui:Terreno existente}} para ver el relevamiento.

## Qué se exporta

La salida DXF y PDF sigue estos ajustes: lo que apagaste no se escribe, y las curvas son las de la superficie que se muestra. Las bandas de cota nunca se exportan.
