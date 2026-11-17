---
title: Trabalhar com a tabela de atributos de uma camada
summary: Veja cada elemento de uma camada SIG como tabela, ordene-a e filtre-a, selecione linhas e elementos em conjunto, corrija valores, acrescente campos, calcule novos valores e guarde a tabela como CSV.
keywords: tabela de atributos, tabela, campos, colunas, linhas, ordenar, filtrar, expressão, selecionar, editar, calculadora de campos, calcular, acrescentar campo, mudar o nome do campo, remover campo, csv, exportar, sig, shapefile, geopackage, simbologia
from: fd9d6c11
---

Abra a tabela de uma camada a partir do seu menu de **três pontos** na lista de camadas SIG ({{ui:Tabela de atributos…}}), de Superfície › Mais › {{ui:Tabela de atributos}}, ou escrevendo `ATTRIBUTES`, `ATTTABLE` ou `TABLE`. A tabela abre ao lado da planta e mantém-se aberta enquanto trabalha. Só as linhas visíveis são desenhadas, pelo que uma camada com milhares de elementos abre e percorre-se depressa.

## Ordenar, filtrar e selecionar

- **Ordenar:** clique no título de uma coluna. Um segundo clique inverte-a, e um terceiro repõe a ordem do ficheiro. Os valores vazios ficam sempre no fim. Ordenar altera apenas o que vê, nunca a camada.
- **Filtrar:** escreva na caixa de filtro. Uma expressão como `AREA > 500 and USE = 'Res'` mantém as linhas em que é verdadeira (as mesmas palavras do separador Selecionar de [Analisar camadas SIG](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). O que não seja uma expressão, como `oak maple`, procura essas palavras em todas as colunas.
- **Selecionar linhas:** clique numa linha. Ctrl+clique acrescenta ou remove uma; Shift+clique seleciona um bloco; e {{ui:Selecionar as linhas apresentadas}} escolhe todas as linhas que passam o filtro. Os elementos selecionados são desenhados na planta, e um clique num elemento da planta seleciona aqui a sua linha.
- Com linhas selecionadas, pode fazer {{ui:Zoom}} sobre elas, criar uma **camada a partir da seleção**, e ler a área ou o comprimento total na linha de estado.

## Corrigir valores

Faça duplo clique numa célula (ou desloque-se até ela com as setas e prima Enter), escreva o novo valor e prima Enter. Escape deixa-a como estava. Um valor tem de caber na coluna: números como números, datas como `YYYY-MM-DD`, sim/não como yes, no, true ou false. Um valor que não caiba é recusado com uma frase, e nada muda. Uma caixa vazia torna o valor vazio. Cada edição é um passo de anulação: {{ui:Anular}} e {{ui:Refazer}} estão no fundo da tabela, e Ctrl+Z funciona na planta.

## Campos

Em **Campos** pode acrescentar um campo (texto, número, data ou sim/não), mudar-lhe o nome ou removê-lo. Um campo novo começa vazio. A mudança de nome é propagada: o campo de rótulo e o [estilo por atributo](topic:gis-symbology) da camada passam para o novo nome, e remover um campo retira o rótulo e o estilo que o usavam. Cada uma destas ações é um passo de anulação que repõe tudo.

## Calculadora de campos

Escreve um valor em cada linha (ou só nas linhas selecionadas), a partir dos outros campos da linha, da sua geometria e de algumas funções. Escolha um campo existente ou **Um novo campo…**, e dê-lhe um nome e um tipo. Nada é executado como código: a expressão é lida por um pequeno analisador com uma lista fixa de funções.

| Grupo | Palavras |
|---|---|
| Números | `+ - * /`, parênteses, `abs round(x, digits) floor ceil sqrt pow min max` |
| Texto | `upper lower trim len substr(text, from, count) left right replace concat` (o texto vai entre 'aspas simples'; um nome de campo com espaços vai entre "aspas duplas" ou [parênteses retos]) |
| Escolha | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Datas | `year month day` de um valor `YYYY-MM-DD` |
| Geometria | `$area $perimeter $length $x $y $vertices`, nas unidades do projeto |

Um resultado que não possa ser guardado no tipo do campo (texto num campo numérico) fica vazio e é contado na mensagem. Dividir por zero dá um valor vazio. Por exemplo, `round($area / 43560, 2)` escreve acres a partir de pés quadrados.

## Exportar

{{ui:Exportar CSV}} guarda as linhas que vê (depois do filtro e da ordenação) como ficheiro CSV UTF-8, com os nomes dos campos na primeira linha. Um texto que comece por `=`, `+`, `-` ou `@` recebe um apóstrofo à frente, para que uma folha de cálculo não o execute como fórmula. Para guardar a própria camada, use [Exportar dados como construídos para SIG](topic:gis-export).

## Limites

A tabela mostra a camada numa só ordem de ordenação e com um filtro de cada vez. Não se podem acrescentar nem eliminar linhas aqui (crie antes uma nova camada a partir de uma seleção), a geometria não é editada, e o tipo de um campo não pode ser alterado depois de criado.
