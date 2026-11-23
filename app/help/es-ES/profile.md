---
title: Diseñar un perfil vertical
summary: Abra la vista de perfil, empiece un perfil de proyecto desde el terreno, añada y arrastre PIV, fije longitudes de curvas verticales y lea pendientes, valores K y puntos altos y bajos.
keywords: perfil, alineación vertical, PIV, curva vertical, pendiente, valor K, cresta, columpio, BVC, EVC, vista de perfil, rasante, perfil del terreno existente, líneas características en el perfil, cruces, proyectado, bordillo, cuneta, etiquetas
from: dbb1f32d
---

Cada trazado tiene un perfil de proyecto: una lista de PIV (P.K. y cota) unidos por pendientes rectas, con una curva vertical parabólica simétrica en cualquier PIV interior que tenga longitud. El perfil del terreno existente se muestrea de la superficie automáticamente.

## Abrir la vista de perfil

1. Seleccione el trazado (haga clic en él con {{ui:Seleccionar}}).
2. Pulse {{key:R}}, o haga clic en {{ui:Perfil}} en la barra de herramientas, o en {{ui:Vista de perfil}} en la parte inferior del panel derecho.
   La vista de perfil se abre bajo la planta con el terreno existente a lo largo del trazado. Con dos o más trazados, elija uno en la lista de la izquierda de la barra de perfil.

La vista empieza mostrando todo el trazado y estirando las cotas para llenar el panel; la exageración se imprime en la esquina inferior izquierda, por ejemplo «Exageración vertical 10×».

## Ampliar y desplazar el perfil

- **Ampliar:** gire la rueda del ratón (o pellizque en el panel táctil) y la vista se amplía alrededor del puntero. Mantenga pulsado {{key:Shift}} para ampliar solo los P.K., o {{key:Alt}} para ampliar solo las cotas (eso cambia la exageración). Con la vista de perfil enfocada, las teclas más y menos amplían desde el centro.
- **Desplazar:** arrastre con el botón derecho o central del ratón, o deslice con dos dedos en el panel táctil.
- **Ajustar:** haga doble clic en el perfil o pulse {{key:F}} para mostrar otra vez todo el trazado.

Editar un PIV mantiene el zoom que eligió; no vuelve a ajustarse.

Mueva el puntero a lo largo del perfil: la barra muestra el P.K., las cotas del terreno y de proyecto, la pendiente y el desmonte o terraplén en ese punto, y un punto sigue el trazado en la planta.

## Empezar el perfil de proyecto

1. En el panel derecho, en **Perfil de proyecto**, haga clic en {{ui:Iniciar desde el terreno}}.
   Se colocan dos PIV sobre el terreno en los dos extremos del trazado, unidos por una pendiente recta. La barra de estado dice «Perfil de proyecto iniciado en el terreno en ambos extremos. Active Añadir PIV y haga clic para añadir quiebros de pendiente; déles una longitud de curva en la tabla.»

Si el trazado no atraviesa la superficie, aparece «Este trazado no tiene terreno bajo él desde el que empezar.» En ese caso, añada PIV haciendo clic (sección siguiente).

## Añadir PIV

1. Pulse {{key:I}}, o haga clic en {{ui:Añadir PIV}} en la barra de perfil. Queda pulsado.
2. Haga clic en el perfil donde quiera un quiebro de pendiente. Se añade un PIV en ese P.K. y cota, redondeado a 0.01, y queda seleccionado.
3. Añada los que necesite y pulse {{key:I}} de nuevo para dejar de añadir.

Un clic donde ya hay un PIV se rechaza («Ya hay un PIV en …»). Los PIV siempre quedan en orden de P.K.

## Ajustar al añadir o arrastrar

El botón **Ajustar** de la barra de perfil está activado al inicio. Mientras esté activo, un PIV que añada o arrastre se sitúa en el PIV, punto del terreno, P.K. de PIV o línea de terreno más cercano, y una etiqueta junto al marcador indica cuál. Mantenga pulsado {{key:Alt}} para un punto libre, en cualquier lugar.

## Ajustar PIV

