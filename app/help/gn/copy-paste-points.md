---
title: Seleccionar, copiar y pegar puntos de relevamiento
summary: Seleccioná puntos por clic, Shift y un recuadro, o todos a la vez; copialos, cortalos, pegalos, pegá en el mismo lugar, duplicalos y eliminalos con números nuevos que nunca chocan; pegá filas de puntos desde y hacia una planilla.
keywords: copiar, pegar, cortar, duplicar, eliminar puntos, seleccionar puntos, seleccionar todo, selección por recuadro, ventana, portapapeles, planilla, csv, renumerar, números de punto, pegar en el mismo lugar, clonar, replanteo
from: 78a6aea7
---

Los puntos de relevamiento se pueden copiar y pegar dentro de un proyecto, entre proyectos en dos pestañas del navegador, y desde y hacia una planilla. Cada cambio es un paso de deshacer, y la superficie se reconstruye de inmediato con los puntos nuevos.

## Seleccionar puntos

Con {{ui:Seleccionar}} ({{key:V}}):

- **Clic** en un punto para seleccionarlo (y solo ese). Sus números se muestran en **Propiedades**.
- {{key:Shift}} y **clic** agrega un punto a la selección, o lo quita.
- {{key:Shift}} y **arrastrar** dibuja un recuadro: los puntos dentro se agregan a la selección. Si arrastrás alrededor de los puntos, pasa a ser lazo; ver [Selección por lazo de puntos de relevamiento](topic:lasso-selection). Un arrastre sin {{key:Shift}} desplaza, como siempre.
- {{key:Mod+A}} (o {{ui:Más}} › {{ui:Seleccionar todos los puntos}}) selecciona todos los puntos.
- {{key:Esc}} (o {{ui:Más}} › {{ui:Deseleccionar todo}}) limpia la selección.

Los puntos seleccionados tienen un anillo. Con más de uno seleccionado, **Propiedades** muestra cuántos son, sus números, su rango de cotas y sus grupos.

## Copiar, cortar y eliminar

- {{ui:Copiar}} o {{key:Mod+C}} copia los puntos seleccionados. CivilCraft guarda la copia y además la pone en el portapapeles del sistema como filas de puntos, para que puedas pegarla directo en una planilla o un archivo de texto.
- {{ui:Más}} › {{ui:Cortar}} o {{key:Mod+X}} los copia y los elimina, en un solo paso.
- {{ui:Más}} › {{ui:Eliminar}} o {{key:Delete}} los elimina. {{key:Mod+Z}} los devuelve.

Las filas son punto, norte, este, cota, descripción (P,N,E,Z,D), separadas por comas, con tres decimales. Para obtener este antes que norte, fijá **Filas de puntos** en [Configuración de CivilCraft](topic:settings). Una descripción que una planilla trataría como fórmula (empezando con =, +, - o @) recibe un apóstrofo adelante, para que quede como texto.

## Pegar

1. Presioná {{key:Mod+V}} o hacé clic en {{ui:Pegar}}. Los puntos siguen al puntero como cruces chiquitas, con una línea punteada de vuelta a donde estaban.
2. Hacé clic donde van. El centro de los puntos copiados cae en el clic.
3. O presioná {{key:Enter}} para ponerlos en sus propias coordenadas, o {{key:Esc}} para cancelar.

{{ui:Más}} › {{ui:Pegar en el mismo lugar}} o {{key:Mod+Shift+V}} pega en las propias coordenadas de los puntos de inmediato. Los puntos pegados quedan seleccionados después, así podés copiarlos, moverlos o eliminarlos de nuevo.

:::note
Hacer clic en {{ui:Pegar}} de la barra de herramientas lee el portapapeles del sistema. La primera vez, el navegador puede preguntar si CivilCraft puede ver el portapapeles. Si lo rechazás, el botón de la barra pega solo la copia propia de CivilCraft; {{key:Mod+V}} igual pega filas de una planilla sin preguntar.
:::

## Los números de punto nunca chocan

Dos puntos nunca comparten número. Al pegar:

- Un punto pegado conserva su número si ningún punto del proyecto lo tiene. Así, después de **Cortar**, los puntos vuelven a pegarse con sus propios números, y los puntos copiados de otro proyecto conservan los suyos donde están libres.
- Un punto pegado cuyo número está ocupado recibe un número entero nuevo: uno más que el mayor número en uso, contando hacia arriba.
- La barra de estado dice qué pasó, por ejemplo "1 conservó su número; 9 recibieron números nuevos: 10–18 pasaron a 277–285".

En [Configuración de CivilCraft](topic:settings) podés elegir **Siempre números nuevos**, y un número desde el que empiezan los números nuevos, por ejemplo 5000 para puntos de diseño.

:::warning
Los grupos de puntos que construyen la superficie como **línea de quiebre** unen sus puntos en orden de número. Las copias pegadas de puntos de línea de quiebre (por ejemplo tomas FL) reciben números nuevos, más altos, y se unen al final de esa línea de quiebre, posiblemente con un salto largo. Revisá el plano después de pegar esos puntos, o fijá su grupo en {{ui:Puntos}}.
:::

## Duplicar

{{ui:Más}} › {{ui:Duplicar}} o {{key:Mod+D}} hace una copia de los puntos seleccionados que sigue al puntero: hacé clic donde va. Las copias siempre reciben números nuevos, y el portapapeles de CivilCraft queda como estaba.

## Desde una planilla o un archivo de texto

Seleccioná filas de puntos en una planilla (punto, norte, este, cota, descripción) y copialas. En CivilCraft presioná {{key:Mod+V}} y hacé clic donde van, o presioná {{key:Mod+Shift+V}} para ponerlos en sus propias coordenadas, que suele ser lo que querés con datos reales de relevamiento.

Las filas se leen exactamente como un [archivo de puntos](topic:point-file-formats): comas, tabulaciones o espacios, y una fila de encabezado si la hay. Sin encabezado, el orden de columnas viene de **Filas de puntos** en [Configuración de CivilCraft](topic:settings).

Cuando hay ambas cosas, CivilCraft decide por lo más reciente: las filas del portapapeles del sistema que difieren de la última copia de CivilCraft se copiaron después, así que se pegan. El texto que no tiene puntos se ignora, y en su lugar se pega la copia propia de CivilCraft.

## Entre proyectos y pestañas

La copia se guarda en este navegador, así que una segunda pestaña de CivilCraft puede pegarla, incluso después de cerrar la primera. Los puntos copiados en un proyecto en metros y pegados en uno en pies conservan sus números tal cual: no se convierte nada, y la barra de estado lo indica.

## Lo que no se copia

Por ahora solo se copian puntos de relevamiento. Trazados, plataformas, redes de caños, líneas de quiebre y límites todavía no se pueden copiar ni pegar. Pegar no puede mover puntos existentes: usá {{ui:Cortar}} y pegar, o mové un punto por vez ([Editar un punto de relevamiento](topic:edit-points)).
