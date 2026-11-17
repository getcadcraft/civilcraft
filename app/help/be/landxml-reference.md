---
title: LandXML: што чытаецца і запісваецца
summary: Элементы і атрыбуты LandXML 1.2, якія CivilCraft чытае і запісвае, элемент за элементам, і ўсё, што ён прапускае.
keywords: landxml, xml, cgpoints, паверхня, tin, лініі разрыву, мяжа, траса, coordgeom, профіль, profalign, pvi, paracurve, pipenetworks, struct, труба, planfeatures, planfeature, лінія рэльефу, схема
from: ca3cf359
---

CivilCraft запісвае LandXML 1.2 з афіцыйнай прасторай імёнаў і адрасам схемы. Ён чытае любы файл, карэнны элемент якога — `LandXML`, і бярэ ніжэйпералічаныя элементы па назве (прэфіксы прасторы імёнаў ігнаруюцца; версія не правяраецца). Яго XML-чытач прымае толькі пяць стандартных сутнасцей і лікавыя спасылкі на сімвалы; ён ніколі не загружае DTD або знешні файл. Крокі гл. у [Абмен LandXML](topic:landxml).

LandXML запісвае каардынаты спачатку па поўначы: кропка — гэта «N E» або «N E Z».

## Запісваецца

| Элемент | Што запісвае CivilCraft |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, плошчы ў квадратных футах, аб’ёмы ў кубічных ярдах, дыяметры ў цалях) або `Metric` (meter, square meter, cubic meter, millimeter) |
| `Project` | `name` = назва праекта |
| `Application` | назва CivilCraft, вытворца CadCraft |
| `CgPoints` / `CgPoint` | `name` = нумар кропкі, `desc` = апісанне, `code` = група; тэкст «N E Z» (або «N E» без адзнакі ўзроўню) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw або ccw, `radius`, `length`, `staStart`, `chord`, `delta` (градусы), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | існуючы рэльеф уздоўж восі як пары пікет–ўзровень (`PntList2D`), падзелены там, дзе выходзіць з паверхні |
| `Profile` / `ProfAlign` | праектны профіль (з назвай «<alignment> design»): `PVI` для канцоў і кропак пералому, `ParaCurve` з `length` для вертыкальных крывых |
| `Surfaces` / `Surface` | `name` і `desc`; спачатку існуючы рэльеф, затым «Proposed», калі пляцоўкі або карідоры фармуюць рэльеф |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (толькі існуючы рэльеф) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (толькі існуючы рэльеф, калі ён ёсць) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` з `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm або sanitary |
| `Struct` | `name`, `elevRim` (выкарыстаны абад, зададзены або з паверхні), `elevSump`; `Center`; `CircStruct` з `diameter`; `Invert` з `elev`, `flowDir` in або out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` з `diameter` |
| `PlanFeatures` / `PlanFeature` | па адной на лінію рэльефу: `name`; `CoordGeom` з `Line` (`length`, `Start`, `End`) і `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` і `End` як «N E Z», `Center` як «N E»); `Feature` `code="CivilCraft"` з `Property` use і closed |

Не запісваецца: пляцоўкі і карідоры як аб’екты (іх вынік — паверхня «Proposed»), восі з памылкамі, трубы без абедзвюх інвертаў, правілы сеткі.

## Счытваецца

| Элемент | Што бярэ CivilCraft |
|---|---|
| `Units` | `Imperial` або `Metric`, і іх `linearUnit` вызначаюць футы або метры. Невядомая адзінка адзначаецца. |
| `Project` | `name` становіцца назвай праекта. |
| `CgPoints` / `CgPoint` (таксама ўкладзеныя) | назва (або `oID`), «N E» або «N E Z», `desc` (або `code`) як апісанне |
| `Surface` з `Definition surfType="TIN"` | `Pnts` і `Faces` як існуючы рэльеф (толькі першая паверхня); нябачныя грані (`i="1"`) не ўключаюцца |
| `SourceData` / `Breaklines` | 3D-лініі разрыву, захоўваюцца з паверхняй |
| `SourceData` / `Boundaries` | знешняя мяжа |
| `Alignment` / `CoordGeom` | элементы `Line` і `Curve`; кропкі пералому аднаўляюцца з `PI` кожнай крывой або з яе `Center` і датычных; `staStart` |
| `Profile` / `ProfAlign` | `PVI` і `ParaCurve` (з `length`); першы праектны профіль з мінімум двума PVI |
| `PlanFeatures` / `PlanFeature` | кожная як лінія рэльефу: `Line`, `Curve` (яе `Start`, `Center`, `End` і `rot`) і `IrregularLine` (`PntList3D` або `PntList2D`), злучаныя ўзамен канца (прабел запаўняецца прамым адрэзкам і адзначаецца); замкнёная, калі сыходзіцца з пачаткам; use і closed з уласнага `Feature` CivilCraft, інакш **Толькі накрэслены**. Кропкі без адзнакі ўзроўню atrymlivayuць 0 (адзначаецца). |
| `Spiral` | клотаідныя спіралі побач з `Curve` (на ўваходзе і выхадзе; счытваюцца як PI з радыусам і даўжынямі спіралі, запісваюцца назад з `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | першая сетка, у якой ёсць трубы: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` diameter, `Invert` для кожнай трубы) і `Pipe` (`refStart`, `refEnd`, `CircPipe` diameter) |

## Прапускаецца і называецца ў заўвагах

- Паверхні пасля першай, сеткавыя паверхні і іншыя паверхні не-TIN
- Восі, якія ўтрымліваюць элементы `IrregularLine` або `Chain`, спіралі, адрозныя ад клотаідных, спіраль паміж дзвюма крывымі або восі без геаметрыі
- Праектныя профілі пасля першага; вертыкальныя крывыя `CircCurve` і `UnsymParaCurve` (іх PVI захоўваюцца без крывой)
- Кропкі, якія толькі спасылаюцца на іншыя кропкі (`pntRef`), і кропкі без чытэльных каардынат
- Паўтаральныя назвы кропак (захоўваецца першая)
- Схаваныя, паказаныя і абрэзаныя па дадзеных мяжы; лініі разрыву без 3D-кропак
- Сеткі трубаправодаў пасля першай; тыпы сетак, адрозныя ад storm і sanitary (счытваюцца як storm)
- Прамавугольныя, уваходныя і выходныя канструкцыі (счытваюцца як круглыя); яйкападобныя, эліптычныя і скрынкавыя трубы і каналы (счытваюцца як круглыя трубы без памеру)
- Элементы `Spiral` у планавых элементах
- `Parcels`, `Roadways`, `GradeModel` і `Survey`

Профілі рэльефу (`ProfSurf`) у файле не выкарыстоўваюцца: CivilCraft бярэ рэльеф непасрэдна з паверхні.

## Паведамленні, калі файл не адкрываецца

| Паведамленне | Значэнне |
|---|---|
| «Гэта XML, але не LandXML (яго карэнны элемент — <…>).» | Файл іншага тыпу XML. |
| «… не мае кропак, TIN-паверхняў або восяў, якія CivilCraft можа прачытаць.» | Усё ў файле ўваходзіць у спіс прапускаемага. Заўвагі пасля яго гавораць, што там было. |
| «Mismatched end tag …», «Unclosed tag …», «The file ends inside …» | Файл пашкоджаны або абрэзаны. |
