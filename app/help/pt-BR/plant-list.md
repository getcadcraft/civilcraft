---
title: A lista de plantas
summary: Cerca de 420 plantas comuns de clima temperado e mediterrâneo, com seus tamanhos, rusticidade, luz e água, pesquisáveis em qualquer idioma, além de sua própria lista salva com o projeto.
keywords: lista de plantas, banco de dados de plantas, espécie, nome botânico, nome comum, paleta de plantas, lista de viveiro, zona de rusticidade, csv, importar plantas, exportar plantas, minhas plantas, lista de árvores, lista de arbustos, plantas, biblioteca de plantas
from: 7ed09e7e
---

A seção **Plantas**, no painel da esquerda, lista todas as plantas que você pode posicionar. Clique em uma para ver seus tamanhos e torná-la a planta usada por **Planta**, **Canteiro** e **Cerca viva**.

## Pesquisa e filtro

Digite em **Pesquisar**: qualquer palavra do nome de uma planta em qualquer idioma (inglês, espanhol, português), seu nome botânico, seu tipo ou uma palavra das notas. Todas as palavras digitadas precisam coincidir, então `quercus evergreen` encontra os carvalhos sempre-verdes. Acentos não fazem diferença.

Restrinja a lista com **Tipo**, **Luz**, **Água** e **Zona de rusticidade** (a zona USDA em que fica o seu terreno: uma planta aparece quando a zona está dentro da sua faixa).

## O que uma planta contém

| Campo | Significado |
|---|---|
| Tipo | Árvore, arbusto, cerca viva, gramínea (inclusive gramados), perene, forração ou trepadeira |
| Na maturidade | Altura e espalhamento da planta crescida em jardim ou rua, em metros |
| No plantio | O tamanho em que é plantada, e seu recipiente |
| Espaçamento | Centro a centro em canteiro ou ao longo de uma cerca viva |
| Zona de rusticidade | As zonas USDA em que costuma resistir |
| Luz, água, solo | O que ela precisa |
| Notas | Usos e cuidados, como partes tóxicas ou uma planta que se espalha |

:::note
A lista embutida foi escrita para o CadCraft a partir de conhecimento hortícola geral: tamanhos típicos, arredondados. Não é o catálogo de nenhum viveiro. Confira tamanhos e rusticidade com um viveiro local. As plantas invasoras mais conhecidas da Península Ibérica e de boa parte do mundo temperado foram deixadas de fora de propósito, e algumas que são invasoras em alguma região têm uma nota.
:::

## Suas próprias plantas

- **Adicionar à lista deste projeto** copia uma planta para a lista própria do projeto, onde ela é salva com o projeto. Uma planta na sua lista substitui a embutida com a mesma chave, então você pode alterar seus tamanhos para a sua região.
- **Importar uma lista de plantas…** lê um CSV (ou um arquivo de plantas). O CSV precisa de uma coluna com o nome botânico e, idealmente, tipo, altura e espalhamento; nomes de colunas nas suas próprias palavras funcionam (Nome científico, Nome comum, Altura, Espalhamento, Largura, Zona). São lidos vírgulas, ponto e vírgula ou tabulações, e vírgulas decimais. Tamanhos de plantio, espaçamentos e recipientes vazios recebem padrões adequados ao tipo.
- **Exportar como CSV** salva sua lista (ou, se não houver nenhuma, as plantas que a pesquisa mostra) para abrir em uma planilha.

Uma lista de plantas é lida como qualquer arquivo externo: o que não puder ser usado é deixado de fora e contado.

## Plantas em outros aplicativos

A lista de plantas é uma única biblioteca para todos os aplicativos CadCraft: BimCraft e ModelCraft têm a mesma lista, mas o próprio Inserir da biblioteca ainda não oferece plantas. Hoje as plantas chegam a um modelo BIM pelo IFC de paisagismo do CivilCraft (cada planta é um `IfcGeographicElement`). Veja [Plantio](topic:planting#ifc).
