---
title: Plataformas para viviendas en terrenos en pendiente
summary: Nivelar una plataforma en la ladera: muros de contención como bordes de la plataforma, el mapa de corte y relleno sombreado por profundidad con niveles puntuales (plano y 3D), una sección trazada en cualquier lugar a través del terreno y el diseño, y rampas o plataformas en pendiente para entradas de vehículos.
keywords: plataforma, base, base de vivienda, terreno en pendiente, ladera, muro de contención, corte y relleno, mapa de corte y relleno, niveles puntuales, sección libre, línea de sección, planos municipales, entrada de vehículos, rampa, base en pendiente, nivelar, factor de esponjamiento, movimiento de tierras
from: daa08a3f
---

Una plataforma para vivienda es una **plataforma** (**Diseño** › {{ui:Pad}}): un polígono plano a un solo nivel, nivelado dentro del terreno. Cuatro cosas ayudan en una pendiente.

## Muros de contención como bordes de la plataforma

Selecciona la plataforma y pon un lado en {{ui:Vertical (retaining wall)}} en lugar de una pendiente (**Propiedades** › {{ui:Sides and retaining walls}}, o {{ui:Vertical: retaining walls}} para todos los lados a la vez). La altura del muro se lee del terreno a lo largo de él: tope en el terreno, base en la plataforma, se muestra en ambos extremos y en su punto más alto en el plano, con un aviso cuando es más alto que el límite que definiste. Los muros y las pendientes pueden combinarse uno al lado del otro.

## El mapa de corte y relleno

Marca {{ui:Cut and fill map}} en **Mostrar**. El plano se sombrea según la profundidad del corte o del relleno, en pasos iguales (corte cálido, relleno azul, casi nivel en tono pálido) con una leyenda, y los **niveles puntuales** se imprimen sobre la plataforma: el cambio de nivel en puntos de una cuadrícula, y el corte más profundo y el relleno más alto marcados con ▲. Las celdas son las mismas que usan los volúmenes de movimiento de tierra, así que el mapa y los números siempre coinciden.

En la vista 3D, elige **Corte y relleno** de la lista de colores para aplicar los mismos colores sobre el terreno y el diseño.

Un factor de esponjamiento o de contracción está en la herramienta de transporte de masa (**Diseño** › {{ui:Mass haul}}); no se aplica a los volúmenes de una plataforma.

## Una sección libre

En **Superficie** › {{ui:More}}, elige {{ui:Free section}}, haz clic en los puntos de la línea de sección en cualquier lugar (puede doblarse) y presiona {{key:Enter}}. Un diálogo dibuja la sección: el terreno existente, el diseño nivelado (a trazos) y el corte y relleno entre ambos, sombreados, con sus áreas (el diseño cuenta solo dentro de las plataformas y caminos). {{ui:Vertical exaggeration}} queda por defecto para ajustar el dibujo; {{ui:Save as SVG}} y {{ui:Save as CSV}} te dan un dibujo para el municipio y los números.

## Rampas y plataformas en pendiente

En **Superficie** › {{ui:More}}, elige {{ui:Ramp or sloped pad}}, haz clic en el extremo bajo y luego en el extremo alto, presiona {{key:Enter}}, y define el ancho, el nivel en el extremo bajo y la pendiente. La plataforma es una franja cuyas esquinas llevan esos niveles (el borde entre dos esquinas va a una pendiente constante), y se nivela dentro del terreno como cualquier plataforma. Las esquinas de cualquier plataforma también pueden llevar sus propios niveles, así que una entrada de vehículos, una rampa o una terraza inclinada es una plataforma con un nivel en cada esquina.
