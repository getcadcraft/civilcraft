---
title: Pavimentação, muros e degraus
summary: Pavimentação com quedas para um ralo ou uma queda transversal, um padrão e sua composição; caminhos que seguem o terreno; muros de arrimo e independentes com fundações escalonadas; meios-fios; rampas e degraus verificados contra seus limites; exportação IFC.
keywords: elementos construídos, pavimentação, peças, pátio, terraço, quedas, ralo, queda transversal, espinha de peixe, aparelho deitado, caminho, passeio, muro de arrimo, muro de jardim, fundação, coroamento, meio-fio, guia, bordadura, rampa, acessibilidade, degraus, escadas, espelhos, pisos, patamar
from: 51475877
---

Os elementos construídos são recalculados a partir do terreno toda vez, então acompanham o relevo e são regenerados quando o terreno ou a linha deles se move. Arraste seus cantos na planta como qualquer linha. Abra-os por {{ui:Elementos construídos}} no grupo Paisagismo.

## Pavimentação

Clique nos cantos e pressione {{key:Enter}}. Em Propriedades:

- **Nível**: vazio = a média do terreno sob ele.
- **Quedas**: nível, uma **queda transversal** (um % em uma direção) ou **para um ralo**: o CivilCraft pede que você clique onde fica o ralo, e então cada canto sobe a partir do ralo, na queda. Setas na planta mostram as quedas.
- **Padrão** (grade, aparelho deitado, espinha de peixe) com o tamanho da peça, a junta e o ângulo; **Bordadura**, largura. Em uma folha, juntas com menos de um milímetro são omitidas.
- A pavimentação faz parte da superfície projetada. Suas camadas (peças, assentamento, base) entram no IFC e nos quantitativos.

## Caminhos

Clique ao longo do caminho e pressione {{key:Enter}}. Ele segue o terreno, com sua **Queda transversal** para o lado direito. Um caminho mais íngreme que a **Inclinação máxima permitida** é marcado com `!` na planta onde ocorre, e as Propriedades informam o quão íngreme ele fica.

## Muros

Clique ao longo do muro e pressione {{key:Enter}}. Um muro é **de arrimo** ou **independente**. Sem **Topo**, ele fica com sua **Altura** acima do terreno por todo o comprimento; digite um topo para mantê-lo nivelado. Sua **fundação** fica a uma profundidade definida abaixo do terreno e desce em degraus inteiros, de modo que fique nivelada entre eles. As Propriedades informam o comprimento, as alturas, a área da face e os degraus da fundação; a planta rotula o topo e a base do muro (TW / BW) em cada extremidade.

:::warning
Um muro de arrimo com mais de 1.2 m (4 ft) é sinalizado: um engenheiro o projeta.
:::

## Meios-fios

Clique ao longo do meio-fio e pressione {{key:Enter}}; defina sua largura e sua altura de saliência.

## Rampas

Clique da base ao topo e pressione {{key:Enter}}. Os níveis vêm do terreno em cada extremidade, a menos que você os digite. Uma rampa recebe um patamar a cada desnível de 750 mm (2.5 ft) e é verificada contra a **Inclinação máxima permitida** (1:12 como ponto de partida) e uma largura mínima; as Propriedades informam o comprimento que ela precisaria ter.

## Degraus

Clique na face frontal do degrau inferior, depois onde os degraus chegam ao topo, e pressione {{key:Enter}}. O número de espelhos vem da altura e do **Espelho máximo**; o piso vem da regra de conforto 2R + G ≈ 630 mm, nunca abaixo do **Piso mínimo**; um patamar a cada **Espelhos por lance, no máximo**. As Propriedades informam se eles cabem entre os dois pontos, ou quanto mais comprimento eles precisam.

:::note
Os limites para rampas e degraus são padrões rotulados. Defina os que o código de obras da sua cidade exige.
:::

## Fora do CivilCraft

- Mais › {{ui:Exportar IFC de paisagismo}}: pavimentação e caminhos como `IfcPavement`, muros como `IfcWall` (muros de arrimo como RETAININGWALL) com suas camadas, meios-fios como `IfcKerb`, rampas como `IfcRamp`, degraus como `IfcStair` com seus espelhos e pisos.
- A **Enviar para o TakeoffCraft** da tabela de plantas leva as áreas de pavimentação e os volumes das camadas, as áreas de face e os comprimentos dos muros, os comprimentos dos meios-fios e as contagens de degraus.
- A folha de detalhes desenha a seção de cada muro, a composição de cada pavimentação e cada lance de degraus. Veja [Folhas de paisagismo](topic:landscape-sheets).
