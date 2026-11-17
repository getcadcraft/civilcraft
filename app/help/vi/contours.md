---
title: Đọc đường đồng mức, cao độ và độ dốc
summary: Đặt khoảng cách đường đồng mức và đường chính, hiển thị dải cao độ, mũi tên độ dốc và tam giác, và đọc cao độ mặt đất dưới con trỏ.
keywords: đường đồng mức, khoảng cách đường đồng mức, đường chính, nhãn, dải cao độ, mũi tên độ dốc, tam giác, cao độ điểm, phân tích bề mặt, phân tích cao độ, phân tích độ dốc
from: 585e500a
---

Bề mặt được thể hiện bằng đường đồng mức ngay khi nó tồn tại. Mọi nội dung trong chủ đề này được đặt trong **Hiển thị** ở bảng bên trái. Cài đặt hiển thị chỉ thay đổi những gì bạn thấy (và những gì bạn xuất); chúng không phải là bước hoàn tác.

## Đặt khoảng cách đường đồng mức

1. Trong **Hiển thị**, chọn một giá trị trong **Đường đồng mức mỗi**.
   - Theo feet: 0.25, 0.5, 1, 2, 5, 10 hoặc 20 ft.
   - Theo mét: 0.1, 0.25, 0.5, 1, 2, 5 hoặc 10 m.
2. Chọn **Đường chính mỗi**: đường đồng mức thứ 2, 4, 5 hoặc 10.
   Đường chính được vẽ đậm hơn và ghi nhãn cao độ. Chúng nằm tại các bội số nguyên của khoảng cách đường chính (với đường đồng mức 1 ft và mỗi đường thứ 5 là đường chính: 245, 250, 255 …).
3. Tắt {{ui:Nhãn đường đồng mức}} nếu các nhãn chen chúc trên bản vẽ nhỏ.

Dự án mới bắt đầu với 1 đơn vị và mỗi đường đồng mức thứ 5 là đường chính. Đường đồng mức uốn cong tại các đường ngắt; nếu chúng cắt ngang một đường dòng chảy hoặc sống núi, đường đó chưa phải là đường ngắt (xem [Xây dựng và tinh chỉnh bề mặt](topic:build-surface)).

:::note
Đường đồng mức chỉ được vẽ khi có không quá 2.000 mức giữa điểm thấp nhất và điểm cao nhất. Trên công trường có địa hình gồ ghề và khoảng cách rất nhỏ, mặt bằng sẽ không hiển thị đường đồng mức nào: hãy chọn khoảng cách lớn hơn.
:::

## Làm trơn đường đồng mức

Đường đồng mức được vẽ thành các đoạn thẳng, mỗi đoạn cắt qua một tam giác của bề mặt, nên chúng tạo một góc nhỏ tại mỗi cạnh tam giác. **Làm trơn đường đồng mức** trong **Hiển thị** làm tròn các góc đó:

- **Không (các đoạn thẳng)**: các đường được vẽ đúng như vậy. Đây là những gì bản vẽ mới hoặc cũ hơn hiển thị.
- **Nhẹ**: góc được làm tròn một chút. Một đường không bao giờ dịch chuyển quá 10% khoảng cách về phía đường đồng mức kế tiếp, và không bao giờ cách đoạn thẳng của nó quá một phần sáu chiều dài đoạn đó.
- **Mạnh**: một đường cong uyển chuyển. Một đường không bao giờ dịch chuyển quá 25% khoảng cách về phía đường đồng mức kế tiếp, và không bao giờ cách đoạn thẳng của nó quá một phần ba chiều dài đoạn đó.

Với một trong hai lựa chọn, đường đồng mức đã làm trơn vẫn cắt mọi cạnh tam giác tại cùng điểm như đường vẽ thẳng, vẫn nằm trong tam giác mà mỗi đoạn cắt qua, và vì vậy không bao giờ cắt hoặc chạm đường đồng mức khác. Nơi đường đồng mức cắt một đường ngắt hoặc ranh giới, nó giữ góc gấp sắc. Các đường đã làm trơn là những đường được vẽ và xuất (DXF, DWG, PDF, GIS và 3D), với nhiều đỉnh hơn các đường vẽ thẳng.

Làm trơn chỉ thay đổi các đường được vẽ. Cao độ, khối lượng, mặt cắt dọc và mặt cắt vẫn được đọc từ chính bề mặt. Một đường đồng mức đi đúng qua các điểm đo (một điểm ở 250.00 trên đường 250) vẫn giữ một góc nhỏ tại mỗi điểm như vậy.

