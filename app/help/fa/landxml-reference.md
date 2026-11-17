---
title: LandXML: آنچه خوانده و نوشته می‌شود
summary: عناصر و ویژگی‌های LandXML 1.2 که CivilCraft می‌خواند و می‌نویسد، عنصر به عنصر، و هر آنچه را که رد می‌کند.
keywords: landxml, xml, cgpoints, سطح, tin, خطوط شکست, حد, محور, coordgeom, پروفیل, profalign, pvi, paracurve, pipenetworks, struct, pipe, planfeatures, planfeature, خط ویژگی, طرح‌واره
from: ca3cf359
---

CivilCraft، LandXML 1.2 را با فضای نام و مکان طرح‌واره رسمی می‌نویسد. هر فایلی را که ریشه‌اش `LandXML` باشد می‌خواند و عناصر زیر را با نامشان برمی‌دارد (پیشوندهای فضای نام نادیده گرفته می‌شوند؛ نسخه بررسی نمی‌شود). خواننده XML آن فقط پنج موجودیت استاندارد و ارجاع‌های نویسه عددی را می‌پذیرد؛ هرگز DTD یا فایل خارجی را بارگذاری نمی‌کند. برای گام‌ها نگاه کنید به [تبادل LandXML](topic:landxml).

LandXML مختصات را با شمال (N) اول می‌نویسد: یک نقطه به شکل "N E" یا "N E Z" است.

## نوشته‌شده

| عنصر | آنچه CivilCraft می‌نویسد |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot، مساحت به فوت مربع، حجم به یارد مکعب، قطر به اینچ) یا `Metric` (متر، متر مربع، متر مکعب، میلی‌متر) |
| `Project` | `name` = نام پروژه |
| `Application` | نام CivilCraft، سازنده CadCraft |
| `CgPoints` / `CgPoint` | `name` = شماره نقطه، `desc` = توضیح، `code` = گروه؛ متن "N E Z" (یا "N E" بدون ارتفاع) |
| `Alignments` / `Alignment` | `name`، `length`، `staStart` |
| `CoordGeom` / `Line` | `staStart`، `length`، `Start`، `End` |
| `CoordGeom` / `Curve` | `crvType` arc، `rot` cw یا ccw، `radius`، `length`، `staStart`، `chord`، `delta` (بر حسب درجه)، `tangent`، `external`، `midOrd`؛ `Start`، `Center`، `End`، `PI` |
| `Profile` / `ProfSurf` | زمین موجود در امتداد محور، به‌صورت جفت‌های ایستگاه و ارتفاع (`PntList2D`)، جدا‌شده در جایی که از سطح خارج می‌شود |
| `Profile` / `ProfAlign` | پروفیل طرح (با نام "<alignment> design"): `PVI` برای انتها‌ها و نقاط زاویه، `ParaCurve` با `length` برای قوس‌های قائم |
| `Surfaces` / `Surface` | `name` و `desc`؛ ابتدا زمین موجود، سپس "Proposed" وقتی پدها یا کریدورها شیب می‌گیرند |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard، `name`، `PntList3D` (فقط زمین موجود) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer، `edgeTrim` true، `PntList2D` (فقط زمین موجود، در صورت وجود) |
| `Definition` | `surfType` TIN، `area2DSurf`، `area3DSurf`، `elevMax`، `elevMin`؛ `Pnts` / `P` با `id`؛ `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`، `pipeNetType` storm یا sanitary |
| `Struct` | `name`، `elevRim` (لبه‌ای که استفاده شده، تنظیم‌شده یا از سطح)، `elevSump`؛ `Center`؛ `CircStruct` با `diameter`؛ `Invert` با `elev`، `flowDir` in یا out، `refPipe` |
| `Pipe` | `name`، `refStart`، `refEnd`، `length`، `slope`؛ `CircPipe` با `diameter` |
| `PlanFeatures` / `PlanFeature` | یکی برای هر خط ویژگی: `name`؛ `CoordGeom` با `Line` (`length`، `Start`، `End`) و `Curve` (`rot`، `crvType` arc، `radius`، `length`، `chord`، `delta`؛ `Start` و `End` به صورت "N E Z"، `Center` به صورت "N E")؛ `Feature` با `code="CivilCraft"` و `Property` با use و closed |

نوشته نمی‌شوند: پدها و کریدورها به‌عنوان شیء (نتیجه آن‌ها سطح "Proposed" است)، محورهای دارای خطا، لوله‌های بدون هر دو وارون، قوانین شبکه.

## خوانده‌شده

