---
title: A área de trabalho Paisagismo
summary: Planos de plantação, modelação do terreno, pavimentos, muros, degraus, rega e folhas de paisagismo no mesmo terreno, com as mesmas superfícies e o mesmo ficheiro dos trabalhos de engenharia civil.
keywords: paisagismo, arquitetura paisagista, jardim, plantação, plantas, árvores, modelação, pavimentos, rega, aspersores, área de trabalho, desenho do terreno, plano de paisagismo, pavimentos e muros
from: eea929d1
---

A área de trabalho Paisagismo coloca as ferramentas de desenho paisagístico no terreno do CivilCraft que já tem: os mesmos pontos de levantamento, o mesmo terreno existente, a mesma superfície projetada e o mesmo ficheiro de projeto.

## Abrir

Escolha {{ui:Superfície}} › {{ui:Mais}} › {{ui:Área de trabalho Paisagismo}}. A barra de ferramentas passa a mostrar uma escolha de **Área de trabalho** e um grupo **Paisagismo**, e os grupos Superfície, Desenho e SIG recuam para dar espaço. Escolha **Civil** em Área de trabalho para voltar atrás. O CivilCraft recorda a área de trabalho usada por último neste computador.

O painel esquerdo ganha três secções no topo:

- **Plantas**: a lista de plantas, para pesquisar e escolher o que coloca. Veja [A lista de plantas](topic:plant-list).
- **Verificações de modelação**: análise de declives, setas de escoamento e acumulação de água. Veja [Modelação](topic:landscape-grading).
- **Rega**: os aspersores e as tubagens que coloca a seguir, e as definições do abastecimento de água. Veja [Rega](topic:irrigation).

## O que existe no grupo Paisagismo

| Ferramenta | O que faz | Tópico |
|---|---|---|
| **Planta**, **Canteiro**, **Sebe** | Plantas isoladas, canteiros de plantação preenchidos ao espaçamento das plantas, sebes ao longo de uma linha | [Plantação](topic:planting) |
| **Modelar** | Plataformas, taludes, valas, áreas de modelação com cotas pontuais e curvas de nível, verificações de declive e de escoamento | [Modelação](topic:landscape-grading) |
| **Pavimentos e muros** | Pavimentos, caminhos, muros, lancis, rampas e degraus que seguem o terreno | [Pavimentos e muros](topic:hardscape) |
| **Áreas** | Áreas plantadas: relvados, canteiros, prados e coberturas vegetais com uma camada, recortadas à volta dos pavimentos | [Áreas plantadas](topic:planted-areas) |
| **Cotas** | Modificadores do terreno por ordem, com corte e aterro, cotas pontuais, setas de inclinação, linhas de corte | [Modificadores do terreno](topic:ground-modifiers), [Cortes](topic:landscape-sections) |
| **Rega** | Aspersores, tubagens, válvulas, linhas de gotejamento, o abastecimento, a cobertura e uma verificação hidráulica | [Rega](topic:irrigation) |
| **Mais** | A partir de uma linha (objetos mantidos ligados às linhas do desenho), o mapa de plantação, a tabela de plantas, as folhas de cálculo, os gráficos de plantas, os objetos de forma livre, as folhas de paisagismo e o conjunto de publicação, a exportação IFC, o tamanho e as etiquetas das plantas | [Objetos a partir de linhas](topic:objects-from-lines), [Registos de plantas](topic:plant-records), [Folhas de cálculo](topic:worksheets), [Folhas de paisagismo](topic:landscape-sheets), [Objetos de forma livre](topic:freeform-objects) |

Tudo o que adiciona é um único passo de anulação, fica guardado no ficheiro de projeto e desenha-se na planta em camadas com os nomes `L-PLNT-…`, `L-GRAD-…`, `L-HARD-…` e `L-IRRG-…`, pelo que as exportações DXF, DWG e PDF também o incluem.

## Uma superfície para tudo

As plataformas, os taludes, as valas, as áreas de modelação, os pavimentos e os caminhos são moldados na **superfície projetada**, a mesma que usam os corredores e as plataformas de implantação. O **terreno existente** nunca muda. As plantas assentam no terreno que estiver por baixo delas, por isso deslocam-se quando a modelação muda. O movimento de terras inclui a modelação paisagística juntamente com tudo o resto.

:::tip
Primeira vez a usar? [Desenhar um jardim, do início ao fim](topic:landscape-walkthrough) percorre toda a área de trabalho no terreno de exemplo.
:::
