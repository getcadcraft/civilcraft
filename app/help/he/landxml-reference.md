---
title: LandXML: מה נקרא ומה נכתב
summary: האלמנטים והתכונות של LandXML 1.2 ש-CivilCraft קוראת וכותבת, אלמנט אחר אלמנט, וכל מה שהיא מדלגת עליו.
keywords: landxml, xml, cgpoints, surface, tin, breaklines, boundary, alignment, coordgeom, profile, profalign, pvi, paracurve, pipenetworks, struct, pipe, planfeatures, planfeature, קו מאפיין, סכמה
from: ca3cf359
---

CivilCraft כותבת LandXML 1.2 עם מרחב השמות הרשמי ועם מיקום הסכמה הרשמי. היא קוראת כל קובץ ששורש האלמנטים שלו הוא `LandXML`, ולוקחת את האלמנטים שלהלן לפי שמם (קידומות של מרחב שמות מתעלמים מהן; הגרסה לא נבדקת). קורא ה-XML שלה מקבל רק את חמש הישויות הסטנדרטיות ואת התייחסויות התווים המספריות; היא לעולם לא טוענת DTD או קובץ חיצוני. לשלבים, ראו [ייצוא LandXML](topic:landxml).

LandXML כותבת קואורדינטות לפי הצפון קודם: נקודה היא "N E" או "N E Z".

## נכתב