- **Arrastre** un PIV en el perfil para moverlo. No puede pasar a sus vecinos. El movimiento es un solo paso de deshacer.
- **Escriba** valores exactos en la tabla de PIV del panel derecho: **P.K.**, **Cota**, **Pendiente %** y **Longitud de curva L** (longitud de la curva vertical). Pulse {{key:Enter}} después de cada uno.
- **Elija** un valor del perfil: el botón pequeño junto al P.K. o a la cota de un PIV espera un clic en la vista de perfil y rellena ese valor. El clic se ajusta como en Añadir PIV; mantenga pulsado {{key:Alt}} para un punto libre; {{key:Esc}} cancela.
- **Pendiente %** es la pendiente de la tangente que parte de ese PIV y llega al siguiente. Escribirla mueve la cota del **siguiente** PIV (su P.K. nunca se mueve). Si el siguiente PIV está bloqueado, en su lugar se mueve la cota del PIV anterior.
- **Bloquee** un PIV con el candado al final de su fila. Un PIV bloqueado no se arrastra, y una edición de pendiente no lo mueve. Si ambos extremos de una tangente están bloqueados, su pendiente no puede cambiar: la barra de estado lo indica, y primero debe desbloquear un extremo. El bloqueo se guarda en el archivo.
- **Quite** un PIV con la x al final de su fila, o selecciónelo (haga clic en él) y pulse {{key:Delete}}. Cuando la vista de perfil tiene el foco, {{key:Backspace}} también lo quita.

El primer y el último PIV nunca tienen curva.

## Curvas verticales

1. Escriba una longitud en **Longitud de curva L** para un PIV interior, por ejemplo 200.
2. La curva se dibuja centrada en el PIV. El perfil y el panel derecho muestran su tipo (cresta o columpio), L y K, los P.K. y cotas del BVC y del EVC, y su punto alto o bajo cuando lo tiene dentro de la curva.

K se calcula a partir de L (K = L dividido por la diferencia algebraica de pendientes, en porcentaje). Usted escribe L; escribir K directamente aún no está disponible.

Si una curva vertical no cabe, un recuadro rojo indica el motivo: retrocede sobre el PIV o la curva anterior, o pasa del siguiente PIV, y cuánto espacio hay en ese lado (una curva necesita la mitad de su longitud a cada lado de su PIV). Su botón fija **la curva más larga que cabe**, con su K, en un solo paso ({{key:Mod+Z}} lo deshace). O separe los PIV.

## Leer los datos

Bajo la tabla de PIV, una lista indica cada pendiente en porcentaje («Pendiente 1: +1.25%») y cada curva, por ejemplo «Cresta en 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)», y después «Punto alto 1+62.40, 254.12».

Si los PIV no llegan a ambos extremos del trazado, una nota lo indica. Un corredor solo se genera donde se solapan el perfil y el trazado.

## Líneas características en el perfil

Las líneas características también se muestran en la vista de perfil, así puede ver un bordillo, una cuneta o la coronación de un muro frente al perfil de la carretera.

- Donde una línea característica **cruza** el trazado, el perfil muestra un pequeño rombo en ese P.K. y cota, rotulado con el nombre de la línea y su cota allí (la cota propia de la línea, calculada a lo largo del tramo que cruza).
- Escriba una distancia en {{ui:A lo largo, dentro de}} para dibujar también las líneas características que **discurren junto** al trazado dentro de esa distancia, como líneas discontinuas a sus propias cotas. Vacío o 0 muestra solo los cruces.
- Las marcas y rótulos siguen cada cambio: mueva un vértice, escriba una pendiente o eleve la línea, y el perfil muestra de inmediato las nuevas cotas.
- Haga clic en el rombo de un cruce para seleccionar esa línea característica; la línea seleccionada se dibuja en el color de resaltado.
- {{ui:Líneas características}} en la barra de perfil oculta o muestra todas. Ambos ajustes se guardan con el proyecto.

Vea [Líneas características](topic:feature-lines).

## Siguiente

- [Barrer un corredor de carretera](topic:corridor) a lo largo del trazado y de este perfil.
- El perfil se escribe en LandXML junto con el trazado; vea [Intercambio LandXML](topic:landxml).
