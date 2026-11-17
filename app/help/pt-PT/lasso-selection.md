---
title: Seleção por laço de pontos do levantamento
summary: Prima Shift e arraste um contorno à mão livre à volta dos pontos do levantamento para os selecionar, como janela, cruzamento ou vedação; mude com Space enquanto arrasta. Um arrasto reto continua a desenhar uma caixa.
keywords: laço, mão livre, selecionar pontos, seleção, janela, cruzamento, vedação, space, polígono, seleção por caixa, arrastar com shift
from: 3dd4fcaa
---

## Objetivo

Como selecionar pontos do levantamento desenhando à volta deles, quando uma caixa levaria pontos que não se pretendem.

## Desenhar um laço

1. Clique em {{ui:Selecionar}} (ou prima {{key:V}}).
2. Mantenha {{key:Shift}} premido, prima o botão do rato na planta e arraste **à volta** dos pontos que pretende, indo primeiro para a **direita**.
3. Largue.

Os pontos dentro do contorno são acrescentados à seleção. Um arrasto que se mantenha próximo de uma linha reta desenha uma caixa, como antes; assim que se afasta dessa linha (mais de cerca de 12 pixels), passa a ser um laço.

## Janela, cruzamento e vedação

| Ao arrastar | Laço | Seleciona |
|---|---|---|
| Primeiro para a direita | Janela (contorno contínuo) | Os pontos dentro dele |
| Primeiro para a esquerda | Cruzamento (a tracejado, verde) | Os pontos dentro dele, e os pontos que o contorno toca |
| Premir {{key:Space}} ao arrastar | Janela, depois cruzamento, depois vedação | Vedação (um caminho a tracejado cor de laranja, não fechado): os pontos sobre os quais o caminho passa |

A linha de estado indica o laço enquanto arrasta. {{key:Esc}} ao arrastar cancela-o e não seleciona nada.

:::tip
A vedação é a forma rápida de escolher os pontos ao longo de um lancil ou de uma valeta: arraste por cima deles e largue.
:::

## Ver também

- [Selecionar, copiar e colar pontos do levantamento](topic:copy-paste-points)
- [Teclas e rato](topic:keyboard)
