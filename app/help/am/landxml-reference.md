---
title: LandXML: የሚነበበውና የሚጻፈው
summary: CivilCraft የሚያነበውና የሚጽፈው የLandXML 1.2 ኤለመንቶችና ባህሪያት፣ ኤለመንት በኤለመንት፣ እና የሚዘለለውን ሁሉ።
keywords: landxml, xml, cgpoints, surface, tin, breaklines, boundary, alignment, coordgeom, profile, profalign, pvi, paracurve, pipenetworks, struct, pipe, planfeatures, planfeature, የባህሪ መስመር, ስኪማ
from: ca3cf359
---

CivilCraft LandXML 1.2 ን በይፋዊው ስምና የስኪማ ቦታ ይጽፋል። ሥር ኤለመንቱ `LandXML` የሆነን ማንኛውንም ፋይል ያነባል፣ እና ከዚህ በታች ያሉትን ኤለመንቶች በስማቸው ይወስዳል (የስም ቦታ ቅድመ-ቅጥያዎች ይታለፋሉ፤ ስሪቱ አይፈተሽም)። የXML አንባቢው አምስቱን መደበኛ አካላትና የቁጥር ቁምፊ ማጣቀሻዎችን ብቻ ይቀበላል፤ DTD ወይም ውጫዊ ፋይል በፍጹም አይጭንም። ደረጃዎቹን ለማየት [LandXML ማስገባትና ማውጣት](topic:landxml) ይመልከቱ።

LandXML መጋጠሚያዎችን በመጀመሪያ ሰሜን ይጽፋል፤ ነጥብ "N E" ወይም "N E Z" ነው።

## የተጻፈው

| ኤለመንት | CivilCraft የሚጽፈው |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot፣ ስፋቶች በ square feet፣ መጠኖች በ cubic yards፣ ዲያሜትሮች በ inches) ወይም `Metric` (meter፣ square meter፣ cubic meter፣ millimeter) |
| `Project` | `name` = የፕሮጀክቱ ስም |
| `Application` | ስም CivilCraft፣ አምራች CadCraft |
| `CgPoints` / `CgPoint` | `name` = የነጥብ ቁጥር፣ `desc` = መግለጫ፣ `code` = ቡድን፤ ጽሑፍ "N E Z" (ወይም ከከፍታ ውጭ "N E") |
| `Alignments` / `Alignment` | `name`፣ `length`፣ `staStart` |
| `CoordGeom` / `Line` | `staStart`፣ `length`፣ `Start`፣ `End` |
| `CoordGeom` / `Curve` | `crvType` arc፣ `rot` cw ወይም ccw፣ `radius`፣ `length`፣ `staStart`፣ `chord`፣ `delta` (ዲግሪዎች)፣ `tangent`፣ `external`፣ `midOrd`፤ `Start`፣ `Center`፣ `End`፣ `PI` |
| `Profile` / `ProfSurf` | የያለው መሬት በአሰላለፉ ላይ፣ እንደ የጣቢያ እና ከፍታ ጥንዶች (`PntList2D`)፣ ከወለሉ ሲወጣ የተከፈለ |
| `Profile` / `ProfAlign` | የዲዛይን ፕሮፋይሉ (ስሙ "<alignment> design")፦ `PVI` ለጫፎችና የማዕዘን ነጥቦች፣ `ParaCurve` በ `length` ለቀጥታ ኩርባዎች |
| `Surfaces` / `Surface` | `name` እና `desc`፤ መጀመሪያ ያለው መሬት፣ ከዚያ "Proposed" ፓዶችና ኮሪደሮች ሲቀረጹ |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard፣ `name`፣ `PntList3D` (ያለው መሬት ብቻ) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer፣ `edgeTrim` true፣ `PntList2D` (ያለው መሬት ብቻ፣ ካለ) |
| `Definition` | `surfType` TIN፣ `area2DSurf`፣ `area3DSurf`፣ `elevMax`፣ `elevMin`፤ `Pnts` / `P` በ `id`፤ `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`፣ `pipeNetType` storm ወይም sanitary |
| `Struct` | `name`፣ `elevRim` (የተጠቀመው ጠርዝ፣ ከወለሉ ወይም የተዘጋጀ)፣ `elevSump`፤ `Center`፤ `CircStruct` በ `diameter`፤ `Invert` በ `elev`፣ `flowDir` in ወይም out፣ `refPipe` |
| `Pipe` | `name`፣ `refStart`፣ `refEnd`፣ `length`፣ `slope`፤ `CircPipe` በ `diameter` |
| `PlanFeatures` / `PlanFeature` | ለእያንዳንዱ የባህሪ መስመር አንድ፦ `name`፤ `CoordGeom` ከ `Line` (`length`፣ `Start`፣ `End`) እና `Curve` (`rot`፣ `crvType` arc፣ `radius`፣ `length`፣ `chord`፣ `delta`፤ `Start` እና `End` እንደ "N E Z"፣ `Center` እንደ "N E")፤ `Feature` `code="CivilCraft"` ከ `Property` use እና closed ጋር |

