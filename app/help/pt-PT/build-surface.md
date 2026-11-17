---
title: Construir e refinar a superfície
summary: Como o CivilCraft triangula o terreno existente e como o moldar com grupos de linhas de quebra, linhas de quebra desenhadas, um limite exterior e a aresta exterior mais longa.
keywords: tin, superfície, triangulação, linha de quebra, limite, terreno existente, eg, criar superfície, delaunay, triângulos, aresta máxima, limite exterior
from: b9eea3f3
---

O CivilCraft tem uma superfície de terreno existente por projeto. É uma TIN (rede triangular irregular) construída a partir dos pontos de levantamento, e reconstrói-se automaticamente sempre que um dado muda. Não existe comando «reconstruir» nem superfície desatualizada.

## O que entra na superfície

- Cada ponto com cota num grupo definido como {{ui:Pontos}}.
- Cada grupo definido como {{ui:Linha de quebra}}, unido por ordem de número de ponto.
- Cada linha de quebra que desenhar com a ferramenta {{ui:Linha de quebra}}.
- O limite exterior, se desenhar um.
- A definição **Aresta exterior mais longa**.

Os triângulos nunca cruzam uma linha de quebra: a superfície é obrigada a segui-la e, depois, distribuída o mais uniformemente possível à volta dela (Delaunay no resto).

## Transformar linhas codificadas em linhas de quebra

1. No painel da esquerda, em **Pontos**, encontre o grupo (por exemplo, FL).
2. Defina a respetiva escolha em **Superfície** como {{ui:Linha de quebra}}.
   A superfície é recalculada, a linha é desenhada a laranja (com {{ui:Linhas de quebra}} ativo em **Visualização**), e **Linhas de quebra** nos dados da superfície sobe em uma.
3. Verifique a linha no plano. Deve passar de ponto a ponto, na ordem em que foi levantada. Se fizer ziguezague, o grupo tem mais de uma linha, ou os pontos não estão numerados por ordem: volte a definir o grupo como {{ui:Pontos}} e desenhe as linhas à mão (secção seguinte).

## Desenhar uma linha de quebra através de pontos

1. Prima {{key:B}}, ou clique em {{ui:Linha de quebra}} no grupo **Superfície**.
   A sugestão diz «Linha de quebra: clique nos pontos de levantamento por ordem (usa as respetivas cotas). Enter termina.»
2. Mova o ponteiro para perto de um ponto. Um pequeno quadrado laranja assinala o ponto que vai ser usado.
3. Clique nos pontos da linha, um a seguir ao outro. Cada clique indica o ponto e a respetiva cota na barra de estado.
4. Prima {{key:Enter}} para terminar.
   A barra de estado diz «Linha de quebra 1 acrescentada; a superfície foi recalculada.»

Os cliques têm de cair num ponto de levantamento com cota; um clique noutro sítio é recusado com «Clique num ponto de levantamento com cota: uma linha de quebra usa as cotas dos pontos.» {{key:Backspace}} retira o último ponto; {{key:Esc}} cancela a linha inteira.

:::warning
Termine com {{key:Enter}}. O duplo clique também termina, mas, nesta versão, retira o ponto em que clicou duas vezes. Clique uma vez no último ponto e, depois, prima {{key:Enter}}.
:::

Para remover de uma vez todas as linhas de quebra desenhadas, clique em {{ui:Remover as linhas de quebra desenhadas}} na secção **Superfície**. Para remover só a última, use {{key:Mod+Z}}. As linhas de quebra desenhadas ainda não podem ser selecionadas nem editadas uma a uma.

## Desenhar o limite exterior

Um limite corta a superfície à área em que confia, por exemplo os limites do levantamento, para que os triângulos longos sobre cantos não levantados desapareçam.

1. Prima {{key:O}}, ou clique em {{ui:Limite}}.
2. Clique nos cantos por ordem, à volta da área. Uma linha tracejada mostra a forma.
3. Prima {{key:Enter}}.
   A barra de estado diz «Limite definido; os triângulos fora dele foram eliminados.» **Limite** nos dados da superfície diz «Sim» e indica o número de cantos.

Pontos a saber:

- Há um só limite. Desenhar outro substitui o anterior. {{ui:Remover o limite}} elimina-o.
- Só pode retirar: um limite que passe dos pontos é cortado até ao respetivo contorno, com a nota «O limite ultrapassa os pontos; foi cortado até ao seu contorno.»
- Os cantos recebem as cotas da superfície, pelo que a aresta segue exatamente o terreno.
- Os limites interiores (de ocultação) ainda não estão disponíveis.

## Cortar triângulos exteriores longos

Sem limite, a superfície preenche todo o contorno dos pontos, incluindo triângulos longos e finos sobre arestas côncavas.

1. Em **Superfície**, escreva um comprimento em **Aresta exterior mais longa** e prima {{key:Enter}}. Comece com cerca de duas ou três vezes o espaçamento típico entre medições.
2. Os triângulos exteriores cuja aresta exterior seja mais longa do que isso são removidos, avançando para dentro até que todas as arestas exteriores sejam suficientemente curtas. Uma aresta que seja linha de quebra nunca é retirada.
3. Escreva 0 para manter de novo todos os triângulos.

## Ler o relatório da superfície

Por baixo dos dados da superfície, uma caixa lista o que o construtor fez. Com uma barra ocre à esquerda é informação; com uma barra vermelha contém um erro e não há superfície.

| Mensagem | Significado |
|---|---|
| «3 pontos estavam no mesmo sítio que outro e uniram-se a ele.» | Pontos a menos de 0.0001 no plano passaram a um só vértice (mantém-se o primeiro). |
| «2 locais têm duas cotas diferentes …» | Pontos sobrepostos, ou linhas de quebra que se cruzam, discordam em altura. Vence a cota da linha de quebra, depois a primeira. |
| «1 troço de linha de quebra não pôde ser forçado para dentro da superfície.» | Um troço muito curto ou quase sobreposto não coube; verifique esse ponto. |
| «A superfície precisa de pelo menos três pontos com cota.» | Pontos a menos: verifique a ordem das colunas e os grupos. |
| «Os pontos estão todos na mesma linha: sem triângulos.» | Os pontos não têm largura, por exemplo uma única linha de poligonal. |
| «O limite não se sobrepõe aos pontos.» | O limite está noutro lado, muitas vezes por troca de unidades ou de coordenadas. |
| «Não restam triângulos dentro do limite.» | O limite é demasiado pequeno ou está mal posicionado. |

## Uma superfície lida de LandXML

Quando abre um LandXML, a primeira superfície TIN é usada tal como está: o cabeçalho **Superfície** diz «Superfície (de LandXML)» e **Aresta exterior mais longa** fica a cinzento. Enquanto essa superfície estiver em uso, os grupos de linhas de quebra, as linhas de quebra desenhadas e um novo limite não a alteram. Para construir a superfície a partir dos pontos do ficheiro, clique em {{ui:Reconstruir a superfície a partir dos pontos}}. {{key:Mod+Z}} repõe a superfície do LandXML.

## Relacionado

- [Ler curvas de nível, cotas e declives](topic:contours).
- [Importar pontos de levantamento](topic:import-points).
