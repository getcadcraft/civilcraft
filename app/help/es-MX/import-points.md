---
title: Importar puntos topográficos
summary: Abra un archivo de puntos CSV o de texto, verifique el orden de columnas en el cuadro Importar puntos, corrija las filas que no se pueden leer y clasifique los puntos en grupos.
keywords: importar puntos, csv, txt, pnezd, penzd, archivo de puntos, topografía, puntos cogo, grupos de puntos, columnas, norte este
from: ad33d88a
---

Un archivo de puntos es un archivo de texto con un punto por línea: número de punto, norte, este, elevación y descripción en algún orden, separados por comas, tabuladores, punto y coma o espacios. CivilCraft lo lee en el navegador y construye de inmediato una superficie a partir de él.

## Antes de empezar

- Conozca el orden de columnas del archivo si puede (PNEZD y PENZD se ven igual para una computadora).
- Conozca sus unidades. CivilCraft no convierte: configure **Unidades** en el panel izquierdo para que coincidan con el archivo (vea [Unidades, estaciones y formatos numéricos](topic:units-and-stations)).
- Las coordenadas pueden ser grandes (las coordenadas de plano estatal, con norte y este en millones, son válidas).

## Importar el archivo

1. Haga clic en {{ui:Abrir}} en la barra de herramientas, o pulse {{key:Mod+O}}, y elija el archivo. También puede arrastrarlo al plano.
   Se abre el cuadro **Importar puntos** con el nombre del archivo, una lista **Columnas** configurada en {{ui:Detectar}}, una línea de resumen y los primeros seis puntos.
2. Lea la línea de resumen. Indica cuántos puntos se leyeron, en qué orden de columnas, cómo se halló ese orden y qué separa las columnas. Las tres formas de hallar el orden son:
   - "desde la fila de encabezado": la primera línea nombra sus columnas (Punto, Norte, Este, Elevación, Descripción, o X, Y, Z …). Es lo más seguro.
   - "según lo elegido": usted eligió un orden en **Columnas**.
   - "adivinado a partir del número de columnas y de su configuración de fila de punto (PNEZD); verifique que el norte y el este no estén intercambiados": no había un encabezado útil. Si sus archivos suelen tener primero el este, configure **Filas de punto** en P, E, N, Z, D en la [configuración de CivilCraft](topic:settings).
3. Revise la tabla de vista previa. Sus columnas son siempre **Punto**, **Norte**, **Este**, **Elevación** y **Descripción**, sin importar el orden del archivo. Los valores de norte y este de un sitio real suelen tener magnitudes claramente distintas: si parecen intercambiados, la suposición fue errónea.
4. Si el orden es incorrecto, elija el correcto en **Columnas** (por ejemplo, {{ui:PENZD: punto, este, norte, elevación, descripción}}). El resumen y la vista previa se actualizan de inmediato.
5. Busque bajo la vista previa **Filas no leídas**. Cada línea indica el número de línea del archivo, el motivo y el inicio de la fila. Vea [Filas que no se leen](topic:import-points#filas-que-no-se-leen).
6. Haga clic en {{ui:Importar}}.
   Los puntos aparecen en el plano, la vista se acerca a ellos y se construye la superficie. La barra de estado dice, por ejemplo: "Se importaron 276 puntos de site.csv; superficie: 546 triángulos."

Si el proyecto aún no tenía nombre, toma el nombre del archivo.

## Revisar los grupos

Cada punto pertenece a un grupo con el nombre de la **primera palabra de su descripción**, en mayúsculas: "GRD", "FL 12" y "fl" son los grupos GRD, FL y FL. Los puntos sin descripción van en "(sin descripción)".

1. Mire la tabla bajo **Puntos** en el panel izquierdo: grupo, número de puntos y una opción de **Superficie**.
2. Cada grupo empieza como {{ui:Puntos}}. Cambie las líneas de flujo, los bordes de pavimento, las crestas y los pies de talud, las divisorias y las líneas codificadas similares a {{ui:Línea de ruptura}}. Configure como {{ui:Omitido}} los grupos que no deben dar forma al terreno (puntos de control, copas de árboles, postes de servicios medidos en la cima).
3. Haga clic en un punto del plano (con {{ui:Seleccionar}}) para ver su número, coordenadas, elevación, descripción y grupo en el panel derecho.

:::warning
Un grupo de línea de ruptura une **todos** sus puntos en **una** sola línea, en orden de número de punto. Eso funciona cuando cada línea codificada se midió en orden con su propio código. Dos líneas de flujo separadas, ambas codificadas "FL", se convierten en una línea en zigzag entre ellas. Si sus códigos se comparten, use la herramienta {{ui:Línea de ruptura}} para hacer clic en los puntos de cada línea (vea [Construir y afinar la superficie](topic:build-surface)).
:::

## Filas que no se leen

| Motivo mostrado | Qué significa | Qué hacer |
|---|---|---|
| "el norte o el este no es un número" | Una columna de coordenadas contiene texto | Verifique el orden de columnas, o una fila de texto suelta en medio del archivo |
| "la elevación no es un número" | La columna de elevación contiene texto | Orden de columnas incorrecto, o una descripción en la columna de elevación |
| "no hay número de punto" | La columna de punto está vacía | Numere el punto, o elija un orden sin P (NEZD, NEZ …): entonces los puntos se numeran 1, 2, 3 … |
| "el punto 12 aparece dos veces (se conserva el primero)" | Dos filas comparten un número | Renumere uno de ellos en el archivo si ambos son mediciones reales |
| "3 columnas, se esperaban 5 (PNEZD)" | La fila está incompleta | Una línea rota, o el orden de columnas incorrecto |

Un punto con elevación vacía se conserva, pero no se usa en la superficie. Los datos de **Puntos** muestran cuántos puntos tienen elevación.

Las líneas que empiezan con `#`, `;` o `//` son comentarios y se omiten. Las líneas en blanco también se omiten.

## Reemplazar o agregar puntos

Importar de nuevo **reemplaza** todos los puntos; no los agrega. Sus alineaciones, plataformas, tuberías, líneas de ruptura dibujadas y contorno se conservan. El historial de deshacer se borra, así que guarde el proyecto primero si tal vez quiera recuperar los puntos anteriores. Para combinar dos archivos, únalos en un editor de texto u hoja de cálculo antes de importar (cuide los números de punto repetidos).

Los puntos todavía no se pueden mover, editar ni borrar dentro de CivilCraft. Corríjalos en el archivo e importe de nuevo.

## Relacionado

- [Formatos de archivos de puntos](topic:point-file-formats): cada orden de columnas y cómo se reconocen los encabezados.
- [Construir y afinar la superficie](topic:build-surface).
