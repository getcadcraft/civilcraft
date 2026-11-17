---
title: Các lớp trên mặt bằng
summary: Tên lớp, màu và độ dày nét cố định mà CivilCraft dùng trên màn hình, trong DXF và trong PDF, và thiết lập hiển thị nào điều khiển từng lớp.
keywords: lớp, tên lớp, ncs, màu, aci, độ dày nét, lớp dxf, pdf, thiết lập hiển thị, nét vẽ
from: c2aa8475
---

Mọi thứ trên mặt bằng đều thuộc một lớp. Tên lớp theo mẫu thông dụng của lớp bản vẽ công trình dân dụng (bộ môn, nhóm chính, nhóm phụ). Các lớp được cố định trong bản dựng này: bạn không thể đổi tên, đổi màu hay thêm lớp riêng. Trong DXF, mỗi lớp có số màu được ghi trong bảng; trong PDF với {{ui:Layer colors}}, cùng màu này được dùng, và với {{ui:Black}} thì mọi thứ in màu đen.

| Lớp | Chứa | Màu (số DXF) | Hiển thị khi |
|---|---|---|---|
| C-TOPO-MINR | Đường đồng mức phụ | Xám (8) | {{ui:Contours}} |
| C-TOPO-MAJR | Đường đồng mức chính | Trắng hoặc đen (7) | {{ui:Contours}} |
| C-TOPO-TEXT | Nhãn đường đồng mức | Trắng hoặc đen (7) | {{ui:Contours}} và {{ui:Contour labels}} |
| C-TOPO-TINN | Cạnh tam giác | Xám (8) | {{ui:Triangles}} |
| C-TOPO-BRKL | Đường ngắt và biên | Cam (30) | {{ui:Breaklines}} |
| C-TOPO-BNDY | Biên bề mặt | Trắng hoặc đen (7) | {{ui:Surface edge}} |
| C-TOPO-SLOP | Mũi tên độ dốc | Lam (4) | {{ui:Slope arrows}} |
| V-NODE | Điểm đo | Xanh lá (3) | {{ui:Points}} |
| V-NODE-TEXT | Nhãn điểm: số hiệu, cao độ, mô tả | Xanh lá (3) | {{ui:Points}} và {{ui:Point labels}} |
| V-NODE-LINE | Đường từ mã đường (các nhóm không phải đường ngắt) | Xanh lá (3) | {{ui:Points}} |
| C-ROAD-CNTR | Tim tuyến | Đỏ (1) | Luôn luôn |
| C-ROAD-STAN | Vạch và nhãn cọc, PC và PT | Đỏ (1) | Luôn luôn |
| C-ROAD-CORR | Cạnh hành lang | Vàng (2) | Luôn luôn |
| C-ROAD-SCTN | Đường lấy mẫu (nơi cắt trắc ngang) | Xám (8) | Khi tuyến có đường lấy mẫu |
| C-GRAD-PADS | Đường viền nền (pad) | Xanh dương (5) | Luôn luôn |
| C-GRAD-DAYL | Đường giao với mặt đất | Hồng sẫm (6) | Luôn luôn |
| C-GRAD-SLOP | Đường độ dốc san nền | Hồng sẫm (6) | Luôn luôn |
| C-GRAD-FEAT | Đường đặc trưng (3D) | Xanh lá (3) | Luôn luôn |
| C-ROAD-SWPT | Đường quét xe: đường bao, vệt bánh ngoài cùng, tên | Cam (30) | Luôn luôn |
| C-STRM-PIPE | Ống | Xanh dương (5) | {{ui:Pipes}} |
| C-STRM-STRC | Công trình | Xanh dương (5) | {{ui:Pipes}} |
| C-STRM-TEXT | Nhãn ống và công trình | Xanh dương (5) | {{ui:Pipes}} |
| C-STRM-PROB | Ống và công trình có vấn đề | Đỏ (1) | {{ui:Pipes}} |

Đường ngắt chỉ được vẽ khi **Bề mặt** trong **Hiển thị** là {{ui:Existing ground}}; biên được vẽ với bề mặt nào cũng có.

## Độ dày nét khi in PDF

| Độ dày | Lớp |
|---|---|
| 0.50 mm | Tim tuyến, nền, ống, ống có vấn đề |
| 0.35 mm | Đường đồng mức chính, đường giao với mặt đất, công trình |
| 0.25 mm | Đường ngắt |
| 0.13 mm | Đường đồng mức phụ |
| 0.09 mm | Cạnh tam giác, đường độ dốc san nền |
| 0.18 mm | Mọi lớp còn lại |

Tệp DXF không chứa độ dày nét; hãy đặt chúng theo lớp trong chương trình CAD của bạn.

## Cỡ nhãn

Nhãn được định cỡ theo kích thước trên giấy: nhãn đường đồng mức 2.0 mm, nhãn cọc 1.8 mm, nhãn PC và PT cùng nhãn ống và công trình 1.6 mm, nhãn điểm 1.5 mm. Nhãn ống ghi tên, đường kính và độ dốc; nhãn công trình ghi tên và cao độ miệng. Trên màn hình, nhãn giữ nguyên kích thước khi bạn thu phóng. Trong DXF, nhãn được co giãn theo tỷ lệ ghi trong thông báo xuất; xem [Xuất mặt bằng ra DXF](topic:dxf-export).

## Không hiển thị trên lớp nào

Các dải cao độ được vẽ bên dưới nét vẽ, chỉ trên màn hình. Khung nhìn trắc dọc không thuộc mặt bằng.
