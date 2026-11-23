---
title: Pavimentos, muros e escaleiras
summary: Pavimento con pendentes cara a un desaugadoiro ou unha pendente transversal, un patrón e a súa estrutura de capas; sendas que seguen o terreo; muros de contención e exentos con cimentacións escalonadas; bordillos; rampas e escaleiras comprobadas cos seus límites; exportación IFC.
keywords: obra dura, pavimento, adoquíns, patio, terraza, pendentes, desaugadoiro, pendente transversal, espiña de peixe, aparello a soga, senda, paseo, muro de contención, muro de xardín, cimentación, remate, bordillo, bordadura, rampa, accesibilidade, escaleiras, escaleira, contrahuellas, pisadas, descanso
from: d34b4466
---

A obra dura recalcúlase desde o terreo cada vez, así que segue o terreo e rexérase cando se move o terreo ou a súa liña. Arrastre os seus vértices no plano como calquera liña. Ábrase desde {{ui:Obra dura}} no grupo Paisaxismo.

## Pavimento

Prema as esquinas e prema {{key:Enter}}. En Propiedades:

- **Cota**: baleiro = a media do terreo debaixo.
- **Pendentes**: cota, unha **pendente transversal** (un % cara a unha dirección) ou **a un desaugadoiro**: CivilCraft pídelle que prema onde vai o desaugadoiro, e entón cada esquina sobe desde o desaugadoiro coa pendente. As frechas no plano amosan as pendentes.
- **Patrón** (cuadrícula, aparello a soga, espiña de peixe) coa medida da peza, a xunta e o ángulo; **Bordadura** de largura. Nunha folla, as xuntas máis pequenas que un milímetro omítense.
- O pavimento forma parte da superficie proposta. As súas capas (pezas, asentamento, base) entran no IFC e nas cantidades.

## Sendas

Prema ao longo da senda e prema {{key:Enter}}. Segue o terreo, coa súa **Pendente transversal** cara ao seu lado dereito. Unha senda máis inclinada que a **Pendente máxima permitida** márcase con `!` no plano onde está, e as Propiedades din canto se inclina.

Onde unha senda encontra unha estrada construída por un corredor, para no bordo exterior da estrada, á cota da beirarrúa ou do arcén alí, na superficie proposta e na vista 3D. Unha senda que cruza unha estrada calcúlase e amósase como dúas partes, e un extremo debuxado a menos do dobre da largura da senda dunha estrada prolóngase ata o seu bordo. O plano segue amosando a senda tal como a debuxou, e a súa lonxitude e superficie contan toda a liña. Véxase [Varrer un corredor viario](topic:corridor).

## Muros

Prema ao longo do muro e prema {{key:Enter}}. Un muro é **de contención** ou **exento**. Sen **Coroación**, levanta a súa **Altura** sobre o terreo en toda a súa lonxitude; escriba unha coroación para mantelo nivelado. A súa **cimentación** sitúase a unha profundidade fixa debaixo do terreo e baixa en pasos enteiros, así que queda nivelada entre eles. As Propiedades dan a súa lonxitude, alturas, área da cara e pasos de cimentación; o plano etiqueta o alto e o baixo do muro (TW / BW) en cada extremo.

:::warning
Un muro de contención máis alto que 1.2 m (4 ft) márcase: un enxeñeiro debe deseñalo.
:::

## Bordillos

Prema ao longo do bordillo e prema {{key:Enter}}; estableza a súa largura e a súa altura sobre o chan.

## Rampas

Prema desde a base ata o alto e prema {{key:Enter}}. As cotas veñen do terreo en cada extremo, salvo que as escriba. Unha rampa recibe un descanso cada desnivel de 750 mm (2.5 ft) e compróbase contra a **Pendente máxima permitida** (1:12 ao inicio) e unha largura mínima; as Propiedades indican canto tería que ser de longa.

## Escaleiras

Prema o bordo frontal do primeiro chanzo, despois onde as escaleiras chegan ao alto, e prema {{key:Enter}}. O número de contrahuellas sae da altura e da **Contrahuella máis alta**; o fondo de cada chanzo, da regra de comodidade 2R + G ≈ 630 mm, nunca por debaixo do **Fondo mínimo**; un descanso cada **Contrahuellas por tramo como máximo**. As Propiedades indican se encaixan entre os dous puntos ou canto máis longas teñen que ser.

:::note
Os límites para rampas e escaleiras son valores predeterminados etiquetados. Estableza os que exixa o seu código de edificación.
:::

## Fóra de CivilCraft

- Máis › {{ui:Exportar IFC de paisaxismo}}: pavimento e sendas como `IfcPavement`, muros como `IfcWall` (os muros de contención como RETAININGWALL) coas súas capas, bordillos como `IfcKerb`, rampas como `IfcRamp`, escaleiras como `IfcStair` coas súas contrahuellas e pisadas.
- **Enviar a TakeoffCraft** da lista de plantas leva as áreas de pavimento e os volumes das capas, as áreas e lonxitudes das caras dos muros, as lonxitudes dos bordillos e o número de chanzos.
- A folla de detalles debuxa a sección de cada muro, a estrutura de cada pavimento e cada tramo de escaleiras. Véxase [Follas de paisaxismo](topic:landscape-sheets).
