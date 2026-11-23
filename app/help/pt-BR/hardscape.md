---
title: Pavimentação, muros e degraus
summary: Pavimentação com caimento para um ralo ou uma declividade transversal, um padrão e sua composição; caminhos que seguem o terreno; muros de arrimo e isolados com sapatas escalonadas; meios-fios; rampas e degraus verificados contra seus limites; IFC na saída.
keywords: elementos construídos, pavimentação, blocos intertravados, pátio, terraço, caimento, ralo, declividade transversal, espinha de peixe, aparelho de tijolos, caminho, passeio, muro de arrimo, muro de jardim, sapata, coroamento, meio-fio, acabamento de borda, rampa, acessibilidade, degraus, escadas, espelhos, pisos, patamar
from: d34b4466
---

Os elementos construídos são recalculados a partir do terreno toda vez, então seguem o relevo e se regeneram quando o terreno ou a sua linha se move. Arraste os seus cantos na planta como qualquer linha. Abra-os a partir de {{ui:Hardscape}} no grupo Paisagismo.

## Pavimentação

Clique nos cantos e pressione {{key:Enter}}. Em Propriedades:

- **Cota**: vazio = a média do terreno sob ele.
- **Caimentos**: nível, uma **declividade transversal** (um % em uma direção) ou **para um ralo**: a CivilCraft pede que você clique onde fica o ralo, e então cada canto sobe a partir do ralo no caimento. Setas na planta mostram os caimentos.
- **Padrão** (grade, aparelho de tijolos, espinha de peixe) com o tamanho da unidade, a junta e o ângulo; **Largura do acabamento de borda**. Numa folha, juntas mais estreitas que um milímetro são omitidas.
- A pavimentação faz parte da superfície projetada. Suas camadas (blocos, assentamento, base) entram no IFC e nos quantitativos.

## Caminhos

Clique ao longo do caminho e pressione {{key:Enter}}. Ele segue o terreno, com a sua **Declividade transversal** para o lado direito. Um caminho mais íngreme que a **Inclinação máxima permitida** é marcado com `!` na planta onde ele ocorre, e as Propriedades informam o quanto ele fica íngreme.

Onde um caminho encontra uma estrada construída por um corredor, ele para na borda externa da estrada, no nível do passeio ou do acostamento ali, na superfície projetada e na vista 3D. Um caminho que cruza uma estrada é regularizado e mostrado como duas partes, e uma extremidade desenhada até duas vezes a largura do caminho aquém da estrada é prolongada até a borda dela. A planta ainda mostra o caminho como você o desenhou, e o comprimento e a área contam a linha inteira. Veja [Varrer um corredor viário](topic:corridor).

## Muros

Clique ao longo do muro e pressione {{key:Enter}}. Um muro é **de arrimo** ou **isolado**. Sem **Topo**, ele fica sua **Altura** acima do terreno por todo o comprimento; digite um topo para mantê-lo nivelado. Sua **sapata** fica a uma profundidade definida abaixo do terreno e desce em degraus inteiros, de modo que fique nivelada entre eles. As Propriedades informam o comprimento, as alturas, a área da face e os degraus da sapata; a planta indica o topo e a base do muro (TW / BW) em cada extremidade.

:::warning
Um muro de arrimo com mais de 1,2 m (4 ft) de altura é sinalizado: um engenheiro deve projetá-lo.
:::

## Meios-fios

Clique ao longo do meio-fio e pressione {{key:Enter}}; defina a sua largura e a sua altura.

## Rampas

Clique da base até o topo e pressione {{key:Enter}}. As cotas vêm do terreno em cada extremidade, a menos que você digite as cotas. Uma rampa recebe um patamar a cada desnível de 750 mm (2.5 ft) e é verificada contra a **Inclinação máxima permitida** (1:12 para começar) e uma largura mínima; as Propriedades dizem qual seria o comprimento necessário.

## Degraus

Clique na face frontal do primeiro degrau, depois onde os degraus chegam ao topo, e pressione {{key:Enter}}. O número de espelhos vem da altura e do **Maior espelho**; a pisada, da regra de conforto 2E + P ≈ 630 mm, nunca abaixo da **Menor pisada**; um patamar a cada **Espelhos por lance, no máximo**. As Propriedades dizem se eles cabem entre os dois pontos ou quanto mais longos precisam ser.

:::note
Os limites de rampas e degraus são valores padrão rotulados. Defina os que o seu código de obras exige.
:::

## Para fora da CivilCraft

- Mais › {{ui:Export landscape IFC}}: pavimentação e caminhos como `IfcPavement`, muros como `IfcWall` (muros de arrimo como RETAININGWALL) com suas camadas, meios-fios como `IfcKerb`, rampas como `IfcRamp`, degraus como `IfcStair` com seus espelhos e pisos.
- O **Enviar para o TakeoffCraft** da tabela de plantas leva as áreas de pavimentação e os volumes de camadas, as áreas e comprimentos das faces dos muros, os comprimentos dos meios-fios e a quantidade de degraus.
- O desenho de detalhes desenha a seção de cada muro, a composição de cada pavimentação e cada lance de degraus. Veja [Folhas de paisagismo](topic:landscape-sheets).
