---
title: Seleccione, copie y pegue puntos topográficos
summary: Seleccione puntos topográficos con clic, Shift y un recuadro, o todos a la vez; cópielos, córtelos, péguelos, péguelos en el mismo lugar, duplíquelos y bórrelos con números de punto nuevos que nunca coinciden; pegue filas de puntos desde y hacia una hoja de cálculo.
keywords: copiar, pegar, cortar, duplicar, borrar puntos, seleccionar puntos, seleccionar todo, selección por recuadro, ventana, portapapeles, hoja de cálculo, csv, renumerar, números de punto, pegar en el mismo lugar, clonar, replanteo
from: 78a6aea7
---

Los puntos topográficos se pueden copiar y pegar dentro de un proyecto, entre proyectos en dos pestañas del navegador, y desde y hacia una hoja de cálculo. Cada cambio es un paso de deshacer, y la superficie se reconstruye de inmediato con los puntos nuevos.

## Seleccione puntos

Con {{ui:Seleccionar}} ({{key:V}}):

- **Haga clic** en un punto para seleccionarlo (y solo ese). Sus números aparecen en **Propiedades**.
- {{key:Shift}} y **clic** agregan un punto a la selección, o lo quitan.
- {{key:Shift}} y **arrastre** dibujan un recuadro: los puntos dentro se agregan a la selección. Si arrastra alrededor de los puntos en lugar de en línea recta, se convierte en un lazo; vea [Selección por lazo de puntos topográficos](topic:lasso-selection). Un arrastre sin {{key:Shift}} desplaza la vista, como siempre.
- {{key:Mod+A}} (o {{ui:Más}} › {{ui:Seleccionar todos los puntos}}) selecciona todos los puntos.
- {{key:Esc}} (o {{ui:Más}} › {{ui:No seleccionar nada}}) limpia la selección.

Los puntos seleccionados tienen un anillo. Con más de uno seleccionado, **Propiedades** muestra cuántos son, sus números, su rango de elevación y sus grupos.

## Copie, corte y borre

- {{ui:Copiar}} o {{key:Mod+C}} copia los puntos seleccionados. CivilCraft guarda la copia y además la pone en el portapapeles del sistema como filas de puntos, para que pueda pegarla directamente en una hoja de cálculo o un archivo de texto.
- {{ui:Más}} › {{ui:Cortar}} o {{key:Mod+X}} los copia y los borra, en un solo paso.
- {{ui:Más}} › {{ui:Eliminar}} o {{key:Delete}} los borra. {{key:Mod+Z}} los regresa.

Las filas tienen el formato punto, norte, este, elevación, descripción (P,N,E,Z,D), separadas por comas, con tres decimales. Para obtener el este antes que el norte, configure **Filas de puntos** en [Configuración de CivilCraft](topic:settings). Una descripción que una hoja de cálculo tomaría como fórmula (que empieza con =, +, - o @) recibe un apóstrofo al frente, para que siga siendo texto.

## Pegue

1. Pulse {{key:Mod+V}} o haga clic en {{ui:Pegar}}. Los puntos siguen al cursor como pequeñas cruces, con una línea punteada de regreso al lugar de origen.
2. Haga clic donde deben ir. El centro de los puntos copiados cae en el clic.
3. O pulse {{key:Enter}} para colocarlos en sus propias coordenadas, o {{key:Esc}} para cancelar.

{{ui:Más}} › {{ui:Pegar en el mismo lugar}} o {{key:Mod+Shift+V}} pega en las propias coordenadas de los puntos de inmediato. Los puntos pegados quedan seleccionados después, para que pueda copiarlos, desplazarlos o borrarlos de nuevo.

:::note
Hacer clic en {{ui:Pegar}} en la barra de herramientas lee el portapapeles del sistema. La primera vez, el navegador puede preguntar si CivilCraft puede ver el portapapeles. Si lo rechaza, el botón de la barra solo pega la copia propia de CivilCraft; {{key:Mod+V}} sigue pegando filas de una hoja de cálculo sin preguntar.
:::

## Los números de punto nunca coinciden

Dos puntos nunca comparten un número. Al pegar:

- Un punto pegado conserva su número cuando ningún punto del proyecto lo tiene. Así, después de **Cortar**, los puntos se pegan de regreso con sus propios números, y los puntos copiados desde otro proyecto conservan los suyos donde estén libres.
- Un punto pegado cuyo número está ocupado recibe un nuevo número entero: uno más que el número más alto en uso, contando hacia arriba.
- La barra de estado dice lo que pasó, por ejemplo "1 conservó su número; 9 recibieron números nuevos: 10–18 pasaron a 277–285".

En [Configuración de CivilCraft](topic:settings) puede elegir **Siempre números nuevos**, y un número desde el cual empiecen los números nuevos, por ejemplo 5000 para puntos de diseño.

:::warning
Los grupos de puntos que construyen la superficie como **línea de ruptura** unen sus puntos en orden de número. Las copias pegadas de puntos de línea de ruptura (por ejemplo, tomas FL) reciben números nuevos, más altos, y se unen al final de esa línea de ruptura, posiblemente con un salto largo. Revise el plano después de pegar esos puntos, o configure su grupo en {{ui:Puntos}}.
:::

## Duplicar

{{ui:Más}} › {{ui:Duplicar}} o {{key:Mod+D}} hace una copia de los puntos seleccionados que sigue al cursor: haga clic donde debe ir. Las copias siempre reciben números nuevos, y el portapapeles de CivilCraft se queda como estaba.

## Desde una hoja de cálculo o un archivo de texto

Seleccione filas de puntos en una hoja de cálculo (punto, norte, este, elevación, descripción) y cópielas. En CivilCraft pulse {{key:Mod+V}} y haga clic donde deben ir, o pulse {{key:Mod+Shift+V}} para colocarlos en sus propias coordenadas, que normalmente es lo que quiere con datos topográficos reales.

Las filas se leen exactamente como un [archivo de puntos](topic:point-file-formats): comas, tabuladores o espacios, y una fila de encabezado si la hay. Sin encabezado, el orden de las columnas viene de **Filas de puntos** en [Configuración de CivilCraft](topic:settings).

Cuando hay ambos, CivilCraft decide por lo más reciente: las filas en el portapapeles del sistema que difieren de la última copia de CivilCraft se copiaron después, así que se pegan. El texto que no contiene puntos se ignora, y en su lugar se pega la copia propia de CivilCraft.

## Entre proyectos y pestañas

La copia se guarda en este navegador, así que una segunda pestaña de CivilCraft puede pegarla, incluso después de cerrar la primera. Los puntos copiados en un proyecto en metros y pegados en uno en pies conservan sus números tal cual: no se convierte nada, y la barra de estado lo indica.

## Qué no se copia

Por ahora solo se copian los puntos topográficos. Las alineaciones, plataformas, redes de tuberías, líneas de ruptura y límites todavía no se pueden copiar ni pegar. Pegar no puede mover puntos existentes: use {{ui:Cortar}} y pegue, o mueva un punto a la vez ([Edite un punto topográfico](topic:edit-points)).
