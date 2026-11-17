---
title: Teclas y ratón
summary: Todos los atajos de teclado y las acciones de ratón, panel táctil y pantalla táctil en CivilCraft, agrupados, con las diferencias del navegador y de la plataforma.
keywords: teclado, atajos, teclas de acceso rápido, teclas, ratón, panel táctil, táctil, desplazar, zoom, pellizcar, rueda, clic derecho, mac, tecla comando
from: a9756f46
---

Las teclas de una sola letra funcionan cuando no escribe en un cuadro. Los atajos con {{key:Mod}} usan Comando en Mac y Ctrl en el resto. Véase también [Teclas en el navegador](common:keys).

## Archivos y edición

| Tecla | Acción |
|---|---|
| {{key:Mod+O}} | Abrir un archivo de puntos, LandXML o proyecto |
| {{key:Mod+S}} | Guardar el proyecto (descarga un archivo `.civilcraft.json`) |
| {{key:Mod+P}} | Trazar el plano a PDF (abre el diálogo de trazado, no la impresión del navegador) |
| {{key:Mod+Z}} | Deshacer |
| {{key:Mod+Y}} | Rehacer |
| {{key:Delete}} | Eliminar los puntos topográficos, la alineación, la plataforma, la estructura, la tubería o el PIV seleccionados |
| {{key:Mod+C}} | Copiar los puntos topográficos seleccionados (también como filas de puntos para una hoja de cálculo) |
| {{key:Mod+X}} | Cortar los puntos topográficos seleccionados |
| {{key:Mod+V}} | Pegar puntos: siguen al puntero; haga clic donde deben ir |
| {{key:Mod+Shift+V}} | Pegar en su sitio: en las coordenadas propias de los puntos |
| {{key:Mod+D}} | Duplicar los puntos seleccionados: una copia sigue al puntero |
| {{key:Mod+A}} | Seleccionar todos los puntos topográficos |
| {{key:Esc}} | No seleccionar nada (y cancelar un pegado) |

{{key:Mod+S}}, {{key:Mod+O}} y {{key:Mod+P}} funcionan incluso mientras escribe en un cuadro. {{key:Mod+Z}} y {{key:Mod+Y}} en un cuadro de texto deshacen en cambio lo que ha escrito, como de costumbre, y lo mismo ocurre con {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}} y {{key:Mod+A}}: en un cuadro copian, cortan, pegan y seleccionan su texto. Con texto seleccionado en la página (en un panel), {{key:Mod+C}} copia ese texto. {{key:Mod+Shift+Z}} no hace nada en CivilCraft: use {{key:Mod+Y}} o el botón {{ui:Redo}}.

:::mac
En el teclado Mac, la tecla marcada **delete** equivale a {{key:Backspace}} en el navegador. Para eliminar una selección, pulse {{key:Delete}} (Fn y delete), o elija {{ui:Delete}} en el menú {{ui:More}} de la barra de herramientas.
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
| {{key:D}} | {{ui:3D}}: mostrar el emplazamiento en 3D, o volver al plano |
| {{key:E}} | Mostrar u ocultar las pendientes y cotas a lo largo de cada línea característica (solo en pantalla) |

Si pulsa de nuevo la tecla de la herramienta activa, vuelve a {{ui:Select}}. Las letras con {{key:Shift}} no hacen nada.

## Mientras dibuja

| Tecla | Acción |
|---|---|
| {{key:Enter}} | Terminar la alineación, la plataforma, el tramo de tubería, la línea de ruptura o el contorno |
| {{key:Backspace}} | Quitar el último punto marcado |
| {{key:C}} | Línea característica: activar o desactivar los arcos (tras un vértice, haga clic en un punto de la curva y luego en su extremo) |
| {{key:Esc}} | Cancelar el dibujo (o el pegado); si se pulsa de nuevo (o sin nada dibujado), vuelve a {{ui:Select}} y borra la selección |

## Vista de plano

| Tecla o acción | Resultado |
|---|---|
| Rueda | Acercar o alejar en el puntero |
| Arrastrar en espacio vacío | Desplazar (en cualquier herramienta; un clic breve sigue haciendo clic; con {{key:Shift}} pulsado dibuja un recuadro de selección) |
| Arrastrar con el botón central | Desplazar |
| Arrastrar con el botón derecho | Desplazar (no se abre ningún menú) |
| {{key:Space}} y arrastrar | Desplazar |
| Clic | Seleccionar (con {{ui:Select}}), o colocar un punto (con una herramienta de dibujo) |
| {{key:Shift}} y clic | Añadir un punto topográfico a la selección, o quitarlo |
| {{key:Shift}} y arrastrar | Dibujar un recuadro: los puntos topográficos dentro se añaden a la selección. Arrastre alrededor de ellos para un [lazo](topic:lasso-selection) |
| {{key:Space}} mientras dibuja un lazo | Ventana, después cruce, después valla |
| Clic al pegar | Coloca allí los puntos pegados ({{key:Enter}} los pone en sus propias coordenadas) |
| Arrastrar un pinzamiento | Mover un PI, una esquina de plataforma o una estructura (un solo paso de deshacer) |
| {{key:Up}} {{key:Down}} {{key:Left}} {{key:Right}} | Desplazar, cuando el plano tiene el foco (haga clic primero en él) |
| {{key:Plus}} y {{key:Minus}} | Acercar y alejar en el centro, cuando el plano tiene el foco |

