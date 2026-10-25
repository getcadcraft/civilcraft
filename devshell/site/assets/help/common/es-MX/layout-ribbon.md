---
title: Trabajar con el diseño de cinta y navegador de proyecto
summary: Cambie la aplicación a una cinta de pestañas sobre el dibujo, con Propiedades y un navegador de proyecto a la izquierda y una pestaña por cada vista abierta, y vuelva al diseño clásico cuando quiera.
keywords: diseño, espacio de trabajo, cinta, pestañas de la cinta, navegador de proyecto, navegador, paletas, paleta de propiedades, pestañas de vista, barra de estado, acceso rápido, contraer la cinta, minimizar la cinta, ventana de la cinta, diseño clásico, cambiar de diseño
from: c1a6eccc
---

**Cinta y navegador de proyecto** es uno de los tres diseños de espacio de trabajo de la aplicación. Una cinta de pestañas recorre la parte de arriba, Propiedades y un navegador de proyecto comparten el panel izquierdo, cada vista que abre tiene su pestaña sobre el dibujo y abajo hay una barra de estado. Las herramientas son las de la aplicación: todo lo que puede hacer en el diseño clásico funciona aquí también, y su dibujo, su estilo de menú y sus teclas siguen igual.

## Elegirlo

1. Abra {{ui:Configuración}} (el engrane, o {{key:Mod+,}}).
2. Elija la pestaña {{ui:Global}} y vaya a {{ui:Diseño}} › {{ui:Espacio de trabajo}}.
3. Elija {{ui:Cinta y navegador de proyecto}}.

El diseño cambia de inmediato. La elección vale para todas las aplicaciones en este navegador: cada una abre con él desde entonces, y está listo antes de que se dibuje la página, así que nunca verá primero el diseño clásico.

## Qué hay en cada lugar

- **Barra de título:** el nombre de la aplicación, botones de acceso rápido (abrir, guardar, deshacer, rehacer), el nombre del archivo abierto, {{ui:Qué hace aquí cada herramienta}} (una lista de todas las herramientas con un cuadro de búsqueda, que dice cuáles están listas y por qué las demás no), pantalla completa, {{ui:Ayuda}} y {{ui:Configuración}}. En este diseño la barra de título ocupa el lugar de la barra de la aplicación.
- **Cinta:** las herramientas de la aplicación en pestañas, cada pestaña en grupos. {{ui:Archivo}}, a la izquierda, abre, guarda y lo demás. Algunas aplicaciones agregan una pestaña propia mientras trabaja en un modo o espacio de trabajo; se ilumina mientras aplica y desaparece después.
- **Barra de opciones:** debajo de la cinta, lo que la herramienta en curso le pide, o lo que está seleccionado.
- **Panel izquierdo:** {{ui:Propiedades}} arriba y, debajo, las paletas (el navegador de proyecto y el contenido propio del panel) como pestañas. Arrastre la línea entre ellas para repartir el espacio.
- **Pestañas de vista:** una pestaña por cada vista que abrió (una hoja, una planta, una escena…). Cierre una con su botón de cerrar; el archivo sigue abierto.
- **Barra de vista y barra de estado:** debajo del dibujo, los controles de la vista (escala, zoom); abajo del todo, los mensajes de la aplicación.

Una herramienta que no puede usarse ahora aparece en gris, y su información emergente dice por qué (por ejemplo, "Abra primero un archivo", o que la aplicación aún no tiene esa herramienta). Haga clic en ella, o pulse {{key:Enter}} sobre ella, para leer el motivo en un cuadro.

## Usar la cinta con el teclado

Con una pestaña de la cinta enfocada, {{key:Left}} y {{key:Right}} pasan de una pestaña a otra, y {{key:Home}} y {{key:End}} van a la primera y a la última. {{key:Esc}} termina primero la herramienta en curso, como en el diseño clásico, y todos los atajos y {{key:Ctrl+Shift+F}} (modos de pantalla) funcionan como antes.

## Contraer la cinta o darle su propia ventana

- Haga doble clic en una pestaña de la cinta para contraerla a sus pestañas; entonces un clic en una pestaña muestra sus herramientas hasta que siga con otra cosa. Haga doble clic otra vez para mantenerla abierta. El botón {{ui:Mover la cinta}}, en el extremo derecho de la cinta, también tiene {{ui:Contraer la cinta}} y {{ui:Mantener la cinta abierta}}. Cada aplicación lo recuerda.
- {{ui:Mover la cinta}} › {{ui:Mover a una ventana nueva}} pone la cinta en una ventana propia, por ejemplo en un segundo monitor. Las teclas que pulse ahí llegan a la aplicación. {{ui:Regresar la cinta}}, o cerrar esa ventana, la devuelve a su lugar.

La configuración de la barra de herramientas se aplica a la cinta: {{ui:Configuración}} › {{ui:Global}} › {{ui:Barra de herramientas}} › {{ui:Iconos y etiquetas}}, {{ui:Solo iconos}} (la cinta muestra entonces dos filas de iconos pequeños por grupo) o {{ui:Solo etiquetas}}, y {{ui:Mostrar nombres de grupo (Archivo, Dibujo, …)}}.

## Sus paneles siguen siendo suyos

Los paneles izquierdo y derecho conservan todo lo que se describe en [Organizar los paneles](common:arrange-panels): acoplar, flotar, fijar, ocultar, pestañas, {{ui:Mover a una ventana nueva}} y {{ui:Restablecer diseño}}.

## Volver al diseño clásico

Abra {{ui:Configuración}} › {{ui:Global}} › {{ui:Diseño}} › {{ui:Espacio de trabajo}} y elija {{ui:CadCraft clásico}}. Cada barra de herramientas, pestaña y panel vuelve a su lugar.

:::note
En un teléfono, o en una ventana de 760 píxeles de ancho o menos, la aplicación usa su diseño para teléfono sin importar lo que haya elegido. Una ventana más ancha devuelve su diseño.
:::

Para probar otra disposición, vea [el diseño de caja de herramientas y cuadro de información](common:layout-toolbox).
