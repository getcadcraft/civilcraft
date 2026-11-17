---
title: Bản vẽ trồng cây và bảng thống kê
summary: Đặt cây đơn lẻ, luống trồng được lấp đầy theo khoảng cách của cây với các loại cây hỗn hợp theo tỷ lệ phần trăm, và hàng rào; ghi nhãn chúng; đếm trong bảng thống kê cây cho bảng tính hoặc TakeoffCraft.
keywords: bản vẽ trồng cây, bảng thống kê cây, luống trồng, trồng khối, hàng rào, cây thân gỗ, cây bụi, cây phủ đất, khoảng cách, khoảng cách tam giác, số lượng cây, khối lượng, nhãn, tán, ký hiệu cây, ifc, takeoff
from: ab49eab5
---

## Đặt cây

1. Chọn một cây trong mục **Cây trồng** bên trái.
2. Nhấn {{ui:Plant}}, rồi nhấn lên mặt bằng: mỗi lần nhấn đặt một cây. Nhấn {{key:Esc}} để dừng.

Ký hiệu của cây được vẽ theo bề rộng tán khi trưởng thành; Thêm › {{ui:Show at planting size}} vẽ mọi cây theo kích thước lúc trồng. Cây thân gỗ đứng trên mặt đất bên dưới: khi bạn san nền sau này, chúng sẽ đi theo. Để cố định một cây ở một cao độ, nhập cao độ đó vào **Cao độ** trong Thuộc tính.

## Luống trồng

1. Chọn cây chính, nhấn {{ui:Bed}} rồi nhấn các góc của luống. Nhấn {{key:Enter}} (hoặc nhấn lại góc đầu tiên) để khép kín.
2. Luống được lấp đầy bằng cây đó theo khoảng cách của nó, theo mẫu **tam giác** (mẫu thông thường: mỗi cây cách đều sáu cây khác), lùi vào từ mép nửa khoảng cách.
3. Trong Thuộc tính, **Thêm cây** trộn vào cây đã chọn ở bên trái. Đặt **Tỷ lệ %** của mỗi cây: luống nhận đúng số lượng đó của mỗi loại, phân bố khắp luống. **Trộn lại** xáo trộn vị trí của chúng.

Để **Khoảng cách** trống thì dùng khoảng cách riêng của cây (có trọng số theo tỷ lệ của chúng); nhập một giá trị để dùng cho mọi cây. **Mẫu** có thể là vuông, và **Hàng theo hướng** xoay các hàng.

## Hàng rào

Chọn cây làm hàng rào, nhấn {{ui:Hedge}}, nhấn dọc theo hàng rào rồi nhấn {{key:Enter}}. Cây được đặt dọc theo đường theo khoảng cách của chúng, căn giữa để hai đầu có cùng khoảng cách lề. Hàng rào có thể gồm **hai hàng, so le**, cách nhau một khoảng đã đặt.

## Nhãn

Cây đơn lẻ được ghi nhãn theo thiết lập nhãn (mặc định là `{name}`); nhập nhãn riêng cho một cây trong Thuộc tính. Luống được ghi nhãn bằng số lượng của từng cây, hàng rào bằng số lượng của nó. Thêm › {{ui:Plant labels}} bật và tắt nhãn. Các trường nhãn: `{name}`, `{botanical}`, `{size}` (chậu), `{qty}`, `{height}`, `{spread}`, `{container}`.

## Bảng thống kê cây

Thêm › {{ui:Plant schedule…}} đếm mọi cây theo loài, từ cây đơn lẻ, luống và hàng rào cùng lúc, kèm kích thước trồng. Lưu dưới dạng **CSV** hoặc **XLSX**, hoặc **Gửi tới TakeoffCraft**: một tệp khối lượng mà TakeoffCraft mở để định giá cây (cùng khối lượng lát nền và tưới nước bên cạnh).

## IFC

Thêm › {{ui:Export landscape IFC}} lưu cảnh quan thành tệp IFC (IFC 4.3) mà mô hình BIM có thể chứa: mỗi cây là một `IfcGeographicElement` loại VEGETATION, được gán kiểu theo loài với các thuộc tính của cây (tên khoa học, kích thước, khả năng chịu lạnh, nước, ánh sáng); mỗi luống và hàng rào là một phần tử với số lượng của nó, đặt trên mặt bằng công trường. BimCraft mở tệp này cạnh công trình.
