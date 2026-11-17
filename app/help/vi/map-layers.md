---
title: Hiển thị lớp bản đồ bên dưới mặt bằng
summary: Đặt ảnh có tọa độ địa lý, ô bản đồ, máy chủ WMS hoặc WMTS, hoặc dịch vụ bản đồ bên dưới mặt bằng làm bối cảnh công trường, với cài đặt internet, độ mờ, thứ tự và ghi công.
keywords: lớp bản đồ, bản đồ nền, nền, nền bối cảnh, ảnh trên không, ortho, ảnh vệ tinh, raster, world file, pgw, jgw, tfw, wld, geotiff, ảnh có tọa độ, xyz, ô bản đồ, slippy map, wms, wmts, getcapabilities, dịch vụ bản đồ, rest, mapserver, imageserver, usgs, national map, ghi công, độ mờ
from: 32d7718e
---

Lớp bản đồ là các ảnh vẽ bên dưới thiết kế của bạn: ảnh chụp trên không với world file của nó, hoặc bản đồ từ máy chủ trên internet. Chúng chỉ là bối cảnh công trường trên màn hình: chúng **không** có trong bản in PDF, xuất DXF hoặc DWG, hay chế độ xem 3D.

Chọn {{ui:Map}} trong nhóm {{ui:GIS}}. Hộp thoại **Lớp bản đồ** liệt kê các lớp của dự án và thêm lớp mới. Lớp bản đồ cần hệ tọa độ của dự án ([Đặt hệ tọa độ của dự án](topic:coordinate-systems)), trừ một ảnh có world file dùng chính tọa độ của dự án.

## Cài đặt internet

CivilCraft không bao giờ yêu cầu máy chủ bản đồ bất cứ thứ gì cho đến khi bạn cho phép: {{ui:Settings}}, {{ui:CivilCraft}}, **Lớp bản đồ từ internet**: **Tắt** (mặc định) hoặc **Bật**.

:::note
Khi bật, CivilCraft yêu cầu các máy chủ bản đồ bạn thêm cung cấp ảnh của khu vực trên màn hình. Bản vẽ của bạn ở lại trên máy tính này; máy chủ thấy khu vực và địa chỉ internet của bạn.
:::

Khi tắt, các lớp internet vẫn được liệt kê trong hộp thoại nhưng bị làm mờ, kèm lý do, và không có gì được vẽ hay yêu cầu. Mở một dự án có tên máy chủ bản đồ cũng không liên lạc với chúng. Ảnh từ tệp hoạt động theo cả hai cách. Nút {{ui:Open Settings}} của hộp thoại đưa bạn đến đó.

## Ảnh có tọa độ địa lý (hoạt động ngoại tuyến)

1. Trong **Thêm một lớp**, giữ **Ảnh có tọa độ địa lý** và chọn các tệp: ảnh (PNG hoặc JPEG) **cùng với** world file của nó (`.pgw` cho PNG, `.jgw` cho JPEG, hoặc `.wld`) và, nếu có, `.prj` của nó. Bạn cũng có thể thả chúng lên mặt bằng cùng lúc.
2. Khi không có `.prj`, CivilCraft hỏi world file dùng hệ nào: {{ui:The project’s system}} (phổ biến nhất), {{ui:Pick a system…}}, hoặc, trong dự án không có hệ, **Tọa độ dự án**.
3. Ảnh xuất hiện dưới mặt bằng và {{ui:Fit}} bao gồm nó.

Một GeoTIFF RGB (ảnh chụp trên không được lưu thành GeoTIFF) mang theo vị trí và hệ riêng của nó: hãy mở nó riêng. Ảnh được giữ **bên trong tệp dự án** (tối đa 25 MB); tệp lớn hơn bị từ chối kèm kích thước, nên hãy lưu một bản nhỏ hơn (ít điểm ảnh hơn, hoặc JPEG).

## Ô bản đồ, WMS, WMTS và dịch vụ bản đồ

Bật **Lớp bản đồ từ internet** trước. Sau đó, trong **Thêm một lớp**:

| Từ | Dán gì | CivilCraft làm gì |
|---|---|---|
| URL ô | Một mẫu có `{z}`, `{x}` và `{y}` (hoặc `{-y}`), và `{s}` cho chữ cái máy chủ, ví dụ `https://tile.example.org/{z}/{x}/{y}.png`. Đặt tên và ghi công cho nó. | Các ô theo web Mercator cho khu vực và mức thu phóng trên màn hình. |
| Máy chủ WMS | Địa chỉ của máy chủ, hoặc liên kết GetCapabilities của nó. Chọn {{ui:Get the layers}}, rồi lớp. | Một ảnh của khu vực trên màn hình, yêu cầu theo mã EPSG của dự án khi máy chủ hỗ trợ, nếu không thì theo web Mercator hoặc WGS 84. |
| Máy chủ WMTS | Địa chỉ của máy chủ, hoặc `WMTSCapabilities.xml` của nó. Chọn {{ui:Get the layers}}, rồi lớp và tập ma trận ô. | Các ô từ tập đó trong hệ của dự án khi có, nếu không thì web Mercator. |
| Dịch vụ bản đồ ArcGIS (REST) | URL kết thúc bằng `/MapServer` hoặc `/ImageServer`. Chọn {{ui:Read the service}}. | Dịch vụ web Mercator đã lưu đệm được vẽ từ các ô của chúng; những dịch vụ khác được yêu cầu một ảnh của khu vực trên màn hình. |