አልተጻፉም፦ ፓዶችና ኮሪደሮች እንደ ነገሮች (ውጤታቸው "Proposed" ወለሉ ነው)፣ ስህተት ያላቸው የመንገድ መስመሮች፣ ሁለቱም ኢንቨርቶች የሌላቸው ቧንቧዎች፣ የአውታር ህጎች።

## የተነበበው

| ኤለመንት | CivilCraft የሚወስደው |
|---|---|
| `Units` | `Imperial` ወይም `Metric` እና የእሱ `linearUnit` ጫማ ወይም ሜትር ይወስናል። የማይታወቅ አሃድ ይመዘገባል። |
| `Project` | `name` የፕሮጀክቱ ስም ይሆናል። |
| `CgPoints` / `CgPoint` (ውስጥ ያሉትም) | ስም (ወይም `oID`)፣ "N E" ወይም "N E Z"፣ `desc` (ወይም `code`) እንደ መግለጫ |
| `Surface` ከ `Definition surfType="TIN"` ጋር | `Pnts` እና `Faces` እንደ ያለው መሬት (የመጀመሪያው ወለል ብቻ)፤ የማይታዩ ፊቶች (`i="1"`) ይቀራሉ |
| `SourceData` / `Breaklines` | 3D የመሰበር መስመሮች፣ ከወለሉ ጋር ይቀመጣሉ |
| `SourceData` / `Boundaries` | ውጫዊው ወሰን |
| `Alignment` / `CoordGeom` | `Line` እና `Curve` ኤለመንቶች፤ PIs ከእያንዳንዱ ኩርባ `PI` ወይም ከ `Center` እና ታንጀንቶች ይገነባሉ፤ `staStart` |
| `Profile` / `ProfAlign` | `PVI` እና `ParaCurve` (በ `length`)፤ ቢያንስ ሁለት PVIs ያለው የመጀመሪያው ዲዛይን ፕሮፋይል |
| `PlanFeatures` / `PlanFeature` | እያንዳንዱ እንደ የባህሪ መስመር፦ `Line`፣ `Curve` (`Start`፣ `Center`፣ `End` እና `rot`) እና `IrregularLine` (`PntList3D` ወይም `PntList2D`) ጫፍ ለጫፍ ተያይዘው (ክፍተት በቀጥታ ክፍል ይያዛል እና ይመዘገባል)፤ ከጀመረበት ቦታ ሲጨርስ ተዘግቶ ይቆጠራል፤ use እና closed ከCivilCraft የራሱ `Feature` ይወሰዳል፣ ካልሆነ **Only drawn**። ከከፍታ የሌላቸው ነጥቦች 0 ያገኛሉ (ይመዘገባል)። |
| `Spiral` | ከ `Curve` ጎን ያሉ ክሎቶይድ ስፒራሎች (ገብቶም ወጥቶም፤ እንደ PI ከራዲየስና ከስፒራል ርዝመቶች ጋር ይነበባል፣ በ `theta`፣ `totalX`፣ `totalY`፣ `tanLong`፣ `tanShort`፣ `constant` ተመልሶ ይጻፋል) |
| `PipeNetwork` | ቧንቧዎች ያሉት የመጀመሪያው አውታር፦ `Struct` (`Center`፣ `elevRim`፣ `elevSump`፣ `CircStruct` diameter፣ ለእያንዳንዱ ቧንቧ `Invert`) እና `Pipe` (`refStart`፣ `refEnd`፣ `CircPipe` diameter) |

