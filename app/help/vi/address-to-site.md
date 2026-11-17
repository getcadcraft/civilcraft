---
title: Từ địa chỉ đến mặt bằng công trường
summary: Biến một địa chỉ thành những gì mặt bằng công trường cần biết: thửa đất, công trình xung quanh, quy hoạch, đất và vùng ngập lụt, từ dữ liệu mở mà bạn yêu cầu bằng nút hoặc đưa vào dưới dạng tệp, rồi gửi cho BimCraft như gợi ý.
keywords: địa chỉ, mã hóa địa lý, mặt bằng công trường, thửa đất, công trình, quy hoạch, đất, lũ lụt, dữ liệu mở, openstreetmap, fema, ssurgo, usgs, bối cảnh, ccsite, bimcraft
from: 125d848a
---

## Chức năng

Bề mặt › Thêm › Từ địa chỉ đến mặt bằng công trường trả lời, cho một điểm: điểm đó nằm trong thửa đất nào, các công trình xung quanh, quy hoạch, đất và vùng ngập lụt. Dữ liệu là dữ liệu mở: các tệp bạn thêm (GeoJSON, shapefile, KML, GeoPackage) và, khi bạn bật tiện ích bổ sung, các nút mà mỗi nút yêu cầu một dịch vụ mở.

## Cách sử dụng

1. Nhập một địa chỉ rồi nhấn nút tìm kiếm địa chỉ (tiện ích bổ sung "Tìm kiếm địa chỉ"), hoặc nhập vĩ độ và kinh độ.
2. Thêm lớp: tệp bằng "Thêm tệp", hoặc các nút nguồn khác (vùng ngập lụt, công trình, đất, độ cao mặt đất, thửa đất cấp quận). Một dịch vụ chỉ được yêu cầu khi bạn nhấn nút của nó; không có gì được tải khi khởi động.
3. Nhấn nút chạy để có câu trả lời bằng chữ, cùng một tệp CSV.
4. "Lưu mặt bằng công trường thành tệp" hoặc "Gửi đến BimCraft như gợi ý" đưa các đường bao cho BimCraft hoặc ModelCraft; họ liệt kê chúng và chỉ thêm những mục bạn đánh dấu.

## Điều cần biết

- Tìm kiếm địa chỉ đi qua getcadcraft.com, nơi thay bạn hỏi Nominatim của OpenStreetMap (tối đa một yêu cầu mỗi giây; kết quả được giữ 90 ngày để cùng một địa chỉ không bị hỏi hai lần; chỉ lưu băm của địa chỉ, không bao giờ lưu ai đã hỏi). Các nút khác đi thẳng từ trình duyệt của bạn đến dịch vụ của họ.
- Mỗi nguồn có giấy phép riêng (OpenStreetMap là ODbL: giữ dòng ghi công).
- Các lớp chính xác bằng dữ liệu mở ở địa phương bạn. Hãy kiểm tra những gì quan trọng với khảo sát.
