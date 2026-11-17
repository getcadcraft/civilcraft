---
title: Medir distâncias, áreas e declives
summary: Meça na planta clicando em pontos — o comprimento e o rumo de cada lado, o total acumulado, o comprimento ao longo do terreno, o declive, e a área e o perímetro de uma forma fechada — e entre dois pontos do perfil de uma linha elétrica aérea.
keywords: medir, medição, distância, comprimento, área, perímetro, rumo, declive, rasante, régua, fita, ao longo do terreno, perfil, diferença de altura
from: d614eb25
---

{{ui:Superfície}} › {{ui:Mais}} › {{ui:Medir}} (também no menu {{ui:Mais}} do espaço de trabalho Linhas elétricas aéreas, ou prima {{key:M}}) mede sem acrescentar nada ao projeto.

## Na planta

1. Escolha {{ui:Medir}} e clique nos pontos. Um clique perto de um ponto de levantamento toma a sua posição e cota.
2. A linha de estado indica o número de pontos e o comprimento total, o comprimento e o rumo do último lado, o seu declive quando o terreno é conhecido em ambas as extremidades, e o comprimento ao longo do terreno. Junto ao ponteiro, o lado a desenhar e o total acumulado.
3. Clique de novo no primeiro ponto para fechar a forma: a linha de estado acrescenta a sua **área** e o **perímetro**. O clique seguinte inicia uma nova medição.
4. {{key:Enter}} termina a medição e mantém os seus valores na linha de estado; {{key:Backspace}} retira o último ponto; {{key:Esc}} limpa-a, e {{key:Esc}} de novo volta a {{ui:Selecionar}}.

Os comprimentos estão na unidade do projeto e as áreas na sua unidade quadrada. O declive e o comprimento ao longo do terreno usam a superfície proposta, quando existe, senão o terreno existente; fora da superfície, são omitidos.

## No perfil de uma linha elétrica aérea

No [perfil da linha](topic:overhead-line#the-line-profile), {{ui:Medir}} na barra do perfil exige dois cliques e indica a distância horizontal, a diferença de altura, a distância em linha reta e o declive entre eles. Um clique perto do terreno, do condutor ou do topo de um apoio fixa-se nele. Clique de novo em {{ui:Medir}} para parar.
