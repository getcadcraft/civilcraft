---
title: LandXML: څه لوستل کیږي او لیکل کیږي
summary: هغه LandXML 1.2 عناصر او ځانګړتیاوې چې CivilCraft یې لولي او لیکي، عنصر په عنصر، او هر هغه څه چې پریږدي.
keywords: landxml، xml، cgpoints، سطحه، tin، breaklines، حد، لاره، coordgeom، پروفایل، profalign، pvi، paracurve، pipenetworks، struct، نل، planfeatures، planfeature، ځانګړتیا کرښه، schema
from: ca3cf359
---

CivilCraft د LandXML 1.2 په رسمي نوم‌ځای او د schema ځای سره لیکي. هر هغه فایل لولي چې ریښتینی عنصر یې `LandXML` وي، او لاندې عناصر د نوم له مخې اخلي (د نوم‌ځای مختاړي له پامه غورځول کیږي؛ نسخه نه ازمول کیږي). د XML لوستونکی یوازې پنځه معیاري entity او شمېرې کرکټر حوالې مني؛ هیڅکله DTD یا بهرنی فایل نه پورته کوي. د ګامونو لپاره وګورئ [LandXML تبادله](topic:landxml).

LandXML همغږې د شمال څخه لومړی لیکي: یو ټکی "N E" یا "N E Z" دی.

## لیکل شوي

| عنصر | څه لیکي CivilCraft |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot، ساحې په مربع فوټ، حجمونه په مکعب یارډ، قطرونه په انچ) یا `Metric` (meter، square meter، cubic meter، millimeter) |
| `Project` | `name` = د پروژې نوم |
| `Application` | نوم CivilCraft، جوړونکی CadCraft |
| `CgPoints` / `CgPoint` | `name` = د ټکي شمېره، `desc` = تشریح، `code` = ګروپ؛ متن "N E Z" (یا "N E" پرته له لوړوالي) |
| `Alignments` / `Alignment` | `name`، `length`، `staStart` |
| `CoordGeom` / `Line` | `staStart`، `length`، `Start`، `End` |
| `CoordGeom` / `Curve` | `crvType` arc، `rot` cw یا ccw، `radius`، `length`، `staStart`، `chord`، `delta` (درجې)، `tangent`، `external`، `midOrd`؛ `Start`، `Center`، `End`، `PI` |
| `Profile` / `ProfSurf` | موجوده ځمکه د لارې په اوږدو کې، د سټیشن او لوړوالي جوړو په توګه (`PntList2D`)، ویشل شوې چیرې چې له سطحې وځي |
| `Profile` / `ProfAlign` | د ډیزاین پروفایل (نوم "<alignment> design")؛ `PVI` د پای او زاویې ټکو لپاره، `ParaCurve` د `length` سره د عمودي منحنیو لپاره |
| `Surfaces` / `Surface` | `name` او `desc`؛ لومړی موجوده ځمکه، بیا "Proposed" کله چې پیډونه یا کوریډورونه هوارېږي |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard، `name`، `PntList3D` (یوازې موجوده ځمکه) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer، `edgeTrim` true، `PntList2D` (یوازې موجوده ځمکه، کله چې یو وي) |
| `Definition` | `surfType` TIN، `area2DSurf`، `area3DSurf`، `elevMax`، `elevMin`؛ `Pnts` / `P` د `id` سره؛ `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`، `pipeNetType` storm یا sanitary |
| `Struct` | `name`، `elevRim` (کارول شوی rim، ټاکل شوی یا له سطحې)، `elevSump`؛ `Center`؛ `CircStruct` د `diameter` سره؛ `Invert` د `elev`، `flowDir` in یا out، `refPipe` سره |
| `Pipe` | `name`، `refStart`، `refEnd`، `length`، `slope`؛ `CircPipe` د `diameter` سره |
| `PlanFeatures` / `PlanFeature` | د هرې ځانګړتیا کرښې لپاره یو: `name`؛ `CoordGeom` د `Line` (`length`، `Start`، `End`) او `Curve` (`rot`، `crvType` arc، `radius`، `length`، `chord`، `delta`؛ `Start` او `End` د "N E Z" په توګه، `Center` د "N E" په توګه)؛ `Feature` د `code="CivilCraft"` سره د `Property` کارول او closed |

نه لیکل کیږي: پیډونه او کوریډورونه د شیانو په توګه (پایله یې "Proposed" سطحه ده)، د تېروتنو لرونکي لارې، نلونه پرته له دواړو inverts، د شبکې قواعد.

## لوستل شوي

