---
title: Lập báo cáo đóng cọc
summary: Liệt kê các cọc dọc theo một tuyến tại các trạm và khoảng lệch, hoặc các điểm đo gần đó, với trạm, khoảng lệch, bắc, đông, cao độ thiết kế và cao độ tự nhiên, cùng đào hoặc đắp, rồi lưu báo cáo dạng CSV hoặc PDF.
keywords: đóng cọc, cọc, báo cáo cọc, phiếu đào, phiếu cao độ, trạm, khoảng lệch, đào, đắp, bố trí, đóng cọc thi công, hoàn công
from: d8a4e9f1
---

Chọn một tuyến rồi nhấn **Báo cáo đóng cọc** trong **Thuộc tính** của nó.

## Cọc tại các trạm và khoảng lệch

1. **Từ** và **đến**: các trạm cần đóng cọc (1+50 hoặc 150).
2. **mỗi**: khoảng cách. Cọc đặt tại mọi bội số của nó, ở cả hai đầu, và (khi ô được đánh dấu) tại nơi các đường cong của tuyến bắt đầu và kết thúc.
3. **Khoảng lệch**: bên trái và bên phải của tuyến, nhìn theo chiều tăng trạm: `12 L, 0, 12 R`, `L12 CL R12` hoặc `-12, 0, 12` (trái là âm). Tuyến có hành lang sẽ bắt đầu bằng các mép mặt đường và lề đường.
4. **Đánh số từ** và **với tiền tố** đặt tên cho các cọc: 1, 2, 3, hoặc S101, S102.

## Điểm đo gần tuyến

Chọn **điểm đo gần tuyến** và khoảng cách gần. Mỗi điểm trong khoảng cách đó nhận trạm và khoảng lệch của nó, cao độ thiết kế tại đó, và cao độ riêng của nó làm mặt đất: một phép kiểm tra các điểm đã đóng cọc hoặc đã đo như hoàn công.

## Báo cáo ghi gì

| Cột | Nội dung |
|---|---|
| Điểm | Tên của cọc, hoặc số của điểm đo |
| Trạm, Khoảng lệch | Vị trí dọc theo tuyến: L là trái, R là phải |
| Bắc, Đông | Tọa độ của nó |
| Cao độ thiết kế | Bề mặt của hành lang đã san tại đó (từ đường giao với mặt đất đến đường giao với mặt đất), nếu không thì là trắc dọc thiết kế trên tim tuyến |
| Cao độ tự nhiên | Bề mặt hiện có tại đó, hoặc cao độ riêng của điểm đo |
| Đào/đắp | C khi mặt đất cao hơn thiết kế (đào xuống), F khi thấp hơn (đắp lên), đến hàng phần trăm |

Cọc không có cao độ thiết kế (nằm ngoài hành lang, hoặc trên một tuyến không có cao độ đó ở xa tim tuyến) thì không có đào hay đắp; hộp thoại cho biết có bao nhiêu cọc như vậy.

## Lưu báo cáo

- **CSV**: một dòng tiêu đề, rồi các cột trên, cộng thêm đào hoặc đắp dưới dạng số có dấu (mặt đất trừ thiết kế) cho bảng tính và thiết bị thu thập dữ liệu.
- **PDF**: các trang bảng trên khổ giấy bạn chọn, mỗi cọc một hàng, đào in màu cam và đắp in màu xanh lá, cùng dải khung tên như các tờ khác.

:::note
Cọc được tính từ thiết kế trong dự án. Hãy kiểm tra chúng với bản vẽ đã duyệt trước khi xây dựng bất cứ thứ gì.
:::
