---
title: LandXML: ສິ່ງທີ່ຖືກອ່ານ ແລະ ຂຽນ
summary: ອົງປະກອບ ແລະ ແອັດທຣິບິວ LandXML 1.2 ທີ່ CivilCraft ອ່ານ ແລະ ຂຽນ, ເທື່ອລະອົງປະກອບ, ແລະ ທຸກຢ່າງທີ່ມັນຂ້າມໄປ.
keywords: landxml, xml, cgpoints, surface, tin, breaklines, boundary, alignment, coordgeom, profile, profalign, pvi, paracurve, pipenetworks, struct, pipe, planfeatures, planfeature, ເສັ້ນລັກສະນະ, ສະກີມາ
from: ca3cf359
---

CivilCraft ຂຽນ LandXML 1.2 ດ້ວຍ namespace ແລະ ທີ່ຢູ່ schema ທາງການ. ມັນອ່ານໄຟລ໌ທີ່ອົງປະກອບຮາກເປັນ `LandXML` ໃດກໍໄດ້ ແລະ ເອົາອົງປະກອບຂ້າງລຸ່ມຕາມຊື່ (ຄຳນຳໜ້າ namespace ຖືກລະເລີຍ; ເວີຊັນບໍ່ຖືກກວດ). ຕົວອ່ານ XML ຂອງມັນຮັບພຽງ entity ມາດຕະຖານ 5 ອັນ ແລະ ການອ້າງອີງຕົວອັກສອນເປັນຕົວເລກເທົ່ານັ້ນ; ມັນບໍ່ເຄີຍໂຫຼດ DTD ຫຼື ໄຟລ໌ພາຍນອກ. ສຳລັບຂັ້ນຕອນ, ເບິ່ງ [ແລກປ່ຽນ LandXML](topic:landxml).

LandXML ຂຽນພິກັດໂດຍ northing ກ່ອນ: ຈຸດໜຶ່ງແມ່ນ "N E" ຫຼື "N E Z".

## ທີ່ຂຽນ

| ອົງປະກອບ | CivilCraft ຂຽນຫຍັງ |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, areas in square feet, volumes in cubic yards, diameters in inches) ຫຼື `Metric` (meter, square meter, cubic meter, millimeter) |
| `Project` | `name` = ຊື່ໂປຣເຈັກ |
| `Application` | ຊື່ CivilCraft, ຜູ້ຜະລິດ CadCraft |
| `CgPoints` / `CgPoint` | `name` = ເລກຈຸດ, `desc` = ຄຳອະທິບາຍ, `code` = ກຸ່ມ; ຂໍ້ຄວາມ "N E Z" (ຫຼື "N E" ຖ້າບໍ່ມີລະດັບ) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw ຫຼື ccw, `radius`, `length`, `staStart`, `chord`, `delta` (ອົງສາ), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | ພື້ນດິນເດີມຕາມແນວທາງ, ເປັນຄູ່ station ແລະ ລະດັບ (`PntList2D`), ແບ່ງຢູ່ບ່ອນທີ່ມັນອອກຈາກພື້ນຜິວ |
| `Profile` / `ProfAlign` | ໜ້າຕັດຕາມຍາວອອກແບບ (ຕັ້ງຊື່ວ່າ "<alignment> design"): `PVI` ສຳລັບປາຍ ແລະ ຈຸດມຸມ, `ParaCurve` ພ້ອມ `length` ສຳລັບເສັ້ນໂຄ້ງແນວຕັ້ງ |
| `Surfaces` / `Surface` | `name` ແລະ `desc`; ກ່ອນໝົດພື້ນດິນເດີມ, ຈາກນັ້ນ "Proposed" ເມື່ອ pad ຫຼື corridor ປັບລະດັບ |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (ພື້ນດິນເດີມເທົ່ານັ້ນ) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (ພື້ນດິນເດີມເທົ່ານັ້ນ, ເມື່ອມີ) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` ພ້ອມ `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` ນ້ຳຝົນ ຫຼື ນ້ຳເສຍ |
| `Struct` | `name`, `elevRim` (ຂອບທີ່ໃຊ້, ກຳນົດ ຫຼື ຈາກພື້ນຜິວ), `elevSump`; `Center`; `CircStruct` ພ້ອມ `diameter`; `Invert` ພ້ອມ `elev`, `flowDir` in ຫຼື out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` ພ້ອມ `diameter` |
| `PlanFeatures` / `PlanFeature` | ໜຶ່ງຕໍ່ເສັ້ນລັກສະນະ: `name`; `CoordGeom` ພ້ອມ `Line` (`length`, `Start`, `End`) ແລະ `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` ແລະ `End` ເປັນ "N E Z", `Center` ເປັນ "N E"); `Feature` `code="CivilCraft"` ພ້ອມ `Property` ການນຳໃຊ້ ແລະ closed |

