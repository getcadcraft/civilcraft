---
title: LandXML: окулган жана жазылган нерселер
summary: CivilCraft окуган жана жазган LandXML 1.2 элементтери жана атрибуттары элемент-элемент боюнча, ошондой эле ал өткөрүп жиберген нерселердин баары.
keywords: landxml, xml, cgpoints, surface, tin, breaklines, boundary, alignment, coordgeom, profile, profalign, pvi, paracurve, pipenetworks, struct, pipe, planfeatures, planfeature, өзгөчөлүк сызыгы, схема
from: ca3cf359
---

CivilCraft LandXML 1.2 жазат, расмий атын жана схеманын жайгашуусун кошуп. Ал тамыр элементи `LandXML` болгон каалаган файлды окуйт жана төмөндөгү элементтерди аты боюнча алат (атын мейкиндик префикстери эске алынбайт; версия текшерилбейт). Анын XML окуучусу беш стандарттуу белгини жана сандык белги шилтемелерин гана кабыл алат; DTD же тышкы файлды эч качан жүктөбөйт. Кадамдар үчүн караңыз: [LandXML алмашуусу](topic:landxml).

LandXML координаттарды адегенде түндүк (northing) менен жазат: чекит "N E" же "N E Z" түрүндө болот.

## Жазылат

| Элемент | CivilCraft эмнени жазат |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, аянттар квадрат футта, көлөмдөр куб ярдта, диаметрлер дюймда) же `Metric` (meter, square meter, cubic meter, millimeter) |
| `Project` | `name` = долбоордун аты |
| `Application` | аты CivilCraft, өндүрүүчү CadCraft |
| `CgPoints` / `CgPoint` | `name` = чекиттин номери, `desc` = сүрөттөмө, `code` = топ; тексти "N E Z" (же бийиктиги жок "N E") |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw же ccw, `radius`, `length`, `staStart`, `chord`, `delta` (градус менен), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | трасса боюнча мурунку жер, станция жана бийиктик жуптары катары (`PntList2D`), бет чыккан жерден бөлүнөт |
| `Profile` / `ProfAlign` | долбоордогу профиль ("<трасса> design" деп аталат): четтер жана бурч чекиттери үчүн `PVI`, тик ийрилер үчүн `length` менен `ParaCurve` |
| `Surfaces` / `Surface` | `name` жана `desc`; адегенде мурунку жер, андан кийин майдачалар же корридорлор пландалганда "Proposed" |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (мурунку жер гана) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (мурунку жер гана, бар болсо) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `id` менен `Pnts` / `P`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm же sanitary |
| `Struct` | `name`, `elevRim` (колдонулган люк жээги, коюлган же беттен), `elevSump`; `Center`; `diameter` менен `CircStruct`; `elev`, `flowDir` (in же out), `refPipe` менен `Invert` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `diameter` менен `CircPipe` |
| `PlanFeatures` / `PlanFeature` | өзгөчөлүк сызыгы сайын бир: `name`; `CoordGeom` ичинде `Line` (`length`, `Start`, `End`) жана `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` жана `End` "N E Z", `Center` "N E" катары); `code="CivilCraft"` менен `Feature`, `Property` колдонулушу жана closed |

Жазылбайт: майдачалар жана корридорлор объект катары (алардын жыйынтыгы "Proposed" бети), каталуу трассалар, эки инверти жок түтүктөр, тармак эрежелери.

## Окулат

