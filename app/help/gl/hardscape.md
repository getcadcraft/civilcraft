---
title: Pavimento, muros e escaleiras
summary: Pavimento con pendentes cara a un desaugadoiro ou unha inclinación transversal, un patrón e a súa estrutura; camiños que seguen o terreo; muros de contención e exentos con zapatas escalonadas; bordillos; rampas e escaleiras comprobadas contra os seus límites; exportación a IFC.
keywords: obra dura, pavimento, adoquíns, patio, terraza, pendentes, desaugadoiro, inclinación transversal, espiña de peixe, aparello a soga, camiño, paseo, muro de contención, muro de xardín, zapata, coroación, bordillo, bordo, rampa, accesibilidade, escaleiras, contrahuellas, chanzos, descanso
from: 51475877
---

A obra dura calcúlase de novo a partir do terreo cada vez, así que segue o relevo e rexenérase cando o terreo ou a súa liña se move. Arrastre as súas esquinas no plano como calquera liña. Ábrase desde {{ui:Hardscape}} no grupo Paisaxismo.

## Pavimento

Faga clic nas esquinas e prema {{key:Enter}}. En Propiedades:

- **Nivel**: baleiro = a media do terreo baixo el;
- **Pendentes**: nivel, unha **inclinación transversal** (un % cara a unha dirección) ou **cara a un desaugadoiro**: CivilCraft pídelle que faga clic onde vai o desaugadoiro, e entón cada esquina sobe desde o desaugadoiro coa pendente. As frechas no plano mostran as pendentes;
- **Patrón** (cuadrícula, aparello a soga, espiña de peixe) co tamaño da unidade, a xunta e o ángulo; **Bordo** (ancho). Nunha folla, as xuntas máis pequenas que un milímetro omítense.
- O pavimento forma parte da superficie proposta. As súas capas (adoquíns, cama de asentamento, base) entran no IFC e nas cantidades.

## Camiños

Faga clic ao longo do camiño e prema {{key:Enter}}. Segue o terreo, coa súa **Inclinación transversal** cara ao lado dereito. Un camiño máis inclinado que a **Pendente máxima permitida** márcase con `!` no plano onde está, e Propiedades indica canto se inclina.

## Muros

Faga clic ao longo do muro e prema {{key:Enter}}. Un muro é **de contención** ou **exento**. Sen **Cima**, mantén a súa **Altura** sobre o terreo en toda a lonxitude; escriba unha cima para mantelo nivelado. A súa **zapata** asenta a unha profundidade fixa baixo o terreo e baixa por chanzos enteiros, así que queda nivelada entre eles. Propiedades indican a súa lonxitude, alturas, superficie da cara e chanzos da zapata; o plano etiqueta a cima e a base do muro (TW / BW) en cada extremo.

:::warning
Un muro de contención máis alto de 1,2 m (4 ft) márcase: debe deseñalo un enxeñeiro.
:::

## Bordillos

Faga clic ao longo do bordillo e prema {{key:Enter}}; defina o seu ancho e o seu saínte.

## Rampas

Faga clic desde abaixo ata arriba e prema {{key:Enter}}. Os niveis veñen do terreo en cada extremo, salvo que os escriba. Unha rampa recibe un descanso cada 750 mm (2,5 ft) de desnivel e compróbase contra a **Pendente máxima permitida** (1:12 para empezar) e unha anchura mínima; Propiedades indican canto tería que ser de longa.

## Escaleiras

Faga clic na fronte do primeiro chanzo, despois onde as escaleiras chegan arriba, e prema {{key:Enter}}. O número de contrahuellas sae da altura e da **Contrahuella máxima**; a pisada sae da regra de confort 2R + G ≈ 630 mm, e nunca é menor que a **Pisada mínima**; un descanso cada **Contrahuellas por tramo como máximo**. Propiedades indican se caben entre os dous puntos ou canto máis longas teñen que ser.

:::note
Os límites das rampas e escaleiras son valores predeterminados identificados como tales. Defina os que exixa o seu código de construción.
:::

## Fóra de CivilCraft

- Máis › {{ui:Export landscape IFC}}: pavimentos e camiños como `IfcPavement`, muros como `IfcWall` (os de contención como RETAININGWALL) cos seus estratos, bordillos como `IfcKerb`, rampas como `IfcRamp`, escaleiras como `IfcStair` coas súas contrahuellas e pisadas.
- A **Enviar a TakeoffCraft** da lista de plantas leva as áreas de pavimento e os volumes das capas, as superficies das caras e as lonxitudes dos muros, as lonxitudes dos bordillos e o número de chanzos.
- A folla de detalles debuxa a sección de cada muro, a estrutura de cada pavimento e cada tramo de escaleiras. Ver [Follas de paisaxismo](topic:landscape-sheets).
