---
title: Camadas da planta
summary: Os nomes fixos das camadas, as cores e as espessuras de linha que a CivilCraft usa no ecrã, em DXF e em PDF, e a definição de visualização que controla cada uma.
keywords: camadas, nomes de camadas, ncs, cores, aci, espessuras de linha, camadas dxf, pdf, definições de visualização, traçado
from: c2aa8475
---

Tudo na planta pertence a uma camada. Os nomes seguem o padrão civil habitual (disciplina, grupo principal, grupo secundário). As camadas são fixas nesta versão: não é possível mudar-lhes o nome, alterar as cores nem acrescentar camadas próprias. Em DXF, cada camada tem o número de cor indicado; em PDF com {{ui:Layer colors}}, usam-se as mesmas cores, e com {{ui:Black}} tudo sai a preto.

| Camada | Contém | Cor (número DXF) | Visível quando |
|---|---|---|---|
| C-TOPO-MINR | Curvas de nível secundárias | Cinzento (8) | {{ui:Contours}} |
| C-TOPO-MAJR | Curvas de nível mestras | Branco ou preto (7) | {{ui:Contours}} |
| C-TOPO-TEXT | Etiquetas das curvas de nível | Branco ou preto (7) | {{ui:Contours}} e {{ui:Contour labels}} |
| C-TOPO-TINN | Arestas dos triângulos | Cinzento (8) | {{ui:Triangles}} |
| C-TOPO-BRKL | Linhas de quebra e o limite | Laranja (30) | {{ui:Breaklines}} |
| C-TOPO-BNDY | Limite da superfície | Branco ou preto (7) | {{ui:Surface edge}} |
| C-TOPO-SLOP | Setas de inclinação | Ciano (4) | {{ui:Slope arrows}} |
| V-NODE | Pontos topográficos | Verde (3) | {{ui:Points}} |
| V-NODE-TEXT | Etiquetas dos pontos: número, cota, descrição | Verde (3) | {{ui:Points}} e {{ui:Point labels}} |
| V-NODE-LINE | Linhas a partir de códigos de linha (grupos que não são linhas de quebra) | Verde (3) | {{ui:Points}} |
| C-ROAD-CNTR | Eixos da diretriz | Vermelho (1) | Sempre |
| C-ROAD-STAN | Marcas e etiquetas de PK, PC e PT | Vermelho (1) | Sempre |
| C-ROAD-CORR | Limites dos corredores | Amarelo (2) | Sempre |
| C-ROAD-SCTN | Linhas de amostragem (onde se cortam os perfis transversais) | Cinzento (8) | Quando a diretriz tem linhas de amostragem |
| C-GRAD-PADS | Contornos das plataformas | Azul (5) | Sempre |
| C-GRAD-DAYL | Linhas de intersecção do talude | Magenta (6) | Sempre |
| C-GRAD-SLOP | Linhas de talude da modelação do terreno | Magenta (6) | Sempre |
| C-GRAD-FEAT | Linhas características (3D) | Verde (3) | Sempre |
| C-ROAD-SWPT | Trajetórias de giro: contorno, trajetos exteriores das rodas, nome | Laranja (30) | Sempre |
| C-STRM-PIPE | Coletores | Azul (5) | {{ui:Pipes}} |
| C-STRM-STRC | Órgãos | Azul (5) | {{ui:Pipes}} |
| C-STRM-TEXT | Etiquetas de coletores e órgãos | Azul (5) | {{ui:Pipes}} |
| C-STRM-PROB | Coletores e órgãos com problemas | Vermelho (1) | {{ui:Pipes}} |

As linhas de quebra só são desenhadas enquanto a **Superfície** em **Visualização** estiver em {{ui:Existing ground}}; o limite é desenhado com qualquer uma das superfícies.

## Espessuras de linha em PDF

| Espessura | Camadas |
|---|---|
| 0.50 mm | Eixos da diretriz, plataformas, coletores, coletores com problemas |
| 0.35 mm | Curvas de nível mestras, linhas de intersecção do talude, órgãos |
| 0.25 mm | Linhas de quebra |
| 0.13 mm | Curvas de nível secundárias |
| 0.09 mm | Arestas dos triângulos, linhas de talude da modelação do terreno |
| 0.18 mm | Tudo o resto |

Os ficheiros DXF não guardam espessuras de linha; defina-as por camada no seu programa de CAD.

## Tamanhos das etiquetas

As etiquetas são dimensionadas no papel: etiquetas das curvas de nível 2.0 mm, etiquetas de PK 1.8 mm, etiquetas de PC e PT e de coletores e órgãos 1.6 mm, etiquetas de pontos 1.5 mm. As etiquetas de coletores indicam o nome, o diâmetro e o declive; as de órgãos indicam o nome e a cota do aro. No ecrã, mantêm o mesmo tamanho ao aplicar zoom. No DXF são escaladas para a escala indicada na mensagem de exportação; ver [Exportar a planta para DXF](topic:dxf-export).

## Não representado em nenhuma camada

As faixas de cota são desenhadas sob o traçado apenas no ecrã. A vista de perfil não faz parte da planta.
