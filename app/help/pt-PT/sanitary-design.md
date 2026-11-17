---
title: Calcular os caudais de dimensionamento doméstico e verificar o coletor
summary: Introduza as pessoas e a área que entram em cada caixa de visita de uma rede doméstica; o CivilCraft soma-as rede abaixo, calcula o caudal de ponta com um fator de ponta e a infiltração, e verifica a capacidade e a velocidade de cada coletor.
keywords: doméstico, coletor, coletor doméstico, águas residuais, caudal de dimensionamento, caudal de ponta, fator de ponta, harmon, babbitt, infiltração, população, capitação, percentagem de enchimento, autolimpeza, velocidade, dimensionamento de coletores, folha de cálculo
from: 73ba197a
---

Os caudais de dimensionamento doméstico funcionam na [rede de coletores](topic:pipe-network) quando o seu {{ui:Tipo}} é {{ui:Doméstica}}. Sem nada selecionado, o painel da direita mostra então **Caudais de dimensionamento doméstico**, onde uma rede pluvial mostra a drenagem pluvial.

## Introduzir o que entra

1. Selecione uma caixa de visita. Em **Caudais de dimensionamento doméstico**, introduza as {{ui:Pessoas que entram aqui}} e a {{ui:Área que entra aqui}} (hectares num projeto métrico, acres num projeto em pés).
2. Para lojas, escritórios ou indústria, introduza pessoas equivalentes: a área vezes as pessoas por hectare (ou por acre) que a sua entidade usa. A área conta para a infiltração em ambos os casos.
3. Repita para cada caixa de visita onde se liga uma rua ou um lote. Uma caixa de visita onde nada se liga mantém ambos os valores em 0.

Cada coletor transporta tudo o que entra na sua caixa de visita de montante e acima dela. Selecione uma caixa de visita para ver o que passa por ela.

## As definições

| Definição | O que significa |
|---|---|
| {{ui:Capitação}} | o caudal médio de uma pessoa por dia: litros (projeto métrico) ou galões US (projeto em pés) |
| {{ui:Infiltração}} | água subterrânea que entra por fugas: litros por segundo por hectare, ou galões por dia por acre |
| {{ui:Fator de ponta}} | Harmon, 1 + 14 / (4 + √P), ou Babbitt, 5 / P^0.2, sendo P a população em milhares |
| {{ui:Fator de ponta no mínimo}} / {{ui:Fator de ponta no máximo}} | o fator fica entre estes dois valores |
| {{ui:n de Manning}} | para a capacidade e a velocidade |
| {{ui:Velocidade mínima}} / {{ui:Velocidade máxima}} | à altura de enchimento do próprio caudal de ponta no coletor |
| {{ui:Máximo da capacidade a secção cheia}} | quão cheio um coletor pode trabalhar no pico, em percentagem do que transporta a secção cheia |

Os valores iniciais são valores de referência, não uma norma. Use os valores que a sua entidade publica.

## O que calcula

Para cada coletor, por ordem de escoamento:

- caudal de ponta = pessoas × capitação × fator de ponta + área × infiltração
- capacidade a secção cheia (equação de Manning na inclinação do coletor) e o quanto o pico o enche
- a altura normal do caudal de ponta e a velocidade aí

A tabela **Resultados da rede doméstica** lista as pessoas, o fator de ponta, o caudal de ponta (L/s, ou gpm e pés cúbicos por segundo), a percentagem de enchimento e a velocidade de cada coletor. Os problemas aparecem por baixo: um coletor mais cheio do que o limite, mais lento do que a velocidade mínima (pode não se auto-limpar), mais rápido do que a máxima, ou sem queda. {{ui:Dimensionar os coletores para estes caudais}} escolhe, para cada coletor, a menor dimensão normalizada (200 mm ou 8 polegadas e acima) que transporta o seu pico dentro do limite; um {{key:Mod+Z}} anula-o.

:::note
Isto é o caudal de ponta permanente que uma folha de cálculo de dimensionamento calcula, verificado contra uma folha de cálculo publicada até ao arredondamento impresso. Não é um modelo do coletor ao longo do tempo: sem hidrogramas, armazenamento, bombas ou extravasores. Ver [Ainda não implementado](topic:not-built-yet).
:::

As velocidades usam a equação de Manning com o mesmo n em todas as alturas. Algumas entidades têm ábacos de enchimento parcial em que o n varia com a altura, o que dá uma velocidade ligeiramente menor num coletor a funcionar com 60 a 70 por cento de enchimento (cerca de 3 por cento menos).
