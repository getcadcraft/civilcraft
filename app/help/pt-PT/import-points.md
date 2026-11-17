---
title: Importar pontos de levantamento
summary: Abrir um ficheiro de pontos em CSV ou texto, verificar a ordem das colunas na caixa de diálogo Importar pontos, corrigir as linhas que não podem ser lidas e ordenar os pontos em grupos.
keywords: importar pontos, csv, txt, pnezd, penzd, ficheiro de pontos, levantamento, pontos cogo, grupos de pontos, colunas, norte, este
from: ad33d88a
---

Um ficheiro de pontos é um ficheiro de texto com um ponto por linha: número do ponto, norte, este, cota e descrição, por alguma ordem, separados por vírgulas, tabulações, ponto e vírgula ou espaços. O CivilCraft lê-o no navegador e cria de imediato uma superfície a partir dele.

## Antes de começar

- Saiba a ordem das colunas do ficheiro, se possível (PNEZD e PENZD parecem iguais para um computador).
- Saiba as suas unidades. O CivilCraft não converte: defina **Unidades** no painel da esquerda para corresponder ao ficheiro (ver [Unidades, estações e formatos de número](topic:units-and-stations)).
- As coordenadas podem ser grandes (coordenadas de um sistema plano com valores na ordem dos milhões são aceitáveis).

## Importar o ficheiro

1. Clique em {{ui:Abrir}} na barra de ferramentas, ou prima {{key:Mod+O}}, e escolha o ficheiro. Também pode arrastá-lo para a planta.
   Abre-se a caixa de diálogo **Importar pontos** com o nome do ficheiro, uma lista **Colunas** definida em {{ui:Detetar}}, uma linha de resumo e os primeiros seis pontos.
2. Leia a linha de resumo. Indica quantos pontos foram lidos, em que ordem de colunas, como essa ordem foi encontrada e o que separa as colunas. As três formas de encontrar a ordem:
   - "a partir da linha de cabeçalho": a primeira linha indica os nomes das colunas (Ponto, Norte, Este, Cota, Descrição, ou X, Y, Z …). É a forma mais segura.
   - "conforme escolhido": escolheu uma ordem em **Colunas**.
   - "estimada a partir do número de colunas e da definição de **Linhas de ponto** (PNEZD) — verifique se o norte e o este não estão trocados": não havia um cabeçalho utilizável. Se os seus ficheiros costumam ter o este primeiro, defina **Linhas de ponto** como P, E, N, Z, D nas [definições do CivilCraft](topic:settings).
3. Verifique a tabela de pré-visualização. As suas colunas são sempre **Ponto**, **Norte**, **Este**, **Cota**, **Descrição**, qualquer que seja a ordem do ficheiro. As coordenadas norte e este de um local real costumam ter grandezas claramente diferentes: se parecerem trocadas, a estimativa estava errada.
4. Se a ordem estiver errada, escolha a correta em **Colunas** (por exemplo {{ui:PENZD — ponto, este, norte, cota, descrição}}). O resumo e a pré-visualização atualizam-se de imediato.
5. Veja, por baixo da pré-visualização, **Linhas não lidas**. Cada linha indica o número da linha no ficheiro, o motivo e o início da linha. Ver [Linhas que não são lidas](topic:import-points#rows-that-are-not-read).
6. Clique em {{ui:Importar}}.
   Os pontos aparecem na planta, a vista aproxima-se deles e a superfície é criada. A barra de estado indica, por exemplo, "276 pontos importados de site.csv; superfície: 546 triângulos."

Se o projeto ainda não tinha nome, passa a ter o nome do ficheiro.

## Verificar os grupos

Cada ponto pertence a um grupo com o nome da **primeira palavra da sua descrição**, em maiúsculas: "GRD", "FL 12" e "fl" são os grupos GRD, FL e FL. Os pontos sem descrição vão para "(sem descrição)".

1. Veja a tabela em **Pontos** no painel da esquerda: grupo, número de pontos e uma escolha de **Superfície**.
2. Cada grupo começa como {{ui:Pontos}}. Mude as linhas de escoamento, bordos da faixa de rodagem, cristas e pés de talude, cumeeiras e linhas codificadas semelhantes para {{ui:Linha de quebra}}. Defina como {{ui:Deixado de fora}} os grupos que não devem moldar o terreno (pontos de controlo, copas de árvores, postes de utilidade medidos pelo topo).
3. Clique num ponto na planta (com {{ui:Selecionar}}) para ver o seu número, coordenadas, cota, descrição e grupo no painel da direita.

:::warning
Um grupo de linha de quebra une **todos** os seus pontos numa **única** linha, pela ordem dos números dos pontos. Isto funciona quando cada linha codificada foi medida em ordem, com o seu próprio código. Duas linhas de escoamento separadas, ambas codificadas "FL", tornam-se uma única linha em ziguezague entre elas. Se os seus códigos forem partilhados, use a ferramenta {{ui:Linha de quebra}} para clicar nos pontos de cada linha (ver [Construir e refinar a superfície](topic:build-surface)).
:::

## Linhas que não são lidas

| Motivo apresentado | O que significa | O que fazer |
|---|---|---|
| "o norte ou o este não é um número" | Uma coluna de coordenadas contém texto | Verifique a ordem das colunas, ou uma linha de texto perdida no meio do ficheiro |
| "a cota não é um número" | A coluna da cota contém texto | Ordem de colunas errada, ou uma descrição na coluna da cota |
| "sem número de ponto" | A coluna do ponto está vazia | Numere o ponto, ou escolha uma ordem sem P (NEZD, NEZ …): os pontos são então numerados 1, 2, 3 … |
| "o ponto 12 aparece duas vezes (é mantido o primeiro)" | Duas linhas partilham um número | Renumere um deles no ficheiro, se ambos forem medições reais |
| "3 colunas, esperadas 5 (PNEZD)" | A linha está incompleta | Uma linha partida, ou a ordem de colunas errada |

Um ponto com a cota vazia é mantido, mas não é usado na superfície. Os dados de **Pontos** mostram quantos pontos têm cota.

As linhas que começam por `#`, `;` ou `//` são comentários e são ignoradas. As linhas em branco são ignoradas.

## Substituir ou acrescentar pontos

Importar de novo **substitui** todos os pontos; não os acrescenta. As suas diretrizes, plataformas, coletores, linhas de quebra desenhadas e limite mantêm-se. O histórico de anulação é limpo; por isso, guarde o projeto primeiro se possa vir a precisar dos pontos antigos. Para combinar dois ficheiros, junte-os num editor de texto ou numa folha de cálculo antes de importar (atenção aos números de ponto repetidos).

Os pontos ainda não podem ser movidos, editados nem eliminados dentro do CivilCraft. Corrija-os no ficheiro e importe de novo.

## Relacionados

- [Formatos de ficheiros de pontos](topic:point-file-formats): todas as ordens de colunas e a forma como os cabeçalhos são reconhecidos.
- [Construir e refinar a superfície](topic:build-surface).
