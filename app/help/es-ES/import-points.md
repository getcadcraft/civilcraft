---
title: Importar puntos topográficos
summary: Abra un archivo de puntos en CSV o texto, compruebe el orden de columnas en el diálogo Importar puntos, corrija las filas que no se pueden leer y ordene los puntos en grupos.
keywords: importar puntos, csv, txt, pnezd, penzd, archivo de puntos, topografía, puntos cogo, grupos de puntos, columnas, norte, este
from: ad33d88a
---

Un archivo de puntos es un archivo de texto con un punto por línea: número de punto, norte, este, cota y descripción en algún orden, separados por comas, tabuladores, punto y coma o espacios. CivilCraft lo lee en el navegador y genera de inmediato una superficie a partir de él.

## Antes de empezar

- Conozca el orden de columnas del archivo, si puede (PNEZD y PENZD parecen iguales para el equipo).
- Conozca sus unidades. CivilCraft no las convierte: ajuste **Unidades** en el panel izquierdo para que coincidan con el archivo (véase [Unidades, estaciones y formatos numéricos](topic:units-and-stations)).
- Las coordenadas pueden ser grandes (norte y este de una proyección estatal de millones están bien).

## Importar el archivo

1. Haga clic en {{ui:Open}} de la barra de herramientas, o pulse {{key:Mod+O}}, y elija el archivo. También puede arrastrarlo sobre el plano.
   Se abre el diálogo **Importar puntos** con el nombre del archivo, una lista **Columnas** ajustada a {{ui:Detect}}, una línea de resumen y los primeros seis puntos.
2. Lea la línea de resumen. Indica cuántos puntos se han leído, en qué orden de columnas, cómo se ha encontrado ese orden y qué separa las columnas. Las tres formas en que se determina el orden son:
   - "desde la fila de encabezado": la primera línea nombra sus columnas (Point, Northing, Easting, Elevation, Description, o X, Y, Z…). Es lo más seguro.
   - "según se ha elegido": se eligió un orden en **Columnas**.
   - "adivinado a partir del número de columnas y de la configuración de filas de punto (PNEZD); compruebe que norte y este no están intercambiados": no había un encabezado utilizable. Si sus archivos suelen tener primero el este, ajuste **Filas de puntos** a P, E, N, Z, D en la [configuración de CivilCraft](topic:settings).
3. Revise la tabla de vista previa. Sus columnas son siempre **Punto**, **Norte**, **Este**, **Cota** y **Descripción**, sea cual sea el orden del archivo. Los nortes y los estes de un emplazamiento real suelen tener magnitudes claramente distintas: si parecen intercambiados, la suposición fue errónea.
4. Si el orden es incorrecto, elija el correcto en **Columnas** (por ejemplo {{ui:PENZD — point, easting, northing, elevation, description}}). El resumen y la vista previa se actualizan al instante.
5. Mire bajo la vista previa **Filas no leídas**. Cada entrada indica el número de línea del archivo, el motivo y el inicio de la fila. Véase [Filas que no se leen](topic:import-points#rows-that-are-not-read).
6. Haga clic en {{ui:Import}}.
   Los puntos aparecen en el plano, la vista se acerca a ellos y se genera la superficie. La barra de estado indica, por ejemplo: "Se han importado 276 puntos de site.csv; superficie: 546 triángulos."

Si el proyecto aún no tenía nombre, toma el del archivo.

## Revisar los grupos

Cada punto pertenece a un grupo que lleva el nombre de la **primera palabra de su descripción**, en mayúsculas: "GRD", "FL 12" y "fl" son los grupos GRD, FL y FL. Los puntos sin descripción van al grupo "(sin descripción)".

1. Mire la tabla bajo **Puntos** en el panel izquierdo: grupo, número de puntos y una opción de **Superficie**.
2. Cada grupo empieza como {{ui:Points}}. Cambie las líneas de flujo, los bordes de pavimento, las coronaciones y pies de talud, las crestas y las líneas codificadas similares a {{ui:Breakline}}. Ponga en {{ui:Left out}} los grupos que no deben dar forma al terreno (puntos de control, copas de árboles, postes de servicios levantados por su parte superior).
3. Haga clic en un punto del plano (con {{ui:Select}}) para ver su número, sus coordenadas, su cota, su descripción y su grupo en el panel derecho.

:::warning
Un grupo de línea de ruptura une **todos** sus puntos en **una** sola línea, en orden de número de punto. Eso funciona cuando cada línea codificada se midió en orden con su propio código. Dos líneas de flujo separadas codificadas ambas como "FL" se convierten en una línea en zigzag entre ellas. Si sus códigos se comparten, use la herramienta {{ui:Breakline}} para hacer clic en los puntos de cada línea (véase [Construir y refinar la superficie](topic:build-surface)).
:::

## Filas que no se leen

| Motivo mostrado | Qué significa | Qué hacer |
|---|---|---|
| "norte o este no es un número" | Una columna de coordenadas contiene texto | Compruebe el orden de columnas, o una fila de texto suelta en medio del archivo |
| "la cota no es un número" | La columna de cota contiene texto | Orden de columnas incorrecto, o una descripción en la columna de cota |
| "sin número de punto" | La columna de punto está vacía | Numere el punto, o elija un orden sin P (NEZD, NEZ…): los puntos se numeran entonces 1, 2, 3… |
| "el punto 12 aparece dos veces (se conserva el primero)" | Dos filas comparten un número | Renumere una de ellas en el archivo si ambas son mediciones reales |
| "3 columnas, se esperaban 5 (PNEZD)" | La fila es corta | Una línea rota, o el orden de columnas incorrecto |

Un punto con la cota vacía se conserva, pero no se usa en la superficie. Los datos de **Puntos** indican cuántos puntos tienen cota.

Las líneas que empiezan por `#`, `;` o `//` son comentarios y se omiten. Las líneas en blanco también se omiten.

## Sustituir o añadir puntos

Volver a importar **sustituye** todos los puntos; no los añade. Sus alineaciones, plataformas, tuberías, líneas de ruptura dibujadas y contorno se conservan. El historial de deshacer se borra, así que guarde el proyecto antes si puede querer recuperar los puntos anteriores. Para combinar dos archivos, únalos en un editor de texto o en una hoja de cálculo antes de importar (cuidado con los números de punto repetidos).

Todavía no se pueden mover, editar ni borrar puntos dentro de CivilCraft. Corríjalos en el archivo y vuelva a importarlo.

## Relacionado

- [Formatos de archivos de puntos](topic:point-file-formats): todos los órdenes de columnas y cómo se reconocen los encabezados.
- [Construir y refinar la superficie](topic:build-surface).
