---
title: Teclas y mouse
summary: Cada atajo de teclado y acción de mouse, trackpad y pantalla táctil en CivilCraft, agrupados, con las diferencias de navegador y plataforma.
keywords: teclado, atajos, teclas de acceso rápido, teclas, mouse, trackpad, táctil, desplazar, zoom, pellizcar, rueda, clic derecho, mac, tecla command
from: a9756f46
---

Las teclas de una sola letra funcionan cuando no estás escribiendo en un cuadro. Los atajos con {{key:Mod}} usan Command en una Mac y Ctrl en los demás. Ver también [Teclas en el navegador](common:keys).

## Archivos y edición

| Tecla | Acción |
|---|---|
| {{key:Mod+O}} | Abrir un archivo de puntos, LandXML o proyecto |
| {{key:Mod+S}} | Guardar el proyecto (descarga un archivo `.civilcraft.json`) |
| {{key:Mod+P}} | Imprimir el plano a PDF (abre el diálogo de impresión, no la impresión del navegador) |
| {{key:Mod+Z}} | Deshacer |
| {{key:Mod+Y}} | Rehacer |
| {{key:Delete}} | Eliminar los puntos de levantamiento, trazado, plataforma, estructura, caño o PVI seleccionados |
| {{key:Mod+C}} | Copiar los puntos de levantamiento seleccionados (también como filas de puntos para una planilla) |
| {{key:Mod+X}} | Cortar los puntos de levantamiento seleccionados |
| {{key:Mod+V}} | Pegar puntos: siguen al puntero, haz clic donde van |
| {{key:Mod+Shift+V}} | Pegar en el lugar: en las propias coordenadas de los puntos |
| {{key:Mod+D}} | Duplicar los puntos seleccionados: una copia sigue al puntero |
| {{key:Mod+A}} | Seleccionar todos los puntos de levantamiento |
| {{key:Esc}} | No seleccionar nada (y cancelar un pegado) |

{{key:Mod+S}}, {{key:Mod+O}} y {{key:Mod+P}} funcionan incluso mientras escribes en un cuadro. {{key:Mod+Z}} y {{key:Mod+Y}} en un cuadro de texto deshacen tu escritura, como de costumbre, y lo mismo hacen {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}} y {{key:Mod+A}}: en un cuadro copian, cortan, pegan y seleccionan su texto. Con texto seleccionado en la página (en un panel), {{key:Mod+C}} copia ese texto. {{key:Mod+Shift+Z}} no hace nada en CivilCraft: usa {{key:Mod+Y}} o el botón {{ui:Redo}}.

:::mac
La tecla de Mac rotulada **delete** es {{key:Backspace}} para el navegador. Para eliminar una selección, presiona {{key:Delete}} (Fn y delete), o elige {{ui:Delete}} en el menú {{ui:More}} de la barra de herramientas.
:::

## Herramientas

| Tecla | Herramienta |
|---|---|
| {{key:V}} | {{ui:Select}} |
| {{key:M}} | {{ui:Measure}}: distancias, áreas y pendientes en el plano ([Medir](topic:measure)) |
| {{key:A}} | {{ui:Alignment}} |
| {{key:G}} | {{ui:Pad}} |
| {{key:P}} | {{ui:Pipes}} |
| {{key:B}} | {{ui:Breakline}} |
| {{key:O}} | {{ui:Boundary}} |
| {{key:R}} | Mostrar u ocultar la vista de perfil |
| {{key:I}} | Activar o desactivar {{ui:Add PVIs}} (abre la vista de perfil si está cerrada) |
| {{key:F}} | {{ui:Fit}}: mostrar todo |
| {{key:D}} | {{ui:3D}}: mostrar el sitio en 3D, o volver al plano |
| {{key:E}} | Mostrar u ocultar pendientes y elevaciones a lo largo de cada línea de rasgo (solo en la pantalla) |

Presionar otra vez la tecla de la herramienta activa vuelve a {{ui:Select}}. Las letras con Shift no hacen nada.

## Mientras dibujas

| Tecla | Acción |
|---|---|
| {{key:Enter}} | Terminar el trazado, la plataforma, el tramo de caño, la línea de quiebre o el límite |
| {{key:Backspace}} | Quitar el último punto marcado |
| {{key:C}} | Línea de rasgo: activar o desactivar arcos (después de un vértice, haz clic en un punto de la curva, y luego en su extremo) |
| {{key:Esc}} | Cancelar el dibujo (o el pegado); presionada de nuevo (o sin nada dibujado), vuelve a {{ui:Select}} y limpia la selección |

## Vista de plano

