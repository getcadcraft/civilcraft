---
title: Grading para sa landscape
summary: Mga platform, berm, swale at free grading na may spot elevation at contour na idini-drag, cut at fill na live, slope analysis, flow arrow at ponding, lahat sa proposed surface ng CivilCraft.
keywords: retaining wall, retaining walls, vertical side, pader sa halip na slope, slope bawat gilid, embankment, grading, landscape grading, platform, terrace, pad, berm, tambak, swale, spot elevation, spot level, contours, edit contours, cut and fill, earthwork, slope analysis, accessibility, matarik na slope, flow arrows, drainage, ponding, puddles
from: e1559eb9
---

Lahat ng narito ay ginrade sa **proposed surface** gamit ang parehong grading gaya ng pad at corridor. Hindi kailanman binabago ang **existing ground**, at binibilang ng Earthwork ang lahat ng ito. Nasa Landscape group ang Grade menu.

## Mga platform

{{ui:Grade}} › {{ui:Platform}}, pagkatapos i-click ang mga sulok at pindutin ang {{key:Enter}}. Nagsisimula ang platform sa average na elevation ng ground sa ilalim nito; mag-type ng **Elevation** para itakda ito, o iwanang blangko para sundan muli ang ground. Ang **Fall** sa % at **Falls towards** sa degree (0 = east, 90 = north) ang nagpapatagilid dito. Ang mga gilid nito ay ginrade palabas sa ground sa **Cut slope** at **Fill slope** (pahalang sa 1).

## Slope bawat gilid at retaining wall

Sa ilalim ng **Mga gilid at retaining wall** sa Properties ng pad, platform o berm, maaaring ihubog ang bawat gilid sa sarili nitong paraan. Ang gilid 1 ay tumatakbo mula sa unang sulok na na-click mo hanggang sa ikalawa, ang gilid 2 mula sa ikalawa hanggang sa ikatlo, at iba pa.

- **Lahat ng gilid**: ang **May slope** ay gumagamit ng cut at fill slope sa itaas sa bawat gilid; ang **Patayo: mga retaining wall** ay naglalagay ng pader sa bawat gilid.
- Bawat gilid: **Slope sa itaas**, **Sariling slope** (mag-type ng cut at fill slope para sa gilid na iyon) o **Patayo (retaining wall)**.
- I-type ang slope bilang `3` o `3:1` (pahalang sa 1 patayo), `33%` o `18.4°`; ipinapakita ito bilang H:1. Ganoon din ang tinatanggap ng sariling **Cut slope** at **Fill slope** ng pad.
- Ang vertical na gilid ay walang embankment: tumatakbo ang retaining wall sa kahabaan ng gilid, mula sa pad pababa sa existing ground (sa fill) o mula sa ground pababa sa pad (sa cut). Ang **Wall thickness** (0.3 m o 1 ft bilang panimula) ay kung gaano kalayo ang hakbang ng ground mula sa gilid ng pad papunta sa existing ground. Hindi isinasama ng cut at fill volumes ang embankment na wala na sa gilid na iyon.
- Kapag nagtagpo ang pader at ang gilid na may slope, binabalot ng slope ang dulo ng pader; nagtatagpo ang dalawang pader sa mitre.
- Sa ilalim ng mga field: ang haba ng mga pader, exposed face (taas × haba), pinakamataas at average na taas.

Iginuguhit ng plano ang outer face ng bawat pader na may maikling tick sa ibabaw nito at ang taas nito sa magkabilang dulo at sa pinakamataas nitong punto (sa retaining walls layer, na napupunta rin sa DXF at DWG). Ipinapakita ng 3D view ang mga pader bilang solid (Ipakita › Retaining walls), at kasama nila ang mga export na GLB, OBJ at USD. Ipinapakita ng mga section sa kabila ng gilid ang hakbang.

**Mga babala** (sa Properties, at sa Problems panel): ang pader na mas mataas sa **Babalaan sa taas ng pader na lampas sa** (1.0 m o 3.3 ft bilang panimula) ay "may need an engineered wall or a permit; check local rules", at, kapag nag-type ka ng **Pinakatarik na slope na kayang tumayo ng lupa**, anumang gilid na ang cut o fill slope ay mas matarik doon. Babala lamang ang mga ito: itinatayo pa rin ang grading. Bawat pagbabago ay isang hakbang para sa {{key:Mod+Z}}.

## Mga berm

{{ui:Grade}} › {{ui:Berm}}: isang tambak na ang top ay nasa **Height** nito sa itaas ng average na ground sa ilalim nito, at ginrade palabas ang mga gilid nito.

## Mga swale

{{ui:Grade}} › {{ui:Swale}}, pagkatapos i-click sa kahabaan ng swale **sa direksyon ng daloy ng tubig** at pindutin ang {{key:Enter}}. Itakda ang **Depth**, **Bottom width** (0 para sa V) at **Side slope**. Kapag walang **Fall**, sumusunod ang ilalim nito sa ground, nasa lalim nitong nasa ibaba nito, at hindi kailanman umaakyat; mag-type ng fall para bigyan ito ng pare-parehong fall mula sa simula nito.

## Spot elevation at contour

1. {{ui:Grade}} › {{ui:Grading area}}: i-click ang outline ng lugar na gusto mong hubugin.
2. {{ui:Grade}} › {{ui:Spot elevation}}: i-click sa loob ng lugar. I-type ang elevation nito sa Properties, o gamitin ang mga button na ▲ ▼.
3. {{ui:Grade}} › {{ui:Edit a contour}}: i-click ang isang contour sa loob ng lugar para kunin ito bilang linyang maaari mong hubugin muli.

Piliin ang spot o contour at **i-drag** ito (o ang mga punto nito) sa plano: sumusunod ang surface kapag binitawan mo, isang undo step. Sa loob ng lugar, muling binubuo ang ground mula sa gilid nito (kung saan ito nagtatagpo sa existing ground), ang mga spot elevation at ang mga na-edit na contour.

## Cut and fill, live

Ipinapakita ng Properties ng bawat grading object ang **Cut** at **Fill** nito at ng buong site, ayon sa grid method na ginagamit ng Earthwork, habang binabago mo ito. Nakalista roon ang mga problema (nasa labas ng surface, outline na nagka-cross sa sarili).

## Mga grading check

Sa seksyong **Grading checks** sa kaliwa:

- **Slope analysis** ay nagkukulay ng surface ayon sa gradient: hanggang sa gentle limit, nasa pagitan, at mas matarik kaysa sa steep limit (5 % at 33.3 % bilang panimula: ang karaniwang 1:20 para sa accessible route at 1:3 para sa mowing). Ipinapakita ng legend kung gaano karaming lugar ang nasa bawat isa. Lumalabas din sa sheet ang mga matarik na lugar.
- **Flow arrows and ponding** ay gumuguhit kung saang direksyon dumadaloy ang tubig at minamarkahan ang bawat lugar kung saan ito mag-po-ponding, kasama ang lalim nito; sinasabi ng seksyon kung ilang lugar ang mga iyon, ang pinakamalalim at kung gaano karaming tubig ang hawak nila.

Binabasa ng mga check ang proposed surface kapag may ginrade, kung wala ay ang existing ground.
