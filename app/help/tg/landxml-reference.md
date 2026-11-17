---
title: LandXML: чи хонда ва чи навишта мешавад
summary: Элементҳо ва атрибутҳои LandXML 1.2, ки CivilCraft мехонад ва менависад, элемент ба элемент, ва ҳар он чи мегузарад.
keywords: landxml, xml, cgpoints, сатҳ, tin, хатҳои шикаста, сарҳад, трасса, coordgeom, профил, profalign, pvi, paracurve, pipenetworks, struct, қубур, planfeatures, planfeature, хатти хусусият, схема
from: ca3cf359
---

CivilCraft LandXML 1.2-ро бо фазои номҳои расмӣ ва ҷойгиршавии схема менависад. Он ҳар файлеро, ки решаи он `LandXML` аст, мехонад ва элементҳои зеринро бо ном мегирад (префиксҳои фазои ном нодида гирифта мешаванд; версия санҷида намешавад). Хонандаи XML-и он танҳо панҷ ҳавлаи стандартӣ ва истинодҳои рақамии аломатҳоро қабул мекунад; ҳеҷ гоҳ DTD ё файли беруна бор намекунад. Барои қадамҳо ба [Мубодилаи LandXML](topic:landxml) нигаред.

LandXML координатаҳоро аввал шимолӣ менависад: нуқта «N E» ё «N E Z» аст.

## Навишташуда

| Элемент | Чӣ CivilCraft менависад |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, майдонҳо бо фути мураббаъ, ҳаҷмҳо бо ярди кубӣ, диаметрҳо бо дюйм) ё `Metric` (метр, метри мураббаъ, метри кубӣ, миллиметр) |
| `Project` | `name` = номи лоиҳа |
| `Application` | номи CivilCraft, истеҳсолкунанда CadCraft |
| `CgPoints` / `CgPoint` | `name` = рақами нуқта, `desc` = тавсиф, `code` = гурӯҳ; матн «N E Z» (ё «N E» бе баландӣ) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw ё ccw, `radius`, `length`, `staStart`, `chord`, `delta` (дараҷа), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | замини мавҷуда дар тули трасса, ҳамчун ҷуфтҳои пикет ва баландӣ (`PntList2D`), ки дар ҷое, ки аз сатҳ мебарояд, тақсим мешавад |
| `Profile` / `ProfAlign` | профили тарҳ (бо номи «<трасса> design»): `PVI` барои охирҳо ва нуқтаҳои кунҷ, `ParaCurve` бо `length` барои хамҳои амудӣ |
| `Surfaces` / `Surface` | `name` ва `desc`; аввал замини мавҷуда, баъд «Proposed», вақте ки майдончаҳо ё коридорҳо ҳамвор мешаванд |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (танҳо замини мавҷуда) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (танҳо замини мавҷуда, агар бошад) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` бо `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm ё sanitary (ливнӣ ё санитарӣ) |
| `Struct` | `name`, `elevRim` (лаби истифодашуда, муқаррарӣ ё аз сатҳ), `elevSump` (таги чоҳ); `Center`; `CircStruct` бо `diameter`; `Invert` бо `elev`, `flowDir` in ё out (ворид ё баромад), `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` бо `diameter` |
| `PlanFeatures` / `PlanFeature` | як барои ҳар хатти хусусият: `name`; `CoordGeom` бо `Line` (`length`, `Start`, `End`) ва `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` ва `End` ҳамчун «N E Z», `Center` ҳамчун «N E»); `Feature` `code="CivilCraft"` бо `Property` use ва closed |

Навишта намешаванд: майдончаҳо ва коридорҳо ҳамчун объект (натиҷаи онҳо сатҳи «Proposed» аст), трассаҳои хатодор, қубурҳо бе ҳар ду поён, қоидаҳои шабака.

## Хонда мешавад

