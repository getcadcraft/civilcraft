---
title: Analizar capas SIG
summary: Búfer, superposición (intersección, unión, borrar, disolver), combinación espacial, selección por atributo y medición de las capas SIG de un proyecto, cada una como capa nueva que puede deshacer.
keywords: sig, análisis, búfer, zona de influencia, superposición, intersección, unión, borrar, recortar, disolver, combinación espacial, combinar, seleccionar por atributo, consulta, donde, expresión, estadísticas, área, longitud, perímetro, medir, parcelas, servidumbre, retiro, shapefile, geopackage, tabla de atributos
from: a6b2d3f9
---

Una vez que el proyecto tenga capas SIG (vea [Importar datos SIG](topic:gis-import)), el botón {{ui:Analizar}} del grupo SIG (escriba `GISANALYSIS`, `ANALYZE` o `BUFFER`) abre un panel con cinco pestañas. El panel permanece abierto junto a la planta, de modo que lo que seleccione se dibuja en la planta mientras trabaja.

Cada herramienta que genera algo **agrega una capa nueva** y deja las capas de origen exactamente como estaban. Cada una es un paso de deshacer: {{ui:Deshacer}} en el panel (o Ctrl+Z) quita la capa nueva. Exporte el resultado como cualquier capa con [Exportar datos según lo construido para SIG](topic:gis-export) como shapefile, GeoJSON o GeoPackage.

La tabla completa de una capa, con ordenar, editar y una calculadora de campos, está en [Trabajar con la tabla de atributos de una capa](topic:gis-table); colorear según un campo está en [Dar estilo a una capa por un atributo](topic:gis-symbology).

Todo se trabaja en la planta, en las unidades del proyecto (pies o metros). Un proyecto siempre está en un sistema proyectado o local, así que una distancia de 50 significa 50 pies o 50 metros, nunca grados. Las alturas (z) no se conservan en los resultados.

## Búfer

Dibuja una zona a una distancia fija alrededor de cada entidad, como una capa nueva de polígonos. Los puntos se convierten en círculos, las líneas en corredores con extremos redondeados, y los polígonos crecen. Una distancia **negativa** reduce los polígonos (un cuadrado de 100 por 100 reducido en 5 queda en 90 por 90; reducido en 60 no queda nada, y el panel lo indica). Tome la distancia de un campo numérico para dar a cada entidad la suya, o marque **Fusionar todos los búferes en una sola forma** para disolverlos.

Las partes redondeadas son tramos rectos dibujados dentro de la curva verdadera, así que un búfer es un poco más pequeño que el círculo exacto: alrededor de 0.6 % en área con la configuración normal, y 0.16 % con Fino. Use Fino para cualquier cosa que vaya a medir.

## Superposición

| Herramienta | Lo que obtiene |
|---|---|
| Intersección | Las piezas donde la capa de entrada se encuentra con los polígonos de superposición, cada una con los campos de ambas. Las líneas y los puntos se recortan a los polígonos. |
| Unión | Ambas capas de polígonos cortadas a lo largo de los bordes de la otra: las piezas compartidas llevan los campos de ambas capas; las demás, los de una sola (los campos de la otra quedan vacíos). |
| Borrar | Los polígonos de entrada con los polígonos de superposición quitados. Los campos se conservan en la entrada. Una entidad borrada por completo se omite (el panel las cuenta). |
| Disolver | Une los polígonos que se tocan o se superponen, todos juntos o una forma por cada valor de un campo. Agrega `COUNT` y `AREA`. |

Un nombre de campo que ambas capas tienen se conserva para la primera capa, y el de la segunda se escribe con `_2`. Las entidades dentro de una misma capa no deben superponerse entre sí: cuando lo hacen, una Unión cuenta la superposición en ambas.

## Combinación espacial

Una combinación espacial copia atributos de una capa **origen** a cada entidad **destino** que la toca, y da una capa nueva con las formas del destino. Elija cuándo se encuentran: al tocarse o superponerse, el destino dentro de un polígono origen, el destino que contiene la entidad origen, la entidad origen más cercana (con un límite opcional), o cualquier entidad origen dentro de una distancia.

Cuando coinciden varias entidades origen, toma los atributos de la primera (la más cercana, en las combinaciones por cercanía y por distancia; se agrega `DISTANCE`), o **las cuenta y suma sus campos numéricos**: `COUNT`, y `SUM_`, `MEAN_`, `MIN_`, `MAX_` para cada campo numérico. Desmarque **Conservar las entidades destino que no encontraron coincidencia** para omitirlas. Los campos combinados quedan vacíos donde nada coincidió, y el panel cuenta las no coincidentes.

## Seleccionar

Escriba una pregunta sobre los atributos o la forma, pulse **Seleccionar**, y las entidades se dibujan en la planta con su conteo, una tabla y el área, longitud o número total. Después puede convertirlas en una capa propia, hacer zoom a ellas o quitar la selección.

| Puede escribir | Ejemplo |
|---|---|
| Un campo por nombre; use "comillas" o [corchetes] si el nombre tiene espacios | `VALUE`, `"Lot Number"` |
| Números, 'texto', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (el texto ignora mayúsculas; en `like`, `%` es cualquier secuencia y `_` una letra) | `Notes contains 'corner'` |
| `is null`, `is not null` (un valor vacío cuenta como null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` y paréntesis | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Valores de forma `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Una consulta incompleta, o que nombra un campo que la capa no tiene, se rechaza con una oración que indica dónde está el problema.

## Medir

Muestra el área y el perímetro totales, la longitud o el número de la capa, y **agrega campos** a ella: `AREA` y `PERIMETER` para polígonos, `LENGTH` para líneas (la longitud en planta), `X` y `Y` para puntos. Un campo que ya existe nunca se sobrescribe: el nuevo se llama `AREA_2`. Esto es un solo paso de deshacer. **Estadísticas** da el conteo, la suma, la media, el mínimo y el máximo de un campo numérico, opcionalmente para cada valor de otro campo.

:::note
Las comprobaciones de estas herramientas se verifican a mano en la prueba (`node bin/test-civilcraft-gisanalysis.mjs`): por ejemplo, parcelas de 100 por 100 bajo una zona de 100 por 80 se intersecan en 3,000 más 3,000, y una línea de 100 de largo con un búfer de 10 mide 2,000 más un círculo.
:::
