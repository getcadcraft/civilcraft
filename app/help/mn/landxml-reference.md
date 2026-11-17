---
title: LandXML: юуг уншиж, юуг бичдэг вэ
summary: CivilCraft-ийн уншиж, бичдэг LandXML 1.2 элемент ба атрибутууд, элемент тус бүрээр, мөн бүх алгасдаг зүйлс.
keywords: landxml, xml, cgpoints, гадаргуу, tin, шугамууд, хил, трасс, alignment, coordgeom, профайл, profalign, pvi, paracurve, pipenetworks, struct, хоолой, planfeatures, planfeature, онцлогийн шугам, схем
from: ca3cf359
---

CivilCraft нь LandXML 1.2-ийг албан ёсны нэрийн орон зай ба схемийн байршилтай бичдэг. Root элемент нь `LandXML` байсан ямар ч файлыг уншина, мөн доорх элементүүдийг нэрээр нь авна (нэрийн орон зайн угтварыг үл тооно; хувилбарыг шалгахгүй). Түүний XML уншигч зөвхөн таван стандарт entity ба тоон дүрсийн лавлагааг хүлээн авдаг; DTD эсвэл гадаад файлыг хэзээ ч ачаалахгүй. Алхмуудын талаар үзнэ үү: [LandXML солилцох](topic:landxml).

LandXML координатыг хойд (N) талаас нь эхлүүлж бичдэг: цэг нь "N E" эсвэл "N E Z".

## Бичигддэг

| Элемент | CivilCraft юу бичдэг |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, талбай square feet-ээр, эзлэхүүн cubic yards-аар, диаметр inches-ээр) эсвэл `Metric` (meter, square meter, cubic meter, millimeter) |
| `Project` | `name` = төслийн нэр |
| `Application` | нэр CivilCraft, үйлдвэрлэгч CadCraft |
| `CgPoints` / `CgPoint` | `name` = цэгийн дугаар, `desc` = тодорхойлолт, `code` = бүлэг; текст "N E Z" (эсвэл өндөргүй бол "N E") |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw эсвэл ccw, `radius`, `length`, `staStart`, `chord`, `delta` (градус), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | трассын дагуух одоогийн газар, станц ба өндрийн хосууд (`PntList2D`), гадаргуугаас гарах газраараа хуваагдсан |
| `Profile` / `ProfAlign` | төлөвлөсөн профайл (нэр нь "<трасс> design"): төгсгөл ба өнцгийн цэгүүдэд `PVI`, босоо муруйнуудад `length`-тай `ParaCurve` |
| `Surfaces` / `Surface` | `name` ба `desc`; эхлээд одоогийн газар, тавцан эсвэл коридор газардах үед дараа нь "Proposed" |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (зөвхөн одоогийн газар) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (зөвхөн одоогийн газар, байвал) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `id`-тай `Pnts` / `P`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm эсвэл sanitary |
| `Struct` | `name`, `elevRim` (ашигласан ирмэг, тохируулсан эсвэл гадаргуугаас), `elevSump`; `Center`; `diameter`-тай `CircStruct`; `elev`, `flowDir` (in эсвэл out), `refPipe`-тай `Invert` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `diameter`-тай `CircPipe` |
| `PlanFeatures` / `PlanFeature` | онцлогийн шугам бүрт нэг: `name`; `Line` (`length`, `Start`, `End`) ба `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`) бүхий `CoordGeom` — `Start` ба `End` нь "N E Z", `Center` нь "N E"; CivilCraft-ийн өөрийн `Feature` `code="CivilCraft"`, `Property` ашиглалт ба closed |

Бичигддэггүй: объект болгон тавцан ба коридор (үр дүн нь "Proposed" гадаргуу), алдаатай трассууд, хоёр инвертгүй хоолойнууд, сүлжээний дүрмүүд.

## Уншдаг

