---
title: Calcular as vazões de projeto de esgoto sanitário e verificar o coletor
summary: Informe as pessoas e a área que entram em cada poço de visita de uma rede sanitária; o CivilCraft as soma ao longo da rede, calcula a vazão de pico com um coeficiente de pico e infiltração, e verifica a capacidade e a velocidade de cada tubo.
keywords: sanitário, esgoto, coletor sanitário, águas residuais, vazão de projeto, vazão de pico, coeficiente de pico, harmon, babbitt, infiltração, população, per capita, percentual de enchimento, autolimpante, velocidade, dimensionamento de tubos, planilha de cálculo
from: 73ba197a
---

As vazões de projeto de esgoto sanitário funcionam na [rede de tubos](topic:pipe-network) quando o seu {{ui:Type}} é {{ui:Sanitary}}. Sem nada selecionado, o painel da direita mostra então **Vazões de projeto de esgoto sanitário**, onde uma rede de drenagem pluvial mostra a drenagem pluvial.

## Informar o que entra

1. Selecione um poço de visita. Em **Vazões de projeto de esgoto sanitário**, digite a {{ui:People entering here}} e a {{ui:Area entering here}} (hectares em um projeto métrico, acres em um projeto em pés).
2. Para lojas, escritórios ou indústrias, digite as pessoas equivalentes: a área multiplicada pelas pessoas por hectare (ou por acre) que a sua agência usa. A área conta para a infiltração de qualquer forma.
3. Repita para cada poço de visita onde uma rua ou um lote se conecta. Um poço de visita onde nada se conecta mantém os dois valores em 0.

Cada tubo transporta tudo o que entra no seu poço de visita de montante e a partir dele. Selecione um poço de visita para ver o que passa por ele.

## As configurações

| Configuração | O que significa |
|---|---|
| {{ui:Flow per person}} | a vazão média de uma pessoa por dia: litros (projeto métrico) ou galões americanos (projeto em pés) |
| {{ui:Infiltration}} | água subterrânea que vaza para dentro: litros por segundo por hectare, ou galões por dia por acre |
| {{ui:Peaking factor}} | Harmon, 1 + 14 / (4 + √P), ou Babbitt, 5 / P^0,2, com P a população em milhares |
| {{ui:Peaking factor at least}} / {{ui:Peaking factor at most}} | o coeficiente fica entre esses dois valores |
| {{ui:Manning n}} | para capacidade e velocidade |
| {{ui:Least velocity}} / {{ui:Most velocity}} | na altura do próprio escoamento de pico no tubo |
| {{ui:Most of full capacity}} | o quanto um tubo pode ficar cheio no pico, como percentual do que transporta escoando a seção plena |

Os valores iniciais são provisórios, não uma norma. Use os valores que a sua agência publica.

## O que é calculado

Para cada tubo, na ordem do escoamento:

- vazão de pico = pessoas × vazão por pessoa × coeficiente de pico + área × infiltração
- capacidade a seção plena (equação de Manning na declividade do tubo) e o quanto o pico o preenche
- a altura normal da vazão de pico e a velocidade ali

A tabela **Resultados de esgoto sanitário** lista, para cada tubo, as pessoas, o coeficiente de pico, a vazão de pico (L/s, ou gpm e pés cúbicos por segundo), o percentual de enchimento e a velocidade. Os problemas aparecem abaixo dela: um tubo mais cheio que o limite, mais lento que a velocidade mínima (ele pode não se autolimpar), mais rápido que a máxima, ou sem queda. {{ui:Size the pipes for these flows}} escolhe, para cada tubo, o menor diâmetro padrão (200 mm ou 8 polegadas e acima) que transporta o seu pico dentro do limite; um {{key:Mod+Z}} desfaz.

:::note
Isto é a vazão de pico permanente que uma planilha de dimensionamento calcula, conferida contra uma planilha publicada até o arredondamento impresso. Não é um modelo do coletor ao longo do tempo: sem hidrogramas, armazenamento, bombas nem extravasores. Veja [Ainda não implementado](topic:not-built-yet).
:::

As velocidades usam a equação de Manning com o mesmo n em todas as alturas. Algumas tabelas de seção parcialmente cheia das agências deixam o n variar com a altura, o que dá uma velocidade um pouco menor em um tubo que escoa com 60 a 70 por cento de enchimento (cerca de 3 por cento a menos).
