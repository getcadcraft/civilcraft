---
title: Tabelas, quantitativos, folhas e GIS de linhas de energia
summary: Tabelas de lançamento e de estruturas, quantitativos de material para uma planilha ou para o TakeoffCraft, folhas de planta e perfil com um relatório de estudo em um único PDF, e camadas de GIS com os dados de cada ativo.
keywords: tabela de lançamento, tabela de estruturas, quantitativos, lista de materiais, takeoffcraft, folhas, relatório, pdf, folha de perfil, gis, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Tudo aqui fica em {{ui:Mais}}, no grupo Linhas de energia.

| Saída | O que você recebe |
|---|---|
| {{ui:Tabelas de lançamento…}} | Por trecho, a tração horizontal e a flecha de cada vão em cada temperatura; salve como CSV. {{ui:Salvar a tabela de estruturas (CSV)}}: a função de cada estrutura, o item, o terreno, a fixação, a maior carga, a nominal, OK, a sugestão, a fundação, o balanço e o levantamento |
| {{ui:Quantitativos…}} | Condutor (comprimentos de catenária × condutores × circuitos + 2 % para derivações e ancoragens terminais), estruturas e equipamentos por item da biblioteca, cabo, vala, escavação, dutos e emendas. CSV, Excel ou um arquivo de quantitativos do TakeoffCraft |
| {{ui:Folhas e relatório…}} | Um PDF: a planta; uma folha de perfil para cada linha, com o condutor nas hipóteses de carga que você escolher e uma faixa com os comprimentos dos vãos, as flechas e as menores folgas; e um relatório de estudo (regra, seções, tabelas de lançamento, estruturas, cada verificação) |
| {{ui:Exportar para SIG…}} | Estruturas, vãos, trajetos de cabos, equipamentos e obstáculos como camadas com seus dados (alturas, cargas, flechas, folgas, o que falha), em GeoPackage, shapefiles, GeoJSON, KML ou KMZ |

GeoJSON e KML precisam do sistema de coordenadas do projeto ([Sistemas de coordenadas](topic:coordinate-systems)); sem ele, GeoPackage e shapefiles levam os números próprios do projeto.
