---
title: Màn hình, từng phần một
summary: Một vòng tham quan mọi thanh và bảng trong CivilCraft theo tên hiển thị trên màn hình, từ thanh công cụ đến thanh trạng thái.
keywords: giao diện, màn hình, thanh công cụ, bảng, thuộc tính, thanh trạng thái, khung nhìn trắc dọc, bố cục, tham quan, ui
from: 76272010
---

CivilCraft có một màn hình. Không có thẻ và không có bố cục. Các bảng bên có thể di chuyển, nổi hoặc ra cửa sổ riêng: xem [Sắp xếp các bảng và dùng màn hình thứ hai](common:arrange-panels). Từ trên xuống dưới và từ trái sang phải:

- **thanh ứng dụng** (biểu tượng CadCraft, tên ứng dụng, phiên bản, Giới thiệu, chế độ màn hình, Trợ giúp, Lưu để dùng ngoại tuyến, Giấy và Mô hình)
- **thanh công cụ** với bảy nhóm nút
- **bảng bên trái**: Khu đất, Điểm, Bề mặt, Hiển thị và, khi bạn nhập một số, Lớp GIS
- **mặt bằng** ở giữa, với **khung nhìn trắc dọc** bên dưới khi nó đang mở
- **bảng bên phải**: Thuộc tính của thứ đang chọn
- **thanh trạng thái** dọc phía dưới

## Thanh ứng dụng

Thanh mỏng ở trên cùng thuộc về trang web CadCraft, không phải chính CivilCraft.