## የሚዘለለው፣ በማስታወሻዎቹ ውስጥ የተጠቀሰው

- ከመጀመሪያው በኋላ ያሉ ወለሎች፣ የፍርግርግ ወለሎችና ሌሎች ያልTIN ወለሎች
- `IrregularLine` ወይም `Chain` ኤለመንቶች ያሉባቸው የመንገድ መስመሮች፣ ከclothoid ውጭ ያሉ ስፒራሎች፣ በሁለት ኩርባዎች መካከል ያለ ስፒራል፣ ወይም ጂኦሜትሪ የሌላቸው
- ከመጀመሪያው በኋላ ያሉ የዲዛይን ፕሮፋይሎች፤ `CircCurve` እና `UnsymParaCurve` ቀጥታ ኩርባዎች (PVIs ያለ ኩርባ ይቀራሉ)
- ሌሎች ነጥቦችን ብቻ የሚያመለክቱ ነጥቦች (`pntRef`)፣ እና ሊነበቡ የማይችሉ መጋጠሚያዎች ያሏቸው ነጥቦች
- የተደጋገሙ የነጥብ ስሞች (የመጀመሪያው ይቀራል)
- የመደበቅ፣ የማሳየትና የውሂብ መቁረጥ ወሰኖች፤ 3D ነጥብ የሌላቸው የመሰበር መስመሮች
- ከመጀመሪያው በኋላ ያሉ የቧንቧ አውታሮች፤ ከstorm እና sanitary ውጭ ያሉ የአውታር ዓይነቶች (እንደ storm ይነበባሉ)
- ቀጥ ያሉ፣ inlet እና outlet መዋቅሮች (እንደ ክብ ይነበባሉ)፤ እንቁላል፣ ኤሊፕቲካል እና ሳጥን ቧንቧዎችና ቦዮች (ያለ መጠን እንደ ክብ ቧንቧዎች ይነበባሉ)
- በፕላን ባህሪያት ውስጥ ያሉ `Spiral` ኤለመንቶች
- `Parcels`፣ `Roadways`፣ `GradeModel` እና `Survey`

በፋይል ውስጥ ያሉ የመሬት ፕሮፋይሎች (`ProfSurf`) ጥቅም ላይ አይውሉም፦ CivilCraft መሬቱን ከወለሉ ራሱ ይወስዳል።

## ፋይሉ ካልከፈተ የሚመጡ መልዕክቶች

| መልዕክት | ትርጉሙ |
|---|---|
| "ይህ XML ነው ግን LandXML አይደለም (ሥር ኤለመንቱ <…> ነው)።" | ፋይሉ ሌላ ዓይነት XML ነው። |
| "… ብቻ ቢሆንም CivilCraft ሊያነባቸው የሚችላቸው ነጥቦች፣ TIN ወለሎችና የመንገድ መስመሮች የሉትም።" | በፋይሉ ያለው ሁሉ በተዘለሉት ዝርዝር ውስጥ ነው። ከእሱ በኋላ ያሉ ማስታወሻዎች ምን እንደነበረ ይናገራሉ። |
| "Mismatched end tag …"፣ "Unclosed tag …"፣ "The file ends inside …" | ፋይሉ ተበላሽቷል ወይም ተቆርጧል። |
