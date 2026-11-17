---
title: Mở DWG hoặc DXF làm đường nét
summary: Mở đường nét của bản vẽ trên mặt bằng theo từng lớp, dùng đường đồng mức, polyline 3D và đường viền khép kín cho bề mặt, và biến các khối điểm thành điểm đo.
keywords: kiểm tra đo đạc, cao độ văn bản, dwg, dxf, cad, bản vẽ, đường nét, đường đồng mức, đường ngắt, ranh giới, polyline, polyline 3d, lớp, bản đồ nền, địa hình, bản vẽ đo đạc, khối, tham chiếu khối, điểm đo từ khối, thuộc tính, khối điểm, điểm chèn
from: da0f4c58
---

Một bản vẽ khảo sát địa hình thường đến dưới dạng bản vẽ: đường đồng mức là polyline ở cao độ của chúng, đường ngắt là polyline 3D, và ranh giới công trường là polyline khép kín. CivilCraft mở **không gian mô hình** của bản vẽ như các lớp trên mặt bằng, và có thể biến các đường đó thành bề mặt ngay.

## Mở bản vẽ

1. Nhấn {{ui:Đường nét}} trong nhóm **Bề mặt** (hoặc {{ui:Mở}}, hoặc thả tệp lên mặt bằng) rồi chọn một tệp `.dwg` hoặc `.dxf`. Bản vẽ được đọc trên máy tính này; không có gì được tải lên. DWG từ 2000 đến 2018 và DXF ASCII được đọc.
2. Hộp thoại **Đường nét** liệt kê các lớp của bản vẽ có chứa đường, hình khép kín hoặc điểm, và cho biết chúng có **cao độ** hay không. Các lớp đang tắt trong bản vẽ bắt đầu ở trạng thái không đánh dấu. Văn bản, tô bóng, kích thước và các đối tượng khác không phải đường nét được đếm và bỏ qua (hộp thoại cho biết là những gì).
3. Kiểm tra **Đơn vị bản vẽ**. Khi bản vẽ có ghi đơn vị, CivilCraft chuyển đổi sang đơn vị của dự án (milimét sang mét, mét sang feet, inch sang feet). Bản vẽ theo feet được đọc là US survey feet mà không tỷ lệ: hai đơn vị này chênh nhau 2 phần triệu, và nếu tỷ lệ hóa tọa độ state plane theo tỷ số đó thì chúng sẽ lệch hàng feet. Khi bản vẽ không ghi đơn vị, số liệu của nó được đọc theo đơn vị của dự án; hãy chọn đúng đơn vị trong danh sách nếu chưa đúng.
4. Trong **{{ui:Dùng cho bề mặt}}**, chọn lớp đó đóng góp gì cho bề mặt (hoặc giữ **Chỉ hiển thị**). Các lớp có tên giống đường đồng mức (TOPO, CONT, CNTR) và có cao độ sẽ bắt đầu là đường ngắt.
5. Nhấn {{ui:Thêm}}. Các lớp xuất hiện dưới **Lớp GIS** trong bảng bên trái; mỗi công dụng được đưa vào bề mặt. Mỗi phần là một bước riêng: {{key:Mod+Z}} hoàn tác từng bước một.

## Mỗi loại lớp có thể cho gì

| Lớp chứa | Dùng cho bề mặt |
|---|---|
| Đường đồng mức (polyline ở một cao độ) | Đường ngắt ở cao độ riêng của đường, hoặc theo trường ELEV |
| Polyline 3D | Đường ngắt ở cao độ riêng của chúng |
| Đường viền khép kín | Ranh giới bề mặt (hình khép kín lớn nhất, hoặc hình bạn chọn) |
| Điểm có cao độ | Điểm đo, mô tả bằng tên lớp |
| Đường ở cao độ 0 (đường nét mặt bằng) | Không có gì: nó nằm trên mặt bằng như bản vẽ nền |

