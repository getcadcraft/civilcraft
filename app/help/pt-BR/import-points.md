---
title: Importar pontos topográficos
summary: Abra um arquivo de pontos em CSV ou texto, confira a ordem das colunas na caixa de diálogo Importar pontos, corrija as linhas que não podem ser lidas e organize os pontos em grupos.
keywords: importar pontos, csv, txt, pnezd, penzd, arquivo de pontos, levantamento, pontos cogo, grupos de pontos, colunas, norte leste
from: ad33d88a
---

Um arquivo de pontos é um arquivo de texto com um ponto por linha: número do ponto, norte, leste, elevação e descrição, em alguma ordem, separados por vírgulas, tabulações, ponto e vírgula ou espaços. O CivilCraft o lê no navegador e cria uma superfície a partir dele de imediato.

## Antes de começar

- Saiba a ordem das colunas do arquivo, se puder (PNEZD e PENZD parecem iguais para o computador).
- Saiba as unidades. O CivilCraft não converte: defina **Unidades** no painel da esquerda para corresponder ao arquivo (veja [Unidades, estacas e formatos de número](topic:units-and-stations)).
- As coordenadas podem ser grandes (norte e leste de sistema de coordenadas planas na casa dos milhões são normais).

## Importe o arquivo

1. Clique em {{ui:Abrir}} na barra de ferramentas, ou pressione {{key:Mod+O}}, e escolha o arquivo. Você também pode arrastá-lo para a planta.
   A caixa de diálogo **Importar pontos** abre com o nome do arquivo, uma lista **Colunas** definida como {{ui:Detectar}}, uma linha de resumo e os seis primeiros pontos.
2. Leia a linha de resumo. Ela informa quantos pontos foram lidos, em qual ordem de colunas, como essa ordem foi encontrada e o que separa as colunas. As três formas de encontrar a ordem:
   - "a partir da linha de cabeçalho": a primeira linha nomeia as colunas (Ponto, Norte, Leste, Elevação, Descrição, ou X, Y, Z …). É o mais seguro.
   - "conforme escolhido": você escolheu uma ordem em **Colunas**.
   - "adivinhada pelo número de colunas e pela configuração de linhas de ponto (PNEZD) — confira se norte e leste não estão trocados": não havia cabeçalho utilizável. Se seus arquivos costumam ter leste primeiro, defina **Linhas de ponto** como P, E, N, Z, D nas [configurações do CivilCraft](topic:settings).
3. Confira a tabela de visualização. Suas colunas são sempre **Ponto**, **Norte**, **Leste**, **Elevação**, **Descrição**, qualquer que seja a ordem do arquivo. Os valores de norte e leste de um local real costumam ter ordens de grandeza bem diferentes: se parecerem trocados, a adivinhação estava errada.
4. Se a ordem estiver errada, escolha a correta em **Colunas** (por exemplo {{ui:PENZD — ponto, leste, norte, elevação, descrição}}). O resumo e a visualização são atualizados de imediato.
5. Veja, abaixo da visualização, **Linhas não lidas**. Cada linha informa o número da linha no arquivo, o motivo e o início da linha. Veja [Linhas que não são lidas](topic:import-points).
6. Clique em {{ui:Importar}}.
   Os pontos aparecem na planta, a vista se aproxima deles e a superfície é criada. A barra de status diz, por exemplo, "276 pontos importados de site.csv; superfície: 546 triângulos."

Se o projeto ainda não tinha nome, ele assume o nome do arquivo.

## Confira os grupos

Cada ponto pertence a um grupo com o nome da **primeira palavra da sua descrição**, em maiúsculas: "GRD", "FL 12" e "fl" são os grupos GRD, FL e FL. Pontos sem descrição vão para "(sem descrição)".

1. Veja a tabela sob **Pontos** no painel da esquerda: grupo, número de pontos e uma escolha de **Superfície**.
2. Todo grupo começa como {{ui:Pontos}}. Mude linhas de fluxo, bordos da pista, cristas e pés de talude, espigões e linhas codificadas semelhantes para {{ui:Linha de quebra}}. Defina como {{ui:Deixado de fora}} os grupos que não devem moldar o terreno (pontos de controle, copas de árvores, postes de utilidade medidos pelo topo).
3. Clique em um ponto na planta (com {{ui:Selecionar}}) para ver seu número, coordenadas, elevação, descrição e grupo no painel da direita.

:::warning
Um grupo de linha de quebra une **todos** os seus pontos em **uma** linha, na ordem dos números de ponto. Isso funciona quando cada linha codificada foi levantada em ordem, com seu próprio código. Duas linhas de fluxo separadas, ambas codificadas "FL", viram uma linha em zigue-zague entre elas. Se seus códigos forem compartilhados, use a ferramenta {{ui:Linha de quebra}} para clicar nos pontos de cada linha (veja [Criar e refinar a superfície](topic:build-surface)).
:::

## Linhas que não são lidas

| Motivo exibido | O que significa | O que fazer |
|---|---|---|
| "norte ou leste não é um número" | Uma coluna de coordenada contém texto | Confira a ordem das colunas, ou uma linha de texto solta no meio do arquivo |
| "elevação não é um número" | A coluna de elevação contém texto | Ordem de colunas errada, ou uma descrição na coluna de elevação |
| "sem número de ponto" | A coluna do ponto está vazia | Numere o ponto, ou escolha uma ordem sem P (NEZD, NEZ …): os pontos são então numerados 1, 2, 3 … |
| "ponto 12 aparece duas vezes (a primeira é mantida)" | Duas linhas compartilham um número | Renumere uma delas no arquivo, se ambas forem medições reais |
| "3 colunas, esperadas 5 (PNEZD)" | A linha está incompleta | Uma linha quebrada, ou a ordem de colunas errada |

Um ponto com elevação vazia é mantido, mas não é usado na superfície. Os dados de **Pontos** mostram quantos pontos têm elevação.

Linhas que começam com `#`, `;` ou `//` são comentários e são ignoradas. Linhas em branco são ignoradas.

## Substituir ou adicionar pontos

Importar novamente **substitui** todos os pontos; não os acrescenta. Seus alinhamentos, plataformas, tubulações, linhas de quebra desenhadas e limite permanecem. O histórico de desfazer é limpo, então salve o projeto primeiro se pode querer os pontos antigos de volta. Para combinar dois arquivos, junte-os em um editor de texto ou planilha antes de importar (atenção a números de ponto repetidos).

Pontos ainda não podem ser movidos, editados ou excluídos dentro do CivilCraft. Corrija-os no arquivo e importe novamente.

## Relacionados

- [Formatos de arquivo de pontos](topic:point-file-formats): todas as ordens de colunas e como os cabeçalhos são reconhecidos.
- [Criar e refinar a superfície](topic:build-surface).
