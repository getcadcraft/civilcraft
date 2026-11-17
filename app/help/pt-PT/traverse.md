---
title: Introduzir uma poligonal e ajustá-la pela regra de Bowditch
summary: Introduzir os ângulos de campo ou os rumos e as distâncias, verificar o erro de fecho angular e linear e a precisão, ajustar pela regra de Bowditch e acrescentar as estações como pontos topográficos ou o circuito como lote (parcela).
keywords: poligonal, poligonal fechada, circuito, ângulos à direita, ré, rumos, distâncias, fecho, erro de fecho, precisão, regra de Bowditch, ajustamento, levantamento
from: 56ce5a8c
---

Uma poligonal é uma sucessão de lanços medidos: em cada estação, um ângulo (ou um rumo) e uma distância até à seguinte. Clique em **Introduzir uma poligonal** em **Poligonal** no painel direito quando nada estiver selecionado.

## Onde começa e onde termina

1. **Começar no ponto topográfico**: o respetivo número. Ou introduza uma coordenada norte e uma coordenada este.
2. **Lanços como**: **Ângulos à direita e distâncias**, ou **Rumos e distâncias**.
3. Com ângulos, indique de onde partem: um **Ponto topográfico de ré**, ou **o seu azimute** (da primeira estação para a ré, no sentido horário a partir do norte).
4. **Termina**: **de volta ao início (um circuito)**, ou **em ponto topográfico** e o respetivo número (uma poligonal aberta entre pontos conhecidos).

## Introduzir os lanços

Um lanço por linha, depois a distância, depois um nome para a estação a que chega, se quiser:

- Ângulos à direita, medidos no sentido horário na estação de onde o lanço parte, da estação de trás para a seguinte: `270°00'10" 125.50 B`. `270-00-10`, `270 00 10` e `270.0028` também funcionam.
- Rumos: `N 45°30'15" E 125.50 B`, ou um azimute numa só palavra: `AZ 45-30-15 125.50 B`.
- Num circuito com ângulos, termine com `close` e com o ângulo do início de novo, medido da última estação para a segunda: `close 270°00'05"`. É isso que verifica os ângulos.

As linhas que não se conseguem ler são listadas com os respetivos números de linha. "feet", as vírgulas e as linhas de comentário com `#` são aceites.

## Ler o erro de fecho

À medida que introduz os dados, a caixa de diálogo mostra:

- **Erro de fecho angular**: a distância dos ângulos ao fecho, e a parte que cabe a cada ângulo. Sem ângulo de fecho, os ângulos não são verificados, e qualquer erro neles aparece no erro de fecho linear.
- **Erro de fecho linear**: a distância entre onde a poligonal termina e onde deveria terminar, e em que direção.
- **Precisão**: o comprimento da poligonal dividido pelo erro de fecho linear: 1 : 10,000 significa 1 ft em 10,000 ft.
- As estações depois do ajustamento, e quanto se deslocou cada uma.

## O ajustamento

Primeiro, o erro de fecho angular é distribuído igualmente pelos ângulos. Depois, o erro de fecho linear é distribuído pelos lanços pela regra de Bowditch: cada estação desloca-se contra o erro de fecho, em proporção ao comprimento percorrido até chegar a ela, de modo que a poligonal termina exatamente onde deve.

:::note
A regra de Bowditch é um ajustamento padrão, não por mínimos quadrados, e não pondera ângulos contra distâncias. Se a precisão é suficiente, cabe às suas próprias normas e às da sua jurisdição decidir.
:::

## Usar o resultado

- **Acrescentar como pontos topográficos**: as estações ajustadas tornam-se pontos topográficos com os nomes que indicou (senão, os números livres seguintes), com a descrição `TRAV` e sem cota. A última estação de um circuito é o início, por isso não é acrescentada duas vezes. Um passo: {{key:Mod+Z}} anula-o.
- **Acrescentar como lote** (circuitos): as estações ajustadas tornam-se um [lote (parcela)](topic:parcels), com as respetivas etiquetas e descrição legal.
- **Relatório (CSV)**: as linhas de fecho, depois a direção, a distância, as coordenadas sem ajuste e ajustadas e as correções de cada estação.
