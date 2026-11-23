---
title: Diseñar un perfil vertical
summary: Abrí la vista de perfil, iniciá un perfil de diseño desde el terreno, agregá y arrastrá PVI, fijá las longitudes de las curvas verticales, y leé las pendientes, los valores K y los puntos altos y bajos.
keywords: perfil, alineación vertical, pvi, curva vertical, pendiente, valor k, cresta, columpio, bvc, evc, vista de perfil, rasante final, fg, perfil del terreno existente, líneas de rasgo en el perfil, cruces, proyectado, cordón, zanja, rótulos
from: dbb1f32d
---

Cada trazado tiene un perfil de diseño: una lista de PVI (estación y cota) unidos por pendientes rectas, con una curva vertical parabólica simétrica en cualquier PVI interior que tenga una longitud. El perfil del terreno existente se toma de la superficie por vos.

## Abrir la vista de perfil

1. Seleccioná el trazado (hacé clic en él con {{ui:Seleccionar}}).
2. Presioná {{key:R}}, o hacé clic en {{ui:Perfil}} en la barra de herramientas, o en {{ui:Vista de perfil}} al pie del panel derecho.
   La vista de perfil se abre debajo del plano con el terreno existente a lo largo del trazado. Con dos o más trazados, elegí uno en la lista a la izquierda de la barra del perfil.

La vista empieza mostrando todo el trazado y estirando las cotas para llenar el panel; la exageración se imprime en la esquina inferior izquierda, por ejemplo "Exageración vertical 10×".

## Hacer zoom y desplazar el perfil

- **Zoom:** girá la rueda del mouse (o pellizcá en el trackpad) y la vista hace zoom alrededor del puntero. Mantené {{key:Shift}} para hacer zoom solo en las estaciones, o {{key:Alt}} para hacer zoom solo en las cotas (eso cambia la exageración). Con la vista de perfil enfocada, las teclas más y menos hacen zoom desde el centro.
- **Desplazar:** arrastrá con el botón derecho o central del mouse, o deslizá con dos dedos en el trackpad.
- **Ajustar:** hacé doble clic en el perfil o presioná {{key:F}} para mostrar otra vez todo el trazado.

Editar un PVI mantiene el zoom que elegiste; no vuelve de golpe al ajuste.

Mové el puntero a lo largo del perfil: la barra muestra la estación, las cotas del terreno y de diseño, la pendiente y el corte o relleno en ese punto, y un punto sigue el trazado en el plano.

## Iniciar el perfil de diseño

1. En el panel derecho, bajo **Perfil de diseño**, hacé clic en {{ui:Comenzar desde el terreno}}.
   Se colocan dos PVI sobre el terreno en los dos extremos del trazado, unidos por una pendiente recta. La barra de estado dice "Perfil de diseño iniciado en el terreno en ambos extremos. Activá Agregar PVI y hacé clic para agregar quiebres de pendiente; dales una longitud de curva en la tabla".

Si el trazado no cruza la superficie, aparece "Este trazado no tiene terreno debajo desde donde empezar". Entonces agregá PVI haciendo clic (siguiente sección).

## Agregar PVI

1. Presioná {{key:I}}, o hacé clic en {{ui:Agregar PVI}} en la barra del perfil. Queda presionado.
2. Hacé clic en el perfil donde quieras un quiebre de pendiente. Se agrega un PVI en esa estación y cota, redondeado a 0.01, y queda seleccionado.
3. Agregá tantos como necesites, luego presioná {{key:I}} otra vez para dejar de agregar.

Un clic donde ya hay un PVI se rechaza ("Ya hay un PVI en …"). Los PVI siempre quedan en orden de estación.

## Ajustar al agregar o arrastrar

El botón **Ajustar** de la barra del perfil está activado al inicio. Mientras esté activado, un PVI que agregues o arrastres cae sobre el PVI más cercano, el punto del terreno, la estación de un PVI o la línea del terreno, y un rótulo junto al marcador indica cuál. Mantené {{key:Alt}} para un punto libre, en cualquier lugar.

## Ajustar los PVI

