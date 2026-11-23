---
title: WaterCraft: demandas, caudal de incendio, cortes e antigüidade da auga
summary: Co complemento WaterCraft, convirta os clientes en demandas nas súas condutas de auga, comprobe o caudal dispoñible en cada hidrante, vexa que corte de conduta prexudica máis e siga a antigüidade da auga e o cloro ao longo dun día.
keywords: watercraft, distribución de auga, demandas, clientes, factor de punta, patrón de demanda, caudal de incendio, hidrante, presión residual, criticidade, corte, sección con válvulas, antigüidade da auga, cloro, residual, traza de orixe, fondo de saco, csv, complemento
from: 066fb17a
---

WaterCraft é un complemento que funciona sobre a rede de auga que xa debuxou coas ferramentas de Condutas de auga. Engade unha lapela ao panel dereito con catro seccións.

:::warning
Só unha axuda para cálculos. Comprobouse contra respostas feitas a man en redes inventadas, non nunha rede real dunha empresa de auga. Un enxeñeiro de auga debe revisar cada resultado. Os escenarios, as regras de control, as válvulas e as lecturas de campo teñen temas propios, "Escenarios" e "Estudos", na axuda do complemento WaterCraft.
:::

## Que vai facer

- Poñer os clientes na rede como demandas.
- Atopar os hidrantes que quedan por baixo do caudal que precisa.
- Atopar as condutas cuxa perda importa máis.
- Atopar auga vella e cloro baixo.

## Pasos

1. Abra {{ui:Configuración}} › {{ui:Complementos}} e active {{ui:WaterCraft (distribución de auga)}}. Aparece unha lapela {{ui:WaterCraft}} no panel dereito.
2. Debuxe primeiro un depósito, nós e condutas coas ferramentas de Condutas de auga (véxase [Condutas de auga](topic:water-mains)). Sen unha rede, a lapela indícao.
3. En {{ui:Demandas}}, pegue un cliente por liña: identificador, x, y, tipo e cantidade. Escolla o {{ui:Factor de punta}} e o {{ui:Patrón horario}} (día residencial, día comercial, plano, ou manter o patrón tal como está). Prema {{ui:Revisar}} para ver onde cae cada cliente (o nó máis próximo), e despois {{ui:Pór na rede}}. {{ui:Desfacer}} retira as demandas.
4. En {{ui:Caudal de incendio}}, estableza o caudal necesario e a presión residual, escolla se a residual se mantén {{ui:Só no hidrante}} ou {{ui:En todo o sistema (máis estrito)}}, e prema {{ui:Percorrido}}. Cada hidrante lístase do peor ao mellor, como cumpre ou escaso.
5. En {{ui:Cal conduto importa máis}}, escolla {{ui:un tubo de cada vez}} ou {{ui:unha sección con válvulas de cada vez}} e prema {{ui:Percorrido}}. Cada corte amosa a demanda cortada, os nós cortados, os nós que caen por baixo da presión mínima e a presión máis baixa que queda.
6. En {{ui:Antigüidade da auga e cloro}}, escolla o que seguir (antigüidade da auga, cloro ou unha traza de orixe), estableza as horas de cálculo e os límites que queira, e prema {{ui:Percorrido}}. Lístanse os nós fóra dos seus límites.
7. Prema {{ui:Gardar como CSV}} debaixo de calquera táboa para conservala.

## Notas

- O caudal de incendio necesario e o consumo por vivenda ou por acre son valores iniciais, non normas. Use as cifras propias da súa empresa de auga.
- Unha conduta cortada en parte por unha válvula péchase enteira, así que o corte amosado é algo peor que un real.
- Deixe funcionar a sección de calidade da auga o tempo suficiente para que o patrón diario se repita antes de ler o último día.
- {{ui:Parar}} remata unha execución longa antes de tempo; a lista amosa entón só o feito.
- A súa rede queda neste proxecto e neste computador. Non se envía nada a ningún lugar.
