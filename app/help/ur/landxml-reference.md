---
title: LandXML: کیا پڑھا اور لکھا جاتا ہے
summary: LandXML 1.2 کے ایلیمنٹس اور attributes جو CivilCraft پڑھتا اور لکھتا ہے، ایلیمنٹ کے لحاظ سے، اور وہ سب جو چھوڑ دیا جاتا ہے۔
keywords: landxml، xml، cgpoints، surface، tin، breaklines، boundary، alignment، coordgeom، profile، profalign، pvi، paracurve، pipenetworks، struct، pipe، planfeatures، planfeature، فیچر لائن، schema
from: ca3cf359
---

CivilCraft LandXML 1.2 لکھتا ہے، سرکاری namespace اور schema location کے ساتھ۔ یہ ہر وہ فائل پڑھتا ہے جس کا روٹ ایلیمنٹ `LandXML` ہو، اور نیچے دیے گئے ایلیمنٹس نام سے لیتا ہے (namespace prefixes نظر انداز ہوتے ہیں؛ ورژن کی جانچ نہیں ہوتی)۔ اس کا XML reader صرف پانچ معیاری entities اور numeric character references قبول کرتا ہے؛ یہ کبھی DTD یا بیرونی فائل لوڈ نہیں کرتا۔ مراحل کے لیے [LandXML کا تبادلہ](topic:landxml) دیکھیں۔

LandXML میں کوآرڈینیٹس پہلے northing لکھے جاتے ہیں: ایک نقطہ "N E" یا "N E Z" ہوتا ہے۔

## لکھا جاتا ہے

| ایلیمنٹ | CivilCraft کیا لکھتا ہے |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot، رقبے مربع فٹ میں، حجم کیوبک یارڈ میں، قطر انچ میں) یا `Metric` (meter، square meter، cubic meter، millimeter) |
| `Project` | `name` = پروجیکٹ کا نام |
| `Application` | نام CivilCraft، manufacturer CadCraft |
| `CgPoints` / `CgPoint` | `name` = نقطہ نمبر، `desc` = تفصیل، `code` = گروپ؛ متن "N E Z" (یا بلندی کے بغیر "N E") |
| `Alignments` / `Alignment` | `name`، `length`، `staStart` |
| `CoordGeom` / `Line` | `staStart`، `length`، `Start`، `End` |
| `CoordGeom` / `Curve` | `crvType` arc، `rot` cw یا ccw، `radius`، `length`، `staStart`، `chord`، `delta` (ڈگری)، `tangent`، `external`، `midOrd`؛ `Start`، `Center`، `End`، `PI` |
| `Profile` / `ProfSurf` | الائنمنٹ کے ساتھ موجودہ زمین، اسٹیشن اور بلندی کے جوڑوں (`PntList2D`) کے طور پر، جہاں یہ سطح سے نکلتی ہے وہاں تقسیم کر کے |
| `Profile` / `ProfAlign` | ڈیزائن پروفائل ("<alignment> design" کے نام سے): سروں اور زاویائی نقاط کے لیے `PVI`، عمودی منحنیوں کے لیے `length` کے ساتھ `ParaCurve` |
| `Surfaces` / `Surface` | `name` اور `desc`؛ پہلے موجودہ زمین، پھر "Proposed" جب پیڈز یا کوریڈورز گریڈ ہوں |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard، `name`، `PntList3D` (صرف موجودہ زمین) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer، `edgeTrim` true، `PntList2D` (صرف موجودہ زمین، جب ہو) |
| `Definition` | `surfType` TIN، `area2DSurf`، `area3DSurf`، `elevMax`، `elevMin`؛ `id` کے ساتھ `Pnts` / `P`؛ `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`، `pipeNetType` storm یا sanitary |
| `Struct` | `name`، `elevRim` (استعمال شدہ rim، مقرر یا سطح سے)، `elevSump`؛ `Center`؛ `diameter` کے ساتھ `CircStruct`؛ `elev`، `flowDir` in یا out، `refPipe` کے ساتھ `Invert` |
| `Pipe` | `name`، `refStart`، `refEnd`، `length`، `slope`؛ `diameter` کے ساتھ `CircPipe` |
| `PlanFeatures` / `PlanFeature` | ہر فیچر لائن کے لیے ایک: `name`؛ `CoordGeom` جس میں `Line` (`length`، `Start`، `End`) اور `Curve` (`rot`، `crvType` arc، `radius`، `length`، `chord`، `delta`؛ `Start` اور `End` "N E Z" کے طور پر، `Center` "N E" کے طور پر)؛ `code="CivilCraft"` والا `Feature` جس میں `Property` use اور closed |

نہیں لکھے جاتے: پیڈز اور کوریڈورز بطور آبجیکٹ (ان کا نتیجہ "Proposed" سطح ہے)، غلطیوں والی الائنمنٹس، وہ پائپ جن کے دونوں inverts نہ ہوں، نیٹ ورک کے قواعد۔

## پڑھا جاتا ہے