| Tecla o acción | Resultado |
|---|---|
| Rueda | Acercar o alejar en el puntero |
| Arrastrar en un espacio vacío | Desplazar (en cualquier herramienta; un clic corto sigue haciendo clic; con {{key:Shift}} presionada dibuja un cuadro de selección) |
| Arrastrar con el botón central | Desplazar |
| Arrastrar con el botón derecho | Desplazar (no se abre ningún menú) |
| {{key:Space}} y arrastrar | Desplazar |
| Clic | Seleccionar (con {{ui:Select}}), o colocar un punto (con una herramienta de dibujo) |
| {{key:Shift}} y clic | Agregar un punto de levantamiento a la selección, o quitarlo |
| {{key:Shift}} y arrastrar | Dibujar un cuadro: los puntos de levantamiento dentro se agregan a la selección. Arrastra alrededor de ellos para un [lazo](topic:lasso-selection) |
| {{key:Space}} mientras dibujas un lazo | Ventana, luego cruce, luego cerca |
| Clic mientras pegas | Coloca allí los puntos pegados ({{key:Enter}} los pone en sus propias coordenadas) |
| Arrastrar un agarre | Mover un PI, una esquina de plataforma o una estructura (un paso de deshacer) |
| {{key:Up}} {{key:Down}} {{key:Left}} {{key:Right}} | Desplazar, cuando el plano tiene el foco (haz clic primero en él) |
| {{key:Plus}} y {{key:Minus}} | Acercar y alejar en el centro, cuando el plano tiene el foco |

La tecla = acerca como {{key:Plus}}, así que no necesitas Shift.

## Vista de perfil

| Acción | Resultado |
|---|---|
| Clic con {{ui:Add PVIs}} activado | Agregar un PVI allí |
| Clic en un PVI | Seleccionarlo |
| Arrastrar un PVI | Moverlo (un paso de deshacer) |
| {{key:Delete}} o {{key:Backspace}} | Quitar el PVI seleccionado ({{key:Backspace}} solo cuando la vista de perfil tiene el foco) |

La vista de perfil no acerca ni desplaza.

## Pantalla y ayuda

| Tecla | Acción |
|---|---|
| {{key:F1}} | Abrir o cerrar esta ayuda (el panel lateral); {{ui:Help}} en la barra de la app hace lo mismo |
| {{key:Esc}} | Cerrar el panel de ayuda cuando está abierto |
| {{key:Ctrl+Shift+F}} | Cambiar los modos de pantalla: pantalla completa, pantalla completa con las barras ocultas, normal |
| {{key:Esc}} | Salir de pantalla completa (la tecla propia del navegador) |

{{key:F1}} llega a la ayuda antes que CivilCraft, así que funciona en cualquier herramienta. En la mayoría de los teclados de Mac, presiona fn con F1, o haz clic en {{ui:Help}}. {{key:Ctrl+Shift+F}} usa la tecla Control en todas las plataformas, incluida la Mac. Ver [Usar la ayuda](common:help) para saber cómo buscar en esta ayuda.

## Mouse, trackpad y pantalla táctil

:::mouse
- La rueda acerca en el puntero. Un mouse con rueda de giro libre acerca rápido: da giros cortos.
- Desplaza con cualquier arrastre en un espacio vacío, el botón central, el botón derecho, o {{key:Space}} y arrastrar.
:::

:::mac
En un trackpad de Mac:

- El desplazamiento con dos dedos **acerca** (no desplaza), y pellizcar también acerca.
- Para desplazar, presiona y arrastra en un espacio vacío con un dedo, o mantén {{key:Space}} y arrastra.
- Un clic con dos dedos (clic derecho) no abre ningún menú y no hace nada por sí solo.
:::

:::touch
En una pantalla táctil:

- El primer toque hace que los botones y las filas de menú tengan el tamaño de un dedo.
- Toca para seleccionar o colocar un punto; un dedo arrastrado en un espacio vacío desplaza. Un toque puede tambalear un poco: solo desplaza cuando el dedo se mueve unos 10 píxeles.
- Dos dedos pellizcan para acercar y se mueven juntos para desplazar.
- Arrastra un agarre o un PVI con un dedo. Los agarres toman el ancho de un dedo a su alrededor.
- Mientras dibujas un trazado, plataforma, línea de quiebre, límite, tramo de caño, línea de rasgo o parcela, una barra sobre el plano ofrece {{ui:Finish}} ({{key:Enter}}), {{ui:Undo point}} ({{key:Backspace}}) y {{ui:Cancel}} ({{key:Esc}}). Una pulsación larga (medio segundo sin moverse) también termina.
- En {{ui:Select}}, una pulsación larga sobre un punto de levantamiento lo agrega a la selección, o lo quita, como hace {{key:Shift}}+clic.
- En la vista 3D, un dedo orbita, dos pellizcan y desplazan, y un toque elige.
- En pantallas táctiles no hay hover, así que las lecturas de la barra de estado se actualizan solo mientras un dedo está apoyado.
:::

## Teclas del navegador que tienen prioridad

Algunas teclas pertenecen al navegador y nunca llegan a CivilCraft, por ejemplo {{key:Mod+W}} (cerrar pestaña), {{key:Mod+T}} (nueva pestaña), {{key:Mod+N}} (nueva ventana) y {{key:F11}} (pantalla completa en los navegadores de Windows y Linux). CivilCraft no las usa. Si un atajo abre algo en el navegador, haz clic una vez en el plano para que la página tenga el foco, y vuelve a intentar.

## Dónde está Mover

No hay un comando Mover: elige {{ui:Select}} y arrastra un punto o un vértice, o edita sus coordenadas en {{ui:Properties}}. Ver [Editar puntos](topic:edit-points).
