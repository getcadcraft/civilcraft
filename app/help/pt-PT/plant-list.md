---
title: A lista de plantas
summary: Cerca de 420 plantas temperadas e mediterrânicas comuns, com os seus tamanhos, rusticidade, luz e água, pesquisáveis em qualquer língua, mais a sua própria lista guardada com o projeto.
keywords: lista de plantas, base de dados de plantas, espécie, nome botânico, nome comum, paleta de plantas, lista de viveiro, zona de rusticidade, csv, importar plantas, exportar plantas, as minhas plantas, lista de árvores, lista de arbustos, plantas, biblioteca de plantas
from: 7ed09e7e
---

A secção **Plantas** do painel da esquerda lista todas as plantas que pode colocar. Clique numa para ver os seus tamanhos e para a tornar a planta que **Planta**, **Canteiro** e **Sebe** usam.

## Pesquisar e filtrar

Escreva em **Pesquisar**: qualquer palavra do nome de uma planta em qualquer língua (inglês, espanhol, português), o seu nome botânico, o seu tipo ou uma palavra nas suas notas. Todas as palavras escritas têm de corresponder, pelo que `quercus evergreen` encontra os carvalhos perenifólios. Os acentos não interessam.

Restrinja a lista com **Tipo**, **Luz**, **Água** e **Zona de rusticidade** (a zona USDA onde fica o seu local: uma planta é listada quando a zona está dentro do seu intervalo).

## O que cada planta contém

| Campo | Significado |
|---|---|
| Tipo | Árvore, arbusto, sebe, relva (incluindo os relvados), vivaz, cobertura do solo ou trepadeira |
| Na maturidade | Altura e largura da copa da planta crescida num jardim ou numa rua, em metros |
| Na plantação | O tamanho com que é plantada, e o seu contentor |
| Espaçamento | De centro a centro num canteiro ou ao longo de uma sebe |
| Zona de rusticidade | As zonas USDA onde costuma ser rústica |
| Luz, água, solo | O que necessita |
| Notas | Usos e cuidados, como partes tóxicas ou uma planta que se espalha |

:::note
A lista incorporada foi escrita para o CadCraft a partir de conhecimento hortícola geral: tamanhos típicos, arredondados. Não é o catálogo de nenhum viveiro. Confirme tamanhos e rusticidade com um viveiro local. As plantas invasoras mais conhecidas da Península Ibérica e de grande parte do mundo temperado foram deliberadamente excluídas, e algumas que são invasoras noutros locais têm uma nota.
:::

## As suas próprias plantas

- **Adicionar à lista deste projeto** copia uma planta para a lista própria do projeto, onde fica guardada com o projeto. Uma planta na lista substitui a incorporada com a mesma chave, para que possa alterar os tamanhos para a sua região.
- **Importar uma lista de plantas…** lê um CSV (ou um ficheiro de plantas). O CSV precisa de uma coluna com o nome botânico e, de preferência, o tipo, a altura e a largura; os nomes de colunas na sua própria linguagem funcionam (Latim, Nome comum, Altura, Largura, Zona). São lidos separadores de vírgula, ponto e vírgula ou tabulação, e vírgulas decimais. Tamanhos de plantação, espaçamentos e contentores vazios assumem valores sensatos para o tipo.
- **Exportar como CSV** guarda a sua lista (ou, se não tiver nenhuma, as plantas que a pesquisa mostra) para abrir numa folha de cálculo.

Uma lista de plantas é lida como qualquer ficheiro vindo do exterior: o que não consegue usar fica de fora e é contado.

## Plantas noutras aplicações

A lista de plantas é uma só biblioteca para todas as aplicações do CadCraft: o BimCraft e o ModelCraft têm a mesma lista, mas o seu próprio **Colocar da biblioteca** ainda não oferece plantas. Hoje as plantas chegam a um modelo BIM através do IFC de paisagismo da CivilCraft (cada planta é um `IfcGeographicElement`). Consulte [Plantação](topic:planting#ifc).
