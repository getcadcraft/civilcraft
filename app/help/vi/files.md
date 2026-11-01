---
title: Tệp bạn có thể mở, lưu và xuất
summary: Đưa tệp điểm, LandXML và dự án CivilCraft vào; dự án, LandXML, DXF và PDF ra; mỗi tệp giữ những gì, tệp được lưu ở đâu và những gì thay đổi khi ngoại tuyến.
keywords: mở, lưu, xuất, nhập, định dạng tệp, csv, txt, landxml, xml, dxf, pdf, json, tải xuống, tệp dự án
from: a7debb61
---

CivilCraft mở tệp từ máy tính của bạn và lưu bằng cách tải tệp về máy. Không có gì được tải lên và không có gì được giữ trên máy chủ. Xem thêm [Tệp của bạn](common:your-files).

## Mở được những gì

Nhấn {{ui:Open}} (hoặc nhấn {{key:Mod+O}}) rồi chọn một tệp, hoặc kéo tệp từ {{pick:mac=Finder|windows=File Explorer|linux=trình quản lý tệp của bạn}} vào mặt bằng. Mỗi lần một tệp; tệp trên 200 MB sẽ bị từ chối.

| Loại | Tên tệp | Điều gì xảy ra |
|---|---|---|
| Tệp điểm | `.csv`, `.txt`, `.pnt`, `.xyz` (mọi tệp văn bản) | Hộp thoại **Nhập điểm** mở ra. Các điểm thay thế điểm của dự án; tuyến, nền (pad) và ống giữ nguyên. |
| LandXML | `.xml`, `.landxml` | Một **dự án mới** được tạo từ tệp (sẽ hỏi trước nếu dự án hiện tại có thay đổi chưa lưu). |
| Dự án CivilCraft | `.civilcraft.json` (mọi `.json`) | Dự án mở ra như lúc được lưu (sẽ hỏi trước nếu dự án hiện tại có thay đổi chưa lưu). |

CivilCraft xác định theo phần đuôi tệp, rồi theo những ký tự đầu: văn bản bắt đầu bằng `{` được đọc là dự án, bắt đầu bằng `<` là LandXML, còn lại là tệp điểm. Tệp mà hộp mở tệp làm mờ vẫn có thể thả vào mặt bằng.

:::note
Nhập tệp điểm vào dự án đã có điểm sẽ thay thế các điểm đó mà không hỏi, và xóa lịch sử hoàn tác (mở bất kỳ tệp nào đều bắt đầu lại từ đầu với hoàn tác). Nếu mặt đất lấy từ LandXML, nhập điểm sẽ chuyển nó về bề mặt được dựng từ các điểm. Hãy lưu trước nếu bạn có thể cần các điểm cũ.
:::

Chi tiết: [Định dạng tệp điểm](topic:point-file-formats), [LandXML: nội dung được đọc và ghi](topic:landxml-reference).

## Lưu được những gì

{{ui:Save}} ({{key:Mod+S}}) ghi hai tệp cạnh nhau, đặt tên theo **Tên** ở bảng bên trái: `<name>.civilcraft.json`, dự án bạn tiếp tục chỉnh sửa, và `<name>.ifc`, cùng thiết kế dưới dạng IFC 4.3 cho các phần mềm khác (xem [Xuất và nhập IFC](topic:ifc)). Mỗi tệp ghi nhận tệp kia, và IFC cũng mang một bản nén của dự án, nên một IFC gửi riêng vẫn mở lại được đầy đủ và chỉnh sửa được.

- **Trong Studio** cả hai tệp được ghi cạnh nhau, ngay tại chỗ.
- **Trong Chrome và Edge** lần Lưu đầu tiên sẽ hỏi một thư mục và ghi cả hai vào đó; các lần lưu sau vào cùng thư mục. Hủy hộp hỏi thư mục để tải cả hai về thay thế.
- **Trong các trình duyệt khác** cả hai tệp được tải xuống, tệp dự án trước.

