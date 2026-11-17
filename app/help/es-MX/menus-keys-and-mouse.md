---
title: Menús, teclas y ratón
summary: Elija un estilo de menú que coincida con su forma de trabajar, asigne su propia tecla a cualquier comando, mueva comandos entre pestañas de la cinta, y defina qué hacen la rueda y los botones del ratón en el plano y en 3D.
keywords: estilo de menú, menús, cinta, cinta civil, barra de herramientas, línea de comandos, dibujo clásico, atajos de teclado, teclas de acceso rápido, teclas, personalizar, reasignar, ratón, rueda, invertir, dirección del zoom, botón central, botón derecho, encuadre, órbita, exportar, importar, cambiar, familiar
from: 07ac73a0
---

Los comandos de CivilCraft son los mismos sin importar cómo los invoque. Un **estilo de menú** solo decide dónde aparecen en pantalla, cómo se llaman allí y con qué teclas se ejecutan, para que pueda conservar sus hábitos. Elíjalo en {{ui:Configuración}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Menús, teclas y ratón}}; el cambio es inmediato y este navegador lo recuerda.

## Los tres estilos

| Estilo | Qué obtiene |
|---|---|
| {{ui:CivilCraft}} | La barra de herramientas propia de CivilCraft (Archivo, Exportar, Superficie, Diseño, Editar, GIS, Vista) y teclas simples: {{key:A}} alineación, {{key:G}} plataforma, {{key:P}} tuberías, {{key:B}} línea de ruptura, {{key:O}} límite, {{key:L}} línea de elemento, {{key:R}} perfil, {{key:X}} secciones, {{key:E}} nivelación, {{key:D}} 3D, {{key:F}} ajustar, {{key:V}} seleccionar. El punto de partida. |
| {{ui:Dibujo clásico}} | Una pequeña cinta ({{ui:Inicio}}, {{ui:Insertar}}, {{ui:Salida}}) y una línea de comandos, para quienes escriben comandos: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (deshacer), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Escriba en cualquier parte y las letras van a la línea de comandos; {{key:Enter}} ejecuta, {{key:Enter}} sin nada repite el último comando, {{key:Esc}} la borra. El botón central encuadra. |
| {{ui:Cinta civil}} | Pestañas de botones grandes, como agrupan sus herramientas los programas de diseño civil: {{ui:Inicio}} (datos del terreno, crear diseño, vistas de perfil y de sección), {{ui:Superficies}}, {{ui:Modificar}}, {{ui:Geolocalización}}, {{ui:Vista}} y {{ui:Salida}}, con un menú {{ui:Archivo}} y botones rápidos a la derecha. Las teclas simples se mantienen. El botón central encuadra el plano; en 3D, el botón central encuadra y {{key:Shift}} con el botón central orbita. |

Cada estilo conserva las teclas {{key:Mod}}: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
Una tecla que pertenece al diseño propio de CivilCraft, pero que su estilo asignó a otro comando, no hace nada, y la barra de estado indica adónde fue a parar su comando ("En Mis teclas, Pad es Ctrl+Alt+G"). {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} y las flechas siempre conservan su significado, y mientras dibuja una línea, sus puntos conservan sus teclas ({{key:Backspace}}, {{key:Enter}}).
:::

## Hágalo a su medida

1. Elija el estilo más cercano a lo que quiere y haga clic en {{ui:Personalizar…}}.
2. En {{ui:Teclas y menús}}, busque un comando (el cuadro de búsqueda ayuda). Haga clic en {{ui:Agregar una clave}} y pulse la tecla, o dos teclas seguidas para una tecla de dos letras. Haga clic en una tecla para quitarla.
3. Con una cinta, {{ui:Dónde está}} mueve el comando a otra pestaña y panel, al menú {{ui:Archivo}}, o a {{ui:Solo teclas}}.
4. En {{ui:Ratón}}, defina la rueda, los botones que encuadran el plano y lo que hace cada botón en la vista 3D.
5. Asígnele un nombre y haga clic en {{ui:Guardar}}.

Guardar un estilo integrado crea su propia copia ("Mi cinta civil"); el integrado nunca cambia. Una tecla asignada a dos comandos, o una que se ejecutaría antes de que pueda escribirse una tecla de dos letras, aparece en rojo y debe corregirse antes de guardar.

## Ratón

- **Rueda del ratón**: {{ui:Girar hacia arriba acerca}} (el inicio) o {{ui:Girar hacia arriba aleja}}, y qué tan rápido, en el plano y en 3D. Un pellizco en el panel táctil siempre hace zoom en el sentido en que se mueven sus dedos.
- **Encuadrar el plano con**: el botón central, el botón derecho, o ambos. {{key:Space}} y arrastrar también encuadran. El botón izquierdo siempre designa y dibuja.
- **Arrastrar en la vista 3D**: {{ui:Propios de cada vista}} conserva los botones de CivilCraft (el izquierdo orbita, el derecho encuadra). O bien, asigne a cada botón orbitar, encuadrar, hacer zoom o nada; {{key:Shift}} con el botón intercambia orbitar y encuadrar. Un clic sin arrastrar sigue designando.

## Llévela consigo

{{ui:Exportar}} guarda el estilo en uso como un pequeño archivo `.ccinput.json`; {{ui:Importar…}} agrega uno, desde otra computadora o de un colega. Un archivo importado solo puede apuntar a los comandos propios de CivilCraft: lo demás se omite y se cuenta en la barra de estado. {{ui:Eliminar este estilo}} quita uno de los suyos.

:::note
Estos ajustes se quedan en este navegador. {{ui:Usar este estilo en todas las apps}}, bajo las tarjetas de estilo, hace que cada app se abra en su estilo correspondiente (su propia barra de herramientas, una cinta o Dibujo clásico), con los cambios que hizo en cada app. CivilCraft no tiene un estilo de barra de menús: cuando se elige la barra de menús de otra app para todas las apps, CivilCraft conserva su propia barra de herramientas.
:::

Relacionado: [Teclado y ratón](topic:keyboard) · [Configuración de CivilCraft](topic:settings) · [Llegar desde otro software civil](topic:coming-from)
