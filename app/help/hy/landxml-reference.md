---
title: LandXML. ինչ է կարդացվում և գրվում
summary: LandXML 1.2 տարրերը և ատրիբուտները, որ CivilCraft-ը կարդում և գրում է, տարր առ տարր, և այն ամենը, ինչ բաց է թողնում։
keywords: landxml, xml, cgpoints, surface, tin, breaklines, boundary, alignment, coordgeom, profile, profalign, pvi, paracurve, pipenetworks, struct, pipe, planfeatures, planfeature, հատկանշական գիծ, սխեմա
from: ca3cf359
---

CivilCraft-ը գրում է LandXML 1.2 պաշտոնական անվանատարածքով և սխեմայի տեղադրությամբ։ Այն կարդում է ցանկացած ֆայլ, որի արմատային տարրն է `LandXML`, և վերցնում է ստորև թվարկված տարրերը անունով (անվանատարածքի նախածանցները անտեսվում են, տարբերակը չի ստուգվում)։ Նրա XML ընթերցիչը ընդունում է միայն հինգ ստանդարտ նշանակությունը և թվային նիշերի հղումները․ այն երբեք չի բեռնում DTD կամ արտաքին ֆայլ։ Քայլերի համար տես [Փոխանակել LandXML-ը](topic:landxml)։

LandXML-ը կոորդինատները գրում է սկզբում հյուսիսային (N), ապա արևելյան (E) ուղղությամբ. կետը «N E» կամ «N E Z» է։

## Գրված

