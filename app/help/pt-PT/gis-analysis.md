---
title: Analisar camadas SIG
summary: Zona-tampão, sobreposição (interseção, união, apagar, dissolver), junção espacial, seleção por atributo e medição das camadas SIG de um projeto, cada uma como nova camada que pode anular.
keywords: sig, análise, zona-tampão, buffer, sobreposição, interseção, união, apagar, recortar, dissolver, junção espacial, junção, selecionar por atributo, consulta, onde, expressão, estatísticas, área, comprimento, perímetro, medir, lotes, servidão, recuo, shapefile, geopackage, tabela de atributos
from: a6b2d3f9
---

Assim que um projeto tenha camadas SIG (ver [Importar dados SIG](topic:gis-import)), o botão **Analisar** do grupo SIG (escrito `GISANALYSIS`, `ANALYZE` ou `BUFFER`) abre um painel com cinco separadores. Mantém-se aberto ao lado da planta, pelo que o que selecionar é desenhado na planta enquanto trabalha.

Cada ferramenta que cria algo **acrescenta uma nova camada** e deixa as camadas que leu exatamente como estavam. Cada uma é um passo de anulação: {{ui:Anular}} no painel (ou Ctrl+Z) remove a nova camada. Exporte o resultado como qualquer camada com [Exportar dados como construídos para SIG](topic:gis-export), em shapefile, GeoJSON ou GeoPackage.

A tabela completa de uma camada, com ordenação, edição e uma calculadora de campos, está em [Trabalhar com a tabela de atributos de uma camada](topic:gis-table); a cor por campo está em [Definir o estilo de uma camada por atributo](topic:gis-symbology).

Tudo é trabalhado na planta, nas unidades do projeto (pés ou metros). Um projeto está sempre num sistema projetado ou local, pelo que uma distância de 50 significa 50 pés ou 50 metros, nunca graus. As alturas (z) não são mantidas nos resultados.

## Zona-tampão

Desenha uma zona de distância definida em torno de cada elemento, como nova camada de polígonos. Os pontos tornam-se círculos, as linhas tornam-se corredores com extremidades arredondadas, e os polígonos crescem. Uma distância **negativa** reduz os polígonos (um quadrado de 100 por 100 reduzido em 5 fica com 90 por 90; reduzido em 60 não sobra nada, e o painel indica-o). Obtenha a distância de um campo numérico para dar a cada elemento a sua própria, ou marque **Fundir todas as zonas-tampão numa só forma** para as dissolver.

As partes arredondadas são troços retos desenhados dentro da curva verdadeira, pelo que uma zona-tampão fica um pouco mais pequena do que o círculo exato: cerca de 0.6 % em área na definição normal, 0.16 % em Fina. Use Fina para tudo o que vá medir.

## Sobreposição

| Ferramenta | O que obtém |
|---|---|
| Interseção | As partes onde a camada de entrada encontra os polígonos de sobreposição, cada uma com os campos de ambas. Linhas e pontos são recortados aos polígonos. |
| União | As duas camadas de polígonos cortadas ao longo das arestas uma da outra: as partes partilhadas levam os campos de ambas as camadas; as restantes levam os de uma só (os campos da outra ficam vazios). |
| Apagar | Os polígonos de entrada com os polígonos de sobreposição retirados. Os campos mantêm-se com a entrada. Um elemento apagado por completo fica de fora (o painel conta-os). |
| Dissolver | Funde os polígonos que se tocam ou se sobrepõem, todos, ou uma forma por cada valor de um campo. Acrescenta `COUNT` e `AREA`. |

Um nome de campo que ambas as camadas têm é mantido para a primeira camada, e o da segunda é escrito com `_2`. Os elementos dentro de uma mesma camada não devem sobrepor-se: quando o fazem, uma União conta a sobreposição nas duas.

## Junção

Uma junção espacial copia atributos de uma camada de **origem** para cada elemento de **destino** com que se encontra, e dá uma nova camada com as formas do destino. Escolha quando se encontram: quando se tocam ou se sobrepõem, quando o destino fica dentro de um polígono de origem, quando o destino contém o elemento de origem, o elemento de origem mais próximo (com um limite opcional), ou qualquer elemento de origem a uma distância.

Quando vários elementos de origem correspondem, fica com os atributos do primeiro (o mais próximo, nas junções por proximidade e por distância; acrescenta-se `DISTANCE`), ou **conta-os e soma os seus campos numéricos**: `COUNT`, e `SUM_`, `MEAN_`, `MIN_`, `MAX_` para cada campo numérico. Desmarque **Manter elementos de destino que não encontraram correspondência** para os deixar de fora. Os campos juntados ficam vazios onde nada correspondeu, e o painel conta os que não tiveram correspondência.

## Selecionar

Escreva uma pergunta sobre os atributos ou a forma, prima **Selecionar**, e os elementos são desenhados na planta com a sua contagem, uma tabela e a área, comprimento ou número total. Depois pode transformá-los numa camada própria, fazer zoom sobre eles ou limpar a seleção.

| Pode escrever | Exemplo |
|---|---|
| Um campo pelo nome; use "aspas" ou [parênteses retos] se o nome tiver espaços | `VALUE`, `"Lot Number"` |
| Números, 'texto', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (o texto ignora maiúsculas; em `like`, `%` é qualquer sequência e `_` uma letra) | `Notes contains 'corner'` |
| `is null`, `is not null` (um valor vazio conta como null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` e parênteses | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Valores de forma `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Uma pergunta incompleta, ou que nomeie um campo que a camada não tem, é recusada com uma frase que indica onde está o problema.

## Medir

Mostra a área total e o perímetro, comprimento ou número da camada, e **acrescenta campos** a ela: `AREA` e `PERIMETER` para polígonos, `LENGTH` para linhas (o comprimento na planta), `X` e `Y` para pontos. Um campo que já exista nunca é substituído: o novo chama-se `AREA_2`. Isto é um passo de anulação. **Estatísticas** dá a contagem, a soma, a média, o mínimo e o máximo de um campo numérico, opcionalmente para cada valor de outro campo.

:::note
As verificações destas ferramentas são feitas à mão no teste (`node bin/test-civilcraft-gisanalysis.mjs`): por exemplo, lotes de 100 por 100 sob uma zona de 100 por 80 cruzam-se em 3,000 mais 3,000, e uma linha de 100 de comprimento com zona-tampão de 10 é 2,000 mais um círculo.
:::
