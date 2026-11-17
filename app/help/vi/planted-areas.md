---
title: Khu vực trồng: bãi cỏ, luống, đồng cỏ, cây phủ đất
summary: Khu vực trồng là đối tượng có cấu tạo lớp (đất mặt, lớp phủ, màng chống cỏ, viền), hỗn hợp cây và cao độ hoàn thiện tùy chọn; chúng tự cắt quanh lát nền, tường và bậc thang, và cho diện tích thực, khối lượng, chiều dài viền và số lượng cây.
keywords: khu vực trồng, bãi cỏ, cỏ, luống, bồn, đồng cỏ, cây phủ đất, đất mặt, lớp phủ, màng, vải chống cỏ, viền, cao độ hoàn thiện, khối lượng, diện tích thực, cắt
from: 2617ec0e
---

{{ui:Areas}} trong nhóm Cảnh quan vẽ một **bãi cỏ**, **luống trồng**, **đồng cỏ** hoặc **cây phủ đất**: nhấn các góc của nó rồi nhấn {{key:Enter}}. Luống hoặc cây phủ đất ban đầu được lấp đầy bằng cây đã chọn trong mục Cây trồng; bãi cỏ không có cây.

## Khu vực chứa gì

- **Cấu tạo lớp**: chiều dày đất mặt, chiều dày lớp phủ, màng chống cỏ, và viền (thép, gỗ, gạch, bê tông, nhựa hoặc không có). Các chiều dày điển hình đã được điền sẵn; bạn đặt giá trị riêng.
- **Hỗn hợp**: loài (kèm giống và kích thước) và tỷ lệ, được lấp đầy như luống theo khoảng cách hoặc mật độ.
- **Cao độ hoàn thiện**: để trống thì khu vực đi theo mặt đất; nhập một cao độ thì khu vực trở thành bộ điều chỉnh địa hình (xem [Bộ điều chỉnh địa hình và cao độ](topic:ground-modifiers)).
- **Cắt quanh lát nền, tường và bậc thang** (bật sẵn): phần nào bị lát nền, lối đi, tường, bó vỉa, dốc hoặc bậc thang chồng lên khu vực sẽ bị bỏ qua. Không cây nào được đặt dưới chúng hoặc trong vòng nửa khoảng cách từ mép của chúng.

## Khối lượng

Thuộc tính hiển thị **diện tích thực** (sau khi cắt, đo chính xác), chu vi, **chiều dài viền** (chỉ dọc theo mép riêng của khu vực, không tính chỗ bị lát nền cắt ngang), khối lượng đất mặt và lớp phủ, diện tích màng, và số cây theo từng dòng hỗn hợp. Bảng thống kê cây đếm cây của khu vực; tệp khối lượng cho TakeoffCraft nhận diện tích, đất mặt, lớp phủ, màng và viền; tệp IFC cảnh quan ghi một `IfcGeographicElement` với một bộ số lượng.
