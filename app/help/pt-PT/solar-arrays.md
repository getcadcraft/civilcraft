---
title: Dispor matrizes solares no terreno
summary: Colocar mesas solares montadas no solo dentro de um lote ou de uma plataforma, com as fileiras espaçadas para o terreno em que cada uma assenta de facto, deixar vazio o terreno íngreme, calcular a energia do ano e mostrar as mesas no plano e em 3D.
keywords: solar, pv, fotovoltaico, matriz, montagem no solo, mesas, fileiras, espaçamento entre fileiras, sombra, terreno, declive, estacas, produção, kWp, energia, horizonte
from: 95593fd6
---

## O que vai aprender

Como dispor um campo de mesas solares num local que não é plano, e o que significam os números. Abra-o a partir de Superfície › Mais › Matrizes solares.

## Dispor as mesas

1. Escolha **Onde**: um lote ou uma plataforma do projeto, ou escreva os vértices de uma área. Assinale quaisquer plataformas ou lotes que têm de ficar **vazios** (um edifício, uma lagoa).
2. Escreva a **latitude e a longitude** do local. O sol depende delas; nada é adivinhado. Se o projeto tiver um sistema de coordenadas, **Colocar a partir do sistema de coordenadas** preenche-as.
3. Defina a inclinação, a orientação (em branco é virada para o equador), quantos módulos formam uma mesa e a potência e o tamanho do módulo. Os valores dos módulos começam como valores genéricos e estão identificados como tal; escreva os seus.
4. Prima **Dispor mesas**. A janela indica o número de mesas e de módulos, o tamanho em kWp e a distância de fila a fila.

Cada mesa é uma coluna na área, colocada a partir da frente e recuada para trás. Uma mesa só é colocada onde o terreno sob ela está dentro do limite de declive, dentro da área e do recuo, e onde as estacas de que precisa não são mais altas do que o limite que definiu. Os locais que falham ficam vazios, e a janela indica quantos são e porquê.

## As fileiras são espaçadas para o terreno

Em terreno plano, as fileiras ficam afastadas pela regra habitual de não sombreamento: a sombra de uma fileira ao meio-dia do solstício de inverno não pode atingir a aresta inferior da fileira seguinte. Num declive, o CivilCraft aplica a mesma regra ao terreno em que a fileira seguinte assenta de facto. Onde o terreno sobe atrás de uma mesa, as fileiras podem ficar mais próximas; onde desce, ficam mais afastadas. A janela mostra o espaçamento mais curto, o mais longo e o médio, ao lado do espaçamento em terreno plano, para ver o efeito do relevo.

O plano de uma mesa é elevado sobre estacas até que cada amostra por baixo dele fique acima do terreno com a folga que definiu. A estaca mais alta aparece no resultado.

## A energia do ano

**Energia do ano** calcula a luz sobre o plano inclinado para um dia representativo de cada mês, a temperatura das células, as perdas introduzidas, o sombreamento mútuo das mesas e as colinas no horizonte que retiram o sol que escondem. O céu é limpo, por isso o resultado é um limite superior; o tempo real dá menos. É uma estimativa de projeto inicial, não um relatório de produção.

## Guardar

**Guardar no projeto** mantém os dados de entrada e os números no ficheiro do projeto; as mesas são recalculadas a partir do terreno quando o ficheiro abre, por isso uma superfície alterada desloca-as. Aparecem no plano e em 3D (Mostrar › Matrizes solares). A lista de mesas transfere-se em CSV. Um passo de anular remove ou repõe uma matriz.

## Ainda não implementado

Dados meteorológicos em vez do céu limpo, mesas que seguem o terreno na direção leste-oeste, seguidores e o projeto elétrico (strings, cabos, inversores) no CivilCraft. O painel Solar PV do BimCraft tem strings e o unifilar para coberturas.
