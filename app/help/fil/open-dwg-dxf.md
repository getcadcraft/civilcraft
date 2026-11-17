---
title: Buksan ang DWG o DXF bilang linework
summary: Buksan ang linework ng drawing sa plan, layer por layer, gamitin ang mga contour, 3D polyline at saradong outline nito para sa surface, at gawing survey point ang mga point block nito.
keywords: survey check, text na elevation, dwg, dxf, cad, drawing, linework, contours, breaklines, boundary, polyline, 3d polyline, layers, base map, topo, survey drawing, blocks, block references, survey point mula sa blocks, attributes, point blocks, insertion point
from: da0f4c58
---

Madalas dumating ang topographic survey bilang drawing: mga contour bilang polyline sa kanilang elevation, mga breakline bilang 3D polyline, at ang outline ng site bilang saradong polyline. Binubuksan ng CivilCraft ang **model space** ng drawing bilang mga layer sa plan, at maaaring gawing surface nang direkta ang mga linyang iyon.

## Buksan ang drawing

1. I-click ang {{ui:Linework}} sa grupong **Surface** (o {{ui:Buksan}}, o i-drop ang file sa plan) at pumili ng `.dwg` o `.dxf` na file. Binabasa ang drawing sa computer na ito; walangina-upload. Nababasa ang DWG mula 2000 hanggang 2018 at ASCII DXF.
2. Inililista ng dialog na **Linework** ang mga layer ng drawing na may hawak na linya, saradong hugis o punto, at kung may **elevation** ang mga ito. Ang mga layer na naka-off sa drawing ay nagsisimulang hindi naka-tick. Ang teksto, hatch, dimension at iba pang object na hindi linework ay binibilang at iniiwan (sinasabi ng dialog kung alin).
3. Suriin ang **Drawing units**. Kapag sinasabi ng drawing ang mga unit nito, kino-convert ito ng CivilCraft sa unit ng project (millimeter sa metro, metro sa feet, inch sa feet). Ang drawing sa feet ay binabasa bilang US survey feet nang walang scaling: nagkakaiba ang dalawa ng 2 parts per million, at ang pag-scale ng state plane coordinates sa ganoon ay maglilipat sa mga ito nang ilang feet. Kapag hindi sinasabi ng drawing ang mga unit nito, binabasa ang mga numero nito sa unit ng project; pumili ng tamang unit sa listahan kung hindi ito tama.
4. Sa **Gamitin para sa surface**, piliin kung ano ang ibinibigay ng bawat layer sa surface (o iwanan ang **Ipakita lang**). Nagsisimula bilang breakline ang mga layer na pinangalanang tulad ng contour (TOPO, CONT, CNTR) na may elevation.
5. I-click ang {{ui:Idagdag}}. Lalabas ang mga layer sa ilalim ng **GIS layers** sa kaliwang panel; ilalagay ang bawat gamit sa surface. Sariling hakbang ang bawat bahagi: binabawi ito ng {{key:Mod+Z}} nang isa-isa.

## Ang maibibigay ng bawat uri ng layer

| Hawak ng layer | Gamitin para sa surface |
|---|---|
| Mga contour (polyline sa isang elevation) | Mga breakline sa sariling elevation ng mga linya, o sa field na ELEV |
| 3D polyline | Mga breakline sa sarili nilang elevation |
| Saradong outline | Ang boundary ng surface (ang pinakamalaking saradong hugis, o ang napili mo) |
| Mga punto na may elevation | Survey point, inilalarawan ng pangalan ng layer |
| Mga linya sa elevation 0 (plan linework) | Wala: nananatili ito sa plan bilang base drawing |

Ang drawing na isinulat ng CivilCraft ay naglalaman ng mga feature line nito bilang 3D polyline na nakatatandaan ang kanilang mga arko. Ipinapakita noon ng dialog ang **Feature lines**: iwanang naka-tick para ibalik ang mga ito bilang feature line na may kanilang mga arko at gamit (isang undo step), o alisin ang tick para basahin ang mga ito bilang linework tulad ng ibang layer.

