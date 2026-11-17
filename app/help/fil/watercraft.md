---
title: WaterCraft: mga demand, fire flow, outage at water age
summary: Gamit ang WaterCraft add-on, gawing demand sa iyong mga water main ang mga customer, suriin ang flow na available sa bawat hydrant, alamin kung aling outage ng main ang pinakamabigat ang epekto, at subaybayan ang water age at chlorine sa buong araw.
keywords: watercraft, distribusyon ng tubig, demand, mga customer, peaking factor, pattern ng demand, fire flow, hydrant, natitirang pressure, criticality, outage, seksyong may balbula, water age, chlorine, residual, source trace, dead end, csv, add-on
from: 76809f01
---

Ang WaterCraft ay isang add-on na gumagana sa water network na iginuhit mo na gamit ang mga tool ng Water mains. Nagdaragdag ito ng tab sa kanang panel na may apat na seksyon.

:::warning
Pantulong sa pagkuwenta lamang ito. Sinuri ito laban sa mga sagot na kinuwenta nang manu-mano sa mga gawang-gawang network, hindi sa totoong utility model. Dapat suriin ng isang water engineer ang bawat resulta. Wala pang booster station, second-order decay, at scenario.
:::

## Ano ang gagawin mo

- Ilagay ang mga customer sa network bilang demand.
- Hanapin ang mga hydrant na kulang sa flow na kailangan mo.
- Hanapin ang mga main na pinakamalaki ang epekto ng pagkawala.
- Hanapin ang lumang tubig at mababang chlorine.

## Mga hakbang

1. Buksan ang {{ui:Mga setting}} › {{ui:Mga Add-on}} at i-on ang {{ui:WaterCraft (distribusyon ng tubig)}}. May lalabas na {{ui:WaterCraft}} tab sa kanang panel.
2. Unang gumuhit ng reservoir, junction at tubo gamit ang mga tool ng Water mains (tingnan ang [Water mains](topic:water-mains)). Kung walang network, sasabihin ng tab na gawin muna iyon.
3. Sa ilalim ng {{ui:Demand}}, i-paste ang isang customer bawat linya: id, x, y, kind, amount. Piliin ang {{ui:Peaking factor}} at ang {{ui:Oras-orasang pattern}} (residential day, commercial day, flat, o panatilihin ang pattern gaya ng dati). Pindutin ang {{ui:Suriin}} para makita kung saan napupunta ang bawat customer (ang pinakamalapit na junction), saka {{ui:Ilagay sa network}}. Ibabalik ng I-undo ang mga demand.
4. Sa ilalim ng {{ui:Fire flow}}, itakda ang kailangang flow at ang residual pressure, piliin kung ang residual ay pananatilihin {{ui:Sa hydrant lang}} o {{ui:Sa buong sistema (mas mahigpit)}}, at pindutin ang {{ui:Run}}. Nakalista ang bawat hydrant mula sa pinakamasama, bilang natutugunan o kulang.
5. Sa ilalim ng {{ui:Aling main ang pinakamahalaga}}, piliin ang {{ui:isang tubo sa bawat pagkakataon}} o {{ui:isang seksyong may balbula sa bawat pagkakataon}} at pindutin ang {{ui:Run}}. Ipinapakita ng bawat outage ang demand na naputol, ang mga junction na naputol, ang mga junction na bagong bumaba sa minimum na pressure, at ang pinakamababang pressure na natira.
6. Sa ilalim ng {{ui:Water age at chlorine}}, piliin kung ano ang susubaybayan (water age, chlorine o source trace), itakda ang oras ng pagtakbo at ang mga limit na gusto mo, at pindutin ang {{ui:Run}}. Nakalista ang mga junction na lampas sa iyong mga limit.
7. Pindutin ang {{ui:I-save bilang CSV}} sa ilalim ng alinmang table para itago ito.

## Mga tala

- Ang kailangang fire flow at ang gamit kada bahay o kada acre ay panimulang halaga lamang, hindi pamantayan. Gamitin ang sarili mong datos ng utility.
- Ang tubong bahagyang naputol ng balbula ay isinasara nang buo, kaya bahagyang mas malala ang ipinapakitang outage kaysa sa totoo.
- Patakbuhin ang seksyon ng water-quality nang sapat na tagal para maulit ang pang-araw-araw na pattern bago basahin ang huling araw.
- Tinatapos ng {{ui:Itigil}} nang maaga ang mahabang pagtakbo; ipinapakita lamang ng listahan ang natapos na.
- Nananatili ang iyong network sa project na ito at sa computer na ito. Walang ipinapadala kahit saan.
