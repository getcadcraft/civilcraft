---
title: Trabalhar com a tabela de atributos de uma camada
summary: Veja cada feição de uma camada GIS como tabela, ordene e filtre, selecione linhas e feições juntas, corrija valores, adicione campos, calcule novos valores e salve a tabela como CSV.
keywords: tabela de atributos, tabela, campos, colunas, linhas, ordenar, filtrar, expressão, selecionar, editar, calculadora de campos, calcular, adicionar campo, renomear campo, remover campo, csv, exportar, gis, shapefile, geopackage, simbologia
from: fd9d6c11
---

Abra a tabela de uma camada pelo menu de **três pontos** na lista de camadas GIS ({{ui:Tabela de atributos…}}), por Superfície › Mais › {{ui:Tabela de atributos}}, ou digitando `ATTRIBUTES`, `ATTTABLE` ou `TABLE`. A tabela abre ao lado da planta e fica aberta enquanto você trabalha. Só as linhas visíveis são desenhadas, então uma camada com milhares de feições abre e rola rapidamente.

## Ordenar, filtrar e selecionar

- **Ordenar:** clique no título de uma coluna. Um segundo clique inverte a ordem, um terceiro devolve a ordem do arquivo. Valores vazios sempre ficam no fim. Ordenar muda apenas o que você vê, nunca a camada.
- **Filtrar:** digite na caixa de filtro. Uma expressão como `AREA > 500 and USE = 'Res'` mantém as linhas em que ela é verdadeira (as mesmas palavras da guia Selecionar de [Analisar camadas GIS](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). O que não é expressão, como `oak maple`, procura essas palavras em todas as colunas.
- **Selecionar linhas:** clique em uma linha. Ctrl+clique adiciona ou remove uma; Shift+clique seleciona um intervalo, e {{ui:Selecionar as linhas exibidas}} pega todas as linhas que passam no filtro. As feições selecionadas são desenhadas na planta, e um clique em uma feição na planta seleciona a sua linha aqui.
- Com linhas selecionadas, você pode dar {{ui:Zoom}} até elas, criar uma **camada a partir da seleção** e ler a área ou o comprimento total na linha de status.

## Corrigir valores

Clique duas vezes em uma célula (ou vá até ela com as setas e pressione Enter), digite o novo valor e pressione Enter. Esc a deixa como estava. Um valor precisa caber na coluna: números como números, datas como `YYYY-MM-DD`, sim/não como sim, não, true ou false. Um valor que não cabe é recusado com uma frase, e nada muda. Uma caixa vazia deixa o valor vazio. Cada edição é um passo de desfazer: {{ui:Desfazer}} e {{ui:Refazer}} ficam na parte de baixo da tabela, e Ctrl+Z funciona na planta.

## Campos

Em **Campos** você pode adicionar um campo (texto, número, data ou sim/não), renomear um ou remover um. Um campo novo começa vazio. Uma renomeação se propaga: o campo de rótulo e o [estilo por atributo](topic:gis-symbology) da camada passam para o novo nome, e remover um campo elimina o rótulo e o estilo que o usavam. Cada um é um passo de desfazer que traz tudo de volta.

## Calculadora de campos

Escreve um valor em cada linha (ou só nas linhas selecionadas) a partir dos outros campos da linha, da sua geometria e de algumas funções. Escolha um campo existente ou **Um novo campo…** e dê um nome e um tipo. Nada é executado como código: a expressão é lida por um pequeno analisador com uma lista fixa de funções.

| Grupo | Palavras |
|---|---|
| Números | `+ - * /`, parênteses, `abs round(x, digits) floor ceil sqrt pow min max` |
| Texto | `upper lower trim len substr(text, from, count) left right replace concat` (o texto vai entre 'aspas simples'; um nome de campo com espaços vai entre "aspas duplas" ou [colchetes]) |
| Escolha | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Datas | `year month day` de um valor `YYYY-MM-DD` |
| Geometria | `$area $perimeter $length $x $y $vertices`, nas unidades do projeto |

Um resultado que não cabe no tipo do campo (texto em um campo numérico) é deixado vazio e contado na mensagem. Dividir por zero dá um valor vazio. Por exemplo, `round($area / 43560, 2)` escreve acres a partir de pés quadrados.

## Exportar

{{ui:Exportar CSV}} salva as linhas que você vê (depois do filtro e da ordenação) como arquivo CSV em UTF-8, com os nomes dos campos na primeira linha. Um texto que começa com `=`, `+`, `-` ou `@` recebe um apóstrofo no início, para que a planilha não o execute como fórmula. Para salvar a própria camada, use [Exportar dados as-built para GIS](topic:gis-export).

## Limites

A tabela mostra a camada em uma única ordem de classificação e um filtro por vez. Linhas não podem ser adicionadas nem excluídas aqui (crie uma nova camada a partir de uma seleção), a geometria não é editada, e o tipo de um campo não pode ser mudado depois de criado.