ບໍ່ໄດ້ຂຽນ: pad ແລະ corridor ເປັນວັດຖຸ (ຜົນຂອງມັນແມ່ນພື້ນຜິວ "Proposed"), ແນວທາງທີ່ມີຂໍ້ຜິດພາດ, ທໍ່ທີ່ບໍ່ມີ invert ທັງສອງ, ກົດເຄືອຂ່າຍ.

## ທີ່ອ່ານ

| ອົງປະກອບ | CivilCraft ເອົາຫຍັງ |
|---|---|
| `Units` | `Imperial` ຫຼື `Metric` ແລະ `linearUnit` ຂອງມັນກຳນົດ feet ຫຼື metres. ໜ່ວຍທີ່ບໍ່ຮູ້ຈັກຖືກບັນທຶກໄວ້. |
| `Project` | `name` ກາຍເປັນຊື່ໂປຣເຈັກ. |
| `CgPoints` / `CgPoint` (ຊ້ອນກັນກໍໄດ້) | ຊື່ (ຫຼື `oID`), "N E" ຫຼື "N E Z", `desc` (ຫຼື `code`) ເປັນຄຳອະທິບາຍ |
| `Surface` ພ້ອມ `Definition surfType="TIN"` | `Pnts` ແລະ `Faces` ເປັນພື້ນດິນເດີມ (ພື້ນຜິວທຳອິດເທົ່ານັ້ນ); ໜ້າທີ່ເບິ່ງບໍ່ເຫັນ (`i="1"`) ຖືກຍົກເວັ້ນ |
| `SourceData` / `Breaklines` | ເສັ້ນແບ່ງ 3D, ເກັບໄວ້ກັບພື້ນຜິວ |
| `SourceData` / `Boundaries` | ເສັ້ນຂອບເຂດດ້ານນອກ |
| `Alignment` / `CoordGeom` | ອົງປະກອບ `Line` ແລະ `Curve`; PI ຖືກສ້າງຄືນຈາກ `PI` ຂອງແຕ່ລະເສັ້ນໂຄ້ງ, ຫຼື ຈາກ `Center` ແລະ ເສັ້ນສຳຜັດ; `staStart` |
| `Profile` / `ProfAlign` | `PVI` ແລະ `ParaCurve` (ພ້ອມ `length`); ໜ້າຕັດຕາມຍາວອອກແບບທຳອິດທີ່ມີ PVI ຢ່າງໜ້ອຍສອງອັນ |
| `PlanFeatures` / `PlanFeature` | ແຕ່ລະອັນເປັນເສັ້ນລັກສະນະ: `Line`, `Curve` (`Start`, `Center`, `End` ແລະ `rot` ຂອງມັນ) ແລະ `IrregularLine` (`PntList3D` ຫຼື `PntList2D`) ຕໍ່ປາຍຕໍ່ປາຍ (ຊ່ອງຫວ່າງຖືກຕໍ່ດ້ວຍສ່ວນຊື່ ແລະ ບັນທຶກໄວ້); ປິດເມື່ອຈົບຢູ່ບ່ອນທີ່ເລີ່ມ; ການນຳໃຊ້ ແລະ closed ມາຈາກ `Feature` ຂອງ CivilCraft ເອງ, ຖ້າບໍ່ດັ່ງນັ້ນ **ແຕ້ມຢ່າງດຽວ**. ຈຸດທີ່ບໍ່ມີລະດັບໄດ້ 0 (ບັນທຶກໄວ້). |
| `Spiral` | ເສັ້ນກ້ຽວ clothoid ຂ້າງ `Curve` (ເຂົ້າ ແລະ ອອກ; ອ່ານເປັນ PI ພ້ອມລັດສະໝີ ແລະ ຄວາມຍາວເສັ້ນກ້ຽວ, ຂຽນກັບດ້ວຍ `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | ເຄືອຂ່າຍທຳອິດທີ່ມີທໍ່: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` diameter, `Invert` ຕໍ່ທໍ່) ແລະ `Pipe` (`refStart`, `refEnd`, `CircPipe` diameter) |

