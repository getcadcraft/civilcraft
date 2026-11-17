---
title: Linhas características
summary: Desenhar linhas 3D que se definem vértice a vértice, criar offsets em degraus a partir delas e usá-las como linhas de quebra do terreno ou como plataformas inclinadas no projeto.
keywords: arco, curva, raio, arco 3d, hélice, lancil curvo, sobreposição de rasante, sobreposição de cotas, setas de rasante, linha característica, rasante, inclinação, cota, offset em degraus, offset, linha de quebra, lancil, valeta, berma, plataforma inclinada, intersecção do talude, modelação do terreno, polilinha 3d
from: d55b25fb
---

Uma linha característica é uma linha com uma cota em cada vértice: um lancil, a linha de escoamento de uma valeta, o topo de uma berma, o bordo de uma plataforma inclinada. Definem-se as suas cotas por número ou por rasante, copia-se lateralmente com um degrau para cima ou para baixo, e escolhe-se o que as superfícies fazem com ela.

## Desenhar uma

1. Escolha **Superfície** › {{ui:Mais}} › {{ui:Linha característica}}, ou prima {{key:L}}.
2. Clique nos vértices na planta. Um clique num ponto do levantamento assume o lugar e a cota desse ponto; em qualquer outro sítio, o vértice assume a cota do terreno existente nesse local.
3. Prima {{key:Enter}} para terminar uma linha aberta, ou clique de novo no primeiro vértice para a fechar.

A nova linha fica selecionada e começa como linha de quebra do terreno existente, assente no terreno.

## Arcos

Um segmento pode ser um arco em planta cujas extremidades estão a cotas diferentes: um retorno de lancil, uma valeta curva, uma rampa que vira. A rasante corre de forma uniforme ao longo do arco, e o comprimento é medido ao longo da curva.

- **Durante o desenho:** prima {{key:C}} (num ecrã tátil, {{ui:Arco}} na barra sobre a planta) para ativar os arcos. Depois de um vértice, clique num ponto da curva e depois no sítio onde o arco termina. Prima {{key:C}} de novo para segmentos retos. {{key:Backspace}} elimina primeiro o ponto da curva.
- **Depois:** em **Propriedades**, escreva um raio e o sentido da curva na caixa **Arco** do vértice, por exemplo `50 L` ou `50 R` (esquerda ou direita ao percorrer a linha), e prima {{key:Enter}}. Esvazie a caixa para o segmento voltar a ser reto. Um raio menor do que metade do segmento é recusado.

A linha selecionada mostra o raio de cada arco ao lado da sua rasante. O **Comprimento** é medido ao longo dos arcos em planta; o **Comprimento 3D** conta também a subida e a descida. Os offsets em degraus mantêm os arcos: um arco do lado de fora de uma curva cresce, o do lado de dentro encolhe, e um offset que ultrapasse o centro de um arco é recusado.

As superfícies, a vista 3D, o DXF e o DWG tratam cada arco como pequenos troços retos que ficam dentro de 0.01 da curva. O LandXML mantém-nos como arcos (ver **Arcos noutros ficheiros** abaixo).

## Definir cotas e rasantes

**Propriedades** lista os vértices com a sua distância ao longo da linha, a **Cota** e a **Rasante até ao seguinte** (em percentagem). Escreva um dos dois e prima {{key:Enter}}:

- Uma cota move apenas esse vértice.
- Uma rasante define a cota na extremidade mais distante do seu segmento; os vértices seguintes ficam onde estão, por isso a rasante do segmento seguinte muda.

Também em **Propriedades**:

| Ação | O que faz |
|---|---|
| **Elevar ou baixar tudo em** | Soma a altura que escrever a todos os vértices. |
| {{ui:Cotas a partir do terreno}} | Repõe todos os vértices sobre o terreno existente (os vértices fora da superfície mantêm as suas cotas e são listados). |
| {{ui:Uma só inclinação, do primeiro ao último}} | Mantém a primeira e a última cota e põe os vértices entre elas numa rasante uniforme. |

