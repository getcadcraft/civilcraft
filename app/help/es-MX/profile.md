---
title: Diseñar un perfil vertical
summary: Abra la vista de perfil, inicie un perfil de diseño desde el terreno, agregue y arrastre PIV, defina longitudes de curvas verticales y lea pendientes, valores K y puntos altos y bajos.
keywords: perfil, alineación vertical, PIV, curva vertical, pendiente, valor K, cresta, cóncava, BVC, EVC, vista de perfil, rasante final, FG, perfil del terreno existente, líneas características en el perfil, cruces, proyectado, guarnición, cuneta, etiquetas
from: dbb1f32d
---

Cada alineación tiene un perfil de diseño: una lista de PIV (estación y elevación) unidos por pendientes rectas, con una curva vertical parabólica simétrica en cualquier PIV interior que tenga longitud. El perfil del terreno existente se toma de la superficie por usted.

## Abrir la vista de perfil

1. Seleccione la alineación (haga clic en ella con {{ui:Seleccionar}}).
2. Pulse {{key:R}}, haga clic en {{ui:Perfil}} en la barra de herramientas, o en {{ui:Vista de perfil}} al pie del panel derecho.
   La vista de perfil se abre bajo la planta, con el terreno existente a lo largo de la alineación. Con dos o más alineaciones, elija una en la lista a la izquierda de la barra de perfil.

La vista empieza mostrando toda la alineación y estirando las elevaciones para llenar el panel; la exageración aparece en la esquina inferior izquierda, por ejemplo "Exageración vertical 10×".

## Acercar y desplazar el perfil

- **Acercar:** gire la rueda del ratón (o pellizque en un panel táctil) y la vista se acerca alrededor del puntero. Mantenga {{key:Shift}} para acercar solo las estaciones, o {{key:Alt}} para acercar solo las elevaciones (eso cambia la exageración). Con la vista de perfil activa, las teclas más y menos acercan desde el centro.
- **Desplazar:** arrastre con el botón derecho o central del ratón, o deslice con dos dedos en un panel táctil.
- **Ajustar:** haga doble clic en el perfil o pulse {{key:F}} para mostrar otra vez toda la alineación.

Editar un PIV conserva el zoom que eligió; no regresa al ajuste.

Mueva el puntero a lo largo del perfil: la barra muestra la estación, las elevaciones del terreno y de diseño, la pendiente y el corte o terraplén en ese punto, y un punto sigue en la alineación de la planta.

## Iniciar el perfil de diseño

1. En el panel derecho, bajo **Perfil de diseño**, haga clic en {{ui:Iniciar desde el terreno}}.
   Se colocan dos PIV sobre el terreno en los dos extremos de la alineación, unidos por una pendiente recta. La barra de estado dice "Perfil de diseño iniciado sobre el terreno en ambos extremos. Active Agregar PIV y haga clic para agregar quiebres de pendiente; asigne una longitud de curva en la tabla."

Si la alineación no cruza la superficie, aparece "Esta alineación no tiene terreno bajo ella desde donde empezar." Entonces agregue PIV haciendo clic (sección siguiente).

## Agregar PIV

1. Pulse {{key:I}}, o haga clic en {{ui:Agregar PIV}} en la barra de perfil. Queda presionado.
2. Haga clic en el perfil donde quiera un quiebre de pendiente. Se agrega un PIV en esa estación y elevación, redondeado a 0.01, y queda seleccionado.
3. Agregue los que necesite y luego pulse {{key:I}} otra vez para dejar de agregar.

Un clic donde ya hay un PIV se rechaza ("Ya hay un PIV en …"). Los PIV siempre quedan en orden de estación.

## Forzcursor al agregar o arrastrar

El botón **Forzcursor** de la barra de perfil viene activado al inicio. Mientras esté activado, un PIV que agregue o arrastre cae en el PIV más cercano, en el punto del terreno, en la estación de un PIV o en la línea del terreno, y una etiqueta junto al marcador indica cuál. Mantenga {{key:Alt}} para un punto libre, en cualquier lugar.

## Ajustar PIV

