---
title: LandXML: những gì được đọc và ghi
summary: Các phần tử và thuộc tính LandXML 1.2 mà CivilCraft đọc và ghi, từng phần tử một, và mọi thứ nó bỏ qua.
keywords: landxml, xml, cgpoints, surface, tin, breaklines, boundary, alignment, coordgeom, profile, profalign, pvi, paracurve, pipenetworks, struct, pipe, planfeatures, planfeature, đường đặc trưng, lược đồ
from: ca3cf359
---

CivilCraft ghi LandXML 1.2 với không gian tên và vị trí lược đồ chính thức. Nó đọc mọi tệp có phần tử gốc `LandXML` và lấy các phần tử dưới đây theo tên (tiền tố không gian tên bị bỏ qua; phiên bản không được kiểm tra). Bộ đọc XML của nó chỉ chấp nhận năm thực thể chuẩn và tham chiếu ký tự số; nó không bao giờ tải DTD hay tệp bên ngoài. Về các bước, xem [Trao đổi LandXML](topic:landxml).

LandXML ghi tọa độ theo thứ tự Bắc trước: một điểm là "N E" hoặc "N E Z".

## Ghi

| Phần tử | CivilCraft ghi gì |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, diện tích theo feet vuông, thể tích theo yard khối, đường kính theo inch) hoặc `Metric` (meter, mét vuông, mét khối, milimét) |
| `Project` | `name` = tên dự án |
| `Application` | tên CivilCraft, nhà sản xuất CadCraft |
| `CgPoints` / `CgPoint` | `name` = số điểm, `desc` = mô tả, `code` = nhóm; văn bản "N E Z" (hoặc "N E" nếu không có cao độ) |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw hoặc ccw, `radius`, `length`, `staStart`, `chord`, `delta` (độ), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | mặt đất hiện trạng dọc theo tuyến, dưới dạng cặp cọc và cao độ (`PntList2D`), được tách tại nơi nó rời bề mặt |
| `Profile` / `ProfAlign` | trắc dọc thiết kế (đặt tên "<alignment> design"): `PVI` cho đầu mút và điểm góc, `ParaCurve` với `length` cho đường cong đứng |
| `Surfaces` / `Surface` | `name` và `desc`; trước hết là mặt đất hiện trạng, rồi "Proposed" khi nền hoặc hành lang được san |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (chỉ mặt đất hiện trạng) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (chỉ mặt đất hiện trạng, khi có) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `Pnts` / `P` với `id`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm hoặc sanitary |
| `Struct` | `name`, `elevRim` (miệng đã dùng, đặt hoặc lấy từ bề mặt), `elevSump`; `Center`; `CircStruct` với `diameter`; `Invert` với `elev`, `flowDir` in hoặc out, `refPipe` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `CircPipe` với `diameter` |
| `PlanFeatures` / `PlanFeature` | một phần tử cho mỗi đường đặc trưng: `name`; `CoordGeom` với `Line` (`length`, `Start`, `End`) và `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`; `Start` và `End` dạng "N E Z", `Center` dạng "N E"); `Feature` `code="CivilCraft"` với `Property` use và closed |

Không được ghi: nền và hành lang như đối tượng (kết quả của chúng là bề mặt "Proposed"), tuyến có lỗi, ống thiếu cả hai đáy trong, và quy tắc mạng.

## Đọc

| Phần tử | CivilCraft lấy gì |
|---|---|
| `Units` | `Imperial` hoặc `Metric` và `linearUnit` của nó quyết định feet hay mét. Đơn vị không rõ được ghi chú. |
| `Project` | `name` trở thành tên dự án. |
| `CgPoints` / `CgPoint` (lồng nhau cũng được) | name (hoặc `oID`), "N E" hoặc "N E Z", `desc` (hoặc `code`) làm mô tả |
| `Surface` với `Definition surfType="TIN"` | `Pnts` và `Faces` làm mặt đất hiện trạng (chỉ bề mặt đầu tiên); các mặt vô hình (`i="1"`) bị bỏ qua |
| `SourceData` / `Breaklines` | đường ngắt 3D, được giữ cùng bề mặt |
| `SourceData` / `Boundaries` | ranh giới ngoài |
| `Alignment` / `CoordGeom` | các phần tử `Line` và `Curve`; PI được dựng lại từ `PI` của mỗi đường cong, hoặc từ `Center` và tiếp tuyến; `staStart` |
| `Profile` / `ProfAlign` | `PVI` và `ParaCurve` (với `length`); trắc dọc thiết kế đầu tiên có ít nhất hai PVI |
| `PlanFeatures` / `PlanFeature` | mỗi cái thành một đường đặc trưng: `Line`, `Curve` (`Start`, `Center`, `End` và `rot` của nó) và `IrregularLine` (`PntList3D` hoặc `PntList2D`) nối đầu với đuôi (khe hở được nối bằng đoạn thẳng và có ghi chú); đóng khi kết thúc tại nơi bắt đầu; use và closed lấy từ `Feature` của chính CivilCraft, nếu không thì **Chỉ vẽ**. Điểm không có cao độ nhận 0 (có ghi chú). |
| `Spiral` | đường xoắn clothoid bên cạnh `Curve` (vào và ra; đọc như một PI với bán kính và chiều dài đường xoắn, ghi lại với `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant`) |
| `PipeNetwork` | mạng đầu tiên có ống: `Struct` (`Center`, `elevRim`, `elevSump`, đường kính `CircStruct`, `Invert` cho mỗi ống) và `Pipe` (`refStart`, `refEnd`, đường kính `CircPipe`) |

## Bỏ qua, và được nêu trong ghi chú

- Các bề mặt sau bề mặt đầu tiên, bề mặt lưới và các bề mặt không phải TIN khác
- Tuyến có phần tử `IrregularLine` hoặc `Chain`, đường xoắn không phải clothoid, đường xoắn giữa hai đường cong, hoặc tuyến không có hình học
- Trắc dọc thiết kế sau cái đầu tiên; đường cong đứng `CircCurve` và `UnsymParaCurve` (các PVI của chúng được giữ mà không có đường cong)
- Điểm chỉ tham chiếu đến điểm khác (`pntRef`), và điểm không có tọa độ đọc được
- Tên điểm bị lặp (cái đầu tiên được giữ)
- Ranh giới ẩn, hiện và cắt dữ liệu; đường ngắt không có điểm 3D
- Mạng ống sau cái đầu tiên; loại mạng khác storm và sanitary (đọc như storm)
- Công trình hình chữ nhật, thu nước và xả (đọc như tròn); ống và kênh hình trứng, elip và hộp (đọc như ống tròn không có kích thước)
- Phần tử `Spiral` trong đường đặc trưng
- `Parcels`, `Roadways`, `GradeModel` và `Survey`

Trắc dọc mặt đất (`ProfSurf`) trong tệp không được dùng: CivilCraft lấy mẫu mặt đất từ chính bề mặt.

## Thông báo khi tệp không mở được

| Thông báo | Nghĩa |
|---|---|
| "Đây là XML nhưng không phải LandXML (phần tử gốc là <…>)." | Tệp là một loại XML khác. |
| "… không có điểm, bề mặt TIN hoặc tuyến nào CivilCraft đọc được." | Mọi thứ trong tệp nằm trong danh sách bỏ qua. Các ghi chú phía sau cho biết đã có gì. |
| "Thẻ kết thúc không khớp …", "Thẻ chưa đóng …", "Tệp kết thúc bên trong …" | Tệp bị hỏng hoặc bị cắt cụt. |
