---
title: WaterCraft: nhu cầu, lưu lượng chữa cháy, ngừng cấp nước và tuổi nước
summary: Với tiện ích bổ sung WaterCraft, biến khách hàng thành nhu cầu trên các ống nước chính của bạn, kiểm tra lưu lượng sẵn có tại mọi trụ cứu hỏa, xem sự cố ngừng ống nào gây ảnh hưởng lớn nhất, và theo dõi tuổi nước và clo trong một ngày.
keywords: watercraft, phân phối nước, nhu cầu, khách hàng, hệ số đỉnh, mẫu nhu cầu, lưu lượng chữa cháy, trụ cứu hỏa, áp suất dư, mức độ tới hạn, ngừng cấp nước, đoạn có van, tuổi nước, clo, clo dư, truy vết nguồn, đầu cụt, csv, tiện ích bổ sung
from: 76809f01
---

WaterCraft là tiện ích bổ sung hoạt động trên mạng lưới nước mà bạn đã vẽ bằng các công cụ Ống nước chính. Nó thêm một thẻ vào bảng bên phải, gồm bốn phần.

:::warning
Chỉ là công cụ hỗ trợ tính toán. Nó đã được đối chiếu với đáp số tính tay trên các mạng lưới giả định, không phải trên mô hình của một đơn vị cấp nước thực tế. Kỹ sư cấp nước phải kiểm tra mọi kết quả. Hiện chưa có trạm tăng áp, chưa có phân rã bậc hai và chưa có kịch bản nào.
:::

## Bạn sẽ làm gì

- Đặt khách hàng lên mạng lưới dưới dạng nhu cầu.
- Tìm các trụ cứu hỏa không đạt lưu lượng bạn cần.
- Tìm các ống chính mà việc ngừng cấp có ảnh hưởng lớn nhất.
- Tìm nước cũ và clo thấp.

## Các bước

1. Mở {{ui:Cài đặt}} › {{ui:Tiện ích bổ sung}} và bật {{ui:WaterCraft (phân phối nước)}}. Một thẻ {{ui:WaterCraft}} xuất hiện trong bảng bên phải.
2. Vẽ bể chứa, nút và ống trước bằng các công cụ Ống nước chính (xem [Ống nước chính](topic:water-mains)). Nếu chưa có mạng lưới, thẻ sẽ yêu cầu bạn làm việc đó trước.
3. Dưới {{ui:Nhu cầu}}, dán mỗi khách hàng một dòng: mã, x, y, loại, lượng. Chọn {{ui:Hệ số đỉnh}} và {{ui:Mẫu theo giờ}} (ngày dân cư, ngày thương mại, đều, hoặc giữ nguyên mẫu hiện có). Nhấn {{ui:Kiểm tra}} để xem mỗi khách hàng nằm ở đâu (nút gần nhất), rồi nhấn {{ui:Đưa vào mạng lưới}}. {{ui:Hoàn tác}} sẽ lấy lại các nhu cầu.
4. Dưới {{ui:Lưu lượng chữa cháy}}, đặt lưu lượng cần thiết và áp suất dư, chọn giữ áp suất dư {{ui:Chỉ tại trụ cứu hỏa}} hoặc {{ui:Toàn hệ thống (nghiêm ngặt hơn)}}, rồi nhấn {{ui:Chiều dài}}. Mỗi trụ được liệt kê từ kém nhất, ở trạng thái đạt hoặc thiếu.
5. Dưới {{ui:Ống nào quan trọng nhất}}, chọn {{ui:từng ống một}} hoặc {{ui:từng đoạn có van một}} và nhấn {{ui:Chiều dài}}. Mỗi sự cố hiển thị lượng nhu cầu bị cắt, các nút bị cắt, các nút mới rơi xuống dưới áp suất tối thiểu và áp suất thấp nhất còn lại.
6. Dưới {{ui:Tuổi nước và clo}}, chọn đại lượng cần theo dõi (tuổi nước, clo hoặc truy vết nguồn), đặt số giờ chạy và các giới hạn bạn muốn, rồi nhấn {{ui:Chiều dài}}. Các nút nằm ngoài giới hạn sẽ được liệt kê.
7. Nhấn {{ui:Lưu dạng CSV}} dưới bất kỳ bảng nào để giữ lại.

## Ghi chú

- Lưu lượng chữa cháy cần thiết và lượng dùng mỗi hộ hoặc mỗi acre chỉ là giá trị khởi điểm, không phải tiêu chuẩn. Hãy dùng số liệu riêng của đơn vị cấp nước.
- Một ống bị van cắt một phần sẽ được coi là đóng hoàn toàn, nên sự cố hiển thị nặng hơn một chút so với thực tế.
- Chạy phần chất lượng nước đủ lâu để mẫu hằng ngày lặp lại trước khi đọc ngày cuối.
- {{ui:Dừng}} kết thúc sớm một lần chạy dài; khi đó danh sách chỉ hiển thị những gì đã thực hiện.
- Mạng lưới của bạn vẫn nằm trong dự án này và trên máy tính này. Không có gì được gửi đi đâu cả.
