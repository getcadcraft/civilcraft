---
title: Tham chiếu thanh công cụ
summary: Mọi nút trên thanh công cụ của CivilCraft, chức năng của nó, phím tắt, và khi nào nó bị mờ hoặc từ chối.
keywords: thanh công cụ, nút, lệnh, công cụ, tệp, xuất, bề mặt, thiết kế, chỉnh sửa, xem, menu
from: 4c4352bc
---

Thanh công cụ chạy dọc phía trên ứng dụng thành bảy nhóm. Mỗi nút hiện chú giải và phím khi bạn rê chuột lên nó.

## Tệp

| Nút | Phím | Chức năng |
|---|---|---|
| {{ui:Mới}} | không có | Bắt đầu một dự án trống. Hỏi trước nếu còn thay đổi chưa lưu. |
| {{ui:Mở}} | {{key:Mod+O}} | Mở một tệp điểm (CSV, TXT), LandXML hoặc một dự án CivilCraft. |
| {{ui:Lưu}} | {{key:Mod+S}} | Tải dự án xuống dưới dạng `<name>.civilcraft.json`. |

## Xuất

| Nút | Phím | Chức năng |
|---|---|---|
| {{ui:LandXML}} | không có | Tải xuống `<name>.xml`: các điểm, bề mặt, tuyến, trắc dọc và mạng ống dưới dạng LandXML 1.2. "Chưa có gì để xuất." khi dự án trống. |
| {{ui:DXF}} | không có | Tải xuống `<name>.dxf`: nét vẽ mặt bằng dưới dạng DXF R12. |
| {{ui:PDF}} | {{key:Mod+P}} | Mở **In mặt bằng ra PDF**. "Chưa có gì để in." khi dự án trống. |

## Bề mặt

| Nút | Phím | Chức năng |
|---|---|---|
| {{ui:Đường ngắt}} | {{key:B}} | Nhấp các điểm đo theo thứ tự, {{key:Enter}} để kết thúc. Đường ngắt lấy cao độ của các điểm. |
| {{ui:Biên}} | {{key:O}} | Nhấp các góc của biên ngoài, {{key:Enter}} để kết thúc. Thay thế mọi biên hiện có. |

Cả hai đều hiện "Chưa có bề mặt: mở các điểm đo trước." khi chưa có bề mặt.

## Thiết kế

| Nút | Phím | Chức năng |
|---|---|---|
| {{ui:Tuyến}} | {{key:A}} | Nhấp các PI theo thứ tự, {{key:Enter}} để kết thúc. |
| {{ui:Nền}} | {{key:G}} | Nhấp các góc của nền, {{key:Enter}} để kết thúc. Giống các công cụ bề mặt, nó cảnh báo khi chưa có bề mặt; một nền chỉ san được trên bề mặt. |
| {{ui:Ống}} | {{key:P}} | Nhấp các công trình từ thượng lưu xuống hạ lưu (nhấp vào một công trình có sẵn để nối vào), {{key:Enter}} để kết thúc. |
| {{ui:Trắc dọc}} | {{key:R}} | Hiện hoặc ẩn khung trắc dọc dưới mặt bằng. |

## Chỉnh sửa

| Nút | Phím | Chức năng |
|---|---|---|
| {{ui:Hoàn tác}} | {{key:Mod+Z}} | Hoàn tác thay đổi gần nhất (tối đa 200). Mờ khi không có gì để hoàn tác. |
| {{ui:Làm lại}} | {{key:Mod+Y}} | Làm lại những gì đã hoàn tác. Mờ khi không có gì để làm lại. |
| {{ui:Sao chép}} | {{key:Mod+C}} | Sao chép các điểm đo đã chọn, và đặt chúng vào bộ nhớ tạm dưới dạng các dòng điểm mà bảng tính có thể nhận. Mờ cho đến khi có điểm được chọn. |
| {{ui:Dán}} | {{key:Mod+V}} | Dán các điểm: chúng đi theo con trỏ, và một cú nhấp sẽ đặt chúng xuống với số không trùng điểm nào khác. Các dòng điểm sao chép từ bảng tính cũng được dán. |
| {{ui:Thêm}} | không có | Mở menu dưới đây. |

Menu {{ui:Thêm}}:

| Mục | Phím | Chức năng |
|---|---|---|
| {{ui:Cắt}} | {{key:Mod+X}} | Sao chép các điểm đã chọn rồi xóa chúng (một bước hoàn tác). |
| {{ui:Sao chép}} | {{key:Mod+C}} | Như nút {{ui:Sao chép}}. |
| {{ui:Dán}} | {{key:Mod+V}} | Như nút {{ui:Dán}}. |
| {{ui:Dán tại chỗ}} | {{key:Mod+Shift+V}} | Dán các điểm tại tọa độ riêng của chúng, với số không trùng điểm nào khác. |
| {{ui:Nhân bản}} | {{key:Mod+D}} | Một bản sao của các điểm đã chọn đi theo con trỏ; nhấp vào nơi muốn đặt. Bộ nhớ tạm không đổi. |
| {{ui:Xóa}} | {{key:Delete}} | Xóa các điểm đo đã chọn, hoặc tuyến, nền, công trình (cùng các ống của nó), ống hoặc PVI đã chọn. |
| {{ui:Chọn tất cả các điểm}} | {{key:Mod+A}} | Chọn mọi điểm đo. |
| {{ui:Bỏ chọn}} | {{key:Esc}} | Xóa vùng chọn. |

