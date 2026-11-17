---
title: Xuất mặt bằng ra DXF
summary: Ghi các đường nét mặt bằng thành DXF R12 trên các lớp đã đặt tên, với đường đồng mức ở cao độ của chúng và đường ngắt ở 3D, cho mọi chương trình CAD.
keywords: dxf, dwg, cad, xuất, đường nét, r12, 2000, 2004, 2007, 2010, 2013, 2018, lớp, đường đồng mức, trao đổi bản vẽ, bản đồ nền, nền
from: f2d8ede9
---

{{ui:DXF}} ghi những gì mặt bằng hiển thị thành tệp DXF theo định dạng R12, phiên bản mà mọi chương trình CAD đều mở được. Nếu bạn đã dùng AutoCAD hoặc Civil 3D, hãy mở hoặc chèn tệp như bất kỳ tệp DXF nào khác.

## Xuất

1. Đặt mặt bằng theo cách bạn muốn cho bản vẽ: trong **Hiển thị**, chọn bề mặt (hiện có hoặc đề xuất), khoảng cách đường đồng mức, và những thứ được bật (đường đồng mức, nhãn, điểm, nhãn điểm, tam giác, đường ngắt, cạnh bề mặt, ống, mũi tên độ dốc).
2. Nhấp {{ui:DWG/DXF}} trong nhóm **Xuất** và chọn {{ui:DXF (R12, văn bản) — tệp trao đổi thuần túy}}, rồi {{ui:Tải về}}.
3. Trình duyệt tải về `<name>.dxf`. Thanh trạng thái hiển thị, ví dụ, "Đã xuất DXF R12: 2,140 đối tượng; nhãn được đặt cỡ cho 1" = 40'. Dải cao độ không được xuất."

Tọa độ được ghi theo đơn vị dự án của bạn, ở giá trị thực (tọa độ state plane giữ nguyên). Không có gì bị co giãn hay dời đi.

## Nội dung của tệp

| Đối tượng | Thực thể DXF | Lớp |
|---|---|---|
| Đường đồng mức phụ và chính | Đa tuyến 2D ở cao độ của chúng | C-TOPO-MINR, C-TOPO-MAJR |
| Nhãn đường đồng mức | Văn bản | C-TOPO-TEXT |
| Tam giác | Đa tuyến | C-TOPO-TINN |
| Đường ngắt và biên | Đa tuyến 3D | C-TOPO-BRKL |
| Cạnh bề mặt | Đa tuyến | C-TOPO-BNDY |
| Mũi tên độ dốc | Đa tuyến | C-TOPO-SLOP |
| Điểm đo và nhãn của chúng | Điểm (có cao độ), văn bản | V-NODE, V-NODE-TEXT |
| Đường từ mã đường | Đa tuyến 3D | V-NODE-LINE |
| Tim tuyến | Đường thẳng và cung tròn | C-ROAD-CNTR |
| Vạch và nhãn cọc | Đa tuyến, văn bản | C-ROAD-STAN |
| Mép hành lang | Đa tuyến | C-ROAD-CORR |
| Đường lấy mẫu | Đa tuyến | C-ROAD-SCTN |
| Nền, đường giao mặt đất, đường dốc | Đa tuyến | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Đường đặc trưng | Đa tuyến 3D (cung tròn thành các đoạn trong sai số 0.01; xem [Đường đặc trưng](topic:feature-lines)) | C-GRAD-FEAT |
| Đường quỹ đạo xe | Đa tuyến, văn bản | C-ROAD-SWPT |
| Ống, công trình, nhãn | Đa tuyến, văn bản | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Ống và công trình có lỗi | Đa tuyến | C-STRM-PROB |

Mỗi lớp có một màu. Danh sách đầy đủ có trong [Lớp mặt bằng](topic:plan-layers).

## Cỡ nhãn

Văn bản phải có cỡ theo đơn vị bản vẽ. CivilCraft đặt cỡ nhãn theo tỷ lệ mà toàn bộ mặt bằng vừa một tờ Tabloid (feet) hoặc một tờ A3 (mét), và ghi tỷ lệ đó trong thông báo trạng thái. Nếu bạn in ở tỷ lệ khác trong chương trình CAD, hãy đổi tỷ lệ văn bản ở đó.

## Những gì không được xuất

- Dải cao độ (chỉ trên màn hình).
- Khung nhìn trắc dọc. Trắc dọc được xuất ra LandXML, không phải bản vẽ.
- Chính bề mặt dưới dạng đối tượng 3D. Dùng LandXML cho TIN, hoặc bật {{ui:Tam giác}} để lấy các cạnh của nó dưới dạng đường nét.
- Mọi thứ bạn đã tắt trong **Hiển thị**.

## DWG

{{ui:DWG/DXF}} cũng ghi cùng các đường nét thành bản vẽ DWG. Hộp thoại hỏi định dạng: DXF, hoặc DWG 2000, 2004, 2007, 2010, 2013 hay 2018. Định dạng 2000 mở được trong hầu hết các chương trình CAD, cũ và mới; chọn bản mới hơn khi người nhận bản vẽ yêu cầu. Lựa chọn của bạn được ghi nhớ trong trình duyệt này.

1. Nhấp {{ui:DWG}} trong nhóm **Xuất**.
2. Chọn **Định dạng** rồi nhấp **Tải DWG**.
3. Trình duyệt tải về `<name>.dwg`. Thanh trạng thái cho biết những gì đã được ghi, ví dụ "Đã xuất DWG (định dạng 2018): 12 đa tuyến, 40 nhãn trên 9 lớp".

DWG có cùng các lớp, màu, đường đồng mức (dạng đa tuyến ở cao độ của chúng), đường ngắt 3D, nhãn và điểm như DXF, theo cùng tọa độ. Tên lớp mà DWG không chứa được sẽ bị đổi, và thông báo trạng thái sẽ nói rõ. CivilCraft ghi DWG bằng mã riêng của mình, nên không có gì rời khỏi máy tính của bạn.

### Lớp bản đồ trong DWG

Bản vẽ DWG không thể chứa ảnh bên trong: các chương trình CAD hiển thị ảnh nằm cạnh bản vẽ. Khi các lớp bản đồ đang hiển thị, hộp thoại đưa ra tùy chọn **Lớp bản đồ dưới dạng ảnh cạnh bản vẽ**. Khi chọn tùy chọn này, tệp tải về là `.zip` chứa `<name>.dwg`, `<name>-map.png` (các lớp bản đồ phủ toàn bản vẽ, rộng tối đa 4,096 điểm ảnh) và `<name>-map.pgw` (tệp world của nó, dùng cho chương trình GIS). Bản vẽ hiển thị ảnh như một hình ảnh trên lớp G-MAP-IMAG, đúng vị trí. Giải nén các tệp vào một thư mục và giữ chúng cùng nhau.
