---
title: Calcular as horas de sol num local
summary: Escolha um dia (ou uma estação) e um fuso horário, e veja as horas de sol direto em cada parede de cada volume edificado e no terreno em redor, com o terreno desenhado no plano e os números em CSV.
keywords: sol, horas de sol, sombra, sombreamento, acesso solar, horas de luz do dia, fachada, parede, estação, solstício, equinócio, fuso horário, horário de verão, latitude, longitude, CSV, raster
from: 4e32a314
---

**Horas de sol** conta as horas de sol direto que chegam a cada parede de cada volume edificado e ao terreno em redor, num dia que escolhe ou em média ao longo de uma estação. Os volumes e o próprio terreno projetam sombra; mais nada (sem árvores, sem vizinhos que não desenhou). A luz do céu que não é sol direto não é contada.

## Antes de começar

A posição do sol vem da latitude e longitude do local, que vêm do **sistema de coordenadas** do projeto. Um projeto sem nenhum é recusado com uma mensagem: defina-o primeiro (**Coordenadas** no grupo SIG). Uma latitude e longitude escritas à mão seriam uma estimativa, por isso não há caixa para elas.

## Calcular

Em **Propriedades**, em **Volumes edificados**, **Horas de sol**:

1. Escolha o **Dia**. Começa no dia em que o sol está mais baixo onde está (21 de dezembro, ou 21 de junho no hemisfério sul). Para uma estação, assinale **Ao longo de uma estação**, escolha o **Último dia** e de quantos em quantos dias amostrar.
2. Escreva o **Fuso horário**: um nome como `America/Mexico_City`, ou um desvio em relação ao UTC como `-6`. Um nome segue as regras de horário de verão desse fuso para o dia; um desvio escrito é usado exatamente como escrito, por isso use o que está em vigor nesse dia. A linha abaixo da caixa indica o desvio que encontrou.
3. Escolha de quantos em quantos minutos posicionar o sol (a cada 5, 10, 15 ou 30 minutos) e depois **Calcular as horas de sol**. Uma estação corre em processos em segundo plano; **Parar** cancela-a.

## O que obtém

- Uma tabela por volume: a **pior parede**, a **média** e a **melhor parede**, em horas por dia, e uma tabela de todas as paredes com a sua orientação e as horas piso a piso.
- O terreno em redor dos volumes, desenhado no plano do escuro (sem sol) ao amarelo (o máximo que qualquer célula recebe), com legenda. As células sob um volume ficam em branco. **Mostrar o terreno no plano** desativa-o.
- **Paredes em CSV** e **Terreno em CSV** guardam os números.

Numa estação, os valores são a média diária dos dias amostrados. Nada é guardado no projeto: o resultado serve para consulta, e voltar a calcular gera-o de novo.

## Bom saber

- Uma parede conta um momento como ensolarado só quando está virada para o sol e nada se interpõe. Uma parede virada para o lado oposto não recebe nada.
- O terreno é amostrado numa grelha que depende da dimensão do local, e a posição do sol é tomada no meio de cada passo temporal; por isso as horas estão certas até ao passo escolhido.
- A posição do sol é uma fórmula astronómica publicada, com precisão de cerca de um minuto de arco.
