---
title: Disenyo ng irrigation
summary: Calculation aid, hindi stamped na disenyo: heads, laterals, mainline, valves at drip lines sa site; mga zone na nahanap mula sa mga tubo; pressure loss sa pamamagitan ng Hazen–Williams, ang worst-case head, flow at pressure laban sa supply, precipitation rate, run time, coverage at bill of materials.
keywords: irrigation, sprinkler, sprinklers, spray, rotor, rotary nozzle, bubbler, drip, dripline, emitter, valve, zone, station, controller, mainline, lateral, point of connection, water supply, pressure, psi, kpa, flow, gpm, friction loss, hazen williams, precipitation rate, run time, coverage, head to head, bill of materials
from: 7d6342c1
---

:::warning
Ito ay calculation aid, hindi stamped na disenyo: dapat suriin ng isang irrigation designer ang bawat resulta bago itayo ang kahit ano.
:::

## Ilatag ang sistema

1. Sa seksyong **Irrigation** sa kaliwa, piliin ang **Head**, ang **Arc** nito at kung saan nagsisimula ang arc, at ang laki ng tubo para sa laterals at mainline.
2. {{ui:Irrigation}} › {{ui:Point of connection}}: i-click kung saan sumasali ang suplay ng tubig. Itakda ang **pressure** nito, ang **flow available** at ang meter at backflow loss sa Properties.
3. {{ui:Irrigation}} › {{ui:Valve}}: i-click kung saan napupunta ang valve ng bawat zone. Nagsisimula ang isang zone sa isang valve.
4. {{ui:Irrigation}} › {{ui:Head}}: i-click para maglagay ng heads; isang head ang nalalagay sa bawat click.
5. {{ui:Irrigation}} › {{ui:Lateral pipe}}: i-click mula sa isang valve sa mga head nito at pindutin ang {{key:Enter}}. {{ui:Mainline}}: mula sa point of connection papunta sa bawat valve.

Dumidikit ang dulo ng tubo sa heads, valves, suplay at iba pang dulo ng tubo, kaya nagdurugtong ang network. Ang zone ay lahat ng naaabot mula sa valve nito sa kahabaan ng laterals; isang zone lamang ang dala ng mainline sa isang pagkakataon.

## Drip

{{ui:Irrigation}} › {{ui:Drip line}}: i-click sa kahabaan ng linya, simula sa lugar kung saan ito pinapakain (dulo ng lateral o isang valve). Itakda ang **emitter flow** at **spacing** sa Properties; ang flow nito ay ang mga emitter sa kahabaan nito.

## Ang check

{{ui:Irrigation}} › {{ui:Check the system…}} ay naglilista ng bawat zone:

| Column | Paano ito kinukuwenta |
|---|---|
| Flow | Ang kabuuan ng flow ng mga head (at ng drip lines) |
| At the valve | Ang working pressure ng worst-case head kasama ang pipe losses papunta rito (Hazen–Williams, ang inside diameter ng tubo, ang pagbabago ng elevation) at ang loss sa valve |
| At the supply | Pareho, kasama ang loss ng mainline na nagdadala ng zone na iyon, at ang meter at backflow loss |
| Precipitation | Ang flow ng mga head sa lugar na dinidiligan nila sa head-to-head spacing |
| Minutes a week | Para mailapat ang setting na **Water a week** |
| Problems | Velocity na lampas sa limit, head na lampas sa pressure range nito, sprays at rotors sa iisang valve, kulang na pressure o flow sa supply, heads na walang zone, loops |

Piliin ang valve para makita ang mga numero ng zone nito at ang worst-case head nito na nakapalibot sa plano. Binibilang ng bill of materials ang heads ayon sa uri at arc, tubo ayon sa laki, valves, drip line at emitters, at ang mga station ng controller. Pinananatili ng **Save as CSV** ang dalawa.

Mga setting sa seksyong Irrigation: **Hazen–Williams C** (150 para sa bagong plastic na tubo), ang **fastest flow** sa tubo (1.5 m/s), ang **loss through a valve**, at ang **water a week**. Mga default na may label ang mga ito.

## Coverage

{{ui:Irrigation}} › {{ui:Show coverage}} ay nagsasabi kung gaano kalaking bahagi ng lugar ang naiiwang tuyo ng heads, gaano kalaking bahagi ang dinidiligan ng dalawa o higit pang head, at aling heads ang hindi umaabot sa kapitbahay (head-to-head spacing).

## Heads

Ang mga head na nakalista ay **generic** na uri na isinulat ng CadCraft mula sa design precipitation rates (fixed sprays, rotary nozzles, gear rotors, bubblers, micro-sprays, emitters), hindi produkto ng anumang maker. **Magdagdag ng heads mula sa file…** ay bumabasa ng sarili mong heads (listahan ng JSON na may throw, flow o precipitation rate ng bawat head, at pressure range); sine-save ang mga ito kasama ng proyekto. Ang nai-publish na data ng isang maker ay ilalagay lamang kapag may naitala na pahintulot mula sa maker na iyon.

Sa ibaba ng generic heads, may **typical heads** ang listahan (nagtatapos ang pangalan nila sa "typical values"): nozzle sizes ng fixed sprays, rotary nozzles at gear rotors, micro-sprays, bubblers at emitters, na may radius, flow at pressure range. Kinukuwenta ng CadCraft ang mga ito mula sa nalathalang matematika (ang orifice equation para sa flow, ang jet-throw scaling para sa radius) at mga nominal flow class, mula lamang sa mga bukas na source; walang kinopyang table ng anumang maker. Piliin ang isa at ipinapakita ng picker ang basis at lisensya nito. Ang proyektong gumagamit nito ay pinapanatili ang head at ang source nito sa project file. Para sa pagpaplano ang mga ito: suriin ang sariling data ng totoong head bago magtayo.