| عنصر | څه اخلي CivilCraft |
|---|---|
| `Units` | `Imperial` یا `Metric` او د هغه `linearUnit` پرېکړه کوي چې فوټ یا میټر دي. نامعلوم واحد یادېږي. |
| `Project` | `name` د پروژې نوم کیږي. |
| `CgPoints` / `CgPoint` (نور هم) | نوم (یا `oID`)، "N E" یا "N E Z"، `desc` (یا `code`) د تشریح په توګه |
| `Surface` د `Definition surfType="TIN"` سره | `Pnts` او `Faces` د موجوده ځمکې په توګه (یوازې لومړۍ سطحه)؛ ناڅرګندې مخونه (`i="1"`) پریښودل کیږي |
| `SourceData` / `Breaklines` | 3D breaklines، د سطحې سره ساتل کیږي |
| `SourceData` / `Boundaries` | بهرنی حد |
| `Alignment` / `CoordGeom` | `Line` او `Curve` عناصر؛ PIs له هر منحني د `PI` څخه، یا د `Center` او tangents څخه بیا جوړېږي؛ `staStart` |
| `Profile` / `ProfAlign` | `PVI` او `ParaCurve` (د `length` سره)؛ لومړی ډیزاین پروفایل چې لږ تر لږه دوه PVI لري |
| `PlanFeatures` / `PlanFeature` | هر یو د ځانګړتیا کرښې په توګه: `Line`، `Curve` (د دې `Start`، `Center`، `End` او `rot`) او `IrregularLine` (`PntList3D` یا `PntList2D`) سر تر پایه یوځای شوي (خلا د مستقیم برخې سره ډکېږي او یادېږي)؛ تړل شوی کله چې هلته پای ته ورسیږي چیرې چې پیل شوی و؛ use او closed د CivilCraft خپل `Feature` څخه، که نه نو **یوازې انځور شوی**. هغه ټکي چې لوړوالی نلري 0 اخلي (یادېږي). |
| `Spiral` | clothoid spirals د `Curve` سره یوځای (داخل او بهر؛ د PI په توګه د شعاع او spiral اوږدوالي سره لوستل کیږي، بیا د `theta`، `totalX`، `totalY`، `tanLong`، `tanShort`، `constant` سره لیکل کیږي) |
| `PipeNetwork` | لومړۍ شبکه چې نلونه لري: `Struct` (`Center`، `elevRim`، `elevSump`، `CircStruct` قطر، هر نل لپاره `Invert`) او `Pipe` (`refStart`، `refEnd`، `CircPipe` قطر) |

## پریښودل شوي، او په یادښتونو کې نومول شوي

- لومړۍ وروسته سطحې، د شبکې سطحې او نور غیر-TIN سطحې
- هغه لارې چې `IrregularLine` یا `Chain` عناصر لري، له clothoid پرته نور spirals، د دوو منحنیو ترمنځ spiral، یا هندسه نلري
- د لومړي وروسته ډیزاین پروفایلونه؛ `CircCurve` او `UnsymParaCurve` عمودي منحنۍ (د دوی PVI پرته له منحني ساتل کیږي)
- هغه ټکي چې یوازې نورو ټکو ته حواله کوي (`pntRef`)، او هغه ټکي چې لوستل کیدونکي همغږې نلري
- تکراري د ټکو نومونه (لومړی ساتل کیږي)
- د پټولو، ښودلو او ډیټا پرې کولو حدونه؛ breaklines پرته له 3D ټکو
- د لومړۍ وروسته نل شبکې؛ د storm او sanitary پرته نور شبکې ډولونه (storm په توګه لوستل کیږي)
- مستطیلي، داخلي او خارجي جوړښتونه (ګرد په توګه لوستل کیږي)؛ هګي، بیضوي او بکسي نلونه او کانالونه (د بې اندازې ګرد نلونو په توګه لوستل کیږي)
- `Spiral` عناصر په پلان ځانګړتیاوو کې
- `Parcels`، `Roadways`، `GradeModel` او `Survey`

په فایل کې د ځمکې پروفایلونه (`ProfSurf`) نه کارول کیږي: CivilCraft ځمکه له خپلې سطحې څخه نمونه اخلي.

## پیغامونه کله چې فایل نه پرانیستل کیږي

| پیغام | مانا |
|---|---|
| "دا XML دی، خو LandXML نه دی (ریښتینی عنصر یې <…> دی)." | فایل بل ډول XML دی. |
| "… کې د CivilCraft لخوا لوستل کیدونکي ټکي، TIN سطحې یا لارې نشته." | هر څه چې فایل کې دي د پریښودل شوو لیست کې دي. وروستي یادښتونه وایي چې هلته څه و. |
| "د پای ټاګ نامتوازن …"، "نه تړل شوی ټاګ …"، "فایل د … دننه پای ته رسیږي" | فایل خراب دی یا لنډ شوی. |
