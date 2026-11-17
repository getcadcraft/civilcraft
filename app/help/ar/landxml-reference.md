---
title: LandXML: ما يُقرأ ويُكتب
summary: عناصر وخصائص LandXML 1.2 التي يقرأها CivilCraft ويكتبها، عنصرًا عنصرًا، وكل ما يتخطّاه.
keywords: landxml، xml، cgpoints، السطح، tin، خطوط الكسر، الحد، المحور، coordgeom، القطاع الطولي، profalign، pvi، paracurve، pipenetworks، struct، أنبوب، planfeatures، planfeature، خط ميزة، المخطط
from: ca3cf359
---

يكتب CivilCraft LandXML 1.2 مع مساحة الأسماء الرسمية وموقع المخطط الرسمي. يقرأ أي ملف يكون عنصره الجذري `LandXML`، ويأخذ العناصر أدناه بأسمائها (بادئات مساحات الأسماء مُتجاهلة، والإصدار لا يُتحقَّق منه). لا يقبل قارئ XML فيه إلا الكيانات الخمسة القياسية ومراجع الأحرف الرقمية؛ ولا يحمّل أبدًا DTD أو ملفًا خارجيًا. للخطوات، انظر [تبادل LandXML](topic:landxml).

يكتب LandXML الإحداثيات بدءًا بالشمال: النقطة هي "N E" أو "N E Z".

## ما يُكتب

| العنصر | ما يكتبه CivilCraft |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot، والمساحات بالقدم المربع، والأحجام بالياردة المكعبة، والأقطار بالبوصة) أو `Metric` (meter، square meter، cubic meter، millimeter) |
| `Project` | `name` = اسم المشروع |
| `Application` | الاسم CivilCraft، والشركة المصنِّعة CadCraft |
| `CgPoints` / `CgPoint` | `name` = رقم النقطة، و`desc` = الوصف، و`code` = المجموعة؛ النص "N E Z" (أو "N E" بدون منسوب) |
| `Alignments` / `Alignment` | `name`، و`length`، و`staStart` |
| `CoordGeom` / `Line` | `staStart`، و`length`، و`Start`، و`End` |
| `CoordGeom` / `Curve` | `crvType` arc، و`rot` cw أو ccw، و`radius`، و`length`، و`staStart`، و`chord`، و`delta` (بالدرجات)، و`tangent`، و`external`، و`midOrd`؛ و`Start`، و`Center`، و`End`، و`PI` |
| `Profile` / `ProfSurf` | الأرض الحالية على طول المحور، كأزواج محطة ومنسوب (`PntList2D`)، مقسّمة حيث تخرج عن السطح |
| `Profile` / `ProfAlign` | القطاع الطولي التصميمي (ويُسمّى "<alignment> design")؛ و`PVI` للنهايات ونقاط الزاوية، و`ParaCurve` مع `length` للمنحنيات الرأسية |
| `Surfaces` / `Surface` | `name` و`desc`؛ أولًا الأرض الحالية، ثم "Proposed" عندما تُسوّى المنصات أو الممرات |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard، و`name`، و`PntList3D` (الأرض الحالية فقط) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer، و`edgeTrim` true، و`PntList2D` (الأرض الحالية فقط، عند وجودها) |
| `Definition` | `surfType` TIN، و`area2DSurf`، و`area3DSurf`، و`elevMax`، و`elevMin`؛ و`Pnts` / `P` مع `id`؛ و`Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`، و`pipeNetType` storm أو sanitary |
| `Struct` | `name`، و`elevRim` (الحافة المستخدمة، مضبوطة أو مأخوذة من السطح)، و`elevSump`؛ و`Center`؛ و`CircStruct` مع `diameter`؛ و`Invert` مع `elev`، و`flowDir` in أو out، و`refPipe` |
| `Pipe` | `name`، و`refStart`، و`refEnd`، و`length`، و`slope`؛ و`CircPipe` مع `diameter` |
| `PlanFeatures` / `PlanFeature` | واحد لكل خط ميزة: `name`؛ و`CoordGeom` مع `Line` (`length`، و`Start`، و`End`) و`Curve` (`rot`، و`crvType` arc، و`radius`، و`length`، و`chord`، و`delta`؛ و`Start` و`End` كـ "N E Z"، و`Center` كـ "N E")؛ و`Feature` بـ `code="CivilCraft"` مع `Property` للاستخدام و`closed` |

لا يُكتب: المنصات والممرات ككائنات (نتيجتها هي السطح "Proposed")، والمحاور التي بها أخطاء، والأنابيب التي لا تملك كلا قاعيها، وقواعد الشبكة.

## ما يُقرأ

