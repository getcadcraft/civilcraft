---
title: Pavimentos, muros e degraus
summary: Pavimento com declives para um dreno ou uma inclinação transversal, um padrão e a sua constituição; caminhos que seguem o terreno; muros de suporte e isolados com fundações em degraus; lancis; rampas e degraus verificados contra os seus limites; exportação para IFC.
keywords: hardscape, pavimento, lajetas, pátio, terraço, declives, dreno, inclinação transversal, espinha de peixe, aparelho de fiada, caminho, passeio, muro de suporte, muro de jardim, fundação, remate, lancil, lancis, orla, rampa, acessibilidade, degraus, escadas, espelhos, cobertores, patamar
from: 51475877
---

Os pavimentos e muros são calculados de novo a partir do terreno de cada vez, pelo que seguem o relevo e se regeneram quando o terreno ou a sua linha se altera. Arraste os seus cantos na planta como qualquer linha. Abra-os a partir de {{ui:Pavimentos e muros}} no grupo Paisagismo.

## Pavimento

Clique nos cantos e prima {{key:Enter}}. Nas Propriedades:

- **Cota**: vazio = a média do terreno sob ele.
- **Declives**: cota, uma **inclinação transversal** (uma % numa direção) ou **para um dreno**: o CivilCraft pede que clique onde fica o dreno e, depois, cada canto sobe a partir do dreno com o declive. As setas na planta mostram os declives.
- **Padrão** (grelha, fiada, espinha de peixe) com o tamanho da unidade, a junta e o ângulo; **Largura da orla**. Numa folha, as juntas mais estreitas do que um milímetro são omitidas.
- O pavimento faz parte do terreno proposto. As suas camadas (lajetas, leito de assentamento, base) entram no IFC e nas quantidades.

## Caminhos

Clique ao longo do caminho e prima {{key:Enter}}. Segue o terreno, com a sua **Inclinação transversal** para o lado direito. Um caminho mais inclinado do que o **Declive máximo permitido** é assinalado com `!` na planta, no local, e as Propriedades indicam o seu declive máximo.

## Muros

Clique ao longo do muro e prima {{key:Enter}}. Um muro é **de suporte** ou **isolado**. Sem **Topo**, fica com a sua **Altura** acima do terreno ao longo de todo o percurso; escreva um topo para o manter nivelado. A sua **fundação** fica a uma profundidade definida abaixo do terreno e desce em degraus inteiros, pelo que se mantém nivelada entre eles. As Propriedades indicam o seu comprimento, alturas, área da face e degraus da fundação; a planta indica o topo e a base do muro (TW / BW) em cada extremidade.

:::warning
Um muro de suporte com mais de 1.2 m (4 ft) é assinalado: deve ser projetado por um engenheiro.
:::

## Lancis

Clique ao longo do lancil e prima {{key:Enter}}; defina a sua largura e a altura acima do pavimento.

## Rampas

Clique da base ao topo e prima {{key:Enter}}. As cotas vêm do terreno em cada extremidade, a não ser que as escreva. Uma rampa recebe um patamar a cada desnível de 750 mm (2.5 ft) e é verificada contra o **Declive máximo permitido** (1:12 como ponto de partida) e uma largura mínima; as Propriedades indicam quanto comprimento seria necessário.

## Degraus

Clique na aresta frontal do degrau inferior e, depois, onde os degraus chegam ao topo, e prima {{key:Enter}}. O número de espelhos resulta da altura e do **Espelho máximo**; o cobertor, da regra de conforto 2R + G ≈ 630 mm, nunca abaixo do **Cobertor mínimo**; um patamar a cada **Espelhos por lanço, no máximo**. As Propriedades indicam se cabem entre os dois pontos ou quanto mais comprimento precisam.

:::note
Os limites das rampas e dos degraus são valores predefinidos identificados como tal. Defina os que o código de construção exige.
:::

## Fora do CivilCraft

- Mais › {{ui:Exportar IFC de paisagismo}}: pavimentos e caminhos como `IfcPavement`, muros como `IfcWall` (muros de suporte como RETAININGWALL) com as suas camadas, lancis como `IfcKerb`, rampas como `IfcRamp`, degraus como `IfcStair` com os seus espelhos e cobertores.
- A **Enviar para TakeoffCraft** do mapa de vegetação transporta as áreas de pavimento e os volumes das camadas, as áreas e os comprimentos das faces dos muros, os comprimentos dos lancis e o número de degraus.
- A folha de pormenores desenha a secção de cada muro, a constituição de cada pavimento e cada lanço de degraus. Ver [Folhas de paisagismo](topic:landscape-sheets).
