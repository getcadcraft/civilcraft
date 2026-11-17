---
title: Linhas de feição
summary: Desenhe linhas 3D com cotas e declividades definidas vértice a vértice, crie deslocamentos escalonados delas e use-as como linhas de quebra do terreno ou como plataformas inclinadas no projeto.
keywords: arco, curva, raio, arco 3D, hélice, meio-fio curvo, sobreposição de greide, sobreposição de elevação, setas de greide, linha de feição, greide, declividade, elevação, deslocamento em degraus, deslocamento, linha de quebra, meio-fio, valeta, banqueta, plataforma inclinada, pé de talude, terraplenagem, polilinha 3D
from: d55b25fb
---

Uma linha de feição é uma linha com uma elevação em cada vértice: um meio-fio, a linha de escoamento de uma valeta, o topo de uma banqueta, a borda de uma plataforma inclinada. Você define as elevações por número ou por declividade, copia a linha para o lado com um degrau para cima ou para baixo, e escolhe o que as superfícies fazem com ela.

## Desenhar uma

1. Escolha **Superfície** › {{ui:Mais}} › {{ui:Linha de feição}}, ou pressione {{key:L}}.
2. Clique nos vértices dela na planta. Um clique em um ponto de levantamento assume o lugar e a elevação desse ponto; em qualquer outro lugar, o vértice assume a elevação do terreno existente ali.
3. Pressione {{key:Enter}} para terminar uma linha aberta, ou clique no primeiro vértice de novo para fechá-la.

A nova linha fica selecionada e começa como uma linha de quebra do terreno existente, assentada sobre o terreno.

## Arcos

Um trecho pode ser um arco em planta cujas extremidades estão em elevações diferentes: uma curva de meio-fio, uma valeta curva, uma rampa que faz uma curva. A declividade dele segue uniformemente ao longo do arco, e o comprimento é medido ao longo da curva.

- **Durante o desenho:** pressione {{key:C}} (em tela de toque, {{ui:Arco}} na barra sobre a planta) para ativar os arcos. Depois de um vértice, clique em um ponto da curva e depois no ponto onde o arco termina. Pressione {{key:C}} novamente para trechos retos. {{key:Backspace}} descarta antes o ponto na curva.
- **Depois:** em **Propriedades**, digite um raio e o sentido da curva no campo **Arco** do vértice, por exemplo `50 L` ou `50 R` (esquerda ou direita conforme você percorre a linha), e pressione {{key:Enter}}. Esvazie o campo para tornar o trecho reto novamente. Um raio menor que a metade do trecho é recusado.

A linha selecionada mostra o raio de cada arco ao lado da declividade dele. **Comprimento** é ao longo dos arcos em planta; **Comprimento 3D** também conta a subida e a descida. Os deslocamentos em degraus mantêm os arcos: um arco do lado externo de uma curva cresce, um do lado interno diminui, e um deslocamento que passa do centro de um arco é recusado.

As superfícies, a vista 3D e os formatos DXF e DWG tratam cada arco como pequenos trechos retos que ficam dentro de 0.01 da curva. O LandXML os mantém como arcos (veja **Arcos em outros arquivos** abaixo).

## Definir elevações e declividades

**Propriedades** lista os vértices com a distância ao longo da linha, a **Elevação** e a **Declividade até o próximo** (em percentual). Digite um dos dois e pressione {{key:Enter}}:

- Uma elevação move apenas esse vértice.
- Uma declividade define a elevação na extremidade distante do trecho; os vértices depois dele permanecem onde estão, então a declividade do trecho seguinte muda.

Também em **Propriedades**:

| Ação | O que faz |
|---|---|
| **Elevar ou abaixar tudo em** | Adiciona a altura que você digitar a cada vértice. |
| {{ui:Elevações do terreno}} | Coloca cada vértice de volta no terreno existente (os vértices fora da superfície mantêm as suas, e são listados). |
| {{ui:Um único greide, do primeiro ao último}} | Mantém as elevações do primeiro e do último vértice e coloca os vértices entre eles em uma declividade uniforme. |

