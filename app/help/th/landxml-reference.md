---
title: LandXML: สิ่งที่อ่านและเขียน
summary: องค์ประกอบและแอตทริบิวต์ของ LandXML 1.2 ที่ CivilCraft อ่านและเขียน ทีละองค์ประกอบ และทุกอย่างที่ข้ามไป
keywords: landxml, xml, cgpoints, พื้นผิว, tin, breaklines, ขอบเขต, แนวสายทาง, coordgeom, โปรไฟล์, profalign, pvi, paracurve, pipenetworks, struct, ท่อ, planfeatures, planfeature, เส้นลักษณะภูมิประเทศ, สคีมา
from: ca3cf359
---

CivilCraft เขียน LandXML 1.2 พร้อม namespace และตำแหน่ง schema อย่างเป็นทางการ โปรแกรมอ่านไฟล์ใดก็ได้ที่องค์ประกอบรากเป็น `LandXML` และรับองค์ประกอบด้านล่างตามชื่อ (คำนำหน้า namespace จะถูกละไว้ และไม่ตรวจเวอร์ชัน) ตัวอ่าน XML รับเฉพาะเอนทิตีมาตรฐานห้าตัวและการอ้างอิงอักขระเชิงตัวเลข ไม่โหลด DTD หรือไฟล์ภายนอกเลย สำหรับขั้นตอน ดูที่[แลกเปลี่ยน LandXML](topic:landxml)

LandXML เขียนพิกัดโดยเริ่มจากค่าเหนือ (northing) ก่อน: จุดหนึ่งจุดคือ "N E" หรือ "N E Z"

## สิ่งที่เขียน

