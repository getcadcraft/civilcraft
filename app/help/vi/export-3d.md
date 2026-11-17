---
title: Xuất công trường ra 3D
summary: Lưu những gì khung nhìn 3D hiển thị thành tệp GLB hoặc OBJ để dùng với các chương trình 3D khác, tính bằng mét với trục Y hướng lên, quanh một gốc cục bộ mà tệp ghi lại.
keywords: glb, gltf, obj, xuất 3d, xuất mô hình, công cụ game, trực quan hóa, trình xem 3d, mét, trục y hướng lên, gốc, gốc cục bộ, state plane
from: 07d23992
---

Khung nhìn 3D xuất những gì nó hiển thị thành một mô hình 3D mà chương trình khác có thể mở: trình xem 3D, phần mềm mô hình hóa, công cụ game hoặc công cụ trực quan hóa.

## Xuất

1. Mở khung nhìn 3D ({{key:D}}) và chọn những gì hiển thị bằng {{ui:Hiện}}. Những gì bị ẩn sẽ không được xuất.
2. Nhấp {{ui:GLB}} hoặc {{ui:OBJ}} trên thanh.
   Tệp được tải về với tên "*tên dự án*-3d.glb" hoặc "-3d.obj", và thanh trạng thái cho biết gốc.

## Nội dung của các tệp

| | GLB | OBJ |
|---|---|---|
| Bề mặt | Lưới có pháp tuyến và màu của dải hoặc bề mặt | Lưới có pháp tuyến (không có màu) |
| Ống và công trình | Lưới tròn, các cái có lỗi màu đỏ | Lưới tròn |
| Đường đồng mức, đường ngắt, tuyến, vạch, đường hành lang và nền | Đường, mỗi nhóm theo màu của nó | Bản ghi đường (`l`) |
| Điểm đo | Điểm | Bản ghi điểm (`p`) |

Mỗi nhóm giữ tên của nó ("Mặt đất tự nhiên", "Ống", "Đường đồng mức chính" và tương tự), nên bạn có thể ẩn hoặc định kiểu nó trong chương trình khác.

## Đơn vị, trục và gốc

- **Mét.** Dự án feet được chuyển từ US survey feet (1 ft = 1200/3937 m).
- **Trục Y hướng lên**, quy ước thường dùng cho các định dạng này: Đông thành +X, cao độ thành +Y, và Bắc thành −Z.
- **Tỷ lệ thật.** Không áp dụng độ phóng đại theo phương đứng của khung nhìn.
- **Gốc cục bộ.** Tọa độ state plane lên tới hàng triệu feet, quá lớn so với các số dấu phẩy động đơn chính xác mà các định dạng này lưu trữ, nên tệp được ghi tương đối so với một gốc gần đó: gốc riêng của mặt đất tự nhiên cho Đông và Bắc, và cao độ thấp nhất của nó được làm tròn xuống. Gốc, tính theo đơn vị dự án, được ghi trong tệp: trong GLB là `extras` trên cảnh và nút trên cùng của nó, trong OBJ là một dòng chú thích gần đầu (`# origin easting … northing … elevation …`). Để đặt mô hình về tọa độ dự án, cộng gốc vào (sau khi đổi mét về feet trong dự án feet).

## Chưa xây dựng

- Xuất khung nhìn đã phóng đại, hoặc xuất theo đơn vị dự án thay vì mét.
- Texture, tệp vật liệu cho OBJ (.mtl) và thuộc tính theo từng đối tượng (tên của ống và công trình chỉ có trong CivilCraft).
- Xuất hành lang thành các khối rời, hoặc khung nhìn trắc dọc ở 3D.
