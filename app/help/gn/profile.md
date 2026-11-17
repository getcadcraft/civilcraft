---
title: Diseñar un perfil vertical
summary: Abre la vista de perfil, comienza un perfil de diseño desde el terreno, agrega y arrastra PVI, define longitudes de curva vertical y lee pendientes, valores K y puntos altos y bajos.
keywords: perfil, alineamiento vertical, pvi, curva vertical, pendiente, valor k, cresta, columpio, bvc, evc, vista de perfil, rasante, fg, perfil del terreno existente, líneas de rasgo en perfil, cruces, proyectado, cordón, zanja, etiquetas
from: e9182bfa
---

Cada alineamiento tiene un perfil de diseño: una lista de PVI (progresiva y cota) unidos por pendientes rectas, con una curva vertical parabólica simétrica en cualquier PVI intermedio que tenga longitud. El perfil del terreno existente se toma de la superficie por ti.

## Abrir la vista de perfil

1. Selecciona el alineamiento (haz click en él con {{ui:Seleccionar}}).
2. Presiona {{key:R}}, o haz click en {{ui:Perfil}} en la barra de herramientas, o en {{ui:Vista de perfil}} abajo del panel derecho.
   La vista de perfil se abre debajo del plano con el terreno existente a lo largo del alineamiento. Con dos o más alineamientos, elige uno en la lista a la izquierda de la barra de perfil.

La vista siempre muestra el alineamiento completo y estira las cotas para llenar el panel; la exageración se imprime en la esquina inferior izquierda, por ejemplo "Exageración vertical 10×". No hace zoom ni desplazamiento.

Mueve el puntero a lo largo del perfil: la barra muestra la progresiva, las cotas del terreno y del diseño, la pendiente y el corte o relleno en ese punto, y un punto sigue el alineamiento en el plano.

## Comenzar el perfil de diseño

1. En el panel derecho, bajo **Perfil de diseño**, haz click en {{ui:Comenzar desde el terreno}}.
   Se colocan dos PVI sobre el terreno en los dos extremos del alineamiento, unidos por una pendiente recta. La barra de estado dice "Perfil de diseño iniciado en el terreno en ambos extremos. Activa Agregar PVI y haz click para agregar quiebres de pendiente; asígnales una longitud de curva en la tabla".

Si el alineamiento no cruza la superficie, aparece "Este alineamiento no tiene terreno debajo desde donde comenzar". Entonces agrega PVI haciendo click (sección siguiente).

## Agregar PVI

1. Presiona {{key:I}}, o haz click en {{ui:Agregar PVI}} en la barra de perfil. Queda presionado.
2. Haz click en el perfil donde quieres un quiebre de pendiente. Se agrega un PVI en esa progresiva y cota, redondeado a 0.01, y queda seleccionado.
3. Agrega los que necesites, luego presiona {{key:I}} otra vez para dejar de agregar.

Un click donde ya hay un PVI se rechaza ("Ya hay un PVI en …"). Los PVI siempre quedan en orden de progresiva.

## Ajustar PVI

- **Arrastra** un PVI en el perfil para moverlo. No puede pasar a sus vecinos. El movimiento es un solo paso de deshacer.
- **Escribe** valores exactos en la tabla de PVI del panel derecho: **Progresiva**, **Cota** y **Longitud de curva** (longitud de curva vertical) — **Curva L**. Presiona {{key:Enter}} después de cada uno.
- **Quita** un PVI con la x al final de su fila, o selecciónalo (haz click) y presiona {{key:Delete}}. Cuando la vista de perfil tiene el foco, {{key:Backspace}} también lo quita.

El primer y el último PVI nunca reciben curva.

## Curvas verticales

1. Escribe una longitud en **Curva L** para un PVI intermedio, por ejemplo 200.
2. La curva se dibuja centrada en el PVI. El perfil y el panel derecho muestran su tipo (convexa o cóncava), L y K, las progresivas y cotas BVC y EVC, y su punto alto o bajo cuando tiene uno dentro de la curva.

K se calcula a partir de L (K = L dividido por la diferencia algebraica de pendientes, en por ciento). Tú escribes L; escribir K directamente todavía no está disponible.

Si una curva vertical no entra, un recuadro rojo explica por qué: retrocede hacia el PVI o curva anterior, o pasa el siguiente PVI, y cuánto espacio hay de ese lado (una curva necesita la mitad de su longitud a cada lado de su PVI). Su botón fija **la curva más larga que entra**, con su K, como un solo paso ({{key:Mod+Z}} lo deshace). O separa los PVI.

## Leer los datos

Debajo de la tabla de PVI, una lista da cada pendiente en por ciento ("Pendiente 1: +1.25%") y cada curva, por ejemplo "Convexa en 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", y después "Punto alto 1+62.40, 254.12".

Si los PVI no llegan a ambos extremos del alineamiento, una nota lo indica. Un corredor se construye solo donde el perfil y el alineamiento se superponen.

## Líneas de rasgo en el perfil

Las líneas de rasgo también se muestran en la vista de perfil, así puedes ver un cordón, una zanja o la parte superior de un muro contra el perfil de la calzada.

- Donde una línea de rasgo **cruza** el alineamiento, el perfil muestra un pequeño rombo en esa progresiva y cota, con el nombre de la línea y su cota allí (la cota propia de la línea, calculada sobre el segmento que cruza).
- Escribe una distancia en {{ui:Al costado dentro de}} para dibujar también las líneas de rasgo que **corren al costado** del alineamiento dentro de esa distancia, como líneas punteadas en sus propias cotas. Vacío o 0 muestra solo los cruces.
- Las marcas y etiquetas siguen cada cambio: mueve un vértice, escribe una pendiente o sube la línea, y el perfil muestra las nuevas cotas al instante.
- Haz click en el rombo de un cruce para seleccionar esa línea de rasgo; la línea seleccionada se dibuja en el color de resaltado.
- {{ui:Líneas de rasgo}} en la barra de perfil oculta o muestra todas. Ambos ajustes se guardan con el proyecto.

Ver [Líneas de rasgo](topic:feature-lines).

## Siguiente

- [Barrer un corredor de calzada](topic:corridor) a lo largo del alineamiento y de este perfil.
- El perfil se escribe en LandXML junto con el alineamiento; ver [Intercambiar LandXML](topic:landxml).
