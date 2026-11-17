---
title: Diseñar un perfil longitudinal
summary: Abra la vista de perfil, inicie un perfil de diseño desde el terreno, añada y arrastre PIV, fije las longitudes de curva vertical y lea pendientes, valores K y puntos altos y bajos.
keywords: perfil, alineación vertical, piv, curva vertical, pendiente, valor k, cresta, cóncava, pcv, ptv, rasante final, fg, perfil del terreno existente, líneas características en el perfil, cruces, proyectado, bordillo, cuneta, etiquetas
from: e9182bfa
---

Cada alineación tiene un perfil de diseño: una lista de PIV (P.K. y cota) unidos por pendientes rectas, con una curva vertical parabólica simétrica en cualquier PIV interior que tenga longitud. El perfil del terreno existente se muestrea automáticamente a partir de la superficie.

## Abrir la vista de perfil

1. Seleccione la alineación (púlsela con {{ui:Seleccionar}}).
2. Pulse {{key:R}}, o pulse {{ui:Perfil}} en la barra de herramientas, o {{ui:Vista de perfil}} en la parte inferior del panel derecho.
   La vista de perfil se abre bajo el plano con el terreno existente a lo largo de la alineación. Con dos o más alineaciones, elija una en la lista a la izquierda de la barra del perfil.

La vista muestra siempre toda la alineación y estira las cotas para llenar el panel; la exageración aparece impresa en la esquina inferior izquierda, por ejemplo "Exageración vertical 10×". No hace zoom ni desplazamiento.

Mueva el puntero a lo largo del perfil: la barra muestra el P.K., las cotas del terreno y del diseño, la pendiente y el desmonte o el terraplén en ese punto, y un punto sigue el recorrido sobre la alineación en el plano.

## Iniciar el perfil de diseño

1. En el panel derecho, bajo **Perfil de diseño**, pulse {{ui:Iniciar desde el terreno}}.
   Se colocan dos PIV sobre el terreno en los dos extremos de la alineación, unidos por una pendiente recta. La barra de estado indica "Perfil de diseño iniciado sobre el terreno en ambos extremos. Active Añadir PIV y pulse para añadir quiebros de pendiente; asigne una longitud de curva en la tabla."

Si la alineación no corta la superficie, obtiene "Esta alineación no tiene terreno bajo ella desde el que empezar." En ese caso añada PIV pulsando (sección siguiente).

## Añadir PIV

1. Pulse {{key:I}}, o pulse {{ui:Añadir PIV}} en la barra del perfil. Queda pulsado.
2. Pulse en el perfil donde quiera un quiebro de pendiente. Se añade un PIV en ese P.K. y esa cota, redondeado a 0.01, y queda seleccionado.
3. Añada los que necesite y pulse {{key:I}} de nuevo para dejar de añadir.

Un clic donde ya hay un PIV se rechaza ("Ya hay un PIV en …"). Los PIV siempre se mantienen en orden de P.K.

## Ajustar PIV

- **Arrastre** un PIV en el perfil para moverlo. No puede pasar a sus vecinos. El movimiento es un solo paso de deshacer.
- **Escriba** los valores exactos en la tabla de PIV del panel derecho: **P.K.**, **Cota** y **Longitud de curva** (longitud de la curva vertical). Pulse {{key:Enter}} después de cada uno.
- **Elimine** un PIV con la x al final de su fila, o selecciónelo (púlselo) y pulse {{key:Delete}}. Cuando la vista de perfil tiene el foco, {{key:Backspace}} también lo elimina.

El primer y el último PIV nunca reciben curva.

## Curvas verticales

1. Escriba una longitud en **Longitud de curva** para un PIV interior, por ejemplo 200.
2. La curva se dibuja centrada en el PIV. El perfil y el panel derecho muestran su tipo (cresta o cóncava), L y K, los P.K. y las cotas de PCV y PTV, y su punto alto o bajo cuando lo tiene dentro de la curva.

K se calcula a partir de L (K = L dividido por la diferencia algebraica de pendientes, en porcentaje). Usted escribe L; escribir K directamente todavía no está disponible.

Si una curva vertical no cabe, un recuadro rojo explica por qué: retrocede hacia el PIV o la curva anterior, o sobrepasa el siguiente PIV, e indica cuánto espacio hay a ese lado (una curva necesita la mitad de su longitud a cada lado de su PIV). Su botón fija **la curva más larga que cabe**, con su K, en un solo paso ({{key:Mod+Z}} lo deshace). O separe los PIV.

## Leer los datos

Bajo la tabla de PIV, una lista indica cada pendiente en porcentaje ("Pendiente 1: +1.25%") y cada curva, por ejemplo "Cresta en 2+00.00: L 200.00, K 85.3, PCV 1+00.00 (253.10), PTV 3+00.00 (252.40)", y después "Punto alto 1+62.40, 254.12".

Si los PIV no llegan a ambos extremos de la alineación, una nota lo indica. Un corredor solo se construye donde el perfil y la alineación se solapan.

## Líneas características en el perfil

Las líneas características también se muestran en la vista de perfil, para ver un bordillo, una cuneta o la coronación de un muro frente al perfil de la carretera.

- Donde una línea característica **cruza** la alineación, el perfil muestra un pequeño rombo en ese P.K. y cota, rotulado con el nombre de la línea y su cota allí (la propia cota de la línea, calculada a lo largo del tramo que cruza).
- Escriba una distancia en {{ui:A lo largo, dentro de}} para dibujar también las líneas características que **discurren junto** a la alineación dentro de esa distancia, como líneas discontinuas a sus propias cotas. Si está vacío o es 0, solo se muestran los cruces.
- Las marcas y etiquetas siguen todos los cambios: mueva un vértice, escriba una pendiente o eleve la línea, y el perfil muestra al instante las nuevas cotas.
- Pulse el rombo de un cruce para seleccionar esa línea característica; la línea seleccionada se dibuja en el color de resalte.
- {{ui:Líneas características}} en la barra del perfil oculta o muestra todas. Ambos ajustes se guardan con el proyecto.

Véase [Líneas características](topic:feature-lines).

## Siguiente

- [Genere un corredor de carretera](topic:corridor) a lo largo de la alineación y de este perfil.
- El perfil se escribe en LandXML junto con la alineación; véase [Intercambiar LandXML](topic:landxml).
