---
title: Mặt lát, tường và bậc thang
summary: Mặt lát có độ dốc về rãnh thoát nước hoặc độ dốc ngang, mẫu lát và cấu tạo lớp; lối đi bám theo mặt đất; tường chắn và tường rào có móng bậc; bó vỉa; đường dốc và bậc thang được kiểm tra theo giới hạn; xuất IFC.
keywords: cảnh quan cứng, mặt lát, gạch lát, sân, sân hiên, độ dốc, rãnh thoát nước, độ dốc ngang, xương cá, xếp so le, lối đi, lối đi bộ, tường chắn, tường vườn, móng, mũ tường, bó vỉa, viền, đường dốc, khả năng tiếp cận, bậc thang, alzơ, bậc, chiếu nghỉ
from: 51475877
---

Cảnh quan cứng được tính lại từ mặt đất mỗi lần, nên nó bám theo địa hình và được tạo lại khi mặt đất hoặc đường của nó thay đổi. Kéo các góc của nó trên mặt bằng như mọi đường khác. Mở nó từ {{ui:Cảnh quan cứng (hardscape)}} trong nhóm Cảnh quan.

## Mặt lát

Nhấp các góc và nhấn {{key:Enter}}. Trong **Thuộc tính**:

- **Cao độ**: để trống = cao độ trung bình của mặt đất bên dưới.
- **Độ dốc**: cao độ, một **độ dốc ngang** (tính theo % về một hướng) hoặc **về rãnh thoát nước**: CivilCraft yêu cầu bạn nhấp vị trí rãnh, rồi mọi góc sẽ dâng lên từ rãnh theo độ dốc. Các mũi tên trên mặt bằng thể hiện độ dốc.
- **Mẫu lát** (lưới, xếp so le, xương cá) cùng kích thước viên, mạch ghép và góc; **Viền** có chiều rộng. Trên bản vẽ, các mạch nhỏ hơn 1 mm sẽ bị bỏ qua.
- Mặt lát là một phần của bề mặt đề xuất. Các lớp của nó (gạch lát, lớp lót, lớp móng) được đưa vào IFC và khối lượng.

## Lối đi

Nhấp dọc theo lối đi và nhấn {{key:Enter}}. Lối đi bám theo mặt đất, với **Độ dốc ngang** nghiêng về phía bên phải của nó. Lối đi dốc hơn **Độ dốc tối đa cho phép** được đánh dấu `!` trên mặt bằng tại chỗ đó, và Thuộc tính cho biết nó dốc đến mức nào.

## Tường

Nhấp dọc theo tường và nhấn {{key:Enter}}. Một tường là **tường chắn** hoặc **tường tự do**. Khi không có **Đỉnh**, nó cao bằng **Chiều cao** phía trên mặt đất suốt dọc theo; nhập một đỉnh để giữ nó ngang bằng. **Móng** của nó nằm sâu dưới mặt đất một khoảng đặt trước và bậc xuống theo từng bậc nguyên, nên nó vẫn bằng phẳng giữa các bậc. Thuộc tính cho biết chiều dài, chiều cao, diện tích mặt tường và số bậc móng; mặt bằng ghi đỉnh và đáy tường (TW / BW) ở mỗi đầu.

:::warning
Tường chắn cao hơn 1.2 m (4 ft) sẽ được đánh dấu: một kỹ sư phải thiết kế nó.
:::

## Bó vỉa

Nhấp dọc theo bó vỉa và nhấn {{key:Enter}}; đặt chiều rộng và chiều cao nhô lên.

## Đường dốc

Nhấp từ đáy lên đỉnh và nhấn {{key:Enter}}. Cao độ lấy từ mặt đất ở mỗi đầu, trừ khi bạn nhập chúng. Đường dốc có một chiếu nghỉ sau mỗi độ cao lên 750 mm (2.5 ft) và được kiểm tra theo **Độ dốc tối đa cho phép** (bắt đầu từ 1:12) và chiều rộng tối thiểu; Thuộc tính cho biết nó cần dài bao nhiêu.

## Bậc thang

Nhấp mép trước của bậc dưới cùng, rồi đến chỗ các bậc lên tới đỉnh, và nhấn {{key:Enter}}. Số alzơ (đứng bậc) lấy từ chiều cao và **Alzơ lớn nhất**; chiều sâu bậc lấy từ quy tắc thoải mái 2R + G ≈ 630 mm, không bao giờ dưới **Chiều sâu bậc nhỏ nhất**; một chiếu nghỉ sau mỗi **Số alzơ tối đa mỗi vế thang**. Thuộc tính cho biết chúng có vừa giữa hai điểm hay cần dài thêm bao nhiêu.

:::note
Các giới hạn cho đường dốc và bậc thang là mặc định có nhãn. Hãy đặt những giới hạn mà quy chuẩn xây dựng của bạn yêu cầu.
:::

## Ra khỏi CivilCraft

- Thêm › {{ui:Xuất IFC cảnh quan}}: mặt lát và lối đi thành `IfcPavement`, tường thành `IfcWall` (tường chắn thành RETAININGWALL) cùng các lớp, bó vỉa thành `IfcKerb`, đường dốc thành `IfcRamp`, bậc thang thành `IfcStair` cùng alzơ và mặt bậc.
- **Gửi tới TakeoffCraft** trong bảng danh mục cây trồng mang theo diện tích mặt lát và thể tích các lớp, diện tích mặt tường và chiều dài tường, chiều dài bó vỉa và số bậc.
- Bản vẽ chi tiết vẽ mặt cắt của mỗi tường, cấu tạo của mỗi mặt lát và từng vế thang. Xem [Bản vẽ cảnh quan](topic:landscape-sheets).