| אלמנט | מה CivilCraft כותבת |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, שטחים ברגל רבועה, נפחים ביארד מעוקב, קטרים באינץ') או `Metric` (meter, square meter, cubic meter, millimeter) |
| `Project` | `name` = שם הפרויקט |
| `Application` | שם CivilCraft, יצרן CadCraft |
| `CgPoints` / `CgPoint` | `name` = מספר הנקודה, `desc` = תיאור, `code` = קבוצה; טקסט "N E Z" (או "N E" בלי מפלס) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw או ccw, `radius`, `length`, `staStart`, `chord`, `delta` (במעלות), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | הקרקע הקיימת לאורך הציר, כזוגות של תחנה ומפלס (`PntList2D`), מפוצלת במקום שבו היא יוצאת מהמשטח |
| `Profile` / `ProfAlign` | פרופיל התכנון (בשם "<alignment> design"): `PVI` לקצוות ולנקודות זווית, `ParaCurve` עם `length` לעקומות אנכיות |
| `Surfaces` / `Surface` | `name` ו-`desc`; קודם הקרקע הקיימת, ואחריה "Proposed" כשמשטחי בנייה או מסדרונות מפותחים |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (הקרקע הקיימת בלבד) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (הקרקע הקיימת בלבד, כשיש כזו) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` עם `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm או sanitary |
| `Struct` | `name`, `elevRim` (השפה בשימוש, מוגדרת או נלקחת מהמשטח), `elevSump`; `Center`; `CircStruct` עם `diameter`; `Invert` עם `elev`, `flowDir` in או out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` עם `diameter` |
| `PlanFeatures` / `PlanFeature` | אחד לכל קו מאפיין: `name`; `CoordGeom` עם `Line` (`length`, `Start`, `End`) ו-`Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` ו-`End` כ-"N E Z", `Center` כ-"N E"); `Feature` עם `code="CivilCraft"` עם התכונה `Property` ו-closed |

לא נכתבים: משטחי בנייה ומסדרונות כאובייקטים (התוצאה שלהם היא המשטח "Proposed"), צירים עם שגיאות, צינורות בלי שתי תחתיות, כללי רשת.

## נקרא

| אלמנט | מה CivilCraft לוקחת |
|---|---|
| `Units` | `Imperial` או `Metric`, וה-`linearUnit` שלהם, קובעים אם מדובר ברגל או במטר. יחידה לא מוכרת נרשמת. |
| `Project` | `name` הופך לשם הפרויקט. |
| `CgPoints` / `CgPoint` (גם מקוננים) | שם (או `oID`), "N E" או "N E Z", `desc` (או `code`) כתיאור |
| `Surface` עם `Definition surfType="TIN"` | `Pnts` ו-`Faces` כקרקע הקיימת (המשטח הראשון בלבד); פאות בלתי נראות (`i="1"`) מושמטות |
| `SourceData` / `Breaklines` | קווי שבר תלת־ממדיים, נשמרים עם המשטח |
| `SourceData` / `Boundaries` | הגבול החיצוני |
| `Alignment` / `CoordGeom` | אלמנטים `Line` ו-`Curve`; נקודות ה-PI נבנות מחדש מ-`PI` של כל עקום, או מ-`Center` ומשיקים; `staStart` |
| `Profile` / `ProfAlign` | `PVI` ו-`ParaCurve` (עם `length`); פרופיל התכנון הראשון שיש בו לפחות שתי נקודות PVI |
| `PlanFeatures` / `PlanFeature` | כל אחד כקו מאפיין: `Line`, `Curve` (`Start`, `Center`, `End` ו-`rot` שלו) ו-`IrregularLine` (`PntList3D` או `PntList2D`), מחוברים קצה לקצה (פער מחובר בקו ישר ומצוין בהערה); סגור כשהוא מסתיים איפה שהתחיל; שימוש וסגירה מה-`Feature` של CivilCraft עצמה, אחרת **רק שרטוט**. נקודות בלי מפלס מקבלות 0 (מצוין בהערה). |
| `Spiral` | ספירלות קלותואידיות לצד `Curve` (בכניסה וביציאה); נקראות כ-PI עם רדיוס ואורכי ספירלה, ונכתבות בחזרה עם `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant` |
| `PipeNetwork` | הרשת הראשונה שיש בה צינורות: `Struct` (`Center`, `elevRim`, `elevSump`, קוטר `CircStruct`, `Invert` לכל צינור) ו-`Pipe` (`refStart`, `refEnd`, קוטר `CircPipe`) |

## מדולג, ומצוין בהערות

- משטחים אחרי הראשון, משטחי רשת ומשטחים לא-TIN אחרים
- צירים שמכילים `IrregularLine` או `Chain`, ספירלות שאינן קלותואידיות, ספירלה בין שני עקומים, או צירים בלי גיאומטריה
- פרופילי תכנון אחרי הראשון; עקומים אנכיים `CircCurve` ו-`UnsymParaCurve` (ה-PVI שלהם נשמרים בלי עקום)
- נקודות שרק מפנות לנקודות אחרות (`pntRef`), ונקודות בלי קואורדינטות קריאות
- שמות נקודות חוזרים (הראשון נשמר)
- גבולות הסתרה, הצגה וחיתוך נתונים; קווי שבר בלי נקודות תלת־ממדיות
- רשתות צנרת אחרי הראשונה; סוגי רשת שאינם storm או sanitary (נקראים כ-storm)
- מבנים מלבניים, כניסה ויציאה (נקראים כעגולים); צינורות וערוצים ביצה, אליפטיים ותיבה (נקראים כצינורות עגולים בלי גודל)
- אלמנטים `Spiral` בקווי מאפיין
- `Parcels`, `Roadways`, `GradeModel` ו-`Survey`

פרופילי קרקע (`ProfSurf`) בקובץ אינם בשימוש: CivilCraft דוגמת את הקרקע ישירות מהמשטח.

## הודעות כשקובץ לא נפתח

| הודעה | משמעות |
|---|---|
| "זהו XML אך לא LandXML (אלמנט השורש שלו הוא <…>)." | הקובץ הוא סוג אחר של XML. |
| "… אין בו נקודות, משטחי TIN או צירים ש-CivilCraft יכולה לקרוא." | כל מה שבקובץ נמצא ברשימת המדולגים. ההערות שאחריה אומרות מה היה שם. |
| "תג סיום לא תואם …", "תג לא סגור …", "הקובץ מסתיים בתוך …" | הקובץ פגום או נחתך באמצע. |
