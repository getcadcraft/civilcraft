---
title: "WaterCraft: demandas, vazão de incêndio, interrupções e idade da água"
summary: Com o complemento WaterCraft, transforme consumidores em demandas nas suas adutoras, verifique a vazão disponível em cada hidrante, veja qual interrupção de tubulação causa mais prejuízo, e acompanhe a idade da água e o cloro ao longo de um dia.
keywords: watercraft, distribuição de água, demandas, consumidores, coeficiente de pico, padrão de demanda, vazão de incêndio, hidrante, pressão residual, criticidade, interrupção, trecho com válvulas, idade da água, cloro, residual, rastreamento de origem, ponta seca, csv, complemento
from: 066fb17a
---

O WaterCraft é um complemento que trabalha na rede de água que você já desenhou com as ferramentas de Tubulações de água. Ele adiciona uma aba ao painel da direita, com quatro seções.

:::warning
Apenas uma ferramenta de cálculo. Ela foi conferida com respostas feitas à mão em redes fictícias, não em um modelo real de concessionária. Um engenheiro de água deve verificar cada resultado. Cenários, regras de controle, válvulas e leituras de campo têm seus próprios tópicos, "Cenários" e "Estudos", na ajuda do complemento WaterCraft.
:::

## O que você vai fazer

- Colocar consumidores na rede como demandas.
- Encontrar os hidrantes que ficam abaixo da vazão necessária.
- Encontrar as tubulações cuja perda mais importa.
- Encontrar água velha e cloro baixo.

## Passos

1. Abra {{ui:Settings}} › {{ui:Add-ons}} e ative {{ui:WaterCraft (distribuição de água)}}. Uma aba {{ui:WaterCraft}} aparece no painel da direita.
2. Desenhe primeiro um reservatório, nós e tubos com as ferramentas de Tubulações de água (veja [Tubulações de água](topic:water-mains)). Sem uma rede, a aba informa que você precisa fazer isso.
3. Em {{ui:Demands}}, cole um consumidor por linha: id, x, y, tipo, quantidade. Escolha o {{ui:Peaking factor}} e o {{ui:Hourly pattern}} (dia residencial, dia comercial, constante, ou manter o padrão como está). Pressione {{ui:Check}} para ver onde cada consumidor cai (o nó mais próximo) e depois {{ui:Put into the network}}. Desfazer retira as demandas.
4. Em {{ui:Fire flow}}, defina a vazão necessária e a pressão residual, escolha se a residual é mantida {{ui:At the hydrant only}} ou {{ui:Everywhere in the system (stricter)}}, e pressione {{ui:Run}}. Cada hidrante é listado do pior para o melhor, como atende ou está abaixo.
5. Em {{ui:Which main matters most}}, escolha {{ui:one pipe at a time}} ou {{ui:one valved section at a time}} e pressione {{ui:Run}}. Cada interrupção mostra a demanda cortada, os nós cortados, os nós que passam a ficar abaixo da pressão mínima e a menor pressão restante.
6. Em {{ui:Water age and chlorine}}, escolha o que acompanhar (idade da água, cloro ou rastreamento de origem), defina as horas a simular e os limites desejados, e pressione {{ui:Run}}. Os nós fora dos seus limites são listados.
7. Pressione {{ui:Save as CSV}} em qualquer tabela para guardá-la.

## Observações

- A vazão de incêndio necessária e o consumo por residência ou por acre são valores iniciais, não padrões. Use os números da sua concessionária.
- Um tubo cortado em parte por uma válvula é fechado por inteiro, então a interrupção mostrada é um pouco pior que a real.
- Rode a seção de qualidade da água por tempo suficiente para o padrão diário se repetir antes de ler o último dia.
- {{ui:Stop}} encerra uma execução longa antes; a lista então mostra apenas o que foi feito.
- Sua rede fica neste projeto e neste computador. Nada é enviado para lugar nenhum.
