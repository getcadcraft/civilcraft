---
title: Menús, teclas y mouse
summary: Elija un estilo de menú que coincida con su forma de trabajar, asigne a cualquier comando su propia tecla, mueva comandos entre pestañas de la cinta y defina qué hacen la rueda y los botones del mouse en el plano y en 3D.
keywords: estilo de menú, menús, cinta, cinta de civil, barra de herramientas, línea de comandos, dibujo clásico, atajos de teclado, teclas rápidas, teclas, personalizar, reasignar, mouse, rueda, invertir, dirección del zoom, botón central, botón derecho, desplazar, orbitar, exportar, importar, cambiar, conocido
from: 07ac73a0
---

Los comandos de CivilCraft son los mismos sin importar por dónde se llegue a ellos. Un **estilo de menú** solo decide dónde se ubican en pantalla, cómo se llaman allí y qué teclas los ejecutan, para que pueda mantener sus hábitos. Elíjalo en {{ui:Configuración}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Menús, teclas y mouse}}; el cambio es inmediato, y este navegador lo recuerda.

## Los tres estilos

| Estilo | Lo que obtiene |
|---|---|
| {{ui:CivilCraft}} | La barra de herramientas propia de CivilCraft (Archivo, Exportar, Superficie, Diseño, Edición, GIS, Vista) y teclas simples: {{key:A}} alineamiento, {{key:G}} plataforma, {{key:P}} caños, {{key:B}} línea de quiebre, {{key:O}} límite, {{key:L}} línea característica, {{key:R}} perfil, {{key:X}} cortes, {{key:E}} movimiento de suelo, {{key:D}} 3D, {{key:F}} ajustar, {{key:V}} seleccionar. El punto de partida. |
| {{ui:Dibujo clásico}} | Una cinta pequeña ({{ui:Inicio}}, {{ui:Insertar}}, {{ui:Salida}}) y una línea de comandos, para quienes escriben comandos: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (deshacer), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Empiece a escribir en cualquier lugar y las letras van a la línea de comandos; {{key:Enter}} ejecuta, {{key:Enter}} sin nada repite el último comando, {{key:Esc}} la borra. El botón central desplaza. |
| {{ui:Cinta de civil}} | Pestañas de botones grandes, como las agrupan los programas de diseño civil: {{ui:Inicio}} (datos del terreno, crear diseño, vistas de perfil y de corte), {{ui:Superficies}}, {{ui:Modificar}}, {{ui:Geolocalización}}, {{ui:Vista}} y {{ui:Salida}}, con un menú {{ui:Archivo}} y botones rápidos a la derecha. Las teclas simples se mantienen. El botón central desplaza el plano; en 3D, el botón central desplaza y {{key:Shift}} con el botón central orbita. |

Todos los estilos mantienen las teclas {{key:Mod}}: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
Una tecla que pertenece al diseño propio de CivilCraft, pero que su estilo asignó a otro comando, no hace nada, y la línea de estado indica adónde fue su comando ("En Mis teclas, Plataforma es Ctrl+Alt+G"). {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} y las flechas siempre conservan su función, y mientras dibuja una línea sus puntos conservan sus teclas ({{key:Backspace}}, {{key:Enter}}).
:::

## Hágalo suyo

1. Elija el estilo más cercano a lo que quiere y luego haga clic en {{ui:Personalizar…}}.
2. En {{ui:Teclas y menús}}, busque un comando (el cuadro de búsqueda ayuda). {{ui:Emoĩ clave}} y presione la tecla, o dos teclas seguidas para una tecla de dos letras. Haga clic en una tecla para quitarla.
3. Con una cinta, {{ui:Dónde está}} mueve el comando a otra pestaña y panel, al menú {{ui:Archivo}}, o a {{ui:Solo teclas}}.
4. En {{ui:Mouse}}, defina la rueda, los botones que desplazan el plano y qué hace cada botón en la vista 3D.
5. Póngale un nombre y haga clic en {{ui:Guardar}}.

Guardar un estilo integrado crea su propia copia ("Mi cinta de civil"); el integrado nunca cambia. Una tecla asignada a dos comandos, o una que se ejecutaría antes de que se pueda escribir una tecla de dos letras, aparece en rojo y hay que corregirla antes de guardar.

## Mouse

- **Rueda del mouse**: {{ui:Subir la rueda acerca}} (el inicio) o {{ui:Subir la rueda aleja}}, y qué tan rápido, en el plano y en 3D. Un pellizco en el trackpad siempre acerca o aleja según se mueven los dedos.
- **Desplazar el plano con**: el botón central, el botón derecho o ambos. {{key:Space}} y arrastrar también desplaza. El botón izquierdo siempre selecciona y dibuja.
- **Arrastrar en la vista 3D**: {{ui:Cada vista tiene la suya}} mantiene los botones de CivilCraft (izquierdo orbita, derecho desplaza). O asigne a cada botón orbitar, desplazar, acercar o ninguno; {{key:Shift}} con el botón cambia orbitar y desplazar. Un clic sin arrastrar igual selecciona.

## Llévelo consigo

{{ui:Exportar}} guarda el estilo en uso como un archivo `.ccinput.json` pequeño; {{ui:Importar…}} agrega uno, desde otra computadora o de un colega. Un archivo importado solo puede apuntar a los comandos propios de CivilCraft: lo demás se omite y se cuenta en la línea de estado. {{ui:Eliminar este estilo}} quita uno de los suyos.

:::note
Estos ajustes quedan en este navegador. {{ui:Usar este estilo en todas las aplicaciones}}, bajo las tarjetas de estilo, hace que cada aplicación abra en su estilo correspondiente (su propia barra, una cinta o Dibujo clásico), con los cambios que hizo en cada una. CivilCraft no tiene estilo de barra de menús: cuando se elige la barra de menús de otra aplicación para todas, CivilCraft conserva su propia barra de herramientas.
:::

Relacionado: [Teclado y mouse](topic:keyboard) · [Configuración de CivilCraft](topic:settings) · [Venir desde otro software de civil](topic:coming-from)
