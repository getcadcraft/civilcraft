---
title: Bắt đầu với CivilCraft
summary: CivilCraft làm được gì, cách mở nó, và mười phút đầu tiên với khu đất mẫu từ các điểm đến đường đồng mức, một con đường và một dự án đã lưu.
keywords: bắt đầu, chạy lần đầu, khu đất mẫu, giới thiệu, bắt đầu nhanh, hướng dẫn, khởi đầu, dự án mới
from: c9b6dd8e
---

CivilCraft là ứng dụng thiết kế dân dụng và khu đất của họ CadCraft. Nó lấy các điểm đo và biến chúng thành một bề mặt (TIN) có đường đồng mức, rồi cho bạn bố trí các tuyến với trắc dọc thiết kế, quét một hành lang đường đơn giản, san nền công trình đến đường giao với mặt đất, kiểm tra mạng ống tự chảy theo các quy tắc của bạn và xem khối lượng đào đắp. Nó đọc và ghi LandXML, xuất mặt bằng thành DXF và in ra PDF.

Nếu bạn đã dùng Civil 3D, các khái niệm sẽ quen thuộc: điểm, nhóm điểm, đường ngắt, tuyến theo PI, trắc dọc theo PVI, hành lang, san nền, mạng ống. Cách làm việc thì khác, và nhỏ gọn hơn nhiều: không có dòng lệnh, không có kiểu và không có tệp bản vẽ. Hãy đọc [Chuyển từ phần mềm dân dụng khác](topic:coming-from) một lần trước công việc thật đầu tiên.

## Bạn cần gì

