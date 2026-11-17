---
title: Quỹ đạo xe
summary: Cho một phương tiện có tối đa ba rơ-moóc chạy dọc theo một đường đặc trưng hoặc một tuyến, tiến hoặc lùi, và xem diện tích nó quét qua, các vệt bánh xe, góc lái và nơi nó bị gập (jackknife).
keywords: quỹ đạo quay vòng, đường quay vòng, theo dõi phương tiện, mẫu quay vòng, xe thiết kế, xe tải, xe buýt, rơ-moóc, bán rơ-moóc, lùi, gập xe, khớp nối, khóa lái, lệch vệt bánh sau, vệt bánh xe, cửa bốc dỡ hàng, bán kính quay vòng
from: 8caafb8a
---

Quỹ đạo xe cho phương tiện chạy dọc một đường và cho thấy phần mặt đất mà thân xe đi qua. Dùng nó để kiểm tra xe tải có thể quay góc, đến được bến bốc dỡ hay lùi rơ-moóc vào đúng vị trí mà không ra khỏi lớp mặt đường.

## Cho xe chạy dọc một đường

1. Vẽ đường mà xe đi theo, theo chiều chạy: một đường đặc trưng (cung tròn được: nhấn {{key:C}} khi đang vẽ, xem [Đường đặc trưng](topic:feature-lines)) hoặc một tuyến.
2. Chọn nó rồi nhấn {{ui:Quỹ đạo xe…}} trong **Thuộc tính** của nó.
3. Dưới **Bắt đầu từ**, chọn một phương tiện, rồi đặt kích thước theo xe thiết kế của riêng bạn: chiều rộng, phần nhô trước, chiều dài cơ sở, phần nhô sau, vệt bánh và **Khóa lái**. Thêm tối đa ba rơ-moóc, mỗi cái có vị trí móc kéo, chiều dài từ chốt kéo đến trục, phần nhô và **Góc khớp lớn nhất** của nó.
4. Chọn **Chạy**: tiến hoặc lùi. Nhấn {{ui:Cho xe chạy}}.

:::warning
Các phương tiện để bắt đầu chỉ là giá trị mẫu, không phải tiêu chuẩn. Hãy đặt kích thước theo xe thiết kế mà dự án của bạn dùng.
:::

## Tiến và lùi

| Chạy | Theo đường nào | CivilCraft tính gì |
|---|---|---|
| **Tiến** | Tâm của trục trước | Vị trí của trục sau và mọi rơ-moóc, góc lái và góc khớp |
| **Lùi** | Tâm của trục cuối (phía sau rơ-moóc) | Vị trí của mỗi khối phía trước, và góc lái mà đầu kéo cần để đưa rơ-moóc đến đó |

Lùi là cách kiểm tra một thao tác lùi xe: nói nơi rơ-moóc nên đến, và CivilCraft cho biết đầu kéo có làm được không.

## Đọc kết quả

Quỹ đạo xe được vẽ trên mặt bằng bằng màu cam: đường viền và, nét đứt, các vệt của bánh ngoài cùng. Chọn nó (nhấp vào bên trong) để xem trong **Thuộc tính**:

- **Chiều dài đã chạy**, **Góc lái** lớn nhất và **Góc khớp** so với giới hạn của chúng, và **Diện tích quét**.
- Bất kỳ vấn đề nào dọc đường, kèm khoảng cách: góc lái vượt khóa lái, hoặc rơ-moóc quay vượt giới hạn góc khớp (nó bị gập).
- **Phương tiện dọc theo đường**: kéo thanh trượt để xem phương tiện tại bất kỳ điểm nào, với góc lái và góc khớp tại đó.

Đổi đường thì quỹ đạo xe đi theo. {{ui:Sửa phương tiện…}} thay đổi kích thước; **Chạy** chuyển giữa tiến và lùi. Mỗi thay đổi là một bước: {{key:Mod+Z}} hoàn tác. {{key:Delete}} xóa quỹ đạo xe đã chọn (đường vẫn giữ nguyên).

Đường viền và các vệt bánh xe được xuất ra PDF, DXF và DWG trên lớp C-ROAD-SWPT.

## Cách tính

Mỗi khối quay quanh đường trục sau của nó và được kéo bởi điểm phía trước (trục trước hoặc chốt kéo), theo mô hình tốc độ thấp, không trượt mà các phép kiểm tra quỹ đạo xe dùng. Diện tích quét là hợp của mọi đường bao thân xe ở mọi vị trí. Mô hình không tính tốc độ, trượt lốp, thời gian bánh lái quay, rơ-moóc có lái hay khoảng sáng gầm xe.