| Элемент | Чӣ CivilCraft мегирад |
|---|---|
| `Units` | `Imperial` ё `Metric` ва `linearUnit`-и он фут ё метрро муайян мекунанд. Воҳиди ношинос қайд мешавад. |
| `Project` | `name` номи лоиҳа мешавад. |
| `CgPoints` / `CgPoint` (инчунин ҷойгиршуда) | ном (ё `oID`), «N E» ё «N E Z», `desc` (ё `code`) ҳамчун тавсиф |
| `Surface` бо `Definition surfType="TIN"` | `Pnts` ва `Faces` ҳамчун замини мавҷуда (танҳо сатҳи аввал); рӯяҳои ноаён (`i="1"`) гузаронида мешаванд |
| `SourceData` / `Breaklines` | хатҳои шикастаи 3D, бо сатҳ нигоҳ дошта мешаванд |
| `SourceData` / `Boundaries` | сарҳади берунӣ |
| `Alignment` / `CoordGeom` | элементҳои `Line` ва `Curve`; PI-ҳо аз `PI`-и ҳар хам ё аз `Center` ва мамосҳо аз нав сохта мешаванд; `staStart` |
| `Profile` / `ProfAlign` | `PVI` ва `ParaCurve` (бо `length`); аввалин профили тарҳ, ки на кам аз ду PVI дорад |
| `PlanFeatures` / `PlanFeature` | ҳар кадом ҳамчун хатти хусусият: `Line`, `Curve` (`Start`, `Center`, `End` ва `rot`-и он) ва `IrregularLine` (`PntList3D` ё `PntList2D`) пайваста аз охир то охир (фосила бо хатти рост пур карда мешавад ва қайд мешавад); баста, агар дар ҷои оғозаш тамом шавад; `use` ва `closed` аз `Feature`-и худи CivilCraft, вагарна **Танҳо кашида**. Нуқтаҳои бе баландӣ 0 мегиранд (қайд мешаванд). |
| `Spiral` | спиралҳои клотоидӣ дар паҳлӯи `Curve` (ворид ва баромад; ҳамчун PI бо радиус ва дарозии спиралҳо хонда мешаванд, бо `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant` бознавис мешаванд) |
| `PipeNetwork` | аввалин шабакае, ки қубур дорад: `Struct` (`Center`, `elevRim`, `elevSump`, диаметри `CircStruct`, `Invert` барои ҳар қубур) ва `Pipe` (`refStart`, `refEnd`, диаметри `CircPipe`) |

## Гузаронида мешаванд ва дар қайдҳо номбар мешаванд

- сатҳҳои пас аз аввалин, сатҳҳои тӯр ва дигар сатҳҳои ғайри TIN
- трассаҳое, ки элементҳои `IrregularLine` ё `Chain` доранд, спиралҳои ғайр аз клотоидӣ, спирал байни ду `Curve`, ё трассаҳое, ки геометрия надоранд
- профилҳои тарҳи пас аз аввалин; хамҳои амудии `CircCurve` ва `UnsymParaCurve` (PVI-ҳояшон бе хам нигоҳ дошта мешаванд)
- нуқтаҳое, ки танҳо ба нуқтаҳои дигар ишора мекунанд (`pntRef`), ва нуқтаҳое, ки координатаашон хонда намешаванд
- номҳои такрории нуқта (аввалинаш нигоҳ дошта мешавад)
- сарҳадҳои пинҳон, нишон ва буридани маълумот; хатҳои шикаста бе нуқтаҳои 3D
- шабакаҳои қубур пас аз аввалин; намудҳои шабака ғайр аз ливнӣ ва санитарӣ (ҳамчун ливнӣ хонда мешаванд)
- сохторҳои росткунҷа, воридшавӣ ва баромад (ҳамчун доиравӣ хонда мешаванд); қубур ва канали тухмшакл, эллиптикӣ ва қуттӣ (ҳамчун қубурҳои доиравии бе андоза хонда мешаванд)
- элементҳои `Spiral` дар хатҳои хусусияти нақша
- `Parcels`, `Roadways`, `GradeModel` ва `Survey`

Профилҳои замин (`ProfSurf`) дар файл истифода намешаванд: CivilCraft замин аз худи сатҳ мегирад.

## Паёмҳо, вақте ки файл кушода намешавад

| Паём | Маънӣ |
|---|---|
| «Ин XML аст, вале LandXML не (элементи решаи он <…> аст).» | Файл навъи дигари XML аст. |
| «… нуқта, сатҳи TIN ё трассаро надорад, ки CivilCraft метавонад бихонад.» | Ҳама чиз дар файл дар феҳристи гузаронидашуда аст. Қайдҳои пас аз он мегӯянд, ки чӣ буд. |
| «Mismatched end tag …», «Unclosed tag …», «The file ends inside …» | Файл вайрон ё кӯтоҳ шудааст. |
