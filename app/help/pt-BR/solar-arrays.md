---
title: Dispor painéis solares no terreno
summary: Posicione mesas solares fixadas no solo dentro de um lote ou plataforma, com as fileiras espaçadas conforme o terreno em que cada uma realmente se apoia, o terreno íngreme deixado vazio, a energia do ano calculada e as mesas mostradas na planta e em 3D.
keywords: solar, fotovoltaico, PV, arranjo, montagem no solo, mesas, fileiras, espaçamento entre fileiras, sombra, terreno, declive, estacas, produção, kWp, energia, horizonte
from: 95593fd6
---

## O que você vai aprender

Como dispor um campo de mesas solares em um terreno que não é plano, e o que significam os números. Abra pelo caminho Superfície › Mais › Painéis solares.

## Dispor as mesas

1. Escolha **Onde**: um lote ou uma plataforma do projeto, ou digite os vértices de uma área. Marque os lotes ou plataformas que devem ficar **vazios** (uma edificação, um lago).
2. Digite a **latitude e a longitude** do terreno. O sol depende delas; nada é estimado. Se o projeto tiver um sistema de coordenadas, **Posicionar a partir do sistema de coordenadas** preenche esses campos.
3. Defina a inclinação, a orientação (em branco é em direção ao equador), quantos módulos formam uma mesa e a potência e o tamanho do módulo. Os valores iniciais do módulo são genéricos e estão identificados como tal; digite os seus.
4. Pressione **Dispor mesas**. A janela mostra o número de mesas e de módulos, o tamanho em kWp e a distância entre fileiras.

Cada mesa é uma coluna na área, posicionada a partir da frente e recuada em seguida. Uma mesa só é posicionada onde o terreno sob ela estiver dentro do limite de declive, dentro da área e do recuo, e onde as estacas de que ela precisa não forem mais altas que o limite definido. Os locais que não atendem ficam vazios, e a janela informa quantos são e por quê.

## Fileiras espaçadas conforme o terreno

Em terreno plano, as fileiras ficam separadas pela regra usual de não sombreamento: a sombra de uma fileira ao meio-dia do solstício de inverno não pode alcançar a borda inferior da fileira seguinte. Em um declive, o CivilCraft aplica a mesma regra ao terreno em que a próxima fileira realmente se apoia. Onde o terreno sobe atrás de uma mesa, as fileiras podem ficar mais próximas; onde ele desce, ficam mais afastadas. A janela mostra o espaçamento mínimo, o máximo e o médio, ao lado do espaçamento em terreno plano, para que você veja o efeito do relevo.

O plano de uma mesa é elevado sobre estacas até que cada amostra sob ela fique livre do terreno pela folga definida. A estaca mais alta aparece no resultado.

## A energia do ano

**Energia do ano** calcula a luz sobre o plano inclinado para um dia representativo de cada mês, a temperatura da célula, as perdas informadas, o sombreamento mútuo das mesas e o bloqueio do sol pelas colinas no horizonte. O céu é limpo, portanto o resultado é um limite superior; o clima real produz menos. É uma estimativa de projeto preliminar, não um relatório de produção.

## Salvar

**Salvar no projeto** guarda as entradas e os números no arquivo do projeto; as mesas são recalculadas a partir do terreno quando o arquivo é aberto, então uma superfície alterada as desloca. Elas aparecem na planta e em 3D (Mostrar › Painéis solares). A lista de mesas é baixada em CSV. Um passo de desfazer remove ou restaura um arranjo.

## Ainda não implementado

Dados meteorológicos no lugar do céu limpo, mesas que acompanham o terreno no sentido leste–oeste, rastreadores e o projeto elétrico (strings, fiação, inversores) no CivilCraft. O painel Solar PV do BimCraft tem strings e o diagrama unifilar para telhados.
