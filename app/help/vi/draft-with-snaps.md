---
title: Vẽ với bắt điểm, chọn góc và di chuyển, sao chép, xoay
summary: Đặt tuyến, nền, thửa đất và đường đặc trưng chính xác lên các điểm và góc bạn đã có, gõ hoặc chọn đông và bắc của một góc, xoay một tiếp tuyến về phía hai điểm, và di chuyển, sao chép hoặc xoay một đối tượng theo khoảng cách hoặc góc.
keywords: bắt điểm, các bắt điểm, osnap, bắt vào điểm, bắt vào góc, PI, đỉnh, góc, chọn, chữ thập, đông, bắc, tọa độ, tọa độ đã gõ, tiếp tuyến, hướng, phương vị, di chuyển, sao chép, xoay, biến đổi, sao chép và xoay, nhân bản, alt, điểm tự do, vẽ
from: 49864dda
---

Mới trong 0.9: khi bạn vẽ, con trỏ nằm đúng trên các điểm và góc đã có trong mặt bằng, và một góc nền, thửa đất hoặc đường đặc trưng có thể được gõ hoặc chọn. Chủ đề này hướng dẫn qua ba công cụ.

## Bạn sẽ làm gì

- Vẽ với bắt điểm, để một tuyến, nền, thửa đất hoặc đường mới bắt đầu và kết thúc đúng trên một thứ đã có.
- Đặt đông và bắc của một góc bằng cách gõ hoặc chọn một vị trí trên mặt bằng.
- Xoay một tuyến để nó là tiếp tuyến về phía hai điểm đã chọn.
- Di chuyển, sao chép hoặc xoay toàn bộ một đối tượng.

## Các bước

1. Chọn một công cụ vẽ, ví dụ {{ui:Tuyến}}, {{ui:Nền}}, {{ui:Thửa đất}} hoặc {{ui:Đường đặc trưng}}. Di chuyển con trỏ gần một điểm đo, một PI của tuyến, một góc nền hoặc thửa đất hoặc góc khối, một đỉnh đường đặc trưng hoặc một công trình thoát nước. Một dấu xuất hiện kèm nhãn (PI, Góc, Đỉnh, Công trình, hoặc Điểm và số hiệu của nó) và đông và bắc mà nó sẽ rơi vào. Nhấp để đặt điểm ở đó.
2. Để đặt một điểm tự do, giữ {{key:Alt}} khi bạn nhấp. Bắt điểm tắt.
3. Chọn một nền, thửa đất hoặc đường đặc trưng. Trong **Thuộc tính**, khối {{ui:Góc}} liệt kê mọi góc với một ô Đông và một ô Bắc. Gõ số mới, hoặc nhấn nút chữ thập cạnh một góc và nhấp một vị trí trên mặt bằng. Góc nhận đông và bắc đó. Nhấn {{key:Esc}} để hủy việc chọn. Chữ thập chỉ hoạt động trên mặt bằng: đóng khung nhìn 3D trước.
4. Để xoay một tiếp tuyến, chọn một tuyến. Trong **Thuộc tính**, dưới {{ui:Đoạn thẳng từ hai điểm}}, chọn tiếp tuyến, nhấn {{ui:Điểm đầu tiên}} và nhấp trên mặt bằng, nhấn {{ui:Điểm thứ hai}} và nhấp lại, rồi nhấn {{ui:Đặt hướng}}. Tiếp tuyến xoay để chạy từ điểm đầu về phía điểm thứ hai và giữ nguyên chiều dài.
5. Để di chuyển, sao chép hoặc xoay, chọn một tuyến, nền, thửa đất hoặc đường đặc trưng. Trong **Thuộc tính**, dưới {{ui:Di chuyển, sao chép và xoay}}, gõ {{ui:Di chuyển sang đông}} và {{ui:Di chuyển sang bắc}} (số âm đi về phía tây và nam), rồi nhấn {{ui:Di chuyển}} hoặc {{ui:Sao chép}}. Hoặc nhấn {{ui:Khoảng cách từ hai điểm}} và nhấp điểm để di chuyển từ đó và điểm để di chuyển đến.
6. Để xoay, gõ góc trong {{ui:Xoay ngược chiều kim đồng hồ}} (độ), rồi nhấn {{ui:Xoay}} hoặc {{ui:Sao chép và xoay}}. Nó xoay quanh tâm các góc của nó, trừ khi bạn chọn một điểm để xoay quanh bằng chữ thập cạnh ô góc.

## Ghi chú

- Một bản sao để bản gốc ở nguyên chỗ và được chọn sau đó.
- Mọi di chuyển, sao chép, xoay, góc đã chọn và tiếp tuyến đã xoay là một bước hoàn tác.
- Bắt điểm có phạm vi 10 pixel màn hình từ con trỏ. Một dấu bắt chỉ đề xuất một vị trí; không có gì thay đổi cho đến khi bạn nhấp.
- Cùng chữ thập có trên các hàng PI của tuyến. Xem [Tuyến](topic:alignment), [Thửa đất](topic:parcels) và [Đường đặc trưng](topic:feature-lines).
