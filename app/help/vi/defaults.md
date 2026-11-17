---
title: Giá trị khởi đầu và chỗ giữ chỗ
summary: Mọi giá trị CivilCraft khởi đầu, cho dự án mới, hiển thị, tuyến, nền, hành lang, mạng ống, khối lượng và bản in, và giá trị nào là chỗ giữ chỗ cần thay thế.
keywords: mặc định, cài đặt, giá trị khởi đầu, chỗ giữ chỗ, tiêu chí thiết kế, tiêu chuẩn, quy tắc, giả định
from: fbfc7432
---

CivilCraft không có hộp thoại cài đặt hay mẫu. Đây là các giá trị mà mọi thứ khởi đầu. Các giá trị đánh dấu **chỗ giữ chỗ** không lấy từ tiêu chuẩn nào: hãy thay chúng bằng tiêu chí của dự án trước khi bạn dựa vào một kiểm tra hay một khối lượng.

## Dự án mới

| Cài đặt | Giá trị |
|---|---|
| Tên | Công trường chưa đặt tên (tên tệp điểm đầu tiên sẽ thay thế) |
| Đơn vị | Feet Hoa Kỳ |
| Tên bề mặt | Mặt đất hiện trạng |
| Nhóm điểm | Mọi nhóm bắt đầu là {{ui:Điểm}} |
| Cạnh ngoài dài nhất | 0 (giữ mọi tam giác) |
| Số bước hoàn tác được giữ | 200 |

## Hiển thị

| Cài đặt | Giá trị |
|---|---|
| Bề mặt | {{ui:Mặt đất hiện trạng}} |
| Đường đồng mức mỗi | 1 (ft hoặc m) |
| Đường chính mỗi | Đường đồng mức thứ 5 |
| Số dải | 8 |
| Bật | Đường đồng mức, nhãn đường đồng mức, điểm, đường ngắt, biên bề mặt, ống |
| Tắt | Tam giác, dải cao độ, mũi tên độ dốc, nhãn điểm |

## Tuyến và trắc dọc

| Cài đặt | Giá trị |
|---|---|
| Tên | Tuyến 1, Tuyến 2 … |
| Cọc bắt đầu | 0+00 |
| Bán kính đường cong tại mỗi PI bên trong | 100 ft hoặc 30 m, nhỏ hơn nếu không vừa trong một nửa mỗi tiếp tuyến |
| Trắc dọc thiết kế | Không có cho đến khi bạn bắt đầu một cái; {{ui:Bắt đầu từ mặt đất}} đặt một PVI trên mặt đất tại mỗi đầu |
| Chiều dài đường cong đứng | 0 (không có đường cong) cho đến khi bạn nhập một giá trị |

## Nền

| Cài đặt | Giá trị |
|---|---|
| Tên | Nền 1, Nền 2 … |
| Cao độ | Mặt đất tại giữa nền, làm tròn đến 0.1 (0 nếu giữa nằm ngoài bề mặt) |
| Mái đào | 2 : 1 (chỗ giữ chỗ) |
| Mái đắp | 3 : 1 (chỗ giữ chỗ) |

## Cụm hành lang (chỗ giữ chỗ)

| Cài đặt | Feet Hoa Kỳ | Mét |
|---|---|---|
| Bề rộng làn | 12 ft | 3.6 m |
| Độ dốc làn | 2% | 2% |
| Bề rộng vai đường | 4 ft | 1.2 m |
| Độ dốc vai đường | 4% | 4% |
| Mái đào | 2 : 1 | 2 : 1 |
| Mái đắp | 3 : 1 | 3 : 1 |
| Khoảng cách mặt cắt | 10 ft | 5 m |

## Mạng ống

| Cài đặt | Feet Hoa Kỳ | Mét |
|---|---|---|
| Tên và loại | Thoát nước mưa, thoát nước mưa | Thoát nước mưa, thoát nước mưa |
| Độ dốc tối thiểu (chỗ giữ chỗ) | 0.50% | 0.50% |
| Độ phủ đất tối thiểu (chỗ giữ chỗ) | 2 ft | 0.6 m |
| Độ hạ trong công trình (chỗ giữ chỗ) | 0.10 ft | 0.03 m |
| Đường kính công trình mới | 48 in | 1200 mm |
| Đường kính ống mới | 12 in | 300 mm |
| Độ sâu hố thu | 0 | 0 |
| Miệng hố | Từ bề mặt | Từ bề mặt |

Mạng ống mở từ LandXML cũng dùng các quy tắc này, vì LandXML không mang chúng.

## Khối lượng

| Cài đặt | Giá trị |
|---|---|
| Phương pháp | Lưới, lấy mẫu tại tâm ô bên trong các đường giao mặt đất |
| Kích thước ô | Chọn sao cho hình chữ nhật bao của vùng đã san chứa khoảng 250,000 ô (1, 2 hoặc 5 lần một lũy thừa của mười) |
| Nở và co | Không có |

## In

| Cài đặt | Giá trị |
|---|---|
| Vùng | {{ui:Toàn bộ}} |
| Khổ giấy | Tabloid 11 × 17 in (dự án feet), ISO A3 (dự án mét); luôn nằm ngang |
| Tỷ lệ | Tỷ lệ lớn nhất trong danh sách vừa với nội dung |
| Mực | {{ui:Màu theo lớp}} |

Nhãn DXF được định cỡ theo tỷ lệ mà mọi thứ vừa trên Tabloid (feet) hoặc A3 (mét).
