---
title: WaterCraft: consumos, caudal de incêndio, interrupções e idade da água
summary: Com o suplemento WaterCraft, transforme os clientes em consumos nas suas condutas de água, verifique o caudal disponível em cada hidrante, veja que interrupção de conduta tem mais impacto e acompanhe a idade da água e o cloro ao longo de um dia.
keywords: watercraft, distribuição de água, consumos, clientes, fator de ponta, padrão de consumo, caudal de incêndio, hidrante, pressão residual, criticidade, interrupção, secção com válvulas, idade da água, cloro, residual, rastreio de origem, extremidade cega, csv, suplemento
from: 76809f01
---

O WaterCraft é um suplemento que funciona sobre a rede de água que já desenhou com as ferramentas de condutas de água. Acrescenta ao painel da direita um separador com quatro secções.

:::warning
Apenas uma ajuda de cálculo. Foi verificado contra respostas feitas à mão em redes fictícias, não num modelo real de uma entidade gestora. Um engenheiro de águas tem de verificar cada resultado. Ainda não há estações elevatórias, nem decaimento de segunda ordem, nem cenários.
:::

## O que vai fazer

- Colocar os clientes na rede como consumos.
- Encontrar os hidrantes que ficam abaixo do caudal de que precisa.
- Encontrar as condutas cuja interrupção mais importa.
- Encontrar água antiga e cloro baixo.

## Passos

1. Abra {{ui:Definições}} › {{ui:Suplementos}} e ative {{ui:WaterCraft (distribuição de água)}}. Aparece um separador {{ui:WaterCraft}} no painel da direita.
2. Desenhe primeiro um reservatório, nós e tubos com as ferramentas de condutas de água (veja [Condutas de água](topic:water-mains)). Sem uma rede, o separador indica que é preciso fazê-lo antes.
3. Em {{ui:Consumos}}, cole um cliente por linha: id, x, y, tipo, quantidade. Escolha o {{ui:Fator de ponta}} e o {{ui:Padrão horário}} (dia residencial, dia comercial, constante, ou manter o padrão como está). Prima {{ui:Verificar}} para ver onde cai cada cliente (o nó mais próximo) e depois {{ui:Colocar na rede}}. {{ui:Anular}} retira os consumos.
4. Em {{ui:Caudal de incêndio}}, defina o caudal necessário e a pressão residual, escolha se a pressão residual é mantida {{ui:Só no hidrante}} ou {{ui:Em todo o sistema (mais exigente)}}, e prima {{ui:Executar}}. Cada hidrante aparece listado do pior para o melhor, indicado como «cumpre» ou «insuficiente».
5. Em {{ui:Qual a conduta mais importante}}, escolha {{ui:um tubo de cada vez}} ou {{ui:uma secção com válvulas de cada vez}} e prima {{ui:Executar}}. Cada interrupção mostra o consumo cortado, os nós cortados, os nós que passam a ficar abaixo da pressão mínima e a pressão mais baixa que resta.
6. Em {{ui:Idade da água e cloro}}, escolha o que acompanhar (idade da água, cloro ou um rastreio de origem), defina as horas a simular e os limites pretendidos, e prima {{ui:Executar}}. Os nós fora dos seus limites são listados.
7. Prima {{ui:Guardar como CSV}} em qualquer tabela para a guardar.

## Notas

- O caudal de incêndio necessário e o consumo por habitação ou por acre são valores de partida, não normas. Use os valores da sua entidade gestora.
- Uma conduta cortada parcialmente por uma válvula é fechada por inteiro, pelo que a interrupção mostrada é ligeiramente pior do que uma real.
- Deixe correr a secção de qualidade da água tempo suficiente para o padrão diário se repetir antes de ler o último dia.
- {{ui:Parar}} termina mais cedo uma execução longa; a lista mostra então apenas o que foi feito.
- A sua rede fica neste projeto e neste computador. Nada é enviado para lado nenhum.