A linha selecionada mostra suas elevações nos vértices e suas declividades ao longo dos trechos na planta. Arraste um vértice com {{ui:Selecionar}} para movê-lo; a elevação dele permanece.

## Deslocamentos em degraus

Em **Deslocamento em degraus**, digite uma **Distância** (positiva para a direita do sentido da linha, negativa para a esquerda), depois uma altura (para cima ou para baixo em) ou uma declividade em percentual, e clique em {{ui:Criar a linha deslocada}}. A cópia é uma nova linha de feição: por exemplo, o tardoz de um meio-fio 0.5 ft para o lado e 0.5 ft mais alto, ou a borda de uma valeta a 6 ft para fora com 2 %. Uma distância que faria a cópia se dobrar sobre si mesma em uma curva fechada é recusada.

## Declividades e elevações na tela

Pressione {{key:E}}, ou marque **Declividades e elevações nas linhas de feição** em Exibição, para ver a declividade de cada linha de feição ao longo de cada trecho (com uma pequena seta apontando para baixo) e a elevação dela nos vértices. Elas aparecem somente na tela: nada é acrescentado ao desenho, e o PDF, o DXF e o DWG permanecem como estão. Trechos curtos e vértices muito próximos ficam sem rótulo até que você aproxime o zoom. A linha selecionada sempre mostra as próprias declividades e elevações.

## Na vista de perfil

Uma linha de feição que cruza um alinhamento aparece na vista de perfil desse alinhamento, com seu nome e elevação no cruzamento; linhas que correm ao lado dele também podem ser mostradas. Veja [Projetar um perfil longitudinal](topic:profile).

## O que as superfícies fazem com ela

Escolha **Uso**:

| Uso | O que acontece |
|---|---|
| Linha de quebra do terreno existente | O terreno existente passa pela linha nas suas elevações, como uma linha de quebra desenhada. |
| Terraplenada no projeto | Uma linha **fechada** torna-se uma plataforma inclinada: a superfície proposta dentro dela é terraplenada até a borda. Ative **Pé de talude até o terreno** para traçar taludes de corte e aterro (horizontal para 1 vertical) da borda até o terreno, como faz uma plataforma; cada talude começa na própria elevação da borda ali. |
| Somente desenhada | Ela permanece na planta e segue para DXF, DWG e PDF (camada C-GRAD-FEAT, polilinhas 3D), mas as superfícies a ignoram. |

Volumes, seções e a vista 3D incluem as linhas de feição terraplenadas no projeto, como as plataformas. Cada alteração é uma única etapa: {{key:Mod+Z}} a desfaz.

## Compartilhar linhas com sua equipe

Em um desenho aberto dos seus arquivos na nuvem no CadCraft Studio, em um plano de equipe, as Propriedades do projeto (nada selecionado) têm uma seção **Equipe** com {{ui:Linhas da equipe…}}: as linhas que sua equipe compartilhou, cada uma com sua revisão, sem precisar selecionar antes uma linha de feição. Selecione uma linha para compartilhá-la, envie uma nova revisão, baixe a da equipe ou pare de compartilhar. Fora dessa configuração, a seção diz o que ela exige.

## Arcos em outros arquivos

| Arquivo | O que acontece com uma linha de feição com arcos |
|---|---|
| Projeto do CivilCraft | Mantida exatamente. |
| LandXML | Gravada como um elemento de planta de linhas e arcos com suas elevações, e lida de volta com os arcos. Uma linha de feição de outro programa entra como **Somente desenhada**: escolha o seu **Uso** para colocá-la em uma superfície. |
| DWG e DXF | Uma polilinha 3D não pode conter um arco, então a linha é gravada como pequenos trechos dentro de 0.01 de cada arco. O CivilCraft também registra no desenho quais trechos eram arcos: ao abrir o desenho como linhas, {{ui:Linhas de feição}} traz as linhas de volta como linhas de feição com seus arcos. Outros programas veem uma polilinha 3D comum. |
