---
title: Calcular as horas de sol em um terreno
summary: Escolha um dia (ou uma estação) e um fuso horário, e veja as horas de sol direto em cada parede de cada volume edificado e no terreno ao redor, com o terreno desenhado na planta e os números em CSV.
keywords: sol, horas de sol, sombra, sombreamento, acesso solar, horas de luz do dia, fachada, parede, estação, solstício, equinócio, fuso horário, horário de verão, latitude, longitude, CSV, raster
from: 4e32a314
---

**Horas de sol** conta as horas de sol direto que atingem cada parede de cada volume edificado e o terreno ao redor, em um dia escolhido ou com média de uma estação. Os volumes e o próprio terreno projetam sombra; nada mais projeta (sem árvores, sem vizinhos que você não desenhou). A luz do céu que não é sol direto não é contada.

## Antes de começar

A posição do sol vem da latitude e da longitude do terreno, que vêm do **sistema de coordenadas** do projeto. Um projeto sem um é recusado com uma mensagem: defina-o primeiro (**Coordenadas** no grupo GIS). Uma latitude e longitude digitadas à mão seriam um palpite, por isso não há caixa para elas.

## Calcular

Em **Propriedades**, em **Volumes edificados**, **Horas de sol**:

1. Escolha o **Dia**. Ele começa no dia em que o sol está mais baixo onde você está (21 de dezembro, ou 21 de junho no hemisfério sul). Para uma estação, marque **Ao longo de uma estação**, escolha o **Último dia** e de quantos em quantos dias amostrar.
2. Digite o **Fuso horário**: um nome como `America/Mexico_City`, ou um deslocamento em relação ao UTC como `-6`. Um nome segue as regras de horário de verão daquele fuso para o dia; um deslocamento digitado é usado exatamente como digitado, então use o que vale naquele dia. A linha abaixo da caixa informa qual deslocamento foi encontrado.
3. Escolha de quanto em quanto tempo posicionar o sol (a cada 5, 10, 15 ou 30 minutos), e depois **Calcular horas de sol**. Uma estação roda em processos em segundo plano; **Parar** cancela.

## O que você obtém

- Uma tabela por volume: a **pior parede**, a **média** e a **melhor parede**, em horas por dia, e uma tabela de todas as paredes com a orientação e suas horas pavimento a pavimento.
- O terreno ao redor dos volumes, desenhado na planta do escuro (sem sol) ao amarelo (o máximo que qualquer célula recebe), com uma legenda. As células sob um volume ficam em branco. **Mostrar o terreno na planta** desliga isso.
- **Paredes em CSV** e **Terreno em CSV** salvam os números.

Para uma estação, os valores são a média diária dos dias amostrados. Nada é salvo no projeto: o resultado serve para visualizar, e executar de novo o recria.

## Bom saber

- Uma parede conta um instante como ensolarado somente quando está voltada para o sol e nada está no caminho. Uma parede voltada para o lado oposto não recebe nada.
- O terreno é amostrado em uma malha que depende do tamanho do terreno, e a posição do sol é calculada no meio de cada passo de tempo; assim, as horas estão corretas dentro do passo escolhido.
- A posição do sol é uma fórmula astronômica publicada, precisa a cerca de um minuto de arco.
