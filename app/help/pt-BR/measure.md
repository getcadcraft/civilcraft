---
title: Medir distâncias, áreas e declividades
summary: Meça no plano clicando em pontos — o comprimento e o rumo de cada lado, o total acumulado, o comprimento ao longo do terreno, a declividade, e a área e o perímetro de uma forma fechada — e entre dois pontos do perfil de uma linha de energia.
keywords: medir, medição, distância, comprimento, área, perímetro, rumo, declividade, inclinação, greide, régua, trena, ao longo do terreno, perfil, diferença de altura
from: d614eb25
---

{{ui:Surface}} › {{ui:More}} › {{ui:Measure}} (também no menu {{ui:More}} do espaço de trabalho Linhas de energia, ou pressione {{key:M}}) mede sem acrescentar nada ao projeto.

## No plano

1. Escolha {{ui:Measure}}, depois clique nos pontos. Um clique perto de um ponto topográfico assume a posição e a cota dele.
2. A linha de status mostra o número de pontos e o comprimento total, o comprimento e o rumo do último lado, a declividade onde o terreno é conhecido nas duas extremidades, e o comprimento ao longo do terreno. Ao lado do ponteiro, aparecem o lado que está sendo desenhado e o total acumulado.
3. Clique no primeiro ponto novamente para fechar a forma: a linha de status acrescenta a **área** e o **perímetro**. O próximo clique inicia uma nova medição.
4. {{key:Enter}} encerra a medição e mantém os números na linha de status; {{key:Backspace}} desfaz o último ponto; {{key:Esc}} limpa a medição, e {{key:Esc}} de novo volta para {{ui:Select}}.

Os comprimentos estão na unidade do projeto, e as áreas, na unidade quadrada correspondente. A declividade e o comprimento ao longo do terreno usam a superfície projetada, quando existe, senão o terreno existente; fora da superfície, esses valores são omitidos.

## No perfil de uma linha de energia

No [perfil da linha](topic:overhead-line#the-line-profile), {{ui:Measure}} na barra do perfil pede dois cliques e mostra a distância horizontal entre eles, a diferença de altura, a distância reta e a declividade. Um clique perto do terreno, do condutor ou do topo de uma estrutura se ajusta a esse ponto. Clique em {{ui:Measure}} de novo para parar.
