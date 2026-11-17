---
title: Camadas da planta
summary: Os nomes fixos das camadas, as cores e as espessuras de linha que o CivilCraft usa na tela, no DXF e no PDF, e qual configuração de exibição controla cada uma.
keywords: camadas, nomes de camadas, ncs, cores, aci, espessuras de linha, camadas dxf, pdf, configurações de exibição, linhas de desenho
from: c2aa8475
---

Tudo na planta pertence a uma camada. Os nomes seguem o padrão comum de camadas civis (disciplina, grupo principal, grupo secundário). As camadas são fixas nesta versão: você não pode renomeá-las, alterar suas cores nem adicionar as suas. No DXF, cada camada tem o número de cor mostrado; no PDF com {{ui:Cores das camadas}}, as mesmas cores são usadas, e com {{ui:Preto}} tudo é impresso em preto.

| Camada | Contém | Cor (número DXF) | Exibida quando |
|---|---|---|---|
| C-TOPO-MINR | Curvas secundárias | Cinza (8) | {{ui:Curvas de nível}} |
| C-TOPO-MAJR | Curvas mestras | Branco ou preto (7) | {{ui:Curvas de nível}} |
| C-TOPO-TEXT | Rótulos das curvas de nível | Branco ou preto (7) | {{ui:Curvas de nível}} e {{ui:Rótulos das curvas de nível}} |
| C-TOPO-TINN | Arestas dos triângulos | Cinza (8) | {{ui:Triângulos}} |
| C-TOPO-BRKL | Linhas de quebra e o contorno | Laranja (30) | {{ui:Linhas de quebra}} |
| C-TOPO-BNDY | Borda da superfície | Branco ou preto (7) | {{ui:Borda da superfície}} |
| C-TOPO-SLOP | Setas de declividade | Ciano (4) | {{ui:Setas de declividade}} |
| V-NODE | Pontos topográficos | Verde (3) | {{ui:Pontos}} |
| V-NODE-TEXT | Rótulos dos pontos: número, cota, descrição | Verde (3) | {{ui:Pontos}} e {{ui:Rótulos dos pontos}} |
| V-NODE-LINE | Linhas dos códigos de linha (grupos que não são linhas de quebra) | Verde (3) | {{ui:Pontos}} |
| C-ROAD-CNTR | Eixos dos alinhamentos | Vermelho (1) | Sempre |
| C-ROAD-STAN | Marcas e rótulos de estacas, PC e PT | Vermelho (1) | Sempre |
| C-ROAD-CORR | Bordas de corredor | Amarelo (2) | Sempre |
| C-ROAD-SCTN | Linhas de amostragem (onde as seções são cortadas) | Cinza (8) | Quando o alinhamento tem linhas de amostragem |
| C-GRAD-PADS | Contornos de plataformas | Azul (5) | Sempre |
| C-GRAD-DAYL | Linhas de pé de talude | Magenta (6) | Sempre |
| C-GRAD-SLOP | Linhas de talude de terraplenagem | Magenta (6) | Sempre |
| C-GRAD-FEAT | Linhas de feição (3D) | Verde (3) | Sempre |
| C-ROAD-SWPT | Trajetórias de varredura: contorno, trajetórias das rodas mais externas, nome | Laranja (30) | Sempre |
| C-STRM-PIPE | Tubos | Azul (5) | {{ui:Tubos}} |
| C-STRM-STRC | Estruturas | Azul (5) | {{ui:Tubos}} |
| C-STRM-TEXT | Rótulos de tubos e estruturas | Azul (5) | {{ui:Tubos}} |
| C-STRM-PROB | Tubos e estruturas com problemas | Vermelho (1) | {{ui:Tubos}} |

As linhas de quebra são desenhadas somente enquanto **Superfície**, em **Exibição**, estiver em {{ui:Terreno natural}}; o contorno é desenhado com qualquer superfície.

## Espessuras de linha no PDF

| Espessura | Camadas |
|---|---|
| 0.50 mm | Eixos de alinhamento, plataformas, tubos, tubos com problemas |
| 0.35 mm | Curvas mestras, linhas de pé de talude, estruturas |
| 0.25 mm | Linhas de quebra |
| 0.13 mm | Curvas secundárias |
| 0.09 mm | Arestas dos triângulos, linhas de talude de terraplenagem |
| 0.18 mm | Todo o resto |

Arquivos DXF não trazem espessuras de linha; defina-as por camada no seu programa de CAD.

## Tamanhos dos rótulos

Os rótulos têm tamanho no papel: rótulos de curvas de nível 2.0 mm, rótulos de estacas 1.8 mm, rótulos de PC e PT e de tubos e estruturas 1.6 mm, rótulos de pontos 1.5 mm. Os rótulos de tubos mostram nome, diâmetro e declividade; os de estruturas mostram nome e tampa. Na tela, eles mantêm o mesmo tamanho ao aplicar zoom. No DXF, são escalados pela escala informada na mensagem de exportação; veja [Exportar a planta para DXF](topic:dxf-export).

## Não exibido em nenhuma camada

As faixas de elevação são desenhadas sob as linhas somente na tela. A vista de perfil não faz parte da planta.
