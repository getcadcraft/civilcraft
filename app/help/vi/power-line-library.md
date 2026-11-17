---
title: Thư viện đường dây điện của bạn
summary: Tạo dây dẫn, cáp ngầm, trụ, thiết bị và loại rãnh của riêng bạn, trong các danh mục bạn đặt tên, rồi chia sẻ chúng dưới dạng tệp.
keywords: thư viện, dây dẫn, cáp, cột, trụ, xà ngang, sứ, phụ kiện, dây néo, máy biến áp, tủ, mối nối, rãnh, danh mục, csv, nhập, xuất
from: 88733744
---

Mục **Thư viện** của không gian làm việc Đường dây điện chứa mọi mục mà một đường dây hoặc cáp có thể dùng. Không có gì trong đó gắn với một quốc gia hay một nhà sản xuất: bạn tạo ra những mục bạn làm việc cùng.

## Ba loại mục

| Loại | Nằm ở đâu | Có thể thay đổi không? |
|---|---|---|
| **Ví dụ** | Đi kèm CivilCraft, với các số liệu chung mà chúng tôi tính từ tính chất vật liệu | Không: trước tiên {{ui:Sao chép vào thư viện của tôi}} |
| **Trong dự án** | Đi kèm tệp dự án bạn đã mở | Không: trước tiên {{ui:Sao chép vào thư viện của tôi}} |
| **Của tôi** | Các mục của riêng bạn, lưu trong trình duyệt này | Có, và thay đổi được lưu ngay |

Mỗi dự án giữ một bản sao của từng mục nó dùng, nên dự án mở được trên bất kỳ máy tính nào với dây dẫn và trụ của riêng nó.

:::warning
Các mục ví dụ chỉ là ví dụ: hãy kiểm tra từng số liệu với dữ liệu của nhà cung cấp. Cáp ngầm cố ý không có dòng điện định mức, vì điều đó phụ thuộc vào cách cáp được đặt.
:::

## Tạo một mục

1. Trong **Thư viện**, chọn **Loại** (dây dẫn trên không, cáp ngầm, trụ, thiết bị hoặc loại rãnh).
2. Nhấn {{ui:Mục mới}}, hoặc chọn một ví dụ rồi nhấn {{ui:Sao chép vào thư viện của tôi}} hoặc {{ui:Nhân bản}}.
3. Điền các trường. Các trường có dấu `*` là những trường kiểm tra cần; một mục thiếu trường nào sẽ được đánh dấu `!` và được liệt kê dưới **Kiểm tra** khi một đường dây dùng nó.
4. Đặt **Danh mục** cho nó, với `/` giữa các cấp: `Trên không/Hạ thế/Bó`, `Trụ/Bê tông/12 m`. Cây sẽ theo các danh mục của bạn.

Mỗi loại cần những gì:

| Loại | Cần cho kiểm tra |
|---|---|
| Dây dẫn trên không | tiết diện, đường kính, khối lượng trên mét, lực đứt, môđun đàn hồi, hệ số giãn nở nhiệt |
| Cáp ngầm | số lõi, tiết diện, điện áp, đường kính, điện trở, dòng điện định mức |
| Trụ | chiều dài tổng, tải danh định (lấy tại một điểm dưới đỉnh), độ sâu trong đất |
| Thiết bị | loại; tải định mức cho xà ngang, phụ kiện và dây néo; khoảng cách pha và sụt áp cho xà ngang; chiều dài cho sứ; góc cho dây néo |
| Loại rãnh | độ sâu, chiều rộng, lớp phủ trên cáp |

## Chia sẻ

- {{ui:Lưu thư viện của tôi}} lưu mọi mục của bạn thành một tệp `.cclines.json`; {{ui:Mở thư viện…}} đọc lại tệp đó (các mục có cùng khóa sẽ được thay thế).
- {{ui:Lưu dạng CSV}} lưu loại bạn đang xem thành bảng tính; {{ui:Mở thư viện…}} đọc lại một CSV của loại đó. Các cột có thể theo thứ tự bất kỳ; một tệp phân cách bằng dấu chấm phẩy có thể dùng dấu phẩy thập phân.
