---
title: Analizar capas GIS
summary: Buffer, superposición (intersección, unión, borrar, disolver), unión espacial, selección por atributo y medición de las capas GIS de un proyecto, cada una como capa nueva que se puede deshacer.
keywords: gis, análisis, buffer, superposición, intersección, unión, borrar, recortar, disolver, unión espacial, unir, seleccionar por atributo, consulta, donde, expresión, estadística, superficie, longitud, perímetro, medir, parcelas, servidumbre, retiro, shapefile, geopackage, tabla de atributos
from: a6b2d3f9
---

Proyecto-pe capa GIS oguereko rire (ver [Importar datos GIS](topic:gis-import)), GIS grupo-pe **Analizar** botón (`GISANALYSIS`, `ANALYZE` térã `BUFFER` reñeñoíva) omoĩ panel 5 pestaña-nguéra. Oñemoĩ plano apytépe, upévare ejeseleccionáva omoĩ plano-pe ejapo mboyve.

Herramienta oñemoañáva ojapo **capa nueva**, ha umi capa oñeikotevẽvape ndojejoaporãi oñemoambuéi. Peteĩ oñemboguejy ojapóva: panel-pe **{{ui:Deshacer}}** (térã Ctrl+Z) omboguejy capa nueva. Resultado ojapo rupi exportá, capa ambue ramo, [Exportar datos como construidos para GIS](topic:gis-export) shapefile, GeoJSON térã GeoPackage-pe.

Capa-pe oguereko elemento ha atributo tabla hendápe, [Trabajar con la tabla de atributos de una capa](topic:gis-table) rupi; color atributo rupi ojapo [Estilo de capa por atributo](topic:gis-symbology) rupi.

Oĩ plano-pe, proyecto-pe unidad-kuéra (pie térã metro) rupi. Proyecto oĩ mboyve sistema proyectado térã local-pe, upévare distancia 50 ha'e 50 pie térã 50 metro, ndaha'éi grado. Altura (z) ndojeguerekói resultado-pe.

## Buffer

Ojapo zona peteĩ distancia-pe cada elemento rehe, capa polígono nueva-pe. Punto-kuéra círculo ojeporu, línea-kuéra pasillo punta redondeado-pe, polígono-kuéra ojeguenohẽ. **Negativo** distancia ojepyta polígono (100 por 100 cuadrado, 5 rupi ojepyta, 90 por 90 ha'e; 60 rupi ojepyta rire ndaipóri mba'e; panel-pe ohechauka). Distancia campo numérico rupi ojapo cada elemento-pe ipropio, térã marcá **Unir todos los buffers en una forma** ojapo peteĩ forma.

Pe parte redondeada ha'e tembiapo mbovy ojeporu hyñonde curva-pe, upévare buffer ojeikotevẽ hakã iñemi círculo exacto-gui: 0,6 % área-pe normal ajuste-pe, 0,16 % Fino-pe. Mamove ojemensurá, Fino ojeporu.

## Superposición

| Herramienta | Mba'e ojeguerekóva |
|---|---|
| Intersección | Pedazo-kuéra onde capa sustancia polígono-kuéra ojoaju, cada uno campo-kuéra ndive ambos. Líneas y puntos polígono-kuéra-pe recortado. |
| Unión | Ambas capa polígono ojerecorta ambueha borde-kuéra rehe: compartido pedazo-kuéra campo-kuéra ndive ambas; ambue ojeguereko peteĩ capa campo (ambue campo ndoĩri). |
| Borrar | Capa polígono-kuéra overlay polígono-kuéra ojepe'a. Campo-kuéra oĩ capa-pe. Elemento tuichaiterei ojepe'ava ndojejoaporãi (panel-pe ohechauka cantidad). |
| Disolver | Polígono-kuéra ojoaju térã ojepytu ojoaju, opa térã peteĩ forma cada campo valor-pe. Ojapo `COUNT` ha `AREA`. |

Campo réra ambos capa-pe oĩva ojeguereko primera capa-pe, ha segunda capa-pe ojeikuaa `_2` rupi. Peteĩ capa-pe elemento-kuéra ndaikatúi ojoaju: ojoajúpe, Unión-pe ambos-pe ojeporandu superposición.

## Unión espacial

Unión espacial ojemboja atributo **fuente** capa-gui cada **objetivo** elemento-pe ojoajúva, ha peteĩ capa nueva ojapo objetivo forma-kuéra ndive. Ejeporandu cuando ojoaju: tocando térã superponiéndose, objetivo polígono fuente-pe oĩva, objetivo fuente elemento oguerekóva, elemento fuente mboyveve (límite opcional ndive), térã fuente elemento ojeguerekova distancia-pe.

Tuichave fuente elemento ojoajúpe, primera ndive atributo ojeporu (mboyveve, mboyve-mboyve ha distancia unión-pe; `DISTANCE` ojejapo), térã **ojeporandu ha ojeaporta campo numérico**: `COUNT`, ha `SUM_`, `MEAN_`, `MIN_`, `MAX_` campo numérico cada uno-pe. Desmarcá **Mantener elementos objetivo que no encontraron coincidencia** ojejoaporã umi. Unido campo-kuéra ndaipóri ojoajúva-pe, ha panel-pe ojeikuaa ndojoajúva cantidad.

## Seleccionar

Ejeporandu pregunta atributo térã forma-pe, presioná **Seleccionar**, ha elemento-kuéra oñemoĩ plano-pe cantidad, tabla ha área, longitud térã número total ndive. Upe rire capa propia ojapo, zoom ojapo térã selección ojejoaju.

| Ojeporandu ikatu | Ejemplo |
|---|---|
| Campo réra rupi; "comillas" térã [corchetes] nombre-pe espacio oĩramo | `VALUE`, `"Lot Number"` |
| Número, 'texto', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (texto ndaha'eñái mayúscula; `like`-pe `%` peteĩ ruta ha `_` peteĩ letra) | `Notes contains 'corner'` |
| `is null`, `is not null` (valor vacío null ojeikuaa) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` ha corchetes | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Forma valor `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Pregunta ndoipeteĩhaiva térã capa-pe ndoguerekóva campo rérape ojeitykue, mba'épa ojeitykue oñemombe'uva.

## Medir

Ohechauka capa-pe área ha perímetro, longitud térã número total, ha **ojeaporta campo-kuéra**: `AREA` ha `PERIMETER` polígono-kuéra-pe, `LENGTH` línea-kuéra-pe (plano longitud), `X` ha `Y` punto-kuéra-pe. Campo mbovy ojeguereko ndojepo'ỹ: pyahu `AREA_2` rupi oñeikuaa. Peteĩ oñemboguejy. **Estadística** ohechauka cantidad, suma, promedio, mínimo ha máximo campo numérico-pe, ikatu ambue campo valor-kuéra rehe.

:::note
Ko herramienta-kuéra ñemuĩ ojeikuaa prueba-pe ojapo ko'ẽ rupi (`node bin/test-civilcraft-gisanalysis.mjs`): ehemplo, 100 por 100 parcelas zona 100 por 80 rupi intersección 3.000 ha 3.000, ha 100 longitud línea 10 buffer ojapo 2.000 ha círculo.
:::