Không có máy chủ nào được cài sẵn. Ví dụ công khai, đều từ USGS National Map (miền công cộng):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Dịch vụ bản đồ: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (cũng có `USGSImageryOnly` cho ảnh chụp trên không)

Nhiều phòng GIS của thành phố và quận công bố WMS hoặc dịch vụ bản đồ riêng; các trang GIS của họ cho biết địa chỉ. Máy chủ yêu cầu đăng nhập hoặc khóa sẽ không hoạt động: CivilCraft không gửi tên người dùng, mật khẩu hay khóa nào.

## Cách các lớp được vẽ

- Ảnh trong hệ khác hệ của dự án được chỉnh hình sang hệ đó: ảnh được cắt thành từng mảnh, mỗi mảnh được đặt sao cho nằm trong một phần tư pixel màn hình so với nơi một phép chuyển đổi chính xác đặt nó.
- Các ô được chọn cho khu vực và mức thu phóng trên màn hình: không bao giờ quá 64 cho một khung nhìn, và 6 cái cùng lúc. Khi bạn di chuyển hoặc thu phóng, các yêu cầu cho khung nhìn cũ bị hủy. Khoảng 200 ô được giữ trong bộ nhớ (không lưu gì trên đĩa).
- Ảnh WMS hoặc dịch vụ bản đồ được yêu cầu sau khi khung nhìn ngừng di chuyển; cho đến khi nó đến, ảnh trước vẫn ở chỗ cũ.
- Ghi công của mỗi lớp trên màn hình hiển thị nhỏ ở góc dưới bên phải mặt bằng.

## Đổi, sắp xếp và gỡ lớp

Trong hộp thoại, mỗi lớp có một hộp đánh dấu để hiện hoặc ẩn, một thanh trượt **Độ mờ**, các mũi tên để vẽ sớm hơn (thấp hơn) hoặc muộn hơn (lên trên cùng), một nút thu phóng (cho ảnh) và một nút gỡ. Lớp đầu tiên trong danh sách được vẽ ở dưới cùng. Mỗi thay đổi là một bước hoàn tác.

## Khi một lớp không hiện gì

Lý do xuất hiện một lần trên dòng trạng thái và vẫn nằm dưới tên lớp trong hộp thoại:

| Thông báo | Cần làm gì |
|---|---|
| Tắt: lớp bản đồ từ internet đang tắt trong Cài đặt. | Bật **Lớp bản đồ từ internet**. |
| Cần hệ tọa độ của dự án | Đặt nó dưới {{ui:Coordinates}}. |
| Máy chủ không cho trang này dùng ảnh của nó (CORS), hoặc không thể kết nối. | Máy chủ không cho trang web dùng ảnh của nó, hoặc nó đang ngừng hoạt động. Sau bốn lần bị từ chối, CivilCraft ngừng yêu cầu; hãy ẩn rồi hiện lại lớp để thử lần nữa. |
| Máy chủ trả về 404 … / Máy chủ gửi text/xml, không phải ảnh: … | URL, lớp hoặc kiểu sai, hoặc thông báo của máy chủ cho biết nó muốn gì. |
| Lớp này không được cung cấp trong hệ của dự án, web Mercator hoặc WGS 84 | Máy chủ không thể vẽ ở nơi CivilCraft có thể đặt nó. |

## Đã kiểm tra những gì

- Số ô được kiểm tra theo cách lát ô web Mercator chuẩn; câu trả lời WMS 1.1.1 và 1.3.0, WMTS và dịch vụ bản đồ được đọc từ các tệp viết tay và từ câu trả lời thật được lưu từ USGS National Map và máy chủ OpenStreetMap terrestris; yêu cầu WMS 1.3.0 đặt vĩ độ trước cho EPSG:4326, như tiêu chuẩn quy định.
- Chỉnh hình được so với một phép chuyển đổi chính xác theo từng điểm ảnh bằng các số của PROJ: trong 0,13 px cho ô, ảnh WMS và một ảnh cỡ quận, ở tỷ lệ công trường và khi thu nhỏ.
- Một ảnh có world file và một GeoTIFF RGB do GDAL (qua rasterio) ghi được vẽ đúng vị trí mà vị trí của chúng quy định, kiểm tra từng điểm ảnh trên trình duyệt.
- Trên trình duyệt, với một máy chủ giả trên máy thử: các ô rơi vào ô mà PROJ đặt mỗi điểm; ảnh WMS rơi trong vòng 2 px; tối đa 6 yêu cầu chạy cùng lúc; và khi cài đặt tắt, không yêu cầu nào rời khỏi trang. Dịch vụ bản đồ USGS National Map ở trên cũng được đọc và vẽ trực tiếp trên trình duyệt một lần (các ô của nó đến và được vẽ, cùng dòng bản quyền); các máy chủ công khai khác chỉ được đọc từ câu trả lời đã lưu.
