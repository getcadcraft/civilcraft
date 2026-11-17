---
title: Tính lưu lượng thiết kế thoát nước thải và kiểm tra cống
summary: Nhập số người và diện tích đổ vào tại mỗi hố ga của mạng thoát nước thải; CivilCraft cộng dồn xuống mạng, tính lưu lượng đỉnh với hệ số đỉnh và thấm, rồi kiểm tra khả năng chứa và vận tốc của mỗi ống.
keywords: thoát nước thải, cống, cống thoát nước thải, nước thải, lưu lượng thiết kế, lưu lượng đỉnh, hệ số đỉnh, harmon, babbitt, thấm, dân số, trên đầu người, phần trăm đầy, tự làm sạch, vận tốc, định cỡ ống, bảng thiết kế
from: 73ba197a
---

Tính lưu lượng thiết kế thoát nước thải làm việc trên [mạng ống](topic:pipe-network) khi {{ui:Type}} của nó là {{ui:Sanitary}}. Khi không chọn gì, bảng bên phải khi đó hiển thị **Lưu lượng thiết kế thoát nước thải** ở nơi mạng thoát nước mưa hiển thị thoát nước mưa.

## Nhập lượng nước đổ vào

1. Chọn một hố ga. Trong **Lưu lượng thiết kế thoát nước thải**, nhập {{ui:People entering here}} và {{ui:Area entering here}} (hecta trong dự án hệ mét, mẫu Anh trong dự án hệ Anh).
2. Với cửa hàng, văn phòng hoặc công nghiệp, nhập số người tương đương: diện tích nhân với số người trên mỗi hecta (hoặc mẫu Anh) mà cơ quan của bạn dùng. Diện tích vẫn được tính cho thấm trong cả hai trường hợp.
3. Lặp lại cho mỗi hố ga nơi một đường phố hoặc một lô đất đấu nối. Hố ga không có gì đấu nối giữ cả hai ở 0.

Mỗi ống mang mọi thứ đổ vào tại hố ga phía trên của nó và các hố ga phía trên nữa. Chọn một hố ga để xem những gì đi qua nó.

## Các cài đặt

| Cài đặt | Ý nghĩa |
|---|---|
| {{ui:Flow per person}} | lưu lượng trung bình của một người mỗi ngày: lít (dự án hệ mét) hoặc galông Mỹ (dự án hệ Anh) |
| {{ui:Infiltration}} | nước ngầm rò rỉ vào: lít mỗi giây trên mỗi hecta, hoặc galông mỗi ngày trên mỗi mẫu Anh |
| {{ui:Peaking factor}} | Harmon, 1 + 14 / (4 + √P), hoặc Babbitt, 5 / P^0,2, với P là dân số tính bằng nghìn |
| {{ui:Peaking factor at least}} / {{ui:Peaking factor at most}} | hệ số được giữ giữa hai giá trị này |
| {{ui:Manning n}} | dùng cho khả năng chứa và vận tốc |
| {{ui:Least velocity}} / {{ui:Most velocity}} | tại độ sâu riêng của lưu lượng đỉnh trong ống |
| {{ui:Most of full capacity}} | ống được phép đầy đến đâu ở đỉnh, tính bằng phần trăm của lưu lượng khi chảy đầy |

Các giá trị khởi đầu là giá trị tạm, không phải tiêu chuẩn. Hãy dùng các giá trị mà cơ quan của bạn công bố.

## Nó tính gì

Với mỗi ống, theo thứ tự dòng chảy:

- lưu lượng đỉnh = số người × lưu lượng mỗi người × hệ số đỉnh + diện tích × thấm
- khả năng chứa khi chảy đầy (phương trình Manning tại độ dốc của ống), và lưu lượng đỉnh làm nó đầy đến mức nào
- độ sâu đều của lưu lượng đỉnh và vận tốc tại đó

Bảng **Kết quả thoát nước thải** liệt kê số người, hệ số đỉnh, lưu lượng đỉnh (L/s, hoặc gpm và feet khối mỗi giây), phần trăm đầy và vận tốc của mỗi ống. Các Vấn đề được liệt kê bên dưới: một ống đầy hơn giới hạn, chảy chậm hơn vận tốc tối thiểu (có thể nó không tự làm sạch), nhanh hơn vận tốc tối đa, hoặc không có độ dốc. {{ui:Size the pipes for these flows}} chọn cho mỗi ống kích cỡ tiêu chuẩn nhỏ nhất (từ 200 mm hoặc 8 inch trở lên) mà chở được lưu lượng đỉnh của nó trong giới hạn; một lần {{key:Mod+Z}} hoàn tác nó.

:::note
Đây là lưu lượng đỉnh ổn định mà một bảng thiết kế tính ra, được kiểm tra với một bảng thiết kế đã công bố đến mức làm tròn in trên đó. Nó không phải là mô hình cống theo thời gian: không có quá trình thủy văn, trữ nước, bơm hay tràn. Xem [Chưa xây dựng](topic:not-built-yet).
:::

Vận tốc dùng phương trình Manning với cùng n ở mọi độ sâu. Một số cơ quan có biểu đồ đầy một phần cho phép n thay đổi theo độ sâu, cho vận tốc thấp hơn một chút trong ống đầy 60 đến 70 phần trăm (khoảng thấp hơn 3 phần trăm).
