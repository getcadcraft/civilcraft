---
title: Magdisenyo ng hardin, mula simula hanggang dulo
summary: Ang sampung hakbang ng landscape architect, mula sa survey hanggang sa na-publish na set, kasama kung ano ang ginagawa ng Landscape workspace para sa bawat isa ngayon at kung ano ang hindi pa nito ginagawa.
keywords: tutorial, walkthrough, paano, landscape design, garden design, pagsisimula, halimbawa, sample, hakbang-hakbang, survey, linework, terrain, planting, schedule, sheets, publish, isang project
from: 87900bf5
---

Umiikot ang landscape design: survey, sketch, linework, ground, {{ui:Mga lugar}}, {{ui:Mga level}}, planting, schedule, sheets, at pabalik muli. Ito ang sampung hakbang, kasama kung ano ang meron para sa bawat isa. Kung may puwang ang isang hakbang, tinutukoy ito sa **Not built yet** sa dulo, at hindi nakatago sa loob ng hakbang.

Maaari mong sundan sa sample site, o sa sarili mong survey drawing. Kung sarili mo, magsimula sa hakbang 1.

## 1. I-bring in ang survey

{{ui:Surface}} › {{ui:Linework mula sa drawing…}}, piliin ang survey drawing (DWG 2000–2018 o DXF). Tingnan ang units, kunin ang contour, 3D polyline at boundary para sa surface, at ang point block bilang survey point. Binabasa ng seksyong **Survey levels and check** ang mga level na nakasulat bilang text o bilang attribute, at inililista ang mga mukhang mali (units, coordinate system, layo mula sa zero, patag na contour, kakaibang level, dobleng punto) bago ka magdagdag ng kahit ano. Tingnan ang [Suriin ang survey drawing sa pag-import](topic:survey-check) at [Buksan ang DWG o DXF bilang linework](topic:open-dwg-dxf). Itakda ang coordinate system gamit ang {{ui:Coordinate system…}}.

## 2. Mga hand sketch

Ang sheet sa papel, gaya ng lumang survey o minarkahang print, ay ipinapasok gamit ang {{ui:Scan…}} (Magsimula sa scan): inilalagay ito sa tamang scale o sa kilalang coordinates sa ilalim ng plano, at maaaring i-trace bilang linework. Nababasa ng ModelCraft ang larawan ng hand sketch (File › I-import ang sketch photo…). Walang tool ang CivilCraft mismo para sa hand sketch: ilagay ang sheet sa ilalim ng plano at gumuhit sa ibabaw nito.

## 3. Mula sketch tungo sa linework

Gumuhit ng feature line at outline sa ibabaw ng survey sa CivilCraft, o gumuhit sa 2D drawing. Landscape › {{ui:Higit pa}} › {{ui:Mula sa linya}} ay ginagawang paving, planted area, pader, hakbang, feature line at iba pa ang isang linya, at nananatiling naka-link: ililipat mo ang linya, susunod ang object. Tingnan ang [Mga object mula sa linework](topic:objects-from-lines). Sa SuperCad Studio, buksan ang site, ang drawing at ang building model sa iisang project: ang **Landscape** workspace ay may mga tool ng lahat ng ito, at ang linyang piniling sa 2D drawing ay maaaring maging landscape object na susunod dito (Ctrl+K, {{ui:Landscape object mula sa napiling drawing line}}).

## 4. Ang iminungkahing ground

Buksan ang {{ui:Surface}} › {{ui:Higit pa}} › {{ui:Landscape workspace}}. Gumawa ng iminungkahing ground gamit ang {{ui:Platform}}, {{ui:Berm}}, {{ui:Swale}} at mga grading area na may spot level at contour; ang paving, path, pader, ramp at hakbang na idinadagdag mo ay ina-grade sa parehong iminungkahing surface. Hindi kailanman nagbabago ang umiiral na ground. {{ui:Mga level}} › {{ui:Mga ground modifier…}} ay naglilista ng lahat ng humuhubog sa ground sa iisang pagkakasunod-sunod, kasama ang cut at fill ng bawat isa. Tingnan ang [Grading](topic:landscape-grading) at [Ground modifiers at live level](topic:ground-modifiers).

## 5. Paving at mga planted area

{{ui:Hardscape}} › {{ui:Paving}}, {{ui:Path}}, {{ui:Wall}}, {{ui:Kerb}}, {{ui:Ramp}} at {{ui:Steps}}. {{ui:Mga lugar}} ay gumuguhit ng lawn, bed, meadow o groundcover kasama ang build-up nito; awtomatikong nagka-clip ito sa paligid ng paving, pader at hakbang. {{ui:Bed}} ay pumupuno ng area sa spacing ng mga halaman, mula sa halo ng mga halaman. Tingnan ang [Hardscape](topic:hardscape), [Mga planted area](topic:planted-areas) at [Planting](topic:planting).

## 6. Mga level, slope at junction

