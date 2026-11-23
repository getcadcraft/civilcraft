---
title: WaterCraft: nhu cầu, lưu lượng chữa cháy, sự cố và tuổi nước
summary: Với tiện ích WaterCraft, biến khách hàng thành nhu cầu trên đường ống nước chính, kiểm tra lưu lượng sẵn có tại mỗi trụ cứu hỏa, xem sự cố đường ống nào gây hại nhiều nhất, và theo dõi tuổi nước và clo qua một ngày.
keywords: watercraft, phân phối nước, nhu cầu, khách hàng, hệ số đỉnh, mẫu nhu cầu, lưu lượng chữa cháy, trụ cứu hỏa, áp suất dư, mức nghiêm trọng, sự cố, đoạn có van, tuổi nước, clo, dư lượng, truy vết nguồn, cụt, csv, tiện ích bổ sung
from: 066fb17a
---

WaterCraft là một tiện ích hoạt động trên mạng lưới nước bạn đã vẽ bằng các công cụ Đường ống nước chính. Nó thêm một thẻ vào bảng bên phải với bốn phần.

:::warning
Chỉ là công cụ hỗ trợ tính toán. Nó đã được kiểm tra với đáp số tính tay trên các mạng giả, không phải trên mô hình của một đơn vị cấp nước thực. Kỹ sư nước phải kiểm tra mọi kết quả. Các kịch bản, quy tắc điều khiển, van và số đọc thực địa có các chủ đề riêng, "Kịch bản" và "Nghiên cứu", trong trợ giúp của tiện ích WaterCraft.
:::

## Bạn sẽ làm gì

- Đặt khách hàng lên mạng lưới như nhu cầu.
- Tìm các trụ cứu hỏa không đạt lưu lượng bạn cần.
- Tìm các đường ống mà sự cố gây hại nhiều nhất.
- Tìm nước cũ và clo thấp.

## Các bước

1. Mở {{ui:Cài đặt}} › {{ui:Tiện ích bổ sung}} và bật {{ui:WaterCraft (phân phối nước)}}. Một thẻ {{ui:WaterCraft}} xuất hiện trong bảng bên phải.
2. Vẽ hồ chứa, các nút và ống bằng các công cụ Đường ống nước chính trước (xem [Đường ống nước chính](topic:water-mains)). Không có mạng lưới thì thẻ sẽ báo bạn làm điều đó.
3. Dưới {{ui:Nhu cầu}}, dán mỗi khách hàng một dòng: mã, x, y, loại, lượng. Chọn {{ui:Hệ số đỉnh}} và {{ui:Mẫu theo giờ}} (ngày dân cư, ngày thương mại, phẳng, hoặc giữ mẫu hiện có). Nhấn {{ui:Kiểm tra}} để xem mỗi khách hàng rơi vào đâu (nút gần nhất), rồi {{ui:Đưa vào mạng lưới}}. Hoàn tác sẽ lấy lại các nhu cầu.
4. Dưới {{ui:Lưu lượng chữa cháy}}, đặt lưu lượng cần và áp suất dư, chọn áp suất dư được giữ {{ui:Chỉ tại trụ cứu hỏa}} hay {{ui:Khắp hệ thống (nghiêm hơn)}}, và nhấn {{ui:Chiều dài}}. Mỗi trụ được liệt kê từ tệ nhất, như đạt hoặc thiếu.
5. Dưới {{ui:Đường ống nào quan trọng nhất}}, chọn {{ui:từng ống một}} hoặc {{ui:từng đoạn có van một}} và nhấn {{ui:Chiều dài}}. Mỗi sự cố hiển thị nhu cầu bị cắt, các nút bị cắt, các nút mới rơi xuống dưới áp suất tối thiểu và áp suất thấp nhất còn lại.
6. Dưới {{ui:Tuổi nước và clo}}, chọn thứ cần theo dõi (tuổi nước, clo hoặc truy vết nguồn), đặt số giờ chạy và các giới hạn bạn muốn, rồi nhấn {{ui:Chiều dài}}. Các nút ngoài giới hạn được liệt kê.
7. Nhấn {{ui:Lưu dạng CSV}} dưới bảng bất kỳ để giữ lại.

## Ghi chú

- Lưu lượng chữa cháy cần thiết và lượng dùng mỗi nhà hay mỗi mẫu là giá trị khởi đầu, không phải tiêu chuẩn. Dùng số liệu riêng của đơn vị cấp nước của bạn.
- Một ống bị van cắt một phần sẽ được đóng toàn bộ, nên sự cố hiển thị nặng hơn một chút so với thực tế.
- Chạy phần chất lượng nước đủ lâu để mẫu hằng ngày lặp lại trước khi đọc ngày cuối.
- {{ui:Dừng}} kết thúc sớm một lần chạy dài; danh sách khi đó chỉ hiển thị những gì đã làm.
- Mạng lưới của bạn vẫn nằm trong dự án này và trên máy tính này. Không có gì được gửi đi đâu cả.