- Menu phiên bản cho biết bạn đang chạy bản dựng nào.
- {{ui:Giới thiệu CivilCraft}} mở trang của ứng dụng trên trang web.
- {{ui:Toàn màn hình}} chuyển vòng qua các chế độ màn hình: toàn màn hình, rồi toàn màn hình với các thanh bị ẩn, rồi trở về bình thường. {{key:Ctrl+Shift+F}} làm điều tương tự trên mọi nền tảng, kể cả Mac (ở đó là phím Control, không phải Command). Khi các thanh bị ẩn, di con trỏ lên mép trên để đưa chúng trở lại.
- {{ui:Trợ giúp}} (hoặc {{key:F1}}) mở phần trợ giúp này trong một bảng bên; {{key:F1}} hoặc {{key:Esc}} đóng nó.
- {{ui:Lưu để dùng ngoại tuyến}} giữ CivilCraft trong trình duyệt này để nó mở được khi không có kết nối; khi đó nó hiện {{ui:Sẵn sàng ngoại tuyến}}. Xem [Các tệp bạn có thể mở, lưu và xuất](topic:files#online-and-offline).
- {{ui:Giấy}} và {{ui:Mô hình}} chuyển giữa giao diện sáng và tối. Mặt bằng và trắc dọc theo giao diện; PDF luôn in trên nền trắng.

## Thanh công cụ

Mỗi nhóm có một nhãn nhỏ phía trên các nút. Rê chuột lên một nút để xem chú giải và phím của nó.

| Nhóm | Các nút | Tác dụng |
|---|---|---|
| Tệp | {{ui:Mới}}, {{ui:Mở}}, {{ui:Lưu}} | Bắt đầu lại, mở một tệp điểm, LandXML hoặc dự án, lưu dự án dưới dạng tải xuống |
| Xuất | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Ghi LandXML 1.2, DXF R12 hoặc DWG của mặt bằng, hoặc in mặt bằng ra PDF |
| Bề mặt | {{ui:Đường ngắt}}, {{ui:Biên}} | Vẽ một đường ngắt qua các điểm đo; vẽ biên ngoài |
| Thiết kế | {{ui:Tuyến}}, {{ui:Nền}}, {{ui:Ống}}, {{ui:Trắc dọc}} | Vẽ một tuyến, một nền, một đoạn ống; hiện hoặc ẩn khung nhìn trắc dọc |
| Chỉnh sửa | {{ui:Hoàn tác}}, {{ui:Làm lại}}, {{ui:Sao chép}}, {{ui:Dán}}, {{ui:Thêm}} | Hoàn tác, làm lại, sao chép và dán các điểm đo; {{ui:Thêm}} chứa Cắt, Dán tại chỗ, Nhân bản, Xóa, Chọn tất cả điểm và Bỏ chọn |
| GIS | {{ui:Tọa độ}}, {{ui:Nhập}}, {{ui:Xuất}}, {{ui:Bản đồ}} | Đặt hệ tọa độ, nhập và xuất tệp GIS, hiện các lớp bản đồ dưới mặt bằng |
| Xem | {{ui:Chọn}}, {{ui:Vừa khung}}, {{ui:3D}} | Chọn và di chuyển các thứ; thu phóng để thấy tất cả; hiện khu đất ở dạng 3D ([Xem khu đất ở dạng 3D](topic:site-3d)) |

Một công cụ vẽ vẫn được nhấn khi nó đang hoạt động. Nhấp lại vào nó, nhấn {{key:Esc}} hoặc nhấn {{key:V}} để về {{ui:Chọn}}. {{ui:Hoàn tác}}, {{ui:Làm lại}}, {{ui:Sao chép}} và các mục trong {{ui:Thêm}} bị mờ khi chúng không thể thực hiện; chú giải cho biết lý do (ví dụ "Select survey points first"). Mọi nút được liệt kê trong [Tham chiếu thanh công cụ](topic:toolbar).

Trên cửa sổ hẹp, thanh công cụ cuộn ngang.

## Bảng bên trái

### Khu đất

- **Name**: tên dự án. Nó đặt tên cho mọi tệp bạn lưu hoặc xuất và được in trên dải tiêu đề của PDF.
- **Units**: {{ui:Feet Mỹ}} hoặc {{ui:Mét}}. Cài đặt này cho biết các con số có nghĩa gì. Đổi nó **không** chuyển đổi tọa độ; xem [Đơn vị, cọc và định dạng số](topic:units-and-stations).

### Điểm

Khi trống, nó cho bạn biết cách mở một tệp điểm. Khi có điểm, nó hiện tên tệp, số điểm và số điểm có cao độ, rồi một bảng **nhóm điểm**: mỗi hàng ứng với một từ đầu của mô tả (GRD, FL, TBS …), kèm số lượng và một lựa chọn **Surface**:

- {{ui:Điểm}}: các điểm đi vào bề mặt (mặc định cho mọi nhóm).
- {{ui:Đường ngắt}}: các điểm của nhóm được nối, theo thứ tự số điểm, thành một đường ngắt.
- {{ui:Bỏ qua}}: nhóm không tác động đến bề mặt.

### Bề mặt

Thông tin về mặt đất tự nhiên: điểm, tam giác, cao độ thấp nhất và cao nhất, cao độ trung bình, diện tích 2D và 3D, đường ngắt và có biên hay không. Dưới thông tin, một ô liệt kê mọi thứ mà bộ dựng bề mặt phải sửa hoặc không làm được. Rồi:

- **Longest outside edge**: 0 giữ mọi tam giác ngoài; một con số sẽ cắt các tam giác dài mảnh ở phía ngoài.
- Các liên kết xuất hiện khi chúng áp dụng: {{ui:Gỡ biên}}, {{ui:Gỡ các đường ngắt đã vẽ}} và, với bề mặt đọc từ LandXML, {{ui:Dựng lại bề mặt từ các điểm}}.

### Hiển thị

- **Surface**: {{ui:Mặt đất tự nhiên}} hoặc {{ui:Dự kiến (đã san)}}. Cái thứ hai dùng được khi một nền hoặc hành lang san không có vấn đề.
- **Contours every**, **Major every** và **Bands** (số dải màu).
- Các ô đánh dấu: {{ui:Đường đồng mức}}, {{ui:Nhãn đường đồng mức}}, {{ui:Tam giác}}, {{ui:Dải cao độ}}, {{ui:Mũi tên độ dốc}}, {{ui:Điểm}}, {{ui:Nhãn điểm}}, {{ui:Đường ngắt}}, {{ui:Biên bề mặt}}, {{ui:Ống}}.
- Chú giải cao độ các dải xuất hiện khi các dải đang bật.

Cài đặt hiển thị được lưu cùng dự án nhưng không phải bước hoàn tác: {{key:Mod+Z}} không bao giờ bỏ đánh dấu một ô.

## Mặt bằng

Mặt bằng hiển thị các điểm, bề mặt và mọi thứ bạn thiết kế, ở dạng mặt bằng với hướng bắc lên trên. Con lăn để thu phóng tại con trỏ, kéo vào khoảng trống để di chuyển khung nhìn. Danh sách đầy đủ ở [Phím và chuột](topic:keyboard).

- Trên dự án trống, một ô có tiêu đề **Start with survey points** liệt kê các bước đầu tiên và đưa ra {{ui:Mở khu đất mẫu}}.
- Khi một công cụ vẽ đang hoạt động, một gợi ý ở đầu mặt bằng cho biết nhấp vào đâu và kết thúc thế nào.
- Kéo một tệp lên mặt bằng hiện "Drop a point file, LandXML or project".
- Các thứ được chọn được làm nổi bật. Một tuyến hoặc nền được chọn hiện các grip vuông tại các PI hoặc góc của nó; một công trình được chọn hiện một grip. Kéo grip để di chuyển.
- Các điểm đo được chọn có một vòng tròn. {{key:Shift}} và nhấp thêm hoặc bớt một điểm; {{key:Shift}} và kéo vẽ một hộp (hoặc, kéo vòng quanh chúng, một lasso) thêm các điểm bên trong. Xem [Chọn, sao chép và dán điểm đo](topic:copy-paste-points).

## Khung nhìn trắc dọc

Nhấn {{key:R}} hoặc nhấp {{ui:Trắc dọc}} để mở nó dưới mặt bằng. Thanh của nó có:

- danh sách tuyến (bật khi có từ hai tuyến trở lên)
- {{ui:Thêm PVI}}: khi nó đang nhấn, một cú nhấp trong trắc dọc thêm một PVI ({{key:I}} bật tắt nó)
- một số đọc về cọc, mặt đất, cao độ thiết kế, độ dốc và đào hoặc đắp dưới con trỏ
- một nút đóng

Trắc dọc hiển thị mặt đất tự nhiên, trắc dọc thiết kế, độ dốc trên mỗi đoạn thẳng, cọc và cao độ của mỗi PVI, L và K của mỗi đường cong đứng cùng BVC và EVC của nó, điểm cao và điểm thấp, và độ phóng đại đứng. Nó luôn vừa toàn bộ tuyến: không thu phóng hay di chuyển khung nhìn. Di con trỏ dọc theo nó sẽ đặt một chấm lên tuyến trong mặt bằng.

## Bảng bên phải: Thuộc tính

Tiêu đề của nó cho biết nó hiển thị gì.

- **Project** (không chọn gì): các tuyến và nền dưới dạng liên kết, khối **Earthwork**, và khối **Pipe network** cùng các quy tắc và vấn đề của nó.
- **Alignment**: tên, cọc đầu, chiều dài, bảng PI, các đường cong, bảng PVI và thông tin của trắc dọc thiết kế, và các cài đặt **Corridor**.
- **Pad**: tên, cao độ, mái dốc đào và đắp, diện tích, thông tin đường giao với mặt đất và khối lượng đất.
- **Structure** hoặc **Pipe**: kích cỡ, cao độ miệng, cao độ đáy, độ dốc, lớp phủ và các vấn đề (nếu có).
- **Point** và số của nó: tọa độ, cao độ, mô tả và nhóm của điểm (chỉ để đọc).

Các ô có hiệu lực khi bạn nhấn {{key:Enter}} hoặc rời ô. Giá trị không được chấp nhận được đánh dấu không hợp lệ và không có gì thay đổi.

## Thanh trạng thái

- **E** và **N**: hoành độ và tung độ dưới con trỏ.
- Cao độ **Ground** tại đó (và **Graded** nơi một nền hoặc hành lang đã thay đổi nó), hoặc "Off the surface".
- Tuyến gần nhất (hoặc tuyến đang chọn) cùng **Sta** và độ lệch (**L** hoặc **R**) dưới con trỏ.
- Ở bên phải, các thông báo: điều vừa xảy ra, hoặc vì sao điều gì đó bị từ chối. Một thông báo tự xóa sau vài giây.

## Hộp thoại

- **Import points**: mở với mọi tệp điểm. Xem [Nhập điểm đo](topic:import-points).
- **Plot the plan to PDF**: xem [In mặt bằng ra PDF](topic:plot-pdf).
- **Unsaved changes**: hỏi trước khi {{ui:Mới}} hoặc mở một dự án hay tệp LandXML bỏ đi công việc chưa lưu. {{ui:Lưu bản sao}} tải dự án xuống trước.

## Màn hình nhỏ

Đến 760 pixel chiều rộng, như trên điện thoại, mặt bằng giữ màn hình: thanh công cụ là một hàng cuộn ngang, và các bảng mở ra như tờ từ một thanh ở dưới. {{ui:Công cụ}} ẩn thanh công cụ và {{ui:Di chuyển}} đặt nó xuống dưới.