Một bản vẽ do CivilCraft ghi giữ các đường đặc trưng dưới dạng polyline 3D nhớ được cung của chúng. Khi đó hộp thoại hiển thị **Đường đặc trưng**: giữ đánh dấu để đưa chúng về làm đường đặc trưng với cung và công dụng (một bước hoàn tác), hoặc bỏ đánh dấu để đọc chúng như đường nét thông thường.

Sau đó, dùng {{ui:Dùng cho bề mặt}} trong menu của lớp dưới **Lớp GIS** để làm điều tương tự cho một lớp bạn chỉ hiển thị.

## Điểm đo từ khối

Bản vẽ khảo sát thường mang điểm của chúng dưới dạng khối: một ký hiệu nhỏ tại mỗi điểm đo, với thuộc tính cho số điểm, mô tả và cao độ. Khi bản vẽ có tham chiếu khối, hộp thoại có mục **Điểm đo từ khối**:

1. Đánh dấu các khối cần lấy (bảng cho biết mỗi khối có bao nhiêu tham chiếu, trên lớp nào và có thuộc tính nào), hoặc đánh dấu các lớp để lấy mọi tham chiếu khối trên đó.
2. Chọn số hiệu, mô tả và cao độ của mỗi điểm lấy từ đâu: một thuộc tính, tên khối hoặc tên lớp, các số trống tiếp theo, hoặc Z của điểm chèn. CivilCraft bắt đầu ở các thuộc tính có khả năng (PT, DESC, ELEV và tương tự), và chỉ lấy cao độ từ một thuộc tính khi các khối nằm ở số không.
3. Bỏ đánh dấu các lớp đường nét nếu bạn chỉ muốn điểm, rồi nhấn {{ui:Thêm}}.

Mỗi tham chiếu thành một điểm đo tại điểm chèn của nó. Chỉ tính các tham chiếu đặt trong không gian mô hình; khối lồng trong khối khác thì không tính. Số đã có trong dự án, hoặc đã dùng hai lần trong bản vẽ, sẽ nhận số mới sau số cao nhất; thuộc tính cao độ không phải số sẽ để điểm đó không có cao độ. Thanh trạng thái đếm cả hai trường hợp. Bản vẽ không bao giờ bị thay đổi, và mỗi điểm nhớ khối của nó: Thuộc tính hiển thị **Từ khối** cùng khối, lớp và handle. Thêm điểm là một bước, nên {{key:Mod+Z}} xóa tất cả.

## Cao độ viết dạng văn bản, và kiểm tra

Cao độ điểm viết dạng văn bản (hoặc trong thuộc tính khối không phải khối điểm đo) không phải đường nét. Mục **Cao độ đo đạc và kiểm tra** có thể lấy chúng làm điểm đo, và liệt kê những gì có vẻ sai với bản vẽ: đơn vị, hệ tọa độ, khoảng cách tới gốc, đường đồng mức phẳng, cao độ bất thường, điểm trùng. Xem [Kiểm tra bản vẽ đo đạc khi nhập](topic:survey-check).

## Cách đọc bản vẽ

- Cung, đường tròn, elip, đoạn polyline có độ cong và spline trở thành các đoạn thẳng ngắn (mỗi 5° tối đa).
- Tham chiếu khối được vẽ tại vị trí đặt, kể cả khối lồng nhau; những gì khối chứa trên lớp 0 nhận lớp của tham chiếu.
- Đối tượng vẽ trên mặt phẳng khác (hướng đùn khác) được đặt theo tọa độ thế giới.
- Mỗi đối tượng có ba trường: LAYER, TYPE (loại đối tượng) và ELEV (cao độ của nó khi mọi điểm có chung một cao độ).
- Tọa độ được lấy đúng như vậy: bản vẽ phải dùng cùng tọa độ với dự án (ví dụ cùng múi state plane). Bản vẽ liên kết (xref) không được mở: hãy mở riêng.

:::tip
Một bản vẽ đường đồng mức cho bề mặt tốt nhất khi có vài cao độ điểm trên đỉnh đồi và trong trũng, nơi chỉ có đường đồng mức sẽ để lại các tam giác phẳng. Thêm chúng như điểm đo, hoặc từ một lớp điểm trong bản vẽ.
:::
