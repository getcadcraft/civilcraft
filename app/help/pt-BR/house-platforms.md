---
title: Plataformas de casas em terrenos inclinados
summary: Terraplenar uma plataforma em uma encosta: muros de arrimo como bordas da plataforma, o mapa de corte e aterro sombreado por profundidade com cotas de nível (planta e 3D), uma seção desenhada em qualquer lugar através do terreno e do projeto, e rampas ou plataformas inclinadas para entradas de garagem.
keywords: plataforma, plataforma da casa, terreno inclinado, encosta, muro de arrimo, corte e aterro, mapa de corte e aterro, cotas de nível, seção livre, linha de seção, desenhos para a prefeitura, entrada de garagem, rampa, plataforma inclinada, terraplenagem, fator de empolamento, movimento de terra
from: daa08a3f
---

Uma plataforma de casa é uma **plataforma** (**Projeto** › {{ui:Plataforma}}): um polígono plano em um nível, terraplenado no terreno. Quatro recursos ajudam em uma encosta.

## Muros de arrimo como bordas da plataforma

Selecione a plataforma e defina um lado como {{ui:Vertical (muro de arrimo)}} em vez de um talude (**Propriedades** › {{ui:Lados e muros de arrimo}}, ou {{ui:Verticais: muros de arrimo}} para todos os lados de uma vez). A altura do muro é lida do terreno ao longo dele: topo no terreno, base na plataforma, exibida nas duas extremidades e no ponto mais alto na planta, com um aviso quando ele estiver acima do limite que você definiu. Muros e taludes podem ser combinados lado a lado.

## O mapa de corte e aterro

Marque {{ui:Mapa de corte e aterro}} em **Mostrar**. A planta é sombreada pela profundidade do corte ou aterro, em faixas iguais (corte em tons quentes, aterro em azul, quase nivelado em tom claro), com legenda, e as **cotas de nível** são impressas na plataforma: a variação de nível em pontos de uma grade, e o corte mais profundo e o aterro mais alto marcados com ▲. As células são as mesmas usadas pelos volumes de movimento de terra, então o mapa e os números sempre coincidem.

Na vista 3D, escolha **Corte e aterro** na lista de cores para sobrepor as mesmas cores ao terreno e ao projeto.

Um fator de empolamento ou de contração fica na ferramenta de diagrama de massas (**Projeto** › {{ui:Diagrama de massas}}); ele não é aplicado aos volumes de uma plataforma.

## Uma seção livre

Em **Superfície** › {{ui:Mais}}, escolha {{ui:Seção livre}}, clique nos pontos da linha de seção em qualquer lugar (ela pode dobrar) e pressione {{key:Enter}}. Uma caixa de diálogo desenha a seção: o terreno existente, o projeto terraplenado (tracejado) e o corte e aterro entre eles, sombreados, com suas áreas (o projeto só conta dentro das plataformas e vias). {{ui:Exagero vertical}} assume por padrão o ajuste ao desenho; {{ui:Salvar como SVG}} e {{ui:Salvar como CSV}} geram um desenho para a prefeitura e os números.

## Rampas e plataformas inclinadas

Em **Superfície** › {{ui:Mais}}, escolha {{ui:Rampa ou plataforma inclinada}}, clique na extremidade baixa e depois na alta, pressione {{key:Enter}}, e informe a largura, o nível da extremidade baixa e a inclinação. A plataforma é uma faixa cujos cantos carregam esses níveis (a aresta entre dois cantos segue uma inclinação constante), e ela se terraplena no terreno como qualquer plataforma. Os cantos de qualquer plataforma também podem ter seus próprios níveis, então uma entrada de garagem, uma rampa ou um terraço inclinado é uma plataforma com um nível em cada canto.
