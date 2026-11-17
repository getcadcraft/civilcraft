---
title: Menús, teclas y ratón
summary: Elija un estilo de menú que se ajuste a su forma de trabajar, asigne su propia tecla a cualquier comando, mueva comandos entre las pestañas de la cinta y defina qué hacen la rueda y los botones del ratón en el plano y en 3D.
keywords: estilo de menú, menús, cinta, cinta civil, barra de herramientas, línea de comandos, dibujo clásico, atajos de teclado, teclas de acceso rápido, teclas, personalizar, reasignar, ratón, rueda, invertir, dirección del zoom, botón central, botón derecho, desplazar, orbitar, exportar, importar, cambiar, familiar
from: 07ac73a0
---

Los comandos de CivilCraft son los mismos sea cual sea la forma de acceder a ellos. Un **estilo de menú** solo decide dónde aparecen en pantalla, cómo se llaman allí y qué teclas los ejecutan, para que pueda conservar sus hábitos. Elíjalo en {{ui:Settings}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Menus, keys and mouse}}; el cambio es inmediato, y este navegador lo recuerda.

## Los tres estilos

| Estilo | Qué obtiene |
|---|---|
| {{ui:CivilCraft}} | La barra de herramientas propia de CivilCraft (File, Export, Surface, Design, Edit, GIS, View) y teclas simples: {{key:A}} alineación, {{key:G}} plataforma, {{key:P}} tuberías, {{key:B}} línea de ruptura, {{key:O}} límite, {{key:L}} línea de elementos, {{key:R}} perfil, {{key:X}} secciones, {{key:E}} rasantes, {{key:D}} 3D, {{key:F}} ajustar, {{key:V}} seleccionar. La opción inicial. |
| {{ui:Drafting classic}} | Una cinta pequeña ({{ui:Home}}, {{ui:Insert}}, {{ui:Output}}) y una línea de comandos, para quienes escriben los comandos: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (deshacer), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Empiece a escribir en cualquier lugar y las letras irán a la línea de comandos; {{key:Enter}} ejecuta; {{key:Enter}} sin nada repite el último comando; {{key:Esc}} la borra. El botón central desplaza la vista. |
| {{ui:Civil ribbon}} | Pestañas de botones grandes, tal como los programas de diseño civil agrupan sus herramientas: {{ui:Home}} (datos del terreno, crear diseño, vistas de perfil y de sección), {{ui:Surfaces}}, {{ui:Modify}}, {{ui:Geolocation}}, {{ui:View}} y {{ui:Output}}, con un menú {{ui:File}} y botones rápidos a la derecha. Las teclas simples se mantienen. El botón central desplaza el plano; en 3D, el botón central desplaza la vista y {{key:Shift}} con el botón central la orbita. |

Todos los estilos conservan las teclas {{key:Mod}}: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
Una tecla que pertenece a la distribución propia de CivilCraft, pero que su estilo asignó a otro comando, no hace nada, y la línea de estado indica adónde fue a parar su comando ("En Mis teclas, Plataforma es Ctrl+Alt+G"). {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} y las flechas conservan siempre su significado, y mientras dibuja una línea sus puntos conservan sus teclas ({{key:Backspace}}, {{key:Enter}}).
:::

## Adáptelo a su gusto

1. Elija el estilo más parecido a lo que quiere y haga clic en {{ui:Customize…}}.
2. En {{ui:Keys and menus}}, busque un comando (el cuadro de búsqueda ayuda). Haga clic en {{ui:Add a key}} y pulse la tecla, o dos teclas seguidas para una tecla de dos letras. Haga clic en una tecla para quitarla.
3. Con una cinta, {{ui:Where it sits}} mueve el comando a otra pestaña y otro panel, al menú {{ui:File}} o a {{ui:Keys only}}.
4. En {{ui:Mouse}}, defina la rueda, los botones que desplazan el plano y qué hace cada botón en la vista 3D.
5. Ponga un nombre y haga clic en {{ui:Save}}.

Guardar un estilo integrado crea su propia copia ("Mi cinta civil"); el integrado nunca cambia. Una tecla asignada a dos comandos, o una que se ejecutaría antes de que pudiera escribirse una tecla de dos letras, aparece en rojo y hay que corregirla antes de guardar.

## Ratón

- **Rueda del ratón**: {{ui:Scroll up zooms in}} (la opción inicial) o {{ui:Scroll up zooms out}}, y su velocidad, en el plano y en 3D. Un pellizco en el panel táctil siempre hace zoom según se mueven los dedos.
- **Desplazar el plano con**: el botón central, el botón derecho, o ambos. {{key:Space}} y arrastrar también desplazan. El botón izquierdo siempre selecciona y dibuja.
- **Arrastrar en la vista 3D**: {{ui:Propio de cada vista}} mantiene los botones de CivilCraft (el izquierdo orbita, el derecho desplaza). O bien asigne a cada botón orbitar, desplazar, hacer zoom o nada; {{key:Shift}} con el botón intercambia orbitar y desplazar. Un clic sin arrastrar sigue seleccionando.

## Llévelo consigo

{{ui:Export}} guarda el estilo en uso como un pequeño archivo `.ccinput.json`; {{ui:Import…}} añade uno, desde otro ordenador o de un colaborador. Un archivo importado solo puede apuntar a los comandos propios de CivilCraft: cualquier otra cosa se omite y se cuenta en la línea de estado. {{ui:Delete this style}} elimina uno de los suyos.

:::note
Estos ajustes se quedan en este navegador. {{ui:Use this style in every app}} bajo las tarjetas de estilo hace que cada aplicación se abra en su estilo correspondiente (su propia barra de herramientas, una cinta o Dibujo clásico), con los cambios que haya hecho en cada aplicación. CivilCraft no tiene estilo de barra de menús: cuando la barra de menús de otra aplicación se elige para todas las aplicaciones, CivilCraft conserva su propia barra de herramientas.
:::

Relacionados: [Teclado y ratón](topic:keyboard) · [Configuración de CivilCraft](topic:settings) · [Si viene de otro software civil](topic:coming-from)
