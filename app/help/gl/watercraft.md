---
title: WaterCraft: demandas, caudal de incendio, cortes e idade da auga
summary: Co complemento WaterCraft, convirta os clientes en demandas nos seus condutos de auga, comprobe o caudal dispoñible en cada hidrante, vexa que corte de conduto afecta máis e siga a idade da auga e o cloro ao longo dun día.
keywords: watercraft, distribución de auga, demandas, clientes, factor de punta, patrón de demanda, caudal de incendio, hidrante, presión residual, criticidade, corte, tramo con válvulas, idade da auga, cloro, residual, rastrexo de orixe, cul de saco, csv, complemento
from: 76809f01
---

WaterCraft é un complemento que funciona sobre a rede de auga que xa debuxou coas ferramentas de condutos de auga. Engade unha lapela ao panel da dereita, con catro seccións.

:::warning
Só é unha axuda para o cálculo. Foi comprobada con respostas feitas á man en redes inventadas, non nun modelo real dunha empresa de auga. Un técnico en auga debe comprobar cada resultado. Aínda non hai estacións de reforzo de presión, nin decaemento de segunda orde, nin escenarios.
:::

## O que fará

- Poña os clientes na rede como demandas.
- Atope os hidrantes que non alcanzan o caudal que necesita.
- Atope os condutos cuxa perda importa máis.
- Atope auga antiga e cloro baixo.

## Pasos

1. Abra {{ui:Settings}} › {{ui:Add-ons}} e active {{ui:WaterCraft (distribución de auga)}}. Aparece unha lapela {{ui:WaterCraft}} no panel da dereita.
2. Debuxe primeiro un depósito, nós e tubaxes coas ferramentas de condutos de auga (vexa [Condutos de auga](topic:water-mains)). Sen unha rede, a lapela indícao.
3. En {{ui:Demandas}}, pegue un cliente por liña: id, x, y, tipo, cantidade. Escolla o {{ui:Peaking factor}} e o {{ui:Patrón horario}} (día residencial, día comercial, plano, ou manter o patrón tal como está). Prema {{ui:Check}} para ver onde cae cada cliente (o nó máis próximo) e despois {{ui:Put into the network}}. Desfacer retira as demandas.
4. En {{ui:Fire flow}}, indique o caudal necesario e a presión residual, escolla se a presión residual se mantén {{ui:At the hydrant only}} ou {{ui:Everywhere in the system (stricter)}}, e prema {{ui:Run}}. Cada hidrante aparece listado, primeiro o peor caso, como «cumpre» ou «non chega».
5. En {{ui:Which main matters most}}, escolla {{ui:one pipe at a time}} ou {{ui:one valved section at a time}} e prema {{ui:Run}}. Cada corte mostra a demanda cortada, os nós cortados, os nós que quedan por baixo da presión mínima e a presión máis baixa que queda.
6. En {{ui:Water age and chlorine}}, escolla o que quere seguir (idade da auga, cloro ou rastrexo de orixe), indique as horas que se executan e os límites que desexa, e prema {{ui:Run}}. Lístanse os nós que quedan fóra dos seus límites.
7. Prema {{ui:Save as CSV}} en calquera táboa para conservala.

## Notas

- O caudal de incendio necesario e o consumo por vivenda ou por acre son valores de partida, non normas. Use as cifras propias da súa empresa de auga.
- Un tubo cortado en parte por unha válvula péchase enteiro, así que o corte mostrado é un pouco peor que un real.
- Execute a sección de calidade da auga o tempo suficiente para que o patrón diario se repita antes de ler o último día.
- {{ui:Stop}} remata unha execución longa antes de tempo; a lista mostra entón só o que se fixo.
- A súa rede queda neste proxecto e neste ordenador. Non se envía nada a ningún sitio.
