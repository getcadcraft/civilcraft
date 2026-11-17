---
title: Inserir uma poligonal e ajustá-la pela regra da bússola
summary: Digite os ângulos ou rumos e as distâncias, verifique o erro angular e linear de fechamento e a precisão, ajuste pela regra da bússola e adicione as estações como pontos de levantamento ou o laço como lote.
keywords: poligonal, poligonal fechada, laço, ângulos à direita, visada à ré, rumos, distâncias, fechamento, erro de fechamento, precisão, regra da bússola, bowditch, ajuste, levantamento
from: 56ce5a8c
---

Uma poligonal é uma sequência de lados medidos: em cada estação, um ângulo (ou um rumo) e uma distância até a próxima. Clique em **Inserir uma poligonal** em **Poligonal** no painel direito quando nada estiver selecionado.

## Onde começa e termina

1. **Começar no ponto de levantamento**: o número dele. Ou digite uma coordenada Norte e Leste.
2. **Lados como**: **Ângulos à direita e distâncias**, ou **Rumos e distâncias**.
3. Com ângulos, indique de onde eles partem: um **Ponto de levantamento de ré**, ou **o azimute dele** (da primeira estação em direção à ré, no sentido horário a partir do Norte).
4. **Fim**: **de volta ao início (um laço)**, ou **em ponto de levantamento** e o número dele (uma poligonal aberta entre pontos conhecidos).

## Digite os lados

Um lado por linha: primeiro o ângulo (ou rumo), depois a distância e, se quiser, um nome para a estação que ele alcança:

- Ângulos à direita, medidos no sentido horário na estação de onde o lado parte, da estação de ré para a seguinte: `270°00'10" 125.50 B`. `270-00-10`, `270 00 10` e `270.0028` também funcionam.
- Rumos: `N 45°30'15" E 125.50 B`, ou um azimute em uma palavra só: `AZ 45-30-15 125.50 B`.
- Em um laço com ângulos, termine com `close` e o ângulo do início de novo, medido da última estação para a segunda: `close 270°00'05"`. É isso que verifica os ângulos.

As linhas que não puderem ser lidas são listadas com os números delas. "feet", vírgulas e linhas de comentário com `#` são aceitos.

## Leia o fechamento

Enquanto você digita, a caixa de diálogo mostra:

- **Erro angular de fechamento**: quanto os ângulos estão do fechamento, e a parcela que cada ângulo recebe. Sem um ângulo de fechamento, os ângulos não são verificados, e qualquer erro neles aparece no erro linear de fechamento.
- **Erro linear de fechamento**: a que distância do ponto onde deveria terminar a poligonal ela termina, e em que direção.
- **Precisão**: o comprimento da poligonal dividido pelo erro linear de fechamento: 1 : 10,000 significa 1 ft em 10,000 ft.
- As estações depois do ajuste, e o quanto cada uma se deslocou.

## O ajuste

Primeiro, o erro angular de fechamento é distribuído igualmente entre os ângulos. Depois, o erro linear de fechamento é distribuído pelos lados pela regra da bússola (Bowditch): cada estação se desloca contra o erro na proporção do comprimento percorrido até ela, de modo que a poligonal termina exatamente onde deveria.

:::note
A regra da bússola é um ajuste padrão, não por mínimos quadrados, e não pondera ângulos contra distâncias. Se a precisão é suficiente cabe às suas normas e às da sua jurisdição definir.
:::

## Use o resultado

- **Adicionar como pontos de levantamento**: as estações ajustadas viram pontos de levantamento com os nomes que você deu (senão, os próximos números livres), descrição `TRAV`, sem cota. A última estação de um laço é o início dele, então não é adicionada duas vezes. Um passo: {{key:Mod+Z}} desfaz.
- **Adicionar como lote** (laços): as estações ajustadas viram um [lote](topic:parcels), com seus rótulos e a descrição legal.
- **Relatório (CSV)**: as linhas de fechamento, depois o rumo, a distância, as coordenadas sem ajuste e ajustadas e as correções de cada estação.
