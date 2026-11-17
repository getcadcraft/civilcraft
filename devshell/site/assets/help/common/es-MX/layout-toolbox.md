---
title: Trabajar en el diseño de caja de herramientas y cuadro de información
summary: Cambie la aplicación a una columna de herramientas a la izquierda con espacios para las suyas, un cuadro de información en la parte superior que sigue a la herramienta en uso o a lo que eligió, un navegador a la derecha, una pestaña por cada vista, opciones rápidas y una paleta de edición, y vuelva al diseño clásico cuando quiera.
keywords: diseño, espacio de trabajo, caja de herramientas, columna de herramientas, cuadro de información, barra de información, navegador, mapa de proyecto, barra rápida, opciones rápidas, paleta de edición, paleta de mascota, mis herramientas, herramientas favoritas, pestañas de vista, ventana de la caja de herramientas, diseño clásico, cambiar diseño, cambiar de diseño
from: ec341666
---

**Caja de herramientas y cuadro de información** es uno de los tres diseños de espacio de trabajo de la aplicación. Las herramientas de dibujo están en una columna a la izquierda, un cuadro de información en la parte superior muestra lo que necesita la herramienta en uso o lo que tiene seleccionado, cada vista tiene una pestaña, y una barra rápida debajo del dibujo tiene algunas opciones de uso frecuente. Las herramientas son de la propia aplicación: todo lo que puede hacer en el diseño clásico funciona aquí también, y su dibujo, su estilo de menú y sus teclas se mantienen igual.

## Elegirlo

1. Abra {{ui:Configuración}} (el engrane, o {{key:Mod+,}}).
2. Elija la pestaña {{ui:Global}} y vaya a {{ui:Diseño}} › {{ui:Espacio de trabajo}}.
3. Elija {{ui:Caja de herramientas y cuadro de información}}.

El diseño cambia de inmediato. La elección es una sola para todas las aplicaciones de este navegador: cada aplicación se abre en él desde ese momento, y queda listo antes de que se dibuje la página, así que nunca ve primero el diseño clásico.

## Qué hay dónde

- **Barra de herramientas:** la barra propia de la aplicación se queda en la parte superior del área de dibujo, con sus menús.
- **Cuadro de información:** debajo de la barra de herramientas. Mientras una herramienta se ejecuta, muestra la herramienta y lo que pide. Cuando elige algo, muestra sus ajustes principales (para un muro: su tipo, grosor, longitud, línea de ubicación y altura), y puede cambiarlos ahí mismo: un cambio ahí es igual que en Propiedades, y {{key:Mod+Z}} lo deshace. Si no hay nada seleccionado, dice «Nada seleccionado». Cada aplicación agrega sus propios recuadros aquí, como la capa o el nivel actual, o el documento abierto.
- **Caja de herramientas:** la columna a la izquierda, con las herramientas de la aplicación en grupos. Haga clic en el nombre de un grupo para plegarlo o abrirlo de nuevo. La herramienta en ejecución aparece iluminada.
- **{{ui:Mis herramientas}}:** el primer grupo de la caja de herramientas, con ocho espacios vacíos para las herramientas que más usa. Haga clic en un espacio vacío para elegir cualquier herramienta o comando de la aplicación; o haga clic derecho en una herramienta de la caja y elija {{ui:Agregar a Mis herramientas}}; o arrastre una herramienta a un espacio. Haga clic derecho en un espacio para cambiarlo o vaciarlo. Sus espacios se guardan para cada aplicación en este navegador.
- **Navegador:** el panel derecho. El navegador de proyecto de la aplicación está arriba (planos, secciones, elevaciones, vistas 3D, tablas, hojas, según tenga la aplicación): haga clic en uno para abrirlo. Debajo, {{ui:Propiedades}} y una pestaña con el resto del contenido del panel derecho.
- **Pestañas de vista:** una pestaña por cada vista del archivo abierto (una hoja, una planta, una escena…), sobre el dibujo.
- **Barra rápida:** debajo del dibujo, las opciones de vista y las opciones de uso frecuente que tenga la aplicación, como la escala, el nivel de detalle, el rango de vista, ajustar, planta, dividir o 3D, referencias y unidades.
- **Paleta de edición:** haga clic en algo del dibujo y aparece junto al puntero una pequeña paleta con los comandos de edición de la aplicación para ello, como desplazar, copiar, girar, simetría, duplicar o eliminar, y {{ui:Propiedades}}. {{key:Esc}}, la rueda del mouse, otro clic o su botón de cerrar la retiran.

Una herramienta que no puede ejecutarse en ese momento aparece en gris, y su información sobre herramienta indica por qué. Haga clic en ella, o pulse {{key:Enter}} sobre ella, para leer el motivo en un cuadro.

{{key:Esc}} termina primero la herramienta en uso, como en el diseño clásico, y todos los atajos y {{key:Ctrl+Shift+F}} (modos de pantalla) funcionan como antes.

## Dar a la caja de herramientas su propia ventana

El botón {{ui:Mover la caja de herramientas}} en la parte superior de la caja tiene {{ui:Mover a una ventana nueva}}: la caja se abre en una ventana estrecha propia que puede colocar junto a la aplicación o en un segundo monitor. Las teclas que pulse ahí llegan a la aplicación. {{ui:Regresar la caja de herramientas}}, o cerrar esa ventana, la devuelve a su lugar.

La configuración de la barra de herramientas también se aplica a la caja de herramientas: {{ui:Configuración}} › {{ui:Global}} › {{ui:Barra de herramientas}} › {{ui:Iconos y etiquetas}}, {{ui:Solo iconos}} o {{ui:Solo etiquetas}}, y {{ui:Mostrar nombres de grupo (Archivo, Dibujo, …)}}.

## Sus paneles siguen siendo suyos

Los paneles izquierdo y derecho conservan todo lo descrito en [Organizar los paneles](common:arrange-panels): acoplar, flotar, fijar, ocultar, pestañas, {{ui:Mover a una ventana nueva}} y {{ui:Restablecer diseño}}.

## Volver al diseño clásico

Abra {{ui:Configuración}} › {{ui:Global}} › {{ui:Diseño}} › {{ui:Espacio de trabajo}} y elija {{ui:CadCraft clásico}}. Cada barra de herramientas, pestaña y panel regresa a donde estaba.

:::note
En un teléfono, o en una ventana de 760 píxeles de ancho o menos, la aplicación usa su diseño para teléfono sin importar lo que haya elegido. Una ventana más ancha vuelve a mostrar su diseño.
:::

Para probar otra disposición, vea [el diseño de cinta y navegador de proyecto](common:layout-ribbon).

Para cambiar lo que muestra este diseño, vea [Cambiar un diseño en la pantalla](common:layout-edit); para una disposición oscura con barra de menús y cinta, vea [el diseño Drafting](common:layout-drafting).