A linha selecionada mostra as cotas nos vértices e as rasantes ao longo dos segmentos na planta. Arraste um vértice com {{ui:Select}} para o mover; a sua cota mantém-se.

## Offsets em degraus

Em **Offset em degraus**, escreva uma **Distância** (positiva para a direita do sentido da linha, negativa para a esquerda), depois uma altura (para cima ou para baixo) ou uma inclinação em percentagem, e clique em {{ui:Criar a linha de offset}}. A cópia é uma nova linha característica: por exemplo, a parte de trás de um lancil a 0.5 ft para o lado e 0.5 ft mais alta, ou a aresta de uma valeta a 6 ft para fora, com 2 %. Uma distância que faria a cópia dobrar sobre si mesma numa curva apertada é recusada.

## Rasantes e cotas no ecrã

Prima {{key:E}}, ou marque **Rasantes e cotas nas linhas características** em **Visualização**, para ver a rasante de cada linha característica ao longo de cada segmento (com uma pequena seta a apontar para baixo) e a sua cota nos vértices. Aparecem apenas no ecrã: nada é acrescentado ao desenho, e o PDF, o DXF e o DWG ficam como estão. Os segmentos curtos e os vértices apertados ficam sem etiqueta até ampliar. A linha selecionada mostra sempre as suas próprias rasantes e cotas.

## Na vista de perfil

Uma linha característica que cruza uma diretriz aparece na vista de perfil dessa diretriz, com o seu nome e a cota no cruzamento; as linhas que correm ao lado dela também podem ser mostradas. Ver [Desenhar um perfil longitudinal](topic:profile).

## O que as superfícies fazem com ela

Escolha **Utilizar**:

| Utilizar | O que acontece |
|---|---|
| Linha de quebra do terreno existente | O terreno existente passa pela linha às suas cotas, como uma linha de quebra desenhada. |
| Modelada no projeto | Uma linha **fechada** torna-se uma plataforma inclinada: a superfície proposta no interior é modelada até à sua aresta. Ative **Intersecção do talude até ao terreno** para desenhar taludes de escavação e aterro (horizontal para 1 vertical) desde a aresta até ao terreno, como faz uma plataforma; cada talude começa na cota da própria aresta nesse ponto. |
| Só desenhada | Fica na planta e sai em DXF, DWG e PDF (camada C-GRAD-FEAT, polilinhas 3D), mas as superfícies ignoram-na. |

Os volumes, as secções e a vista 3D incluem as linhas características modeladas no projeto, como as plataformas. Cada alteração é um passo: {{key:Mod+Z}} anula-a.

## Partilhar linhas com a equipa

Num desenho aberto a partir dos ficheiros na nuvem no CadCraft Studio, num plano de equipa, as **Propriedades** do projeto (sem nada selecionado) têm uma secção **Equipa** com {{ui:Linhas da equipa…}}: as linhas que a equipa partilhou, cada uma com a sua revisão, sem ser preciso selecionar primeiro uma linha característica. Selecione uma linha para a partilhar, publicar uma nova revisão, obter a da equipa ou deixar de a partilhar. Fora dessa definição, a secção indica o que é preciso.

## Arcos noutros ficheiros

| Ficheiro | O que acontece a uma linha característica com arcos |
|---|---|
| Projeto CivilCraft | Mantida exatamente. |
| LandXML | Escrita como uma linha característica da planta, com linhas e arcos e as suas cotas, e lida de volta com os seus arcos. Uma linha característica de outro programa entra como **Só desenhada**: escolha o seu **Utilizar** para a pôr numa superfície. |
| DWG e DXF | Uma polilinha 3D não pode conter um arco, por isso a linha é escrita como pequenos troços dentro de 0.01 de cada arco. O CivilCraft também anota no desenho quais os troços que eram arcos: quando abre o desenho como traçados, {{ui:Linhas características}} traz as linhas de volta como linhas características com os seus arcos. Outros programas veem uma polilinha 3D comum. |
