---
title: Dựng và tinh chỉnh bề mặt
summary: CivilCraft tam giác hóa mặt đất hiện trạng như thế nào, và cách định hình nó bằng nhóm đường ngắt, đường ngắt đã vẽ, đường biên ngoài và cạnh ngoài dài nhất.
keywords: tin, bề mặt, tam giác hóa, đường ngắt, biên, mặt đất hiện trạng, eg, tạo bề mặt, delaunay, tam giác, cạnh tối đa, biên ngoài
from: b9eea3f3
---

CivilCraft có một bề mặt mặt đất hiện trạng cho mỗi dự án. Đó là TIN (mạng tam giác không đều) được dựng từ các điểm của bạn, và nó tự dựng lại mỗi khi một đầu vào thay đổi. Không có lệnh "dựng lại" và không có bề mặt lỗi thời.

## Những gì đi vào bề mặt

- Mọi điểm có cao độ trong nhóm được đặt thành {{ui:Points}}.
- Mọi nhóm được đặt thành {{ui:Breakline}}, được nối theo thứ tự số hiệu điểm.
- Mọi đường ngắt bạn vẽ bằng công cụ {{ui:Breakline}}.
- Đường biên ngoài, nếu bạn vẽ một đường.
- Cài đặt **Cạnh ngoài dài nhất**.

Các tam giác không bao giờ cắt qua đường ngắt: bề mặt bị buộc đi theo nó, rồi được làm đều nhất có thể quanh nó (Delaunay ở mọi nơi khác).

## Biến các đường có mã thành đường ngắt

1. Trong bảng bên trái dưới **Điểm**, tìm nhóm (ví dụ FL).
2. Đặt lựa chọn **Bề mặt** của nó thành {{ui:Breakline}}.
   Bề mặt được dựng lại, đường được vẽ màu cam (khi {{ui:Breaklines}} được bật dưới **Hiển thị**), và **Đường ngắt** trong thông tin bề mặt tăng thêm một.
3. Kiểm tra đường trên mặt bằng. Nó phải chạy điểm sang điểm theo thứ tự đường được đo. Nếu nó zig-zag, nhóm chứa nhiều hơn một đường, hoặc các điểm không được đánh số theo thứ tự: đặt lại nhóm thành {{ui:Points}} và vẽ các đường bằng tay (mục tiếp theo).

## Vẽ đường ngắt qua các điểm

1. Nhấn {{key:B}}, hoặc nhấp {{ui:Breakline}} trong nhóm **Bề mặt**.
   Gợi ý ghi "Đường ngắt: nhấp các điểm khảo sát theo thứ tự (nó lấy cao độ của chúng). Enter để kết thúc."
2. Di con trỏ gần một điểm. Một ô vuông cam nhỏ đánh dấu điểm nó sẽ lấy.
3. Nhấp lần lượt các điểm của đường. Mỗi lần nhấp nêu tên điểm và cao độ của nó trên thanh trạng thái.
4. Nhấn {{key:Enter}} để kết thúc.
   Thanh trạng thái ghi "Đã thêm đường ngắt 1; bề mặt đã được dựng lại."

Mỗi lần nhấp phải trúng một điểm khảo sát có cao độ; nhấp ở chỗ khác sẽ bị từ chối với thông báo "Nhấp vào một điểm khảo sát có cao độ: đường ngắt lấy cao độ của các điểm’." {{key:Backspace}} bỏ điểm cuối; {{key:Esc}} hủy toàn bộ đường.

:::warning
Kết thúc bằng {{key:Enter}}. Nhấp đúp cũng kết thúc, nhưng trong bản dựng này nó bỏ điểm bạn vừa nhấp đúp. Nhấp điểm cuối một lần, rồi nhấn {{key:Enter}}.
:::

Để xóa mọi đường ngắt đã vẽ cùng lúc, nhấp {{ui:Remove drawn breaklines}} trong mục **Bề mặt**. Để chỉ xóa đường cuối, dùng {{key:Mod+Z}}. Các đường ngắt đã vẽ hiện chưa thể chọn hoặc sửa từng đường.

## Vẽ đường biên ngoài

Đường biên cắt bề mặt theo khu vực bạn tin cậy, ví dụ ranh giới khảo sát, để các tam giác dài qua các góc chưa khảo sát bị loại bỏ.

