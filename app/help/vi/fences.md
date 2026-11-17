---
title: Hàng rào
summary: Hàng rào dọc theo một đường, thửa đất hoặc nền: trụ, thanh ngang, tấm hoặc nan đứng, cổng, nghiêng hoặc bậc thang theo mặt đất, bảng thống kê, ký hiệu mặt bằng và phần tử IFC. Cũng có sẵn cho trợ lý.
keywords: hàng rào, trụ, thanh ngang, tấm, nan đứng, cổng, nghiêng, bậc thang, địa hình, bảng thống kê, ifc, lan can, ranh giới
from: c0e7b84a
---

Tạo một hàng rào dọc theo đường đặc trưng, tuyến, thửa đất hoặc nền, với các trụ và cổng được đặt sẵn cho bạn.

## Tạo hàng rào

1. Chọn một đường, một thửa đất hoặc một nền.
2. Mở **Bề mặt, Thêm, Fences...**
3. Chọn kiểu (tấm, thanh ngang hoặc nan đứng), nghiêng hoặc bậc thang, chiều cao, khoảng cách trụ và độ rộng cổng, rồi chọn **Fence along selection**, hoặc **With a gate** để đặt một cổng ở giữa đoạn thẳng dài nhất.

Trụ được đặt ở hai đầu, tại mỗi góc (một đỉnh rẽ từ 20 độ trở lên), ở cả hai mép của mỗi cổng và ở các khoang đều nhau giữa chúng, không khoang nào dài hơn khoảng cách đã chọn. Tấm **nghiêng** bám theo mặt đất giữa các trụ của chúng. Tấm **bậc thang** giữ thẳng bằng và bậc lên tại các trụ; khe hở dưới một tấm rộng nhất tại trụ ở phía dốc xuống, và cửa sổ cảnh báo khi khe hở đó vượt giới hạn, hoặc khi mặt đất nhô lên xuyên qua một tấm. Cổng rộng từ 6 ft (1.8 m) trở lên có hai cánh; mặt bằng thể hiện các cánh mở với đường quét.

## Bảng thống kê và đầu ra

Mỗi hàng rào hiển thị chiều dài, trụ theo loại, tấm, cổng và bậc, cùng bảng thống kê **CSV** gồm trụ, tấm, thanh ngang, nan đứng và cổng. Mặt bằng có các lớp hàng rào (C-FENC, C-FENC-POST, C-FENC-GATE) cho PDF, DXF và DWG. Xuất IFC chứa trụ (IfcMember, post), tấm (IfcRailing, user defined fence panel), thanh ngang (IfcMember) và cổng (IfcDoor, gate), mỗi hàng rào một hệ thống.

## Từ trợ lý

`fence_build` tạo một hàng rào (theo điểm, hoặc theo một đường, thửa đất hay nền đã đặt tên; cổng theo trạm), và `fence_list` liệt kê các hàng rào cùng bảng thống kê của chúng.

## Những gì chưa làm

Kích thước khởi đầu là các lựa chọn thông dụng, không phải quy chuẩn. Các kiểu từ Thư viện chỉ được giữ lại dưới dạng tên. Cổng phải nằm trong một đoạn thẳng. BimCraft chưa có công cụ này.