| Տարր | Ինչ է գրում CivilCraft-ը |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, մակերեսները քառակուսի ֆուտով, ծավալները խորանարդ յարդով, տրամագծերը դյույմով) կամ `Metric` (meter, square meter, cubic meter, millimeter) |
| `Project` | `name` = նախագծի անունը |
| `Application` | անունը CivilCraft, արտադրողը CadCraft |
| `CgPoints` / `CgPoint` | `name` = կետի համարը, `desc` = նկարագրությունը, `code` = խումբը; տեքստ «N E Z» («N E»՝ առանց բարձրության) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw կամ ccw, `radius`, `length`, `staStart`, `chord`, `delta` (աստիճաններով), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | գոյություն ունեցող գետինը երթուղու երկայնքով՝ որպես կայան և բարձրություն զույգեր (`PntList2D`), բաժանված այն տեղից, որտեղ դուրս է գալիս մակերևույթից |
| `Profile` / `ProfAlign` | նախագծային պրոֆիլը (անվանված «<երթուղի> նախագիծ»)՝ `PVI` ծայրերի և անկյունային կետերի համար, `ParaCurve` `length`-ով ուղղաձիգ կորերի համար |
| `Surfaces` / `Surface` | `name` և `desc`; նախ գոյություն ունեցող գետինը, ապա «Proposed», երբ հարթակները կամ միջանցքները հարթեցվում են |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (միայն գոյություն ունեցող գետինը) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (միայն գոյություն ունեցող գետինը, երբ կա) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` `id`-ով; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm կամ sanitary |
| `Struct` | `name`, `elevRim` (օգտագործված եզրը՝ սահմանված կամ մակերևույթից), `elevSump`; `Center`; `CircStruct` `diameter`-ով; `Invert` `elev`-ով, `flowDir` in կամ out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` `diameter`-ով |
| `PlanFeatures` / `PlanFeature` | մեկը յուրաքանչյուր հատկանշական գծի համար՝ `name`; `CoordGeom`՝ `Line`-ով (`length`, `Start`, `End`) և `Curve`-ով (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` և `End`՝ «N E Z», `Center`՝ «N E»); `Feature` `code="CivilCraft"`-ով՝ `Property` օգտագործմամբ և փակ լինելով |

Չեն գրվում․ հարթակներն ու միջանցքները որպես օբյեկտներ (դրանց արդյունքը «Proposed» մակերևույթն է), սխալներով երթուղիները, երկու ինվերտ չունեցող խողովակները, ցանցի կանոնները։

## Կարդացված

| Տարր | Ինչ է վերցնում CivilCraft-ը |
|---|---|
| `Units` | `Imperial` կամ `Metric`-ը և դրա `linearUnit`-ը որոշում են ֆուտերը կամ մետրերը։ Անհայտ միավորը նշվում է։ |
| `Project` | `name`-ը դառնում է նախագծի անունը։ |
| `CgPoints` / `CgPoint` (նաև ներդրված) | անունը (կամ `oID`), «N E» կամ «N E Z», `desc` (կամ `code`)՝ որպես նկարագրություն |
| `Surface` `Definition surfType="TIN"`-ով | `Pnts` և `Faces`՝ որպես գոյություն ունեցող գետինը (միայն առաջին մակերևույթը)․ անտեսանելի երեսները (`i="1"`) բաց են թողնվում |
| `SourceData` / `Breaklines` | 3D կոտրվածքային գծեր, պահվում են մակերևույթի հետ |
| `SourceData` / `Boundaries` | արտաքին սահմանը |
| `Alignment` / `CoordGeom` | `Line` և `Curve` տարրեր․ PI-ները վերակառուցվում են յուրաքանչյուր կորի `PI`-ից կամ դրա `Center`-ից և շոշափողներից; `staStart` |
| `Profile` / `ProfAlign` | `PVI` և `ParaCurve` (`length`-ով)․ առաջին նախագծային պրոֆիլը, որ ունի առնվազն երկու PVI |
| `PlanFeatures` / `PlanFeature` | յուրաքանչյուրը որպես հատկանշական գիծ․ `Line`, `Curve` (դրա `Start`, `Center`, `End` և `rot`) և `IrregularLine` (`PntList3D` կամ `PntList2D`), միացված ծայր առ ծայր (բացը միացվում է ուղիղ հատվածով և նշվում է)․ փակ է, երբ վերջանում է, որտեղից սկսվել է; օգտագործումը և փակ լինելը վերցվում է CivilCraft-ի սեփական `Feature`-ից, հակառակ դեպքում՝ **Միայն գծված**։ Բարձրություն չունեցող կետերը ստանում են 0 (նշվում է)։ |
| `Spiral` | կլոթոիդ պարուրաձևեր `Curve`-ի կողքին (մուտքի և ելքի․ կարդացվում է որպես PI՝ շառավղով և պարուրի երկարություններով, գրվում է հետ `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`-ով) |
| `PipeNetwork` | առաջին ցանցը, որ ունի խողովակներ՝ `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` diameter, `Invert` յուրաքանչյուր խողովակի համար) և `Pipe` (`refStart`, `refEnd`, `CircPipe` diameter) |

## Բաց թողնված, և նշված նշումներում

- Առաջինից հետո եկող մակերևույթները, ցանցային մակերևույթները և մյուս ոչ TIN մակերևույթները
- Երթուղիները, որոնք պարունակում են `IrregularLine` կամ `Chain` տարրեր, կլոթոիդից այլ պարուրներ, պարուրը երկու կորի միջև կամ որոնք երկրաչափություն չունեն
- Նախագծային պրոֆիլները առաջինից հետո; `CircCurve` և `UnsymParaCurve` ուղղաձիգ կորերը (դրանց PVI-ները պահվում են առանց կորի)
- Այն կետերը, որոնք միայն հղում են անում այլ կետերին (`pntRef`), և կետերը առանց կարդացվող կոորդինատների
- Կրկնվող կետերի անունները (պահվում է առաջինը)
- Թաքցնել, ցույց տալ և տվյալների կտրման սահմանները; կոտրվածքային գծերը առանց 3D կետերի
- Խողովակների ցանցերը առաջինից հետո; storm-ից և sanitary-ից այլ ցանցի տեսակները (կարդացվում են որպես storm)
- Ուղղանկյուն, մուտքի և ելքի կառուցվածքները (կարդացվում են որպես կլոր); ձվաձև, էլիպսաձև և արկղաձև խողովակները և ալիքները (կարդացվում են որպես կլոր խողովակներ առանց չափի)
- `Spiral` տարրերը հատակագծային հատկանիշներում
- `Parcels`, `Roadways`, `GradeModel` և `Survey`

Ֆայլի գետնի պրոֆիլները (`ProfSurf`) չեն օգտագործվում․ CivilCraft-ը գետինը վերցնում է ուղղակիորեն մակերևույթից։

## Հաղորդագրություններ, երբ ֆայլը չի բացվում

| Հաղորդագրություն | Նշանակություն |
|---|---|
| «Սա XML է, բայց ոչ LandXML (դրա արմատային տարրն է <…>)։» | Ֆայլը XML-ի այլ տեսակ է։ |
| «… չունի CivilCraft-ի կարդացած կետեր, TIN մակերևույթներ կամ երթուղիներ։» | Ֆայլի ամեն ինչը բաց թողնվածների ցանկում է։ Դրանից հետո եկող նշումները ասում են, թե ինչ կար այնտեղ։ |
| «Չհամապատասխանող փակող թեգ …», «Չփակված թեգ …», «Ֆայլը ավարտվում է …-ի ներսում» | Ֆայլը վնասված է կամ կտրված։ |
