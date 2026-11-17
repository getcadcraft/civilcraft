---
title: LandXML: какво се чете и се записва
summary: Елементите и атрибутите на LandXML 1.2, които CivilCraft чете и записва, по елемент, и всичко, което пропуска.
keywords: landxml, xml, cgpoints, повърхнина, tin, линии на прекъсване, граница, трасе, coordgeom, профил, profalign, pvi, paracurve, pipenetworks, struct, тръба, planfeatures, planfeature, характерна линия, схема
from: ca3cf359
---

CivilCraft записва LandXML 1.2 с официалното пространство от имена и местоположението на схемата. Чете всеки файл, чийто коренен елемент е `LandXML`, и взема елементите по-долу по име (префиксите на пространството от имена се игнорират; версията не се проверява). Четецът на XML приема само петте стандартни обекта и числовите знакови препратки; никога не зарежда DTD или външен файл. За стъпките вижте [Обмен на LandXML](topic:landxml).

LandXML записва координатите първо по Northing: точката е „N E“ или „N E Z“.

## Записвано

| Елемент | Какво записва CivilCraft |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, площи в квадратни фута, обеми в кубически ярда, диаметри в инчове) или `Metric` (meter, square meter, cubic meter, millimeter) |
| `Project` | `name` = името на проекта |
| `Application` | име CivilCraft, производител CadCraft |
| `CgPoints` / `CgPoint` | `name` = номер на точката, `desc` = описание, `code` = група; текст „N E Z“ (или „N E“ без кота) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw или ccw, `radius`, `length`, `staStart`, `chord`, `delta` (градуси), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | съществуващият терен по трасето, като двойки пикет и кота (`PntList2D`), разделен там, където излиза от повърхнината |
| `Profile` / `ProfAlign` | проектният профил (наречен „<alignment> design“): `PVI` за краищата и ъгловите точки, `ParaCurve` с `length` за вертикалните криви |
| `Surfaces` / `Surface` | `name` и `desc`; първо съществуващият терен, после „Proposed“, когато площадките или коридорите се планират |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (само съществуващ терен) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (само съществуващ терен, когато има такъв) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` с `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm или sanitary |
| `Struct` | `name`, `elevRim` (използваният капак, зададен или от повърхнината), `elevSump` (кота на утайника); `Center`; `CircStruct` с `diameter`; `Invert` с `elev`, `flowDir` in или out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` с `diameter` |
| `PlanFeatures` / `PlanFeature` | по една за всяка характерна линия: `name`; `CoordGeom` с `Line` (`length`, `Start`, `End`) и `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` и `End` като „N E Z“, `Center` като „N E“); `Feature` `code="CivilCraft"` с `Property` use и closed |

Не се записва: площадките и коридорите като обекти (резултатът им е повърхнината „Proposed“), трасета с грешки, тръби без двете дънни коти, правилата на мрежата.

## Четено

| Елемент | Какво взима CivilCraft |
|---|---|
| `Units` | `Imperial` или `Metric` и неговият `linearUnit` определят фути или метри. Непознатата единица се отбелязва. |
| `Project` | `name` става името на проекта. |
| `CgPoints` / `CgPoint` (и вложените) | името (или `oID`), „N E“ или „N E Z“, `desc` (или `code`) като описание |
| `Surface` с `Definition surfType="TIN"` | `Pnts` и `Faces` като съществуващ терен (само първата повърхнина); невидимите триъгълници (`i="1"`) се пропускат |
| `SourceData` / `Breaklines` | 3D линии на прекъсване, запазени с повърхнината |
| `SourceData` / `Boundaries` | външната граница |
| `Alignment` / `CoordGeom` | елементи `Line` и `Curve`; PI се възстановяват от `PI` на всяка крива или от `Center` и допирателните; `staStart` |
| `Profile` / `ProfAlign` | `PVI` и `ParaCurve` (с `length`); първият проектен профил с поне два PVI |
| `PlanFeatures` / `PlanFeature` | всеки като характерна линия: `Line`, `Curve` (`Start`, `Center`, `End` и `rot`) и `IrregularLine` (`PntList3D` или `PntList2D`), съединени от край до край (празнината се свързва с права отсечка и се отбелязва); затворена, когато завършва там, където е започнала; use и closed от собствения `Feature` на CivilCraft, иначе **Само начертана**. Точките без кота получават 0 (отбелязва се). |
| `Spiral` | клотоидни спирали до `Curve` (вход и изход; четат се като PI с радиус и дължини на спиралата, записват се обратно с `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | първата мрежа, която има тръби: `Struct` (`Center`, `elevRim`, `elevSump`, диаметър от `CircStruct`, `Invert` за всяка тръба) и `Pipe` (`refStart`, `refEnd`, диаметър от `CircPipe`) |

## Пропуснато и посочено в бележките

- Повърхнините след първата, мрежовите повърхнини и другите повърхнини, които не са TIN
- Трасета, които съдържат елементи `IrregularLine` или `Chain`, спирали, различни от клотоидни, спирала между две криви или трасета без геометрия
- Проектните профили след първия; вертикалните криви `CircCurve` и `UnsymParaCurve` (техните PVI се запазват без крива)
- Точките, които само сочат други точки (`pntRef`), и точките без четими координати
- Повтарящи се имена на точки (запазва се първата)
- Граници: скриване, показване и изрязване на данни; линии на прекъсване без 3D точки
- Тръбните мрежи след първата; типове мрежи, различни от storm и sanitary (четат се като storm)
- Правоъгълни, входни и изходни съоръжения (четат се като кръгли); яйцевидни, елиптични и кутиени тръби и канали (четат се като кръгли тръби без размер)
- Елементи `Spiral` в характерните линии
- `Parcels`, `Roadways`, `GradeModel` и `Survey`

Профилите на терена (`ProfSurf`) във файл не се използват: CivilCraft взема пробите на терена от самата повърхнина.

## Съобщения, когато файлът не може да се отвори

| Съобщение | Значение |
|---|---|
| „Това е XML, но не е LandXML (коренният му елемент е <…>).“ | Файлът е друг вид XML. |
| „… няма точки, TIN повърхнини или трасета, които CivilCraft може да прочете.“ | Всичко във файла е в списъка за пропускане. Бележките след него казват какво е имало. |
| „Несъвпадащ краен етикет …“, „Незатворен етикет …“, „Файлът свършва в …“ | Файлът е повреден или прекъснат. |
