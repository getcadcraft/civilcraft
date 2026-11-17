---
title: Construir e refinar a superfície
summary: Como o CivilCraft triangula o terreno natural e como moldá-lo com grupos de linhas de quebra, linhas de quebra desenhadas, um limite externo e a maior aresta externa.
keywords: tin, superfície, triangulação, linha de quebra, limite, terreno natural, eg, criar superfície, delaunay, triângulos, aresta máxima, limite externo
from: b9eea3f3
---

O CivilCraft tem uma superfície de terreno natural por projeto. É uma TIN (rede triangular irregular) construída a partir dos seus pontos, e é reconstruída automaticamente sempre que uma entrada muda. Não há comando de "reconstruir" nem superfície desatualizada.

## O que entra na superfície

- Cada ponto com cota em um grupo definido como {{ui:Pontos}}.
- Cada grupo definido como {{ui:Linha de quebra}}, unido na ordem de número dos pontos.
- Cada linha de quebra que você desenhar com a ferramenta {{ui:Linha de quebra}}.
- O limite externo, se você desenhar um.
- A configuração **Maior aresta externa**.

Triângulos nunca cruzam uma linha de quebra: a superfície é forçada a segui-la e depois feita o mais uniforme possível em volta dela (Delaunay no restante).

## Transforme linhas codificadas em linhas de quebra

1. No painel esquerdo, em **Pontos**, encontre o grupo (por exemplo FL).
2. Defina a escolha **Superfície** como {{ui:Linha de quebra}}.
   A superfície é reconstruída, a linha é desenhada em laranja (com {{ui:Linhas de quebra}} ativado em **Exibir**), e **Linhas de quebra** nos dados da superfície sobe em um.
3. Confira a linha no plano. Ela deve passar ponto a ponto na ordem em que a linha foi levantada. Se ziguezagueia, o grupo tem mais de uma linha, ou os pontos não estão numerados em ordem: volte o grupo para {{ui:Pontos}} e desenhe as linhas à mão (próxima seção).

## Desenhe uma linha de quebra por pontos

1. Pressione {{key:B}}, ou clique em {{ui:Linha de quebra}} no grupo **Superfície**.
   A dica diz "Linha de quebra: clique nos pontos de levantamento em ordem (ela pega as cotas deles). Enter finaliza."
2. Mova o ponteiro perto de um ponto. Um pequeno quadrado laranja marca o ponto que será usado.
3. Clique nos pontos da linha um após o outro. Cada clique nomeia o ponto e a cota dele na barra de status.
4. Pressione {{key:Enter}} para finalizar.
   A barra de status diz "Linha de quebra 1 adicionada; a superfície foi reconstruída."

Cliques devem cair em um ponto de levantamento com cota; um clique em outro lugar é recusado com "Clique em um ponto de levantamento com cota: uma linha de quebra usa as cotas dos pontos." {{key:Backspace}} remove o último ponto; {{key:Esc}} cancela a linha inteira.

:::warning
Finalize com {{key:Enter}}. O duplo clique também finaliza, mas nesta versão ele elimina o ponto em que você deu duplo clique. Clique no último ponto uma vez e depois pressione {{key:Enter}}.
:::

Para remover todas as linhas de quebra desenhadas de uma vez, clique em {{ui:Remover linhas de quebra desenhadas}} na seção **Superfície**. Para remover apenas a última, use {{key:Mod+Z}}. Linhas de quebra desenhadas ainda não podem ser selecionadas nem editadas uma a uma.

## Desenhe o limite externo

Um limite recorta a superfície para a área em que você confia, por exemplo os limites do levantamento, de modo que triângulos longos sobre cantos não levantados desapareçam.

1. Pressione {{key:O}}, ou clique em {{ui:Limite}}.
2. Clique nos cantos em ordem ao redor da área. Uma linha tracejada mostra a forma.
3. Pressione {{key:Enter}}.
   A barra de status diz "Limite definido; os triângulos fora dele foram removidos." **Limite** nos dados da superfície diz "Sim" e o número de cantos.

Coisas a saber:

- Há um só limite. Desenhar outro substitui o anterior. {{ui:Remover o limite}} o retira.
- Ele só pode retirar: um limite que passa além dos pontos é recuado até o contorno deles, com a nota "O limite passa além dos pontos; ele foi recuado até o contorno deles."
- Os cantos dele pegam as cotas da superfície, então a borda segue exatamente o terreno.
- Limites ocultos (internos) ainda não estão implementados.

## Corte triângulos longos externos

Sem um limite, a superfície preenche todo o contorno dos pontos, inclusive triângulos longos e finos sobre arestas côncavas.

1. Em **Superfície**, digite um comprimento em **Maior aresta externa** e pressione {{key:Enter}}. Comece com cerca de duas ou três vezes o espaçamento típico das suas leituras.
2. Triângulos externos cuja aresta externa seja maior que isso são removidos, avançando para dentro até que toda aresta externa seja curta o bastante. Uma aresta que é uma linha de quebra nunca é removida.
3. Digite 0 para manter todos os triângulos de novo.

## Leia o relatório da superfície

Abaixo dos dados da superfície, uma caixa lista o que o construtor fez. Com uma barra ocre à esquerda, é informação; com uma barra vermelha, traz um erro e não há superfície.

| Mensagem | Significado |
|---|---|
| "3 pontos estavam no mesmo lugar que outro e se uniram a ele." | Pontos mais próximos que 0.0001 no plano viraram um só vértice (o primeiro é mantido). |
| "2 lugares têm duas cotas diferentes …" | Pontos sobrepostos, ou linhas de quebra que se cruzam, discordam em altura. Vence a cota da linha de quebra, depois a primeira. |
| "1 trecho de linha de quebra não pôde ser forçado na superfície." | Um trecho de linha de quebra muito curto ou quase sobreposto não coube; confira esse ponto. |
| "Uma superfície precisa de pelo menos três pontos com cota." | Pontos insuficientes: confira a ordem das colunas e os grupos. |
| "Os pontos estão todos sobre uma linha: sem triângulos." | Os pontos não têm largura, por exemplo uma única linha de poligonal. |
| "O limite não se sobrepõe aos pontos." | O limite está em outro lugar, muitas vezes por troca de unidades ou de coordenadas. |
| "Não restam triângulos dentro do limite." | O limite é muito pequeno ou está mal posicionado. |

## Uma superfície lida de LandXML

Ao abrir um LandXML, a primeira superfície TIN dele é usada como está: o cabeçalho **Superfície** diz "Superfície (de LandXML)" e **Maior aresta externa** fica desativado. Enquanto essa superfície estiver em uso, grupos de linhas de quebra, linhas de quebra desenhadas e um novo limite não a alteram. Para construir a superfície a partir dos pontos do arquivo, clique em {{ui:Reconstruir a superfície a partir dos pontos}}. {{key:Mod+Z}} traz de volta a superfície do LandXML.

## Relacionados

- [Leia curvas de nível, cotas e declividades](topic:contours).
- [Importe pontos de levantamento](topic:import-points).
