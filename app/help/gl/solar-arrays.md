---
title: Dispor campos solares no terreo
summary: Situar mesas solares montadas no terreo dentro dunha parcela ou plataforma, coas filas espazadas segundo o terreo que cada unha pisa de verdade, deixando baleiro o terreo empinado, calculando a enerxía do ano e amosando as mesas no plano e en 3D.
keywords: solar, fotovoltaica, PV, campo, montaxe no terreo, mesas, filas, espazamento entre filas, sombra, terreo, pendente, pilotes, produción, kWp, enerxía, horizonte
from: 95593fd6
---

## O que vai aprender

Como dispor un campo de mesas solares nun lugar que non é plano, e o que significan os números. Ábrao desde Superficie › Máis › Campos solares.

## Dispor as mesas

1. Escolla **Onde**: unha parcela ou unha plataforma do proxecto, ou escriba os vértices dunha área. Marque as plataformas ou parcelas que deben quedar **baleiras** (un edificio, unha lagoa).
2. Escriba a **latitude e lonxitude** do lugar. O sol depende delas; non se adiviña nada. Se o proxecto ten un sistema de coordenadas, **Situar desde o sistema de coordenadas** éncheas.
3. Estableza a inclinación, a orientación (en branco é cara ao ecuador), cantos módulos forman unha mesa e a potencia e o tamaño do módulo. Os valores dos módulos empezan como valores xenéricos e así están etiquetados; escriba os seus.
4. Prema **Dispor as mesas**. A xanela indica o número de mesas e módulos, o tamaño en kWp e a distancia de fila a fila.

Cada mesa é unha columna na área, colocada desde a dianteira e desprazada cara atrás. Unha mesa só se coloca onde o terreo baixo ela está dentro do límite de pendente, dentro da área e do retroceso, e onde os pilotes que necesita non son máis altos que o límite que fixou. Os lugares que non cumpren quedan baleiros, e a xanela indica cantos son e por que.

## As filas espazadas segundo o terreo

En terreo plano as filas se separan segundo a regra habitual de non sombra: a sombra dunha fila ao mediodía do solsticio de inverno non pode chegar ao bordo inferior da fila seguinte. Nunha pendente, CivilCraft aplica a mesma regra ao terreo no que se apoia realmente a fila seguinte. Onde o terreo sobe detrás dunha mesa, as filas poden estar máis xuntas; onde baixa, quedan máis separadas. A xanela mostra o espazamento máis pequeno, o máis grande e o medio, xunto ao espazamento en terreo plano, para ver o que fixo o terreo.

O plano dunha mesa énchese sobre pilotes ata que cada mostra baixo ela quede por riba do terreo coa folga que fixou. O pilote máis alto aparece no resultado.

## A enerxía do ano

**Enerxía anual** calcula a luz sobre o plano inclinado para un día representativo de cada mes, a temperatura da célula, as perdas escritas, as mesas que se fan sombra entre si e os outeiros do horizonte que quitan o sol que tapan. O ceo é un ceo despexado, así que a resposta é un límite superior; o tempo real dá menos. É unha estimación de deseño inicial, non un informe de produción.

## Gardalo

**Gardar no proxecto** conserva os datos e os números no ficheiro do proxecto; as mesas calcúlanse de novo a partir do terreo cando se abre o ficheiro, así que unha superficie modificada as move. Móstranse no plano e en 3D (Amosar › Campos solares). A lista de mesas descárgase en CSV. Un paso de desfacer elimina ou restaura un campo.

## Aínda non implementado

Datos meteorolóxicos no lugar do ceo despexado, mesas que seguen o terreo na dirección leste–oeste, seguidores e o deseño eléctrico (cadeas de módulos, cable, inversores) en CivilCraft. O panel Solar PV de BimCraft ten cadeas de módulos e o esquema unifilar para cubertas.
