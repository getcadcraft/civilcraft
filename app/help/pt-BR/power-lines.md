---
title: A área de trabalho de linhas de energia
summary: Linhas aéreas e cabos subterrâneos no seu terreno, com suas próprias bibliotecas, flecha e tração sob as suas hipóteses de carga, verificações de folga e resistência, tabelas de lançamento, quantitativos, folhas e exportação para GIS.
keywords: linha de energia, linha aérea, elétrica, distribuição, postes, estruturas, condutor, flecha, tração, lançamento, folga, cabo subterrâneo, vala, área de trabalho, concessionária
from: 638dd856
---

A área de trabalho de linhas de energia coloca linhas aéreas e cabos subterrâneos no site do CivilCraft que você já tem: os mesmos pontos de levantamento, o mesmo terreno, o mesmo arquivo de projeto.

:::warning
Uma ferramenta de projeto. A área de trabalho calcula flecha, tração, folgas e cargas a partir das **suas** hipóteses de carga e limites; nenhuma norma de país está embutida. Um engenheiro confere cada resultado com a norma aplicável antes de qualquer obra.
:::

## Abrir

Escolha {{ui:Superfície}} › {{ui:Mais}} › {{ui:Área de trabalho de linhas de energia}}, ou **Linhas de energia** em Área de trabalho. A barra de ferramentas então mostra um grupo **Linhas de energia**; os grupos Projeto e GIS são recolhidos. Escolha **Civil** em Área de trabalho para voltar. O CivilCraft lembra a área de trabalho que você usou por último neste computador.

O painel da esquerda ganha duas seções no topo:

- **Linhas de energia**: suas hipóteses de carga e limites, as linhas e cabos do projeto, e **Verificações**, sempre atualizadas. Clique em uma verificação para selecionar o objeto a que ela se refere.
- **Biblioteca**: seus próprios condutores, cabos, estruturas, equipamentos e tipos de vala. Veja [Sua biblioteca de linhas de energia](topic:power-line-library).

## O que há no grupo Linhas de energia

| Ferramenta | O que faz | Tópico |
|---|---|---|
| **Linha** | Uma linha aérea: clique em cada estrutura | [Desenhar uma linha aérea](topic:overhead-line) |
| **Estrutura** | Adiciona uma estrutura em um vão | [Desenhar uma linha aérea](topic:overhead-line) |
| **Cabo** | Um trajeto de cabo subterrâneo em uma vala | [Cabos subterrâneos](topic:underground-cables) |
| **Equipamento** | Um gabinete, um transformador, uma emenda ou a fonte que alimenta a rede | [Cabos subterrâneos](topic:underground-cables) |
| **{{ui:Obstáculo}}** | Algo que uma linha cruza: uma via, uma edificação, outra linha | [Verificações](topic:power-line-checks) |
| **{{ui:Perfil}}** | O perfil da linha: terreno, estruturas e condutor em cada hipótese de carga | [Desenhar uma linha aérea](topic:overhead-line#the-line-profile) |
| **{{ui:Mais}}** | Hipóteses de carga e limites, tabelas de lançamento, quantitativos, folhas e relatório, GIS, arquivos de estudo | [Flecha e tração](topic:sag-and-tension), [Saídas](topic:power-line-outputs), [Arquivos de estudo](topic:power-line-study-file) |

Tudo o que você adiciona é uma única etapa de desfazer, é salvo no arquivo do projeto e desenha na planta, em camadas chamadas `C-POWR-…`, de modo que as exportações DXF, DWG e PDF também o incluem.
