---
title: Tờ mặt bằng và trắc dọc
summary: In một tuyến thành bộ tờ mặt bằng và trắc dọc trong một tệp PDF, có đường nối giữa các tờ.
keywords: mặt bằng và trắc dọc, tờ, in, pdf, đường nối, lập bản vẽ mặt bằng, bản vẽ đường, in trắc dọc, độ phóng đại đứng, bộ tờ
from: 34b4ec78
---

Tờ mặt bằng và trắc dọc là cách bản vẽ đường thường được lập: mỗi tờ thể hiện một đoạn đường hai lần, mặt bằng ở trên và trắc dọc ở dưới, cùng tỷ lệ ngang, để một cọc nằm đúng cùng một vị trí ở cả hai.

## Tạo các tờ

1. Chọn tuyến. Trong **Thuộc tính**, nhấn {{ui:Plan and profile sheets}}.
2. Chọn **Khổ giấy**, **Tỷ lệ mặt bằng** và **Độ phóng đại trắc dọc** (trắc dọc được vẽ cao gấp bao nhiêu lần so với chiều dài của nó; bắt đầu từ 10×). Hộp thoại cho biết sẽ có bao nhiêu tờ và mỗi tờ thể hiện bao nhiêu của tuyến.
3. Để in một phần tuyến, đổi **Từ cọc** và **Đến cọc**.
4. Nhấn {{ui:Download PDF}}. Tệp PDF có một trang cho mỗi tờ.

## Nội dung trên một tờ

| Phần | Thể hiện |
|---|---|
| Mặt bằng | Mọi thứ trên mặt bằng (đường đồng mức, điểm đo, tuyến và cọc của tuyến, hành lang, nền, đường đặc trưng, ống, đường lấy mẫu), xoay sao cho đoạn này chạy ngang tờ, với mũi tên bắc được xoay theo |
| Đường nối | Đường chấm gạch vuông góc với tuyến ở mỗi đầu có đoạn tiếp tục sang tờ khác, ghi nhãn "Đường nối cọc 5+50.00, xem tờ 2" |
| Trắc dọc | Mặt đất hiện trạng (nét đứt), trắc dọc thiết kế (màu đỏ), độ dốc của mỗi đoạn thẳng và mọi đường cong đứng cùng PVI, cao độ, L và K của chúng; cọc ở đáy, cao độ ở hai bên |
| Khung tên | Tên dự án, tuyến và khoảng cọc, "Tờ 1 trên 3", tỷ lệ ngang và đứng, và độ phóng đại |

Đoạn trên mỗi tờ dài bằng những gì cửa sổ mặt bằng cho phép ở tỷ lệ đó, làm tròn xuống thành bội số nguyên của 50 ft (20 m) với đoạn dài, hoặc 10 ft (5 m) với đoạn ngắn.

:::note
Khi cao độ trắc dọc không vừa ở độ phóng đại bạn chọn, CivilCraft vẽ mọi tờ ở mức lớn nhất trong 10×, 5×, 4×, 2× và 1× vừa khít, và thanh trạng thái sẽ thông báo điều này. Tuyến cong được xoay theo hướng từ điểm đầu đến điểm cuối của mỗi đoạn, nên đường có thể hơi dốc lên hoặc xuống trên tờ.
:::