| عنصر | آنچه CivilCraft برمی‌دارد |
|---|---|
| `Units` | `Imperial` یا `Metric` و `linearUnit` آن تعیین می‌کنند فوت یا متر. واحد ناشناخته یادداشت می‌شود. |
| `Project` | `name` نام پروژه می‌شود. |
| `CgPoints` / `CgPoint` (تودرتو هم) | نام (یا `oID`)، "N E" یا "N E Z"، `desc` (یا `code`) به‌عنوان توضیح |
| `Surface` با `Definition surfType="TIN"` | `Pnts` و `Faces` به‌عنوان زمین موجود (فقط اولین سطح)؛ وجه‌های نامرئی (`i="1"`) کنار گذاشته می‌شوند |
| `SourceData` / `Breaklines` | خطوط شکست سه‌بعدی، همراه با سطح نگه داشته می‌شوند |
| `SourceData` / `Boundaries` | حد بیرونی |
| `Alignment` / `CoordGeom` | عناصر `Line` و `Curve`؛ PIها از `PI` هر قوس، یا از `Center` و مماس‌ها بازسازی می‌شوند؛ `staStart` |
| `Profile` / `ProfAlign` | `PVI` و `ParaCurve` (با `length`)؛ اولین پروفیل طرح با دست‌کم دو PVI |
| `PlanFeatures` / `PlanFeature` | هرکدام به‌عنوان یک خط ویژگی: `Line`، `Curve` (با `Start`، `Center`، `End` و `rot` آن)، و `IrregularLine` (`PntList3D` یا `PntList2D`) که سر به سر به هم وصل می‌شوند (شکاف با یک پاره‌خط راست وصل و یادداشت می‌شود)؛ بسته وقتی به جای شروعش برمی‌گردد؛ use و closed از `Feature` خود CivilCraft، وگرنه **فقط ترسیم‌شده**. نقاط بدون ارتفاع مقدار 0 می‌گیرند (یادداشت می‌شود). |
| `Spiral` | مارپیچ‌های کلوتوئیدی کنار `Curve` (ورودی و خروجی؛ به‌عنوان PI با شعاع و طول مارپیچ خوانده، و با `theta`، `totalX`، `totalY`، `tanLong`، `tanShort`، `constant` نوشته می‌شود) |
| `PipeNetwork` | اولین شبکه‌ای که لوله دارد: `Struct` (`Center`، `elevRim`، `elevSump`، قطر `CircStruct`، `Invert` برای هر لوله) و `Pipe` (`refStart`، `refEnd`، قطر `CircPipe`) |

## رد‌شده و در یادداشت‌ها نام‌برده‌شده

- سطوح بعد از اولین، سطوح شبکه‌ای و سایر سطوح غیر TIN
- محورهایی که عناصر `IrregularLine` یا `Chain` دارند، مارپیچ‌های غیر کلوتوئیدی، مارپیچ بین دو قوس، یا محورهایی که هیچ هندسه‌ای ندارند
- پروفیل‌های طرح بعد از اولین؛ قوس‌های قائم `CircCurve` و `UnsymParaCurve` (PVIهایشان بدون قوس نگه داشته می‌شوند)
- نقاطی که فقط به نقاط دیگر ارجاع می‌دهند (`pntRef`)، و نقاط بدون مختصات خوانا
- نام‌های تکراری نقطه (اولی نگه داشته می‌شود)
- حدهای پنهان، نمایش‌داده‌شده و برش‌داده‌شده؛ خطوط شکست بدون نقطه سه‌بعدی
- شبکه‌های لوله بعد از اولین؛ انواعی از شبکه غیر از storm و sanitary (storm خوانده می‌شود)
- سازه‌های مستطیلی، ورودی و خروجی (گرد خوانده می‌شوند)؛ لوله‌ها و کانال‌های تخم‌مرغی، بیضوی و جعبه‌ای (به‌صورت لوله‌های گرد بدون اندازه خوانده می‌شوند)
- عناصر `Spiral` در ویژگی‌های طرح
- `Parcels`، `Roadways`، `GradeModel` و `Survey`

پروفیل‌های زمین (`ProfSurf`) در فایل استفاده نمی‌شوند: CivilCraft زمین را از خود سطح نمونه‌برداری می‌کند.

## پیام‌ها وقتی یک فایل باز نمی‌شود

| پیام | معنی |
|---|---|
| "این XML است اما LandXML نیست (عنصر ریشه‌اش <…> است)." | فایل نوع دیگری از XML است. |
| "… نقطه، سطح TIN یا محوری ندارد که CivilCraft بتواند بخواند." | همه چیز در فایل در فهرست رد‌شده‌ها است. یادداشت‌های بعد از آن می‌گویند چه چیزی بوده است. |
| "برچسب پایانی نامطابق …"، "برچسب باز بسته نشده …"، "فایل داخل … تمام می‌شود" | فایل خراب است یا کوتاه شده. |