Khi mở một trong hai tệp, CivilCraft sẽ tìm tệp kia. Mở cả hai cùng lúc (hoặc thả cả hai), hoặc mở một tệp: trong Studio, tệp kia được tìm trong cùng thư mục; trong trình duyệt, CivilCraft sẽ hỏi bạn có muốn thêm nó không, hoặc tiếp tục với tệp bạn đang có. Nếu IFC bị chương trình khác thay đổi sau khi CivilCraft lưu, hoặc một tệp cũ hơn tệp kia, dự án sẽ mở từ thiết kế mới hơn và bảng Vấn đề sẽ cho biết chuyện gì đã xảy ra, với **Lưu ngay** (ghi lại cả hai tệp) và **Hiển thị hình học của IFC làm tham chiếu**. Một IFC riêng lẻ do chương trình khác thay đổi sẽ mở từ bản sao dự án của nó, với phần còn khớp: tuyến nào bị đổi thì lấy hình học của nó, đối tượng nào bị xóa thì bỏ đi, và các thay đổi còn lại được liệt kê chứ không được áp dụng. Tệp dự án từ trước 0.7.1 vẫn mở như trước.

Tệp dự án giữ:

- mỗi điểm (số hiệu, tọa độ, cao độ, mô tả) và tên tệp điểm mà chúng đến từ
- các thiết lập mặt: lựa chọn nhóm, đường ngắt đã vẽ, ranh giới, cạnh ngoài dài nhất và một TIN đọc từ LandXML
- các thiết lập hiển thị
- tuyến với các PI, bán kính và cọc bắt đầu, các trắc dọc thiết kế (PVI và chiều dài đường cong) và thiết lập hành lang
- nền (pad) và mạng ống cùng các quy tắc của nó

Tệp không giữ lịch sử hoàn tác. Mặt, đường đồng mức, đường giao với mặt đất và khối lượng không được lưu; chúng được dựng lại từ dữ liệu đầu vào đã lưu khi dự án mở. Tệp dự án từ CivilCraft mới hơn sẽ bị từ chối, với thông báo nêu phiên bản của nó.

## Xuất được những gì

| Nút | Tệp | Nội dung |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: điểm, mặt đất hiện trạng (và mặt đã san nền khi có) dưới dạng bề mặt TIN, tuyến, trắc dọc mặt đất và thiết kế, mạng ống |
| {{ui:DXF}} | `<name>.dxf` | DXF R12 của nét mặt bằng như đang hiển thị, trên các lớp đặt tên |
| {{ui:DWG}} | `<name>.dwg` | Cùng nét vẽ dưới dạng bản vẽ DWG, theo định dạng bạn chọn (2000 đến 2018) |
| {{ui:PDF}} | `<name>.pdf` | Bản in vector của mặt bằng trên một tờ, ở tỷ lệ bạn chọn |
| {{ui:GLB}} hoặc {{ui:OBJ}} (trên thanh của khung nhìn 3D) | `<name>-3d.glb`, `<name>-3d.obj` | Những gì khung nhìn 3D hiển thị dưới dạng mô hình 3D: mét, trục Y hướng lên, tỷ lệ thật, quanh một gốc cục bộ đã ghi lại |

Mỗi loại bỏ sót những gì: [Trao đổi LandXML](topic:landxml), [Xuất mặt bằng sang DXF](topic:dxf-export) (DWG cũng vậy), [In mặt bằng ra PDF](topic:plot-pdf), [Xuất khu đất ra 3D](topic:export-3d).

## Tệp được lưu ở đâu

Tệp đã lưu và đã xuất được ghi vào nơi trình duyệt đặt các tệp tải xuống, thường là thư mục Tải xuống. Để chọn thư mục mỗi lần:

:::chromium
Mở **Cài đặt** của trình duyệt, rồi **Tải xuống**, và bật **Hỏi nơi lưu mỗi tệp trước khi tải xuống**.
:::

:::firefox
Mở **Cài đặt**, rồi **Chung**, và trong **Tệp và ứng dụng** chọn **Luôn hỏi bạn nơi lưu tệp**.
:::

:::safari
Mở **Safari > Cài đặt > Chung** và đặt **Vị trí tải tệp xuống** thành **Hỏi cho mỗi lần tải xuống**.
:::

Nếu bạn lưu hai lần với cùng tên, trình duyệt có thể thêm số vào tệp thứ hai, ví dụ `Site (1).civilcraft.json`. Lần sau hãy mở tệp mới nhất.

## Trực tuyến và ngoại tuyến