Kalaunan, gamitin ang {{ui:Gamitin para sa surface}} sa menu ng layer sa ilalim ng **GIS layers** para gawin din ito sa layer na ipinakita mo lang.

## Survey point mula sa blocks

Madalas gawing block ng mga survey drawing ang kanilang mga punto: maliit na symbol sa bawat shot, na may attribute para sa numero ng punto, description at elevation. Kapag may block reference ang drawing, may seksiyong **Survey point mula sa blocks** ang dialog:

1. I-tick ang mga block na kukunin (sinasabi ng table kung ilang reference ang bawat isa, sa aling mga layer, at aling mga attribute), o i-tick ang mga layer para kunin ang bawat block reference sa mga ito.
2. Piliin kung saan manggagaling ang **numero**, **description** at **elevation** ng bawat punto: isang attribute, ang pangalan ng block o layer, ang mga susunod na libreng numero, o ang Z ng insertion point. Nagsisimula ang CivilCraft sa mga malamang na attribute (PT, DESC, ELEV at katulad), at kinukuha lang ang elevation mula sa attribute kapag nasa zero ang mga block.
3. Alisin ang tick sa mga layer ng linework kung mga punto lang ang gusto mo, saka i-click ang {{ui:Idagdag}}.

Ang bawat reference ay nagiging isang survey point sa insertion point nito. Tanging ang mga reference na nasa model space ang binibilang; hindi ang mga block na nasa loob ng ibang block. Ang mga numerong nasa project na, o ginamit nang dalawang beses sa drawing, ay bibigyan ng mga bagong numero pagkatapos ng pinakamataas, at ang elevation attribute na hindi numero ay iiwan ang punto na walang elevation; binibilang ito ng status line. Hindi kailanman binabago ang drawing, at naaalala ng bawat punto ang block nito: ipinapakita ng Properties nito ang **From block** kasama ang block, layer at handle. Isang hakbang ang pagdagdag ng mga punto, kaya inaalis ng {{key:Mod+Z}} ang lahat ng ito.

## Mga level na nakasulat bilang teksto, at ang check

Ang spot level na nakasulat bilang teksto (o sa block attribute na hindi survey point block) ay hindi linework. Maaaring kunin ito ng seksiyong **Survey levels and check** bilang survey point, at inililista nito ang mali sa drawing: unit, coordinate system, layo mula sa zero, patag na contour, kakaibang level, dobleng punto. Tingnan ang [Check a survey drawing on import](topic:survey-check).

## Paano binabasa ang drawing

- Ang arko, bilog, ellipse, bulged polyline segment at spline ay nagiging maiikling tuwid na piraso (bawat 5° pinakamarami).
- Iginuguhit ang block reference kung saan ito nakalagay, pati ang mga nested block; ang anumang nasa layer 0 ng block ay kukuha ng layer ng reference.
- Inilalagay sa world coordinates ang mga object na iginuhit sa ibang eroplano (ibang extrusion direction).
- Bawat object ay may tatlong field: LAYER, TYPE (uri ng object) at ELEV (elevation nito kapag iisa ang elevation ng lahat ng punto nito).
- Kinukuha ang mga coordinate nang ayon sa mga ito: dapat gumamit ang drawing ng parehong coordinate ng project (halimbawa, parehong state plane zone). Hindi binubuksan ang mga naka-link na drawing (xref): buksan ang mga ito nang hiwalay.

:::tip
Pinakamahusay na surface ang ibinibigay ng contour drawing na may ilang spot elevation sa mga tuktok at lubak, kung saan ang mga contour lang ay nag-iiwan ng patag na tatsulok. Idagdag ang mga ito bilang survey point, o mula sa points layer sa drawing.
:::
