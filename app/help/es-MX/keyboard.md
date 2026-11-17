---
title: Teclas y ratón
summary: Cada atajo de teclado y cada acción de ratón, panel táctil y pantalla táctil en CivilCraft, agrupados, con las diferencias del navegador y de la plataforma.
keywords: teclado, atajos, teclas de acceso rápido, teclas, ratón, panel táctil, pantalla táctil, encuadre, zoom, pellizco, rueda, clic derecho, mac, tecla command
from: a9756f46
---

Las teclas de una sola letra funcionan cuando no escribe en un cuadro. Los atajos con {{key:Mod}} usan Command en Mac y Ctrl en los demás sistemas. Vea también [Teclas en el navegador](common:keys).

## Archivos y edición

| Tecla | Acción |
|---|---|
| {{key:Mod+O}} | Abrir un archivo de puntos, LandXML o proyecto |
| {{key:Mod+S}} | Guardar el proyecto (descarga un archivo `.civilcraft.json`) |
| {{key:Mod+P}} | Trazar el plano a PDF (abre el cuadro de trazado, no la impresión del navegador) |
| {{key:Mod+Z}} | Deshacer |
| {{key:Mod+Y}} | Rehacer |
| {{key:Delete}} | Borrar los puntos topográficos, la alineación, la plataforma, la estructura, la tubería o el PIV seleccionados |
| {{key:Mod+C}} | Copiar los puntos topográficos seleccionados (también como filas de puntos para una hoja de cálculo) |
| {{key:Mod+X}} | Cortar los puntos topográficos seleccionados |
| {{key:Mod+V}} | Pegar puntos: siguen al puntero; haga clic donde deben ir |
| {{key:Mod+Shift+V}} | Pegar en el mismo lugar: en las coordenadas propias de los puntos |
| {{key:Mod+D}} | Duplicar los puntos seleccionados: una copia sigue al puntero |
| {{key:Mod+A}} | Seleccionar todos los puntos topográficos |
| {{key:Esc}} | No seleccionar nada (y cancelar un pegado) |

{{key:Mod+S}}, {{key:Mod+O}} y {{key:Mod+P}} funcionan incluso mientras escribe en un cuadro. {{key:Mod+Z}} y {{key:Mod+Y}} en un cuadro de texto deshacen lo que escribió, como de costumbre, y lo mismo hacen {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}} y {{key:Mod+A}}: en un cuadro copian, cortan, pegan y seleccionan su texto. Con texto seleccionado en la página (en un panel), {{key:Mod+C}} copia ese texto. {{key:Mod+Shift+Z}} no hace nada en CivilCraft: use {{key:Mod+Y}} o el botón {{ui:Rehacer}}.

:::mac
La tecla de Mac rotulada **delete** equivale a {{key:Backspace}} para el navegador. Para borrar una selección, pulse {{key:Delete}} (Fn y delete), o elija {{ui:Eliminar}} en el menú {{ui:Más}} de la barra de herramientas.
:::

## Herramientas

| Tecla | Herramienta |
|---|---|
| {{key:V}} | {{ui:Seleccionar}} |
| {{key:M}} | {{ui:Medir}}: distancias, áreas y pendientes en el plano ([Medir](topic:measure)) |
| {{key:A}} | {{ui:Alineación}} |
| {{key:G}} | {{ui:Plataforma}} |
| {{key:P}} | {{ui:Tuberías}} |
| {{key:B}} | {{ui:Línea de ruptura}} |
| {{key:O}} | {{ui:Contorno}} |
| {{key:R}} | Mostrar u ocultar la vista de perfil |
| {{key:I}} | Activar o desactivar {{ui:Agregar PIV}} (abre la vista de perfil si está cerrada) |
| {{key:F}} | {{ui:Ajustar}}: mostrar todo |
| {{key:D}} | {{ui:3D}}: mostrar el sitio en 3D, o volver al plano |
| {{key:E}} | Mostrar u ocultar pendientes y cotas a lo largo de cada línea característica (solo en pantalla) |

Pulsar la tecla de la herramienta activa de nuevo vuelve a {{ui:Seleccionar}}. Las letras con Shift no hacen nada.

## Mientras dibuja

| Tecla | Acción |
|---|---|
| {{key:Enter}} | Terminar la alineación, plataforma, tramo de tubería, línea de ruptura o contorno |
| {{key:Backspace}} | Quitar el último punto marcado |
| {{key:C}} | Línea característica: activar o desactivar arcos (después de un vértice, haga clic en un punto de la curva, y luego en su extremo) |
| {{key:Esc}} | Cancelar el dibujo (o el pegado); si lo pulsa de nuevo (o si no hay nada dibujado), vuelve a {{ui:Seleccionar}} y quita la selección |

## Vista de plano