## ຂ້າມ, ແລະ ລະບຸໄວ້ໃນບັນທຶກ

- ພື້ນຜິວຫຼັງອັນທຳອິດ, ພື້ນຜິວຕາຕະລາງ (grid) ແລະ ພື້ນຜິວທີ່ບໍ່ແມ່ນ TIN ອື່ນໆ
- ແນວທາງທີ່ມີອົງປະກອບ `IrregularLine` ຫຼື `Chain`, ເສັ້ນກ້ຽວທີ່ບໍ່ແມ່ນ clothoid, ເສັ້ນກ້ຽວລະຫວ່າງສອງເສັ້ນໂຄ້ງ, ຫຼື ທີ່ບໍ່ມີເລຂາຄະນິດ
- ໜ້າຕັດຕາມຍາວອອກແບບຫຼັງອັນທຳອິດ; ເສັ້ນໂຄ້ງແນວຕັ້ງ `CircCurve` ແລະ `UnsymParaCurve` (PVI ຂອງມັນຖືກເກັບໄວ້ໂດຍບໍ່ມີເສັ້ນໂຄ້ງ)
- ຈຸດທີ່ອ້າງອີງພຽງຈຸດອື່ນ (`pntRef`), ແລະ ຈຸດທີ່ບໍ່ມີພິກັດທີ່ອ່ານໄດ້
- ຊື່ຈຸດທີ່ຊ້ຳກັນ (ເກັບອັນທຳອິດ)
- ເສັ້ນຂອບ hide, show ແລະ data-clip; ເສັ້ນແບ່ງທີ່ບໍ່ມີຈຸດ 3D
- ເຄືອຂ່າຍທໍ່ຫຼັງອັນທຳອິດ; ປະເພດເຄືອຂ່າຍອື່ນນອກຈາກ storm ແລະ sanitary (ອ່ານເປັນ storm)
- ໂຄງສ້າງສີ່ຫຼ່ຽມ, inlet ແລະ outlet (ອ່ານເປັນວົງກົມ); ທໍ່ ແລະ ຮ່ອງ egg, elliptical ແລະ box (ອ່ານເປັນທໍ່ວົງກົມທີ່ບໍ່ມີຂະໜາດ)
- ອົງປະກອບ `Spiral` ໃນເສັ້ນລັກສະນະແຜນ
- `Parcels`, `Roadways`, `GradeModel` ແລະ `Survey`

ໜ້າຕັດຕາມຍາວພື້ນດິນ (`ProfSurf`) ໃນໄຟລ໌ບໍ່ຖືກນຳໃຊ້: CivilCraft ເກັບຕົວຢ່າງພື້ນດິນຈາກພື້ນຜິວເອງ.

## ຂໍ້ຄວາມເມື່ອໄຟລ໌ເປີດບໍ່ໄດ້

| ຂໍ້ຄວາມ | ຄວາມໝາຍ |
|---|---|
| "ນີ້ເປັນ XML ແຕ່ບໍ່ແມ່ນ LandXML (ອົງປະກອບຮາກຂອງມັນແມ່ນ <…>)." | ໄຟລ໌ເປັນ XML ອີກປະເພດໜຶ່ງ. |
| "… ບໍ່ມີຈຸດ, ພື້ນຜິວ TIN ຫຼື ແນວທາງທີ່ CivilCraft ອ່ານໄດ້." | ທຸກຢ່າງໃນໄຟລ໌ຢູ່ໃນລາຍການທີ່ຂ້າມ. ບັນທຶກຫຼັງຈາກນັ້ນບອກວ່າມີຫຍັງຢູ່. |
| "ແທັກປິດບໍ່ກົງກັນ …", "ແທັກທີ່ບໍ່ໄດ້ປິດ …", "ໄຟລ໌ຈົບຢູ່ພາຍໃນ …" | ໄຟລ໌ເສຍຫາຍ ຫຼື ຖືກຕັດສັ້ນ. |
