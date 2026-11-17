---
title: Không gian làm việc Đường dây điện
summary: Đường dây trên không và cáp ngầm trên công trường của bạn, với thư viện riêng, độ võng và lực căng theo các trường hợp tải của bạn, kiểm tra khoảng hở và độ bền, bảng căng dây, khối lượng, tờ và xuất GIS.
keywords: đường dây điện, đường dây trên không, điện, phân phối, cột, trụ, dây dẫn, độ võng, lực căng, căng dây, khoảng hở, cáp ngầm, rãnh, không gian làm việc, tiện ích
from: 638dd856
---

Không gian làm việc Đường dây điện đặt đường dây trên không và cáp ngầm lên công trường CivilCraft bạn đã có: cùng các điểm khảo sát, cùng mặt đất, cùng tệp dự án.

:::warning
Đây là công cụ hỗ trợ thiết kế. Không gian làm việc tính độ võng, lực căng, khoảng hở và tải từ **các** trường hợp tải và giới hạn của bạn; không có tiêu chuẩn của quốc gia nào được tích hợp sẵn. Một kỹ sư phải kiểm tra mọi kết quả theo tiêu chuẩn áp dụng trước khi xây dựng.
:::

## Mở không gian làm việc

Chọn {{ui:Bề mặt}} › {{ui:Thêm}} › {{ui:Không gian làm việc Đường dây điện}}, hoặc **Đường dây điện** trong Không gian làm việc. Thanh công cụ khi đó hiện một nhóm **Đường dây điện**; các nhóm Thiết kế và GIS sẽ lùi sang một bên. Chọn **Civil** trong Không gian làm việc để quay lại. CivilCraft nhớ không gian làm việc bạn đã dùng gần đây nhất trên máy tính này.

Bảng bên trái thêm hai mục ở trên cùng:

- **Đường dây điện**: các trường hợp tải và giới hạn của bạn, các đường dây và cáp trong dự án, và **Kiểm tra**, luôn được cập nhật. Nhấn một mục kiểm tra để chọn đối tượng mà nó liên quan.
- **Thư viện**: dây dẫn, cáp, trụ, thiết bị và loại rãnh của riêng bạn. Xem [Thư viện đường dây điện của bạn](topic:power-line-library).

## Nhóm Đường dây điện gồm những gì

| Công cụ | Chức năng | Chủ đề |
|---|---|---|
| **Đường dây** | Một đường dây trên không: nhấn từng trụ | [Vẽ đường dây trên không](topic:overhead-line) |
| **Trụ** | Thêm một trụ trên một nhịp | [Vẽ đường dây trên không](topic:overhead-line) |
| **Cáp** | Một tuyến cáp ngầm trong rãnh | [Cáp ngầm](topic:underground-cables) |
| **Thiết bị** | Một tủ, một máy biến áp, một mối nối, hoặc nguồn mà mạng được cấp điện từ đó | [Cáp ngầm](topic:underground-cables) |
| **Chướng ngại** | Thứ mà đường dây băng qua: một con đường, một công trình, một đường dây khác | [Kiểm tra](topic:power-line-checks) |
| **Trắc dọc** | Trắc dọc đường dây: mặt đất, trụ và dây dẫn ở mỗi trường hợp tải | [Vẽ đường dây trên không](topic:overhead-line#the-line-profile) |
| **Thêm** | Trường hợp tải và giới hạn, bảng căng dây, khối lượng, tờ và báo cáo, GIS, tệp nghiên cứu | [Độ võng và lực căng](topic:sag-and-tension), [Đầu ra](topic:power-line-outputs), [Tệp nghiên cứu](topic:power-line-study-file) |

Mọi thứ bạn thêm đều là một bước hoàn tác, được lưu trong tệp dự án, và được vẽ trên mặt bằng ở các lớp có tên `C-POWR-…`, nên các xuất DXF, DWG và PDF cũng mang theo nó.