- Một trình duyệt máy tính hiện đại: Chrome, Edge, Firefox hoặc Safari. Xem [Trình duyệt](common:browsers).
- Chuột hoặc bàn di chuột và bàn phím, hoặc màn hình cảm ứng: khi vẽ có các nút {{ui:Xong}}, {{ui:Hoàn tác điểm}} và {{ui:Hủy}} trên màn hình (xem [Chuột, bàn di chuột và cảm ứng](topic:keyboard#mouse-trackpad-and-touch)).
- Mặt bằng được vẽ ở dạng 2D bằng canvas của trình duyệt. [Khung nhìn 3D](topic:site-3d) dùng đồ họa WebGL của trình duyệt; nếu nó không khởi động được, thanh trạng thái cho biết lý do và mặt bằng vẫn hoạt động.
- Không cần tài khoản và không tải lên. Tệp mở trên máy tính của bạn và lưu dưới dạng tải xuống. Xem [Tệp của bạn](common:your-files).

:::note
CivilCraft hiện chạy dưới dạng bản trình duyệt sớm vẫn đang được xây dựng. Chưa có bản máy tính để bàn, và chưa có tính năng lưu lên đám mây. Mọi thứ bạn làm ở lại trên máy tính của bạn cho đến khi bạn lưu hoặc xuất.
:::

## Mở CivilCraft

1. Mở CivilCraft trong trình duyệt.
2. Chờ màn hình đầy đủ: thanh công cụ ở trên, bảng ở bên trái, mặt bằng ở giữa và bảng **Thuộc tính** ở bên phải.
3. Trên mặt bằng trống, bạn thấy một ô có tiêu đề **Start with survey points**. Ô này liệt kê các bước đầu tiên và có một liên kết, {{ui:Mở khu đất mẫu}}.

Để dùng CivilCraft khi không có kết nối sau này, nhấp {{ui:Lưu để dùng ngoại tuyến}} trên thanh ứng dụng và chờ {{ui:Sẵn sàng ngoại tuyến}}. Bản lưu gồm phần trợ giúp này, khu đất mẫu, và các thư viện 3D và GIS. Xem [Ngoại tuyến](common:offline). Nhấn {{key:F1}} hoặc nhấp {{ui:Trợ giúp}} bất cứ lúc nào để mở phần trợ giúp này bên cạnh ứng dụng.

## Mười phút đầu tiên: khu đất mẫu

Khu đất mẫu là một cuộc khảo sát nhỏ theo feet Mỹ: 276 điểm trên tọa độ state plane, một sống đất, một rãnh trũng có đường chảy và hai mép bờ. Nó đi kèm ứng dụng, nên bạn làm theo được mà không cần tệp riêng.

1. Nhấp {{ui:Mở khu đất mẫu}} trong ô trên mặt bằng.
   Hộp thoại **Import points** mở ra. Nó ghi "276 points read as PNEZD (from the header row), separated by commas." và hiện vài hàng đầu.
2. Nhấp {{ui:Nhập}}.
   Mặt bằng đầy các điểm, đường đồng mức và biên bề mặt. Thanh trạng thái ở dưới cho biết các điểm đã được nhập và bề mặt có bao nhiêu tam giác (546).
3. Nhìn vào bảng bên trái dưới **Points**. Các điểm được nhóm theo từ đầu tiên của mô tả: CP, FL, GRD, RIDGE, TBN, TBS và TREE.
4. Trong cột **Surface** của bảng đó, đặt **FL**, **RIDGE**, **TBN** và **TBS** thành {{ui:Đường ngắt}}.
   Bề mặt được dựng lại ngay. Mục **Surface** giờ ghi "Breaklines: 4", và các đường đồng mức gấp khúc rõ nét dọc theo đường chảy và sống đất thay vì cắt ngang qua chúng.
5. Di con trỏ lên mặt bằng. Thanh trạng thái hiện hoành độ và tung độ dưới con trỏ cùng cao độ mặt đất tại đó.
6. Dưới **Display**, đặt {{ui:Đường đồng mức mỗi}} thành 0.5 ft và bật {{ui:Dải cao độ}}. Một dải màu xuất hiện cùng chú giải dưới các ô đánh dấu. Tắt các dải đi khi bạn xong.

Bây giờ bạn đã có một bề mặt mặt đất tự nhiên. Tiếp theo là một con đường.

## Bố trí một đoạn đường ngắn

1. Nhấn {{key:A}} (hoặc nhấp {{ui:Tuyến}} trong nhóm **Design**).
2. Nhấp ba điểm trên khu đất, lần lượt. Một đường đỏ đi theo con trỏ và hiện chiều dài và phương vị của đoạn thẳng tiếp theo.
3. Nhấn {{key:Enter}} để kết thúc.
   Tuyến xuất hiện cùng cọc. Bảng bên phải hiện **Alignment**: chiều dài, bảng PI và đường cong tại PI giữa (bán kính 100 ft, hoặc nhỏ hơn nếu 100 ft không vừa).
4. Ở bảng bên phải, dưới **Design profile**, nhấp {{ui:Bắt đầu từ mặt đất}}.
   Khung nhìn trắc dọc mở ra dưới mặt bằng với mặt đất tự nhiên và một độ dốc thiết kế thẳng từ đầu đến cuối.
5. Nhấn {{key:I}} để bật {{ui:Thêm PVI}}, rồi nhấp một lần trong khung nhìn trắc dọc gần giữa. Một PVI xuất hiện.
6. Trong bảng PVI bên phải, nhập chiều dài đường cong (ví dụ 100) vào ô **Curve L** của PVI giữa và nhấn {{key:Enter}}. Trắc dọc giờ có đường cong đứng, với giá trị K được ghi nhãn.
7. Dưới **Corridor**, đánh dấu **Sweep an assembly along the design profile**.
   Con đường được san vào mặt đất: làn xe, lề và mái dốc bên đến đường giao với mặt đất. Khối **Earthwork** hiện lượng đào và đắp.

Đừng lo về giá trị chính xác. Mọi con số đều đổi được ở bảng bên phải, và {{key:Mod+Z}} hoàn tác thay đổi cuối cùng.

## Lưu công việc của bạn

1. Nhập một tên vào **Name** ở đầu bảng bên trái.
2. Nhấn {{key:Mod+S}} (hoặc nhấp {{ui:Lưu}}).
   Trình duyệt tải xuống một tệp đặt tên theo khu đất, kết thúc bằng `.civilcraft.json`. Nó chứa các điểm, cài đặt bề mặt, tuyến, trắc dọc, hành lang, nền và ống.
3. Để tiếp tục sau, nhấp {{ui:Mở}} (hoặc nhấn {{key:Mod+O}}) và chọn tệp đó, hoặc thả nó lên mặt bằng.

:::warning
Không có tự động lưu. Nếu bạn đóng thẻ khi còn thay đổi chưa lưu, trình duyệt hỏi có rời đi không; nếu rời đi, các thay đổi sẽ mất. Hãy lưu thường xuyên.
:::

## Đi tiếp đến đâu

- [Nhập điểm đo](topic:import-points) từ tệp của riêng bạn.
- [Dựng và tinh chỉnh bề mặt](topic:build-surface) bằng đường ngắt và biên.
- [Màn hình, từng phần một](topic:workspace).
- [Phím và chuột](topic:keyboard).
