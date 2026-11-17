---
title: Consultar curvas de nivel, cotas y pendientes
summary: Defina el intervalo de curvas y las curvas maestras, muestre bandas de elevación, flechas de pendiente y triángulos, y lea las cotas del terreno bajo el puntero.
keywords: curvas de nivel, intervalo de curvas, curvas maestras, etiquetas, bandas de elevación, flechas de pendiente, triángulos, cota puntual, análisis de superficie, análisis de elevación, análisis de pendiente
from: 585e500a
---

La superficie se muestra con curvas de nivel en cuanto existe. Todo lo de este tema se configura en **Visualización** del panel izquierdo. Los ajustes de visualización solo cambian lo que ve (y lo que exporta); no son pasos de deshacer.

## Definir el intervalo de curvas de nivel

1. En **Visualización**, elija un valor en **Curvas cada**.
   - En pies: 0.25, 0.5, 1, 2, 5, 10 o 20 ft.
   - En metros: 0.1, 0.25, 0.5, 1, 2, 5 o 10 m.
2. Elija **Maestras cada**: la 2.ª, 4.ª, 5.ª o 10.ª curva.
   Las curvas maestras se dibujan más gruesas y se rotulan con su cota. Caen en múltiplos enteros del espaciado de maestras (con curvas de 1 ft y cada 5.ª maestra: 245, 250, 255 …).
3. Desactive {{ui:Etiquetas de curvas de nivel}} si las etiquetas saturan una parcela pequeña.

Un proyecto nuevo empieza con 1 unidad y cada 5.ª curva maestra. Las curvas se doblan en las líneas de ruptura; si cruzan en línea recta una línea de flujo o una cresta, esa línea todavía no es una línea de ruptura (véase [Construir y refinar la superficie](topic:build-surface)).

:::note
Las curvas solo se dibujan cuando hay no más de 2,000 niveles entre el punto más bajo y el más alto. En un emplazamiento con mucho relieve y un intervalo muy pequeño, el plano no muestra ninguna curva: elija un intervalo mayor.
:::

## Suavizar las curvas de nivel

Las curvas se trazan como tramos rectos, uno por cada triángulo de la superficie, así que giran en una pequeña esquina en cada arista de triángulo. **Suavizado de curvas de nivel** en **Visualización** redondea esas esquinas:

- **Ninguno (tramos rectos)**: las líneas trazadas tal cual. Es lo que muestra un dibujo nuevo o anterior.
- **Ligero**: esquinas algo redondeadas. Una línea nunca se desplaza más del 10 % del camino hacia la siguiente curva, y nunca se aleja de su tramo recto más de una sexta parte de la longitud de ese tramo.
- **Fuerte**: una curva fluida. Una línea nunca se desplaza más del 25 % del camino hacia la siguiente curva, y nunca se aleja de su tramo recto más de una tercera parte de la longitud de ese tramo.

Con cualquiera de las dos opciones, una curva suavizada sigue cruzando cada arista del triángulo en el mismo punto que la trazada, permanece dentro del triángulo que atraviesa cada tramo y, por tanto, nunca puede cruzarse ni tocar otra curva. Donde una curva cruza una línea de ruptura o el límite, conserva su quiebro agudo. Las líneas suavizadas son las que se trazan y exportan (DXF, DWG, PDF, GIS y 3D), con más vértices que las trazadas.

Suavizar solo cambia las líneas dibujadas. Las cotas, los volúmenes, los perfiles y las secciones se siguen leyendo de la propia superficie. Una curva que pasa exactamente por puntos topográficos (un punto a 250.00 en la curva de 250) conserva una pequeña esquina en cada uno de esos puntos.

## Cómo se genera la superficie que hay tras las curvas

Las curvas siguen la superficie, y la superficie sigue el **Método de curvas de nivel** en **Superficie** del panel izquierdo. El predeterminado, **Triangulación con interpolación lineal**, une sus puntos en triángulos y conserva exactamente cada punto y cada línea de ruptura. Los demás métodos ajustan primero una malla regular a los puntos (kriging, curvatura mínima, vecino natural, distancia inversa y otros), lo que da curvas más redondeadas entre puntos, pero no pasan exactamente por todos ellos; el informe de superficie bajo **Superficie** indica cuánto se aleja el resultado en sus puntos.

**ABOS (aproximación basada en suavizado)** es uno de los métodos por malla. Tiene dos ajustes propios: **Suavidad** (0.5 para empezar; cuanto menor, más suave) y **Precisión** (1 para empezar: la superficie se ajusta a menos del 1 % del rango de alturas del emplazamiento en sus puntos; escriba un número menor para un ajuste más cerrado). Si no puede alcanzar la precisión con la malla que tiene, el informe de superficie lo indica: escriba un **Espaciado de malla** menor.

## Leer una cota en cualquier punto

Mueva el puntero sobre el plano. La barra de estado muestra:

- **E** y **N** bajo el puntero
- **Terreno** y la cota del terreno natural allí, interpolada en el triángulo bajo el puntero
- **Rasante** y la cota proyectada, donde una plataforma o un corredor ha modificado el terreno
- "Fuera de la superficie" fuera de la superficie

Para leer un punto topográfico exactamente, elija {{ui:Seleccionar}} y haga clic en el punto: el panel derecho muestra su número, su coordenada este, su coordenada norte, su cota, su descripción y su grupo.

## Mostrar bandas de elevación

1. Marque {{ui:Bandas de elevación}}.
   La superficie se rellena con color desde lo bajo (verde azulado) hasta lo alto (ocre marrón). Una leyenda bajo las casillas indica el rango de elevación de cada banda.
2. Elija cuántas bandas en **Bandas**: 5, 8, 10 o 12. Las bandas dividen el rango desde la elevación más baja hasta la más alta en pasos iguales.

Las bandas son solo para consulta. No se exportan a DXF ni se imprimen en PDF.

## Mostrar flechas de pendiente

Marque {{ui:Flechas de pendiente}}. Una flecha corta en cada triángulo lo bastante grande para contenerla señala cuesta abajo. Los triángulos planos no tienen flecha. Las flechas sirven como comprobación rápida de la dirección del drenaje; el valor de la pendiente todavía no se rotula.

## Mostrar triángulos, puntos y aristas

- {{ui:Triángulos}} dibuja las aristas del TIN. Actívelo para comprobar cómo une la superficie los puntos, sobre todo a lo largo de las líneas de ruptura y en el exterior.
- {{ui:Puntos}} dibuja cada punto topográfico; {{ui:Etiquetas de puntos}} añade su número, su cota y su descripción (o con menos detalle: véase **Etiquetas de puntos** en [Configuración de CivilCraft](topic:settings)).
- {{ui:Líneas de ruptura}} dibuja las líneas de ruptura (y el límite) en naranja.
- {{ui:Borde de superficie}} dibuja el contorno de la superficie.

## Existente o proyectado

En cuanto una plataforma o un corredor modifica el terreno sin problemas, **Superficie** bajo **Visualización** ofrece {{ui:Proyecto (rasante)}}. Las curvas, las bandas y las flechas muestran entonces la superficie rasanteada, de modo que puede ver el nuevo terreno y las intersecciones con el terreno a su alrededor. Vuelva a {{ui:Terreno natural}} para ver el levantamiento.

## Qué se exporta

La salida DXF y PDF sigue estos ajustes: lo que haya desactivado no se escribe, y las curvas son las de la superficie mostrada. Las bandas de elevación nunca se exportan.
