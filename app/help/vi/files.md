---
title: Tệp bạn có thể mở, lưu và xuất
summary: Đưa tệp điểm, LandXML và dự án CivilCraft vào; xuất dự án, LandXML, DXF và PDF ra; mỗi loại giữ gì, tệp được đặt ở đâu, và điều gì thay đổi khi ngoại tuyến.
keywords: mở, lưu, xuất, nhập, định dạng tệp, csv, txt, landxml, xml, dxf, pdf, json, tải xuống, tệp dự án
from: 82bff559
---

CivilCraft mở tệp từ máy tính của bạn và lưu bằng cách tải tệp về máy. Không có gì được tải lên và không có gì được giữ trên máy chủ. Xem thêm [Tệp của bạn](common:your-files).

## Những gì nó mở

Nhấn {{ui:Open}} (hoặc nhấn {{key:Mod+O}}) và chọn một tệp, hoặc kéo tệp từ {{pick:mac=Finder|windows=File Explorer|linux=trình quản lý tệp của bạn}} vào mặt bằng. Mỗi lần một tệp; tệp trên 200 MB bị từ chối. Tệp LandXML hoặc tệp dự án trên 32 MB được đọc theo từng phần khoảng 4 MB, không bao giờ đọc như một khối văn bản; trong lúc một LandXML đang mở, hãy lưu ý nó dùng khoảng 13 lần kích thước tệp trong bộ nhớ (một tệp 69 MB đã dùng khoảng 0.9 GB trong thử nghiệm của chúng tôi).

| Loại | Tên tệp | Điều gì xảy ra |
|---|---|---|
| Tệp điểm | `.csv`, `.txt`, `.pnt`, `.xyz` (mọi tệp văn bản) | Hộp thoại **Nhập điểm** mở ra. Các điểm thay thế điểm của dự án; tuyến, nền và ống được giữ nguyên. |
| LandXML | `.xml`, `.landxml` | Một **dự án mới** được tạo từ tệp (bạn được hỏi trước nếu dự án hiện tại có thay đổi chưa lưu). |
| Dự án CivilCraft | `.civilcraft.json` (mọi `.json`) | Dự án mở như lúc được lưu (bạn được hỏi trước nếu dự án hiện tại có thay đổi chưa lưu). |

CivilCraft quyết định theo đuôi tệp, rồi theo các ký tự đầu: văn bản bắt đầu bằng `{` được đọc là dự án, bắt đầu bằng `<` là LandXML, còn lại là tệp điểm. Tệp mà hộp mở làm mờ vẫn có thể thả lên mặt bằng.

:::note
Nhập tệp điểm vào dự án đã có điểm sẽ thay thế chúng mà không hỏi, và xóa lịch sử hoàn tác (mở bất kỳ tệp nào đều là một khởi đầu mới cho hoàn tác). Nếu mặt đất đến từ LandXML, nhập điểm sẽ chuyển nó trở lại thành mặt được dựng từ các điểm. Hãy lưu trước nếu bạn có thể muốn lấy lại các điểm cũ.
:::

Chi tiết: [Định dạng tệp điểm](topic:point-file-formats), [LandXML: những gì được đọc và ghi](topic:landxml-reference).

## Những gì nó lưu

{{ui:Save}} ({{key:Mod+S}}) ghi hai tệp cạnh nhau, đặt tên theo **Name** trong bảng bên trái: `<name>.civilcraft.json`, dự án bạn tiếp tục chỉnh sửa, và `<name>.ifc`, cùng thiết kế dưới dạng IFC 4.3 cho các phần mềm khác (xem [Xuất và nhập IFC](topic:ifc)). Mỗi tệp ghi nhận tệp kia, và IFC cũng chứa một bản nén của dự án, nên một IFC gửi riêng vẫn mở lại được đầy đủ và chỉnh sửa được.

- **Trong Studio**, cả hai tệp được ghi cạnh nhau, ngay tại chỗ.
- **Trong Chrome và Edge**, lần Lưu đầu tiên hỏi một thư mục và ghi cả hai vào đó; các lần lưu sau vào cùng thư mục. Hủy câu hỏi về thư mục để tải cả hai về.
- **Trong các trình duyệt khác**, cả hai tệp được tải về, tệp dự án trước.

