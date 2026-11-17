---
title: Plataformas para habitação em terrenos inclinados
summary: Modelar uma plataforma numa encosta: muros de suporte como arestas da plataforma, mapa de escavação e aterro sombreado por profundidade com cotas pontuais (planta e 3D), uma secção desenhada em qualquer ponto através do terreno e do projeto, e rampas ou plataformas inclinadas para acessos automóveis.
keywords: plataforma, plataforma de implantação, habitação, terreno inclinado, encosta, muro de suporte, escavação e aterro, mapa de escavação e aterro, cotas pontuais, corte livre, linha de secção, desenhos para a câmara municipal, acesso automóvel, rampa, plataforma inclinada, modelação, fator de empolamento, movimento de terras
from: daa08a3f
---

Uma plataforma para habitação é uma **plataforma** (**Conceção** › {{ui:Plataforma}}): um polígono plano a uma só cota, modelado no terreno. Quatro funcionalidades ajudam numa encosta.

## Muros de suporte como arestas da plataforma

Selecione a plataforma e defina um lado como {{ui:Vertical (muro de suporte)}} em vez de um talude (**Propriedades** › {{ui:Lados e muros de suporte}}, ou {{ui:Verticais: muros de suporte}} para todos os lados de uma só vez). A altura do muro é lida do terreno ao longo dele: topo no terreno, base na plataforma, indicada nas duas extremidades e no seu ponto mais alto na planta, com um aviso quando é mais alto do que o limite que definiu. Muros e taludes podem ser combinados lado a lado.

## O mapa de escavação e aterro

Marque {{ui:Mapa de escavação e aterro}} em **Mostrar**. A planta é sombreada consoante a profundidade da escavação ou do aterro, em intervalos iguais (escavação em tons quentes, aterro em azul, quase nivelado em tom pálido), com legenda, e as **cotas pontuais** são impressas na plataforma: a variação de cota em pontos de uma grelha, e a escavação mais funda e o aterro mais alto marcados com ▲. As células são as mesmas que os volumes de movimento de terras usam, pelo que o mapa e os números estão sempre de acordo.

Na vista 3D, escolha **Escavação e aterro** na lista de cores para aplicar as mesmas cores ao terreno e ao projeto.

Um fator de empolamento ou de contração está na ferramenta de diagrama de massas (**Conceção** › {{ui:Diagrama de Brückner}}); não é aplicado aos volumes de uma plataforma.

## Uma secção livre

Em **Superfície** › {{ui:Mais}}, escolha {{ui:Corte livre}}, clique nos pontos da linha de secção em qualquer local (pode dobrar) e prima {{key:Enter}}. Uma caixa de diálogo desenha a secção: o terreno natural, o projeto modelado (a tracejado) e a escavação e o aterro entre eles, sombreados, com as respetivas áreas (o projeto conta apenas dentro das plataformas e estradas). O {{ui:Exagero vertical}} assume por defeito o valor que ajusta o desenho. {{ui:Guardar como SVG}} e {{ui:Guardar como CSV}} dão-lhe um desenho para a câmara municipal e os números.

## Rampas e plataformas inclinadas

Em **Superfície** › {{ui:Mais}}, escolha {{ui:Rampa ou plataforma inclinada}}, clique na extremidade baixa e depois na alta, prima {{key:Enter}}, e indique a largura, a cota na extremidade baixa e o declive. A plataforma é uma faixa cujos cantos têm essas cotas (a aresta entre dois cantos segue um declive constante), e modela-se no terreno como qualquer plataforma. Os cantos de qualquer plataforma podem também ter as suas próprias cotas, pelo que um acesso automóvel, uma rampa ou um terraço inclinado é uma plataforma com uma cota em cada canto.
