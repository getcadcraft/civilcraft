---
title: Tabelas, quantidades, folhas e SIG de linhas elétricas
summary: Tabelas de regulação e de apoios, quantidades de material para uma folha de cálculo ou para o TakeoffCraft, folhas de planta e de perfil com um relatório de estudo num só PDF, e camadas SIG com os dados de cada elemento.
keywords: tabela de regulação, tabela de apoios, quantidades, lista de materiais, takeoffcraft, folhas, relatório, pdf, folha de perfil, sig, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Tudo isto está em {{ui:Mais}} no grupo Linhas elétricas.

| Saída | Conteúdo |
|---|---|
| {{ui:Tabelas de regulação…}} | Por secção, a tração horizontal e a flecha de cada vão a cada temperatura; guardar como CSV. {{ui:Guardar a tabela de apoios (CSV)}}: a função de cada apoio, o item, o solo, a fixação, a carga máxima, a carga nominal, OK, a sugestão, a fundação, o balanço e o levantamento |
| {{ui:Quantidades…}} | Condutor (comprimentos de catenária × condutores × circuitos + 2 % para ligações e amarrações), apoios e equipamento por item da biblioteca, cabo, vala, escavação, condutas, juntas. CSV, Excel ou um ficheiro de quantidades TakeoffCraft |
| {{ui:Folhas e relatório…}} | Um PDF: a planta; uma folha de perfil para cada linha, com o condutor nas hipóteses de carga que escolher e uma faixa com os comprimentos dos vãos, as flechas e as folgas mais baixas; e um relatório de estudo (conjunto de regras, secções, tabelas de regulação, apoios, todas as verificações) |
| {{ui:Exportar para SIG…}} | Apoios, vãos, rotas de cabos, equipamento e obstáculos como camadas com os respetivos dados (alturas, cargas, flechas, folgas, o que falha), em GeoPackage, shapefiles, GeoJSON, KML ou KMZ |

O GeoJSON e o KML precisam do sistema de coordenadas do projeto ([Sistemas de coordenadas](topic:coordinate-systems)); sem um, o GeoPackage e os shapefiles levam os números do próprio projeto.
