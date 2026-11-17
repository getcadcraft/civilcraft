---
title: Analisar camadas GIS
summary: Buffer (área de influência), sobreposição (interseção, união, apagar, dissolver), junção espacial, seleção por atributo e medição das camadas GIS de um projeto, cada uma como uma nova camada que pode ser desfeita.
keywords: gis, análise, buffer, área de influência, sobreposição, interseção, união, apagar, recortar, dissolver, junção espacial, junção, selecionar por atributo, consulta, where, expressão, estatísticas, área, comprimento, perímetro, medir, lotes, servidão, recuo, shapefile, geopackage, tabela de atributos
from: a6b2d3f9
---

Quando um projeto tem camadas GIS (veja [Importar dados GIS](topic:gis-import)), o botão **Analisar** no grupo GIS (digite `GISANALYSIS`, `ANALYZE` ou `BUFFER`) abre um painel com cinco guias. Ele fica aberto ao lado da planta, então o que você seleciona é desenhado na planta enquanto você trabalha.

Toda ferramenta que cria algo **adiciona uma nova camada** e deixa as camadas que ela leu exatamente como estavam. Cada uma é um passo de desfazer: {{ui:Desfazer}} no painel (ou Ctrl+Z) remove a nova camada. Exporte o resultado como qualquer outra camada com [Exportar dados as-built para GIS](topic:gis-export), em shapefile, GeoJSON ou GeoPackage.

A tabela completa de uma camada, com ordenação, edição e uma calculadora de campos, está em [Trabalhar com a tabela de atributos de uma camada](topic:gis-table); a coloração por um campo está em [Definir o estilo de uma camada por um atributo](topic:gis-symbology).

Tudo é trabalhado na planta, nas unidades do projeto (pés ou metros). Um projeto sempre está em um sistema projetado ou local, então uma distância de 50 significa 50 pés ou 50 metros, nunca graus. As alturas (z) não são mantidas nos resultados.

## Buffer

Desenha uma zona de distância definida em torno de cada feição, como uma nova camada de polígonos. Pontos viram círculos, linhas viram corredores com extremidades arredondadas, polígonos crescem. Uma distância **negativa** encolhe polígonos (um quadrado de 100 por 100 encolhido em 5 fica 90 por 90; encolhido em 60 não sobra nada, e o painel informa isso). Tire a distância de um campo numérico para dar a cada feição a sua própria, ou marque **Mesclar todos os buffers em uma forma** para dissolvê-los.

As partes arredondadas são segmentos retos desenhados dentro da curva verdadeira, então um buffer fica um pouco menor que o círculo exato: cerca de 0.6 % em área na configuração normal, 0.16 % em Fino. Use Fino para tudo que você vá medir.

## Sobreposição

| Ferramenta | O que você obtém |
|---|---|
| Interseção | As partes onde a camada de entrada encontra os polígonos de sobreposição, cada uma com os campos de ambas. Linhas e pontos são recortados pelos polígonos. |
| União | As duas camadas de polígonos cortadas ao longo das bordas uma da outra: as partes compartilhadas levam os campos de ambas as camadas, e o restante leva os campos de uma só (os campos da outra ficam vazios). |
| Apagar | Os polígonos de entrada com os polígonos de sobreposição retirados. Os campos ficam com a entrada. Uma feição apagada por completo é deixada de fora (o painel as conta). |
| Dissolver | Mescla polígonos que se tocam ou se sobrepõem, todos juntos ou uma forma para cada valor de um campo. Adiciona `COUNT` e `AREA`. |

Um nome de campo que as duas camadas têm é mantido para a primeira camada, e o da segunda é gravado com `_2`. Feições dentro de uma mesma camada não devem se sobrepor entre si: quando se sobrepõem, uma União conta a sobreposição nas duas.

## Junção

Uma junção espacial copia atributos de uma camada de **origem** para cada feição de **destino** que a encontra, e gera uma nova camada com as formas do destino. Escolha quando elas se encontram: tocando ou sobrepostas, o destino dentro de um polígono de origem, o destino contendo a feição de origem, a feição de origem mais próxima (com limite opcional), ou qualquer feição de origem a uma distância.

Quando várias feições de origem correspondem, você pega os atributos da primeira (a mais próxima, nas junções por proximidade e por distância; `DISTANCE` é adicionado), ou **as conta e soma seus campos numéricos**: `COUNT`, e `SUM_`, `MEAN_`, `MIN_`, `MAX_` para cada campo numérico. Desmarque **Manter feições de destino sem correspondência** para deixá-las de fora. Os campos unidos ficam vazios onde nada correspondeu, e o painel conta as que não tiveram correspondência.

## Selecionar

Digite uma pergunta sobre os atributos ou a forma, pressione **Selecionar**, e as feições são desenhadas na planta com sua contagem, uma tabela e a área, o comprimento ou o número total. Depois, transforme-as em uma camada própria, dê zoom nelas ou limpe a seleção.

| Você pode escrever | Exemplo |
|---|---|
| Um campo pelo nome; use "aspas" ou [colchetes] se o nome tiver espaços | `VALUE`, `"Lot Number"` |
| Números, 'texto', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (o texto ignora maiúsculas; em `like`, `%` é qualquer sequência e `_` é uma letra) | `Notes contains 'corner'` |
| `is null`, `is not null` (um valor vazio conta como null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` e parênteses | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Valores de forma `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Uma pergunta incompleta, ou que cita um campo que a camada não tem, é recusada com uma frase que diz onde está o problema.

## Medir

Mostra a área e o perímetro, comprimento ou número totais da camada, e **adiciona campos** a ela: `AREA` e `PERIMETER` para polígonos, `LENGTH` para linhas (comprimento na planta), `X` e `Y` para pontos. Um campo que já existe nunca é sobrescrito: o novo se chama `AREA_2`. Isto é um passo de desfazer. **Estatísticas** dá a contagem, a soma, a média, o mínimo e o máximo de um campo numérico, opcionalmente para cada valor de outro campo.

:::note
As verificações por trás destas ferramentas são feitas à mão no teste (`node bin/test-civilcraft-gisanalysis.mjs`): por exemplo, lotes de 100 por 100 sob uma zona de 100 por 80 se interceptam em 3,000 mais 3,000, e uma linha de 100 de comprimento com buffer de 10 é 2,000 mais um círculo.
:::
