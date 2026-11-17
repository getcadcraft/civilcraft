---
title: Trajetórias de viragem de veículos
summary: Conduzir um veículo com até três reboques ao longo de uma linha característica ou de uma diretriz, em frente ou em marcha-atrás, e ver a área que varre, as trajetórias das rodas, a direção e onde se dobra (jackknife).
keywords: trajetória de viragem, trajetória, rastreio de veículos, gabarito de viragem, veículo de projeto, camião, autocarro, reboque, semirreboque, marcha-atrás, recuo, jackknife, articulação, bloqueio da direção, desvio de trajetória, trajetória das rodas, cais de carga, raio de viragem
from: 8caafb8a
---

Uma trajetória de viragem conduz um veículo ao longo de uma linha e mostra o terreno sobre o qual passa o seu corpo. Use-a para verificar se um camião consegue fazer uma curva, chegar a um cais de carga ou recuar um reboque até à posição sem sair do pavimento.

## Conduzir um veículo ao longo de uma linha

1. Desenhe a linha que o veículo segue, no sentido de marcha: uma linha característica (os arcos são aceites: prima {{key:C}} enquanto a desenha, ver [Linhas características](topic:feature-lines)) ou uma diretriz.
2. Selecione-a e clique em {{ui:Trajetória de viragem…}} nas suas **Propriedades**.
3. Em **Começar a partir de**, escolha um veículo e depois defina as suas dimensões a partir do seu próprio veículo de projeto: largura, porte dianteiro, distância entre eixos, porte traseiro, bitola e **Bloqueio da direção**. Acrescente até três reboques, cada um com o sítio onde está engatado, o seu comprimento desde o engate até ao eixo, os seus portes e a sua **Articulação máxima**.
4. Escolha **Condução**: em frente ou em marcha-atrás. Clique em {{ui:Percorrer}}.

:::warning
Os veículos de partida são valores de referência, não uma norma. Defina as dimensões a partir do veículo de projeto que o seu projeto usa.
:::

## Em frente e em marcha-atrás

| Condução | O que segue a linha | O que o CivilCraft calcula |
|---|---|---|
| **Em frente** | O centro do eixo dianteiro | Onde vão o eixo traseiro e cada reboque, o ângulo de direção e a articulação |
| **Marcha-atrás** | O centro do último eixo (a traseira do reboque) | Onde vai cada unidade à frente, e a direção que a cabine precisa para pôr o reboque ali |

A marcha-atrás é a forma de verificar uma manobra de recuo: indique onde o reboque deve ficar, e o CivilCraft diz se a cabine consegue fazê-lo.

## Ler o resultado

A trajetória de viragem é desenhada no plano a laranja: o seu contorno e, a tracejado, as trajetórias das rodas exteriores. Selecione-a (clique dentro dela) para ver nas **Propriedades**:

- **Comprimento percorrido**, o ângulo máximo de **Direção** e a **Articulação** face aos seus limites, e a **Área varrida**.
- Qualquer problema ao longo da linha, com a sua distância: a direção para além do bloqueio, ou um reboque a rodar para além do seu limite de articulação (dobra-se, jackknife).
- **O veículo ao longo da linha**: mova o cursor para ver o veículo em qualquer ponto, com a sua direção e articulação nesse ponto.

Altere a linha e a trajetória de viragem acompanha-a. {{ui:Editar o veículo…}} altera as dimensões; **Condução** alterna entre em frente e marcha-atrás. Cada alteração é um passo: {{key:Mod+Z}} anula-a. {{key:Delete}} elimina a trajetória de viragem selecionada (a linha mantém-se).

O contorno e as trajetórias das rodas passam para o PDF, DXF e DWG na camada C-ROAD-SWPT.

## Como é calculado

Cada unidade roda em torno da linha do seu eixo traseiro e é arrastada pelo ponto à frente dela (o eixo dianteiro, ou o engate), o modelo de baixa velocidade sem derrapagem que as verificações de trajetória de viragem usam. A área varrida é a soma dos contornos do corpo em todas as posições. Não modela a velocidade, o deslizamento dos pneus, o tempo que a direção demora a rodar, reboques com direção nem a folga por baixo da carroçaria.
