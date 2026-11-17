---
title: Traçado de um parque de estacionamento
summary: Disponha lugares, corredores, lugares acessíveis e para carrinhas e ilhas dentro de um contorno, dê quedas para os sumidouros em relação ao terreno existente, e depois pavimente e plante. Também disponível para um assistente.
keywords: estacionamento, parque, lugar, corredor, acessível, ada, carrinha, ilha, sumidouro, queda, rasante, escavação, aterro, pavimento, blocos, plantação, árvores, terreno, nuvem de pontos, mcp, assistente
from: 06c14da9
---

Ajuste um parque de estacionamento num lote, numa plataforma ou numa linha característica fechada, e obtenha as contagens, a modelação do terreno e o pavimento num só passo.

## Traçar o parque

1. Selecione um lote, uma plataforma ou uma linha característica fechada na planta.
2. Abra **Superfície, Mais, Parque de estacionamento...**
3. Escolha as regras, o ângulo dos lugares (90, 75, 60, 45, 30 graus ou paralelo) e corredores de sentido único ou duplo. As dimensões dos lugares, dos corredores e das ilhas partem da tabela, e cada uma pode ser substituída ao escrever.
4. Escolha **Traçar**.

As filas seguem a aresta do contorno que dá mais lugares (ou o ângulo que escrever). Um lugar só conta se ficar inteiramente dentro do contorno. Onde sobra espaço para uma fila e um corredor, acrescenta-se uma faixa de fila única. A janela lista os lugares, os lugares acessíveis e para carrinhas, as ilhas, os sumidouros e a área por lugar, e a planta mostra os lugares, os lugares acessíveis com os respetivos corredores de acesso com trama, as ilhas, os eixos dos corredores e os sumidouros nas suas próprias camadas (C-PARK-...), para que cheguem ao PDF, ao DXF e ao DWG.

## Lugares acessíveis

Com as regras dos Estados Unidos, a contagem segue a tabela 208.2 da norma 2010 ADA Standards para os lugares previstos (um em cada seis, arredondado para cima, é um lugar para carrinhas), colocados o mais perto possível do primeiro canto do contorno (a entrada), cada um com um corredor de acesso; dois partilham um. Um lugar mais estreito do que a largura acessível, ou uma queda mais acentuada do que 1:48 nos lugares acessíveis, aparece como problema. **Estes números foram introduzidos a partir da norma de memória e não foram confrontados com a norma impressa.** As dimensões típicas dos lugares e dos corredores vêm de guias de projeto de estacionamentos e também não foram verificadas. Verifique as duas e o código local antes de confiar nelas. Escolha **Personalizado** para introduzir uma contagem própria de lugares acessíveis.

## Quedas para os sumidouros, escavação e aterro

Salvo se se desativar, o parque torna-se uma área de modelação do terreno na área de trabalho Paisagem. Os sumidouros são colocados nos eixos dos corredores a cada 100 feet (30 m), aproximadamente; a superfície sobe a partir de cada sumidouro com a queda que indicar (1.5 por cento para começar), de modo que cada ponto desce para o sumidouro mais próximo.

O nível é escolhido de modo que a escavação e o aterro do parque se equilibrem sobre o terreno existente. O terreno existente é a superfície existente do projeto, que pode vir de pontos de levantamento, de LandXML, de uma nuvem de pontos lidar ou de digitalização transformada em superfície, ou de curvas de nível. A janela mostra a estimativa de escavação e aterro; os volumes do próprio projeto mostram depois o valor exato. A área de modelação mantém a aresta sobre o terreno existente, por isso, onde a nova superfície difere do terreno na aresta, obtém-se um degrau, e a janela indica a respetiva dimensão.

## Pavimento e plantação

Todo o contorno recebe um pavimento de blocos (um padrão de aparelho que pode alterar em Paisagem, Hardscape) e cada ilha recebe um canteiro de arbustos e, onde for suficientemente larga, uma árvore, tirada da lista de plantas. Depois disso, tudo é um objeto normal de Paisagem: edite-o, ou escolha **Traçar de novo** para substituir o que o parque criou. Remover o parque remove o que ele criou.

## A partir de um assistente

O mesmo parque pode ser pedido através do MCP: `parking_layout` pré-visualiza, `parking_build` escreve e `parking_remove` remove um parque. Peça pelo nome do lote ou envie o contorno.

## O que ainda não está implementado

Não se verifica se os corredores chegam a uma rua. O pavimento cobre todo o contorno, por isso a área do pavimento inclui as ilhas. Escolhas de material de pavimento da biblioteca e um tipo da biblioteca para os lugares ainda não estão implementados; o padrão do pavimento é o de Hardscape. As regras de outros países ainda não estão implementadas.
