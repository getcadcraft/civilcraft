---
title: Traballar coa táboa de atributos dunha capa
summary: Ver cada elemento dunha capa GIS como unha táboa, ordenala e filtrala, seleccionar filas e elementos á vez, corrixir valores, engadir campos, calcular novos valores e gardar a táboa como CSV.
keywords: táboa de atributos, táboa, campos, columnas, filas, ordenar, filtrar, expresión, seleccionar, editar, calculadora de campos, calcular, engadir campo, renomear campo, eliminar campo, csv, exportar, gis, shapefile, geopackage, simboloxía
from: fd9d6c11
---

Abra a táboa dunha capa desde o seu menú de **tres puntos** na lista de capas GIS ({{ui:Táboa de atributos…}}), desde Superficie › Máis › {{ui:Táboa de atributos}}, ou escribindo `ATTRIBUTES`, `ATTTABLE` ou `TABLE`. A táboa ábrese xunto á planta e permanece aberta mentres traballa. Só se debuxan as filas que se ven, así que unha capa con miles de elementos ábrese e despraza rápido.

## Ordenar, filtrar e seleccionar

- **Ordenar:** prema o título dunha columna. Un segundo clic inviste a orde, e un terceiro devolve a orde do ficheiro. Os valores baleiros quedan sempre abaixo. Ordenar só cambia o que se ve, nunca a capa.
- **Filtrar:** escriba na caixa de filtro. Unha expresión como `AREA > 500 and USE = 'Res'` mantén as filas nas que é verdadeira (as mesmas palabras que a lapela Seleccionar de [Analizar capas GIS](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Calquera cousa que non sexa unha expresión, como `oak maple`, busca esas palabras en todas as columnas.
- **Seleccionar filas:** prema unha fila. Ctrl+clic engade ou quita unha, Shift+clic selecciona un tramo, e {{ui:Seleccionar as filas mostradas}} toma todas as filas que pasan o filtro. Os elementos seleccionados debúxanse na planta, e un clic nun elemento da planta selecciona aquí a súa fila.
- Con filas seleccionadas pode {{ui:Zoom}} até elas, crear unha **capa a partir da selección** e ler a superficie ou a lonxitude total na liña de estado.

## Corrixir valores

Faga dobre clic nunha celda (ou mova o cursor até ela coas teclas de frecha e prema Enter), escriba o novo valor e prema Enter. Escape deixa o valor como estaba. Un valor debe encaixar na columna: os números como números, as datas como `YYYY-MM-DD`, o sí/non como sí, non, true ou false. Un valor que non encaixa recházase cunha frase, e non cambia nada. Unha caixa baleira deixa o valor baleiro. Cada edición é un paso de desfacer: {{ui:Desfacer}} e {{ui:Refacer}} están na parte inferior da táboa, e Ctrl+Z funciona na planta.

## Campos

Baixo **Campos** pode engadir un campo (texto, número, data ou sí/non), renomear un ou eliminar un. Un campo novo empeza baleiro. O renomeado propágase: o campo de etiqueta e o [estilo por atributo](topic:gis-symbology) da capa pasan ao novo nome, e ao eliminar un campo quítanse a etiqueta e o estilo que o usaban. Cada cambio é un paso de desfacer que o devolve todo.

## Calculadora de campos

Escribe un valor en cada fila (ou só nas filas seleccionadas) a partir dos outros campos da fila, da súa xeometría e dalgunhas funcións. Escolla un campo existente ou **Un campo novo…** e dálle un nome e un tipo. Nada se executa como código: a expresión lea un pequeno analizador cunha lista fixa de funcións.

| Grupo | Palabras |
|---|---|
| Números | `+ - * /`, parénteses, `abs round(x, digits) floor ceil sqrt pow min max` |
| Texto | `upper lower trim len substr(text, from, count) left right replace concat` (o texto vai entre 'comiñas simples'; un nome de campo con espazos vai entre "comiñas dobres" ou [corchetes]) |
| Selección | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Datas | `year month day` dun valor `YYYY-MM-DD` |
| Xeometría | `$area $perimeter $length $x $y $vertices`, nas unidades do proxecto |

Un resultado que non se pode gardar no tipo do campo (texto nun campo numérico) déixase baleiro e conta na mensaxe. Dividir entre cero dá un valor baleiro. Por exemplo, `round($area / 43560, 2)` escribe acres a partir de pés cadrados.

## Exportar

{{ui:Exportar CSV}} garda as filas que se ven (despois do filtro e da ordenación) como ficheiro CSV en UTF-8, cos nomes de campo na primeira liña. Un texto que empeza por `=`, `+`, `-` ou `@` recibe unha apóstrofo inicial para que a folla de cálculo non o execute como fórmula. Para gardar a propia capa, use [Exportar datos as-built para GIS](topic:gis-export).

## Límites

A táboa amosa a capa cunha soa orde de ordenación e un filtro de cada vez. Aquí non se poden engadir nin eliminar filas (en lugar diso, cree unha capa nova a partir dunha selección), a xeometría non se edita, e o tipo dun campo non se pode cambiar despois de creado.
