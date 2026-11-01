---
title: Plataformas de casa en terrenos inclinados
summary: Nivele una plataforma en una ladera: muros de contención como bordes, el mapa de corte y relleno sombreado por profundidad con cotas puntuales (plano y 3D), una sección dibujada donde quiera por el terreno y el diseño, y rampas o plataformas inclinadas para accesos de autos.
keywords: plataforma, casa, ladera, terreno inclinado, muro de contención, corte y relleno, mapa de corte y relleno, cotas puntuales, sección libre, línea de sección, planos para el municipio, acceso de autos, rampa, plataforma inclinada, pendiente, abundamiento, movimiento de tierras
from: daa08a3f
---

Una plataforma de casa es una **plataforma** (**Diseño** › **Plataforma**): un polígono plano a un solo nivel, nivelado contra el terreno. En una pendiente ayudan cuatro cosas.

## Muros de contención como bordes

Seleccione la plataforma y ponga un lado en **Vertical (muro de contención)** en lugar de un talud (**Propiedades** › **Lados y muros de contención**, o **Verticales: muros de contención** para todos los lados a la vez). La altura del muro se lee del terreno a lo largo de él: arriba al terreno, abajo a la plataforma, anotada en ambos extremos y en su punto más alto en el plano, con una advertencia cuando supera el límite que usted fije. Se pueden combinar muros y taludes lado a lado.

## El mapa de corte y relleno

Marque **Mapa de corte y relleno** en **Mostrar**. El plano se sombrea según la profundidad del corte o del relleno, en pasos iguales (el corte en tonos cálidos, el relleno azul, lo casi a nivel pálido) con una leyenda, y sobre la plataforma se imprimen **cotas puntuales**: el cambio de nivel en puntos de una cuadrícula, con el corte más profundo y el relleno más alto marcados con ▲. Las celdas son las mismas que usan los volúmenes de movimiento de tierras, así que el mapa y las cifras siempre coinciden.

En la vista 3D, elija **Corte y relleno** en la lista de colores para cubrir el terreno y el diseño con los mismos colores.

El factor de abundamiento o contracción está en la herramienta de curva masa (**Diseño** › **Curva masa**); no se aplica a los volúmenes de una plataforma.

## Una sección libre

En **Superficie** › **Más**, elija **Sección libre**, haga clic en los puntos de la línea de sección donde quiera (puede quebrarse) y pulse {{key:Enter}}. Un cuadro dibuja la sección: el terreno existente, el diseño nivelado (a rayas) y el corte y el relleno entre ellos, sombreados, con sus áreas (el diseño cuenta solo dentro de las plataformas y las vías). La **Exageración vertical** se ajusta al dibujo de entrada; **Guardar como SVG** y **Guardar como CSV** le dan un dibujo para el municipio y las cifras.

## Rampas y plataformas inclinadas

En **Superficie** › **Más**, elija **Rampa o plataforma inclinada**, haga clic en el extremo bajo y luego en el alto, pulse {{key:Enter}} y dé el ancho, el nivel en el extremo bajo y la pendiente. La plataforma es una franja cuyas esquinas llevan esos niveles (el borde entre dos esquinas va a pendiente constante) y se nivela contra el terreno como cualquier plataforma. Las esquinas de cualquier plataforma también pueden llevar niveles propios, así que un acceso de autos, una rampa o una terraza inclinada es una plataforma con un nivel en cada esquina.