CivilCraft chỉ làm việc trên máy tính của bạn trong cả hai trường hợp: mở tệp là đọc tệp trong trình duyệt, lưu là tải tệp xuống. Để mở CivilCraft hoàn toàn không có kết nối, hãy lưu để dùng ngoại tuyến trước:

1. Khi đang trực tuyến, nhấn {{ui:Save for offline}} trên thanh ứng dụng phía trên.
2. Nút đếm lên ("Đang lưu 12 trên 30") rồi hiển thị {{ui:Offline ready}}. CivilCraft khá nhỏ (khoảng 0.6 MB), nên việc này mất một lúc. Bản đã lưu bao gồm trợ giúp này và khu đất mẫu.
3. Khi không có kết nối, mở cùng địa chỉ (hoặc dấu trang của nó). Mọi thứ đều hoạt động, kể cả {{ui:Open the sample site}}.

Các trạng thái khác của nút:

- {{ui:Could not save}}: một số tệp không tải xuống được. Kiểm tra kết nối và nhấn nút để thử lại.
- {{ui:Offline not available}}: cửa sổ trình duyệt này không thể giữ bản ngoại tuyến (cửa sổ riêng tư và một số máy được quản lý sẽ chặn). Hãy dùng cửa sổ thông thường.

Nhấn {{ui:Offline ready}} để xem bản đã được lưu khi nào, với hai lựa chọn: {{ui:Save again (get the newest version)}} và {{ui:Remove the offline copy}}. Hãy lưu lại trước chuyến thăm công trường để bản sao khớp với bản dựng mới nhất. Xem thêm tại [Ngoại tuyến](common:offline).

:::offline
Bạn đang ngoại tuyến. Nếu CivilCraft đã được lưu để dùng ngoại tuyến, mọi thứ đều hoạt động, kể cả khu đất mẫu. Nếu chưa, hãy tiếp tục làm việc trong thẻ này, nhưng đừng tải lại cho đến khi bạn trực tuyến trở lại; không có bản đã lưu, {{ui:Open the sample site}} sẽ thất bại với thông báo "Không thể tải mẫu".
:::

:::tip
Khi làm việc ngoài hiện trường, hãy lưu CivilCraft để dùng ngoại tuyến và mang các tệp điểm sang chính máy tính xách tay. Dự án và bản xuất được lưu dưới dạng tải xuống dù không có kết nối, nên bạn có thể nhập số đo trong ngày, kiểm tra mặt và lưu dự án ngay tại công trường.
:::

Lưu lên đám mây chưa có sẵn, và bản cài đặt máy tính chưa được phát hành. Hiện tại, các tệp bạn lưu là bản duy nhất: hãy giữ chúng ở nơi có sao lưu.

## Tiện ích bổ sung mà tệp sử dụng

Khi bạn lưu một dự án có dữ liệu từ tiện ích bổ sung (các ô đánh dấu Quy định xây dựng, hoặc nguồn Địa chỉ đến mặt bằng công trường), tệp ghi lại tiện ích nào và phiên bản nào. Mở tệp trên máy thiếu tiện ích đó, một thanh phía trên mặt bằng sẽ cho biết và đề nghị thêm nó từ danh sách tài khoản của bạn. Bản ghi chỉ là ghi chú: tệp vẫn mở được trong cả hai trường hợp.

## Hoàn tác từ Studio

Trong CadCraft Studio, mỗi bước bạn hoàn tất trong CivilCraft được báo cho Studio, nên hoàn tác ở cấp dự án của Studio có thể hoàn tác bước mới nhất qua các ứng dụng. Studio chỉ hoàn tác một bước khi ngăn xếp hoàn tác của CivilCraft đúng như bước đó đã để lại; sau khi bạn mở tệp khác, nó sẽ bỏ qua cửa sổ này.

## Đóng khi có thay đổi chưa lưu

Khi dự án có thay đổi chưa lưu và bạn đóng thẻ, tải lại hoặc rời trang, trình duyệt sẽ hỏi bạn có muốn rời đi không. Nội dung và giao diện của hộp đó thuộc về trình duyệt và CivilCraft không thể thay đổi. {{ui:New}}, cũng như mở dự án hoặc tệp LandXML, thay vào đó sẽ hỏi trong hộp **Thay đổi chưa lưu** của chính CivilCraft, với {{ui:Cancel}}, {{ui:Don’t save}} và {{ui:Save a copy}}.