| องค์ประกอบ | สิ่งที่ CivilCraft เขียน |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, พื้นที่เป็นตารางฟุต ปริมาตรเป็นลูกบาศก์หลา เส้นผ่านศูนย์กลางเป็นนิ้ว) หรือ `Metric` (meter, ตารางเมตร, ลูกบาศก์เมตร, มิลลิเมตร) |
| `Project` | `name` = ชื่อโครงการ |
| `Application` | ชื่อ CivilCraft ผู้ผลิต CadCraft |
| `CgPoints` / `CgPoint` | `name` = หมายเลขจุด, `desc` = คำอธิบาย, `code` = กลุ่ม; ข้อความ "N E Z" (หรือ "N E" เมื่อไม่มีระดับความสูง) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw หรือ ccw, `radius`, `length`, `staStart`, `chord`, `delta` (องศา), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | พื้นดินเดิมตามแนวสายทาง เป็นคู่ของสถานีและระดับ (`PntList2D`) แบ่งตรงจุดที่ออกจากพื้นผิว |
| `Profile` / `ProfAlign` | โปรไฟล์ออกแบบ (ชื่อ "<alignment> design"): `PVI` สำหรับปลายและจุดมุม, `ParaCurve` พร้อม `length` สำหรับโค้งแนวดิ่ง |
| `Surfaces` / `Surface` | `name` และ `desc`; ก่อนคือพื้นดินเดิม แล้วตามด้วย "Proposed" เมื่อมีแท่นพื้นหรือแนวถนนที่ปรับระดับ |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (เฉพาะพื้นดินเดิม) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (เฉพาะพื้นดินเดิม เมื่อมีข้อมูล) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` พร้อม `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm หรือ sanitary |
| `Struct` | `name`, `elevRim` (ขอบที่ใช้ กำหนดเองหรือจากพื้นผิว), `elevSump`; `Center`; `CircStruct` พร้อม `diameter`; `Invert` พร้อม `elev`, `flowDir` in หรือ out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` พร้อม `diameter` |
| `PlanFeatures` / `PlanFeature` | หนึ่งรายการต่อหนึ่งเส้นลักษณะภูมิประเทศ: `name`; `CoordGeom` พร้อม `Line` (`length`, `Start`, `End`) และ `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` และ `End` เป็น "N E Z", `Center` เป็น "N E"); `Feature` `code="CivilCraft"` พร้อม `Property` use และ closed |

ไม่เขียน: แท่นพื้นและแนวถนนในฐานะวัตถุ (ผลลัพธ์คือพื้นผิว "Proposed") แนวสายทางที่มีข้อผิดพลาด ท่อที่ไม่มีระดับท้องท่อ (invert) ทั้งสองด้าน กฎของเครือข่าย

## สิ่งที่อ่าน

| องค์ประกอบ | สิ่งที่ CivilCraft รับ |
|---|---|
| `Units` | `Imperial` หรือ `Metric` และ `linearUnit` ของมัน กำหนดว่าเป็นฟุตหรือเมตร หน่วยที่ไม่รู้จักจะถูกบันทึกไว้ |
| `Project` | `name` กลายเป็นชื่อโครงการ |
| `CgPoints` / `CgPoint` (ซ้อนกันได้ด้วย) | ชื่อ (หรือ `oID`), "N E" หรือ "N E Z", `desc` (หรือ `code`) เป็นคำอธิบาย |
| `Surface` พร้อม `Definition surfType="TIN"` | `Pnts` และ `Faces` เป็นพื้นดินเดิม (เฉพาะพื้นผิวแรก); ผิวที่มองไม่เห็น (`i="1"`) จะถูกละไว้ |
| `SourceData` / `Breaklines` | breakline 3 มิติ เก็บไว้กับพื้นผิว |
| `SourceData` / `Boundaries` | ขอบเขตด้านนอก |
| `Alignment` / `CoordGeom` | องค์ประกอบ `Line` และ `Curve`; PI สร้างใหม่จาก `PI` ของแต่ละโค้ง หรือจาก `Center` และเส้นสัมผัส; `staStart` |
| `Profile` / `ProfAlign` | `PVI` และ `ParaCurve` (พร้อม `length`); โปรไฟล์ออกแบบแรกที่มี PVI อย่างน้อยสองตัว |
| `PlanFeatures` / `PlanFeature` | แต่ละรายการเป็นเส้นลักษณะภูมิประเทศ: `Line`, `Curve` (`Start`, `Center`, `End` และ `rot` ของมัน) และ `IrregularLine` (`PntList3D` หรือ `PntList2D`) ต่อกันปลายต่อปลาย (ช่องว่างจะต่อด้วยเส้นตรงและบันทึกไว้); ปิดเมื่อจบตรงจุดเริ่ม; ใช้งานและปิดจาก `Feature` ของ CivilCraft เอง มิฉะนั้นเป็น **Only drawn** จุดที่ไม่มีระดับจะได้ 0 (บันทึกไว้) |
| `Spiral` | สไปรัลโคลโทอิดข้าง `Curve` (เข้าและออก; อ่านเป็น PI ที่มีรัศมีและความยาวสไปรัล เขียนกลับด้วย `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | เครือข่ายแรกที่มีท่อ: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` diameter, `Invert` ต่อท่อ) และ `Pipe` (`refStart`, `refEnd`, `CircPipe` diameter) |

## สิ่งที่ข้ามไป และระบุในหมายเหตุ

- พื้นผิวหลังจากพื้นผิวแรก กริดพื้นผิว และพื้นผิวที่ไม่ใช่ TIN อื่น ๆ
- แนวสายทางที่มี `IrregularLine` หรือ `Chain` สไปรัลที่ไม่ใช่โคลโทอิด สไปรัลระหว่างสองโค้ง หรือแนวสายทางที่ไม่มีรูปทรง
- โปรไฟล์ออกแบบหลังจากแรก; โค้งแนวดิ่ง `CircCurve` และ `UnsymParaCurve` (PVI ของมันถูกเก็บไว้โดยไม่มีโค้ง)
- จุดที่อ้างอิงเฉพาะจุดอื่น (`pntRef`) และจุดที่ไม่มีพิกัดที่อ่านได้
- ชื่อจุดที่ซ้ำกัน (เก็บตัวแรก)
- ขอบเขตแบบซ่อน แสดง และตัดข้อมูล; breakline ที่ไม่มีจุด 3 มิติ
- เครือข่ายท่อหลังจากแรก; ชนิดเครือข่ายอื่นที่ไม่ใช่ storm และ sanitary (อ่านเป็น storm)
- โครงสร้างสี่เหลี่ยม ช่องรับน้ำ และช่องระบายออก (อ่านเป็นทรงกลม); ท่อและรางทรงไข่ วงรี และกล่อง (อ่านเป็นท่อทรงกลมที่ไม่มีขนาด)
- องค์ประกอบ `Spiral` ในเส้นลักษณะภูมิประเทศ
- `Parcels`, `Roadways`, `GradeModel` และ `Survey`

โปรไฟล์พื้นดิน (`ProfSurf`) ในไฟล์จะไม่ถูกใช้: CivilCraft ดึงค่าพื้นดินจากพื้นผิวเอง

## ข้อความเมื่อไฟล์เปิดไม่ได้

| ข้อความ | ความหมาย |
|---|---|
| "นี่คือ XML แต่ไม่ใช่ LandXML (องค์ประกอบรากคือ <…>)." | ไฟล์เป็น XML อีกชนิดหนึ่ง |
| "… ไม่มีจุด พื้นผิว TIN หรือแนวสายทางที่ CivilCraft อ่านได้" | ทุกอย่างในไฟล์อยู่ในรายการที่ข้ามไป หมายเหตุหลังจากนั้นบอกว่ามีอะไรอยู่ |
| "แท็กปิดไม่ตรงกัน …", "แท็กไม่ได้ปิด …", "ไฟล์จบอยู่ภายใน …" | ไฟล์เสียหายหรือถูกตัดให้สั้น |