## Bề mặt phía sau đường đồng mức được tạo như thế nào

Đường đồng mức theo bề mặt, và bề mặt theo **Phương pháp đường đồng mức** trong **Bề mặt** ở bảng bên trái. Mặc định là **Tam giác hóa với nội suy tuyến tính**, nối các điểm của bạn thành tam giác và giữ mọi điểm và đường ngắt đúng như vậy. Các phương pháp khác khớp trước một lưới đều đặn với các điểm (kriging, độ cong tối thiểu, láng giềng tự nhiên, nghịch đảo khoảng cách và những phương pháp khác), cho đường đồng mức tròn hơn giữa các điểm, nhưng không đi qua chính xác mọi điểm; báo cáo bề mặt dưới **Bề mặt** cho biết kết quả lệch bao nhiêu tại các điểm của bạn.

**ABOS (xấp xỉ dựa trên làm trơn)** là một trong các phương pháp dựa trên lưới. Nó có hai thiết lập riêng: **Độ trơn** (ban đầu 0.5; càng thấp càng trơn) và **Độ chính xác** (ban đầu 1: bề mặt được đưa về trong vòng 1% phạm vi cao độ của công trường tại các điểm của bạn; nhập số nhỏ hơn để khớp chặt hơn). Nếu không đạt được độ chính xác trên lưới hiện có, báo cáo bề mặt sẽ nói như vậy: hãy nhập **Khoảng cách lưới** nhỏ hơn.

## Đọc cao độ tại bất kỳ đâu

Di chuyển con trỏ qua mặt bằng. Thanh trạng thái hiển thị:

- **E** và **N** tại con trỏ
- **Mặt đất** và cao độ mặt đất hiện trạng tại đó, nội suy trên tam giác dưới con trỏ
- **Đã san** và cao độ đề xuất, nơi một nền hoặc hành lang đã làm thay đổi mặt đất
- "Ngoài bề mặt" khi nằm ngoài bề mặt

Để đọc chính xác một điểm đo, chọn {{ui:Chọn}} và nhấp vào điểm: bảng bên phải hiển thị số hiệu, đông, bắc, cao độ, mô tả và nhóm của nó.

## Hiển thị dải cao độ

1. Đánh dấu {{ui:Dải cao độ}}.
   Bề mặt được tô màu từ thấp (xanh lục lam) đến cao (nâu đất). Một chú giải dưới các ô đánh dấu liệt kê khoảng cao độ của mỗi dải.
2. Chọn số dải trong **Số dải**: 5, 8, 10 hoặc 12. Các dải chia khoảng từ cao độ thấp nhất đến cao nhất thành các bước bằng nhau.

Dải chỉ để xem. Chúng không được xuất sang DXF hoặc in ra PDF.

## Hiển thị mũi tên độ dốc

Đánh dấu {{ui:Mũi tên độ dốc}}. Một mũi tên ngắn trên mỗi tam giác đủ lớn để chứa nó chỉ xuống dốc. Tam giác phẳng không có mũi tên. Mũi tên là cách kiểm tra nhanh hướng thoát nước; giá trị độ dốc thì chưa được ghi nhãn.

## Hiển thị tam giác, điểm và cạnh

- {{ui:Tam giác}} vẽ các cạnh của TIN. Bật lên để kiểm tra cách bề mặt nối các điểm, đặc biệt dọc theo đường ngắt và ở phần ngoài.
- {{ui:Điểm}} vẽ từng điểm đo; {{ui:Nhãn điểm}} thêm số hiệu, cao độ và mô tả của nó (hoặc ít hơn: xem **Nhãn điểm** trong [Cài đặt CivilCraft](topic:settings)).
- {{ui:Đường ngắt}} vẽ đường ngắt (và ranh giới) bằng màu cam.
- {{ui:Biên bề mặt}} vẽ đường viền của bề mặt.

## Hiện trạng hay đề xuất

Khi một nền hoặc hành lang san không có vấn đề, **Bề mặt** dưới **Hiển thị** cung cấp {{ui:Dự kiến (đã san)}}. Khi đó đường đồng mức, dải và mũi tên thể hiện bề mặt đã san, để bạn thấy mặt đất mới và đường giao với mặt đất xung quanh nó. Chuyển lại {{ui:Mặt đất hiện trạng}} để xem khảo sát.

## Những gì được xuất

Đầu ra DXF và PDF theo các cài đặt này: những gì bạn đã tắt sẽ không được ghi, và đường đồng mức là của bề mặt đang hiển thị. Dải cao độ không bao giờ được xuất.
