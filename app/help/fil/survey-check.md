---
title: I-check ang survey drawing sa import
summary: Basahin ang mga level na nakasulat bilang text o sa block attributes bilang survey point, at i-check ang DWG o DXF para sa maling unit, walang coordinate system, malayong origin, patag na contour, kakaibang level, at dobleng point bago gumawa ng lupa mula rito.
keywords: survey check, import check, survey levels, spot levels, text levels, level bilang text, attributes, units, coordinate system, malayo sa origin, contours sa zero, outliers, duplicate points, problems, landscape architect, survey drawing
from: d46acd24
---

Maaaring mukhang tama ang isang survey drawing pero mali pa rin para sa isang lupa: maaaring hula lang ang unit nito, patag na nakalagay sa taas na 0 ang mga contour nito, o nakasulat bilang text ang mga level na hindi naman geometry. Binabasa ng seksyong **Survey levels at check** ng dialog na {{ui:Linework}} (tingnan ang [Buksan ang DWG o DXF bilang linework](topic:open-dwg-dxf)) ang mga level na iyon at sinasabi kung ano ang mukhang mali bago idagdag ang anuman.

## Mga level na nakasulat bilang text o sa attributes

Maraming survey drawing ang naglalagay ng spot level bilang maliit na text sa tabi ng krus, gaya ng `104.37` o `EL 104.37`, o bilang attribute ng point block. Hindi ito mga linya, kaya hindi ito kinukuha ng linework reader. Ipinapakita ng seksyon kung ilan ang nakita nito at hinahayaan kang kunin ang mga ito bilang **survey points**:

1. Lagyan ng tsek ang **Kunin ang … level bilang survey points**. Hindi ito naka-tsek sa simula, dahil hindi bawat numero sa drawing ay taas.
2. Binabasa ang text kapag ito ay level na mag-isa: numerong may decimal part (`104.37`, `+104,37`, `-3.50`), o numerong kasunod ng `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` o `LEVEL`, na may opsyonal na `m`, `ft` o `'` sa dulo. Ang buong numero lang (`12`) ay binabasa bilang numero ng lot o sheet, hindi level; ang text tulad ng `GATE 3` o petsa ay hindi kailanman binabasa. Hindi pinapansin ang mga text formatting code.
3. Para sa block attributes, piliin ang **Block attribute na may hawak ng level**. Hinahanap ng CivilCraft nang kusa ang tag na ELEV, Z, LEVEL, RL o katulad; pumili ng iba mula sa listahan kung sariling pangalan ang gamit ng drawing. Naaalala ang pagpili para sa file name na iyon sa computer na ito, kaya magsisimula sa parehong tag kapag binuksan ulit. Ang tag na pipiliin mo ay tumatanggap din ng buong numero bilang level.
4. I-click ang {{ui:Idagdag}}. Nilalagyan ng numero ang mga point pagkatapos ng pinakamataas na numero sa project, bawat point ay inilalarawan ayon sa layer nito (o block), at kinokonberte ang mga taas sa unit ng project gaya ng iba pang bahagi ng drawing. Isang step ang lahat: inaalis ng {{key:Mod+Z}} ang mga point.

Nasa sarili nitong insertion point ang text (o alignment point nito kapag mayroon). Hindi binabasa ang text sa loob ng mga block, at hindi kailanman binabago ang drawing.

## Ang check

Tumatakbo ang check sa ini-import mo at inililista ang nahanap nito, isang linya para sa bawat uri ng problema:

| Sinasabi nito | Ano ang ibig sabihin |
|---|---|
| **Units not stated** | Hindi sinasabi ng drawing kung ano ang unit nito, kaya binabasa ang mga numero nito bilang unit ng project. I-check ang isang distansyang alam mo. |
| **Units converted** | Iba ang unit ng drawing sa project at isinasaklaw (scaled) ito (paalala, hindi kasalanan). |
| **The data spans … km** o **… m** | Mas malaki sa 200 km o mas maliit sa kalahating metro ang saklaw, na kadalasang maling unit (millimeter na binasa bilang metro, o kabaligtaran). |
| **No coordinate system** | Walang coordinate system ang project. Babala ito kapag malayo sa zero ang data, gaya ng state plane o national grid coordinates. Tingnan ang [Coordinate systems](topic:coordinate-systems). |
| **Far from the origin** | Mahigit 100 km mula sa zero ang data. Kapag malayo sa zero, nawawalan ng precision at nanginginig ang 3D views at exports. |
| **Contour layer … has no height** | Ang layer na may pangalang gaya ng contour (TOPO, CONT, CNTR, CONTOUR) ay may mga linyang nasa taas na 0, kaya magiging patag ang lupang gagawin mula rito. |
| **Levels exactly 0** | Ilan sa mga level ay 0 samantalang malayo rito ang karaniwang level: malamang nawawala ang mga taas. |
| **Levels far from the rest** | Ilang level ay malayo sa labas ng iba (sinusukat laban sa gitna ng lahat ng level, kaya hindi namamarkahan ang matarik na site na may malawak na range), o nasa itaas ng 9,000 m o nasa ibaba ng -11,000 m. |
| **Points on top of another point** | Dalawang point sa iisang lugar na may iisang level, o magkaibang level. |

Pagkatapos mong i-click ang {{ui:Idagdag}}, mapupunta ang parehong linya sa **Problema**, isa para sa bawat uri, kasama ang file name, para mabalikan mo. Hindi binabago ng check ang drawing; hinuhusgahan lang nito ito, at hindi ka nito pinipigilang gamitin ang drawing.

:::tip
Kapag sinabi ng check na patag sa 0 ang mga contour at may mga level na nakasulat bilang text, kunin ang mga level bilang survey points: kadalasan dala nila ang totoong taas na wala sa mga contour line.
:::

## Hindi tinitingnan

Hindi inihahambing ng check ang drawing sa pangalawang survey, at hindi nito matukoy kung aling coordinate system ang gamit ng drawing: sinasabi lang nitong walang itinakdang coordinate system.