- **Arrastre** un PIV en el perfil para moverlo. No puede pasar a sus vecinos. El movimiento es un paso de deshacer.
- **Escriba** valores exactos en la tabla de PIV del panel derecho: **Estación**, **Elevación**, **Pendiente %** y **Curva L** (longitud de la curva vertical). Pulse {{key:Enter}} después de cada uno.
- **Precise** un valor del perfil: el pequeño botón junto a la estación o la elevación de un PIV espera un clic en la vista de perfil y llena ese valor. El clic usa el forzcursor como Agregar PIV; mantenga {{key:Alt}} para un punto libre; {{key:Esc}} cancela.
- **Pendiente %** es la pendiente de la tangente que empieza en ese PIV y llega al siguiente. Escribirla mueve la elevación del **siguiente** PIV (su estación nunca se mueve). Si el siguiente PIV está bloqueado, se mueve en cambio la elevación del PIV anterior.
- **Bloquee** un PIV con el candado al final de su fila. Un PIV bloqueado no se arrastra, y una edición de pendiente no lo mueve. Si ambos extremos de una tangente están bloqueados, su pendiente no puede cambiar: la barra de estado lo indica, y primero debe desbloquear un extremo. El bloqueo se guarda en el archivo.
- **Quite** un PIV con la x al final de su fila, o selecciónelo (haga clic en él) y pulse {{key:Delete}}. Cuando la vista de perfil tiene el foco, {{key:Backspace}} también lo quita.

El primer y el último PIV nunca reciben una curva.

## Curvas verticales

1. Escriba una longitud en **Curva L** para un PIV interior, por ejemplo 200.
2. La curva se dibuja centrada en el PIV. El perfil y el panel derecho muestran su tipo (cresta o cóncava), L y K, las estaciones y elevaciones de BVC y EVC, y su punto alto o bajo cuando tiene uno dentro de la curva.

K se calcula a partir de L (K = L dividido entre la diferencia algebraica de pendientes, en porcentaje). Usted escribe L; escribir K directamente todavía no está disponible.

Si una curva vertical no cabe, un recuadro rojo indica por qué: se mete en el PIV o la curva anterior, o pasa del siguiente PIV, y cuánto espacio hay de ese lado (una curva necesita la mitad de su longitud a cada lado de su PIV). Su botón define **la curva más larga que cabe**, con su K, como un solo paso ({{key:Mod+Z}} lo deshace). O separe los PIV.

## Leer los datos

Bajo la tabla de PIV, una lista da cada pendiente en porcentaje ("Pendiente 1: +1.25%") y cada curva, por ejemplo "Cresta en 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", y luego "Punto alto 1+62.40, 254.12".

Si los PIV no llegan a ambos extremos de la alineación, una nota lo indica. Una obra lineal solo se construye donde se traslapan el perfil y la alineación.

## Líneas características en el perfil

Las líneas características también se muestran en la vista de perfil, así puede ver una guarnición, una cuneta o la parte superior de un muro frente al perfil de la vía.

- Donde una línea característica **cruza** la alineación, el perfil muestra un pequeño rombo en esa estación y elevación, con el nombre de la línea y su elevación allí (la elevación propia de la línea, calculada a lo largo del tramo que cruza).
- Escriba una distancia en {{ui:A lo largo, dentro de}} para dibujar también las líneas características que **corren junto** a la alineación dentro de esa distancia, como líneas discontinuas a sus propias elevaciones. Vacío o 0 muestra solo los cruces.
- Las marcas y etiquetas siguen cada cambio: mueva un vértice, escriba una pendiente o eleve la línea, y el perfil muestra de inmediato las nuevas elevaciones.
- Haga clic en el rombo de un cruce para seleccionar esa línea característica; la línea seleccionada se dibuja en el color de resaltado.
- {{ui:Líneas características}} en la barra de perfil oculta o muestra todas. Ambos ajustes se guardan con el proyecto.

Vea [Líneas características](topic:feature-lines).

## Siguiente

- [Barrido de una obra lineal vial](topic:corridor) a lo largo de la alineación y de este perfil.
- El perfil se escribe en LandXML junto con la alineación; vea [Intercambiar LandXML](topic:landxml).
