---
title: Analizar capas GIS
summary: Zona de influencia, superposición (intersección, unión, borrado, disolución), unión espacial, selección por atributo e medición das capas GIS dun proxecto, cada unha como unha capa nova que se pode desfacer.
keywords: gis, análise, zona de influencia, superposición, intersección, unión, borrar, recortar, disolver, unión espacial, unir, seleccionar por atributo, consulta, onde, expresión, estatística, superficie, lonxitude, perímetro, medir, parcelas, servidume, retranqueo, shapefile, geopackage, táboa de atributos
from: a6b2d3f9
---

Cando un proxecto teña capas GIS (ver [Importar datos GIS](topic:gis-import)), o botón **Analizar** do grupo GIS (escrito `GISANALYSIS`, `ANALYZE` ou `BUFFER`) abre un panel con cinco lapelas. Permanece aberto xunto á planta, así que o que selecciona debúxase na planta mentres traballa.

Cada ferramenta que crea algo **engade unha capa nova** e deixa as capas que lee exactamente como estaban. Cada unha é un paso de desfacer: {{ui:Desfacer}} no panel (ou Ctrl+Z) elimina a capa nova. Exporte o resultado como calquera capa con [Exportar datos as-built para GIS](topic:gis-export) en formato shapefile, GeoJSON ou GeoPackage.

A táboa completa dunha capa, con ordenación, edición e calculadora de campos, está en [Traballar coa táboa de atributos dunha capa](topic:gis-table); a coloración por un campo está en [Dar estilo a unha capa segundo un atributo](topic:gis-symbology).

Todo se traballa na planta, nas unidades do proxecto (pés ou metros). Un proxecto está sempre nun sistema proxectado ou local, así que unha distancia de 50 significa 50 pés ou 50 metros, nunca graos. As alturas (z) non se conservan nos resultados.

## Zona de influencia

Debuxa unha zona dunha distancia fixa ao redor de cada elemento, como unha nova capa de polígonos. Os puntos convértense en círculos, as liñas en corredores con extremos redondeados, e os polígonos crecen. Unha distancia **negativa** reduce os polígonos (un cadrado de 100 por 100 reducido en 5 queda en 90 por 90; reducido en 60 non queda nada, e o panel así o indica). Tome a distancia dun campo numérico para dar a cada elemento a súa propia, ou marque **Combinar todas as zonas de influencia nunha soa forma** para disolvelas.

As partes redondeadas son tramos rectos debuxados dentro da curva real, así que unha zona de influencia é un pouco máis pequena que o círculo exacto: uns 0,6 % en superficie coa configuración normal, e 0,16 % en Fino. Use Fino para calquera cousa que vaia medir.

## Superposición

| Ferramenta | Que obtén |
|---|---|
| Intersect | As pezas onde a capa de entrada se atopa cos polígonos de superposición, cada unha cos campos de ambas. As liñas e os puntos recórtanse aos polígonos. |
| Union | Ambas capas de polígonos cortadas ao longo dos bordos da outra: as pezas compartidas levan os campos das dúas capas, e as demais levan os dunha capa (os campos da outra quedan baleiros). |
| Erase | Os polígonos de entrada sen os polígonos de superposición. Os campos quedan coa entrada. Un elemento borrado por completo sae da capa (o panel cóntaos). |
| Dissolve | Combina os polígonos que se tocan ou se superpoñen, todos ou unha forma por cada valor dun campo. Engade `COUNT` e `AREA`. |

Un nome de campo que teñen as dúas capas consérvase para a primeira, e o da segunda escríbese con `_2`. Os elementos dentro dunha mesma capa non deberían superporse entre si: se o fan, unha Union conta a superposición nas dúas.

## Unir

Unha unión espacial copia atributos dunha capa **orixe** a cada elemento **destino** que a toque, e dá unha capa nova coas formas do destino. Escolla cando se tocan: tocándose ou superpoñéndose, o destino dentro dun polígono de orixe, o destino que contén o elemento de orixe, o elemento de orixe máis próximo (cun límite opcional), ou calquera elemento de orixe dentro dunha distancia.

Cando coinciden varios elementos de orixe, toma os atributos do primeiro (o máis próximo, nas uniones por proximidade e distancia; engádese `DISTANCE`), ou **cóntaos e súmanse os seus campos numéricos**: `COUNT`, e `SUM_`, `MEAN_`, `MIN_`, `MAX_` por cada campo numérico. Desmarque **Conservar os elementos destino sen coincidencia** para deixalos fóra. Os campos unidos quedan baleiros onde non coincidiu nada, e o panel conta os que non coincidiron.

## Seleccionar

Escriba unha pregunta sobre os atributos ou a forma, prema **Seleccionar**, e os elementos debúxanse na planta co seu número, unha táboa e a superficie, lonxitude ou cantidade total. Despois pode convertelos nunha capa propia, ampliar até eles ou borrar a selección.

| Pode escribir | Exemplo |
|---|---|
| Un campo polo nome; use "comiñas" ou [corchetes] se o nome ten espazos | `VALUE`, `"Lot Number"` |
| Números, 'texto', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| contains startswith endswith like ilike (o texto ignora maiúsculas; en like, % é calquera cadea e _ unha letra) | `Notes contains 'corner'` |
| is null, is not null (un valor baleiro conta como null) | `Notes is null` |
| in (…), not in (…), between … and … | `Use_ in ('Com', 'Ind')` |
| `+ - * /` e parénteses | `VALUE / 2 > 100` |
| and, or, not | `Use_ = 'Res' and VALUE > 200` |
| Valores da forma `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Unha pregunta incompleta ou que nomea un campo que a capa non ten recházase cunha frase que indica onde está o erro.

## Medir

Amosa a superficie total e o perímetro, a lonxitude ou a cantidade da capa, e **engade campos** a ela: `AREA` e `PERIMETER` para polígonos, `LENGTH` para liñas (a lonxitude na planta), `X` e `Y` para puntos. Un campo que xa existe nunca se sobrescribe: o novo chámase `AREA_2`. Isto é un paso de desfacer. **Estatísticas** dá a cantidade, a suma, a media, o mínimo e o máximo dun campo numérico, opcionalmente por cada valor doutro campo.

:::note
As comprobacións detrás destas ferramentas faense a man na proba (`node bin/test-civilcraft-gisanalysis.mjs`): por exemplo, parcelas de 100 por 100 baixo unha zona de 100 por 80 cruzan en 3.000 máis 3.000, e unha liña de 100 de longo con zona de influencia de 10 dá 2.000 máis un círculo.
:::
