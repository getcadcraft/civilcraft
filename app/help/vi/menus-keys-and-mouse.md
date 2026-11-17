---
title: Menu, phím và chuột
summary: Chọn kiểu menu phù hợp với cách bạn đang làm việc, gán phím riêng cho bất kỳ lệnh nào, chuyển lệnh giữa các thẻ dải lệnh, và đặt chức năng của con lăn cùng các nút chuột trên mặt bằng và trong 3D.
keywords: kiểu menu, menu, dải lệnh, dải lệnh công trình, thanh công cụ, dòng lệnh, vẽ kỹ thuật cổ điển, phím tắt, phím nóng, phím, tùy chỉnh, gán lại, chuột, con lăn, đảo ngược, hướng thu phóng, nút giữa, nút phải, di chuyển khung nhìn, xoay quanh, xuất, nhập, chuyển đổi, quen thuộc
from: 07ac73a0
---

Các lệnh của CivilCraft giống nhau dù bạn gọi chúng bằng cách nào. Một **kiểu menu** chỉ quyết định vị trí các lệnh trên màn hình, tên gọi của chúng và phím nào chạy chúng, để bạn giữ được thói quen đang có. Chọn một kiểu trong {{ui:Cài đặt}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Menu, phím và chuột}}; thay đổi có hiệu lực ngay, và trình duyệt này ghi nhớ nó.

## Ba kiểu

| Kiểu | Bạn nhận được |
|---|---|
| {{ui:CivilCraft}} | Thanh công cụ riêng của CivilCraft (Tệp, Xuất, Bề mặt, Thiết kế, Chỉnh sửa, GIS, Xem) và các phím đơn: {{key:A}} tuyến, {{key:G}} nền (pad), {{key:P}} ống, {{key:B}} đường ngắt, {{key:O}} ranh giới, {{key:L}} đường đặc trưng, {{key:R}} trắc dọc, {{key:X}} mặt cắt, {{key:E}} san nền, {{key:D}} 3D, {{key:F}} vừa khung, {{key:V}} chọn. Mặc định. |
| {{ui:Vẽ kỹ thuật cổ điển}} | Một dải lệnh nhỏ ({{ui:Trang chủ}}, {{ui:Chèn}}, {{ui:Xuất}}) và một dòng lệnh, dành cho người gõ lệnh: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (hoàn tác), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Gõ ở bất kỳ đâu và các chữ cái sẽ đi tới dòng lệnh; {{key:Enter}} chạy lệnh, {{key:Enter}} khi không nhập gì sẽ lặp lại lệnh trước, {{key:Esc}} xóa nội dung. Nút giữa di chuyển khung nhìn. |
| {{ui:Dải lệnh công trình}} | Các thẻ có nút lớn, nhóm công cụ giống cách các phần mềm thiết kế công trình sắp xếp: {{ui:Trang chủ}} (dữ liệu mặt đất, tạo thiết kế, khung nhìn trắc dọc và mặt cắt), {{ui:Bề mặt}}, {{ui:Sửa đổi}}, {{ui:Định vị}}, {{ui:Xem}} và {{ui:Xuất}}, cùng menu {{ui:Tệp}} và các nút nhanh ở bên phải. Các phím đơn vẫn giữ nguyên. Nút giữa di chuyển mặt bằng; trong 3D, nút giữa di chuyển khung nhìn và {{key:Shift}} cùng nút giữa xoay quanh. |

Mọi kiểu đều giữ các phím {{key:Mod}}: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
Phím thuộc bố cục riêng của CivilCraft nhưng kiểu của bạn đã gán cho lệnh khác sẽ không làm gì, và dòng trạng thái cho biết lệnh đó đã chuyển đi đâu ("Trong Phím của tôi, Pad là Ctrl+Alt+G"). {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} và các phím mũi tên luôn giữ nguyên ý nghĩa, và khi bạn vẽ một đường thẳng, các điểm của nó vẫn giữ phím riêng ({{key:Backspace}}, {{key:Enter}}).
:::

## Tự làm theo ý bạn

1. Chọn kiểu gần nhất với điều bạn muốn, rồi nhấn {{ui:Tùy chỉnh…}}.
2. Ở {{ui:Phím và menu}}, tìm một lệnh (ô tìm kiếm sẽ giúp ích). Nhấn {{ui:Thêm khóa}} rồi nhấn phím, hoặc hai phím liên tiếp cho phím hai chữ. Nhấn một phím để gỡ nó.
3. Với dải lệnh, {{ui:Vị trí}} chuyển lệnh sang thẻ và nhóm khác, sang menu {{ui:Tệp}}, hoặc sang {{ui:Chỉ có phím}}.
4. Ở {{ui:Chuột}}, đặt con lăn, các nút dùng để di chuyển mặt bằng, và chức năng của từng nút trong khung nhìn 3D.
5. Đặt tên và nhấn {{ui:Lưu}}.

Lưu một kiểu có sẵn sẽ tạo bản sao riêng ("Dải lệnh công trình của tôi"); kiểu có sẵn không bao giờ thay đổi. Phím được gán cho hai lệnh, hoặc phím sẽ chạy trước khi kịp gõ một phím hai chữ, được hiển thị màu đỏ và phải sửa trước khi bạn lưu được.

## Chuột

- **Con lăn chuột**: {{ui:Cuộn lên để phóng to}} (mặc định) hoặc {{ui:Cuộn lên để thu nhỏ}}, và tốc độ, trên mặt bằng và trong 3D. Thao tác chụm trên bàn di chuột luôn thu phóng theo hướng ngón tay di chuyển.
- **Di chuyển mặt bằng bằng**: nút giữa, nút phải, hoặc cả hai. {{key:Space}} và kéo cũng di chuyển được. Nút trái luôn chọn và vẽ.
- **Kéo trong khung nhìn 3D**: {{ui:Riêng của từng khung nhìn}} giữ các nút của CivilCraft (trái xoay, phải di chuyển). Hoặc đặt mỗi nút thành xoay, di chuyển, thu phóng hoặc không làm gì; {{key:Shift}} cùng nút sẽ đổi giữa xoay và di chuyển. Nhấn mà không kéo vẫn chọn được.

## Mang theo bên mình

{{ui:Xuất}} lưu kiểu đang dùng thành một tệp `.ccinput.json` nhỏ; {{ui:Nhập…}} thêm một tệp như vậy, từ máy tính khác hoặc từ đồng nghiệp. Tệp nhập vào chỉ có thể trỏ tới các lệnh của chính CivilCraft: mọi thứ khác bị bỏ qua và được đếm trên dòng trạng thái. {{ui:Xóa kiểu này}} xóa một kiểu do bạn tạo.

:::note
Các thiết lập này được giữ trong trình duyệt này. {{ui:Dùng kiểu này trong mọi ứng dụng}} dưới các thẻ kiểu làm mọi ứng dụng mở theo kiểu tương ứng (thanh công cụ riêng, dải lệnh hoặc Vẽ kỹ thuật cổ điển), cùng các thay đổi bạn đã làm trong từng ứng dụng. CivilCraft không có kiểu thanh menu: khi thanh menu của ứng dụng khác được chọn cho mọi ứng dụng, CivilCraft vẫn giữ thanh công cụ riêng của mình.
:::

Liên quan: [Bàn phím và chuột](topic:keyboard) · [Cài đặt CivilCraft](topic:settings) · [Chuyển từ phần mềm công trình khác](topic:coming-from)
