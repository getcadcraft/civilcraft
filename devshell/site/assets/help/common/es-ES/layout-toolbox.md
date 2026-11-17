---
title: Trabajar con la disposición de caja de herramientas y cuadro de información
summary: Cambie la aplicación a una columna de herramientas a la izquierda con huecos para las suyas, un cuadro de información a lo ancho de la parte superior que sigue a la herramienta en curso o a lo que haya seleccionado, un navegador a la derecha, una pestaña para cada vista, opciones rápidas y una paleta de edición, y vuelva a la disposición clásica cuando quiera.
keywords: disposición, espacio de trabajo, caja de herramientas, columna de herramientas, cuadro de información, barra de información, navegador, mapa del proyecto, barra rápida, opciones rápidas, paleta de edición, paleta contextual, mis herramientas, herramientas favoritas, pestañas de vista, ventana de la caja de herramientas, disposición clásica, cambiar disposición, cambiar de disposición
from: ec341666
---

**Caja de herramientas y cuadro de información** es una de las tres disposiciones de espacio de trabajo de la aplicación. Las herramientas de dibujo se colocan en una columna a la izquierda, un cuadro de información recorre la parte superior y muestra lo que necesita la herramienta en curso o lo que ha seleccionado, cada vista tiene una pestaña, y una barra rápida bajo el dibujo reúne unas pocas opciones habituales. Las herramientas son las propias de la aplicación: todo lo que puede hacer en la disposición clásica funciona también aquí, y su dibujo, su estilo de menús y sus atajos siguen igual.

## Elegirla

1. Abra {{ui:Ajustes}} (el engranaje, o {{key:Mod+,}}).
2. Elija la pestaña {{ui:Global}} y vaya a {{ui:Disposición}} › {{ui:Espacio de trabajo}}.
3. Elija {{ui:Caja de herramientas y cuadro de información}}.

La disposición cambia al momento. La elección es una sola para todas las aplicaciones de este navegador: cada aplicación se abre en ella a partir de entonces, y está lista antes de que se dibuje la página, así que nunca verá antes la disposición clásica.

## Qué hay en cada zona

- **Barra de herramientas:** la barra propia de la aplicación se mantiene arriba del área de dibujo, con sus menús.
- **Cuadro de información:** bajo la barra de herramientas. Mientras una herramienta se ejecuta, muestra la herramienta y lo que pide. Cuando elige algo, muestra sus ajustes principales (para un muro: su tipo, grosor, longitud, línea de ubicación y altura), y puede cambiarlos ahí mismo: un cambio ahí es igual que en Propiedades, y {{key:Mod+Z}} lo deshace. Si no hay nada seleccionado, dice "Nada seleccionado". Cada aplicación añade sus propios cuadros aquí, como la capa o el nivel actual, o el documento abierto.
- **Caja de herramientas:** la columna de la izquierda, con las herramientas de la aplicación en grupos. Haga clic en el nombre de un grupo para plegarlo o volver a abrirlo. La herramienta en curso aparece iluminada.
- **Mis herramientas:** el primer grupo de la caja de herramientas, con ocho huecos vacíos para las herramientas que más usa. Haga clic en un hueco vacío para elegir cualquier herramienta o comando de la aplicación; o haga clic derecho en una herramienta de la caja y elija {{ui:Añadir a Mis herramientas}}; o arrastre una herramienta hasta un hueco. Haga clic derecho en un hueco para cambiarlo o vaciarlo. Sus huecos se guardan para cada aplicación en este navegador.
- **Navegador:** el panel derecho. El explorador de proyectos de la aplicación va arriba (plantas, secciones, alzados, vistas 3D, tablas, hojas, según las tenga la aplicación): haga clic en una para abrirla. Debajo, {{ui:Propiedades}} y una pestaña con el resto del contenido del panel derecho.
- **Pestañas de vista:** una pestaña por cada vista del archivo abierto (una hoja, una planta, una escena…), sobre el dibujo.
- **Barra rápida:** bajo el dibujo, los ajustes de vista y las opciones habituales de la aplicación, como la escala, el nivel de detalle, el rango de vista, ajustar, planta, dividir o 3D, referencias a objetos y unidades.
- **Paleta de edición:** haga clic en algo del dibujo y aparece junto al puntero una pequeña paleta con los comandos de edición de la aplicación para ello, como mover, copiar, girar, simetría, duplicar o borrar, y {{ui:Propiedades}}. {{key:Esc}}, la rueda del ratón, otro clic o su botón de cerrar la retiran.

Una herramienta que no puede ejecutarse en este momento aparece atenuada, y su información sobre herramienta indica por qué. Haga clic en ella, o pulse {{key:Enter}} sobre ella, para leer el motivo en un cuadro.

{{key:Esc}} termina primero la herramienta en curso, como en la disposición clásica, y todos los atajos y {{key:Ctrl+Shift+F}} (modos de pantalla) funcionan como antes.

## Dar a la caja de herramientas una ventana propia

El botón {{ui:Mover la caja de herramientas}} en la parte superior de la caja tiene {{ui:Mover a una ventana nueva}}: la caja se abre en una ventana estrecha propia que puede colocar junto a la aplicación o en un segundo monitor. Las teclas que pulse allí llegan a la aplicación. {{ui:Devolver la caja de herramientas a su sitio}}, o cerrar esa ventana, la trae de vuelta.

La configuración de la barra de herramientas se aplica también a la caja de herramientas: {{ui:Ajustes}} › {{ui:Global}} › {{ui:Barra de herramientas}} › {{ui:Iconos y etiquetas}}, {{ui:Solo iconos}} o {{ui:Solo etiquetas}}, y {{ui:Mostrar los nombres de grupo (Archivo, Dibujo, …)}}.

## Sus paneles siguen siendo suyos

Los paneles izquierdo y derecho conservan todo lo descrito en [Organizar los paneles](common:arrange-panels): acoplar, flotar, anclar, ocultar, pestañas, {{ui:Mover a una ventana nueva}} y {{ui:Restablecer la disposición}}.

## Volver a la disposición clásica

Abra {{ui:Ajustes}} › {{ui:Global}} › {{ui:Disposición}} › {{ui:Espacio de trabajo}} y elija {{ui:CadCraft clásico}}. Cada barra de herramientas, pestaña y panel vuelve a donde estaba.

:::note
En un teléfono, o en una ventana de 760 píxeles de ancho o menos, la aplicación usa su disposición de teléfono sea cual sea la que haya elegido. Una ventana más ancha devuelve su disposición.
:::

Para probar otra disposición, vea [la disposición de cinta y explorador de proyectos](common:layout-ribbon).

Para cambiar lo que muestra esta disposición, vea [Cambiar una disposición en pantalla](common:layout-edit); para una disposición oscura, con menú y cinta, vea [la disposición Drafting](common:layout-drafting).