Mở một trong hai tệp sẽ tìm tệp còn lại. Mở cả hai cùng lúc (hoặc thả cả hai), hoặc mở một: trong Studio, tệp kia được tìm trong cùng thư mục; trong trình duyệt, CivilCraft hỏi bạn có muốn thêm nó không, hoặc tiếp tục với tệp đang có. Nếu IFC bị một chương trình khác thay đổi sau khi CivilCraft lưu, hoặc một trong hai tệp cũ hơn tệp kia, dự án mở từ thiết kế mới hơn và bảng Vấn đề cho biết đã xảy ra chuyện gì, với **Lưu ngay** (ghi lại cả hai tệp) và **Hiển thị hình học IFC làm tham chiếu**. Một IFC riêng mà chương trình khác đã thay đổi sẽ mở từ bản dự án của nó, với những phần vẫn khớp: tuyến bị thay đổi nhận hình học của nó, đối tượng bị xóa thì bị bỏ đi, và các thay đổi còn lại được liệt kê chứ không được áp dụng. Tệp dự án từ trước 0.7.1 vẫn mở như trước.

Tệp dự án giữ:

- mọi điểm (số, tọa độ, cao độ, mô tả) và tên tệp điểm chúng đến từ
- cài đặt bề mặt: lựa chọn nhóm, đường ngắt đã vẽ, ranh giới, cạnh ngoài dài nhất, và TIN đọc từ LandXML
- cài đặt hiển thị
- tuyến cùng các PI, bán kính và trạm bắt đầu, trắc dọc thiết kế (PVI và chiều dài đường cong) và cài đặt hành lang
- nền và mạng ống cùng các quy tắc của nó

Nó không giữ lịch sử hoàn tác. Bề mặt, đường đồng mức, đường giao với mặt đất và khối lượng không được lưu; chúng được dựng lại từ đầu vào đã lưu khi dự án mở. Tệp dự án từ một CivilCraft mới hơn bị từ chối, kèm thông báo nêu tên phiên bản của nó.

## Những gì nó xuất

| Nút | Tệp | Nội dung |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: điểm, mặt đất hiện có (và mặt đã san nền khi có) dưới dạng mặt TIN, tuyến, trắc dọc mặt đất và thiết kế, mạng ống |
| {{ui:DXF}} | `<name>.dxf` | DXF R12 của nét vẽ mặt bằng như đang hiển thị, trên các lớp đặt tên |
| {{ui:DWG}} | `<name>.dwg` | Cùng nét vẽ dưới dạng bản vẽ DWG, theo định dạng bạn chọn (2000 đến 2018) |
| {{ui:PDF}} | `<name>.pdf` | Bản in vector của mặt bằng trên một tờ, theo tỷ lệ bạn chọn |
| {{ui:GLB}} hoặc {{ui:OBJ}} (trên thanh của chế độ xem 3D) | `<name>-3d.glb`, `<name>-3d.obj` | Những gì chế độ xem 3D hiển thị dưới dạng mô hình 3D: mét, trục Y hướng lên, tỷ lệ thật, quanh một gốc cục bộ đã ghi |

Mỗi loại bỏ sót gì: [LandXML trao đổi](topic:landxml), [Xuất mặt bằng ra DXF](topic:dxf-export) (DWG cũng vậy), [In mặt bằng ra PDF](topic:plot-pdf), [Xuất công trường ra 3D](topic:export-3d).

## Nơi tệp được đặt

Tệp đã lưu và đã xuất được đưa đến nơi trình duyệt của bạn đặt các tệp tải xuống, thường là thư mục Tải xuống. Để chọn thư mục mỗi lần:

:::chromium
Mở **Cài đặt** của trình duyệt, rồi **Tải xuống**, và bật **Hỏi nơi lưu từng tệp trước khi tải xuống**.
:::

:::firefox
Mở **Cài đặt**, rồi **Chung**, và trong mục **Tệp và ứng dụng** chọn **Luôn hỏi bạn nơi lưu tệp**.
:::

:::safari
Mở **Safari > Cài đặt > Chung** và đặt **Vị trí tải tệp xuống** thành **Hỏi cho mỗi lần tải xuống**.
:::

Nếu bạn lưu hai lần với cùng tên, trình duyệt có thể thêm một số vào tệp thứ hai, ví dụ `Site (1).civilcraft.json`. Lần sau hãy mở tệp mới nhất.

## Trực tuyến và ngoại tuyến

CivilCraft luôn chỉ chạy trên máy tính của bạn: mở tệp là đọc tệp trong trình duyệt, lưu là tải tệp về. Để mở CivilCraft khi không có kết nối nào, hãy lưu để dùng ngoại tuyến trước:

