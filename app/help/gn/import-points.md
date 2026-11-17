---
title: Importar puntos de levantamiento
summary: Abrir un archivo de puntos CSV o de texto, verificar el orden de columnas en el diálogo Importar puntos, corregir las filas que no se pueden leer, y ordenar los puntos en grupos.
keywords: importar puntos, csv, txt, pnezd, penzd, archivo de puntos, levantamiento, puntos cogo, grupos de puntos, columnas, norte este
from: ad33d88a
---

Un archivo de puntos es un archivo de texto con un punto por línea: número de punto, norte, este, elevación y descripción en algún orden, separados por comas, tabulaciones, punto y coma o espacios. CivilCraft lo lee en el navegador y construye enseguida una superficie a partir de él.

## Antes de empezar

- Conoce el orden de columnas del archivo si puedes (PNEZD y PENZD se ven iguales para una computadora).
- Conoce sus unidades. CivilCraft no convierte: define **Unidades** en el panel izquierdo para que coincidan con el archivo (ver [Unidades, estaciones y formatos numéricos](topic:units-and-stations)).
- Las coordenadas pueden ser grandes (los nortes y estes de un sistema de coordenadas planas en los millones están bien).

## Importar el archivo

1. Haz clic en {{ui:Open}} en la barra de herramientas, o presiona {{key:Mod+O}}, y elige el archivo. También puedes arrastrarlo sobre el plano.
   Se abre el diálogo **Importar puntos** con el nombre del archivo, una lista de **Columnas** puesta en {{ui:Detect}}, una línea de resumen y los primeros seis puntos.
2. Lee la línea de resumen. Dice cuántos puntos se leyeron, en qué orden de columnas, cómo se encontró ese orden, y qué separa las columnas. Las tres maneras en que se encuentra el orden:
   - "desde la fila de encabezado": la primera línea nombra sus columnas (Punto, Norte, Este, Elevación, Descripción, o X, Y, Z …). Es lo más seguro.
   - "como elegiste": escogiste un orden en **Columnas**.
   - "adivinado desde la cantidad de columnas y tu ajuste de filas de puntos (PNEZD) — verifica que norte y este no estén invertidos": no había un encabezado útil. Si tus archivos suelen tener primero el este, pon **Filas de puntos** en P, E, N, Z, D en la [configuración de CivilCraft](topic:settings).
3. Revisa la tabla de vista previa. Sus columnas son siempre **Punto**, **Norte**, **Este**, **Elevación**, **Descripción**, sin importar el orden del archivo. Los nortes y los estes de un sitio real suelen tener tamaños claramente distintos: si parecen invertidos, la adivinanza fue errónea.
4. Si el orden está mal, elige el correcto en **Columnas** (por ejemplo {{ui:PENZD — point, easting, northing, elevation, description}}). El resumen y la vista previa se actualizan enseguida.
5. Mira debajo de la vista previa para **Filas no leídas**. Cada línea indica el número de línea del archivo, la razón y el comienzo de la fila. Ver [Filas que no se leen](topic:import-points#rows-that-are-not-read).
6. Haz clic en {{ui:Import}}.
   Los puntos aparecen en el plano, la vista se acerca a ellos y se construye la superficie. La barra de estado dice, por ejemplo, "Importados 276 puntos desde site.csv; superficie: 546 triángulos".

Si el proyecto aún no tenía nombre, toma el nombre del archivo.

## Verificar los grupos

Cada punto pertenece a un grupo con el nombre de la **primera palabra de su descripción**, en mayúsculas: "GRD", "FL 12" y "fl" son los grupos GRD, FL y FL. Los puntos sin descripción van en "(sin descripción)".

1. Mira la tabla bajo **Puntos** en el panel izquierdo: grupo, cantidad de puntos y una opción de **Superficie**.
2. Cada grupo empieza como {{ui:Points}}. Cambia líneas de flujo, bordes de pavimento, topes y pies de talud, crestas y líneas codificadas similares a {{ui:Breakline}}. Pon en {{ui:Left out}} los grupos que no deben dar forma al terreno (puntos de control, copas de árboles, postes de servicios tomados en la parte superior).
3. Haz clic en un punto del plano (con {{ui:Select}}) para ver su número, coordenadas, elevación, descripción y grupo en el panel derecho.

:::warning
Un grupo de línea de quiebre une **todos** sus puntos en **una** sola línea, en orden de número de punto. Eso funciona cuando cada línea codificada se tomó en orden con su propio código. Dos líneas de flujo separadas, ambas codificadas "FL", se convierten en una sola línea en zigzag entre ellas. Si tus códigos se comparten, usa la herramienta {{ui:Breakline}} para hacer clic en los puntos de cada línea (ver [Construir y refinar la superficie](topic:build-surface)).
:::

## Filas que no se leen

| Razón mostrada | Qué significa | Qué hacer |
|---|---|---|
| "norte o este no es un número" | Una columna de coordenadas tiene texto | Verifica el orden de columnas, o una fila de texto suelta en medio del archivo |
| "elevación no es un número" | La columna de elevación tiene texto | Orden de columnas equivocado, o una descripción en la columna de elevación |
| "sin número de punto" | La columna de punto está vacía | Numera el punto, o elige un orden sin P (NEZD, NEZ …): los puntos se numeran entonces 1, 2, 3 … |
| "el punto 12 aparece dos veces (se conserva el primero)" | Dos filas comparten un número | Renumera una de ellas en el archivo si ambas son tomas reales |
| "3 columnas, se esperaban 5 (PNEZD)" | La fila es corta | Una línea rota, o el orden de columnas equivocado |

Un punto con elevación vacía se conserva, pero no se usa en la superficie. Los datos de **Puntos** muestran cuántos puntos tienen elevación.

Las líneas que empiezan con `#`, `;` o `//` son comentarios y se omiten. Las líneas en blanco se omiten.

## Reemplazar o agregar puntos

Importar de nuevo **reemplaza** todos los puntos; no los suma. Tus trazados, plataformas, caños, líneas de quiebre dibujadas y límite se mantienen. El historial de deshacer se borra, así que guarda el proyecto primero si quizás quieras recuperar los puntos viejos. Para combinar dos archivos, únelos en un editor de texto o en una planilla antes de importar (cuida los números de punto repetidos).

Los puntos todavía no se pueden mover, editar ni borrar dentro de CivilCraft. Corrígelos en el archivo y vuelve a importar.

## Relacionado

- [Formatos de archivos de puntos](topic:point-file-formats): cada orden de columnas y cómo se reconocen los encabezados.
- [Construir y refinar la superficie](topic:build-surface).
