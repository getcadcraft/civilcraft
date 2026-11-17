---
title: Trabajar con la tabla de atributos de una capa
summary: Ver cada elemento de una capa SIG como tabla, ordenarla y filtrarla, seleccionar filas y elementos a la vez, corregir valores, añadir campos, calcular valores nuevos y guardar la tabla como CSV.
keywords: tabla de atributos, tabla, campos, columnas, filas, ordenar, filtrar, expresión, seleccionar, editar, calculadora de campos, calcular, añadir campo, renombrar campo, quitar campo, csv, exportar, sig, shapefile, geopackage, simbología
from: fd9d6c11
---

Abra la tabla de una capa desde su menú de **tres puntos** en la lista de capas SIG ({{ui:Tabla de atributos…}}), desde Superficie › Más › {{ui:Tabla de atributos}}, o escribiendo `ATTRIBUTES`, `ATTTABLE` o `TABLE`. La tabla se abre junto a la planta y permanece abierta mientras trabaja. Solo se dibujan las filas visibles, así que una capa con miles de elementos se abre y se desplaza con rapidez.

## Ordenar, filtrar y seleccionar

- **Ordenar:** haga clic en el título de una columna. Un segundo clic la invierte, y un tercero devuelve el orden del archivo. Los valores vacíos siempre quedan al final. Ordenar solo cambia lo que ve, nunca la capa.
- **Filtrar:** escriba en el cuadro de filtro. Una expresión como `AREA > 500 and USE = 'Res'` mantiene las filas en las que es verdadera (las mismas palabras que la pestaña Seleccionar de [Analizar capas SIG](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Lo que no es una expresión, como `oak maple`, busca esas palabras en todas las columnas.
- **Seleccionar filas:** haga clic en una fila. Ctrl+clic añade o quita una, Shift+clic selecciona un bloque, y {{ui:Seleccionar las filas mostradas}} toma todas las filas que pasan el filtro. Los elementos seleccionados se dibujan en la planta, y un clic en un elemento de la planta selecciona aquí su fila.
- Con filas seleccionadas puede {{ui:Zoom}} a ellas, crear una **capa a partir de la selección** y leer el área o la longitud total en la línea de estado.

## Corregir valores

Haga doble clic en una celda (o llegue a ella con las teclas de flecha y pulse Intro), escriba el nuevo valor y pulse Intro. Esc lo deja como estaba. Un valor debe encajar en la columna: los números como números, las fechas como `YYYY-MM-DD`, y sí/no como yes, no, true o false. Un valor que no encaja se rechaza con una frase y nada cambia. Un cuadro vacío deja el valor vacío. Cada edición es un paso de deshacer: {{ui:Deshacer}} y {{ui:Rehacer}} están en la parte inferior de la tabla, y Ctrl+Z funciona en la planta.

## Campos

En **Campos** puede añadir un campo (texto, número, fecha o sí/no), renombrar uno o quitar uno. Un campo nuevo empieza vacío. Un cambio de nombre se propaga: el campo de etiqueta y el [estilo por atributo](topic:gis-symbology) de la capa pasan al nuevo nombre, y al quitar un campo se eliminan la etiqueta y el estilo que lo usaban. Cada operación es un paso de deshacer que lo devuelve todo.

## Calculadora de campos

Escribe un valor en cada fila (o solo en las filas seleccionadas) a partir de los demás campos de la fila, su geometría y unas pocas funciones. Elija un campo existente o **Un campo nuevo…**, y déle un nombre y un tipo. Nada se ejecuta como código: la expresión la lee un pequeño analizador con una lista fija de funciones.

| Grupo | Palabras |
|---|---|
| Números | `+ - * /`, paréntesis, `abs round(x, digits) floor ceil sqrt pow min max` |
| Texto | `upper lower trim len substr(text, from, count) left right replace concat` (el texto va entre 'comillas simples'; un nombre de campo con espacios va entre "comillas dobles" o [corchetes]) |
| Condicionales | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Fechas | `year month day` de un valor `YYYY-MM-DD` |
| Geometría | `$area $perimeter $length $x $y $vertices`, en las unidades del proyecto |

Un resultado que no puede guardarse en el tipo del campo (texto en un campo numérico) se deja vacío y se cuenta en el mensaje. Dividir entre cero da un valor vacío. Por ejemplo, `round($area / 43560, 2)` escribe acres a partir de pies cuadrados.

## Exportar

{{ui:Exportar CSV}} guarda las filas que ve (después del filtro y de la ordenación) como archivo CSV en UTF-8, con los nombres de campo en la primera línea. Un texto que empieza por `=`, `+`, `-` o `@` recibe un apóstrofo inicial para que una hoja de cálculo no lo ejecute como fórmula. Para guardar la propia capa, use [Exportar datos as-built para SIG](topic:gis-export).

## Límites

La tabla muestra la capa con un único orden de clasificación y un filtro a la vez. Aquí no se pueden añadir ni borrar filas (cree en su lugar una capa nueva a partir de una selección), la geometría no se edita, y el tipo de un campo no se puede cambiar una vez creado.
