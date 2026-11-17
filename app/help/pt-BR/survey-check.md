---
title: Verificar um desenho de levantamento na importação
summary: Leia cotas escritas como texto ou em atributos de bloco como pontos de levantamento, e verifique um DWG ou DXF quanto a unidades erradas, falta de sistema de coordenadas, origem distante, curvas de nível planas, cotas atípicas e pontos duplicados antes de construir o terreno a partir dele.
keywords: verificação de levantamento, verificação de importação, cotas de levantamento, cotas pontuais, cotas como texto, atributos, unidades, sistema de coordenadas, longe da origem, curvas em zero, valores atípicos, pontos duplicados, problemas, arquiteto paisagista, desenho de levantamento
from: d46acd24
---

Um desenho de levantamento pode parecer correto e ainda estar errado para um terreno: suas unidades podem ter sido presumidas, suas curvas de nível podem ficar planas na altura 0, ou suas cotas podem estar escritas como texto que nem é geometria. A seção **Níveis de levantamento e verificação** da caixa de diálogo {{ui:Linhas}} (veja [Abrir um DWG ou DXF como linhas](topic:open-dwg-dxf)) lê essas cotas e informa o que parece errado antes que qualquer coisa seja adicionada.

## Cotas escritas como texto ou em atributos

Muitos desenhos de levantamento trazem uma cota pontual como um pequeno texto ao lado de uma cruz, como `104.37` ou `EL 104.37`, ou como um atributo de um bloco de ponto. Estes não são linhas, então o leitor de linhas os deixa de fora. A seção informa quantos encontrou e permite tomá-los como **pontos de levantamento**:

1. Marque **Tomar … cotas como pontos de levantamento**. Elas começam desmarcadas, porque nem todo número de um desenho é uma altura.
2. O texto é lido quando é uma cota por si só: um número com parte decimal (`104.37`, `+104,37`, `-3.50`), ou um número depois de `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` ou `LEVEL`, com um `m`, `ft` ou `'` opcional depois. Um número inteiro sozinho (`12`) é lido como número de lote ou de folha, não como cota; textos como `PORTÃO 3` ou uma data nunca são lidos. Códigos de formatação de texto são ignorados.
3. Para atributos de bloco, escolha **Atributo de bloco que contém a cota**. O CivilCraft encontra sozinho uma etiqueta chamada ELEV, Z, LEVEL, RL ou similar; escolha outra da lista se o desenho usar a sua. A escolha fica guardada para aquele nome de arquivo neste computador, então abri-lo de novo começa na mesma etiqueta. Uma etiqueta que você escolher também aceita números inteiros como cotas.
4. Clique em {{ui:Adicionar}}. Os pontos são numerados a partir do maior número do projeto, cada ponto é descrito com sua camada (ou seu bloco), e as alturas são convertidas para as unidades do projeto como o resto do desenho. Tudo isso é um passo só: {{key:Mod+Z}} remove os pontos.

O texto fica em seu próprio ponto de inserção (ou no ponto de alinhamento, quando tem um). Texto dentro de blocos não é lido, e o desenho nunca é alterado.

## A verificação

A verificação roda sobre o que você está prestes a trazer e lista o que encontra, uma linha para cada tipo de problema:

| Mensagem | O que significa |
|---|---|
| **Unidades não informadas** | O desenho não diz quais são suas unidades, então seus números são lidos como as unidades do projeto. Confira uma distância que você conhece. |
| **Unidades convertidas** | As unidades do desenho diferem das do projeto e são escaladas (uma nota, não uma falha). |
| **Os dados se estendem por … km** ou **… m** | A extensão é maior que 200 km ou menor que meio metro, o que geralmente indica a unidade errada (milímetros lidos como metros, ou o contrário). |
| **Sem sistema de coordenadas** | O projeto não tem nenhum. É um aviso quando os dados ficam longe do zero, como acontece com coordenadas de estado ou de malha nacional. Veja [Sistemas de coordenadas](topic:coordinate-systems). |
| **Longe da origem** | Os dados estão a mais de 100 km do zero. Longe do zero, as vistas 3D e as exportações perdem precisão e oscilam. |
| **Camada de curvas … não tem altura** | Uma camada com nome de curvas de nível (TOPO, CONT, CNTR, CONTOUR) tem linhas na altura 0, então um terreno construído a partir delas ficaria plano. |
| **Cotas exatamente 0** | Algumas cotas são 0 enquanto a cota típica está longe disso: provavelmente alturas ausentes. |
| **Cotas longe das demais** | Algumas cotas ficam bem fora das outras (medidas em relação ao meio de todas as cotas, então um terreno íngreme com grande amplitude não é sinalizado), ou acima de 9,000 m ou abaixo de -11,000 m. |
| **Pontos sobre outro ponto** | Dois pontos no mesmo lugar com a mesma cota, ou com cotas diferentes. |

Depois que você clica em {{ui:Adicionar}}, as mesmas linhas vão para **Problemas**, uma para cada tipo, com o nome do arquivo, para que você possa voltar a elas. A verificação julga o desenho; não altera nada nele, e não impede que você o use.

:::tip
Quando a verificação indicar curvas de nível planas em 0 e houver cotas escritas como texto, tome as cotas como pontos de levantamento: elas costumam trazer as alturas reais que as linhas de curvas não têm.
:::

## O que não é verificado

A verificação não compara o desenho com um segundo levantamento, e não consegue dizer em qual sistema de coordenadas o desenho está: ela apenas informa que nenhum está definido.
