---
title: Mga swept path ng sasakyan
summary: Patakbuhin ang sasakyan na may hanggang tatlong trailer sa kahabaan ng feature line o alignment, pasulong o paatras, at tingnan ang lugar na sinasaklaw nito, ang mga landas ng gulong, ang steering nito at kung saan ito nag-jackknife.
keywords: swept path, turning path, vehicle tracking, turning template, design vehicle, truck, bus, trailer, semitrailer, reversing, backing, jackknife, articulation, steering lock, offtracking, wheel path, loading dock, turning radius
from: 8caafb8a
---

Ipinapatakbo ng swept path ang sasakyan sa kahabaan ng linya at ipinapakita ang lupang nadadaanan ng katawan nito. Gamitin ito para tingnan kung kayang lumiko ng trak, maabot ang loading dock, o maiatras ang trailer sa tamang puwesto nang hindi lumalabas sa pavement.

## Patakbuhin ang sasakyan sa kahabaan ng linya

1. Iguhit ang linyang susundan ng sasakyan, sa direksyon ng pagbiyahe: isang feature line (ok ang arc: pindutin ang {{key:C}} habang iginuguhit ito, tingnan ang [Feature lines](topic:feature-lines)) o isang alignment.
2. Piliin ito at i-click ang {{ui:Swept path…}} sa **Properties** nito.
3. Sa ilalim ng **Magsimula sa**, pumili ng sasakyan, saka itakda ang sukat nito mula sa sarili mong design vehicle: width, front overhang, wheelbase, rear overhang, track at **Steering lock**. Magdagdag ng hanggang tatlong trailer, bawat isa ay may kung saan ito nakakabit (hitch), haba mula hitch hanggang axle nito, mga overhang nito, at **Pinakamalaking articulation** nito.
4. Piliin ang **Pagmamaneho**: forward o reversing. I-click ang {{ui:Imaneho}}.

:::warning
Placeholder lang ang mga sasakyang pagsisimulan, hindi pamantayan. Itakda ang mga sukat mula sa design vehicle na gamit ng project mo.
:::

## Pasulong at paatras

| Pagmamaneho | Ano ang sumusunod sa linya | Ano ang kinakalkula ng CivilCraft |
|---|---|---|
| **Forward** | Ang sentro ng front axle | Saan pupunta ang rear axle at bawat trailer, ang anggulo ng steering at ang articulation |
| **Reversing** | Ang sentro ng huling axle (ang likod ng trailer) | Saan pupunta ang bawat unit sa unahan, at ang steering na kailangan ng cab para mailagay doon ang trailer |

Ganito chinecheck ang backing move: sabihin kung saan dapat pumunta ang trailer, at sasabihin ng CivilCraft kung kaya ito ng cab.

## Basahin ang resulta

Iginuguhit ang swept path sa plan sa kulay orange: ang outline nito at, naka-dash, ang mga landas ng pinakalabas na gulong. Piliin ito (i-click sa loob nito) para makita sa **Properties**:

- **Haba na napatakbo**, ang pinakamalaking anggulo ng **Steering** at **Articulation** laban sa mga limit nila, at ang **Swept area**.
- Anumang problema sa kahabaan ng linya, kasama ang distansya nito: steering na lampas sa lock, o trailer na lumalampas sa articulation limit nito (nag-jackknife).
- **Ang sasakyan sa kahabaan ng linya**: ilipat ang slider para makita ang sasakyan sa anumang punto, kasama ang steering at articulation nito doon.

Kapag binago ang linya, susunod ang swept path. Binabago ng {{ui:I-edit ang sasakyan…}} ang mga sukat; lumilipat ang **Pagmamaneho** sa pagitan ng forward at reversing. Bawat pagbabago ay isang step: binabawi ito ng {{key:Mod+Z}}. Binubura ng {{key:Delete}} ang napiling swept path (nananatili ang linya).

Mapupunta ang outline at mga landas ng gulong sa PDF, DXF at DWG sa layer C-ROAD-SWPT.

## Paano ito kinakalkula

Umiikot ang bawat unit sa paligid ng linya ng rear axle nito at hinihila ng punto sa unahan nito (ang front axle, o ang hitch): ang low-speed, no-slip model na ginagamit ng swept path checks. Ang swept area ay ang pinagsamang outline ng katawan sa bawat posisyon. Hindi minomodelo ang bilis, tyre slip, oras na kailangan ng steering para umikot, steering trailers, o clearance sa ilalim ng katawan.