La tecla = acerca como {{key:Plus}}, así que no hace falta {{key:Shift}}.

## Vista de perfil

| Acción | Resultado |
|---|---|
| Clic con {{ui:Add PVIs}} activado | Añadir un PIV allí |
| Clic en un PIV | Seleccionarlo |
| Arrastrar un PIV | Moverlo (un solo paso de deshacer) |
| {{key:Delete}} o {{key:Backspace}} | Quitar el PIV seleccionado ({{key:Backspace}} solo cuando la vista de perfil tiene el foco) |

La vista de perfil no hace zoom ni desplazamiento.

## Pantalla y ayuda

| Tecla | Acción |
|---|---|
| {{key:F1}} | Abrir o cerrar esta ayuda (el panel lateral); {{ui:Help}} en la barra de la aplicación hace lo mismo |
| {{key:Esc}} | Cerrar el panel de ayuda cuando está abierto |
| {{key:Ctrl+Shift+F}} | Recorrer los modos de pantalla: pantalla completa, pantalla completa con las barras ocultas, normal |
| {{key:Esc}} | Salir de pantalla completa (tecla propia del navegador) |

{{key:F1}} llega a la ayuda antes que CivilCraft, así que funciona en cualquier herramienta. En la mayoría de teclados Mac, pulse fn con F1, o haga clic en {{ui:Help}}. {{key:Ctrl+Shift+F}} usa la tecla Control en todas las plataformas, incluido Mac. Véase [Usar la ayuda](common:help) para saber cómo buscar en esta ayuda.

## Ratón, panel táctil y pantalla táctil

:::mouse
- La rueda acerca y aleja en el puntero. Un ratón con rueda de giro libre hace zoom rápido: dé giros cortos.
- Desplace con cualquier arrastre en espacio vacío, con el botón central, con el botón derecho o con {{key:Space}} y arrastrar.
:::

:::mac
En un panel táctil de Mac:

- El desplazamiento con dos dedos hace **zoom** (no desplaza), y pellizcar también hace zoom.
- Para desplazar, presione y arrastre sobre espacio vacío con un dedo, o mantenga {{key:Space}} y arrastre.
- Un clic con dos dedos (clic derecho) no abre ningún menú y no hace nada por sí solo.
:::

:::touch
En una pantalla táctil:

- El primer toque hace que los botones y las filas de menú tengan el tamaño de un dedo.
- Toque para seleccionar o colocar un punto; un dedo arrastrado sobre espacio vacío desplaza. Un toque puede temblar un poco: solo desplaza cuando el dedo se ha movido unos 10 píxeles.
- Dos dedos pellizcan para hacer zoom y se mueven juntos para desplazar.
- Arrastre un pinzamiento o un PIV con un dedo. Los pinzamientos admiten un margen del ancho de un dedo a su alrededor.
- Mientras dibuja una alineación, plataforma, línea de ruptura, contorno, tramo de tubería, línea característica o parcela, una barra sobre el plano ofrece {{ui:Finish}} ({{key:Enter}}), {{ui:Undo point}} ({{key:Backspace}}) y {{ui:Cancel}} ({{key:Esc}}). Una pulsación larga (medio segundo sin moverse) también termina.
- En {{ui:Select}}, una pulsación larga sobre un punto topográfico lo añade a la selección, o lo quita, igual que hace {{key:Shift}} con un clic.
- En la vista 3D, un dedo orbita, dos pellizcan y desplazan, y un toque selecciona.
- En pantalla táctil no existe el puntero que pasa por encima, así que las lecturas de la barra de estado solo se actualizan mientras un dedo está apoyado.
:::

## Atajos del navegador que prevalecen

Algunas teclas pertenecen al navegador y nunca llegan a CivilCraft, por ejemplo {{key:Mod+W}} (cerrar pestaña), {{key:Mod+T}} (nueva pestaña), {{key:Mod+N}} (nueva ventana) y {{key:F11}} (pantalla completa en navegadores de Windows y Linux). CivilCraft no las usa. Si un atajo abre algo en el navegador, haga clic una vez en el plano para que la página tenga el foco, e inténtelo de nuevo.

## Dónde está Mover

No hay un comando Mover: elija {{ui:Select}} y arrastre un punto o un vértice, o edite sus coordenadas en {{ui:Properties}}. Véase [Editar puntos](topic:edit-points).