| Tecla o acción | Resultado |
|---|---|
| Rueda | Acercar o alejar en el puntero |
| Arrastrar en un espacio vacío | Encuadrar (en cualquier herramienta; un clic breve sigue haciendo clic; con {{key:Shift}} pulsado dibuja un recuadro de selección) |
| Arrastrar con el botón central | Encuadrar |
| Arrastrar con el botón derecho | Encuadrar (no se abre ningún menú) |
| {{key:Space}} y arrastrar | Encuadrar |
| Clic | Seleccionar (con {{ui:Seleccionar}}), o colocar un punto (con una herramienta de dibujo) |
| {{key:Shift}} y clic | Agregar un punto topográfico a la selección, o quitarlo |
| {{key:Shift}} y arrastrar | Dibujar un recuadro: los puntos topográficos dentro se agregan a la selección. Arrastre alrededor de ellos para un [lazo](topic:lasso-selection) |
| {{key:Space}} mientras dibuja un lazo | Ventana, luego captura, luego borde |
| Clic mientras pega | Coloca ahí los puntos pegados ({{key:Enter}} los coloca en sus propias coordenadas) |
| Arrastrar un pinzamiento | Desplazar un PI, una esquina de plataforma o una estructura (un paso de deshacer) |
| {{key:Up}} {{key:Down}} {{key:Left}} {{key:Right}} | Encuadrar, cuando el plano tiene el foco (haga clic primero en él) |
| {{key:Plus}} y {{key:Minus}} | Acercar y alejar en el centro, cuando el plano tiene el foco |

La tecla = acerca igual que {{key:Plus}}, así que no necesita Shift.

## Vista de perfil

| Acción | Resultado |
|---|---|
| Clic con {{ui:Agregar PIV}} activado | Agrega un PIV ahí |
| Clic en un PIV | Lo selecciona |
| Arrastrar un PIV | Lo mueve (un paso de deshacer) |
| {{key:Delete}} o {{key:Backspace}} | Quita el PIV seleccionado ({{key:Backspace}} solo cuando la vista de perfil tiene el foco) |

La vista de perfil no acerca ni encuadra.

## Pantalla y ayuda

| Tecla | Acción |
|---|---|
| {{key:F1}} | Abrir o cerrar esta ayuda (el panel lateral); {{ui:Ayuda}} en la barra de la aplicación hace lo mismo |
| {{key:Esc}} | Cerrar el panel de ayuda cuando está abierto |
| {{key:Ctrl+Shift+F}} | Cambiar entre los modos de pantalla: pantalla completa, pantalla completa con las barras ocultas, normal |
| {{key:Esc}} | Salir de pantalla completa (tecla propia del navegador) |

{{key:F1}} llega a la ayuda antes que CivilCraft, así que funciona en cualquier herramienta. En la mayoría de los teclados Mac, pulse fn con F1, o haga clic en {{ui:Ayuda}}. {{key:Ctrl+Shift+F}} usa la tecla Control en todas las plataformas, incluido Mac. Vea [Uso de la ayuda](common:help) para saber cómo buscar en esta ayuda.

## Ratón, panel táctil y pantalla táctil

:::mouse
- La rueda acerca o aleja en el puntero. Un ratón con rueda de giro libre hace zoom rápido: dé giros cortos.
- Encuadre con cualquier arrastre en espacio vacío, con el botón central, con el botón derecho, o con {{key:Space}} y arrastrar.
:::

:::mac
En el panel táctil de Mac:

- Desplazar con dos dedos **acerca o aleja** (no encuadra), y el pellizco también acerca o aleja.
- Para encuadrar, presione y arrastre en espacio vacío con un dedo, o mantenga {{key:Space}} y arrastre.
- Un clic con dos dedos (clic derecho) no abre ningún menú y no hace nada por sí solo.
:::

:::touch
En una pantalla táctil:

- El primer toque hace que los botones y las filas de menú tengan el tamaño de un dedo.
- Toque para seleccionar o colocar un punto; un dedo arrastrado en espacio vacío encuadra. Un toque puede tambalear un poco: solo encuadra cuando el dedo se mueve unos 10 píxeles.
- Dos dedos pellizcan para acercar o alejar, y se mueven juntos para encuadrar.
- Arrastre un pinzamiento o un PIV con un dedo. Los pinzamientos tienen un margen del ancho de un dedo a su alrededor.
- Mientras dibuja una alineación, plataforma, línea de ruptura, contorno, tramo de tubería, línea característica o parcela, una barra sobre el plano ofrece {{ui:Terminar}} ({{key:Enter}}), {{ui:Deshacer punto}} ({{key:Backspace}}) y {{ui:Cancelar}} ({{key:Esc}}). Una pulsación larga (medio segundo sin moverse) también termina.
- En {{ui:Seleccionar}}, una pulsación larga sobre un punto topográfico lo agrega a la selección, o lo quita, igual que {{key:Shift}}+clic.
- En la vista 3D, un dedo orbita, dos pellizcan y encuadran, y un toque selecciona.
- En pantalla táctil no hay vista previa al pasar el puntero, así que las lecturas de la barra de estado se actualizan solo mientras un dedo está apoyado.
:::

## Teclas del navegador que tienen prioridad

Algunas teclas pertenecen al navegador y nunca llegan a CivilCraft, por ejemplo {{key:Mod+W}} (cerrar pestaña), {{key:Mod+T}} (nueva pestaña), {{key:Mod+N}} (nueva ventana) y {{key:F11}} (pantalla completa en navegadores de Windows y Linux). CivilCraft no las usa. Si un atajo abre algo en el navegador, haga clic una vez en el plano para que la página tenga el foco, e inténtelo de nuevo.

## Dónde está Desplazar

No hay un comando Desplazar: elija {{ui:Seleccionar}} y arrastre un punto o un vértice, o edite sus coordenadas en {{ui:Propiedades}}. Vea [Editar puntos](topic:edit-points).
