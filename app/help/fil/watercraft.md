---
title: WaterCraft: demand, fire flow, outage at edad ng tubig
summary: Gamit ang WaterCraft add-on, gawing demand sa iyong water main ang mga customer, tingnan ang daloy na available sa bawat hydrant, alamin kung aling outage ng main ang pinakamalaki ang epekto, at subaybayan ang edad ng tubig at chlorine sa buong araw.
keywords: watercraft, water distribution, demand, customer, peaking factor, demand pattern, fire flow, hydrant, natitirang pressure, criticality, outage, valved section, water age, chlorine, residual, source trace, dead end, csv, add-on
from: 066fb17a
---

Ang WaterCraft ay isang add-on na gumagana sa water network na nagawa mo na gamit ang mga tool ng Water mains. Nagdaragdag ito ng tab sa right-hand panel na may apat na seksyon.

:::warning
Pantulong lamang sa pagkukuwenta ito. Sinuri ito laban sa mga sagot na kinuwenta nang mano-mano sa mga gawa-gawang network, hindi sa totoong utility model. Dapat suriin ng isang water engineer ang bawat resulta. May sariling paksa ang mga scenario, control rule, valve at field reading, "Scenarios" at "Studies", sa help ng WaterCraft add-on.
:::

## Ang gagawin mo

- Ilagay ang mga customer sa network bilang demand.
- Hanapin ang mga hydrant na kulang sa daloy na kailangan mo.
- Hanapin ang mga main na pinakamalaki ang epekto ng pagkawala.
- Hanapin ang lumang tubig at mababang chlorine.

## Mga hakbang

1. Buksan ang {{ui:Mga setting}} › {{ui:Mga Add-on}} at i-on ang {{ui:WaterCraft (water distribution)}}. Lalabas ang tab na {{ui:WaterCraft}} sa right-hand panel.
2. Iguhit muna ang reservoir, junction at pipe gamit ang mga tool ng Water mains (tingnan ang [Water mains](topic:water-mains)). Kung walang network, sinasabi sa iyo ng tab na gawin iyon.
3. Sa ilalim ng {{ui:Demands}}, i-paste ang isang customer bawat linya: id, x, y, kind, amount. Piliin ang {{ui:Peaking factor}} at ang {{ui:Hourly pattern}} (residential day, commercial day, flat, o panatilihin ang pattern gaya ng dati). Pindutin ang {{ui:Suriin}} para makita kung saan lalapag ang bawat customer (ang pinakamalapit na junction), saka {{ui:Ilagay sa network}}. Binabawi ng undo ang mga demand.
4. Sa ilalim ng {{ui:Fire flow}}, itakda ang kailangang daloy at ang residual pressure, piliin kung ang residual ay pinananatili {{ui:Sa hydrant lang}} o {{ui:Sa buong sistema (mas mahigpit)}}, at pindutin ang {{ui:Run}}. Nakalista ang bawat hydrant mula sa pinakamasama, bilang sapat o kulang.
5. Sa ilalim ng {{ui:Aling main ang pinakamahalaga}}, piliin ang {{ui:isang pipe sa bawat pagkakataon}} o {{ui:isang valved section sa bawat pagkakataon}} at pindutin ang {{ui:Run}}. Ipinapakita ng bawat outage ang demand na naputol, ang mga junction na naputol, ang mga junction na bagong nasa ilalim ng minimum na pressure at ang pinakamababang pressure na natira.
6. Sa ilalim ng {{ui:Water age at chlorine}}, piliin kung ano ang susubaybayan (water age, chlorine o source trace), itakda ang oras ng pagtakbo at ang mga limit na gusto mo, at pindutin ang {{ui:Run}}. Nakalista ang mga junction na nasa labas ng iyong mga limit.
7. Pindutin ang {{ui:I-save bilang CSV}} sa ilalim ng alinmang table para itago ito.

## Mga tala

- Ang kailangang fire flow at ang paggamit kada bahay o kada acre ay mga panimulang halaga, hindi standard. Gamitin ang sarili mong datos ng utility.
- Ang pipe na bahagyang naputol ng valve ay isinasara nang buo, kaya medyo mas masama ang outage na ipinapakita kaysa sa tunay.
- Patakbuhin ang water-quality section nang sapat na haba para maulit ang pang-araw-araw na pattern bago mo basahin ang huling araw.
- Tinatapos nang maaga ng {{ui:Stop}} ang mahabang pagtakbo; ipinapakita lamang ng listahan ang natapos na.
- Nananatili ang iyong network sa proyektong ito at sa computer na ito. Walang ipinapadala kahit saan.
