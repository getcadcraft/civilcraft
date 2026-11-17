---
title: Laço de seleção de pontos de levantamento
summary: Segure Shift e arraste um contorno à mão livre ao redor dos pontos de levantamento para selecioná-los, como janela, cruzamento ou cerca; troque com Space enquanto arrasta. Um arraste reto ainda desenha uma caixa.
keywords: laço, mão livre, selecionar pontos, seleção, janela, cruzamento, cerca, space, polígono, seleção por caixa, arrastar com shift
from: 3dd4fcaa
---

## O que você vai aprender

Como selecionar pontos de levantamento desenhando ao redor deles, quando uma caixa levaria pontos que você não quer.

## Desenhar um laço

1. Clique em {{ui:Select}} (ou pressione {{key:V}}).
2. Segure {{key:Shift}}, pressione sobre a planta e arraste **em volta** dos pontos que quer, indo primeiro para a **direita**.
3. Solte.

Os pontos dentro do contorno são adicionados à seleção. Um arraste que se mantém perto de uma linha reta desenha uma caixa, como antes; assim que ele se afasta dessa linha (mais de cerca de 12 pixels), vira um laço.

## Janela, cruzamento e cerca

| Você arrasta | Laço | Seleciona |
|---|---|---|
| Para a direita primeiro | Janela (contorno contínuo) | Os pontos dentro dela |
| Para a esquerda primeiro | Cruzamento (tracejado, verde) | Os pontos dentro dela, e os pontos que o contorno toca |
| Pressione {{key:Space}} enquanto arrasta | Janela, depois cruzamento, depois cerca | Cerca (um caminho tracejado cor de laranja, não fechado): os pontos sobre os quais o caminho passa |

A linha de status indica o laço enquanto você arrasta. {{key:Esc}} enquanto arrasta cancela e não seleciona nada.

:::tip
Uma cerca é a maneira rápida de escolher os pontos ao longo de um meio-fio ou de uma linha de valeta: arraste sobre eles e solte.
:::

## Veja também

- [Selecionar, copiar e colar pontos de levantamento](topic:copy-paste-points)
- [Teclas e mouse](topic:keyboard)
