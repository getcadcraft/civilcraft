---
title: Seleccionar, copiar y pegar puntos topográficos
summary: Seleccione puntos topográficos con clic, Shift y un recuadro, o todos a la vez; cópielos, córtelos, péguelos, péguelos en el mismo lugar, duplíquelos y elimínelos con números de punto nuevos que nunca coinciden; pegue filas de puntos desde y hacia una hoja de cálculo.
keywords: copiar, pegar, cortar, duplicar, eliminar puntos, seleccionar puntos, seleccionar todo, selección por recuadro, ventana, portapapeles, hoja de cálculo, csv, renumerar, números de punto, pegar en el mismo lugar, clonar, replanteo
from: 78a6aea7
---

Los puntos topográficos se pueden copiar y pegar dentro de un proyecto, entre proyectos en dos pestañas del navegador, y desde y hacia una hoja de cálculo. Cada cambio es un paso de deshacer, y la superficie se reconstruye de inmediato a partir de los nuevos puntos.

## Seleccionar puntos

Con {{ui:Seleccionar}} ({{key:V}}):

- **Haga clic** en un punto para seleccionarlo (y solo él). Sus números aparecen en **Propiedades**.
- {{key:Shift}} y **clic** añade un punto a la selección, o lo quita.
- {{key:Shift}} y **arrastre** dibuja un recuadro: los puntos dentro se añaden a la selección. Si arrastra alrededor de los puntos, se convierte en lazo; véase [Selección con lazo de puntos topográficos](topic:lasso-selection). Un arrastre sin {{key:Shift}} desplaza la vista, como siempre.
- {{key:Mod+A}} (o {{ui:Más}} › {{ui:Seleccionar todos los puntos}}) selecciona todos los puntos.
- {{key:Esc}} (o {{ui:Más}} › {{ui:No seleccionar nada}}) borra la selección.

Los puntos seleccionados tienen un anillo. Con más de uno seleccionado, **Propiedades** muestra cuántos son, sus números, su rango de cotas y sus grupos.

## Copiar, cortar y eliminar

- {{ui:Copiar}} o {{key:Mod+C}} copia los puntos seleccionados. CivilCraft guarda la copia y además la pone en el portapapeles del sistema como filas de puntos, de modo que puede pegarla directamente en una hoja de cálculo o en un archivo de texto.
- {{ui:Más}} › {{ui:Cortar}} o {{key:Mod+X}} los copia y los elimina, en un solo paso.
- {{ui:Más}} › {{ui:Eliminar}} o {{key:Delete}} los elimina. {{key:Mod+Z}} los devuelve.

Las filas son: punto, norte, este, cota, descripción (P,N,E,Z,D), separadas por comas, con tres decimales. Para obtener el este antes que el norte, ajuste **Filas de puntos** en [Configuración de CivilCraft](topic:settings). Una descripción que una hoja de cálculo tomaría por una fórmula (que empieza por =, +, - o @) recibe un apóstrofo delante, para que siga siendo texto.

## Pegar

1. Pulse {{key:Mod+V}} o haga clic en {{ui:Pegar}}. Los puntos siguen al puntero como pequeñas cruces, con una línea de puntos que vuelve a su origen.
2. Haga clic donde deben ir. El centro de los puntos copiados cae en el clic.
3. O pulse {{key:Enter}} para colocarlos en sus propias coordenadas, o {{key:Esc}} para cancelar.

{{ui:Más}} › {{ui:Pegar en el mismo lugar}} o {{key:Mod+Shift+V}} pega en las propias coordenadas de los puntos de inmediato. Los puntos pegados quedan seleccionados después, para que pueda copiarlos, moverlos o eliminarlos de nuevo.

:::note
Al hacer clic en {{ui:Pegar}} de la barra de herramientas se lee el portapapeles del sistema. La primera vez, el navegador puede preguntar si CivilCraft puede ver el portapapeles. Si lo rechaza, el botón de la barra solo pega la copia propia de CivilCraft; {{key:Mod+V}} sigue pegando filas de una hoja de cálculo sin preguntar.
:::

## Los números de punto nunca coinciden

Dos puntos nunca comparten número. Al pegar:

- Un punto pegado conserva su número cuando ningún punto del proyecto lo tiene. Así, tras **Cortar**, los puntos vuelven a pegarse con sus propios números, y los puntos copiados de otro proyecto conservan los suyos donde están libres.
- Un punto pegado cuyo número está ocupado recibe un nuevo número entero: uno más que el mayor número en uso, contando hacia arriba.
- La barra de estado indica lo ocurrido, por ejemplo «1 conservó su número; 9 recibieron números nuevos: 10–18 pasaron a ser 277–285».

En [Configuración de CivilCraft](topic:settings) puede elegir **Siempre números nuevos**, y un número desde el que empiecen los nuevos, por ejemplo 5000 para puntos de diseño.

:::warning
Los grupos de puntos que construyen la superficie como **línea de ruptura** unen sus puntos en orden numérico. Las copias pegadas de puntos de línea de ruptura (por ejemplo, disparos FL) reciben números nuevos y más altos, y se unen al final de esa línea de ruptura, posiblemente con un salto largo. Compruebe el plano tras pegar esos puntos, o ajuste su grupo a {{ui:Puntos}}.
:::

## Duplicar

{{ui:Más}} › {{ui:Duplicar}} o {{key:Mod+D}} crea una copia de los puntos seleccionados que sigue al puntero: haga clic donde debe ir. Las copias siempre reciben números nuevos, y el portapapeles de CivilCraft se queda como estaba.

## Desde una hoja de cálculo o un archivo de texto

Seleccione filas de puntos en una hoja de cálculo (punto, norte, este, cota, descripción) y cópielas. En CivilCraft pulse {{key:Mod+V}} y haga clic donde deben ir, o pulse {{key:Mod+Shift+V}} para colocarlos en sus propias coordenadas, que es lo habitual en datos reales de levantamiento.

Las filas se leen exactamente como un [archivo de puntos](topic:point-file-formats): comas, tabuladores o espacios, y una fila de encabezado si la hay. Sin encabezado, el orden de columnas viene de **Filas de puntos** en [Configuración de CivilCraft](topic:settings).

Cuando hay ambos, CivilCraft decide por lo más reciente: las filas del portapapeles del sistema que difieren de la última copia de CivilCraft se copiaron después, así que se pegan. El texto que no contiene puntos se ignora, y en su lugar se pega la copia de CivilCraft.

## Entre proyectos y pestañas

La copia se guarda en este navegador, así que una segunda pestaña de CivilCraft puede pegarla, incluso después de cerrar la primera. Los puntos copiados en un proyecto en metros y pegados en uno en pies conservan sus números tal cual: no se convierte nada, y la barra de estado lo indica.

## Qué no se copia

Por ahora solo se copian los puntos topográficos. Las alineaciones, las plataformas, las redes de tuberías, las líneas de ruptura y los límites todavía no se pueden copiar ni pegar. Pegar no puede mover los puntos existentes: use {{ui:Cortar}} y pegar, o mueva un punto cada vez ([Editar un punto topográfico](topic:edit-points)).
