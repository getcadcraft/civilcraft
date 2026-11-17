---
title: Feature lines
summary: Gumuhit ng 3D na linya na ginagradehan mo vertex bawat vertex, gumawa ng stepped offset nito, at gamitin ang mga ito bilang breakline ng lupa o bilang sloped pad sa disenyo.
keywords: arko, curve, radius, 3d arc, helix, curved curb, grade overlay, elevation overlay, grade arrows, feature line, grade, slope, elevation, stepped offset, offset, breakline, curb, ditch, berm, sloped pad, daylight, grading, 3d polyline
from: d55b25fb
---

Ang feature line ay linyang may elevation sa bawat vertex: isang curb, linya ng daloy ng ditch, tuktok ng berm, o gilid ng sloped pad. Itinatakda mo ang elevation nito sa pamamagitan ng numero o grade, kinokopya ito pagilid na may step pataas o pababa, at pinipili mo kung ano ang gagawin ng mga surface dito.

## Gumuhit ng isa

1. Pumili ng **Surface** › {{ui:More}} › {{ui:Feature line}}, o pindutin ang {{key:L}}.
2. I-click ang mga vertex nito sa plano. Ang click sa survey point ay kumukuha ng puwesto at elevation ng point; kahit saan pa, kinukuha ng vertex ang elevation ng umiiral na lupa roon.
3. Pindutin ang {{key:Enter}} para tapusin ang bukas na linya, o i-click muli ang unang vertex para isara ito.

Napipili ang bagong linya at nagsisimula bilang breakline ng umiiral na lupa, nakapatong sa lupa.

## Mga arko

Maaaring arko sa plano ang isang segment na ang mga dulo ay nasa magkaibang elevation: isang curb return, isang curved ditch, o rampa na lumiliko. Pantay na tumatakbo ang grade nito sa kahabaan ng arko, at ang haba nito ay sinusukat sa kahabaan ng kurba.

- **Habang gumuguhit:** pindutin ang {{key:C}} (sa touch screen, ang {{ui:Arc}} sa bar sa ibabaw ng plano) para i-on ang mga arko. Pagkatapos ng isang vertex, i-click ang punto sa kurba, saka i-click kung saan nagtatapos ang arko. Pindutin muli ang {{key:C}} para sa tuwid na segment. Inaalis muna ng {{key:Backspace}} ang punto sa kurba.
- **Pagkatapos:** sa **Properties**, i-type ang radius at direksyon ng pagliko sa **Arko** box ng vertex, halimbawa `50 L` o `50 R` (kaliwa o kanan habang naglalakad ka sa linya), at pindutin ang {{key:Enter}}. Burahin ang laman ng box para maging tuwid muli ang segment. Tinatanggihan ang radius na mas maliit sa kalahati ng segment.

Ipinapakita ng napiling linya ang radius ng bawat arko sa tabi ng grade nito. Ang **Length** ay sa kahabaan ng mga arko sa plano; ang **3D length** ay kasama rin ang pagtaas at pagbaba. Pinananatili ng stepped offset ang mga arko: lumalaki ang arkong nasa labas ng liko, lumiliit ang nasa loob, at tinatanggihan ang offset na lalampas sa sentro ng arko.

Kinukuha ng mga surface, ng 3D view, at ng DXF at DWG ang bawat arko bilang maiikling tuwid na piyesa na nananatili sa loob ng 0.01 ng kurba. Pinapanatili ito ng LandXML bilang mga arko (tingnan ang **Mga arko sa ibang file** sa ibaba).

## Itakda ang elevation at grade

Inililista ng **Properties** ang mga vertex kasama ang kanilang layo sa kahabaan ng linya, ang **Elevation** nila at ang **Grade to next** (sa porsyento). I-type ang alinman at pindutin ang {{key:Enter}}:

- Ang elevation ay gumagalaw lamang sa vertex na iyon.
- Ang grade ay nagtatakda ng elevation sa kabilang dulo ng segment nito; nananatili sa puwesto nila ang mga vertex pagkatapos nito, kaya nagbabago ang grade ng susunod na segment.

Sa **Properties** din:

| Aksyon | Ano ang ginagawa nito |
|---|---|
| **Itaas o ibaba lahat ng** | Idinadagdag ang taas na i-type mo sa bawat vertex. |
| {{ui:Elevations from the ground}} | Ibinabalik ang bawat vertex sa umiiral na lupa (ang mga vertex na wala sa surface ay nananatili ang sa kanila, at nakalista). |
| {{ui:One grade, first to last}} | Pinananatili ang una at huling elevation at inilalagay ang mga vertex sa gitna sa iisang pantay na grade. |

