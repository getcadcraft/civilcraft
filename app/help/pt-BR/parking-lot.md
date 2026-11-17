---
title: Layout de estacionamento
summary: Monte vagas, corredores, vagas para pessoas com deficiência e para vans, e ilhas dentro de um contorno; faça a terraplenagem do estacionamento com caimentos para os drenos em relação ao terreno natural; depois pavimente e plante. Também disponível para um assistente.
keywords: estacionamento, vaga, corredor, acessível, ada, van, ilha, dreno, caimento, terraplenagem, corte, aterro, pavimentação, piso intertravado, plantio, árvores, terreno, nuvem de pontos, mcp, assistente
from: 06c14da9
---

Encaixe um estacionamento em um lote, uma plataforma ou uma linha de feição fechada, e obtenha as contagens, a terraplenagem e a pavimentação em uma etapa.

## Montar o layout

1. Selecione um lote, uma plataforma ou uma linha de feição fechada na planta.
2. Abra **Superfície, Mais, Estacionamento...**
3. Escolha as regras, o ângulo das vagas (90, 75, 60, 45, 30 graus ou paralelo) e corredores de mão única ou dupla. Os tamanhos de vaga, corredor e ilha começam pela tabela, e cada um pode ser digitado por cima.
4. Escolha **Montar layout**.

As fileiras correm ao longo da borda do contorno que dá mais vagas (ou no ângulo que você digitar). Uma vaga conta apenas se estiver inteiramente dentro do contorno. Onde sobra espaço para uma fileira e um corredor, é acrescentada uma faixa com vagas em um só lado. A janela lista as vagas, as vagas para pessoas com deficiência e para vans, as ilhas, os drenos e a área por vaga, e a planta mostra vagas, vagas acessíveis com seus corredores de acesso hachurados, ilhas, linhas de eixo dos corredores e drenos em suas próprias camadas (C-PARK-...), para que cheguem a PDF, DXF e DWG.

## Vagas para pessoas com deficiência

Com as regras dos Estados Unidos, a contagem segue a tabela 208.2 do ADA Standards de 2010 para as vagas previstas (uma em cada seis, arredondada para cima, é vaga para van), posicionada mais perto do primeiro canto do contorno (a entrada), cada uma com um corredor de acesso; duas dividem um. Uma vaga mais estreita que a largura acessível, ou um caimento mais íngreme que 1:48 nas vagas acessíveis, aparece como problema. **Estes números foram digitados a partir da norma como lembrados e não foram conferidos com a norma impressa.** Os tamanhos típicos de vaga e corredor vêm de guias de projeto de estacionamento e também não foram conferidos. Confira ambos, e o código da sua cidade, antes de depender deles. Escolha **Personalizado** para digitar a sua própria contagem de vagas acessíveis.

## Caimentos para os drenos, corte e aterro

A menos que você desative, o estacionamento vira uma área de terraplenagem na área de trabalho Paisagismo. Os drenos ficam nos eixos dos corredores a cada cerca de 100 pés (30 m); a superfície sobe a partir de cada dreno no caimento que você informar (1.5 por cento para começar), de modo que todo ponto cai para o dreno mais próximo. O nível é escolhido para que o corte e o aterro do estacionamento se equilibrem no terreno natural. O terreno natural é a superfície existente do projeto, que pode vir de pontos de levantamento, de um LandXML, de uma nuvem de pontos lidar ou de varredura convertida em superfície, ou de curvas de nível. A janela mostra a estimativa de corte e aterro; os volumes do próprio projeto mostram o valor exato depois. A área de terraplenagem mantém sua borda no terreno natural, então, onde a nova superfície difere do terreno na borda, você tem um degrau, e a janela diz de que tamanho.

## Pavimentação e plantio

O contorno inteiro recebe uma pavimentação de piso intertravado (um padrão em fiadas que você pode alterar em Paisagismo, Hardscape), e cada ilha recebe um canteiro de arbustos e, quando é larga o bastante, uma árvore, retirados da lista de plantas. Depois disso, tudo é um objeto comum de Paisagismo: edite-o, ou escolha **Montar layout de novo** para substituir o que o estacionamento criou. Remover o estacionamento remove o que ele criou.

## A partir de um assistente

O mesmo estacionamento pode ser pedido por MCP: `parking_layout` faz uma prévia, `parking_build` grava e `parking_remove` remove um estacionamento. Peça pelo nome do lote ou envie o contorno.

## O que não está feito

Não se verifica se os corredores chegam a uma rua. A pavimentação cobre o contorno inteiro, então sua área inclui as ilhas. Escolhas de material de pavimentação da Biblioteca e um tipo da Biblioteca para as vagas ainda não estão implementados; o padrão de pavimentação é o do Hardscape. Regras de outros países ainda não estão implementadas.
