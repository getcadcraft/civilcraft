---
title: Khối lượng đào đắp
summary: Đọc khối lượng đào, đắp và chênh lệch giữa mặt đất hiện có và bề mặt dự kiến, theo từng nền và hành lang cùng tổng, và hiểu phương pháp lưới đứng sau chúng.
keywords: khối lượng, đào đắp, đào, đắp, chênh lệch, đào và đắp, số lượng, phương pháp lưới, so sánh bề mặt, bề mặt khối lượng, yard khối, mét khối
from: 299d7bc7
---

Ngay khi một nền hoặc hành lang được san không có lỗi, CivilCraft so sánh bề mặt dự kiến với mặt đất hiện có và báo cáo đào và đắp. Các con số cập nhật theo mỗi thay đổi.

## Nơi xem

- **Đào đắp** trong bảng bên phải khi không chọn gì (khung nhìn **Dự án**), khi có ít nhất một nền hoặc một hành lang.
- **Đào đắp** trong bảng bên phải khi chọn một nền (cùng tổng cho toàn dự án).
- Dòng bên dưới cài đặt của hành lang, với đào và đắp riêng của hành lang đó.

Khối **Đào đắp** hiển thị:

- **Đào**, **Đắp** và **Chênh lệch** (kèm "đắp" hoặc "đào" phía sau, tùy theo giá trị nào lớn hơn)
- một dòng cho mỗi mục khi có nhiều hơn một, ví dụ "Nền 1: đào 120.4 yd³, đắp 310.2 yd³"
- dòng phương pháp: "Phương pháp lưới: mặt đất hiện có và bề mặt đã san được lấy mẫu mỗi 0.5 ft bên trong đường giao với mặt đất (92,891 ô). Không áp dụng hệ số nở hoặc co."

Khối lượng tính bằng yd³ trong dự án feet và m³ trong dự án mét.

## Gửi sang TakeoffCraft

Để định giá khối lượng đào đắp, chọn {{ui:Gửi sang TakeoffCraft}} ở cuối khối **Đào đắp**. CivilCraft lưu một tệp khối lượng (`<site>.quantities.json`) với hai khối lượng: đào và đắp, tính bằng yd³ (dự án feet) hoặc m³ (dự án mét), đúng như các con số trong khối, đến hai chữ số thập phân. Mở tệp đó trong TakeoffCraft bằng **Mở bóc tách khối lượng**, hoặc kéo thả vào đó: chúng thành hai mục bạn có thể định giá ([Đào và đắp từ CivilCraft](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Gửi lại sau khi thay đổi và mở tệp mới: các mục giữ nguyên sẽ nhận các con số mới.

Chỉ tổng được gửi đi, nên không có gì bị tính hai lần; ghi chú của tệp liệt kê đào và đắp riêng của từng nền và hành lang.

## Cách tính

CivilCraft dùng **phương pháp lưới**:

1. Một lưới ô vuông được phủ lên vùng bên trong mọi đường giao với mặt đất.
2. Tại tâm mỗi ô, cả hai bề mặt đều được lấy mẫu.
3. Mỗi ô được tính như một lăng trụ: chênh lệch cao độ nhân với diện tích ô. Nơi bề mặt dự kiến thấp hơn thì là đào; cao hơn thì là đắp.
4. Các ô được cộng lại.

Kích thước ô được chọn sẵn để hình chữ nhật bao quanh các khu vực đã san chứa khoảng 250,000 ô, làm tròn về giá trị đẹp (1, 2 hoặc 5 nhân với lũy thừa của mười). Hiện bạn chưa thể tự đặt. Dòng phương pháp cho biết kích thước và số lượng ô. Ô nhỏ hơn sẽ chính xác hơn dọc theo các cạnh; với các ô nguyên nằm giữa các mặt phẳng, kết quả là chính xác.

## Điều cần biết

- Chỉ diện tích bên trong đường giao với mặt đất được tính. Mặt đất bên ngoài các đường đó không thay đổi.
- Nền hoặc hành lang có lỗi sẽ không được san vào và không cộng thêm gì. Nếu khối hiển thị "Chưa có khối lượng: nền cần được san không có lỗi.", hãy tìm hộp màu đỏ phía trên nó.
- Khi các mục chồng lên nhau, mục sau thay thế mục trước bên trong đường giao với mặt đất của nó, và phần chồng được tính một lần.
- Không áp dụng hệ số nở hoặc co. Hãy tự nhân kết quả nếu bạn cần khối lượng nguyên thổ, rời hoặc đầm chặt.
- Bóc lớp đất mặt, chiều sâu mặt đường và nền đường, và khối lượng lăng trụ TIN-sang-TIN hiện chưa có.

## Kiểm tra kết quả

- Bật {{ui:Dự kiến (đã san)}} trong **Hiển thị** và xem các đường đồng mức bên trong đường giao với mặt đất.
- Di con trỏ qua khu vực đã san: thanh trạng thái hiển thị **Mặt đất** và **Đã san**. Chênh lệch là độ sâu đào hoặc đắp tại điểm đó.
- Với hành lang, số đọc của khung nhìn trắc dọc hiển thị đào hoặc đắp trên tim tuyến tại mỗi cọc.