| ایلیمنٹ | CivilCraft کیا لیتا ہے |
|---|---|
| `Units` | `Imperial` یا `Metric` اور اس کا `linearUnit` فٹ یا میٹر طے کرتے ہیں۔ نامعلوم اکائی نوٹ کی جاتی ہے۔ |
| `Project` | `name` پروجیکٹ کا نام بنتا ہے۔ |
| `CgPoints` / `CgPoint` (اندر والے بھی) | نام (یا `oID`)، "N E" یا "N E Z"، `desc` (یا `code`) تفصیل کے طور پر |
| `Surface` جس میں `Definition surfType="TIN"` ہو | `Pnts` اور `Faces` موجودہ زمین کے طور پر (صرف پہلی سطح)؛ غیر مرئی faces (`i="1"`) چھوڑ دی جاتی ہیں |
| `SourceData` / `Breaklines` | 3D breaklines، سطح کے ساتھ رکھی گئیں |
| `SourceData` / `Boundaries` | بیرونی حد |
| `Alignment` / `CoordGeom` | `Line` اور `Curve` ایلیمنٹس؛ PIs ہر curve کے `PI` سے دوبارہ بنائے جاتے ہیں، یا اس کے `Center` اور tangents سے؛ `staStart` |
| `Profile` / `ProfAlign` | `PVI` اور `ParaCurve` (`length` کے ساتھ)؛ پہلا ڈیزائن پروفائل جس میں کم از کم دو PVIs ہوں |
| `PlanFeatures` / `PlanFeature` | ہر ایک بطور فیچر لائن: `Line`، `Curve` (اس کے `Start`، `Center`، `End` اور `rot` کے ساتھ) اور `IrregularLine` (`PntList3D` یا `PntList2D`) سرے سے سرا جڑی ہوئی (خلا کو سیدھے حصے سے جوڑا جاتا ہے اور نوٹ ہوتا ہے)؛ جب یہ وہیں ختم ہو جہاں شروع ہوئی تھی تو closed؛ use اور closed CivilCraft کے اپنے `Feature` سے، ورنہ **صرف ڈرا کیا گیا**۔ بلندی کے بغیر نقاط 0 لیتے ہیں (نوٹ ہوتا ہے)۔ |
| `Spiral` | `Curve` کے ساتھ clothoid spirals (اندر اور باہر؛ ریڈیس اور spiral lengths کے ساتھ ایک PI کے طور پر پڑھی جاتی ہیں، اور `theta`، `totalX`، `totalY`، `tanLong`، `tanShort`، `constant` کے ساتھ واپس لکھی جاتی ہیں) |
| `PipeNetwork` | پہلا نیٹ ورک جس میں پائپ ہوں: `Struct` (`Center`، `elevRim`، `elevSump`، `CircStruct` کا diameter، ہر پائپ کے لیے `Invert`) اور `Pipe` (`refStart`، `refEnd`، `CircPipe` diameter) |

## چھوڑے جاتے ہیں، اور نوٹس میں بتائے جاتے ہیں

- پہلی کے بعد کی سطحیں، grid سطحیں اور دوسری non-TIN سطحیں
- وہ الائنمنٹس جن میں `IrregularLine` یا `Chain` ایلیمنٹس ہوں، clothoid کے علاوہ spirals، دو curves کے درمیان spiral، یا جن میں کوئی جیومیٹری نہ ہو
- پہلے کے بعد کے ڈیزائن پروفائلز؛ `CircCurve` اور `UnsymParaCurve` عمودی منحنی (ان کے PVIs بغیر curve کے رکھے جاتے ہیں)
- وہ نقاط جو صرف دوسرے نقاط کا حوالہ دیں (`pntRef`)، اور جن کے پڑھے جا سکنے والے کوآرڈینیٹس نہ ہوں
- دہرائے گئے نقطہ نام (پہلا رکھا جاتا ہے)
- Hide، show اور data-clip حدیں؛ 3D نقاط کے بغیر breaklines
- پہلے کے بعد کے پائپ نیٹ ورکس؛ storm اور sanitary کے علاوہ نیٹ ورک کی اقسام (storm کے طور پر پڑھی جاتی ہیں)
- مستطیلی، inlet اور outlet structures (گول کے طور پر پڑھے جاتے ہیں)؛ egg، elliptical اور box پائپ اور channels (بغیر سائز کے گول پائپ کے طور پر پڑھے جاتے ہیں)
- plan features میں `Spiral` ایلیمنٹس
- `Parcels`، `Roadways`، `GradeModel` اور `Survey`

فائل میں گراؤنڈ پروفائلز (`ProfSurf`) استعمال نہیں ہوتیں: CivilCraft زمین کو خود سطح سے نکالتا ہے۔

## جب فائل نہ کھلے تو پیغامات

| پیغام | مطلب |
|---|---|
| "یہ XML ہے مگر LandXML نہیں (اس کا روٹ ایلیمنٹ <…> ہے)۔" | فائل XML کی کوئی اور قسم ہے۔ |
| "… میں CivilCraft کے پڑھنے کے قابل کوئی نقطے، TIN سطحیں یا الائنمنٹس نہیں ہیں۔" | فائل میں سب کچھ چھوڑی گئی فہرست میں ہے۔ اس کے بعد کے نوٹس بتاتے ہیں کہ وہاں کیا تھا۔ |
| "end tag میل نہیں کھاتا …"، "بند نہ ہونے والا tag …"، "فائل … کے اندر ختم ہو جاتی ہے" | فائل خراب ہے یا بیچ میں کٹی ہوئی ہے۔ |