- **Arrastrá** un PVI en el perfil para moverlo. No puede pasar a sus vecinos. El movimiento es un paso de deshacer.
- **Escribí** valores exactos en la tabla de PVI del panel derecho: **Estación**, **Cota**, **Pendiente %** y **Curva L** (longitud de la curva vertical). Presioná {{key:Enter}} después de cada uno.
- **Elegí** un valor desde el perfil: el pequeño botón junto a la estación o la cota de un PVI espera un clic en la vista de perfil y completa ese valor. El clic se ajusta como en Agregar PVI; mantené {{key:Alt}} para un punto libre; {{key:Esc}} cancela.
- **Pendiente %** es la pendiente de la tangente que empieza en ese PVI y llega al siguiente. Escribirla mueve la cota del **siguiente** PVI (su estación nunca se mueve). Si el siguiente PVI está bloqueado, se mueve en cambio la cota del PVI anterior.
- **Bloqueá** un PVI con el candado al final de su fila. Un PVI bloqueado no se arrastra, y una edición de pendiente no lo mueve. Si ambos extremos de una tangente están bloqueados, su pendiente no puede cambiar: la barra de estado lo dice, y primero hay que desbloquear un extremo. El bloqueo se guarda en el archivo.
- **Quitá** un PVI con la x al final de su fila, o seleccionalo (hacé clic) y presioná {{key:Delete}}. Cuando la vista de perfil tiene el foco, {{key:Backspace}} también lo quita.

El primer y el último PVI nunca reciben una curva.

## Curvas verticales

1. Escribí una longitud en **Curva L** para un PVI interior, por ejemplo 200.
2. La curva se dibuja centrada en el PVI. El perfil y el panel derecho muestran su tipo (cresta o columpio), L y K, las estaciones y cotas de BVC y EVC, y su punto alto o bajo cuando lo tiene dentro de la curva.

K se calcula a partir de L (K = L dividido por la diferencia algebraica de las pendientes, en porcentaje). Vos escribís L; escribir K directamente todavía no está disponible.

Si una curva vertical no entra, un recuadro rojo dice por qué: se mete hacia atrás en el PVI o la curva anterior, o pasa el siguiente PVI, y cuánto espacio hay de ese lado (una curva necesita la mitad de su longitud a cada lado de su PVI). Su botón fija **la curva más larga que entra**, con su K, como un solo paso ({{key:Mod+Z}} lo deshace). O separá los PVI.

## Leer los datos

Debajo de la tabla de PVI, una lista da cada pendiente en porcentaje ("Pendiente 1: +1.25%") y cada curva, por ejemplo "Cresta en 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", y luego "Punto alto 1+62.40, 254.12".

Si los PVI no llegan a los dos extremos del trazado, una nota lo indica. Una corrida de corredor se construye solo donde el perfil y el trazado se superponen.

## Líneas de rasgo en el perfil

Las líneas de rasgo también se muestran en la vista de perfil, para que veas un cordón, una zanja o la parte superior de un muro contra el perfil del camino.

- Donde una línea de rasgo **cruza** el trazado, el perfil muestra un pequeño rombo en esa estación y cota, rotulado con el nombre de la línea y su cota allí (la cota propia de la línea, calculada a lo largo del segmento que cruza).
- Escribí una distancia en {{ui:Al costado dentro de}} para dibujar también las líneas de rasgo que **corren al costado** del trazado dentro de esa distancia, como líneas de trazos a sus propias cotas. Vacío o 0 muestra solo los cruces.
- Los marcadores y los rótulos siguen cada cambio: movés un vértice, escribís una pendiente o subís la línea, y el perfil muestra las nuevas cotas de inmediato.
- Hacé clic en el rombo de un cruce para seleccionar esa línea de rasgo; la línea seleccionada se dibuja en el color de resalte.
- {{ui:Líneas de rasgo}} en la barra del perfil oculta o muestra todas. Ambas configuraciones se guardan con el proyecto.

Mirá [Líneas de rasgo](topic:feature-lines).

## Siguiente

- [Barrido de un corredor vial](topic:corridor) a lo largo del trazado y de este perfil.
- El perfil se escribe en LandXML junto con el trazado; mirá [Intercambio LandXML](topic:landxml).
