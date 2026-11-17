---
title: Mga underground cable
summary: Mga cable route sa mga trench sa pagitan ng supports at equipment, cover at crossings, joints ayon sa drum length, at ang dami ng trench at cable.
keywords: underground cable, ruta ng cable, trench, duct, cover, crossing, pipe crossing, joint, drum, cabinet, transformer, source, voltage drop
from: adfd2717
---

## Gumuhit ng cable route

1. Ilagay muna ang equipment kung ang cable ay nagtatapos sa cabinet, transformer, o joint: {{ui:Equipment}}, saka i-click.
2. I-click ang {{ui:Cable}} at i-click ang route; magsimula at magtapos sa support o sa equipment para kumonekta rito. Tinatapos ito gamit ang Enter.

Sa Properties, piliin ang **Cable**, ang **Trench type**, kung ilang **cables side by side**, at ang **slack** (%). Ipinapakita ng route ang haba nito, kung saan ito nagsisimula at nagtatapos, at ang kasalukuyang dinadala nito.

## Ano ang sinusuri

- **Cover**: ang tuktok ng cable na nasa ilalim ng ground sa kahabaan ng route, laban sa cover ng trench type (o sa least cover ng rule set).
- **Crossings**: kung saan tumatawid ang route sa CivilCraft pipe o sa ibang cable, ang agwat ng mga ito laban sa clearance rule: ang sariling **Crossing clearance** ng route (sa Properties nito) kapag may pinili ka, kung wala, ang **Underground crossings** rule ng rule set (ginagamit ng mga example set ang *Underground crossing*, 0.3 m), o kung wala rin, ang agwat ng trench type sa ibang service. Kapag dalawang cable ang nagtatawiran, ang mas malaki sa dalawa ang sinusunod. Ang overhead line na natawiran ay nakalista para sa impormasyon, at makikita ang cable sa profile ng linyang iyon.
- **Joints**: isa bawat drum length ng cable (kasama ang slack), kapag nagbibigay ang cable item ng drum length.

## Equipment

Ang equipment ay may library item, isang **load** (kW) kasama ang **power factor** nito, at puwedeng maging **source**: pinapakain mula roon ang network. Ang voltage ng source ay nagmumula sa library item nito, o kung wala, sa linya o cable na pinapakain nito.

## Quantities

{{ui:More}} › {{ui:Quantities…}} ay binibilang ang cable (haba ng route × (1 + slack) × cables side by side + ang rise sa bawat dulo), ang trench ayon sa uri, ang excavation, bedding, at backfill volumes, ang mga duct at joint, kasama ang conductor, supports, at equipment ng mga overhead line.