Sa ilalim ng **Grading checks**, lagyan ng tsek ang **Slope analysis** at **Flow arrows and ponding**. Kung may naiipong tubig sa tabi ng terrace, maglagay ng {{ui:Swale}} sa paligid nito. Sinasabi ng Properties kung ilang riser ang kailangan ng mga hakbang at kung kasya ang mga ito, at kung saan mas matarik ang path kaysa sa limitasyon nito. Inililista ng Problems panel kung saan hindi maayos ang pagtatagpo ng mga object: pader na sobra ang taas, bed na mas mataas sa paving, hakbang na hindi tumatama sa landing nito. {{ui:Spot level}} at {{ui:Gradient arrow}} ay nagbibigay ng label sa ground at kusang nag-a-update.

## 7. Planting

Sa **Plants**, hanapin sa plant list (ilang daang species, o sarili mong listahan), pumili ng isa, at piliin ang {{ui:Plant}}, {{ui:Bed}} o {{ui:Hedge}}. Itakda ang laki at mga label ng halaman mula sa {{ui:Higit pa}}. Ang {{ui:Higit pa}} › {{ui:Plant table}} ang nag-e-edit ng sarili mong record: cultivar, ibinigay na laki, density, mga tala ng specification. Maaaring magdala ang bawat record ng sarili mong symbol at 3D model (OBJ, STL o GLB), at ang {{ui:Higit pa}} › {{ui:Plant graphics}} ay gumuguhit ng mga halaman nang mas simple sa mas magaspang na scale. Tingnan ang [Ang plant list](topic:plant-list), [Mga plant record](topic:plant-records) at [Plant graphics](topic:plant-graphics).

## 8. Mga dami at iskedyul

{{ui:Higit pa}} › {{ui:Worksheets}}: ang plant at hardscape schedule, at ang sarili mo, ay nananatiling naka-link sa mga object; i-save ang mga ito bilang CSV o XLSX o ilagay sa mga sheet (tingnan ang [Worksheets](topic:worksheets)). {{ui:Higit pa}} › {{ui:Iskedyul ng halaman…}} ay ipinapadala ang mga bilang sa TakeoffCraft. Nasa Properties ng paving, pader at hakbang ang mga hardscape quantity. May sarili itong bill of materials ang irrigation: {{ui:Irrigation}} › **Suriin ang system…**. Tingnan ang [Irrigation](topic:irrigation).

## 9. Mga drawing at sheet

{{ui:Higit pa}} › {{ui:Landscape sheets…}}: planting, grading at irrigation plan, kasama ang details. {{ui:Mga level}} › {{ui:Section line}} ay gumuguhit ng mga section sa ground, pader, build-up, hakbang at halaman. Tingnan ang [Landscape sheets](topic:landscape-sheets) at [Mga section at ang publish set](topic:landscape-sections).

## 10. I-publish

{{ui:Publish set (.zip)}} sa Sheets dialog ay gumagawa ng isang PDF na may listahan ng sheet at isang DWG bawat sheet. {{ui:Higit pa}} › {{ui:Export landscape IFC}} ay nagbibigay sa BimCraft ng mga halaman at ng hardscape. I-save ang project: nasa iisang file ang lahat.

## Baguhin ang isang bagay: ang hagdan

Ang punto ng pagtatago ng lahat sa iisang project ay dumadaloy ang bawat pagbabago. Subukan ito gamit ang isang flight ng hakbang sa pagitan ng dalawang terrace:

1. Iguhit ang linya ng flight bilang feature line (o linya sa drawing), pagkatapos ay {{ui:Mula sa linya}} › {{ui:Steps}} sa Landscape › {{ui:Higit pa}}. Sa Properties ng mga hakbang, lagyan ng tsek ang **Shapes the ground**, at itakda ang bottom at top level sa dalawang terrace.
2. Gumuhit ng planted bed sa tabi at sa ilalim ng flight gamit ang {{ui:Mga lugar}}, at paving sa mga terrace. Nagka-clip ang bed sa paligid ng mga hakbang at paving, at binibilang ng plant schedule ang nakatanim lang.
3. Itaas ang top level ng flight sa Properties. Agad na nagbabago ang iminungkahing ground, ang spot level, ang gradient arrow, at ang cut at fill. Kung hindi na tumatama ang flight sa itaas na terrace, sinasabi ng Problems panel kung gaano kalaki ang agwat.
4. Ilipat ang linya ng flight. Sumusunod ang mga hakbang sa linya nila sa iisang undo step; muling nagka-clip at muling binibilang ang bed, at ipinapakita ng mga worksheet at schedule ang bagong bilang.
5. Pindutin nang isang beses ang Ctrl+Z: babalik nang sabay ang linya, ang mga hakbang, ang ground at ang bed.

Tingnan ang [Ground modifiers at live level](topic:ground-modifiers), [Mga planted area](topic:planted-areas) at [Worksheets](topic:worksheets).

## Hindi pa nagagawa

Ito ang mga hinihingi pero wala pa sa build na ito:

- Mga pader na humuhubog sa ground (iniuulat nila kung saan sila nagtatagpo, at maaaring sumunod dito ang tuktok nila).
- Pag-e-edit ng sarili mong Library plant list sa app (i-edit ang listahan ng project at i-save ito bilang plants file).
- Texture at kulay ng sarili mong GLB plant model (nababasa ang hugis; ginagamit ang kulay ng halaman).

Tingnan ang [Ang Landscape workspace](topic:landscape) para sa bawat tool.
