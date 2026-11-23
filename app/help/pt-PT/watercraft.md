---
title: WaterCraft: consumos, caudal de incêndio, interrupções e idade da água
summary: Com o suplemento WaterCraft, transforme clientes em consumos nas suas condutas de água, verifique o caudal disponível em cada hidrante, veja que conduta mais prejudica uma interrupção e acompanhe a idade da água e o cloro ao longo de um dia.
keywords: watercraft, distribuição de água, consumos, clientes, fator de ponta, padrão de consumo, caudal de incêndio, hidrante, pressão residual, criticidade, interrupção, troço com válvulas, idade da água, cloro, residual, rastreio de origem, ponta morta, csv, suplemento
from: 066fb17a
---

O WaterCraft é um suplemento que funciona sobre a rede de água que já desenhou com as ferramentas de Condutas de água. Acrescenta um separador ao painel da direita com quatro secções.

:::warning
Apenas uma ajuda de cálculo. Foi verificado contra respostas feitas à mão em redes fictícias, não num modelo real de uma entidade gestora. Um engenheiro de águas tem de verificar cada resultado. Cenários, regras de controlo, válvulas e leituras de campo têm os seus próprios tópicos, "Cenários" e "Estudos", na ajuda do suplemento WaterCraft.
:::

## O que vai fazer

- Coloque clientes na rede como consumos.
- Encontre os hidrantes que ficam aquém do caudal necessário.
- Encontre as condutas cuja perda mais importa.
- Encontre água antiga e cloro baixo.

## Passos

1. Abra {{ui:Definições}} › {{ui:Suplementos}} e ative {{ui:WaterCraft (distribuição de água)}}. Aparece um separador {{ui:WaterCraft}} no painel da direita.
2. Desenhe primeiro um reservatório, nós e tubos com as ferramentas de Condutas de água (veja [Condutas de água](topic:water-mains)). Sem rede, o separador indica que o deve fazer.
3. Em {{ui:Consumos}}, cole um cliente por linha: id, x, y, tipo, quantidade. Escolha o {{ui:Fator de ponta}} e o {{ui:Padrão horário}} (dia residencial, dia comercial, constante, ou manter o padrão tal como está). Prima {{ui:Verificar}} para ver onde cada cliente fica (o nó mais próximo) e depois {{ui:Colocar na rede}}. Anular retira os consumos.
4. Em {{ui:Caudal de incêndio}}, defina o caudal necessário e a pressão residual, escolha se a residual é mantida {{ui:Só no hidrante}} ou {{ui:Em todo o sistema (mais exigente)}}, e prima {{ui:Desenvolvimento em planta}}. Cada hidrante é listado do pior para o melhor, como cumpre ou fica aquém.
5. Em {{ui:Qual a conduta mais importante}}, escolha {{ui:um tubo de cada vez}} ou {{ui:um troço com válvulas de cada vez}} e prima {{ui:Desenvolvimento em planta}}. Cada interrupção mostra o consumo cortado, os nós cortados, os nós que passam a ficar abaixo da pressão mínima e a pressão mais baixa que resta.
6. Em {{ui:Idade da água e cloro}}, escolha o que seguir (idade da água, cloro ou rastreio de origem), defina as horas a simular e os limites que pretende, e prima {{ui:Desenvolvimento em planta}}. Os nós fora dos seus limites são listados.
7. Prima {{ui:Guardar como CSV}} sob qualquer tabela para a guardar.

## Notas

- O caudal de incêndio necessário e o consumo por habitação ou por acre são valores iniciais, não normas. Use os valores da sua entidade gestora.
- Um tubo parcialmente cortado por uma válvula é fechado por inteiro, pelo que a interrupção mostrada é ligeiramente pior do que uma real.
- Deixe correr a secção de qualidade da água o tempo suficiente para o padrão diário se repetir antes de ler o último dia.
- {{ui:Parar}} termina mais cedo uma simulação longa; a lista mostra então apenas o que foi feito.
- A sua rede fica neste projeto e neste computador. Nada é enviado para lado nenhum.
