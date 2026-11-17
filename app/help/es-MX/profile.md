---
title: Diseñar un perfil vertical
summary: Abra la vista de perfil, inicie un perfil de diseño desde el terreno, agregue y arrastre PIV, defina longitudes de curvas verticales, y lea pendientes, valores K y puntos altos y bajos.
keywords: perfil, alineación vertical, piv, curva vertical, pendiente, valor k, cresta, cóncava, bvc, evc, vista de perfil, rasante, fg, perfil del terreno existente, líneas características en el perfil, cruces, proyectado, guarnición, cuneta, etiquetas
from: e9182bfa
---

Cada alineación tiene un perfil de diseño: una lista de PIV (estación y elevación) unidos por pendientes rectas, con una curva vertical parabólica simétrica en cualquier PIV interior que tenga longitud. El perfil del terreno existente se muestrea de la superficie por usted.

## Abrir la vista de perfil

1. Seleccione la alineación (haga clic en ella con {{ui:Seleccionar}}).
2. Presione {{key:R}}, o haga clic en {{ui:Perfil}} en la barra de herramientas, o en {{ui:Vista de perfil}} al pie del panel derecho.
   La vista de perfil se abre bajo la planta, con el terreno existente a lo largo de la alineación. Con dos o más alineaciones, elija una en la lista a la izquierda de la barra del perfil.

La vista siempre muestra la alineación completa y estira las elevaciones para llenar el panel; la exageración se imprime en la esquina inferior izquierda, por ejemplo «Exageración vertical 10×». No hace zoom ni encuadre.

Mueva el puntero a lo largo del perfil: la barra muestra la estación, las elevaciones del terreno y de diseño, la pendiente y el corte o relleno en ese punto, y un punto sigue sobre la alineación en la planta.

## Iniciar el perfil de diseño

1. En el panel derecho, bajo **Perfil de diseño**, haga clic en {{ui:Iniciar desde el terreno}}.
   Se colocan dos PIV sobre el terreno en los dos extremos de la alineación, unidos por una pendiente recta. La barra de estado dice «Perfil de diseño iniciado en el terreno en ambos extremos. Active Agregar PIV y haga clic para agregar quiebres de pendiente; asigne una longitud de curva en la tabla.»

Si la alineación no cruza la superficie, aparece «Esta alineación no tiene terreno debajo desde el cual iniciar.» En ese caso, agregue PIV haciendo clic (siguiente sección).

## Agregar PIV

1. Presione {{key:I}}, o haga clic en {{ui:Agregar PIV}} en la barra del perfil. Queda presionado.
2. Haga clic en el perfil donde quiera un quiebre de pendiente. Se agrega un PIV en esa estación y elevación, redondeado a 0.01, y queda seleccionado.
3. Agregue tantos como necesite y luego presione {{key:I}} otra vez para dejar de agregar.

Un clic donde ya hay un PIV se rechaza («Ya existe un PIV en …»). Los PIV siempre se mantienen en orden de estación.

## Ajustar PIV

- **Arrastre** un PIV en el perfil para moverlo. No puede pasar a sus vecinos. El movimiento es un solo paso de deshacer.
- **Escriba** valores exactos en la tabla de PIV del panel derecho: **Estación**, **Elevación** y **Curva L** (longitud de la curva vertical). Presione {{key:Enter}} después de cada uno.
- **Quite** un PIV con la x al final de su fila, o selecciónelo (haga clic en él) y presione {{key:Delete}}. Cuando la vista de perfil tiene el foco, {{key:Backspace}} también lo quita.

El primer y el último PIV nunca reciben una curva.

## Curvas verticales

1. Escriba una longitud en **Curva L** para un PIV interior, por ejemplo 200.
2. La curva se dibuja centrada en el PIV. El perfil y el panel derecho muestran su tipo (cresta o cóncava), L y K, las estaciones y elevaciones de BVC y EVC, y su punto alto o bajo cuando tiene uno dentro de la curva.

K se calcula a partir de L (K = L dividido por la diferencia algebraica de pendientes, en porcentaje). Usted escribe L; escribir K directamente todavía no está disponible.

Si una curva vertical no cabe, un recuadro rojo explica por qué: retrocede hacia el PIV o la curva anterior, o pasa del siguiente PIV, e indica cuánto espacio hay en ese lado (una curva necesita la mitad de su longitud a cada lado de su PIV). Su botón fija **la curva más larga que cabe**, con su K, como un solo paso ({{key:Mod+Z}} lo deshace). O bien, separe los PIV.

## Leer los datos

Bajo la tabla de PIV, una lista muestra cada pendiente en porcentaje («Pendiente 1: +1.25%») y cada curva, por ejemplo «Cresta en 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)», y luego «Punto alto 1+62.40, 254.12».

Si los PIV no llegan a ambos extremos de la alineación, una nota lo indica. Un corredor solo se construye donde el perfil y la alineación se superponen.

## Líneas características en el perfil

Las líneas características también se muestran en la vista de perfil, para que pueda ver una guarnición, una cuneta o la parte superior de un muro contra el perfil de la vía.

- Donde una línea característica **cruza** la alineación, el perfil muestra un pequeño rombo en esa estación y elevación, con el nombre de la línea y su elevación allí (la elevación propia de la línea, calculada a lo largo del tramo que cruza).
- Escriba una distancia en {{ui:A lo largo, dentro de}} para dibujar también las líneas características que **corren al lado** de la alineación dentro de esa distancia, como líneas discontinuas a sus propias elevaciones. Vacío o 0 muestra solo los cruces.
- Las marcas y etiquetas siguen cada cambio: mueva un vértice, escriba una pendiente o eleve la línea, y el perfil muestra de inmediato las nuevas elevaciones.
- Haga clic en el rombo de un cruce para seleccionar esa línea característica; la línea seleccionada se dibuja en el color de resaltado.
- {{ui:Líneas características}} en la barra del perfil oculta o muestra todas. Ambos ajustes se guardan con el proyecto.

Vea [Líneas características](topic:feature-lines).

## Siguiente

- [Barrer un corredor de vía](topic:corridor) a lo largo de la alineación y de este perfil.
- El perfil se escribe en LandXML junto con la alineación; vea [Intercambiar LandXML](topic:landxml).
