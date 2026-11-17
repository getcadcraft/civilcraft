---
title: LandXML: что читается и записывается
summary: Элементы и атрибуты LandXML 1.2, которые CivilCraft читает и записывает, поэлементно, и все, что он пропускает.
keywords: landxml, xml, cgpoints, поверхность, tin, структурные линии, граница, трасса, coordgeom, профиль, profalign, pvi, paracurve, pipenetworks, struct, труба, planfeatures, planfeature, характерная линия, схема
from: ca3cf359
---

CivilCraft записывает LandXML 1.2 с официальным пространством имен и местоположением схемы. Он читает любой файл, корневой элемент которого `LandXML`, и берет перечисленные ниже элементы по имени (префиксы пространств имен игнорируются; версия не проверяется). Его XML-читатель принимает только пять стандартных сущностей и числовые ссылки на символы; он никогда не загружает DTD или внешний файл. Шаги см. в [Обмен LandXML](topic:landxml).

LandXML записывает координаты, сначала северную (northing): точка задается как «N E» или «N E Z».

## Записывается

| Элемент | Что записывает CivilCraft |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, площади в квадратных футах, объемы в кубических ярдах, диаметры в дюймах) или `Metric` (meter, square meter, cubic meter, millimeter) |
| `Project` | `name` = имя проекта |
| `Application` | name CivilCraft, manufacturer CadCraft |
| `CgPoints` / `CgPoint` | `name` = номер точки, `desc` = описание, `code` = группа; текст "N E Z" (или "N E" без отметки) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw или ccw, `radius`, `length`, `staStart`, `chord`, `delta` (градусы), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | существующий рельеф вдоль трассы в виде пар пикет и отметка (`PntList2D`), разбитый там, где он выходит из поверхности |
| `Profile` / `ProfAlign` | проектный профиль (с именем "<alignment> design"): `PVI` для концов и точек излома, `ParaCurve` с `length` для вертикальных кривых |
| `Surfaces` / `Surface` | `name` и `desc`; сначала существующий рельеф, затем "Proposed", когда площадки или коридоры формируют рельеф |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (только существующий рельеф) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (только существующий рельеф, если он есть) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` с `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm или sanitary |
| `Struct` | `name`, `elevRim` (используемый верх колодца, заданный или взятый из поверхности), `elevSump`; `Center`; `CircStruct` с `diameter`; `Invert` с `elev`, `flowDir` in или out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` с `diameter` |
| `PlanFeatures` / `PlanFeature` | по одному на каждую характерную линию: `name`; `CoordGeom` с `Line` (`length`, `Start`, `End`) и `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` и `End` как "N E Z", `Center` как "N E"); `Feature` `code="CivilCraft"` с `Property` use и closed |

Не записывается: площадки и коридоры как объекты (их результат — поверхность "Proposed"), трассы с ошибками, трубы без обоих лотков (inverts), правила сети.

## Читается

| Элемент | Что берет CivilCraft |
|---|---|
| `Units` | `Imperial` или `Metric`, и их `linearUnit` определяют футы или метры. Неизвестная единица отмечается. |
| `Project` | `name` становится именем проекта. |
| `CgPoints` / `CgPoint` (также вложенные) | name (или `oID`), "N E" или "N E Z", `desc` (или `code`) как описание |
| `Surface` с `Definition surfType="TIN"` | `Pnts` и `Faces` как существующий рельеф (только первая поверхность); невидимые грани (`i="1"`) пропускаются |
| `SourceData` / `Breaklines` | 3D-структурные линии, сохраняются с поверхностью |
| `SourceData` / `Boundaries` | внешняя граница |
| `Alignment` / `CoordGeom` | элементы `Line` и `Curve`; вершины пересечения (PI) восстанавливаются по `PI` каждой кривой или по ее `Center` и касательным; `staStart` |
| `Profile` / `ProfAlign` | `PVI` и `ParaCurve` (с `length`); первый проектный профиль, в котором не меньше двух PVI |
| `PlanFeatures` / `PlanFeature` | каждый как характерная линия: `Line`, `Curve` (его `Start`, `Center`, `End` и `rot`) и `IrregularLine` (`PntList3D` или `PntList2D`), соединенные встык (разрыв соединяется прямым отрезком и отмечается); замкнутая, если заканчивается там, где начиналась; use и closed берутся из собственного `Feature` CivilCraft, иначе **Только нарисовано**. Точки без отметки получают 0 (отмечается). |
| `Spiral` | клотоидные переходные кривые рядом с `Curve` (на входе и выходе; читаются как PI с радиусом и длинами спиралей, записываются обратно с `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | первая сеть, содержащая трубы: `Struct` (`Center`, `elevRim`, `elevSump`, диаметр `CircStruct`, `Invert` на каждую трубу) и `Pipe` (`refStart`, `refEnd`, диаметр `CircPipe`) |

## Пропускается и отмечается в примечаниях

- поверхности после первой, сеточные поверхности и другие не-TIN поверхности
- трассы, содержащие элементы `IrregularLine` или `Chain`, спирали, отличные от клотоиды, спираль между двумя кривыми или трассы без геометрии
- проектные профили после первого; вертикальные кривые `CircCurve` и `UnsymParaCurve` (их PVI сохраняются без кривой)
- точки, которые только ссылаются на другие точки (`pntRef`), и точки без читаемых координат
- повторяющиеся имена точек (сохраняется первая)
- скрытые, показанные и обрезанные по данным границы; структурные линии без 3D-точек
- трубопроводные сети после первой; типы сетей, отличные от storm и sanitary (читаются как storm)
- прямоугольные, входные и выходные колодцы (читаются как круглые); яйцевидные, эллиптические и коробчатые трубы и лотки (читаются как круглые трубы без размера)
- элементы `Spiral` в характерных линиях
- `Parcels`, `Roadways`, `GradeModel` и `Survey`

Профили рельефа (`ProfSurf`) в файле не используются: CivilCraft берет отметки рельефа из самой поверхности.

## Сообщения, когда файл не открывается

| Сообщение | Значение |
|---|---|
| "This is XML but not LandXML (its root element is <…>)." | Это XML, но не LandXML (его корневой элемент — <…>). Файл другого вида XML. |
| "… has no points, TIN surfaces or alignments CivilCraft can read." | … не содержит точек, TIN-поверхностей или трасс, которые CivilCraft может прочитать. Все содержимое файла находится в списке пропускаемого; примечания после сообщения говорят, что там было. |
| "Mismatched end tag …", "Unclosed tag …", "The file ends inside …" | Несовпадающий закрывающий тег …, незакрытый тег …, файл обрывается внутри … Файл поврежден или обрезан. |