| Элемент | CivilCraft юуг авдаг |
|---|---|
| `Units` | `Imperial` эсвэл `Metric` ба түүний `linearUnit` нь фут эсвэл метрийг тодорхойлдог. Танигдаагүй нэгжийг тэмдэглэнэ. |
| `Project` | `name` төслийн нэр болдог. |
| `CgPoints` / `CgPoint` (үүрлэгдсэн ч) | нэр (эсвэл `oID`), "N E" эсвэл "N E Z", тодорхойлолтоор `desc` (эсвэл `code`) |
| `Surface` `Definition surfType="TIN"`-тай | `Pnts` ба `Faces` одоогийн газар болгон (зөвхөн эхний гадаргуу); харагдахгүй гадаргуунууд (`i="1"`) орхигдоно |
| `SourceData` / `Breaklines` | 3D шугамууд, гадаргуутай хамт хадгалагдана |
| `SourceData` / `Boundaries` | гадна хил |
| `Alignment` / `CoordGeom` | `Line` ба `Curve` элементүүд; PI-уудыг муруй бүрийн `PI`-аас, эсвэл түүний `Center` ба шүргэгчээс дахин бүтээнэ; `staStart` |
| `Profile` / `ProfAlign` | `PVI` ба `ParaCurve` (`length`-тай); хамгийн багадаа хоёр PVI-тай эхний төлөвлөсөн профайл |
| `PlanFeatures` / `PlanFeature` | бүр онцлогийн шугам болгон: `Line`, `Curve` (`Start`, `Center`, `End` ба `rot`) ба `IrregularLine` (`PntList3D` эсвэл `PntList2D`) — үзүүрээрээ холбоно (завсарыг шулуун хэсгээр холбож тэмдэглэнэ); эхэлсэн газартаа төгсвөл closed; CivilCraft-ийн өөрийн `Feature`-ээс ашиглалт ба closed, эс бөгөөс **Зөвхөн зурсан**. Өндөргүй цэг 0 авна (тэмдэглэнэ). |
| `Spiral` | `Curve`-ийн хажуугийн клотоид спираль (орох ба гарах; PI-тай радиус ба спираль уртаар уншина, `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`-оор буцааж бичнэ) |
| `PipeNetwork` | хоолойтой эхний сүлжээ: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` diameter, хоолой бүрийн `Invert`) ба `Pipe` (`refStart`, `refEnd`, `CircPipe` diameter) |

## Алгасдаг, мөн тэмдэглэлд нэрлэгддэг

- Эхнийхээс хойшхи гадаргуунууд, торон гадаргуунууд ба TIN биш бусад гадаргуунууд
- `IrregularLine` эсвэл `Chain` элементтэй трассууд, клотоидоос өөр спираль, хоёр муруйн хооронд спираль, эсвэл геометргүй трассууд
- Эхнийхээс хойшхи төлөвлөсөн профайлууд; `CircCurve` ба `UnsymParaCurve` босоо муруйнууд (тэдний PVI-ууд муруйгүйгээр хадгалагдана)
- Бусад цэгт хамаарах зөвхөн цэгүүд (`pntRef`), уншигдах координатгүй цэгүүд
- Давтагдсан цэгийн нэрүүд (эхнийг нь хадгална)
- Нуух, харуулах ба өгөгдөл тайрах хилүүд; 3D цэггүй шугамууд
- Эхнийхээс хойшхи хоолойн сүлжээнүүд; storm ба sanitary-аас өөр сүлжээний төрлүүд (storm гэж уншина)
- Тэгш өнцөгт, оролт ба гарцын бүтэц (дугуй гэж уншина); өндөг, эллипс ба хайрцаг хоолой, суваг (хэмжээгүй дугуй хоолой гэж уншина)
- Онцлогийн шугамд `Spiral` элементүүд
- `Parcels`, `Roadways`, `GradeModel` ба `Survey`

Файлын газрын профайлууд (`ProfSurf`) ашиглагдахгүй: CivilCraft газрыг гадаргуугаас өөрөө авдаг.

## Файл нээгдэхгүй үед гарах мессежүүд

| Мессеж | Утга |
|---|---|
| "Энэ бол XML боловч LandXML биш (root элемент нь <…>)." | Файл өөр төрлийн XML байна. |
| "… нь CivilCraft уншиж чадах цэг, TIN гадаргуу эсвэл трасс агуулаагүй." | Файлын бүх зүйл алгасагдсан жагсаалтад байна. Дараах тэмдэглэлүүд тэнд юу байсныг хэлнэ. |
| "Төгсгөлийн таг тохирохгүй …", "Хаагаагүй таг …", "Файл … дотор дуусна" | Файл эвдэрсэн эсвэл дутуу тасарсан байна. |
