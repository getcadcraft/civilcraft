---
title: Trajetórias de giro de veículos
summary: Conduza um veículo com até três reboques ao longo de uma linha de feição ou de um alinhamento, para frente ou em marcha à ré, e veja a área que ele varre, as trajetórias das rodas, o esterçamento e onde ele se dobra.
keywords: trajetória de giro, trajetória de veículo, rastreamento de veículo, gabarito de giro, veículo de projeto, caminhão, ônibus, reboque, semirreboque, marcha à ré, dar ré, dobrar-se (jackknife), articulação, limite de esterçamento, offtracking, trajetória da roda, doca de carga, raio de giro
from: 8caafb8a
---

Uma trajetória de giro conduz um veículo ao longo de uma linha e mostra o terreno que seu corpo percorre. Use-a para verificar se um caminhão consegue fazer uma curva, alcançar uma doca de carga ou dar ré com um reboque até o lugar sem sair do pavimento.

## Conduzir um veículo ao longo de uma linha

1. Desenhe a linha que o veículo segue, no sentido do deslocamento: uma linha de feição (arcos são aceitos: pressione {{key:C}} enquanto a desenha, veja [Linhas de feição](topic:feature-lines)) ou um alinhamento.
2. Selecione-a e clique em {{ui:Trajetória de giro…}} em suas **Propriedades**.
3. Em **Partir de**, escolha um veículo e depois defina suas dimensões pelo seu próprio veículo de projeto: largura, balanço dianteiro, entre-eixos, balanço traseiro, bitola e **Limite de esterçamento**. Adicione até três reboques, cada um com onde está engatado, seu comprimento do engate até o eixo, seus balanços e sua **Maior articulação**.
4. Escolha o **Sentido**: para frente ou marcha à ré. Clique em {{ui:Percorrer}}.

:::warning
Os veículos de partida são valores provisórios, não um padrão. Defina as dimensões a partir do veículo de projeto que seu projeto usa.
:::

## Para frente e em marcha à ré

| Sentido | O que segue a linha | O que o CivilCraft calcula |
|---|---|---|
| **Para frente** | O centro do eixo dianteiro | Onde ficam o eixo traseiro e cada reboque, o ângulo de esterçamento e a articulação |
| **Marcha à ré** | O centro do último eixo (a traseira do reboque) | Onde cada unidade à frente vai, e o esterçamento que a cabine precisa para colocar o reboque ali |

Marcha à ré é a forma de verificar uma manobra de ré: diga onde o reboque deve ficar, e o CivilCraft informa se a cabine consegue fazê-lo.

## Ler o resultado

A trajetória de giro é desenhada na planta em laranja: seu contorno e, tracejadas, as trajetórias das rodas mais externas. Selecione-a (clique dentro dela) para ver nas **Propriedades**:

- **Comprimento percorrido**, o maior ângulo de **Esterçamento** e a **Articulação** em relação aos seus limites, e a **Área varrida**.
- Qualquer problema ao longo da linha, com sua distância: o esterçamento além do limite, ou um reboque girando além do limite de articulação (ele se dobra).
- **O veículo ao longo da linha**: mova o controle deslizante para ver o veículo em qualquer ponto, com seu esterçamento e articulação ali.

Altere a linha e a trajetória de giro acompanha. {{ui:Editar o veículo…}} altera as dimensões; **Sentido** alterna entre para frente e marcha à ré. Cada alteração é um passo: {{key:Mod+Z}} desfaz. {{key:Delete}} exclui a trajetória de giro selecionada (a linha permanece).

O contorno e as trajetórias das rodas vão para o PDF, DXF e DWG na camada C-ROAD-SWPT.

## Como é calculado

Cada unidade gira em torno da linha do seu eixo traseiro e é arrastada pelo ponto à sua frente (o eixo dianteiro, ou o engate), o modelo de baixa velocidade e sem deslizamento que as verificações de trajetória de giro usam. A área varrida é a união dos contornos do corpo em todas as posições. Não modela velocidade, deslizamento dos pneus, o tempo que a direção leva para girar, reboques esterçados nem a folga sob a carroceria.
