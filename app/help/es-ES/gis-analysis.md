---
title: Analizar capas SIG
summary: Zona de influencia, superposición (intersección, unión, borrar, disolver), unión espacial, selección por atributo y medición de las capas SIG de un proyecto, cada una como capa nueva que puede deshacer.
keywords: sig, análisis, zona de influencia, buffer, superposición, intersección, unión, borrar, recortar, disolver, unión espacial, unir, seleccionar por atributo, consulta, condición, expresión, estadística, área, longitud, perímetro, medir, parcelas, servidumbre, retranqueo, shapefile, geopackage, tabla de atributos
from: a6b2d3f9
---

Una vez que un proyecto tiene capas SIG (vea [Importar datos SIG](topic:gis-import)), el botón **Analizar** del grupo SIG (al escribir `GISANALYSIS`, `ANALYZE` o `BUFFER`) abre un panel con cinco pestañas. Permanece abierto junto a la planta, de modo que lo que seleccione se dibuja en la planta mientras trabaja.

Cada herramienta que crea algo **añade una capa nueva** y deja las capas que leyó exactamente como estaban. Cada una es un paso de deshacer: {{ui:Deshacer}} en el panel (o Ctrl+Z) elimina la capa nueva. Exporte el resultado como cualquier capa con [Exportar datos as-built para SIG](topic:gis-export) como shapefile, GeoJSON o GeoPackage.

La tabla completa de una capa, con ordenación, edición y calculadora de campos, está en [Trabajar con la tabla de atributos de una capa](topic:gis-table); el color según un campo está en [Dar estilo a una capa por un atributo](topic:gis-symbology).

Todo se trabaja en la planta, en las unidades del proyecto (pies o metros). Un proyecto siempre está en un sistema proyectado o local, así que una distancia de 50 significa 50 pies o 50 metros, nunca grados. Las alturas (z) no se conservan en los resultados.

## Zona de influencia

Dibuja una zona de una distancia fija alrededor de cada elemento, como nueva capa de polígonos. Los puntos se convierten en círculos, las líneas en corredores con extremos redondeados, y los polígonos crecen. Una distancia **negativa** reduce los polígonos (un cuadrado de 100 por 100 reducido en 5 queda en 90 por 90; reducido en 60 no queda nada, y el panel lo indica). Tome la distancia de un campo numérico para dar a cada elemento la suya, o marque **Fusionar todas las zonas de influencia en una forma** para disolverlas.

Las partes redondeadas son tramos rectos dibujados dentro de la curva real, así que una zona de influencia es un poco más pequeña que el círculo exacto: unos 0.6 % en área con el ajuste normal, y 0.16 % con Fino. Use Fino para todo lo que vaya a medir.

## Superposición

| Herramienta | Qué obtiene |
|---|---|
| Intersección | Las piezas donde la capa de entrada se cruza con los polígonos de superposición, cada una con los campos de ambas. Las líneas y los puntos se recortan a los polígonos. |
| Unión | Ambas capas de polígonos cortadas a lo largo de los bordes de la otra: las piezas compartidas llevan los campos de ambas capas, y el resto los de una sola (los campos de la otra quedan vacíos). |
| Borrar | Los polígonos de entrada sin los polígonos de superposición. Los campos se quedan con la entrada. Un elemento borrado por completo se omite (el panel los cuenta). |
| Disolver | Fusiona los polígonos que se tocan o se solapan, todos, o una forma por cada valor de un campo. Añade `COUNT` y `AREA`. |

Un nombre de campo que tienen ambas capas se conserva para la primera capa, y el de la segunda se escribe con `_2`. Los elementos dentro de una misma capa no deben solaparse entre sí: cuando lo hacen, una Unión cuenta el solapamiento en ambas.

## Unión espacial

Una unión espacial copia atributos de una capa **origen** a cada elemento **destino** que toca, y da una capa nueva con las formas del destino. Elija cuándo se encuentran: al tocarse o solaparse, el destino dentro de un polígono de origen, el destino que contiene el elemento de origen, el elemento de origen más cercano (con límite opcional), o cualquier elemento de origen a una distancia dada.

Cuando coinciden varios elementos de origen, toma los atributos del primero (el más cercano, en las uniones por cercanía y por distancia; se añade `DISTANCE`), o **los cuenta y suma sus campos numéricos**: `COUNT`, y `SUM_`, `MEAN_`, `MIN_`, `MAX_` para cada campo numérico. Desmarque **Conservar los elementos destino sin coincidencia** para dejarlos fuera. Los campos unidos quedan vacíos donde nada coincidió, y el panel cuenta los que no coinciden.

## Seleccionar

Escriba una pregunta sobre los atributos o la forma, pulse **Seleccionar**, y los elementos se dibujan en la planta con su recuento, una tabla y el área, longitud o número total. Después, conviértalos en una capa propia, haga zoom a ellos o borre la selección.

| Puede escribir | Ejemplo |
|---|---|
| Un campo por nombre; use "comillas" o [corchetes] si el nombre tiene espacios | `VALUE`, `"Lot Number"` |
| Números, 'texto', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (el texto no distingue mayúsculas; en `like`, `%` es cualquier secuencia y `_` una letra) | `Notes contains 'corner'` |
| `is null`, `is not null` (un valor vacío cuenta como nulo) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` y paréntesis | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Valores de forma `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Una pregunta incompleta, o que nombra un campo que la capa no tiene, se rechaza con una frase que indica dónde está el problema.

## Medir

Muestra el área y el perímetro totales, la longitud o el número de la capa, y **añade campos** a ella: `AREA` y `PERIMETER` para polígonos, `LENGTH` para líneas (la longitud en planta), `X` e `Y` para puntos. Un campo que ya existe nunca se sobrescribe: el nuevo se llama `AREA_2`. Es un solo paso de deshacer. **Estadística** da el recuento, la suma, la media, el mínimo y el máximo de un campo numérico, opcionalmente para cada valor de otro campo.

:::note
Las comprobaciones de estas herramientas se hacen a mano en la prueba (`node bin/test-civilcraft-gisanalysis.mjs`): por ejemplo, parcelas de 100 por 100 bajo una zona de 100 por 80 se intersecan en 3,000 más 3,000, y una línea de 100 de longitud con una zona de influencia de 10 es 2,000 más un círculo.
:::
