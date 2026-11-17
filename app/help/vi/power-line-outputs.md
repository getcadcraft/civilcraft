---
title: Bảng, khối lượng, tờ và GIS cho đường dây điện
summary: Bảng căng dây và bảng trụ, khối lượng vật liệu cho bảng tính hoặc TakeoffCraft, tờ mặt bằng và trắc dọc cùng báo cáo nghiên cứu thành một PDF, và các lớp GIS với mọi dữ liệu của tài sản.
keywords: bảng căng dây, bảng trụ, khối lượng, bảng vật tư, takeoffcraft, tờ, báo cáo, pdf, tờ trắc dọc, gis, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Mọi thứ ở đây nằm trong {{ui:Thêm}} của nhóm Đường dây điện.

| Đầu ra | Bạn nhận được gì |
|---|---|
| {{ui:Bảng căng dây…}} | Theo từng đoạn, lực căng ngang và độ võng của mỗi nhịp ở mọi nhiệt độ; lưu dạng CSV. {{ui:Lưu bảng trụ đỡ (CSV)}}: vai trò, mục, mặt đất, điểm gắn, tải lớn nhất, danh định, OK, gợi ý, móng, độ lệch, nhấc lên của từng trụ |
| {{ui:Khối lượng…}} | Dây dẫn (chiều dài catenary × số dây dẫn × số mạch + 2 % cho dây nhảy và neo cuối), trụ và thiết bị theo mục thư viện, cáp, rãnh, đào, ống dẫn, mối nối. CSV, Excel, hoặc một tệp khối lượng TakeoffCraft |
| {{ui:Tờ và báo cáo…}} | Một PDF: mặt bằng; một tờ trắc dọc cho mỗi đường dây với dây dẫn ở các trường hợp tải bạn chọn và một dải chiều dài nhịp, độ võng và khoảng hở thấp nhất; và một báo cáo nghiên cứu (bộ quy tắc, các đoạn, bảng căng dây, trụ, mọi kiểm tra) |
| {{ui:Xuất sang GIS…}} | Trụ, nhịp, tuyến cáp, thiết bị và chướng ngại dưới dạng các lớp với dữ liệu của chúng (chiều cao, tải, độ võng, khoảng hở, phần không đạt), dưới dạng GeoPackage, shapefile, GeoJSON, KML hoặc KMZ |

GeoJSON và KML cần hệ tọa độ của dự án ([Hệ tọa độ](topic:coordinate-systems)); nếu không có, GeoPackage và shapefile sẽ mang các số liệu riêng của dự án.
