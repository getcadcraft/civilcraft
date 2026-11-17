---
title: Trabajar con la tabla de atributos de una capa
summary: Ver cada elemento de una capa GIS como tabla, ordenar y filtrar, seleccionar filas y elementos juntos, corregir valores, agregar campos, calcular valores nuevos y guardar la tabla como CSV.
keywords: tabla de atributos, tabla, campos, columnas, filas, ordenar, filtrar, expresión, seleccionar, editar, calculadora de campos, calcular, agregar campo, renombrar campo, quitar campo, csv, exportar, gis, shapefile, geopackage, simbología
from: fd9d6c11
---

Abrí la tabla de una capa desde su menú de **tres puntos** en la lista de capas GIS ({{ui:Tabla de atributos…}}), desde Superficie › Más › {{ui:Tabla de atributos}}, o escribiendo `ATTRIBUTES`, `ATTTABLE` o `TABLE`. La tabla se abre al lado del plano y queda abierta mientras trabajás. Solo se dibujan las filas que se ven, así que una capa con miles de elementos se abre y se desplaza rápido.

## Ordenar, filtrar y seleccionar

- **Ordenar:** hacé clic en el título de una columna. Un segundo clic lo invierte; un tercero devuelve el orden del archivo. Los valores vacíos siempre quedan al final. Ordenar cambia solo lo que ves, nunca la capa.
- **Filtrar:** escribí en la casilla de filtro. Una expresión como `AREA > 500 and USE = 'Res'` deja las filas donde es verdadera (las mismas palabras de la pestaña Seleccionar de [Analizar capas GIS](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Lo que no es una expresión, como `arce roble`, busca esas palabras en cada columna.
- **Seleccionar filas:** hacé clic en una fila. Ctrl+clic agrega o quita una; Shift+clic selecciona un bloque, y {{ui:Seleccionar las filas mostradas}} toma todas las filas que pasan el filtro. Los elementos seleccionados se dibujan en el plano, y un clic en un elemento del plano selecciona aquí su fila.
- Con filas seleccionadas podés hacer {{ui:Zoom}} hacia ellas, crear una **capa desde la selección**, y leer el área o longitud total en la línea de estado.

## Corregir valores

Hacé doble clic en una celda (o movete con las flechas y presioná Enter), escribí el valor nuevo y presioná Enter. Escape lo deja como estaba. Un valor debe encajar en la columna: números como números, fechas como `YYYY-MM-DD`, sí/no como sí, no, true o false. Un valor que no encaja se rechaza con una frase y nada cambia. Una casilla vacía deja el valor vacío. Cada edición es un paso de deshacer: {{ui:Deshacer}} y {{ui:Rehacer}} están al pie de la tabla, y Ctrl+Z funciona en el plano.

## Campos

Bajo **Campos** podés agregar un campo (texto, número, fecha o sí/no), renombrar uno o quitar uno. Un campo nuevo empieza vacío. El cambio de nombre se sigue en todo: el campo de etiqueta y el [estilo por atributo](topic:gis-symbology) de la capa pasan al nuevo nombre, y al quitar un campo se eliminan la etiqueta y el estilo que lo usaban. Cada uno es un paso de deshacer que devuelve todo.

## Calculadora de campos

Escribe un valor en cada fila (o solo en las filas seleccionadas) a partir de los otros campos de la fila, su geometría y algunas funciones. Elegí un campo existente o **Un campo nuevo…** y dale un nombre y un tipo. Nada se ejecuta como código: la expresión la lee un pequeño analizador con una lista fija de funciones.

| Grupo | Palabras |
|---|---|
| Números | `+ - * /`, corchetes, `abs round(x, digits) floor ceil sqrt pow min max` |
| Texto | `upper lower trim len substr(text, from, count) left right replace concat` (el texto va entre 'comillas simples'; un nombre de campo con espacios va entre "comillas dobles" o [corchetes]) |
| Elegir | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Fechas | `year month day` de un valor `YYYY-MM-DD` |
| Geometría | `$area $perimeter $length $x $y $vertices`, en las unidades del proyecto |

Un resultado que no puede guardarse en el tipo del campo (texto en un campo numérico) queda vacío y se cuenta en el mensaje. Dividir por cero da un valor vacío. Por ejemplo, `round($area / 43560, 2)` escribe acres a partir de pies cuadrados.

## Exportar

{{ui:Exportar CSV}} guarda las filas que ves (después del filtro y el orden) como archivo CSV en UTF-8, con los nombres de campo en la primera línea. Un texto que empieza con `=`, `+`, `-` o `@` recibe un apóstrofo al principio para que la planilla no lo ejecute como fórmula. Para guardar la capa en sí, usá [Exportar datos como construidos para GIS](topic:gis-export).

## Límites

La tabla muestra la capa con un solo orden y un solo filtro a la vez. Aquí no se agregan ni borran filas (creá una capa nueva desde una selección), la geometría no se edita, y el tipo de un campo no se puede cambiar después de creado.
