---
title: Yếu tố tạo mặt đất và cao độ tự cập nhật
summary: Mọi thứ tạo hình mặt đất đề xuất trong một danh sách có thứ tự (đối tượng sau được ưu tiên khi chồng lấp), đào và đắp theo từng yếu tố, kiểm tra giao điểm trong bảng Vấn đề, và cao độ điểm cùng mũi tên độ dốc đọc mặt đất theo thời gian thực.
keywords: yếu tố tạo mặt đất, chồng, thứ tự, mặt đất đề xuất, mặt đất tự nhiên, chồng lấp, đào và đắp, giao điểm, tường chắn, mép mặt lát, cao độ đáy, chiếu nghỉ bậc, cao độ điểm, độ cao điểm, mũi tên độ dốc, nhãn độ dốc, độ dốc xuống
from: 3998a5b0
---

Mặt đất đề xuất = mặt đất tự nhiên + các yếu tố, theo thứ tự. Mặt đất tự nhiên không bao giờ bị thay đổi.

## Danh sách

{{ui:Cao độ}} › {{ui:Yếu tố tạo mặt đất…}} liệt kê mọi đối tượng tạo hình mặt đất: nền, bờ đất, mương cỏ, vùng san nền, mặt lát và lối đi, khu trồng cây có cao độ hoàn thiện, và các bậc cùng đường dốc có ô **Tạo hình mặt đất** được đánh dấu (kèm cao độ đáy và đỉnh). Khi hai đối tượng chồng lên nhau, đối tượng **sau** được ưu tiên. Kéo một dòng, hoặc dùng các mũi tên, để đổi thứ tự; mặt đất được dựng lại ngay. Mỗi dòng hiện khối lượng đào và đắp của nó (phần mà nó tạo hình sau các đối tượng phía trên), với tổng ở dưới danh sách.

## Kiểm tra giao điểm

Bảng Vấn đề liệt kê, kèm **chuyển đến**:

- tường mà phía cao của nó nằm trên đỉnh tường (đất phủ lên tường), hoặc mà phía thấp của nó lộ móng;
- khu trồng cây có cao độ hoàn thiện cao hơn mép mặt lát mà nó tiếp giáp, hoặc thấp hơn đó quá 150 mm thông thường;
- các bậc mà đáy hoặc đỉnh không khớp với mặt lát chúng đặt lên;
- hai yếu tố chồng lên nhau (đối tượng sau được ưu tiên tại đó).

Tường chắn có thể để đỉnh bám theo phía cao của mặt đất: chiều cao của nó được tính lại mỗi khi mặt đất thay đổi.

## Tường chắn tạo hình mặt đất

Chọn một tường chắn và đánh dấu **Tạo hình mặt đất**. Dải đất dưới tường (rộng bằng bề dày tường) được thêm vào danh sách như một yếu tố:

- cạnh phía **cao** được giữ ở cao độ mặt đất tại đó, từng trạm một, nên đỉnh tường bám theo phía cao (kèm mũ tường ở trên). Nhập một cao độ **Đỉnh** để thay vào đó giữ phía cao ở cao độ đó trừ đi mũ tường;
- cạnh phía **thấp** được giữ ở cao độ **Mặt đất giữ ở phía thấp** mà bạn nhập, hoặc để trống thì ở mặt đất tại đó;
- phía cao là phía có mặt đất cao hơn trên toàn bộ chiều dài tường, nên nó không bao giờ đổi bên dọc theo tường;
- mặt đất ngoài dải không bị thay đổi, và mặt đất tự nhiên thì không bao giờ.

Giống mọi yếu tố khác, nó nằm trong danh sách, và yếu tố đứng sau nó sẽ được ưu tiên ở chỗ chồng lên nhau. Tường có cao độ giữ tại một đầu cách mặt đất tự nhiên tại đó hơn 150 mm thông thường sẽ nhận cảnh báo trong bảng Vấn đề (kèm **chuyển đến**). Tường tự do không tạo hình mặt đất. Ô này tắt trong các tệp từ bản dựng trước, nên chúng mở ra như cũ.

## Cao độ điểm và mũi tên độ dốc

{{ui:Cao độ điểm}} (một cú nhấp) và {{ui:Mũi tên độ dốc}} (hai cú nhấp) đọc mặt đất mỗi lần được vẽ: di chuyển hoặc đặt lại cao độ của đối tượng thì nhãn cũng theo. Trong **Thuộc tính**, chọn nhãn đọc mặt đất đề xuất hay mặt đất tự nhiên; nhãn của mặt đất tự nhiên hiện trong ngoặc. Mũi tên chỉ xuống dốc và ghi `1:20 (5.0 %)`.