Mục không thể thực hiện lúc này sẽ bị mờ, và chú giải của nó cho biết lý do. Chi tiết: [Chọn, sao chép và dán các điểm đo](topic:copy-paste-points).

Hoàn tác bao gồm các chỉnh sửa thiết kế, cài đặt bề mặt và các điểm đo (dán, cắt, nhân bản, xóa). Nó không áp dụng cho cài đặt hiển thị; mở hoặc nhập bất kỳ tệp nào sẽ xóa lịch sử hoàn tác.

## GIS

| Nút | Phím | Chức năng |
|---|---|---|
| {{ui:Tọa độ}} | không có | Mở hộp thoại **Hệ tọa độ**: cho biết dự án ở hệ nào, hoặc dùng tọa độ mặt đất hay tọa độ cục bộ. Xem [Đặt hệ tọa độ của dự án](topic:coordinate-systems) và [Tọa độ mặt đất và tọa độ cục bộ](topic:ground-and-local-coordinates). |
| {{ui:Nhập}} | không có | Nhập dữ liệu GIS: shapefile, GeoJSON, GeoPackage, lưới cao độ và LiDAR. Xem [Nhập dữ liệu GIS](topic:gis-import). |
| {{ui:Xuất}} | không có | Xuất dữ liệu hoàn công cho bộ phận GIS. Xem [Xuất dữ liệu hoàn công cho GIS](topic:gis-export). |
| {{ui:Phân tích}} | không có | Mở bảng phân tích GIS: vùng đệm, chồng lớp, nối không gian, chọn theo thuộc tính, đo. Xem [Phân tích các lớp GIS](topic:gis-analysis). |
| {{ui:Bảng thuộc tính}} | không có | Trong Bề mặt › Thêm. Mở bảng thuộc tính của một lớp GIS: sắp xếp, lọc, chọn, sửa, thêm trường, tính toán, lưu dạng CSV. Xem [Làm việc với bảng thuộc tính của lớp](topic:gis-table). |
| {{ui:Bản đồ}} | không có | Mở hộp thoại **Lớp bản đồ**: một ảnh đã gắn tọa độ địa lý, hoặc các máy chủ bản đồ bạn thêm, được vẽ dưới mặt bằng. Xem [Hiển thị lớp bản đồ dưới mặt bằng](topic:map-layers). |

Các công cụ GIS tải lần đầu khi bạn dùng một trong các nút này, mở một tệp GIS, hoặc mở một dự án có hệ tọa độ hay lớp GIS.

## Xem

| Nút | Phím | Chức năng |
|---|---|---|
| {{ui:Chọn}} | {{key:V}} hoặc {{key:Esc}} | Nhấp để chọn tuyến, nền, công trình, ống và điểm ({{key:Shift}} cùng một cú nhấp hoặc một lần kéo sẽ thêm điểm); kéo tay nắm để di chuyển PI, góc nền và công trình. |
| {{ui:Vừa}} | {{key:F}} | Thu phóng mặt bằng để hiện bề mặt, điểm, tuyến và nền (trong khung nhìn 3D: hiện tất cả). |
| {{ui:3D}} | {{key:D}} | Hiện công trường trong 3D trên mặt bằng, hoặc quay lại mặt bằng. Thanh phía trên khung nhìn 3D đặt góc nhìn, độ phóng đại, cách tô màu và những gì hiện, và xuất GLB hoặc OBJ. Xem [Xem công trường trong 3D](topic:site-3d). |

## Nút trong các bảng

| Nút | Vị trí | Chức năng |
|---|---|---|
| {{ui:Mở công trường mẫu}} | Hộp trên một mặt bằng trống | Tải khảo sát mẫu (cần kết nối, trừ khi CivilCraft được lưu để dùng ngoại tuyến) |
| {{ui:Gỡ biên}} | Bảng trái, Bề mặt | Gỡ biên ngoài |
| {{ui:Gỡ các đường ngắt đã vẽ}} | Bảng trái, Bề mặt | Xóa mọi đường ngắt đã vẽ bằng công cụ (không phải các nhóm đường ngắt) |
| {{ui:Dựng lại bề mặt từ các điểm}} | Bảng trái, Bề mặt (chỉ bề mặt LandXML) | Bỏ TIN LandXML và dựng từ các điểm; không thể hoàn tác |
| {{ui:Bắt đầu từ mặt đất}} | Bảng phải, Tuyến | Bắt đầu một trắc dọc thiết kế với một PVI trên mặt đất ở mỗi đầu |
| {{ui:Khung trắc dọc}} | Bảng phải, Tuyến | Mở khung trắc dọc của tuyến này |
| {{ui:Thêm PVI}} | Thanh trắc dọc | Khi được nhấn, một cú nhấp trong trắc dọc sẽ thêm một PVI |
| {{ui:Đặt mọi cao độ đáy theo quy tắc}} | Bảng phải, Mạng ống | Đặt cao độ đáy của mọi ống theo quy tắc |
| {{ui:Đặt cao độ đáy theo quy tắc}} | Bảng phải, Ống | Đặt cao độ đáy của ống này theo quy tắc |
