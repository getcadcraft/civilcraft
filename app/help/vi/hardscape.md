---
title: Lát nền, tường và bậc thang
summary: Lát nền với độ dốc về rãnh hoặc độ dốc ngang, mẫu lát và lớp cấu tạo của nó; lối đi bám theo mặt đất; tường chắn và tường độc lập có móng bậc; bó vỉa; đường dốc và bậc thang được kiểm tra theo giới hạn; xuất IFC.
keywords: cảnh quan cứng, hardscape, lát nền, gạch lát, sân, sân hiên, độ dốc, rãnh, độ dốc ngang, xương cá, xếp dọc, lối đi, đường đi bộ, tường chắn, tường vườn, móng, mũ tường, bó vỉa, viền, đường dốc, khả năng tiếp cận, bậc thang, alzơ, mặt bậc, chiếu nghỉ
from: d34b4466
---

Cảnh quan cứng được tính lại từ mặt đất mỗi lần, nên nó bám theo địa hình và tự tạo lại khi mặt đất hoặc đường của nó thay đổi. Kéo các góc của nó trên mặt bằng như mọi đường khác. Mở từ {{ui:Cảnh quan cứng (hardscape)}} trong nhóm Cảnh quan.

## Lát nền

Nhấp các góc rồi nhấn {{key:Enter}}. Trong Thuộc tính:

- **Cao độ**: để trống = cao độ trung bình của mặt đất bên dưới.
- **Độ dốc thoát**: phẳng, một **độ dốc ngang** (% theo một hướng) hoặc **về rãnh**: CivilCraft yêu cầu bạn nhấp nơi đặt rãnh, rồi mỗi góc nâng lên từ rãnh theo độ dốc. Mũi tên trên mặt bằng thể hiện các độ dốc.
- **Mẫu** (lưới, xếp dọc, xương cá) với kích thước đơn vị, mạch nối và góc; chiều rộng **Viền**. Trên tờ, các mạch nối nhỏ hơn một milimét bị bỏ qua.
- Lớp lát là một phần của bề mặt dự kiến. Các lớp của nó (gạch lát, lớp đệm, lớp nền) được đưa vào IFC và khối lượng.

## Lối đi

Nhấp dọc theo lối đi rồi nhấn {{key:Enter}}. Nó bám theo mặt đất, với **Độ dốc ngang** hướng về phía bên phải. Lối đi dốc hơn **Độ dốc tối đa cho phép** được đánh dấu `!` trên mặt bằng tại chỗ đó, và Thuộc tính cho biết nó dốc đến mức nào.

Chỗ lối đi gặp một con đường được dựng bởi hành lang, nó dừng ở mép ngoài của đường, ngang với vỉa hè hoặc lề đường tại đó, trên bề mặt dự kiến và trong khung nhìn 3D. Lối đi cắt ngang đường được san và thể hiện thành hai đoạn, và một đầu được vẽ ngắn hơn đường tối đa gấp đôi chiều rộng lối đi được kéo tiếp đến mép của nó. Mặt bằng vẫn thể hiện lối đi như bạn đã vẽ, và chiều dài cùng diện tích của nó tính cả đường. Xem [Quét hành lang đường bộ](topic:corridor).

## Tường

Nhấp dọc theo tường rồi nhấn {{key:Enter}}. Tường là loại **chắn đất** hoặc **độc lập**. Khi không có **Đỉnh**, tường cao đúng **Chiều cao** trên mặt đất dọc suốt; nhập một đỉnh để giữ nó phẳng. **Móng** của nó nằm sâu dưới mặt đất một độ sâu cố định và hạ xuống theo từng bậc nguyên, nên nó phẳng giữa các bậc. Thuộc tính cho biết chiều dài, các chiều cao, diện tích mặt và số bậc móng; mặt bằng ghi nhãn đỉnh và đáy tường (TW / BW) tại mỗi đầu.

:::warning
Tường chắn đất cao hơn 1.2 m (4 ft) được đánh dấu: kỹ sư thiết kế nó.
:::

## Bó vỉa

Nhấp dọc theo bó vỉa rồi nhấn {{key:Enter}}; đặt chiều rộng và chiều cao nhô lên của nó.

## Đường dốc

Nhấp từ chân lên đỉnh rồi nhấn {{key:Enter}}. Các cao độ lấy từ mặt đất tại mỗi đầu, trừ khi bạn nhập chúng. Đường dốc có một chiếu nghỉ sau mỗi độ cao 750 mm (2.5 ft) và được kiểm tra theo **Độ dốc tối đa cho phép** (1:12 để bắt đầu) và chiều rộng tối thiểu; Thuộc tính cho biết nó cần dài bao nhiêu.

## Bậc thang

Nhấp vào mép trước của bậc dưới cùng, rồi tại chỗ các bậc lên tới đỉnh, và nhấn {{key:Enter}}. Số alzơ lấy từ chiều cao và **Alzơ lớn nhất**; mặt bậc lấy từ quy tắc tiện nghi 2R + G ≈ 630 mm, không bao giờ dưới **Mặt bậc nhỏ nhất**; một chiếu nghỉ sau mỗi **Số alzơ tối đa mỗi vế**. Thuộc tính cho biết chúng có vừa giữa hai điểm hay cần dài thêm bao nhiêu.

:::note
Các giới hạn cho đường dốc và bậc thang là giá trị mặc định có ghi nhãn. Đặt các giới hạn mà quy chuẩn xây dựng của bạn yêu cầu.
:::

## Ra khỏi CivilCraft

- {{ui:Thêm}} › {{ui:Xuất IFC cảnh quan}}: lát nền và lối đi thành `IfcPavement`, tường thành `IfcWall` (tường chắn thành RETAININGWALL) cùng các lớp của chúng, bó vỉa thành `IfcKerb`, đường dốc thành `IfcRamp`, bậc thang thành `IfcStair` cùng alzơ và mặt bậc của chúng.
- **Gửi sang TakeoffCraft** của bảng thực vật mang theo diện tích lát nền và thể tích lớp, diện tích mặt và chiều dài tường, chiều dài bó vỉa và số bậc.
- Tờ chi tiết vẽ mặt cắt của mỗi tường, cấu tạo của mỗi lớp lát và mỗi vế bậc thang. Xem [Tờ cảnh quan](topic:landscape-sheets).
