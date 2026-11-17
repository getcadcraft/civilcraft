---
title: LandXML: што се чита и што се запишува
summary: Елементите и атрибутите на LandXML 1.2 што CivilCraft ги чита и ги запишува, елемент по елемент, и сè што ги прескокнува.
keywords: landxml, xml, cgpoints, површина, tin, линии на прекин, граница, траса, coordgeom, профил, profalign, pvi, paracurve, pipenetworks, struct, цевка, planfeatures, planfeature, линија на карактеристика, шема
from: ca3cf359
---

CivilCraft запишува LandXML 1.2 со официјалниот именски простор и локација на шемата. Чита било која датотека чиј корен елемент е `LandXML` и ги зема елементите подолу по име (префиксите на именските простори се игнорираат; верзијата не се проверува). Неговиот XML читач ги прифаќа само петте стандардни ентитети и нумеричките референци на знаци; никогаш не вчитува DTD или надворешна датотека. За чекорите, види [Размена на LandXML](topic:landxml).

LandXML ги запишува координатите со северната прво: точка е „N E“ или „N E Z“.

## Запишано

| Елемент | Што CivilCraft запишува |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, површини во квадратни стапки, волумени во кубни јарди, дијаметри во инчи) или `Metric` (метар, квадратен метар, кубен метар, милиметар) |
| `Project` | `name` = името на проектот |
| `Application` | `name` CivilCraft, производител CadCraft |
| `CgPoints` / `CgPoint` | `name` = број на точката, `desc` = опис, `code` = група; текст „N E Z“ (или „N E“ без кота) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw или ccw, `radius`, `length`, `staStart`, `chord`, `delta` (степени), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | постоечкиот терен по трасата, како парови станица и кота (`PntList2D`), поделен таму каде излегува од површината |
| `Profile` / `ProfAlign` | проектниот профил (именуван „<траса> design“): `PVI` за крајните и аголните точки, `ParaCurve` со `length` за вертикалните кривини |
| `Surfaces` / `Surface` | `name` и `desc`; прво постоечкиот терен, па „Proposed“ кога подлогите или коридорите нивелираат |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (само постоечкиот терен) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (само постоечкиот терен, кога има) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` со `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm или sanitary |
| `Struct` | `name`, `elevRim` (капакот што се користи, зададен или од површината), `elevSump`; `Center`; `CircStruct` со `diameter`; `Invert` со `elev`, `flowDir` in или out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` со `diameter` |
| `PlanFeatures` / `PlanFeature` | по една за секоја линија на карактеристика: `name`; `CoordGeom` со `Line` (`length`, `Start`, `End`) и `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` и `End` како „N E Z“, `Center` како „N E“); `Feature` со `code="CivilCraft"`, `Property` use и closed |

Не се запишува: подлоги и коридори како објекти (нивниот резултат е површината „Proposed“), траси со грешки, цевки без двете дна, правила за мрежата.

## Прочитано

| Елемент | Што CivilCraft зема |
|---|---|
| `Units` | `Imperial` или `Metric` и нивниот `linearUnit` одлучуваат дали се стапки или метри. Непозната единица се забележува. |
| `Project` | `name` станува име на проектот. |
| `CgPoints` / `CgPoint` (и вгнездените) | име (или `oID`), „N E“ или „N E Z“, `desc` (или `code`) како опис |
| `Surface` со `Definition surfType="TIN"` | `Pnts` и `Faces` како постоечкиот терен (само првата површина); невидливите лица (`i="1"`) се исфрлаат |
| `SourceData` / `Breaklines` | 3D линии на прекин, зачувани со површината |
| `SourceData` / `Boundaries` | надворешната граница |
| `Alignment` / `CoordGeom` | елементите `Line` и `Curve`; PI се градат од `PI` на секоја крива, или од нејзиниот `Center` и тангентите; `staStart` |
| `Profile` / `ProfAlign` | `PVI` и `ParaCurve` (со `length`); првиот проектен профил со најмалку два PVI |
| `PlanFeatures` / `PlanFeature` | секоја како линија на карактеристика: `Line`, `Curve` (нејзините `Start`, `Center`, `End` и `rot`) и `IrregularLine` (`PntList3D` или `PntList2D`) споени од крај до крај (празнина се спојува со права отсечка и се забележува); затворена кога завршува таму каде што почнала; use и closed од сопствениот `Feature` на CivilCraft, инаку **Само нацртано**. Точките без кота добиваат 0 (се забележува). |
| `Spiral` | клотоидни спирали покрај `Curve` (влез и излез; се чита како PI со радиус и должини на спиралите, се запишува назад со `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | првата мрежа што има цевки: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` дијаметар, `Invert` по цевка) и `Pipe` (`refStart`, `refEnd`, `CircPipe` дијаметар) |

## Прескокнато, и наведено во белешките

- Површините по првата, мрежните површини и другите не-TIN површини
- Траси што содржат елементи `IrregularLine` или `Chain`, спирали различни од клотоидни, спирала меѓу две кривини, или траси без геометрија
- Проектни профили по првиот; вертикалните кривини `CircCurve` и `UnsymParaCurve` (нивните PVI се чуваат без кривина)
- Точки што само упатуваат на други точки (`pntRef`), и точки без читливи координати
- Повторени имиња на точки (се задржува првата)
- Скриени, прикажани и исечени по податоци граници; линии на прекин без 3D точки
- Мрежи на цевки по првата; типови мрежи различни од storm и sanitary (се читаат како storm)
- Правоаголни, влезни и излезни конструкции (се читаат како тркалезни); јајести, елиптични и кутиести цевки и канали (се читаат како тркалезни цевки без големина)
- Елементи `Spiral` во карактеристиките на планот
- `Parcels`, `Roadways`, `GradeModel` и `Survey`

Теренските профили (`ProfSurf`) во датотеката не се користат: CivilCraft го зема теренот од самата површина.

## Пораки кога датотеката не може да се отвори

| Порака | Значење |
|---|---|
| „This is XML but not LandXML (its root element is <…>).“ › „Ова е XML, но не е LandXML (коренот е <…>).“ | Датотеката е друг вид XML. |
| „… has no points, TIN surfaces or alignments CivilCraft can read.“ › „… нема точки, TIN површини или траси што CivilCraft може да ги прочита.“ | Сè во датотеката е на листата за прескокнување. Белешките по неа кажуваат што имало. |
| „Mismatched end tag …“, „Unclosed tag …“, „The file ends inside …“ › „Неусогласен завршен таг …“, „Незатворен таг …“, „Датотеката завршува во …“ | Датотеката е оштетена или скратена. |
