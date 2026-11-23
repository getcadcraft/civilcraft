---
title: Pavimentos, muros e degraus
summary: Pavimento com quedas para um dreno ou uma inclinação transversal, um padrão e a sua composição; caminhos que seguem o terreno; muros de suporte e independentes com sapatas escalonadas; lancis; rampas e degraus verificados contra os seus limites; IFC de saída.
keywords: pavimentos e muros, pavimento, lajetas, pátio, terraço, quedas, dreno, inclinação transversal, espinha de peixe, aparelho em tijolo, caminho, passeio, muro de suporte, muro de jardim, sapata, coroamento, lancil, orla, rampa, acessibilidade, degraus, escadas, espelhos, cobertores, patamar
from: d34b4466
---

Os pavimentos e muros são recalculados a partir do terreno sempre que este muda, pelo que seguem o relevo e se regeneram quando o terreno ou a sua linha se altera. Arraste os seus cantos na planta como qualquer linha. Abra-os a partir de {{ui:Pavimentos e muros}} no grupo Paisagismo.

## Pavimento

Clique nos cantos e prima {{key:Enter}}. Em Propriedades:

- **Nível**: vazio = a média do terreno por baixo dele.
- **Quedas**: nível, uma **inclinação transversal** (uma percentagem numa direção) ou **para um dreno**: o CivilCraft pede que clique onde fica o dreno, e depois cada canto sobe a partir do dreno com a queda. Setas na planta mostram as quedas.
- **Padrão** (grelha, aparelho de tijolo, espinha de peixe) com a dimensão unitária, a junta e o ângulo; largura da **Orla**. Numa folha, as juntas mais estreitas do que um milímetro são omitidas.
- O pavimento faz parte da superfície projetada. As suas camadas (lajetas, leito de assentamento, base) entram no IFC e nas quantidades.

## Caminhos

Clique ao longo do caminho e prima {{key:Enter}}. Ele segue o terreno, com a sua **Inclinação transversal** para o lado direito. Um caminho mais íngreme do que o **Declive máximo permitido** é assinalado com `!` na planta no ponto em que ocorre, e as Propriedades indicam o declive máximo atingido.

Onde um caminho encontra uma estrada construída por um corredor, para no bordo exterior da estrada, à cota do passeio ou da berma nesse ponto, na superfície projetada e na vista 3D. Um caminho que atravessa uma estrada é modelado e mostrado em duas partes, e um fim desenhado até duas vezes a largura do caminho antes da estrada é prolongado até ao seu bordo. A planta continua a mostrar o caminho tal como o desenhou, e o seu comprimento e área contam a linha inteira. Veja [Varrimento de um corredor rodoviário](topic:corridor).

## Muros

Clique ao longo do muro e prima {{key:Enter}}. Um muro é **de suporte** ou **independente**. Sem **Topo**, ergue-se a sua **Altura** acima do terreno em toda a extensão; indique um topo para o manter nivelado. A sua **sapata** fica a uma profundidade definida abaixo do terreno e desce em degraus inteiros, pelo que se mantém nivelada entre eles. As Propriedades indicam o comprimento, as alturas, a área da face e os degraus da sapata; a planta assinala o topo e a base do muro (TW / BW) em cada extremidade.

:::warning
Um muro de suporte com altura superior a 1.2 m (4 ft) é assinalado: deve ser dimensionado por um engenheiro.
:::

## Lancis

Clique ao longo do lancil e prima {{key:Enter}}; defina a sua largura e a altura emergente.

## Rampas

Clique da base até ao topo e prima {{key:Enter}}. As cotas vêm do terreno em cada extremidade, a menos que as escreva. Uma rampa recebe um patamar a cada desnível de 750 mm (2.5 ft) e é verificada contra o **Declive máximo permitido** (1:12 inicialmente) e uma largura mínima; as Propriedades indicam o comprimento que precisaria de ter.

## Degraus

Clique na aresta frontal do primeiro degrau e depois onde os degraus chegam ao topo, e prima {{key:Enter}}. O número de espelhos resulta da altura e do **Espelho máximo**; o piso resulta da regra de conforto 2R + G ≈ 630 mm, nunca abaixo do **Piso mínimo**; um patamar a cada **Espelhos por lance no máximo**. As Propriedades indicam se cabem entre os dois pontos ou quanto mais comprimento precisam.

:::note
Os limites de rampas e degraus são valores predefinidos assinalados. Defina os que o seu código de construção exige.
:::

## Fora do CivilCraft

- Mais › {{ui:Exportar IFC de paisagismo}}: pavimentos e caminhos como `IfcPavement`, muros como `IfcWall` (muros de suporte como RETAININGWALL) com as suas camadas, lancis como `IfcKerb`, rampas como `IfcRamp`, degraus como `IfcStair` com os seus espelhos e cobertores.
- O **Enviar para TakeoffCraft** do mapa de plantas transporta as áreas de pavimento e os volumes das camadas, as áreas das faces dos muros e os seus comprimentos, os comprimentos dos lancis e o número de degraus.
- A folha de pormenores desenha a secção de cada muro, a composição de cada pavimento e cada lance de degraus. Veja [Folhas de paisagismo](topic:landscape-sheets).
