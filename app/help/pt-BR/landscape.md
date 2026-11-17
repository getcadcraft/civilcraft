---
title: A área de trabalho de paisagismo
summary: Planos de plantio, terraplenagem, pavimentos, muros, degraus, irrigação e folhas de paisagismo no mesmo local, com as mesmas superfícies e o mesmo arquivo da obra civil.
keywords: paisagismo, arquitetura paisagística, jardim, plantio, plantas, árvores, terraplenagem, elementos construídos, pavimentação, irrigação, aspersores, área de trabalho, projeto de local, plano de paisagismo
from: eea929d1
---

A área de trabalho de paisagismo coloca as ferramentas de projeto paisagístico no local do CivilCraft que você já tem: os mesmos pontos de levantamento, o mesmo terreno natural, a mesma superfície proposta e o mesmo arquivo de projeto.

## Abrir

Escolha {{ui:Surface}} › {{ui:More}} › {{ui:Landscape workspace}}. A barra de ferramentas passa a mostrar uma escolha de **Área de trabalho** e um grupo **Paisagismo**, e os grupos Superfície, Projeto e GIS saem de cena para dar espaço. Escolha **Civil** em Área de trabalho para voltar. O CivilCraft lembra a área de trabalho que você usou por último neste computador.

O painel esquerdo ganha três seções no topo:

- **Plantas**: a lista de plantas, para pesquisar e escolher o que colocar. Veja [A lista de plantas](topic:plant-list).
- **Verificações de terraplenagem**: análise de declividade, setas de fluxo e empoçamento. Veja [Terraplenagem](topic:landscape-grading).
- **Irrigação**: os aspersores e tubos que você coloca em seguida, e as configurações da alimentação de água. Veja [Irrigação](topic:irrigation).

## O que há no grupo Paisagismo

| Ferramenta | O que faz | Tópico |
|---|---|---|
| **Planta**, **Canteiro**, **Cerca viva** | Plantas isoladas, canteiros de plantio preenchidos no espaçamento das plantas, cercas vivas ao longo de uma linha | [Plantio](topic:planting) |
| **Terraplenagem** | Plataformas, camalhões, valas de drenagem, áreas de terraplenagem com cotas de nível e curvas de nível, verificações de declividade e de fluxo | [Terraplenagem](topic:landscape-grading) |
| **Elementos construídos** | Pavimentos, caminhos, muros, meios-fios, rampas e degraus que acompanham o terreno | [Elementos construídos](topic:hardscape) |
| **Áreas** | Áreas plantadas: gramados, canteiros, prados e coberturas do solo com composição de camadas, recortadas ao redor dos elementos construídos | [Áreas plantadas](topic:planted-areas) |
| **Níveis** | Modificadores do terreno em ordem, com corte e aterro, cotas de nível, setas de declividade e linhas de corte | [Modificadores do terreno](topic:ground-modifiers), [Seções](topic:landscape-sections) |
| **Irrigação** | Aspersores, tubos, válvulas, linhas de gotejamento, a alimentação, a cobertura e uma verificação hidráulica | [Irrigação](topic:irrigation) |
| **Mais** | A partir de uma linha (objetos mantidos vinculados às linhas), a tabela de plantio, a tabela de plantas, planilhas, gráficos de plantas, objetos de forma livre, folhas de paisagismo e o conjunto de publicação, exportação IFC, tamanho e rótulos das plantas | [Objetos a partir das linhas](topic:objects-from-lines), [Registros de plantas](topic:plant-records), [Planilhas](topic:worksheets), [Folhas de paisagismo](topic:landscape-sheets), [Objetos de forma livre](topic:freeform-objects) |

Tudo o que você adiciona é um passo de desfazer, é salvo no arquivo do projeto e é desenhado na planta em camadas com nomes `L-PLNT-…`, `L-GRAD-…`, `L-HARD-…` e `L-IRRG-…`, então as exportações DXF, DWG e PDF também levam tudo.

## Uma superfície para tudo

Plataformas, camalhões, valas de drenagem, áreas de terraplenagem, pavimentos e caminhos são modelados na **superfície proposta**, a mesma que usam os corredores e as plataformas. O **terreno natural** nunca muda. As plantas ficam sobre o terreno que estiver embaixo delas, então se movem quando a terraplenagem muda. A movimentação de terra conta a terraplenagem do paisagismo junto com todo o resto.

:::tip
Novo nisso? [Projetar um jardim, do início ao fim](topic:landscape-walkthrough) percorre toda a área de trabalho no local de exemplo.
:::
