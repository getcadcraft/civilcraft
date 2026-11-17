---
title: LandXML: що читається і записується
summary: Елементи і атрибути LandXML 1.2, які CivilCraft читає і записує, елемент за елементом, і все, що він пропускає.
keywords: landxml, xml, cgpoints, поверхня, tin, лінії рельєфу, межа, траса, coordgeom, профіль, profalign, pvi, paracurve, pipenetworks, споруда, труба, planfeatures, лінія елемента, схема
from: ca3cf359
---

CivilCraft записує LandXML 1.2 з офіційним простором імен і розташуванням схеми. Він читає будь-який файл, кореневий елемент якого `LandXML`, і бере нижчеперелічені елементи за іменами (префікси простору імен ігноруються; версія не перевіряється). Його XML-читач приймає лише п'ять стандартних сутностей і числові посилання на символи; він ніколи не завантажує DTD чи зовнішній файл. Кроки див. у [Обмін LandXML](topic:landxml).

LandXML записує координати, починаючи з північної: точка — це «N E» або «N E Z».

## Записується

| Елемент | Що записує CivilCraft |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, площі в квадратних футах, об'єми в кубічних ярдах, діаметри в дюймах) або `Metric` (meter, square meter, cubic meter, millimeter) |
| `Project` | `name` = назва проєкту |
| `Application` | name CivilCraft, manufacturer CadCraft |
| `CgPoints` / `CgPoint` | `name` = номер точки, `desc` = опис, `code` = група; текст «N E Z» (або «N E», якщо немає відмітки) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw або ccw, `radius`, `length`, `staStart`, `chord`, `delta` (градуси), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | існуючий рельєф уздовж траси у вигляді пар пікет і відмітка (`PntList2D`), розділений там, де він виходить за межі поверхні |
| `Profile` / `ProfAlign` | проєктний профіль (названий "<alignment> design"): `PVI` для кінців і точок кута, `ParaCurve` з `length` для вертикальних кривих |
| `Surfaces` / `Surface` | `name` і `desc`; спочатку існуючий рельєф, потім "Proposed", коли майданчики або коридори планують рельєф |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (лише існуючий рельєф) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (лише існуючий рельєф, коли він є) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` з `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm або sanitary |
| `Struct` | `name`, `elevRim` (використаний обід, заданий або взятий з поверхні), `elevSump`; `Center`; `CircStruct` з `diameter`; `Invert` з `elev`, `flowDir` in або out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` з `diameter` |
| `PlanFeatures` / `PlanFeature` | по одному на лінію елемента: `name`; `CoordGeom` з `Line` (`length`, `Start`, `End`) і `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` і `End` як «N E Z», `Center` як «N E»); `Feature` з `code="CivilCraft"`, `Property` зі значенням use і closed |

Не записуються: майданчики і коридори як окремі об'єкти (їхній результат — поверхня "Proposed"), траси з помилками, труби без обох відміток дна, правила мережі.

## Читається

| Елемент | Що бере CivilCraft |
|---|---|
| `Units` | `Imperial` або `Metric` та його `linearUnit` визначають, фути чи метри. Невідома одиниця позначається в примітках. |
| `Project` | `name` стає назвою проєкту. |
| `CgPoints` / `CgPoint` (також вкладені) | name (або `oID`), «N E» або «N E Z», `desc` (або `code`) як опис |
| `Surface` з `Definition surfType="TIN"` | `Pnts` і `Faces` як існуючий рельєф (лише перша поверхня); невидимі грані (`i="1"`) пропускаються |
| `SourceData` / `Breaklines` | 3D-лінії рельєфу, зберігаються разом з поверхнею |
| `SourceData` / `Boundaries` | зовнішня межа |
| `Alignment` / `CoordGeom` | елементи `Line` і `Curve`; PI відновлюються з `PI` кожної кривої або з її `Center` і дотичних; `staStart` |
| `Profile` / `ProfAlign` | `PVI` і `ParaCurve` (з `length`); перший проєктний профіль з принаймні двома PVI |
| `PlanFeatures` / `PlanFeature` | кожен як лінія елемента: `Line`, `Curve` (його `Start`, `Center`, `End` і `rot`) і `IrregularLine` (`PntList3D` або `PntList2D`), з'єднані від кінця до кінця (проміжок з'єднується прямим відрізком і позначається); замкнутий, якщо закінчується там, де почався; use і closed беруться з власного `Feature` CivilCraft, інакше **Лише намальовано**. Точки без відмітки отримують 0 (позначається). |
| `Spiral` | клотоїдні спіралі біля `Curve` (на вході і на виході; читаються як PI з радіусом і довжинами спіралей, записуються назад з `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | перша мережа, що має труби: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` з діаметром, `Invert` для кожної труби) і `Pipe` (`refStart`, `refEnd`, `CircPipe` з діаметром) |

## Пропускається і називається в примітках

- Поверхні після першої, сіткові поверхні та інші не-TIN поверхні
- Траси, що містять елементи `IrregularLine` або `Chain`, спіралі, відмінні від клотоїдних, спіраль між двома кривими або такі, що не мають геометрії
- Проєктні профілі після першого; вертикальні криві `CircCurve` і `UnsymParaCurve` (їхні PVI зберігаються без кривої)
- Точки, що лише посилаються на інші точки (`pntRef`), і точки без читабельних координат
- Повторювані імена точок (зберігається перша)
- Приховані, показані і обрізані за даними межі; лінії рельєфу без 3D-точок
- Мережі труб після першої; типи мереж, відмінні від storm і sanitary (читаються як storm)
- Прямокутні, вхідні і вихідні споруди (читаються як круглі); яйцеподібні, еліптичні і коробчасті труби та канали (читаються як круглі труби без розміру)
- Елементи `Spiral` у лініях елементів
- `Parcels`, `Roadways`, `GradeModel` і `Survey`

Профілі рельєфу (`ProfSurf`) у файлі не використовуються: CivilCraft бере відмітки рельєфу з самої поверхні.

## Повідомлення, коли файл не відкривається

| Повідомлення | Що означає |
|---|---|
| «Це XML, але не LandXML (його кореневий елемент — <…>).» | Файл іншого типу XML. |
| «… не має точок, поверхонь TIN чи трас, які CivilCraft може прочитати.» | Усе у файлі належить до списку пропущеного. Примітки після нього пояснюють, що там було. |
| «Невідповідний закривальний тег …», «Незакритий тег …», «Файл закінчується всередині …» | Файл пошкоджено або обірвано. |