1. Nhấn {{key:O}}, hoặc nhấp {{ui:Boundary}}.
2. Nhấp các góc theo thứ tự quanh khu vực. Một đường nét đứt thể hiện hình dạng.
3. Nhấn {{key:Enter}}.
   Thanh trạng thái ghi "Đã đặt biên; các tam giác nằm ngoài đã bị loại bỏ." **Biên** trong thông tin bề mặt ghi "Có" và số góc.

Điều cần biết:

- Chỉ có một đường biên. Vẽ đường khác sẽ thay thế nó. {{ui:Remove the boundary}} sẽ gỡ nó.
- Nó chỉ có thể bớt đi: đường biên vượt qua các điểm sẽ được cắt lại theo đường bao của chúng, kèm ghi chú "Đường biên vượt qua các điểm; nó đã được cắt lại theo đường bao của chúng."
- Các góc của nó lấy cao độ từ bề mặt, nên cạnh bám đúng theo mặt đất.
- Đường biên ẩn (bên trong) hiện chưa có.

## Cắt các tam giác ngoài dài

Không có đường biên, bề mặt lấp đầy toàn bộ đường bao của các điểm, kể cả các tam giác dài và mảnh qua các cạnh lõm.

1. Trong **Bề mặt**, nhập một chiều dài vào **Cạnh ngoài dài nhất** và nhấn {{key:Enter}}. Bắt đầu với khoảng hai hoặc ba lần khoảng cách đo điển hình của bạn.
2. Các tam giác ngoài có cạnh ngoài dài hơn mức đó sẽ bị loại bỏ, làm dần vào trong cho đến khi mọi cạnh ngoài đủ ngắn. Một cạnh là đường ngắt thì không bao giờ bị bóc đi.
3. Nhập 0 để giữ lại mọi tam giác.

## Đọc báo cáo bề mặt

Dưới thông tin bề mặt, một hộp liệt kê những gì bộ dựng đã làm. Có thanh màu đất nung bên trái là thông tin; có thanh đỏ thì hộp chứa lỗi và không có bề mặt.

| Thông báo | Ý nghĩa |
|---|---|
| "3 điểm nằm cùng vị trí với một điểm khác và được nối với nó." | Các điểm gần hơn 0.0001 trên mặt bằng trở thành một đỉnh (giữ điểm đầu tiên). |
| "2 vị trí có hai cao độ khác nhau …" | Các điểm chồng lên nhau, hoặc các đường ngắt cắt nhau, không khớp về độ cao. Cao độ của đường ngắt được ưu tiên, rồi đến điểm đầu tiên. |
| "1 đoạn đường ngắt không thể buộc vào bề mặt." | Một đoạn đường ngắt rất ngắn hoặc gần như chồng lên nhau không vừa; hãy kiểm tra vị trí đó. |
| "Bề mặt cần ít nhất ba điểm có cao độ." | Quá ít điểm: kiểm tra thứ tự cột và các nhóm. |
| "Các điểm đều nằm trên một đường thẳng: không có tam giác." | Các điểm không có bề rộng, ví dụ một đường chuyền đơn. |
| "Đường biên không chồng lên các điểm." | Đường biên nằm ở chỗ khác, thường do nhầm lẫn đơn vị hoặc tọa độ. |
| "Không còn tam giác nào bên trong đường biên." | Đường biên quá nhỏ hoặc đặt sai chỗ. |

## Bề mặt đọc từ LandXML

Khi bạn mở LandXML, bề mặt TIN đầu tiên của nó được dùng nguyên vẹn: tiêu đề **Bề mặt** ghi "Bề mặt (từ LandXML)" và **Cạnh ngoài dài nhất** bị mờ. Khi bề mặt đó đang được dùng, các nhóm đường ngắt, đường ngắt đã vẽ và đường biên mới không thay đổi nó. Để dựng bề mặt từ các điểm của tệp, nhấp {{ui:Rebuild the surface from the points}}. {{key:Mod+Z}} sẽ khôi phục bề mặt LandXML.

## Liên quan

- [Đọc đường đồng mức, cao độ và độ dốc](topic:contours).
- [Nhập điểm khảo sát](topic:import-points).