| العنصر | ما يأخذه CivilCraft |
|---|---|
| `Units` | `Imperial` أو `Metric`، و`linearUnit` يحدد القدم أو المتر. وحدة غير معروفة تُذكر في الملاحظات. |
| `Project` | `name` يصبح اسم المشروع. |
| `CgPoints` / `CgPoint` (المتداخلة أيضًا) | الاسم (أو `oID`)، و"N E" أو "N E Z"، و`desc` (أو `code`) كوصف |
| `Surface` مع `Definition surfType="TIN"` | `Pnts` و`Faces` كالأرض الحالية (السطح الأول فقط)؛ الأوجه غير المرئية (`i="1"`) تُترك |
| `SourceData` / `Breaklines` | خطوط كسر ثلاثية الأبعاد، تُحفظ مع السطح |
| `SourceData` / `Boundaries` | الحد الخارجي |
| `Alignment` / `CoordGeom` | عناصر `Line` و`Curve`؛ تُعاد بناء نقاط PI من `PI` كل منحنى، أو من `Center` والمماسات؛ و`staStart` |
| `Profile` / `ProfAlign` | `PVI` و`ParaCurve` (مع `length`)؛ أول قطاع طولي تصميمي فيه نقطتا PVI على الأقل |
| `PlanFeatures` / `PlanFeature` | كل واحد كخط ميزة: `Line`، و`Curve` (`Start` و`Center` و`End` و`rot`)، و`IrregularLine` (`PntList3D` أو `PntList2D`) موصولة طرفًا بطرف (الفجوة توصل بمقطع مستقيم وتُذكر)؛ مغلق إذا انتهى حيث بدأ؛ الاستخدام والإغلاق من `Feature` الخاص بـ CivilCraft، وإلا **مرسوم فقط**. النقاط بلا منسوب تأخذ 0 (وتُذكر). |
| `Spiral` | حلزونات كلوثويدية بجانب `Curve` (داخلًا وخارجًا)؛ تُقرأ كنقطة PI بنصف قطر وأطوال حلزونية، وتُكتب مرة أخرى مع `theta`، و`totalX`، و`totalY`، و`tanLong`، و`tanShort`، و`constant` |
| `PipeNetwork` | أول شبكة فيها أنابيب: `Struct` (`Center`، و`elevRim`، و`elevSump`، و`CircStruct` بقطر `diameter`، و`Invert` لكل أنبوب) و`Pipe` (`refStart`، و`refEnd`، و`CircPipe` بقطر `diameter`) |

## ما يُتخطّى، ويُذكر في الملاحظات

- الأسطح بعد الأول، والأسطح الشبكية، وأي أسطح غير TIN
- المحاور التي تحتوي على عناصر `IrregularLine` أو `Chain`، أو حلزونات غير كلوثويدية، أو حلزون بين منحنيين، أو التي لا تملك هندسة
- القطاعات الطولية التصميمية بعد الأولى؛ و`CircCurve` و`UnsymParaCurve` للمنحنيات الرأسية (تُحفظ نقاط PVI بلا منحنى)
- النقاط التي تشير فقط إلى نقاط أخرى (`pntRef`)، والنقاط التي لا تُقرأ إحداثياتها
- أسماء النقاط المكررة (يُحفظ الأول)
- حدود الإخفاء والإظهار وقصّ البيانات؛ وخطوط الكسر بلا نقاط ثلاثية الأبعاد
- شبكات الأنابيب بعد الأولى؛ وأنواع الشبكات غير storm وsanitary (تُقرأ كـ storm)
- الغرف المستطيلة والمدخل والمخرج (تُقرأ دائرية)؛ والأنابيب والقنوات البيضاوية والإهليلجية والصندوقية (تُقرأ كأنابيب دائرية بلا حجم)
- عناصر `Spiral` في خطوط الميزات
- `Parcels` و`Roadways` و`GradeModel` و`Survey`

لا تُستخدم قطاعات الأرض (`ProfSurf`) في الملف: يأخذ CivilCraft عينات الأرض من السطح نفسه.

## رسائل عند تعذّر فتح ملف

| الرسالة | المعنى |
|---|---|
| "هذا XML وليس LandXML (عنصره الجذري هو <…>)." | الملف من نوع آخر من XML. |
| "… ليس فيه نقاط ولا أسطح TIN ولا محاور يستطيع CivilCraft قراءتها." | كل ما في الملف موجود في قائمة المتخطّى. تصف الملاحظات بعدها ما كان فيه. |
| "وسم الإغلاق غير متطابق …"، "وسم غير مغلق …"، "ينتهي الملف داخل …" | الملف تالف أو مقطوع. |
