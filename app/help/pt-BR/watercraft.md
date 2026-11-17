---
title: WaterCraft: demandas, vazão de incêndio, interrupções e idade da água
summary: Com o complemento WaterCraft, transforme clientes em demandas nas suas redes de distribuição de água, verifique a vazão disponível em cada hidrante, veja qual interrupção de trecho prejudica mais e acompanhe a idade da água e o cloro ao longo de um dia.
keywords: watercraft, distribuição de água, demandas, clientes, coeficiente de pico, padrão de demanda, vazão de incêndio, hidrante, pressão residual, criticidade, interrupção, setor com registro, idade da água, cloro, residual, rastreamento de origem, trecho sem saída, csv, complemento
from: 76809f01
---

WaterCraft é um complemento que trabalha sobre a rede de água que você já desenhou com as ferramentas de Redes de água. Ele adiciona uma guia ao painel da direita, com quatro seções.

:::warning
Apenas uma ferramenta de cálculo. Ela foi conferida com respostas feitas à mão em redes fictícias, não em um modelo real de concessionária. Um engenheiro de água deve verificar cada resultado. Ainda não há estações de reforço, decaimento de segunda ordem nem cenários.
:::

## O que você vai fazer

- Colocar clientes na rede como demandas.
- Encontrar os hidrantes que ficam abaixo da vazão necessária.
- Encontrar os trechos cuja perda mais importa.
- Encontrar água velha e cloro baixo.

## Passos

1. Abra {{ui:Configurações}} › {{ui:Complementos}} e ative {{ui:WaterCraft (distribuição de água)}}. Uma guia {{ui:WaterCraft}} aparece no painel da direita.
2. Desenhe primeiro um reservatório, nós e tubulações com as ferramentas de Redes de água (veja [Redes de água](topic:water-mains)). Sem uma rede, a guia avisa que você precisa fazer isso.
3. Em {{ui:Demandas}}, cole um cliente por linha: id, x, y, tipo, quantidade. Escolha o {{ui:Coeficiente de pico}} e o {{ui:Padrão horário}} ({{ui:dia residencial}}, {{ui:dia comercial}}, {{ui:constante}}, ou manter o padrão atual). Pressione {{ui:Verificar}} para ver onde cada cliente cai (o nó mais próximo) e depois {{ui:Colocar na rede}}. {{ui:Desfazer}} remove as demandas.
4. Em {{ui:Vazão de incêndio}}, defina a vazão necessária e a pressão residual, escolha se a pressão residual é mantida {{ui:Somente no hidrante}} ou {{ui:Em todo o sistema (mais rigoroso)}}, e pressione {{ui:Projeção horizontal}}. Cada hidrante aparece na lista do pior para o melhor, como atende ou fica abaixo.
5. Em {{ui:Qual trecho importa mais}}, escolha {{ui:um trecho por vez}} ou {{ui:um setor com registro por vez}} e pressione {{ui:Projeção horizontal}}. Cada interrupção mostra a demanda cortada, os nós cortados, os nós que passam a ficar abaixo da pressão mínima e a menor pressão restante.
6. Em {{ui:Idade da água e cloro}}, escolha o que acompanhar (idade da água, cloro ou rastreamento de origem), defina as horas a simular e os limites que quiser, e pressione {{ui:Projeção horizontal}}. Os nós fora dos seus limites são listados.
7. Pressione {{ui:Salvar como CSV}} em qualquer tabela para guardá-la.

## Notas

- A vazão de incêndio necessária e o consumo por casa ou por acre são valores iniciais, não normas. Use os números da sua concessionária.
- Um trecho cortado parcialmente por um registro é considerado fechado por inteiro, então a interrupção mostrada é um pouco pior do que uma real.
- Execute a seção de qualidade da água por tempo suficiente para que o padrão diário se repita antes de ler o último dia.
- {{ui:Parar}} encerra uma execução longa antes do fim; a lista então mostra apenas o que foi feito.
- Sua rede permanece neste projeto e neste computador. Nada é enviado para lugar nenhum.