1. Khi đang trực tuyến, nhấn {{ui:Lưu để dùng ngoại tuyến}} trên thanh ứng dụng phía trên.
2. Nút đếm lên ("Đang lưu 12 trên 30") rồi hiển thị {{ui:Sẵn sàng ngoại tuyến}}. CivilCraft khá nhỏ (khoảng 0.6 MB), nên việc này mất một lúc. Bản đã lưu bao gồm cả trợ giúp này và công trường mẫu.
3. Khi không có kết nối, mở cùng địa chỉ (hoặc dấu trang của nó). Mọi thứ đều hoạt động, kể cả {{ui:Mở công trường mẫu}}.

Các trạng thái khác của nút:

- {{ui:Không thể lưu}}: một số tệp chưa tải xuống được. Kiểm tra kết nối và nhấn để thử lại.
- {{ui:Không dùng được chế độ ngoại tuyến}}: cửa sổ trình duyệt này không thể giữ bản sao ngoại tuyến (cửa sổ riêng tư và một số máy tính được quản lý sẽ chặn việc này). Hãy dùng cửa sổ thường.

Nhấn {{ui:Sẵn sàng ngoại tuyến}} để xem thời điểm bản sao được lưu, với hai lựa chọn: {{ui:Lưu lại (lấy bản mới nhất)}} và {{ui:Xóa bản ngoại tuyến}}. Lưu lại trước một chuyến thăm công trường để bản sao khớp với bản dựng mới nhất. Xem thêm trong [Ngoại tuyến](common:offline).

:::offline
Hiện bạn đang ngoại tuyến. Nếu CivilCraft đã được lưu để dùng ngoại tuyến, mọi thứ đều hoạt động, kể cả công trường mẫu. Nếu chưa, hãy tiếp tục làm việc trong thẻ này, nhưng đừng tải lại cho đến khi bạn trực tuyến trở lại; không có bản đã lưu, {{ui:Mở công trường mẫu}} sẽ lỗi với thông báo "Không thể tải mẫu".
:::

:::tip
Khi làm việc ngoài hiện trường, hãy lưu CivilCraft để dùng ngoại tuyến và mang các tệp điểm sang chính máy tính xách tay. Dự án và bản xuất được lưu thành tệp tải về mà không cần kết nối, nên bạn có thể nhập số đo của một ngày, kiểm tra bề mặt và lưu dự án ngay tại công trường.
:::

Chưa có lưu trữ đám mây, và bản cho máy tính để bàn chưa phát hành. Hiện tại, các tệp bạn lưu là bản sao duy nhất: hãy giữ chúng ở nơi có sao lưu.

## Tiện ích bổ sung mà tệp sử dụng

Khi bạn lưu một dự án có dữ liệu từ tiện ích bổ sung (các ô đánh dấu Quy định xây dựng, hoặc một nguồn Địa chỉ đến công trường), tệp ghi lại những tiện ích nào và phiên bản nào. Mở tệp trên máy thiếu một tiện ích thì một thanh phía trên mặt bằng sẽ cho biết và đề nghị thêm nó từ danh sách trong tài khoản của bạn. Bản ghi chỉ là ghi chú: tệp vẫn mở được dù thế nào.

## Hoàn tác từ Studio

Trong CadCraft Studio, mỗi bước bạn hoàn thành trong CivilCraft được báo cho Studio, nên hoàn tác ở cấp dự án của Studio có thể lấy lại bước mới nhất giữa các ứng dụng. Studio chỉ hoàn tác một bước khi ngăn xếp hoàn tác của chính CivilCraft vẫn đúng như bước đó đã để lại; sau khi bạn mở một tệp khác, nó bỏ qua cửa sổ này.

## Đóng khi có thay đổi chưa lưu

Khi dự án có thay đổi chưa lưu và bạn đóng thẻ, tải lại, hoặc rời trang, trình duyệt hỏi bạn có muốn rời đi không. Nội dung và giao diện của hộp đó thuộc về trình duyệt và CivilCraft không thể thay đổi. {{ui:Mới}}, cũng như việc mở dự án hoặc tệp LandXML, thay vào đó hỏi trong hộp **Thay đổi chưa lưu** của riêng CivilCraft, với {{ui:Hủy}}, {{ui:Không lưu}} và {{ui:Lưu bản sao}}.