| Элемент | CivilCraft эмнени алат |
|---|---|
| `Units` | `Imperial` же `Metric`, жана анын `linearUnit` фут же метр экенин аныктайт. Белгисиз бирдик эскертилет. |
| `Project` | `name` долбоордун атына айланат. |
| `CgPoints` / `CgPoint` (ичинде да) | аты (же `oID`), "N E" же "N E Z", `desc` (же `code`) сүрөттөмө катары |
| `Surface` `Definition surfType="TIN"` менен | `Pnts` жана `Faces` мурунку жер катары (биринчи бет гана); көрүнбөгөн жактар (`i="1"`) калтырылат |
| `SourceData` / `Breaklines` | 3D өзгөчөлүк сызыктары, бет менен бирге сакталат |
| `SourceData` / `Boundaries` | сырткы чек |
| `Alignment` / `CoordGeom` | `Line` жана `Curve` элементтери; ар бир ийринин `PI` же `Center` жана тангенстеринен кайра түзүлгөн PI'лар; `staStart` |
| `Profile` / `ProfAlign` | `PVI` жана `ParaCurve` (`length` менен); эң аз дегенде эки PVI бар биринчи долбоордогу профиль |
| `PlanFeatures` / `PlanFeature` | ар бири өзгөчөлүк сызыгы катары: `Line`, `Curve` (анын `Start`, `Center`, `End` жана `rot`) жана `IrregularLine` (`PntList3D` же `PntList2D`), учма-уч туташкан (үзүлүш түз кесинди менен толтурулат жана белгиленет); башталган жеринде бүтсө жабык; колдонулушу жана closed CivilCraft'тын өз `Feature` элементинен, болбосо **Жөн гана тартылган**. Бийиктиги жок чекиттер 0 алат (белгиленет). |
| `Spiral` | `Curve` жанындагы клотоид спиралдар (кирүү жана чыгуу; PI радиусу жана спиралдын узундуктары катары окулат, кайра `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant` менен жазылат) |
| `PipeNetwork` | түтүктөрү бар биринчи тармак: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` диаметри, ар бир түтүк үчүн `Invert`) жана `Pipe` (`refStart`, `refEnd`, `CircPipe` диаметри) |

## Өткөрүлүп жиберилет жана эскертүүлөрдө аталат

- Биринчисинен кийинки беттер, торлуу беттер жана TIN эмес башка беттер
- `IrregularLine` же `Chain` элементтери бар трассалар, клотоиддән башка спиралдар, эки ийринин ортосундагы спиралдар же геометриясы жок трассалар
- Биринчисинен кийинки долбоордогу профилдер; `CircCurve` жана `UnsymParaCurve` тик ийрилер (алардын PVI'лары ийрисиз сакталат)
- Башка чекиттерге гана шилтеген чекиттер (`pntRef`) жана окулуучу координаталары жок чекиттер
- Кайталанган чекит аттары (биринчиси сакталат)
- Жашыруу, көрсөтүү жана маалымат кыркуу чектери; 3D чекиттери жок өзгөчөлүк сызыктары
- Биринчисинен кийинки түтүк тармактары; storm жана sanitary эмес тармак түрлөрү (storm катары окулат)
- Туура бурчтуу, кириш жана чыгыш структуралар (тегерек катары окулат); жумуртка, эллиптикалык жана кутуча түтүктөр жана каналдар (өлчөмү жок тегерек түтүктөр катары окулат)
- Өзгөчөлүк сызыктарындагы `Spiral` элементтери
- `Parcels`, `Roadways`, `GradeModel` жана `Survey`

Файлдагы жер профилдери (`ProfSurf`) колдонулбайт: CivilCraft жерди беттин өзүнөн алат.

## Файл ачылбаганда билдирүүлөр

| Билдирүү | Мааниси |
|---|---|
| "Бул XML, бирок LandXML эмес (анын тамыр элементи <…>)." | Файл башка түрдөгү XML. |
| "… CivilCraft окуй ала турган чекиттери, TIN беттери же трассалары жок." | Файлдагы баары өткөрүлгөн тизмеде. Андан кийинки эскертүүлөр ал жерде эмне болгонун айтат. |
| "Туура келбеген жабуучу тег …", "Жабылбаган тег …", "Файл … ичинде бүтөт" | Файл бузулган же кыркылып калган. |