Ipinapakita ng napiling linya ang mga elevation nito sa vertex at ang mga grade nito sa kahabaan ng segment sa plano. I-drag ang vertex gamit ang {{ui:Select}} para ilipat ito; nananatili ang elevation nito.

## Stepped offsets

Sa ilalim ng **Stepped offset**, i-type ang **Distance** (positibo sa kanan ng direksyon ng linya, negatibo sa kaliwa), saka ang taas (pataas o pababa ng) o slope sa porsyento, at i-click ang {{ui:Make the offset line}}. Bagong feature line ang kopya: halimbawa, ang likod ng curb na 0.5 ft sa gilid at 0.5 ft na mas mataas, o gilid ng ditch na 6 ft palabas sa 2 %. Tinatanggihan ang distansiyang magtutupi sa kopya sa sarili nito sa masikip na liko.

## Grades at elevations sa screen

Pindutin ang {{key:E}}, o i-tick ang **Grades and elevations on feature lines** sa ilalim ng Display, para makita ang grade ng bawat feature line sa kahabaan ng bawat segment (may maliit na arrow na nakaturo pababa) at ang elevation nito sa mga vertex. Sa screen lamang ang mga ito lumalabas: walang idinadagdag sa drawing, at nananatiling pareho ang PDF, DXF at DWG. Hindi nilalagyan ng label ang maiikling segment at siksik na vertex hanggang mag-zoom in ka. Palaging ipinapakita ng napiling linya ang sarili nitong grade at elevation.

## Sa profile view

Ang feature line na tumatawid sa alignment ay lumalabas sa profile view ng alignment na iyon, kasama ang pangalan at elevation nito sa tawiran; maaari ring ipakita ang mga linyang tumatakbo sa tabi nito. Tingnan ang [Magdisenyo ng vertical profile](topic:profile).

## Ano ang ginagawa ng mga surface dito

Piliin ang **Use**:

| Use | Ano ang mangyayari |
|---|---|
| Breakline ng umiiral na lupa | Dumadaan ang umiiral na lupa sa linya sa mga elevation nito, gaya ng iginuhit na breakline. |
| Ginradehan sa disenyo | Ang **sarado** na linya ay nagiging sloped pad: ang proposed surface sa loob nito ay ginradehan hanggang sa gilid nito. I-on ang **Daylight to the ground** para gumawa ng cut at fill slopes (pahalang sa 1 patayo) mula sa gilid nito papunta sa lupa, gaya ng pad; nagsisimula ang bawat slope sa sarili ng elevation ng gilid doon. |
| Iginuhit lamang | Nananatili ito sa plano at napupunta sa DXF, DWG at PDF (layer C-GRAD-FEAT, 3D polylines), pero hindi ito pinapansin ng mga surface. |

Kasama sa mga volume, section at sa 3D view ang mga feature line na ginradehan sa disenyo, gaya ng mga pad. Isang hakbang ang bawat pagbabago: binabawi ito ng {{key:Mod+Z}}.

## Pagbabahagi ng linya sa team

Sa drawing na binuksan mula sa iyong cloud files sa CadCraft Studio, sa team plan, ang Properties ng proyekto (kapag walang napili) ay may **Team** section na may {{ui:Team lines…}}: ang mga linyang ibinahagi ng team mo, bawat isa kasama ang revision nito, nang hindi muna pumipili ng feature line. Piliin ang linya para ibahagi ito, mag-push ng bagong revision, mag-pull ng sa team, o itigil ang pagbabahagi. Sa labas ng setting na iyon, sinasabi ng section kung ano ang kailangan nito.

## Mga arko sa ibang file

| File | Ano ang mangyayari sa feature line na may arko |
|---|---|
| CivilCraft project | Pinananatili nang eksakto. |
| LandXML | Isinusulat bilang plan feature ng mga linya at arko kasama ang kanilang elevation, at binabasa muli kasama ang mga arko nito. Ang feature line mula sa ibang program ay pumapasok bilang **Iginuhit lamang**: piliin ang **Use** nito para ilagay ito sa surface. |
| DWG at DXF | Hindi kayang maglaman ng arko ang 3D polyline, kaya isinusulat ang linya bilang maiikling piyesa sa loob ng 0.01 ng bawat arko. Itinatala rin ng CivilCraft sa drawing kung aling mga piyesa ang arko: kapag binuksan mo ang drawing bilang linework, ibinabalik ng {{ui:Feature lines}} ang mga linya bilang feature line kasama ang mga arko nito. Nakikita ng ibang program ang karaniwang 3D polyline. |
