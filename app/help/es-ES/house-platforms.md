---
title: Plataformas para viviendas en terrenos en pendiente
summary: Explanar una plataforma en una ladera: muros de contención como bordes de la plataforma, el mapa de desmonte y terraplén sombreado según su profundidad con cotas puntuales (plano y 3D), una sección trazada en cualquier punto a través del terreno y del diseño, y rampas o plataformas inclinadas para accesos de vehículos.
keywords: plataforma, plataforma para vivienda, terreno en pendiente, ladera, muro de contención, desmonte y terraplén, mapa de desmonte y terraplén, cotas puntuales, sección libre, línea de sección, planos para el ayuntamiento, acceso de vehículos, rampa, plataforma inclinada, explanar, factor de esponjamiento, movimiento de tierras
from: daa08a3f
---

Una plataforma para vivienda es una **plataforma** (**Diseño** › {{ui:Pad}}): un polígono plano a una sola cota, explanado en el terreno. Cuatro herramientas ayudan en una pendiente.

## Muros de contención como bordes de la plataforma

Seleccione la plataforma y ponga un lado en {{ui:Vertical (retaining wall)}} en lugar de una pendiente (**Propiedades** › {{ui:Sides and retaining walls}}, o {{ui:Vertical: retaining walls}} para todos los lados a la vez). La altura del muro se lee del terreno a lo largo de él: coronación en el terreno, base en la plataforma, indicada en ambos extremos y en su punto más alto en el plano, con una advertencia cuando supera el límite que haya fijado. Muros y pendientes pueden combinarse uno junto a otro.

## El mapa de desmonte y terraplén

Marque {{ui:Cut and fill map}} en **Mostrar**. El plano se sombrea según la profundidad del desmonte o del terraplén, en pasos iguales (desmonte en tonos cálidos, terraplén en azul, casi nivel en tono pálido), con una leyenda, y las **cotas puntuales** se imprimen en la plataforma: la variación de cota en puntos de una cuadrícula, y el desmonte más profundo y el terraplén más alto marcados con ▲. Las celdas son las mismas que usan los volúmenes de movimiento de tierras, de modo que el mapa y las cifras siempre coinciden.

En la vista 3D, elija **Desmonte y terraplén** en la lista de colores para superponer los mismos colores sobre el terreno y el diseño.

Un factor de esponjamiento o de compactación se fija en la herramienta de curva masa (**Diseño** › {{ui:Mass haul}}); no se aplica a los volúmenes de una plataforma.

## Una sección libre

En **Superficie** › {{ui:More}}, elija {{ui:Free section}}, haga clic en los puntos de la línea de sección en cualquier lugar (puede doblarse) y pulse {{key:Enter}}. Un diálogo dibuja la sección: el terreno existente, el diseño explanado (discontinuo) y el desmonte y terraplén entre ambos, sombreados, con sus áreas (el diseño cuenta solo dentro de las plataformas y los viales). {{ui:Vertical exaggeration}} se ajusta por defecto al dibujo; {{ui:Save as SVG}} y {{ui:Save as CSV}} le dan un dibujo para el ayuntamiento y las cifras.

## Rampas y plataformas inclinadas

En **Superficie** › {{ui:More}}, elija {{ui:Ramp or sloped pad}}, haga clic en el extremo bajo y luego en el alto, pulse {{key:Enter}} e indique la anchura, la cota en el extremo bajo y la pendiente. La plataforma es una franja cuyas esquinas llevan esas cotas (el borde entre dos esquinas va a pendiente constante), y se explana en el terreno como cualquier plataforma. Las esquinas de cualquier plataforma también pueden llevar sus propias cotas, así que un acceso de vehículos, una rampa o una terraza inclinada es una plataforma con una cota en cada esquina.
