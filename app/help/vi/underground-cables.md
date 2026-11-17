---
title: Cáp ngầm
summary: Tuyến cáp trong rãnh giữa các giá đỡ và thiết bị, độ sâu chôn và giao cắt, mối nối theo chiều dài cuộn, cùng khối lượng rãnh và cáp.
keywords: cáp ngầm, tuyến cáp, rãnh, ống dẫn, độ sâu chôn, giao cắt, giao cắt ống, mối nối, cuộn, tủ, máy biến áp, nguồn, sụt áp
from: adfd2717
---

## Vẽ một tuyến cáp

1. Đặt thiết bị trước nếu cáp kết thúc tại một tủ, máy biến áp hoặc mối nối: {{ui:Thiết bị}}, rồi nhấp chuột.
2. Nhấp {{ui:Cáp}} rồi nhấp tuyến; bắt đầu và kết thúc tại một giá đỡ hoặc trên thiết bị để nối vào nó. Nhấn Enter để kết thúc.

Trong **Thuộc tính**, chọn **Cáp**, **Loại rãnh**, số **cáp đặt cạnh nhau**, và **độ dư** (%). Tuyến hiển thị chiều dài, nơi nó bắt đầu và kết thúc, và dòng điện nó mang.

## Những gì được kiểm tra

- **Độ sâu chôn**: đỉnh cáp nằm dưới mặt đất dọc theo tuyến, so với độ sâu chôn của loại rãnh (hoặc độ sâu chôn nhỏ nhất của bộ quy tắc).
- **Giao cắt**: nơi tuyến cắt qua một ống CivilCraft hoặc một cáp khác, khoảng cách giữa chúng so với một quy tắc khoảng cách: **Khoảng cách giao cắt** của chính tuyến (trong Thuộc tính của nó) khi bạn chọn một giá trị, nếu không thì quy tắc **Giao cắt ngầm** của bộ quy tắc (các bộ quy tắc mẫu dùng *Underground crossing*, 0.3 m), nếu không thì khoảng cách của loại rãnh tới các dịch vụ khác. Khi hai cáp giao nhau, giữ giá trị lớn hơn trong hai giá trị. Đường dây trên không bị giao cắt được liệt kê để tham khảo, và cáp hiển thị trong trắc dọc của đường dây đó.
- **Mối nối**: một mối cho mỗi chiều dài cuộn của cáp (kể cả độ dư), khi mục cáp cho biết chiều dài cuộn.

## Thiết bị

Thiết bị có một mục thư viện, **tải** (kW) cùng **hệ số công suất**, và có thể là **nguồn**: mạng được cấp điện từ đó. Điện áp của nguồn lấy từ mục thư viện của nó, hoặc nếu không thì từ đường dây hay cáp mà nó cấp điện.

## Khối lượng

{{ui:Thêm}} › {{ui:Khối lượng…}} đếm cáp (chiều dài tuyến × (1 + độ dư) × số cáp đặt cạnh nhau + độ cao chênh tại mỗi đầu), rãnh theo loại, khối lượng đào, lớp lót và lấp đất, ống dẫn và mối nối, cùng với dây dẫn, giá đỡ và thiết bị của các đường dây trên không.
