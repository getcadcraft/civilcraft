---
title: Verificar um desenho de levantamento na importação
summary: Ler as cotas escritas como texto ou em atributos de blocos como pontos de levantamento, e verificar um DWG ou DXF quanto a unidades erradas, falta de sistema de coordenadas, origem distante, curvas de nível planas, cotas estranhas e pontos duplicados antes de construir terreno a partir dele.
keywords: verificação de levantamento, verificação na importação, cotas de levantamento, cotas pontuais, cotas em texto, cotas como texto, atributos, unidades, sistema de coordenadas, longe da origem, curvas a zero, valores atípicos, pontos duplicados, problemas, arquiteto paisagista, desenho de levantamento
from: d46acd24
---

Um desenho de levantamento pode parecer correto e estar errado para um terreno: as suas unidades podem ser presumidas, as suas curvas de nível podem ficar planas à altura 0, ou as suas cotas podem estar escritas como texto que de todo não é geometria. A secção **Cotas de levantamento e verificação** da caixa de diálogo {{ui:Linhas}} (ver [Abrir um DWG ou DXF como linhas](topic:open-dwg-dxf)) lê essas cotas e indica o que parece errado antes de se acrescentar seja o que for.

## Cotas escritas como texto ou em atributos

Muitos desenhos de levantamento dão uma cota pontual como um pequeno texto junto a uma cruz, como `104.37` ou `EL 104.37`, ou como atributo de um bloco de pontos. Estes não são linhas, por isso o leitor de linhas deixa-os de fora. A secção indica quantos encontrou e permite tomá-los como **pontos de levantamento**:

1. Assinale **Tomar … cotas como pontos de levantamento**. Começam sem assinalar, porque nem todo o número de um desenho é uma altura.
2. O texto é lido quando é uma cota por si só: um número com parte decimal (`104.37`, `+104,37`, `-3.50`), ou um número a seguir a `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` ou `LEVEL`, com um `m`, `ft` ou `'` opcional a seguir. Um número inteiro sozinho (`12`) é lido como número de lote ou de folha, não como cota; texto como `GATE 3` ou uma data nunca é lido. Os códigos de formatação de texto são ignorados.
3. Para atributos de blocos, escolha **Atributo de bloco que contém a cota**. O CivilCraft encontra por si uma etiqueta chamada ELEV, Z, LEVEL, RL ou semelhante; escolha outra da lista se o desenho usar a sua própria. A escolha fica guardada para esse nome de ficheiro neste computador, por isso ao abri-lo de novo começa na mesma etiqueta. Uma etiqueta que escolher aceita também números inteiros como cotas.
4. Clique em {{ui:Acrescentar}}. Os pontos são numerados a seguir ao número mais alto do projeto, cada ponto fica descrito com a sua camada (ou o seu bloco), e as alturas são convertidas para as unidades do projeto como o resto do desenho. Tudo isto conta como um só passo: {{key:Mod+Z}} retira os pontos.

O texto fica no seu próprio ponto de inserção (ou no seu ponto de alinhamento, quando o tem). O texto dentro de blocos não é lido, e o desenho nunca é alterado.

## A verificação

A verificação incide sobre o que está prestes a importar e lista o que encontra, uma linha por cada tipo de problema:

| Diz | O que significa |
|---|---|
| **Unidades não indicadas** | O desenho não diz quais são as suas unidades, por isso os seus números são lidos como as unidades do projeto. Verifique uma distância que conheça. |
| **Unidades convertidas** | As unidades do desenho diferem das do projeto e são escaladas (uma nota, não uma falha). |
| **Os dados ocupam … km** ou **… m** | A extensão é maior do que 200 km ou menor do que meio metro, o que normalmente indica a unidade errada (milímetros lidos como metros, ou o contrário). |
| **Sem sistema de coordenadas** | O projeto não tem nenhum. É um aviso quando os dados estão longe de zero, como acontece com coordenadas de plano estatal ou de grelha nacional. Ver [Sistemas de coordenadas](topic:coordinate-systems). |
| **Longe da origem** | Os dados estão a mais de 100 km de zero. Longe de zero, as vistas 3D e as exportações perdem precisão e tremem. |
| **Camada de curvas … sem altura** | Uma camada com nome de curvas de nível (TOPO, CONT, CNTR, CONTOUR) tem linhas à altura 0, por isso um terreno construído a partir delas ficaria plano. |
| **Cotas exatamente 0** | Algumas cotas são 0 quando a cota típica está longe disso: provavelmente faltam alturas. |
| **Cotas afastadas das restantes** | Algumas cotas situam-se bem fora das outras (calculado em relação ao meio de todas as cotas, por isso um local íngreme com grande amplitude não é assinalado), ou acima de 9,000 m ou abaixo de -11,000 m. |
| **Pontos sobre outro ponto** | Dois pontos no mesmo sítio com a mesma cota, ou com cotas diferentes. |

Depois de clicar em {{ui:Acrescentar}}, as mesmas linhas passam para **Problemas**, uma para cada tipo, com o nome do ficheiro, para poder voltar a elas. A verificação avalia o desenho; não altera nada nele e não o impede de usar o desenho.

:::tip
Quando a verificação indica que as curvas estão planas a 0 e há cotas escritas como texto, tome as cotas como pontos de levantamento: muitas vezes trazem as alturas reais que as linhas de curvas não têm.
:::

## O que não é verificado

A verificação não compara o desenho com um segundo levantamento, e não consegue saber em que sistema de coordenadas o desenho está: apenas indica que nenhum está definido.
